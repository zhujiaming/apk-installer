const electron = require("electron");
const {
  listDevices,
  installApk,
  installApkToDevices,
  checkAdbEnv,
} = require("./apktool");
const fs = require("fs");
const { error } = require("console");
const ipcRenderer = electron.ipcRenderer;

const btnInstall = document.getElementById("btn_install");
const divInfo = document.getElementById("div_info");
const divfilePath = document.getElementById("div_file_path");
const btnSetAdb = document.getElementById("btn_set_adb");

let fileList = [];
let deviceList = [];
ipcRenderer.on("open-file-list", (event, args) => {
  console.log("open-file-list:", args);
  // args = ['C:/Users/zhujm/Downloads/11.apk']
  if (!args || args.length == 0) {
    divInfo.innerHTML = "👉 请关联应用为apk默认打开方式，并双击apk文件";
    return;
  }

  if (!checkApkPathValid((fileList = args))) {
    divInfo.innerHTML = "apk文件路径无效";
    return;
  }

  // loopRefresh();
  divfilePath.innerHTML = `> ${fileList[0]}`;
  handleCheckAdbEnv();
});

function handleCheckAdbEnv() {
  ipcRenderer.once("getLocalAdbPath-ret", (e, a) => {
    localStorage.setItem("adbPath", a);
    console.log("use adb path:", a);
    checkAdbEnv()
      .then((res) => {
        console.log("checkAdbEnv", res);
        setBtnSetAdbVisible(false);
        refreshDevices();
        // setBtnSetAdbVisible(true)
      })
      .catch((e) => {
        console.log(e);
        setBtnSetAdbVisible(true);
      });
  });
  ipcRenderer.send("getLocalAdbPath");
}

function setBtnSetAdbVisible(v) {
  if (v) {
    divInfo.innerHTML = "👉 未找到adb安装路径，请手动设置";
    btnSetAdb.style.visibility = "visible";
    btnSetAdb.onclick = onSetAdbPathClick;
  } else {
    divInfo.innerHTML = "";
    btnSetAdb.style.visibility = "hidden";
  }
}

function loopRefresh() {
  setInterval(() => {
    refreshDevices();
  }, 5000);
}

function openDevTool() {
  ipcRenderer.send("open-dev-tool", { open: true });
}

function checkApkPathValid(fileList) {
  console.log("checkApkPathValid", fileList);
  let valid = true;
  if (!fileList || !fileList[0]) {
    valid = false;
  }
  const apkPath = fileList[0];
  if (!fs.existsSync(apkPath)) {
    console.error("该路径不存在");
    valid = false;
  }
  return valid;
}

function refreshDevices() {
  console.log("refresh divces");
  listDevices().then((datas) => {
    // let selectDeviceId = getSelectedDevicesId();
    // dlist = ["1231312312", '123131233', '41241241241']
    var dlist = datas[0];
    var dInfoList = datas[1];
    var dNameList = datas[2];
    if (dlist) {
      deviceList = dlist;
      let divIds = document.getElementById("div_ids");
      divIds.innerHTML = "";
      // let checked = false;
      deviceList.forEach((deviceId, index) => {
        var deviceName = dNameList[index];
        var deviceInfo =
          dInfoList[index] === "device" ? "" : `[${dInfoList[index]}]`;
        var isOffline = dInfoList[index] === "offline";
        var disabled = isOffline ? "disabled" : "";
        var content = `&nbsp;${deviceId}&nbsp;${deviceName}&nbsp;&nbsp;&nbsp;${deviceInfo}`;
        let lable = document.createElement("label");
        lable.innerHTML = `<input name="deviceId" id="${deviceId}" type="checkbox" value="${deviceId}" ${disabled}/><label for="deviceId" style = "font-size:12px" onclick = "document.getElementById('${deviceId}').checked = !document.getElementById('${deviceId}').checked;">${content}</label>`;
        // if (lable.checked == true) {
        //   checked = true;
        // }
        divIds.appendChild(lable);
        let br = document.createElement("br");
        divIds.appendChild(br);
      });
      // if(!checked){
      //   selectDefaultDevice()
      // }
      btnInstall.onclick = onInstallClick;
      // btnInstall.disabled = ""
      // divInfo.innerHTML = ""
    }
  });
}

function onSetAdbPathClick() {
  ipcRenderer.once("open-adb-selector-ret", (event, args) => {
    localStorage.setItem("adbPath", args);
    handleCheckAdbEnv();
  });
  ipcRenderer.send("open-adb-selector");
}

function onInstallClick() {
  divInfo.innerHTML = "";
  let selectDids = getSelectedDevicesId();
  if (selectDids && selectDids.length > 0) {
    if (fileList.length == 0) {
      divInfo.innerHTML = "👉 请关联应用为apk默认打开方式，并双击apk文件";
      return;
    }
    // divInfo.innerHTML = `${selectDid}:<br>正在安装，请稍等...（请确认手机端是否有安装提示）`;
    btnInstall.style["pointer-events"] = "none";
    btnInstall.innerText = "安装中";
    installApkToDevices(fileList[0], selectDids, (did) => {
      if (did[0] == 0) {
        divInfo.innerText =
          `👉 ${did[1]} 正在安装...（请确认手机端是否有安装提示）\n` +
          divInfo.innerText;
      } else if (did[0] == 1) {
        divInfo.innerText = `👉 ${did[1]} 安装完成\n` + divInfo.innerText;
      } else if (did[0] == 2) {
        divInfo.innerText =
          `👉 ${did[1]} 安装失败：${did[2]}\n` + divInfo.innerText;
      }
    })
      .then((res) => {
        divInfo.innerText = `👉 全部安装完成\n` + divInfo.innerText;
      })
      .catch((e) => {
        divInfo.innerText =
          `👉 全部安装完成，失败${e.length}个\n` + divInfo.innerText;
        console.error("onInstallClick error", e);
      })
      .finally(() => {
        btnInstall.style["pointer-events"] = "auto";
        btnInstall.innerText = "安装";
      });
  } else {
    divInfo.innerHTML = "请选择设备！";
  }
}

function getSelectedDevicesId() {
  const checkboxes = document.getElementsByName("deviceId");
  const selectedOptions = [];

  for (let i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      selectedOptions.push(checkboxes[i].value);
    }
  }

  return selectedOptions;
}

function selectDefaultDevice(beforeId) {
  if (deviceList && deviceList.length > 0) {
    document.getElementById(deviceList[0]).checked = true;
  }
}
