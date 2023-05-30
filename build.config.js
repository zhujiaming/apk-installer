const config = {
  appId: "com.zhujm.apk-installer",
  productName: "Apk Installer",
  compression: "maximum",
  fileAssociations: {
    ext: ".apk",
    name: "Apk安装",
    role: "Viewer"
  },
  directories: {
    output: "./packages",
    // buildResources: "build",
  },
  extraResources:  { // 拷贝静态文件到指定位置
    "from": "./resource/adb",
    "to": "adb"
  },
  dmg: {
    icon:"./resource/icon.icns",
    backgroundColor: "#ffffff",
    window: {
      x: 100,
      y: 100,
      width: 400,
      height: 200,
    },
    contents: [
      {
        x: 100,
        y: 100,
        type: "file"
      },
      {
        x: 250,
        y: 100,
        type: "link",
        path: "/Applications"
      }
    ],
    sign : false
  },
  // win mac linux icon 默认抓取build/icons/下的png图，png命名256*256.png格式 https://www.electron.build/icons.html#linux
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    installerIcon: "./resource/icon.ico",
    uninstallerIcon: "./resource/icon.ico",
    perMachine: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    allowElevation: true,
  },
  mac: {
    icon: "./resource/icon.icns",
    target: ["dmg"],
  },
  win: {
    icon: "./resource/icon.ico",
    target: ["nsis"],
  },
  linux: {
    // icon: "./build/icons/icon.icns",
    target: ["deb", "rpm", "AppImage"],
    category: "Productivity",
  },
  files: [
    "**/*",
    "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
    "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
    "!**/node_modules/*.d.ts",
    "!**/node_modules/.bin",
    "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
    "!.editorconfig",
    "!**/._*",
    "!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}",
    "!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
    "!**/{appveyor.yml,.travis.yml,circle.yml}",
    "!**/{npm-debug.log,package-lock.json,yarn.lock,.yarn-integrity,.yarn-metadata.json}",
    "!.vscode/",
    "!.electron-vue",
    "!build/",
    "!dist/web/",
    "!src/",
    "!static/",
    "!test/",
    "!.babelrc",
    "!.eslintignore",
    "!.eslintrc.js",
    "!.gitignore",
    "!*.{yml,md}",
    "!target/",
    "!jsconfig.json",
    "!.npmrc",
    "!.prettierrc.js",
    "!README.md",
    "!**/snapshot"
  ],  
};

module.exports = config;
