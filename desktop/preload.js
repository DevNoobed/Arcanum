
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("arcanum", {
    getConfig: () => ipcRenderer.invoke("config:get")
});
