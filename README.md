# 🐇 Rabbit Database (Rabbit DB)
> **The Free, Unlimited, Offline-First Database for Developers.**

Are you a student or developer tired of expensive database limits (like 500MB on MongoDB/Firebase)? 
**Rabbit DB** is a revolutionary local-first database that uses the **Telegram Bot API** as an infinite, free cloud storage backend. 

It acts as a local server on your PC or Termux. Your app talks to it instantly (0ms latency), and Rabbit DB silently syncs and encrypts your data to a private Telegram channel in the background!

## ✨ Features
- **🚀 Lightning Fast:** Reads and writes locally. No waiting for network requests.
- **♾️ Unlimited Storage:** Uses Telegram's infrastructure. Store millions of rows of JSON data.
- **🛡️ 100% Private & Secure:** Data is stored using *your* Telegram Bot in *your* private channel.
- **🔒 Military-Grade Encryption:** All data is AES-256 encrypted before leaving your machine.
- **🔋 Offline Auto-Resume:** If your internet drops, Rabbit DB saves data locally and uploads it to Telegram automatically when you reconnect.
- **📸 Media Drive:** Effortlessly upload and stream images/videos using Telegram as your CDN.
- **📱 Termux & PC Ready:** Works on Linux, Windows, Mac, and Android (via Termux).
- **🚑 Immortality Mode:** Restore your entire database from Telegram using a Master Recovery Key if your device fails.
- **🎬 Video Limit Breaker:** Upload massive files (1GB+ videos) by automatically splitting them into smaller chunks and reassembling them on demand.
- **⚡ Live Real-Time Sync:** Frontend updates instantly via WebSockets, mirroring changes from local or Telegram sources.
- **🔍 Advanced Querying:** Search for specific data within JSON objects, transforming Rabbit DB into a powerful document database.
- **⚙️ Hydra Mode (Sharding):** Bypass Telegram's rate limits by distributing traffic across multiple bot tokens and channels for infinite scalability.
- **🤝 Offline Auto-Merge (CRDTs):** Intelligently resolve data conflicts during synchronization using timestamp merging, ensuring data integrity.

## 🛠️ Installation

### Option 1: Docker (Recommended - Easiest)

