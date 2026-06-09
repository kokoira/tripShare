FROM node:20-alpine

WORKDIR /app

# 依存関係ファイルをコピー
COPY package.json package-lock.json* ./

# 依存関係インストール
RUN npm install

# ソースコードをコピー
COPY . .

# 開発サーバー起動
EXPOSE 3000
CMD ["npm", "run", "dev"]
