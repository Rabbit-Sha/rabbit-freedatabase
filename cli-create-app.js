#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const projectName = process.argv[2] || 'my-rabbit-app';
const projectPath = path.join(process.cwd(), projectName);

console.log(`🐇 Creating a new Rabbit DB app in ${projectPath}...`);

// Create directory
fs.ensureDirSync(projectPath);

// Create basic structure
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rabbit DB App</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/Shahil-Puttur/rabbit-database/sdk/rabbit-db-client.js"></script>
</head>
<body class="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
    <div class="max-w-md w-full p-8 bg-gray-800 rounded-xl shadow-2xl border border-purple-500">
        <h1 class="text-4xl font-bold mb-6 text-center text-purple-400">🐇 Rabbit App</h1>
        
        <div class="space-y-4">
            <input id="key" type="text" placeholder="Key" class="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-purple-500 outline-none">
            <input id="val" type="text" placeholder="Value" class="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-purple-500 outline-none">
            <button onclick="saveData()" class="w-full p-3 bg-purple-600 hover:bg-purple-700 rounded font-bold transition">Save to Rabbit DB</button>
        </div>

        <div id="status" class="mt-6 p-4 bg-gray-700 rounded hidden">
            <p class="text-sm text-gray-400">Latest Update:</p>
            <pre id="output" class="text-green-400 mt-2"></pre>
        </div>
    </div>

    <script>
        const db = new RabbitDB("http://localhost:8080");
        
        async function saveData() {
            const key = document.getElementById('key').value;
            const val = document.getElementById('val').value;
            const res = await db.set(key, { text: val });
            console.log(res);
        }

        db.onUpdate((data) => {
            document.getElementById('status').classList.remove('hidden');
            document.getElementById('output').innerText = JSON.stringify(data, null, 2);
        });
    </script>
</body>
</html>
`;

fs.writeFileSync(path.join(projectPath, 'index.html'), htmlContent);

console.log(`\n✅ Success! Your app is ready.`);
console.log(`\nNext steps:`);
console.log(`1. cd ${projectName}`);
console.log(`2. Open index.html in your browser`);
console.log(`3. Make sure Rabbit DB is running (rab-start 1)`);
