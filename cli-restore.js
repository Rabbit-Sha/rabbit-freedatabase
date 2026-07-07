#!/usr/bin/env node
const fs = require("fs");
const readline = require("readline");
const path = require("path");
const crypto = require("crypto");

const configPath = path.join(require("os").homedir(), ".rabbitdb_config.json");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("🚑 Welcome to Rabbit DB Restore (Immortality Mode)!\n");

rl.question("? Enter your Database Name: ", (dbName) => {
    rl.question("? Enter your Telegram Bot Token: ", (botToken) => {
        rl.question("? Enter your Telegram Channel ID: ", (channelId) => {
            rl.question("🔑 Enter your Master Recovery Key: ", (secretKey) => {
                rl.question("📁 Drag and drop your downloaded \"encrypted_backup.rabbit\" file here (or paste file path): ", (filePath) => {
                    
                    // Clean up file path in case they dragged and dropped it in terminal (removes quotes)
                    const cleanPath = filePath.trim().replace(/^[""]|[""]$/g, "");

                    try {
                        if (!fs.existsSync(cleanPath)) {
                            console.log("❌ File not found! Please check the path.");
                            process.exit();
                        }

                        console.log("\n⏳ Decrypting your database...");
                        const encryptedData = fs.readFileSync(cleanPath, "utf8");

                        // --- 🔓 DECRYPTION ENGINE ---
                        const parts = encryptedData.split(":");
                        const iv = Buffer.from(parts[0], "hex");
                        const encryptedText = Buffer.from(parts[1], "hex");
                        
                        const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(secretKey, "hex"), iv);
                        let decrypted = decipher.update(encryptedText);
                        decrypted = Buffer.concat([decrypted, decipher.final()]);
                        
                        const restoredJson = decrypted.toString();
                        
                        // Parse it to ensure it's valid JSON
                        JSON.parse(restoredJson); 

                        // 1. Restore the Local DB file
                        const localDbPath = path.join(require("os").homedir(), `.rabbit_${dbName}.json`);
                        fs.writeFileSync(localDbPath, restoredJson);

                        // 2. Rebuild the Config File
                        let config = { databases: [] };
                        if (fs.existsSync(configPath)) {
                            config = JSON.parse(fs.readFileSync(configPath));
                        }
                        
                        const newId = config.databases.length + 1;
                        config.databases.push({
                            id: newId,
                            name: dbName,
                            botToken: botToken,
                            channelId: channelId,
                            secretKey: secretKey
                        });
                        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

                        console.log(`\n🎉 BOOM! Database fully restored and verified.`);
                        console.log(`Run \"rab-start ${newId}\" to bring your API back online! 🚀\n`);
                        rl.close();

                    } catch (error) {
                        console.log("\n❌ DECRYPTION FAILED! Invalid Master Key or corrupted file.");
                        rl.close();
                    }
                });
            });
        });
    });
});
