module Api
  module V1
    # 投稿コントローラー
    # Requirements 3, 4 に対応
    class PostsController < ApplicationController
      before_action :authenticate_user!, except: []
      before_action :set_post, only: %i[show destroy]

      # GET /api/v1/posts
      # タイムライン取得（カーソルベースページネーション）
      # Requirement 4.1: 全ユーザーの投稿を新しい順（降順）に最大20件取得
      def index
        authenticate_user!
        return if performed?

        limit  = [params[:limit].to_i, 20].min
        limit  = 20 if limit <= 0
        cursor = params[:cursor]

        scope = Post.includes(:user).order(created_at: :desc, id: :desc)

        # カーソルがある場合は指定位置より前（古い）投稿を取得
        if cursor.present?
          decoded = decode_cursor(cursor)
          if decoded
            scope = scope.where(
              '(posts.created_at < ?) OR (posts.created_at = ? AND posts.id < ?)',
              decoded[:created_at],
              decoded[:created_at],
              decoded[:id],
            )
          end
        end

        # limit+1件取得してhas_moreを判定
        posts = scope.limit(limit + 1).to_a
        has_more = posts.size > limit
        posts = posts.first(limit) if has_more

        next_cursor = nil
        if has_more && posts.any?
          last_post   = posts.last
          next_cursor = encode_cursor(last_post.created_at, last_post.id)
        end

        render json: {
          posts:      posts.map { |p| serialize_post(p) },
          pagination: { next_cursor: next_cursor, has_more: has_more },
        }
      end

      # GET /api/v1/posts/:id
      # 投稿詳細取得
      def show
        authenticate_user!
        return if performed?

        render json: { post: serialize_post(@post) }
      end

      # POST /api/v1/posts
      # 投稿作成
      # Requirement 3.1: 1〜280文字の本文を保存し、メタデータを付与
      def create
        authenticate_user!
        return if performed?

        post = current_user.posts.build(post_params)

        if post.save
          Rails.logger.info({
            event:      'post_created',
            user_id:    current_user.id,
            post_id:    post.id,
            body_length: post.body.length,
            request_id: request.request_id,
          }.to_json)

          render json: { post: serialize_post(post) }, status: :created
        else
          render json: {
            errors: post.errors.map { |e| { field: e.attribute.to_s, message: e.message } },
          }, status: :bad_request
        end
      end

      # DELETE /api/v1/posts/:id
      # 投稿削除（本人のみ）
      # Requirement 3.7: 投稿者以外からの削除リクエストは403エラー
      def destroy
        authenticate_user!
        return if performed?

        # 権限チェック: 投稿者本人のみ削除可能
        unless @post.user_id == current_user.id
          return render json: { error: 'この操作を実行する権限がありません' }, status: :forbidden
        end

        @post.destroy!

        Rails.logger.info({
          event:      'post_deleted',
          user_id:    current_user.id,
          post_id:    @post.id,
          request_id: request.request_id,
        }.to_json)

        render json: { message: '投稿を削除しました' }
      end

      # GET /api/v1/users/:user_id/posts
      # ユーザーの投稿一覧
      def user_posts
        authenticate_user!
        return if performed?

        user  = User.find(params[:user_id])
        limit = 20

        scope = user.posts.includes(:user).order(created_at: :desc, id: :desc)

        cursor = params[:cursor]
        if cursor.present?
          decoded = decode_cursor(cursor)
          if decoded
            scope = scope.where(
              '(posts.created_at < ?) OR (posts.created_at = ? AND posts.id < ?)',
              decoded[:created_at],
              decoded[:created_at],
              decoded[:id],
            )
          end
        end

        posts    = scope.limit(limit + 1).to_a
        has_more = posts.size > limit
        posts    = posts.first(limit) if has_more

        next_cursor = nil
        if has_more && posts.any?
          last_post   = posts.last
          next_cursor = encode_cursor(last_post.created_at, last_post.id)
        end

        render json: {
          posts:      posts.map { |p| serialize_post(p) },
          pagination: { next_cursor: next_cursor, has_more: has_more },
        }
      end

      private

      def set_post
        @post = Post.includes(:user).find(params[:id])
      end

      def post_params
        params.require(:post).permit(:body)
      end

      # 投稿をJSONシリアライズ
      # Property 6: 投稿メタデータの付与（ユーザー名・投稿日時）
      def serialize_post(post)
        {
          id:                    post.id,
          body:                  post.body,
          user:                  {
            id:         post.user.id,
            username:   post.user.username,
            avatar_key: post.user.avatar_key,
          },
          comments_count:        post.comments_count,
          likes_count:           post.likes_count,
          liked_by_current_user: current_user ? post.likes.exists?(user: current_user) : false,
          created_at:            post.created_at.iso8601,
        }
      end

      # カーソルをBase64エンコード
      def encode_cursor(created_at, id)
        Base64.strict_encode64("#{created_at.utc.iso8601(6)}:#{id}")
      end

      # Base64デコードしてカーソルをパース
      def decode_cursor(cursor)
        decoded = Base64.strict_decode64(cursor)
        parts   = decoded.split(':')
        # ISO 8601のタイムスタンプはコロンを含む可能性があるため最後の要素をIDとして扱う
        id           = parts.last.to_i
        created_at_s = parts[0..-2].join(':')
        created_at   = Time.parse(created_at_s)
        { created_at: created_at, id: id }
      rescue ArgumentError, TypeError
        nil
      end
    end
  end
end