**Prerequisites:** You need [Docker](https://www.docker.com/products/docker-desktop) installed.

```bash
# 1. Clone the repository
git clone https://github.com/Shahil-Puttur/rabbit-database.git
cd rabbit-database

# 2. Run setup (interactive configuration)
./setup.sh

# 3. Start Rabbit DB
docker-compose up
```

**That's it!** Your database is now running at `http://localhost:8080`

👉 **[Full Docker Installation Guide →](INSTALLATION.md)**

### Option 2: Node.js (Manual)

**Prerequisites:** You need [Node.js](https://nodejs.org/) installed on your computer or Termux.

```bash
# 1. Clone the repository
git clone https://github.com/Shahil-Puttur/rabbit-database.git

# 2. Enter the folder
cd rabbit-database

# 3. Install dependencies and link commands
npm install
npm link
```

## 🚀 How to Use

1. **Create a new database:**
   ```bash
   rab-create
   ```
   It will ask for a Database Name, your Telegram Bot Token, and Private Channel ID. It will also generate your **Master Recovery Key**. **Save this key safely!**

2. **List your databases:**
   ```bash
   rab-list
   ```

3. **Start the Database Server:**
   ```bash
   rab-start 1
   ```
   (Your database is now running locally at `http://localhost:8080`!)

4. **Restore a database (if your PC fails):**
   ```bash
   rab-restore
   ```

5. **Create a new Rabbit DB App (Frontend Boilerplate):**
   ```bash
   npx create-rabbit-app my-new-app
   ```
   This command scaffolds a new HTML/JS/CSS project with the Rabbit DB Client SDK integrated, ready for real-time data.

## 💻 Connecting your App/Website

Once running, you can save and get data easily using standard HTTP requests or the new Client SDK from any language (Python, React, Flutter, etc.):

### Text Data
```javascript
// Save data
fetch("http://localhost:8080/db/set", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key: "user_1", value: { name: "John", age: 25 } })
});

// Get data
fetch("http://localhost:8080/db/get/user_1")
  .then(res => res.json())
  .then(data => console.log(data));

// Advanced Querying
fetch("http://localhost:8080/db/query", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: { field: "age", operator: ">", value: 18 } })
})
  .then(res => res.json())
  .then(data => console.log(data.results));
```

### Media Drive
```javascript
// Upload an image or large video
const formData = new FormData();
formData.append(\'file\', fileInput.files[0]);

fetch("http://localhost:8080/drive/upload", {
  method: "POST",
  body: formData
}).then(res => res.json()).then(data => {
  console.log("File ID:", data.file_id);
  console.log("Stream URL:", data.url);
});

// Display an image or stream a video
// <img src="http://localhost:8080/drive/get/FILE_ID_HERE">
```

### Client SDK (JavaScript Example)
```javascript
import RabbitDB from 'rabbit-db-client'; // If installed via npm
// Or if using CDN: const RabbitDB = window.RabbitDB;

const db = new RabbitDB();

// Set data
db.set("user_2", { name: "Jane", age: 30 }).then(res => console.log(res));

// Get data
db.get("user_2").then(data => console.log(data));

// Query data
db.query("age", ">", 25).then(results => console.log(results));

// Real-time updates
db.onUpdate((change) => {
    console.log("Data changed:", change);
});
```

## 🖥️ Rabbit Studio (Web GUI)
Access a beautiful, visual dashboard to manage your database in the browser at `http://localhost:8080/studio`.

## 🛡️ Security
Rabbit DB uses **AES-256-CBC** encryption. Your data is encrypted locally with a unique 32-byte key generated during `rab-create`. This key never leaves your device. Even if someone gains access to your Telegram channel, they cannot read your data without the Master Recovery Key.

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 The "Shock the World" Feature Roadmap for Rabbit DB

| 🌟 Feature Name                       | 🎯 What It Does                                                                       | 🛠️ How to Build It (The Developer Hack)                                                                                                                                                                                                            | 💥 Why Developers Will Love It                                                                                                             |
| :----------------------------------- | :----------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **1. The Video Limit Breaker**       | Allows uploading massive files (1GB+ videos) despite Telegram's bot limits.          | **File Chunking:** Write a Node.js script that splits large files into 20MB chunks before uploading to Telegram. Save a "manifest" in the DB. When a user requests the video, use Node.js Streams to stitch the chunks back together seamlessly.   | It gives developers a completely free, unlimited AWS S3/Video CDN alternative. No one else has this!                                     |
| **2. Super Beginner-Friendly Setup** | Makes the project so easy a 10-year-old could use it.                                | **`npx create-rabbit-app`**: Build an NPM package that auto-generates a ready-to-use HTML/JS/CSS boilerplate connected to Rabbit DB in 1 click. Add interactive CLI menus (using `inquirer.js`) so they never have to touch config files manually. | Huge adoption rate. Beginners hate complex setups. If they can type one command and have a working app, they will share it everywhere.    |
| **3. Live Real-Time Sync**           | Updates the frontend instantly without refreshing the page (like a chat app).        | **WebSockets (`socket.io`):** Add a websocket server. When Data A changes locally or from Telegram, broadcast the change to the frontend instantly.                                                                                                | This makes Rabbit DB a true, 100% free alternative to **Firebase Real-time Database**.                                                    |
| **4. Advanced Querying**             | Lets developers search for specific data inside the JSON, instead of just using IDs. | **In-Memory Engine:** Use a lightweight library like `lokijs` or `nedb` to search local files. Example: `db.users.where('age', '>', 18).get()`                                                                                                     | It turns Rabbit DB from a basic "Key-Value Store" into a full **MongoDB Killer**.                                                         |
| **5. Rabbit Studio (Web GUI)**       | A beautiful, visual dashboard to manage the database in the browser.                 | **React/Vue on Port 3000:** Serve a slick, Dark-Mode web app where developers can visually click, edit JSON, and drag-and-drop images (like phpMyAdmin or MongoDB Compass).                                                                        | Developers judge tools by UI. A beautiful dashboard makes this free tool feel like an expensive $100/mo enterprise SaaS.                  |
| **6. "Hydra Mode" (Sharding)**       | Bypasses Telegram's rate limit of ~30 messages per second.                          | **Multiple Tokens:** Let developers input an array of 5+ Bot Tokens and Channel IDs. The Node.js server balances the traffic across all of them (Load Balancing).                                                                                  | Gives indie developers the power to handle millions of requests per second with infinite scalability for free.                            |
| **7. Drop-in Client SDK**            | Removes the need to write long `fetch()` requests in the frontend.                   | **NPM Package:** Publish a frontend library (`npm i rabbit-db-client`). It provides simple commands like `db.set()` and auto-complete in VS Code.                                                                                                  | Great Developer Experience (DX). Auto-complete makes coding 10x faster.                                                                   |
| **8. Offline Auto-Merge (CRDTs)**    | Solves the problem of two offline users editing the same data at the same time.      | **Timestamp Merging:** Add a "last_updated" timestamp to every row. If a conflict happens during sync, the database intelligently keeps the newest change.                                                                                        | Handling offline conflicts is notoriously hard. If you solve it for them, big enterprise developers will start taking you very seriously. |
