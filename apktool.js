const util = require('util');
const execPromisefy = util.promisify(require('child_process').exec);

/**
 * 枚举当前已连接安卓设备
 */
async function listDevices() {
    console.log('listDevices')
    const { error, stdout, stderr } = await adbRun('devices');
    if (error) {
        console.error('listDevices|error:', error);
        throw e;
    }
    if (stderr) {
        console.error('listDevices|stderr:', stderr);
        throw e;
    }
    let deviceArray = []
    stdout.split('\n').forEach(line => {
        if ((line = line.trim()) && line.indexOf('List of devices attached') < 0) {
            deviceArray.push(line.split('	')[0])
        }
    })
    console.log('devices:', deviceArray)
    return deviceArray;
}

/**
 * 检查是否有adb环境
 */
async function checkAdbEnv() {
    const { error, stdout, stderr } = await adbRun('version');
    if (error) {
        console.error('checkAdbEnv|error:', error);
        throw e;
    }
    if (stderr) {
        console.error('checkAdbEnv|stderr:', stderr);
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
    console.log("install apk")
    const installPromise = new Promise(async (resolve, reject) => {
        try {
            const { error, stdout, stderr } = await adbRun(`-s ${deviceId} install ${apkPath}`);
            console.log('install',error,stdout,stderr)
            if (error) {
                console.error('adb install|error:', error);
                reject(e);
            }
            if (stderr ) {
                console.log('adb install|stderr:', stderr);
                if(stderr.trim() === 'Success'){
                    resolve(stderr);
                }else{
                    reject(stderr);
                }
            } else {
                resolve(stdout)
            }
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

/**
 * 执行adb包装
 * @param {*} args 
 * @returns 
 */
function adbRun(args){
    var adbPath = localStorage.getItem("adbPath")
    if(adbPath){
        args = `${adbPath} ${args}`
    }
    console.log('adb run:'+args)
    return execPromisefy(args)
}

module.exports = { listDevices, installApk, checkAdbEnv }
