
const electron = require('electron')
const { listDevices, installApk, checkAdbEnv } = require('./apktool')
const fs = require('fs')
const ipcRenderer = electron.ipcRenderer

const btnInstall = document.getElementById('btn_install')
const divInfo = document.getElementById('div_info');
const divfilePath = document.getElementById('div_file_path');
const btnSetAdb = document.getElementById('btn_set_adb')

let fileList = []
let deviceList = []
ipcRenderer.on('open-file-list', (event, args) => {
  console.log('open-file-list:', args)
  // // args = ['C:/Users/jm/Desktop/test.apk']
  // args = ['/Users/zhujiaming/Downloads/app-BlackDex32.apk']
  if (!checkApkPathValid(fileList = args)) {
    divInfo.innerHTML = "apk文件路径无效"
    return;
  }

  loopRefresh()

  divfilePath.innerHTML = `> ${fileList[0]}`
  handleCheckAdbEnv()
})

function handleCheckAdbEnv(){
 checkAdbEnv().then((res) => {
  console.log("checkAdbEnv" , res)
  setBtnSetAdbVisible(false)
  refreshDevices()
  // setBtnSetAdbVisible(true)
}).catch(e => {
  console.log(e)
  setBtnSetAdbVisible(true)
})
}

function setBtnSetAdbVisible(v){
  if(v){
    divInfo.innerHTML = "未找到adb安装路径，请手动设置"
    btnSetAdb.style.visibility = "visible"
    btnSetAdb.onclick = onSetAdbPathClick
  }else{
    divInfo.innerHTML = ""
    btnSetAdb.style.visibility = "hidden"
  }
}

function loopRefresh() {
  setInterval(() => {
    refreshDevices()
  }, 5000)
}

function openDevTool() {
  ipcRenderer.send('open-dev-tool', { open: true })
}

function checkApkPathValid(fileList) {
  console.log("checkApkPathValid",fileList)
  let valid = true;
  if (!fileList || !fileList[0]) {
    valid = false;
  }
  const apkPath = fileList[0]
  if (!fs.existsSync(apkPath)) {
    console.error('该路径不存在')
    valid = false;
  }
  return valid;
}

function refreshDevices() {
  console.log('refresh divces')
  listDevices().then(dlist => {
    let selectDeviceId = getSelectedDevicesId()
    if (dlist) {
      deviceList = dlist;
      let divIds = document.getElementById('div_ids');
      divIds.innerHTML = ""
      let checked = false
      deviceList.forEach(deviceId => {
        let lable = document.createElement('label');
        lable.innerHTML = `<input name="deviceId" id="${deviceId}" type="radio" value="${deviceId}" ${deviceId == selectDeviceId?"checked":""}/>${deviceId}`
        if(lable.checked == true){
          checked = true
        }
        divIds.appendChild(lable)
        let br = document.createElement('br')
        divIds.appendChild(br)
      });
      // if(!checked){
      //   selectDefaultDevice()
      // }
      btnInstall.onclick = onInstallClick;
      // btnInstall.disabled = ""
      // divInfo.innerHTML = ""
    }
  })
}

function onSetAdbPathClick(){
  ipcRenderer.once("open-adb-selector-ret",(event,args)=>{
    localStorage.setItem('adbPath', args);
    handleCheckAdbEnv()
  })
  ipcRenderer.send("open-adb-selector")
}

function onInstallClick() {
  let selectDid = getSelectedDevicesId();
  if (selectDid) {
    divInfo.innerHTML = `${selectDid}:<br>正在安装，请稍等...（请确认手机端是否有安装提示）`
    btnInstall.disabled = "disabled"
    installApk(selectDid, fileList[0])
      .then(res => {
        divInfo.innerHTML = "安装完成"
      })
      .catch(e => {
        divInfo.innerHTML = "安装失败\n" + e
      })
      .finally(() => {
        btnInstall.disabled = ""
      })
  } else {
    divInfo.innerHTML = "请选择设备！"
  }
}

function getSelectedDevicesId(){
  let selectDid;
  deviceList.forEach(did => {
    if (document.getElementById(did).checked) {
      console.log("chceked:" + did);
      selectDid = did;
    }
  })
  console.log('getSelectedDevicesId',selectDid)
  return selectDid
}

function selectDefaultDevice(beforeId){
  if(deviceList && deviceList.length>0){
    document.getElementById(deviceList[0]).checked = true
  }
}
