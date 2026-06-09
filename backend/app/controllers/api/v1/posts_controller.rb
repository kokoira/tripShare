module Api
  module V1
    # 投稿コントローラー（タスク 4.2 で詳細実装）
    class PostsController < ApplicationController
      def index
        render json: { posts: [], pagination: { next_cursor: nil, has_more: false } }
      end

      def show
        render json: { message: '投稿機能は実装予定です' }, status: :not_implemented
      end

      def create
        render json: { message: '投稿機能は実装予定です' }, status: :not_implemented
      end

      def destroy
        render json: { message: '投稿機能は実装予定です' }, status: :not_implemented
      end

      def user_posts
        render json: { posts: [], pagination: { next_cursor: nil, has_more: false } }
      end
    end
  end
end
