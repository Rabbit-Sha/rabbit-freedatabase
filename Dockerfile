FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Create directories for data and uploads
RUN mkdir -p temp_uploads

# Expose ports
EXPOSE 8080 3000

# Default command: start the database server
CMD ["node", "cli-start.js", "1"]
