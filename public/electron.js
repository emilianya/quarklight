const path = require('path');

const { app, BrowserWindow, shell } = require('electron');
if (require('electron-squirrel-startup')) app.quit();
const isDev = require('electron-is-dev');

let installExtension, REACT_DEVELOPER_TOOLS;

if (isDev) {
	const devTools = require("electron-devtools-installer");
	installExtension = devTools.default;
	REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS;
}

function createWindow() {
	// Create the browser window.
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		minWidth: 800,
		minHeight: 600,
		webPreferences: {
			nodeIntegration: true,
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

	win.webContents.setWindowOpenHandler(({url}) => {
		// open url in a browser and prevent default
		shell.openExternal(url);
		return { action: 'deny' };
	});

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow();

	if (isDev) {
		installExtension(REACT_DEVELOPER_TOOLS)
			.then(name => console.log(`Added Extension:  ${name}`))
			.catch(error => console.log(`An error occurred: , ${error}`));
	}
});

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