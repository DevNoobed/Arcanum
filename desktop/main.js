
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs/promises");

const configPath = path.join(__dirname, "../data/config.json");

ipcMain.handle("config:get", async () => {
    const configFile = await fs.readFile(configPath, "utf8");
    return JSON.parse(configFile);
});

// Create the main Arcanum window
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,

        title: "Arcanum",
        backgroundColor: "#000000",

        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // Load Arcanum
    mainWindow.loadFile(
        path.join(__dirname, "../Build/index.html")
    );

    // Developer Tools (development only)
    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }
}

// Start Arcanum
app.whenReady().then(() => {
    createWindow();

    // Reopen window when activated (macOS)
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed (except macOS)
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
