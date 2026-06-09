FROM node:20-alpine

# pnpm を corepack で有効化
RUN corepack enable

WORKDIR /app

# 依存関係ファイルをコピー
COPY package.json pnpm-lock.yaml ./

# 依存関係インストール
RUN pnpm install --frozen-lockfile

# ソースコードをコピー
COPY . .

# 開発サーバー起動
EXPOSE 3000
CMD ["pnpm", "run", "dev"]
