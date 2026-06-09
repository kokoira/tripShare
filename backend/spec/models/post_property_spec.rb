# spec/models/post_property_spec.rb
# プロパティベーステスト（Rantly使用）
# Property 5〜8 の検証
#
# **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.7, 4.1, 4.3**
require 'rails_helper'
require 'rantly/rspec_extensions'

RSpec.describe Post, type: :model do
  # ======================================================
  # Property 5: 投稿本文バリデーション
  # 1文字以上280文字以内かつ空白文字のみでない場合はバリデーション通過
  # それ以外（空文字、空白のみ、281文字以上）は拒否される
  # Validates: Requirements 3.1, 3.2, 3.3
  # ======================================================
  describe 'Property 5: 投稿本文バリデーション' do
    let(:user) { create(:user) }

    context '有効な投稿本文（1文字以上280文字以内、空白文字のみでない）' do
      it '1文字の投稿本文はバリデーションを通過する' do
        post = build(:post, user: user, body: 'あ')
        expect(post).to be_valid
      end

      it '280文字の投稿本文はバリデーションを通過する' do
        post = build(:post, user: user, body: 'あ' * 280)
        expect(post).to be_valid
      end

      it '任意の有効な投稿本文（1〜280文字、非空白）はバリデーションを通過する' do
        property_of {
          # 1〜280文字のランダムなASCII文字列（空白文字のみにならないよう先頭に文字を加える）
          len = rand(1..280)
          # 先頭に確実に非空白文字を置く
          'a' + (len > 1 ? sized(len - 1) { string(:alpha) } : '')
        }.check(50) { |valid_body|
          post = build(:post, user: user, body: valid_body)
          post.valid?
          expect(post.errors[:body]).to be_empty,
            "#{valid_body.length}文字の投稿本文は有効なはずです: #{post.errors[:body].join(', ')}"
        }
      end
    end

    context '無効な投稿本文（空、空白のみ、281文字以上）' do
      it '空文字の投稿本文は拒否される' do
        post = build(:post, user: user, body: '')
        expect(post).not_to be_valid
        expect(post.errors[:body]).to be_present
      end

      it 'スペースのみの投稿本文は拒否される' do
        post = build(:post, user: user, body: '   ')
        expect(post).not_to be_valid
        expect(post.errors[:body]).to be_present
      end

      it 'タブ・改行のみの投稿本文は拒否される' do
        post = build(:post, user: user, body: "\t\n\r")
        expect(post).not_to be_valid
        expect(post.errors[:body]).to be_present
      end

      it '281文字以上の投稿本文は必ず拒否される' do
        property_of {
          # 281〜500文字のランダムな文字列
          len = rand(281..500)
          'a' * len
        }.check(30) { |long_body|
          post = build(:post, user: user, body: long_body)
          expect(post).not_to be_valid,
            "#{long_body.length}文字の投稿本文は拒否されるはずです"
          expect(post.errors[:body]).to be_present
        }
      end

      it '任意の空白文字のみの文字列は拒否される' do
        property_of {
          # スペース・タブ・改行のみの文字列
          len = rand(1..50)
          [' ', "\t", "\n"].sample(len, random: Random.new).join
        }.check(30) { |whitespace_body|
          next if whitespace_body.empty?
          post = build(:post, user: user, body: whitespace_body)
          expect(post).not_to be_valid,
            "空白のみの投稿本文 #{whitespace_body.inspect} は拒否されるはずです"
          expect(post.errors[:body]).to be_present
        }
      end
    end
  end

  # ======================================================
  # Property 6: 投稿メタデータの付与
  # 正常に作成された投稿には投稿者のユーザー名および
  # 投稿日時（年月日時分の精度）が必ず付与されている
  # Validates: Requirements 3.4
  # ======================================================
  describe 'Property 6: 投稿メタデータの付与' do
    it '任意のユーザーが投稿を作成すると、ユーザー情報と日時が付与される' do
      property_of {
        # ランダムなユーザー名と投稿内容を生成
        username = "user_#{rand(1..999_999)}"
        body = sized(rand(1..50)) { string(:alpha) }
        [username, body]
      }.check(20) { |(username, body)|
        # テスト内でユニークなユーザーを作成
        test_user = create(:user, username: username)
        post = create(:post, user: test_user, body: body)

        # ユーザー情報が付与されていること
        expect(post.user).to eq(test_user)
        expect(post.user.username).to eq(username)

        # 投稿日時が付与されていること（年月日時分の精度）
        expect(post.created_at).to be_present
        expect(post.created_at).to be_within(5.seconds).of(Time.current)

        # 投稿日時が分単位の精度を持つこと
        formatted = post.created_at.strftime('%Y/%m/%d %H:%M')
        expect(formatted).to match(/\A\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}\z/)
      }
    end
  end
end

