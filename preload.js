const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  quit: () => ipcRenderer.invoke('quit-app'),
  onFullscreenChanged: (callback) => ipcRenderer.on('fullscreen-changed', (_event, active) => callback(active))
});
