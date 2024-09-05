FROM oven/bun:latest AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
# Assuming you use bun.lockb instead of package-lock.json
COPY bun.lockb ./

RUN bun install

COPY . .

RUN bun run build

FROM oven/bun:latest

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.output ./output

EXPOSE 3000
CMD [ "bun", ".output/server/index.mjs" ]