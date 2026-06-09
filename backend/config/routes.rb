Rails.application.routes.draw do
  mount Rswag::Ui::Engine => '/api-docs'
  mount Rswag::Api::Engine => '/api-docs'
  # ヘルスチェック
  get 'up' => 'rails/health#show', as: :rails_health_check

  # API v1
  namespace :api do
    namespace :v1 do
      # 認証
      namespace :auth do
        post 'register',  to: 'registrations#create'
        post 'login',     to: 'sessions#create'
        delete 'logout',  to: 'sessions#destroy'
        get 'me',         to: 'sessions#me'
      end

      # 投稿
      resources :posts, only: %i[index show create destroy] do
        resources :comments, only: %i[index create]
        resources :likes,    only: %i[create destroy]
      end

      # コメント削除
      resources :comments, only: %i[destroy]

      # ユーザー
      resources :users, only: %i[show update] do
        collection do
          get :search
        end
        member do
          post   :follow,     to: 'follows#create'
          delete :follow,     to: 'follows#destroy'
          get    :followers,  to: 'follows#followers'
          get    :following,  to: 'follows#following'
          get    :posts,      to: 'posts#user_posts'
        end
      end

      # フォロー中タイムライン
      namespace :timeline do
        get :following
      end

      # 画像
      namespace :images do
        post :presigned_url
      end
    end
  end
end
