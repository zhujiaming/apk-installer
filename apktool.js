const util = require('util');
const execPromisefy = util.promisify(require('child_process').exec);

/**
 * 枚举当前已连接安卓设备
 */
async function listDevices() {
    console.log('start list devices')
    const { error, stdout, stderr } = await execPromisefy('adb devices');
    if (error) {
        console.error('listDevices|error:', error);
        throw e;
    }
    if (stderr) {
        console.error('listDevices|stderr:', stderr);
        throw e;
    }
    console.log('stdout:', stdout);
    let deviceArray = []
    stdout.split('\n').forEach(line => {
        if ((line = line.trim()) && line.indexOf('List of devices attached') < 0) {
            deviceArray.push(line.split('	')[0])
        }
    })
    console.log('deviceArray', deviceArray)
    return deviceArray;
}

/**
 * 检查是否有adb环境
 */
async function chcekAdbEnv() {
    const { error, stdout, stderr } = await execPromisefy('adb version');
    if (error) {
        console.error('listDevices|error:', error);
        throw e;
    }
    if (stderr) {
        console.error('listDevices|stderr:', stderr);
        throw e;
    }
    return stdout;
}

/**
 * 安装apk到指定设备
 * 超时时间默认50s
 * @param {*} deviceId 
 * @param {*} apkPath 
 */
function installApk(deviceId, apkPath) {
    const installPromise = new Promise(async (resolve, reject) => {
        try {
            const { error, stdout, stderr } = await execPromisefy(`adb -s ${deviceId} install ${apkPath}`);
            if (error) {
                console.error('listDevices|error:', error);
                reject(e);
            }
            if (stderr) {
                console.error('listDevices|stderr:', stderr);
                reject(stderr);
            }
            resolve(stdout)
        } catch (e) {
            console.error(e)
            reject(e);
        }
    })
    const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => { reject('timeout') }, 50000)
    })
    return Promise.race([installPromise, timeoutPromise]);
}

module.exports = { listDevices, installApk, chcekAdbEnv }
