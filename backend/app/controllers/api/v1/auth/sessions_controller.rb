module Api
  module V1
    module Auth
      # セッション管理コントローラー（タスク 2.2 で詳細実装）
      class SessionsController < ApplicationController
        def create
          render json: { message: '認証機能は実装予定です' }, status: :not_implemented
        end

        def destroy
          render json: { message: '認証機能は実装予定です' }, status: :not_implemented
        end

        def me
          render json: { message: '認証機能は実装予定です' }, status: :not_implemented
        end
      end
    end
  end
end
