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
    execSync(`npm version ${release}`)
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
    const currentVersion = process.env.npm_package_version
    const tagList = await git.tags()
    if (!tagList.latest) {
        await createTagFromVersion(currentVersion)
    } else {
        const latestTag = tagList.latest
        const latestTagVersion = semver.clean(latestTag)
        if (semver.gt(latestTagVersion, currentVersion)) {
            console.log(
                chalk.whiteBright.bgRed.bold(
                    'latest tag version is greater thant current version, please check!'
                )
            )
            process.exit(2)
        }
        if (latestTagVersion === currentVersion) {
            const targetVersion = await updateToNextVersion()
            console.log(`target publish version ${targetVersion}`)
            await createTagFromVersion(targetVersion)
        }
    }
}

module.exports = {
    checkGitStatus,
    gitEnsureTagExists,
}
