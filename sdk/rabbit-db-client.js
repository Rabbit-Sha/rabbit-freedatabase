/**
 * Rabbit DB Client SDK
 * The world's fastest way to connect to your Telegram-powered database.
 */
class RabbitDB {
    constructor(serverUrl = "http://localhost:8080") {
        this.serverUrl = serverUrl;
        this.socket = null;
    }

    async set(key, value) {
        const response = await fetch(`${this.serverUrl}/db/set`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, value })
        });
        return response.json();
    }

    async get(key) {
        const response = await fetch(`${this.serverUrl}/db/get/${key}`);
        const result = await response.json();
        return result.data;
    }

    async query(field, operator, value) {
        const response = await fetch(`${this.serverUrl}/db/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: { field, operator, value } })
        });
        const result = await response.json();
        return result.results;
    }

    async upload(file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${this.serverUrl}/drive/upload`, {
            method: "POST",
            body: formData
        });
        return response.json();
    }

    onUpdate(callback) {
        if (!this.socket && typeof io !== 'undefined') {
            this.socket = io(this.serverUrl);
            this.socket.on('dataChange', callback);
        } else if (!this.socket) {
            console.warn("Socket.io not found. Real-time updates disabled.");
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RabbitDB;
} else {
    window.RabbitDB = RabbitDB;
}
