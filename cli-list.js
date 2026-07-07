#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const configPath = path.join(require("os").homedir(), ".rabbitdb_config.json");

if (!fs.existsSync(configPath)) {
    console.log("❌ No databases found. Run \"rab-create\" first.");
    process.exit();
}

const config = JSON.parse(fs.readFileSync(configPath));
console.log("\n🐇 Your Rabbit Databases:\n");

config.databases.forEach(db => {
    console.log(`[${db.id}] ${db.name} (Channel: ${db.channelId})`);
});
console.log("\nType \"rab-start <id>\" to run one!\n");
