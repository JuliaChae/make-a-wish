FROM node:22-alpine
WORKDIR /app
ENV HOST=0.0.0.0
COPY . .
EXPOSE 4173
CMD ["node", "serve.mjs"]
