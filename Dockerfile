FROM node:8.11
COPY check.js /opt/resource/check
COPY in.js /opt/resource/in
COPY out.js /opt/resource/out
RUN chmod +x /opt/resource/check /opt/resource/in /opt/resource/out
