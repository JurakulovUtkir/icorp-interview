FROM node:20-alpine

WORKDIR /app

# Enable yarn (comes with Node 20 via corepack)
RUN corepack enable

# Install deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source and build
COPY . .
RUN yarn build

ENV NODE_ENV=production
EXPOSE 3099

CMD ["node", "dist/main.js"]
