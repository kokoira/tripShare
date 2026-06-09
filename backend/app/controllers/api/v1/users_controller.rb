module Api
  module V1
    # ユーザーコントローラー（タスク 12.2 で詳細実装）
    class UsersController < ApplicationController
      def show
        render json: { message: 'ユーザー機能は実装予定です' }, status: :not_implemented
      end

      def update
        render json: { message: 'ユーザー機能は実装予定です' }, status: :not_implemented
      end

      def search
        render json: { users: [], pagination: { current_page: 1, total_pages: 0, total_count: 0 } }
      end
    end
  end
end
