const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

class ChunkManager {
    constructor(botToken, channelId) {
        this.botToken = botToken;
        this.channelId = channelId;
        this.chunkSize = 20 * 1024 * 1024; // 20MB
    }

    async uploadLargeFile(filePath) {
        const stats = await fs.stat(filePath);
        const totalSize = stats.size;
        const fileName = path.basename(filePath);
        const chunks = Math.ceil(totalSize / this.chunkSize);
        const fileId = `vid_${Date.now()}`;
        const manifest = {
            fileId,
            fileName,
            totalSize,
            chunks: [],
            totalChunks: chunks
        };

        for (let i = 0; i < chunks; i++) {
            const start = i * this.chunkSize;
            const end = Math.min(start + this.chunkSize, totalSize);
            const chunkBuffer = await this.readChunk(filePath, start, end);
            
            const form = new FormData();
            form.append('document', chunkBuffer, { filename: `${fileName}.part${i}` });
            form.append('chat_id', this.channelId);
            form.append('caption', `Part ${i + 1}/${chunks} for ${fileId}`);

            const response = await axios.post(`https://api.telegram.org/bot${this.botToken}/sendDocument`, form, {
                headers: form.getHeaders()
            });

            manifest.chunks.push({
                part: i,
                tgFileId: response.data.result.document.file_id
            });
            console.log(`Uploaded chunk ${i + 1}/${chunks}`);
        }

        return manifest;
    }

    async readChunk(filePath, start, end) {
        const stream = fs.createReadStream(filePath, { start, end: end - 1 });
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }

    async streamFile(manifest, res) {
        res.setHeader('Content-Disposition', `attachment; filename="${manifest.fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        for (const chunk of manifest.chunks) {
            const tgRes = await axios.get(`https://api.telegram.org/bot${this.botToken}/getFile?file_id=${chunk.tgFileId}`);
            const filePath = tgRes.data.result.file_path;
            const fileUrl = `https://api.telegram.org/file/bot${this.botToken}/${filePath}`;
            
            const response = await axios({
                method: 'get',
                url: fileUrl,
                responseType: 'stream'
            });

            await new Promise((resolve, reject) => {
                response.data.pipe(res, { end: false });
                response.data.on('end', resolve);
                response.data.on('error', reject);
            });
        }
        res.end();
    }
}

module.exports = ChunkManager;
