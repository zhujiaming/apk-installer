const util = require("util");
const execPromisefy = util.promisify(require("child_process").exec);
const path = require("path");
/**
 * 枚举当前已连接安卓设备
 */
async function listDevices() {
  console.log("listDevices");
  const { error, stdout, stderr } = await adbRun("devices");
  if (error) {
    console.error("listDevices|error:", error);
    throw error;
  }
  if (stderr) {
    console.error("listDevices|stderr:", stderr);
    throw error;
  }
  let deviceArray = [];
  let deviceStateArray = [];
  let deviceNameArray = [];
  stdout.split("\n").forEach((line) => {
    if ((line = line.trim()) && line.indexOf("List of devices attached") < 0) {
      var deviceId = line.split("	")[0];
      var info = line.split("	")[1];
      deviceArray.push(deviceId);
      deviceStateArray.push(info);
    }
  });
  for (deviceId of deviceArray) {
    try {
      const deviceName = await getDeviceName(deviceId);
      deviceNameArray.push(deviceName);
    } catch (e) {
      deviceNameArray.push("unknown");
    }
  }
  console.log("devices info:", deviceArray, deviceStateArray, deviceNameArray);
  return [deviceArray, deviceStateArray, deviceNameArray];
}

/**
 * 检查是否有adb环境
 */
async function checkAdbEnv() {
  const { error, stdout, stderr } = await adbRun("version");
  if (error) {
    console.error("checkAdbEnv|error:", error);
    throw e;
  }
  if (stderr) {
    console.error("checkAdbEnv|stderr:", stderr);
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
  console.log("install apk");
  const installPromise = new Promise(async (resolve, reject) => {
    try {
      const { error, stdout, stderr } = await adbRun(
        `-s ${deviceId} install ${apkPath}`
      );
      console.log("install", error, stdout, stderr);
      if (error) {
        console.error("adb install|error:", error);
        reject(e);
      }
      if (stderr) {
        console.log("adb install|stderr:", stderr);
        if (stderr.trim() === "Success") {
          resolve(stderr);
        } else {
          reject(stderr);
        }
      } else {
        resolve(stdout);
      }
    } catch (e) {
      console.error(e);
      reject(e);
    }
  });
  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject("timeout");
    }, 50000);
  });
  return Promise.race([installPromise, timeoutPromise]);
}

/**
 * 安装apk到一个或多个设备
 * 超时时间默认50s
 * @param {*} apkPath
 * @param {*} deviceIds
 */
function installApkToDevices(apkPath, deviceIds, progress) {
  return new Promise(async (resolve, reject) => {
    var errors = [];
    for (deviceId of deviceIds) {
      progress && progress([0, deviceId]);
      try {
        await installApk(deviceId, apkPath);
        progress && progress([1, deviceId]);
      } catch (e) {
        console.error(e);
        errors.push(e);
        progress && progress([2, deviceId, e]);
      }
    }
    if (errors.length > 0) {
      reject(errors);
    } else {
      resolve("success");
    }
  });
}

function getDeviceName(deivceId) {
  return new Promise(async (r, j) => {
    try {
      const ret = await adbRun(
        `-s "${deviceId}" shell getprop ro.product.model`
      );
      const stdout = ret["stdout"];
      const stderr = ret["stderr"];
      if (stdout) {
        r(stdout);
      } else {
        j(stderr);
      }
    } catch (e) {
      console.error("getDeviceName err", e);
      j(e);
    }
  });
}

/**
 * 执行adb包装
 * @param {*} args
 * @returns
 */
function adbRun(args) {
  var adbPath = localStorage.getItem("adbPath");
  if (adbPath) {
    args = `"${adbPath}" ${args}`;
  } else {
    args = `adb ${args}`;
  }
  console.warn(`run:${args}`);
  return execPromisefy(args);
}

module.exports = { listDevices, installApk, installApkToDevices, checkAdbEnv };
