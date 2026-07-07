const axios = require('axios');

class HydraManager {
    constructor(bots) {
        // bots is an array of { botToken, channelId }
        this.bots = bots;
        this.currentIndex = 0;
    }

    getNextBot() {
        const bot = this.bots[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.bots.length;
        return bot;
    }

    async post(endpoint, data, options = {}) {
        const bot = this.getNextBot();
        const url = `https://api.telegram.org/bot${bot.botToken}/${endpoint}`;
        
        // Inject channelId if not present in data (for FormData it should be handled outside)
        if (data && typeof data === 'object' && !data.append) {
            data.chat_id = bot.channelId;
        }

        return axios.post(url, data, options);
    }

    async get(endpoint, params = {}) {
        const bot = this.getNextBot();
        const url = `https://api.telegram.org/bot${bot.botToken}/${endpoint}`;
        return axios.get(url, { params });
    }
}

module.exports = HydraManager;
