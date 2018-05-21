FROM node:8-slim

COPY check.js /opt/resource/check
COPY in.js /opt/resource/in
COPY out.js /opt/resource/out
COPY package.json /opt/resource

RUN chmod +x /opt/resource/check /opt/resource/in /opt/resource/out

WORKDIR /opt/resource
RUN npm install
