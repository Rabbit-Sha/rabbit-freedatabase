#!/usr/bin/env node
const fs = require("fs-extra");
const path = require("path");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");
const multer = require("multer");
const FormData = require("form-data");
const http = require("http");
const { Server } = require("socket.io");
const ChunkManager = require("./lib/ChunkManager");
const HydraManager = require("./lib/HydraManager");

const dbId = process.argv[2];
if (!dbId) {
    console.log("❌ Please provide a database ID. Example: rab-start 1");
    process.exit();
}

const configPath = path.join(require("os").homedir(), ".rabbitdb_config.json");
if (!fs.existsSync(configPath)) {
    console.log("❌ Config file not found! Run 'rab-create' first.");
    process.exit();
}
const config = JSON.parse(fs.readFileSync(configPath));
const dbInfo = config.databases.find(db => db.id == dbId);

if (!dbInfo) {
    console.log("❌ Database not found!");
    process.exit();
}

// --- 🔒 ENCRYPTION ENGINE ---
function encryptText(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(dbInfo.secretKey, "hex"), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decryptText(encryptedText) {
    const parts = encryptedText.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(dbInfo.secretKey, "hex"), iv);
    let decrypted = decipher.update(Buffer.from(parts[1], "hex"));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// Setup Local Cache
const localDbPath = path.join(require("os").homedir(), `.rabbit_${dbInfo.name}.json`);
const manifestPath = path.join(require("os").homedir(), `.rabbit_${dbInfo.name}_manifests.json`);

let localData = {};
if (fs.existsSync(localDbPath)) {
    localData = JSON.parse(fs.readFileSync(localDbPath));
}

let manifests = {};
if (fs.existsSync(manifestPath)) {
    manifests = JSON.parse(fs.readFileSync(manifestPath));
}

// Setup Express & Socket.io
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(express.json());
app.use(cors());
app.use("/studio", express.static(path.join(__dirname, "studio")));
const upload = multer({ dest: "temp_uploads/" });

const bots = dbInfo.tokens || [{ botToken: dbInfo.botToken, channelId: dbInfo.channelId }];
const hydra = new HydraManager(bots);
const chunkManager = new ChunkManager(dbInfo.botToken, dbInfo.channelId);

// --- 📊 TEXT DATABASE API ---

app.post("/db/set", (req, res) => {
    const { key, value, updatedAt } = req.body;
    const timestamp = updatedAt || Date.now();
    
    // Feature 8: Offline Auto-Merge (Timestamp Merging)
    if (localData[key] && localData[key].updatedAt > timestamp) {
        return res.json({ 
            success: false, 
            message: "Conflict: Newer data already exists locally.", 
            currentValue: localData[key].value 
        });
    }

    localData[key] = {
        value,
        updatedAt: timestamp
    };
    fs.writeFileSync(localDbPath, JSON.stringify(localData, null, 2));
    
    // Feature 3: Live Real-Time Sync
    io.emit('dataChange', { key, value, updatedAt: localData[key].updatedAt });
    
    res.json({ success: true, message: "Saved locally!", updatedAt: localData[key].updatedAt });
});

app.get("/db/get/:key", (req, res) => {
    res.json({ success: true, data: localData[req.params.key] ? localData[req.params.key].value : null });
});

// Feature 4: Advanced Querying
app.post("/db/query", (req, res) => {
    const { query } = req.body; // Basic filter: { field: 'age', operator: '>', value: 18 }
    if (!query) return res.status(400).json({ error: "Query required" });

    const results = Object.entries(localData)
        .filter(([key, item]) => {
            const val = item.value[query.field];
            switch (query.operator) {
                case '>': return val > query.value;
                case '<': return val < query.value;
                case '==': return val == query.value;
                case 'contains': return typeof val === 'string' && val.includes(query.value);
                default: return false;
            }
        })
        .map(([key, item]) => ({ key, value: item.value }));

    res.json({ success: true, results });
});

// --- 📸 MEDIA DRIVE API (Images/Videos) ---

// Feature 1: Video Limit Breaker (Chunking)
app.post("/drive/upload", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;
        const stats = await fs.stat(file.path);
        
        let result;
        if (stats.size > 20 * 1024 * 1024) { // If > 20MB, use chunking
            console.log("📦 Large file detected, starting chunked upload...");
            result = await chunkManager.uploadLargeFile(file.path);
            manifests[result.fileId] = result;
            fs.writeFileSync(manifestPath, JSON.stringify(manifests, null, 2));
            res.json({ 
                success: true, 
                file_id: result.fileId, 
                isChunked: true,
                url: `http://localhost:8080/drive/get/${result.fileId}` 
            });
        } else {
            const form = new FormData();
            form.append("document", fs.createReadStream(file.path));
            form.append("chat_id", dbInfo.channelId);

            const response = await hydra.post("sendDocument", form, {
                headers: form.getHeaders()
            });
            const fileId = response.data.result.document.file_id;
            res.json({ success: true, file_id: fileId, isChunked: false, url: `http://localhost:8080/drive/get/${fileId}` });
        }

        fs.unlinkSync(file.path); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Upload failed" });
    }
});

app.get("/drive/get/:fileId", async (req, res) => {
    try {
        const fileId = req.params.fileId;
        
        if (fileId.startsWith('vid_') && manifests[fileId]) {
            console.log("🎬 Streaming chunked file...");
            await chunkManager.streamFile(manifests[fileId], res);
        } else {
            const tgRes = await hydra.get("getFile", { file_id: req.params.fileId });
            const filePath = tgRes.data.result.file_path;
            const fileUrl = `https://api.telegram.org/file/bot${dbInfo.botToken}/${filePath}`;
            const fileStream = await axios({ method: "get", url: fileUrl, responseType: "stream" });
            fileStream.data.pipe(res);
        }
    } catch (error) {
        res.status(404).send("File not found");
    }
});

// Start Server
const PORT = 8080;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Starting ${dbInfo.name}...`);
    console.log(`✅ Rabbit DB Server running at http://0.0.0.0:${PORT}`);
    console.log(`📡 Real-time Sync enabled via WebSockets`);
});

// --- 📦 THE RABBIT COURIER (ENCRYPTED BACKGROUND SYNC) ---
let lastSyncedData = "";

setInterval(async () => {
    try {
        if (!fs.existsSync(localDbPath)) return;
        const fileContent = fs.readFileSync(localDbPath, "utf8");
        if (fileContent === lastSyncedData) return; 

        const encryptedData = encryptText(fileContent);
        const form = new FormData();
        form.append("document", Buffer.from(encryptedData, "utf-8"), { filename: "encrypted_backup.rabbit" });
        form.append("chat_id", dbInfo.channelId);

        await hydra.post("sendDocument", form, {
            headers: form.getHeaders()
        });
        
        lastSyncedData = fileContent;
        console.log("🔒 Background Sync: Database encrypted and backed up to Telegram.");
    } catch (error) { }
}, 10000);