# ======================================================
# Property 7: 投稿削除の権限制御（APIレベル）
# Property 8: タイムラインのソートとページネーション（APIレベル）
# これらはAPIレベルのテストとして spec/requests 側でも検証するが
# ここではモデルレベルのデータ整合性を確認する
# Validates: Requirements 3.7, 4.1, 4.3
# ======================================================
RSpec.describe 'Property 7 & 8: 投稿削除権限とタイムラインソート', type: :request do
  let(:owner) { create(:user) }
  let(:other_user) { create(:user) }

  # --------------------------------------------------------
  # Property 7: 投稿削除の権限制御
  # 投稿削除権限は投稿者本人のみ、それ以外は403
  # --------------------------------------------------------
  describe 'Property 7: 投稿削除の権限制御' do
    it '任意の投稿に対して、投稿者以外のユーザーからの削除は403を返す' do
      property_of {
        # ランダムな本文（1〜50文字）
        sized(rand(1..50)) { string(:alpha) }
      }.check(10) { |post_body|
        next if post_body.strip.empty?

        test_owner      = create(:user)
        test_other_user = create(:user)
        test_post       = create(:post, user: test_owner, body: post_body)

        # 他ユーザーでログイン
        session = create(:session, user: test_other_user)
        cookies['session_token'] = session.session_token

        delete "/api/v1/posts/#{test_post.id}"

        expect(response.status).to eq(403),
          "投稿者以外からの削除リクエストは403を返すはずです（実際: #{response.status}）"

        # 投稿がDBに残っていること
        expect(Post.find_by(id: test_post.id)).to be_present,
          "投稿者以外からの削除リクエストで投稿が削除されてしまいました"
      }
    end

    it '任意の投稿に対して、投稿者本人による削除は成功する' do
      property_of {
        sized(rand(1..50)) { string(:alpha) }
      }.check(10) { |post_body|
        next if post_body.strip.empty?

        test_owner = create(:user)
        test_post  = create(:post, user: test_owner, body: post_body)

        # 投稿者でログイン
        session = create(:session, user: test_owner)
        cookies['session_token'] = session.session_token

        delete "/api/v1/posts/#{test_post.id}"

        expect(response.status).to eq(200),
          "投稿者本人からの削除リクエストは200を返すはずです（実際: #{response.status}）"

        # 投稿がDBから削除されていること
        expect(Post.find_by(id: test_post.id)).to be_nil,
          "投稿者本人による削除後も投稿がDBに残っています"
      }
    end
  end

  # --------------------------------------------------------
  # Property 8: タイムラインのソートとページネーション
  # 投稿日時の降順、1ページ最大20件、カーソルベース次ページ取得
  # --------------------------------------------------------
  describe 'Property 8: タイムラインのソートとページネーション' do
    let!(:sorted_posts) do
      # 30件の投稿を異なる時刻で作成（古い順に作成）
      30.times.map { |i| create(:post, user: owner, created_at: (30 - i).minutes.ago) }
    end

    before do
      session = create(:session, user: owner)
      cookies['session_token'] = session.session_token
    end

    it 'タイムライン取得結果は常に投稿日時の降順にソートされる' do
      get '/api/v1/posts'
      data = JSON.parse(response.body)

      created_ats = data['posts'].map { |p| Time.parse(p['created_at']) }
      expect(created_ats).to eq(created_ats.sort.reverse),
        "タイムラインは投稿日時の降順でソートされていません"
    end

    it 'タイムライン取得結果は1ページあたり最大20件' do
      get '/api/v1/posts'
      data = JSON.parse(response.body)

      expect(data['posts'].length).to be <= 20,
        "タイムラインの1ページあたりの取得件数が20件を超えています: #{data['posts'].length}件"
    end

    it '30件ある場合、1ページ目は20件でhas_moreがtrue' do
      get '/api/v1/posts'
      data = JSON.parse(response.body)

      expect(data['posts'].length).to eq(20)
      expect(data['pagination']['has_more']).to be true
      expect(data['pagination']['next_cursor']).to be_present
    end

    it 'カーソルを使って2ページ目を取得できる' do
      # 1ページ目取得
      get '/api/v1/posts'
      first_page_data = JSON.parse(response.body)
      next_cursor = first_page_data['pagination']['next_cursor']

      # 2ページ目取得
      get '/api/v1/posts', params: { cursor: next_cursor }
      second_page_data = JSON.parse(response.body)

      # 2ページ目に残り10件が含まれること
      expect(second_page_data['posts'].length).to eq(10)
      expect(second_page_data['pagination']['has_more']).to be false

      # 1ページ目と2ページ目に重複がないこと
      first_ids  = first_page_data['posts'].map { |p| p['id'] }
      second_ids = second_page_data['posts'].map { |p| p['id'] }
      expect(first_ids & second_ids).to be_empty,
        "1ページ目と2ページ目に重複する投稿があります"
    end

    it 'すべての投稿のソート順がページをまたいでも維持される' do
      # 1ページ目取得
      get '/api/v1/posts'
      first_page = JSON.parse(response.body)
      cursor = first_page['pagination']['next_cursor']

      # 2ページ目取得
      get '/api/v1/posts', params: { cursor: cursor }
      second_page = JSON.parse(response.body)

      all_posts = first_page['posts'] + second_page['posts']
      all_created_ats = all_posts.map { |p| Time.parse(p['created_at']) }

      expect(all_created_ats).to eq(all_created_ats.sort.reverse),
        "ページをまたいでも投稿日時の降順が維持されていません"
    end
  end
end
