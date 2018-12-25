FROM node:carbon

WORKDIR /usr/src

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000
RUN npm run production