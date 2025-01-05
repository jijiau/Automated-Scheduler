# Menggunakan image Node.js versi terbaru (LTS) untuk kestabilan
FROM node:18

# Set direktori kerja di dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json untuk instalasi dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Salin seluruh kode aplikasi ke dalam container
COPY . .

# Salin file .env ke dalam container
COPY .env .env

# Ekspos port backend (sesuaikan dengan port yang digunakan di server.js)
EXPOSE 5000

# Perintah untuk menjalankan server
CMD ["node", "server.js"]