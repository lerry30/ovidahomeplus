FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "preview", "--", "--port", "3000", "--host"]

EXPOSE 3000
