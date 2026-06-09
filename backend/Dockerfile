FROM ruby:3.3-slim

# 必要なパッケージをインストール
RUN apt-get update -qq && apt-get install -y \
  build-essential \
  default-libmysqlclient-dev \
  libyaml-dev \
  curl \
  git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Gemfile をコピーして bundle install
COPY Gemfile Gemfile.lock* ./
RUN bundle install

# ソースコードをコピー
COPY . .

# entrypoint スクリプトをコピー
COPY entrypoint.sh /usr/bin/entrypoint.sh
RUN chmod +x /usr/bin/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["entrypoint.sh"]
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
