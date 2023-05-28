const path = require('path');

const { app, BrowserWindow, shell, autoUpdater, dialog, ipcMain } = require('electron');
if (require('electron-squirrel-startup')) app.quit();
const isDev = require('electron-is-dev');

const fs = require('fs');

if (process.defaultApp) {
	if (process.argv.length >= 2) {
	  app.setAsDefaultProtocolClient('lightquark', process.execPath, [path.resolve(process.argv[1])])
	}
  } else {
	  app.setAsDefaultProtocolClient('lightquark')
}




// Do not check for updates in dev mode
if (!isDev) {
	let releaseJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../build/release.json')).toString())

	const releaseChannel = releaseJson.channel
	const server = releaseJson.updateServer
	let platform = process.platform;
	const updateUrl = `${server}/update/${platform}/${releaseJson.version}`

	autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
		console.log("Update downloaded.")
		const dialogOpts = {
		  	type: 'info',
		  	buttons: ['Restart', 'Later'],
		  	title: 'Application Update',
		  	message: process.platform === 'win32' ? releaseNotes : releaseName,
		  	detail: 'A new version has been downloaded. Restart the application to apply the updates.'
		}
	  
		dialog.showMessageBox(dialogOpts).then((returnValue) => {
		    if (returnValue.response === 0) autoUpdater.quitAndInstall()
		})
	})
	
	autoUpdater.on('error', (message) => {
		console.error('There was a problem updating the application')
		console.error(message)
	})

	autoUpdater.setFeedURL({ url: updateUrl })

	autoUpdater.checkForUpdates();

	setInterval(() => {
		console.log("Checking for updates...")
		autoUpdater.checkForUpdates()
	  }, 60000)
}



let installExtension, REACT_DEVELOPER_TOOLS;

if (isDev) {
	const devTools = require("electron-devtools-installer");
	installExtension = devTools.default;
	REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS;
}

let win 

function createWindow() {
	// Create the browser window.
	win = new BrowserWindow({
		width: 800,
		height: 600,
		minWidth: 800,
		minHeight: 600,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			autoHideMenuBar: true
		},
		icon: path.join(__dirname, '../build/logo@1.25x.png')
	});
	win.setMenuBarVisibility(false);
	// and load the index.html of the app.
	// win.loadFile("index.html");
	win.loadURL(
		isDev
			? 'http://localhost:3000'
			: `file://${path.join(__dirname, '../build/index.html')}`
	);
	// Open the DevTools.
	if (isDev) {
		win.webContents.openDevTools({ mode: 'detach' });
	}
	setInterval(() => {
		win.webContents.send('is-dev', isDev)
	}, 5000);

	win.webContents.setWindowOpenHandler(({url}) => {
		// open url in a browser and prevent default
		shell.openExternal(url);
		return { action: 'deny' };
	});

}

const gotTheLock = app.requestSingleInstanceLock()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
if (!gotTheLock) {
	app.quit();
} else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		// Someone tried to run a second instance, we should focus our window.
		if (win) {
		  if (win.isMinimized()) win.restore()
		  win.focus()
		}
		
		win.webContents.send('open-url', commandLine.pop())
	})

	app.whenReady().then(() => {
		createWindow();
	
		if (isDev) {
			installExtension(REACT_DEVELOPER_TOOLS)
				.then(name => console.log(`Added Extension:  ${name}`))
				.catch(error => console.log(`An error occurred: , ${error}`));
		}
	});

	app.on('open-url', (event, url) => {
		win.webContents.send('open-url', url)
	})
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});