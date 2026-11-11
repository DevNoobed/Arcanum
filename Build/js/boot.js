
/* =====================================
   ARCANUM OS - BOOT MANAGER
   ===================================== */

// Boot configuration
const BOOT_CONFIG = {
    minimumDelay: 2000,

    setupDestination: "setup-help.html",
    updateDestination: "update.html",

    // Files required for the initial boot
    requiredFiles: [
        "css/loading.css",
        "setup-help.html",
        "update.html"
    ]
};

// Utility: wait
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Check whether a file exists and is accessible
async function checkFile(path) {
    try {
        const response = await fetch(
            new URL(path, document.baseURI),
            { cache: "no-store" }
        );

        return response.ok;
    } catch (error) {
        return false;
    }
}

// Main boot sequence
async function bootArcanum() {
    const status = document.getElementById("boot-status");

    try {
        console.log("[ARCANUM OS] Starting boot sequence...");

        // Step 1: Minimum boot delay
        await delay(BOOT_CONFIG.minimumDelay);

        status.textContent = "Checking system files...";

        // Step 2: Check required files
        const results = await Promise.all(
            BOOT_CONFIG.requiredFiles.map(async file => ({
                file,
                loaded: await checkFile(file)
            }))
        );

        // Step 3: Detect missing files
        const missing = results.filter(
            result => !result.loaded
        );

        if (missing.length > 0) {
            console.error("[ARCANUM OS] Boot failed.");

            missing.forEach(item => {
                console.error("[MISSING FILE]", item.file);
            });

            status.textContent =
                "BOOT ERROR: Required system files are missing.";

            return;
        }

        console.log("[ARCANUM OS] System files verified.");

        // Step 4: Read installation configuration
        status.textContent = "Loading system configuration...";

        const config = await window.arcanum.getConfig();

        if (typeof config.setupCompleted !== "boolean") {
            throw new Error("Invalid setup configuration.");
        }

        console.log("[ARCANUM OS] Configuration loaded.");

        // Step 5: Determine startup destination
        const destination = config.setupCompleted
            ? BOOT_CONFIG.updateDestination
            : BOOT_CONFIG.setupDestination;

        status.textContent = config.setupCompleted
            ? "System ready. Checking for updates..."
            : "First-time setup required. Starting setup...";

        // Step 6: Launch
        await delay(300);

        window.location.href = destination;

    } catch (error) {
        console.error("[ARCANUM OS] Boot error:", error);

        status.textContent =
            "BOOT ERROR: Unable to load system configuration.";
    }
}

// Start boot after the initial page has loaded
window.addEventListener("load", bootArcanum);
