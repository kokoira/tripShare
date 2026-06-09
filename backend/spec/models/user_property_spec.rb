# spec/models/user_property_spec.rb
# プロパティベーステスト（Rantly使用）
# Property 1〜4 の検証
#
# **Validates: Requirements 1.2, 1.4, 1.6, 2.5, 2.7**
require 'rails_helper'
require 'rantly/rspec_extensions'

RSpec.describe User, type: :model do
  # ======================================================
  # Property 1: メールアドレス形式バリデーション
  # RFC 5322に準拠しないメールアドレスは必ず拒否される
  # Validates: Requirements 1.2, 2.7
  # ======================================================
  describe 'Property 1: RFC 5322非準拠メールアドレスは必ず拒否される' do
    it '@を含まない文字列はすべて無効なメールとして拒否される' do
      # @なし文字列は必ずRFC 5322非準拠
      property_of {
        # @を含まないランダムな文字列を生成（空文字は除く）
        sized(rand(1..50)) { string(:alpha) }
      }.check(50) { |invalid_email|
        next if invalid_email.include?('@') # @が混入した場合はスキップ
        user = build(:user, email: invalid_email)
        expect(user).not_to be_valid,
          "#{invalid_email.inspect} は無効なメールのはずですが、バリデーションを通過してしまいました"
        expect(user.errors[:email]).to be_present
      }
    end

    it 'ドメインなし（@だけ末尾）のメールアドレスは拒否される' do
      property_of {
        # ローカル部 + @ だけの文字列
        local = sized(rand(1..20)) { string(:alpha) }
        "#{local}@"
      }.check(50) { |invalid_email|
        user = build(:user, email: invalid_email)
        expect(user).not_to be_valid,
          "#{invalid_email.inspect} は無効なメールのはずですが、バリデーションを通過してしまいました"
      }
    end

    it 'ローカル部なし（@ドメイン形式）のメールアドレスは拒否される' do
      property_of {
        domain = sized(rand(3..20)) { string(:alpha) }
        "@#{domain}.com"
      }.check(50) { |invalid_email|
        user = build(:user, email: invalid_email)
        expect(user).not_to be_valid,
          "#{invalid_email.inspect} は無効なメールのはずですが、バリデーションを通過してしまいました"
      }
    end

    it '有効なメールアドレス形式（ローカル@ドメイン.TLD）はバリデーションを通過する' do
      property_of {
        local  = sized(rand(1..20)) { string(:alpha) }
        domain = sized(rand(1..15)) { string(:alpha) }
        tld    = sized(rand(2..4))  { string(:alpha) }
        "#{local}@#{domain}.#{tld}"
      }.check(50) { |valid_email|
        user = build(:user, email: valid_email)
        # メールアドレス形式のみ検証（他フィールドは有効にする）
        user.valid?
        expect(user.errors[:email]).to be_empty,
          "#{valid_email.inspect} は有効なメールのはずですが、バリデーションエラーになりました: #{user.errors[:email].join(', ')}"
      }
    end
  end

  # ======================================================
  # Property 2: パスワード長バリデーション
  # 8文字未満または128文字超のパスワードは登録時に拒否される
  # Validates: Requirements 1.4, 2.7
  # ======================================================
  describe 'Property 2: パスワード長バリデーション' do
    it '8文字未満のパスワードは必ず拒否される' do
      property_of {
        # 1〜7文字のランダムなパスワード
        sized(rand(1..7)) { string }
      }.check(50) { |short_password|
        user = build(:user, password: short_password)
        expect(user).not_to be_valid,
          "#{short_password.length}文字のパスワードは拒否されるはずです"
        expect(user.errors[:password]).to be_present
      }
    end

    it '128文字超のパスワードは必ず拒否される' do
      property_of {
        # 129〜200文字のランダムなパスワード
        sized(rand(129..200)) { string(:alpha) }
      }.check(50) { |long_password|
        user = build(:user, password: long_password)
        expect(user).not_to be_valid,
          "#{long_password.length}文字のパスワードは拒否されるはずです"
        expect(user.errors[:password]).to be_present
      }
    end

    it '8〜128文字のパスワードはバリデーションを通過する（パスワードフィールドのみ）' do
      property_of {
        sized(rand(8..128)) { string(:alpha) }
      }.check(50) { |valid_password|
        user = build(:user, password: valid_password)
        user.valid?
        expect(user.errors[:password]).to be_empty,
          "#{valid_password.length}文字のパスワードは有効なはずですが、エラーになりました: #{user.errors[:password].join(', ')}"
      }
    end
  end

  # ======================================================
  # Property 3: パスワードハッシュ化の不可逆性
  # 保存されるpassword_digestは元パスワードと一致せず、
  # bcryptの有効なハッシュ形式であること
  # Validates: Requirements 1.6
  # ======================================================
  describe 'Property 3: パスワードハッシュ化の不可逆性' do
    it '任意の有効なパスワードに対してpassword_digestが元パスワードと一致しない' do
      property_of {
        # 8〜128文字の有効なパスワード
        sized(rand(8..50)) { string(:alpha) }
      }.check(30) { |plain_password|
        user = create(:user, password: plain_password)
        expect(user.password_digest).not_to eq(plain_password),
          "password_digestが平文パスワードと一致してしまいました（平文保存されています）"
        # bcryptのハッシュ形式チェック（$2a$ または $2b$ で始まる）
        expect(user.password_digest).to match(/\A\$2[ab]\$/),
          "password_digestがbcrypt形式ではありません: #{user.password_digest[0..20]}..."
      }
    end

    it '同じパスワードでも毎回異なるハッシュが生成される（ソルトの効果）' do
      property_of {
        sized(rand(8..30)) { string(:alpha) }
      }.check(20) { |plain_password|
        user1 = create(:user, password: plain_password)
        user2 = create(:user, password: plain_password)
        expect(user1.password_digest).not_to eq(user2.password_digest),
          "同じパスワードで同一のハッシュが生成されました（ソルトが使用されていません）"
      }
    end
  end

  # ======================================================
  # Property 4: 未認証アクセスの拒否
  # 有効なセッションを持たないリクエストは401で拒否される
  # この検証はAPIレベルで行うため、モデルではセッション有効性のみ検証
  # Validates: Requirements 2.5
  # ======================================================
  describe 'Property 4: Sessionモデルの有効期限バリデーション' do
    it '任意の過去時刻を持つセッションはexpired?がtrueを返す' do
      property_of {
        # 1秒〜100日前の時刻
        rand(1..8_640_000).seconds.ago
      }.check(50) { |past_time|
        user    = create(:user)
        session = create(:session, user: user, expires_at: past_time)
        unless session.expired?
          fail "#{past_time}は過去なのにexpired?がfalseを返しました"
        end
      }
    end

    it '任意の未来時刻を持つセッションはexpired?がfalseを返す' do
      property_of {
        # 1秒〜100日後の時刻
        rand(1..8_640_000).seconds.from_now
      }.check(50) { |future_time|
        user    = create(:user)
        session = create(:session, user: user, expires_at: future_time)
        if session.expired?
          fail "#{future_time}は未来なのにexpired?がtrueを返しました"
        end
      }
    end
  end
end
