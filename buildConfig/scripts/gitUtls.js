const chalk = require('chalk')
const simpleGit = require('simple-git')
const semver = require('semver')
const {execSync} = require('child_process')

const git = simpleGit()

async function checkGitStatus() {
    const gitStatus = await git.status()
    if (gitStatus.files.length) {
        console.log(
            chalk.whiteBright.bgRed.bold(
                `some codes are not commited, please commit and push first`
            )
        )
        process.exit(2)
    }
    if (gitStatus.ahead || gitStatus.behind) {
        console.log(
            chalk.whiteBright.bgRed.bold(
                'git local branch are not updated with remote, git push first'
            )
        )
        process.exit(2)
    }
    console.log('git check status finished')
}

async function updateToNextVersion() {
    const currentVersion = process.env.npm_package_version
    const releaseArg = process.argv[2]
    let release
    if (
        releaseArg &&
        (releaseArg === 'patch' ||
            releaseArg === 'minor' ||
            releaseArg === 'major')
    ) {
        release = releaseArg
    } else {
        release = 'patch'
    }
    execSync(`npm --no-git-tag-version version ${release}`)
    const targetVersion = semver.inc(currentVersion, release)
    await git
        .add('.')
        .commit(`bump version to ${targetVersion}`)
        .push('origin', 'main')
    return targetVersion
}

async function createTagFromVersion(version) {
    const tagToBePushed = `v${version}`
    await git.addAnnotatedTag(tagToBePushed, `version ${version}`)
    await git.push('origin', 'main', [tagToBePushed])
    console.log(`git tag ${tagToBePushed} created and pushed to remote`)
}

async function gitEnsureTagExists() {
    let targetPublishVersion = null
    const currentVersion = process.env.npm_package_version
    const tagList = await git.tags()
    if (!tagList.latest) {
        targetPublishVersion = currentVersion
        await createTagFromVersion(targetPublishVersion)
        console.log(`target publish version ${targetPublishVersion}`)
        return
    }
    const latestTag = tagList.latest
    const latestTagVersion = semver.clean(latestTag)

    if (latestTagVersion < currentVersion) {
        targetPublishVersion = currentVersion
        await createTagFromVersion(targetPublishVersion)
        console.log(`target publish version ${targetPublishVersion}`)
        return
    }

    if (latestTagVersion === currentVersion) {
        const [latestReleaseVersion, latestReleaseStatus] = getLatestRelease()
        if (latestReleaseVersion === currentVersion) {
            if (latestReleaseStatus === 'Draft') {
                targetPublishVersion = currentVersion
            } else {
                targetPublishVersion = await updateToNextVersion()
                await createTagFromVersion(targetPublishVersion)
            }
            console.log(`target publish version ${targetPublishVersion}`)
            return
        }
        console.log(
            chalk.whiteBright.bgRed.bold(
                `latest release version ${latestReleaseVersion} is greater than current version ${currentVersion}, please check!`
            )
        )
        process.exit(2)
    }

    console.log(
        chalk.whiteBright.bgRed.bold(
            `latest tag version ${latestTagVersion} is different with current version ${currentVersion}, please check!`
        )
    )
    process.exit(2)
}

function getLatestRelease() {
    const buffer = execSync('gh release list --repo kevinwang930/myApp')
    const resultString = buffer.toString()
    const releaseArray = resultString.split('\n')
    let latestOrDraftRelease = null
    if (releaseArray.length > 0) {
        ;[latestOrDraftRelease] = releaseArray
    }
    if (latestOrDraftRelease) {
        const [version, status] = latestOrDraftRelease.split('\t')
        return [version, status]
    }
    return [null, null]
}

async function postVersion() {
    const currentVersion = process.env.npm_package_version
    const tagList = await git.tags()
    if (tagList.latest) {
        await git
            .add('.')
            .commit(`bump version to ${currentVersion}`)
            .push('origin', 'main')
        await git.push('origin', 'main', [tagList.latest])
    } else {
        console.log(chalk.whiteBright.bgRed.bold('can not find the latest tag'))
    }
}

module.exports = {
    checkGitStatus,
    gitEnsureTagExists,
    postVersion,
}
