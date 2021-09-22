import { access, open} from 'fs/promises'
import { constants} from 'fs';

export async function checkFileWritable(path) {
    try {
        await access(path, constants.W_OK)
    } catch (e) {
        if (e.code === 'ENOENT') {
            return true
        } else return Promise.reject(e)
    }
    
    let fileHandler = await open(path, 'r+')
    await fileHandler.close()
    return true
    
}