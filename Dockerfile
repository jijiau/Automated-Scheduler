# Menggunakan Node.js versi 18
FROM node:18

# Set direktori kerja
WORKDIR /app

# Salin file package.json dan package-lock.json
COPY package*.json ./

# Install dependensi untuk production
RUN npm install --production

# Salin seluruh kode aplikasi
COPY . .

# Jalankan aplikasi
CMD ["node", "server.js"]
