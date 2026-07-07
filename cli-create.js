#!/usr/bin/env node
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const crypto = require('crypto'); // 🔒 Added Crypto Module

const configPath = path.join(require('os').homedir(), '.rabbitdb_config.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("🐇 Welcome to Rabbit DB Setup (v2.0)!\n");

rl.question('? Enter a name for your Database: ', (dbName) => {
    rl.question('? Enter your Telegram Bot Token: ', (botToken) => {
        rl.question('? Enter your Telegram Private Channel ID: ', (channelId) => {
            
            let config = { databases: [] };
            if (fs.existsSync(configPath)) {
                config = JSON.parse(fs.readFileSync(configPath));
            }

            // 🔒 Generate a random 32-byte AES-256 Encryption Key
            const secretKey = crypto.randomBytes(32).toString('hex');

            config.databases.push({
                id: config.databases.length + 1,
                name: dbName,
                botToken: botToken,
                channelId: channelId,
                secretKey: secretKey // Saved locally!
            });

            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log(`\n✅ Success! Database '${dbName}' created safely.`);
            
            console.log(`\n🚨 CRITICAL: Save your Master Recovery Key!`);
            console.log(`If your PC crashes, you CANNOT restore your database without this key:`);
            console.log(`\x1b[31m${secretKey}\x1b[0m`); // Prints in Red text
            
            console.log(`\nRun 'rab-list' to see your databases!`);
            rl.close();
        });
    });
});
