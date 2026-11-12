
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs/promises");

const configPath = path.join(__dirname, "../data/config.json");

let mainWindow = null;
let controlWindow = null;
let setupRequired = false;

// Read Arcanum configuration
async function getConfig() {
    const configFile = await fs.readFile(configPath, "utf8");
    return JSON.parse(configFile);
}

// Allow frontend to request configuration
ipcMain.handle("config:get", async () => {
    return await getConfig();
});

// Main Arcanum window
function createMainWindow() {
    mainWindow = new BrowserWindow({
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

    mainWindow.loadFile(
        path.join(__dirname, "../Build/index.html")
    );

    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

// Control2 touchscreen window
function createControlWindow() {
    if (controlWindow) return;

    controlWindow = new BrowserWindow({
        width: 480,
        height: 320,

        title: "Arcanum Control2",
        backgroundColor: "#000000",
        autoHideMenuBar: true,

        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    controlWindow.loadFile(
        path.join(__dirname, "../Build/Control2/index.html")
    );

    if (!app.isPackaged) {
        controlWindow.webContents.openDevTools();
    }

    controlWindow.on("closed", () => {
        controlWindow = null;
    });
}

// Start Arcanum
app.whenReady().then(async () => {
    const config = await getConfig();

    setupRequired = config.setupCompleted !== true;

    createMainWindow();

    // Only open Control2 when initial setup is required
    if (setupRequired) {
        createControlWindow();
    }

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();

            if (setupRequired) {
                createControlWindow();
            }
        }
    });
});

// Close application when all windows are closed
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
