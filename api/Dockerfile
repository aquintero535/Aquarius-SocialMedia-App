FROM node:16-alpine3.11

#Crea el directorio api
WORKDIR /api

COPY package*.json ./

RUN apk add --no-cache bash
RUN npm install

COPY . .

EXPOSE 5000
CMD ["npm", "start"]