FROM node:20-alpine

WORKDIR /app

# Install yarn (project uses yarn.lock)
RUN npm i -g yarn

# Install deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source and build
COPY . .
RUN yarn build

EXPOSE 3099

ENV NODE_ENV=production

# If you have "start:prod" script you can also use: ["yarn", "start:prod"]
CMD ["node", "dist/main.js"]
