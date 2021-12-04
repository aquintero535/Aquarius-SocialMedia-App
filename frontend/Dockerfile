FROM node:16-alpine3.11

WORKDIR /app

COPY package*.json ./

RUN npm install --silent

COPY . .

RUN chown -R node /app/node_modules

EXPOSE 3000
CMD ["npm", "start"]
