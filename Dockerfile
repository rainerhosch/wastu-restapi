# Gunakan Node.js LTS
FROM node:18-alpine

# Set workdir
WORKDIR /usr/src/app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["node", "server.js"]
