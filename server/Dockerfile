FROM node:22

# Install dependencies for Chromium
RUN apt update && apt install -y \
    libx11-xcb1 libxcb-dri3-0 libxcomposite1 libxrandr2 \
    libxi6 libatk1.0-0 libnss3 libxss1 \
    libpangocairo-1.0-0 libcairo2 libxdamage1 libgbm1 \
    libgtk-3-0 fonts-liberation libasound2 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Add Puppeteer and ensure Chromium is installed
RUN npm install puppeteer && \
    apt-get clean

EXPOSE 4000

CMD ["node", "backend/server.js"]
