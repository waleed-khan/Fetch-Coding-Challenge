FROM node:alpine
COPY . /app
RUN npm install
CMD node /app/app.js
