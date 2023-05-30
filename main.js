const { app, BrowserWindow, dialog, ipcMain } = require('electron')

var isWinReady = false;
var initOpenFileQueue = [];
var title = "Apk安装器 v" + app.getVersion()

function createWindow() {
  // 创建浏览器窗口
  const win = new BrowserWindow({
    width: 380,
    height: 220,
    title,
    resizable: false,
    maximizable: false,
    minimizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true
    }
  })

  // 并且为你的应用加载index.html
  win.loadFile('index.html')

  win.on('ready-to-show', () => {
    isWinReady = true;
  })

  win.webContents.on('dom-ready', () => {
    sendFileList(initOpenFileQueue)
        // 打开开发者工具
    win.webContents.openDevTools({ mode: "detach", activate: false })
  })

  ipcMain.on('open-dev-tool', (event, arg) => {
    console.log('get arg:', arg)
    if (arg) {
      if (arg.open) {
        win.webContents.openDevTools({ mode: "detach", activate: false })
      } else {
        win.webContents.closeDevTools()
      }
    }
  })

  ipcMain.on('open-adb-selector',(event,arg)=>{
    var paths = dialog.showOpenDialogSync({ properties: ['openFile'] ,message:"选择adb安装路径（path-to-adb/platform-tools/adb）"})
    if(paths && paths.length >0){
      BrowserWindow.getAllWindows().forEach((win,index,array)=>{
        if(!win.isDestroyed()){
          win.webContents.send("open-adb-selector-ret", paths[0])
        }
      })
    }
  })
}

// Electron会在初始化完成并且准备好创建浏览器窗口时调用这个方法
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on("window-all-closed",() => {
  app.quit()
})

//https://www.electronjs.org/docs/api/app#%E4%BA%8B%E4%BB%B6-open-url-macos
// Attempt to bind file opening #2
app.on('will-finish-launching', () => {
  if (process.platform == 'win32') {
    const argv = process.argv
    if (argv) {
      argv.forEach(filePath => {
        if (filePath.indexOf('.apk') >= 0) {
          initOpenFileQueue.push(filePath);
        }
      })
    }
  } else {
    // Event fired When someone drags files onto the icon while your app is running
    // for macOs https://www.electronjs.org/docs/api/app#%E4%BA%8B%E4%BB%B6-open-file-macos
    app.on("open-file", (event, file) => {
      if (file.indexOf('.apk') >= 0) {
        initOpenFileQueue.push(file);
      }
      event.preventDefault();
    });
  }
});

function sendFileList(fileList) {
  if(fileList.length >= 0){
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send("open-file-list", fileList)
    })
  }
}