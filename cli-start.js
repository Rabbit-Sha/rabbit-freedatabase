#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");
const multer = require("multer");
const FormData = require("form-data");

const dbId = process.argv[2];
if (!dbId) {
    console.log("❌ Please provide a database ID. Example: rab-start 1");
    process.exit();
}

const configPath = path.join(require("os").homedir(), ".rabbitdb_config.json");
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
let localData = {};
if (fs.existsSync(localDbPath)) {
    localData = JSON.parse(fs.readFileSync(localDbPath));
}

// Setup Express & File Uploads
const app = express();
app.use(express.json());
app.use(cors());
const upload = multer({ dest: "temp_uploads/" }); // Temp folder for files

// --- 📊 TEXT DATABASE API ---

app.post("/db/set", (req, res) => {
    const { key, value } = req.body;
    localData[key] = value;
    fs.writeFileSync(localDbPath, JSON.stringify(localData, null, 2));
    res.json({ success: true, message: "Saved locally!" });
});

app.get("/db/get/:key", (req, res) => {
    res.json({ success: true, data: localData[req.params.key] || null });
});


// --- 📸 MEDIA DRIVE API (Images/Videos) ---

// 1. Upload a file to Telegram and get a File ID
app.post("/drive/upload", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;
        const form = new FormData();
        form.append("document", fs.createReadStream(file.path));
        form.append("chat_id", dbInfo.channelId);

        const response = await axios.post(`https://api.telegram.org/bot${dbInfo.botToken}/sendDocument`, form, {
            headers: form.getHeaders()
        });

        // Delete local temp file after upload to save space
        fs.unlinkSync(file.path); 

        const fileId = response.data.result.document.file_id;
        res.json({ success: true, file_id: fileId, url: `http://localhost:8080/drive/get/${fileId}` });

    } catch (error) {
        res.status(500).json({ success: false, error: "Upload failed" });
    }
});

// 2. Stream a file from Telegram
app.get("/drive/get/:fileId", async (req, res) => {
    try {
        // Step A: Get File Path from Telegram
        const tgRes = await axios.get(`https://api.telegram.org/bot${dbInfo.botToken}/getFile?file_id=${req.params.fileId}`);
        const filePath = tgRes.data.result.file_path;

        // Step B: Stream the file directly to the user's browser/app!
        const fileUrl = `https://api.telegram.org/file/bot${dbInfo.botToken}/${filePath}`;
        const fileStream = await axios({ method: "get", url: fileUrl, responseType: "stream" });
        
        fileStream.data.pipe(res);
    } catch (error) {
        res.status(404).send("File not found");
    }
});


// Start Server
app.listen(8080, () => {
    console.log(`\n🚀 Starting ${dbInfo.name}...`);
    console.log(`✅ Rabbit DB Server running locally at http://localhost:8080`);
});

// --- 📦 THE RABBIT COURIER (ENCRYPTED BACKGROUND SYNC) ---
let lastSyncedData = "";

setInterval(async () => {
    try {
        if (!fs.existsSync(localDbPath)) return;
        
        const fileContent = fs.readFileSync(localDbPath, "utf8");
        
        // Only sync if data has changed to save bandwidth
        if (fileContent === lastSyncedData) return; 

        // 🔒 Encrypt the entire database before sending to Telegram
        const encryptedData = encryptText(fileContent);
        
        const form = new FormData();
        form.append("document", Buffer.from(encryptedData, "utf-8"), { filename: "encrypted_backup.rabbit" });
        form.append("chat_id", dbInfo.channelId);

        await axios.post(`https://api.telegram.org/bot${dbInfo.botToken}/sendDocument`, form, {
            headers: form.getHeaders()
        });
        
        lastSyncedData = fileContent;
        console.log("🔒 Background Sync: Database encrypted and backed up to Telegram.");
    } catch (error) {
        // Silent fail on network error
    }
}, 10000); // Checks every 10 seconds
