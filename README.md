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

## 💻 Connecting your App/Website

Once running, you can save and get data easily using standard HTTP requests from any language (Python, React, Flutter, etc.):

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
```

### Media Drive
```javascript
// Upload an image
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch("http://localhost:8080/drive/upload", {
  method: "POST",
  body: formData
}).then(res => res.json()).then(data => {
  console.log("File ID:", data.file_id);
  console.log("Stream URL:", data.url);
});

// Display an image
// <img src="http://localhost:8080/drive/get/FILE_ID_HERE">
```

## 🛡️ Security
Rabbit DB uses **AES-256-CBC** encryption. Your data is encrypted locally with a unique 32-byte key generated during `rab-create`. This key never leaves your device. Even if someone gains access to your Telegram channel, they cannot read your data without the Master Recovery Key.

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
