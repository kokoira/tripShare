# spec/requests/api/v1/posts_spec.rb
# TDD Red フェーズ: 投稿API のテスト
# タスク 4.1: 投稿APIのテストを先に書く
# Requirements: 3, 4
require 'swagger_helper'

RSpec.describe '投稿API', type: :request do
  # ============================================================
  # GET /api/v1/posts - タイムライン取得
  # Property 8: タイムラインのソートとページネーション
  # Requirements: 4.1, 4.3, 4.4
  # ============================================================
  path '/api/v1/posts' do
    get 'タイムライン取得（カーソルベースページネーション）' do
      tags 'Posts'
      produces 'application/json'
      description '全ユーザーの投稿を新しい順に取得する。カーソルベースのページネーションをサポート。'
      security [{ cookieAuth: [] }]

      parameter name: :cursor, in: :query, type: :string, required: false,
                description: 'ページネーション用カーソル（前のレスポンスのnext_cursorを使用）'
      parameter name: :limit, in: :query, type: :integer, required: false,
                description: '取得件数（デフォルト: 20、最大: 20）'

      # --- 正常系: 認証済みユーザー ---
      response '200', 'タイムライン取得成功（投稿あり）' do
        schema type: :object,
               properties: {
                 posts: {
                   type: :array,
                   items: { '$ref' => '#/components/schemas/Post' }
                 },
                 pagination: {
                   type: :object,
                   properties: {
                     next_cursor: { type: :string, nullable: true },
                     has_more:    { type: :boolean }
                   },
                   required: %w[next_cursor has_more]
                 }
               },
               required: %w[posts pagination]

        let(:user) { create(:user) }
        let!(:posts) do
          # 新しい順にソートされることを確認するため、時刻をずらして作成
          25.times.map do |i|
            create(:post, user: user, created_at: i.minutes.ago)
          end
        end
        let(:cursor) { nil }
        let(:limit) { nil }

        before do
          session = create(:session, user: user)
          cookies['session_token'] = session.session_token
        end

        run_test! do |response|
          data = JSON.parse(response.body)

          # postsとpaginationが含まれること
          expect(data['posts']).to be_present
          expect(data['pagination']).to be_present

          # 最大20件取得
          expect(data['posts'].length).to be <= 20

          # 新しい順（降順）にソートされていること
          created_ats = data['posts'].map { |p| Time.parse(p['created_at']) }
          expect(created_ats).to eq(created_ats.sort.reverse)

          # 各投稿に必要なフィールドが含まれること（Property 6, Requirement 4.2）
          data['posts'].each do |post|
            expect(post['id']).to be_present
            expect(post['body']).to be_present
            expect(post['user']).to be_present
            expect(post['user']['username']).to be_present
            expect(post['created_at']).to be_present
            expect(post['comments_count']).not_to be_nil
            expect(post['likes_count']).not_to be_nil
          end

          # 25件ある場合、has_moreがtrueでnext_cursorが存在する
          expect(data['pagination']['has_more']).to be true
          expect(data['pagination']['next_cursor']).to be_present
        end
      end

      response '200', 'タイムライン取得成功（投稿なし）' do
        schema type: :object,
               properties: {
                 posts: {
                   type: :array,
                   items: { '$ref' => '#/components/schemas/Post' }
                 },
                 pagination: {
                   type: :object,
                   properties: {
                     next_cursor: { type: :string, nullable: true },
                     has_more:    { type: :boolean }
                   },
                   required: %w[next_cursor has_more]
                 }
               },
               required: %w[posts pagination]

        let(:user) { create(:user) }
        let(:cursor) { nil }
        let(:limit) { nil }

        before do
          session = create(:session, user: user)
          cookies['session_token'] = session.session_token
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          # 投稿が0件の場合（Requirement 4.6）
          expect(data['posts']).to eq([])
          expect(data['pagination']['has_more']).to be false
          expect(data['pagination']['next_cursor']).to be_nil
        end
      end

      response '200', 'カーソルを使った次ページ取得' do
        schema type: :object,
               properties: {
                 posts: {
                   type: :array,
                   items: { '$ref' => '#/components/schemas/Post' }
                 },
                 pagination: {
                   type: :object,
                   properties: {
                     next_cursor: { type: :string, nullable: true },
                     has_more:    { type: :boolean }
                   },
                   required: %w[next_cursor has_more]
                 }
               },
               required: %w[posts pagination]

        let(:user) { create(:user) }
        let!(:posts) do
          25.times.map { |i| create(:post, user: user, created_at: i.minutes.ago) }
        end
        let(:cursor) do
          session = create(:session, user: user)
          cookies['session_token'] = session.session_token
          get '/api/v1/posts'
          JSON.parse(response.body)['pagination']['next_cursor']
        end
        let(:limit) { nil }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['posts']).to be_present
          # 2ページ目は残り5件
          expect(data['posts'].length).to be <= 20
          expect(data['pagination']['has_more']).to be false
        end
      end

      response '401', '未認証（セッションなし）' do
        schema '$ref' => '#/components/schemas/ApiError'
        let(:cursor) { nil }
        let(:limit) { nil }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['error']).to be_present
        end
      end
    end

    # ============================================================
    # POST /api/v1/posts - 投稿作成
    # Property 5: 投稿本文バリデーション
    # Property 6: 投稿メタデータの付与
    # Requirements: 3.1, 3.2, 3.3, 3.4
    # ============================================================
    post '投稿作成' do
      tags 'Posts'
      consumes 'application/json'
      produces 'application/json'
      description '新しい旅行記録を投稿する。1文字以上280文字以内の本文が必要。'
      security [{ cookieAuth: [] }]

      parameter name: :post_params, in: :body, schema: {
        type: :object,
        properties: {
          body: { type: :string, example: '素晴らしい旅でした！' }
        },
        required: %w[body]
      }

      # --- 正常系 ---
      response '201', '投稿作成成功' do
        schema type: :object,
               properties: {
                 post: { '$ref' => '#/components/schemas/Post' }
               },
               required: %w[post]

        let(:user) { create(:user) }
        let(:post_params) { { body: '京都に旅行に行きました。とても良い旅でした。' } }

        before do
          session = create(:session, user: user)
          cookies['session_token'] = session.session_token
        end

        run_test! do |response|
          data = JSON.parse(response.body)

          expect(data['post']).to be_present
          expect(data['post']['body']).to eq('京都に旅行に行きました。とても良い旅でした。')

          # Property 6: 投稿メタデータの付与（Requirement 3.4）
          expect(data['post']['user']).to be_present
          expect(data['post']['user']['username']).to eq(user.username)
          expect(data['post']['created_at']).to be_present

          # created_atが年月日時分の精度を持つこと
          created_at = Time.parse(data['post']['created_at'])
          expect(created_at).to be_within(5.seconds).of(Time.current)

          # コメント数・いいね数が初期値0
          expect(data['post']['comments_count']).to eq(0)
          expect(data['post']['likes_count']).to eq(0)
        end
      end

      response '201', '最大文字数（280文字）の投稿作成成功' do
        schema type: :object,
               properties: {
                 post: { '$ref' => '#/components/schemas/Post' }
               },
               required: %w[post]

        let(:user) { create(:user) }
        let(:post_params) { { body: 'あ' * 280 } }

        before do
          session = create(:session, user: user)
          cookies['session_token'] = session.session_token
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['post']['body'].length).to eq(280)
        end
      end

      response '201', '最小文字数（1文字）の投稿作成成功' do
        schema type: :object,
               properties: {
                 post: { '$ref' => '#/components/schemas/Post' }
               },
               required: %w[post]

        let(:user) { create(:user) }
        let(:post_params) { { body: 'あ' } }

        before do
          session = create(:session, user: user)
          cookies['session_token'] = session.session_token
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['post']['body']).to eq('あ')
        end
      end

      # --- バリデーションエラー系 ---
      response '400', '本文が空（未入力）' do
        schema '$ref' => '#/components/schemas/ValidationError'

        let(:user) { create(:user) }
        let(:post_params) { { body: '' } }

        before do
          session = create(:session, user: user)
          cookies['session_token'] = session.session_token
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          # Requirement 3.2: 本文未入力エラー
          expect(data['errors']).to be_present
          fields = data['errors'].map { |e| e['field'] }
          expect(fields).to include('body')
        end
      end

      response '400', '本文が空白文字のみ' do
        schema '$ref' => '#/components/schemas/ValidationError'

        let(:user) { create(:user) }
        let(:post_params) { { body: '   ' } }

        before do
          session = create(:session, user: user)
          cookies['session_token'] = session.session_token
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          # Requirement 3.2: 空白のみの投稿はエラー
          expect(data['errors']).to be_present
          fields = data['errors'].map { |e| e['field'] }
          expect(fields).to include('body')
        end
      end

      response '400', '本文が281文字以上（文字数超過）' do
        schema '$ref' => '#/components/schemas/ValidationError'

        let(:user) { create(:user) }
        let(:post_params) { { body: 'あ' * 281 } }

        before do
          session = create(:session, user: user)
          cookies['session_token'] = session.session_token
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          # Requirement 3.3: 280文字超エラー
          expect(data['errors']).to be_present
          fields = data['errors'].map { |e| e['field'] }
          expect(fields).to include('body')
        end
      end

      # --- 認証エラー系 ---
      response '401', '未認証（セッションなし）' do
        schema '$ref' => '#/components/schemas/ApiError'

        let(:post_params) { { body: '旅行記録' } }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['error']).to be_present
        end
      end
    end
  end

  # ============================================================
  # GET /api/v1/posts/:id - 投稿詳細取得
  # ============================================================
  path '/api/v1/posts/{id}' do
    parameter name: :id, in: :path, type: :integer, description: '投稿ID'

    get '投稿詳細取得' do
      tags 'Posts'
      produces 'application/json'
      description '指定IDの投稿詳細を取得する'
      security [{ cookieAuth: [] }]

      response '200', '投稿詳細取得成功' do
        schema type: :object,
               properties: {
                 post: { '$ref' => '#/components/schemas/Post' }
               },
               required: %w[post]

        let(:user) { create(:user) }
        let(:post_record) { create(:post, user: user) }
        let(:id) { post_record.id }

        before do
          session = create(:session, user: user)
          cookies['session_token'] = session.session_token
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['post']).to be_present
          expect(data['post']['id']).to eq(post_record.id)
          expect(data['post']['body']).to eq(post_record.body)
          expect(data['post']['user']['username']).to eq(user.username)
        end
      end

      response '404', '投稿が存在しない' do
        schema '$ref' => '#/components/schemas/ApiError'

        let(:user) { create(:user) }
        let(:id) { 999_999 }

        before do
          session = create(:session, user: user)
          cookies['session_token'] = session.session_token
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['error']).to be_present
        end
      end

      response '401', '未認証' do
        schema '$ref' => '#/components/schemas/ApiError'

        let(:post_record) { create(:post) }
        let(:id) { post_record.id }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['error']).to be_present
        end
      end
    end

    # ============================================================
    # DELETE /api/v1/posts/:id - 投稿削除
    # Property 7: 投稿削除の権限制御
    # Requirements: 3.5, 3.6, 3.7
    # ============================================================
    delete '投稿削除（本人のみ）' do
      tags 'Posts'
      produces 'application/json'
      description '投稿を削除する。削除できるのは投稿者本人のみ。'
      security [{ cookieAuth: [] }]

      # --- 正常系: 本人による削除 ---
      response '200', '投稿削除成功（本人）' do
        schema type: :object,
               properties: {
                 message: { type: :string }
               },
               required: %w[message]

        let(:owner) { create(:user) }
        let(:post_record) { create(:post, user: owner) }
        let(:id) { post_record.id }

        before do
          session = create(:session, user: owner)
          cookies['session_token'] = session.session_token
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['message']).to be_present

          # 投稿がDBから削除されていること
          expect(Post.find_by(id: post_record.id)).to be_nil
        end
      end

      # --- 権限エラー系: 他ユーザーによる削除 ---
      response '403', '他ユーザーの投稿を削除しようとした（403 Forbidden）' do
        schema '$ref' => '#/components/schemas/ApiError'

        let(:owner) { create(:user) }
        let(:other_user) { create(:user) }
        let(:post_record) { create(:post, user: owner) }
        let(:id) { post_record.id }

        before do
          # 他ユーザーとしてログイン
          session = create(:session, user: other_user)
          cookies['session_token'] = session.session_token
        end

        run_test! do |response|
          # Requirement 3.7: 403エラーを返す
          data = JSON.parse(response.body)
          expect(data['error']).to be_present

          # 投稿がDBから削除されていないこと
          expect(Post.find_by(id: post_record.id)).to be_present
        end
      end

      response '401', '未認証' do
        schema '$ref' => '#/components/schemas/ApiError'

        let(:post_record) { create(:post) }
        let(:id) { post_record.id }

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['error']).to be_present
        end
      end

      response '404', '投稿が存在しない' do
        schema '$ref' => '#/components/schemas/ApiError'

        let(:user) { create(:user) }
        let(:id) { 999_999 }

        before do
          session = create(:session, user: user)
          cookies['session_token'] = session.session_token
        end

        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data['error']).to be_present
        end
      end
    end
  end
end
