import {checkGitStatus, gitEnsureTagExists} from './git.mjs'

async function preparePublish() {
    await checkGitStatus()
    await gitEnsureTagExists()
}

preparePublish()

// let currentVersion = process.env.npm_package_version
