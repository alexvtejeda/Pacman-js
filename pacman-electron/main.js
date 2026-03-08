const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 576,
    resizable: false,
    icon: path.join(__dirname, 'pacmanLogo.png'),
  });
  win.loadFile('index.html');
}

app.on('ready', ()=> { createWindow() });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
