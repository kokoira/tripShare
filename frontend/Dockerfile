FROM node:22-alpine

# pnpm を corepack で有効化（バージョン固定）
RUN corepack enable && corepack prepare pnpm@latest-10 --activate

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
