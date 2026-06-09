module Api
  module V1
    module Auth
      # ユーザー登録コントローラー（タスク 2.2 で詳細実装）
      class RegistrationsController < ApplicationController
        def create
          render json: { message: '認証機能は実装予定です' }, status: :not_implemented
        end
      end
    end
  end
end
