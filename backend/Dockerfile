FROM node:23

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
EXPOSE 3000

ENTRYPOINT ["pnpm", "start:full"]
CMD ["start:full"]
