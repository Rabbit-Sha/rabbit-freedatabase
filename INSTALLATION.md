# 🐇 Rabbit Database - Installation Guide

Welcome! This guide will help you get Rabbit Database running in minutes.

## Prerequisites

You need to have **Docker** installed on your computer. If you don't have it yet:

- **Windows/Mac:** Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux:** Follow [Docker installation guide](https://docs.docker.com/engine/install/)

## Quick Start (3 Steps)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Shahil-Puttur/rabbit-database.git
cd rabbit-database
```

### Step 2: Run the Setup Script

**On Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**On Windows (PowerShell):**
```powershell
docker-compose build
```

### Step 3: Start Rabbit Database

```bash
docker-compose up
```

That's it! 🎉

## What You Get

Once running, you'll have:

- **Database API:** `http://localhost:8080`
- **Web Interface:** `http://localhost:3000` (coming soon)

## What You Need Before Starting

Before running the setup, gather these details:

1. **Telegram Bot Token**
   - Create a bot with [@BotFather](https://t.me/botfather) on Telegram
   - Copy the token (looks like: `123456789:ABCdefGHIjklmnoPQRstuvWXYZ`)

2. **Telegram Private Channel ID**
   - Create a private channel in Telegram
   - Get the channel ID (negative number, like: `-1004422066860`)

## Usage

### Using Docker Compose (Recommended)

**Start in foreground:**
```bash
docker-compose up
```

**Start in background:**
```bash
docker-compose up -d
```

**Stop the service:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f
```

### Using Docker Directly

**Build the image:**
```bash
docker build -t rabbit-db .
```

**Run the container:**
```bash
docker run -p 8080:8080 -p 3000:3000 rabbit-db
```

## API Endpoints

Once running, you can use these endpoints:

### Save Data
```bash
curl -X POST http://localhost:8080/db/set \
  -H "Content-Type: application/json" \
  -d '{"key": "user_1", "value": {"name": "John", "age": 25}}'
```

### Get Data
```bash
curl http://localhost:8080/db/get/user_1
```

### Upload Image
```bash
curl -X POST http://localhost:8080/drive/upload \
  -F "file=@/path/to/image.jpg"
```

### Get Image
```bash
# Use the file_id from upload response
curl http://localhost:8080/drive/get/FILE_ID_HERE
```

## Troubleshooting

### Docker not found
Make sure Docker is installed and running. Check with:
```bash
docker --version
```

### Port 8080 already in use
Change the port in `docker-compose.yml`:
```yaml
ports:
  - "9000:8080"  # Use 9000 instead of 8080
```

### Container won't start
Check logs:
```bash
docker-compose logs
```

### Permission denied on setup.sh
Run:
```bash
chmod +x setup.sh
```

## Next Steps

- Read the [README.md](README.md) for full documentation
- Check out the [API documentation](#api-endpoints)
- Build your app using Rabbit DB!

## Need Help?

- Open an issue on [GitHub](https://github.com/Shahil-Puttur/rabbit-database/issues)
- Check existing issues for solutions
- Read the main [README.md](README.md)

Happy coding! 🚀
