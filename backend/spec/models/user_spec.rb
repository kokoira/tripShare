# spec/models/user_spec.rb
# Userモデルのバリデーション・ビジネスロジックのユニットテスト
require 'rails_helper'

RSpec.describe User, type: :model do
  # ========================================
  # アソシエーション
  # ========================================
  describe 'アソシエーション' do
    it { is_expected.to have_many(:sessions).dependent(:destroy) }
    it { is_expected.to have_many(:posts).dependent(:destroy) }
    it { is_expected.to have_many(:comments).dependent(:destroy) }
    it { is_expected.to have_many(:likes).dependent(:destroy) }
    it { is_expected.to have_many(:active_follows).dependent(:destroy) }
    it { is_expected.to have_many(:passive_follows).dependent(:destroy) }
    it { is_expected.to have_many(:following).through(:active_follows) }
    it { is_expected.to have_many(:followers).through(:passive_follows) }
  end

  # ========================================
  # バリデーション: メールアドレス
  # ========================================
  describe 'バリデーション: メールアドレス' do
    context '有効なメールアドレス' do
      it 'RFC 5322準拠の標準メールアドレスは有効' do
        user = build(:user, email: 'valid@example.com')
        expect(user).to be_valid
      end

      it 'サブドメインを含むメールアドレスは有効' do
        user = build(:user, email: 'user@mail.example.co.jp')
        expect(user).to be_valid
      end

      it 'プラス記号を含むメールアドレスは有効' do
        user = build(:user, email: 'user+tag@example.com')
        expect(user).to be_valid
      end
    end

    context '無効なメールアドレス' do
      it 'メールアドレスが空の場合は無効' do
        user = build(:user, email: '')
        expect(user).not_to be_valid
        expect(user.errors[:email]).to be_present
      end

      it '@がないメールアドレスは無効' do
        user = build(:user, email: 'invalidemail')
        expect(user).not_to be_valid
        expect(user.errors[:email]).to be_present
      end

      it 'ドメインがないメールアドレスは無効' do
        user = build(:user, email: 'user@')
        expect(user).not_to be_valid
        expect(user.errors[:email]).to be_present
      end

      it 'ローカル部がないメールアドレスは無効' do
        user = build(:user, email: '@example.com')
        expect(user).not_to be_valid
        expect(user.errors[:email]).to be_present
      end

      it 'スペースを含むメールアドレスは無効' do
        user = build(:user, email: 'user @example.com')
        expect(user).not_to be_valid
        expect(user.errors[:email]).to be_present
      end

      it '連続するドットを含むドメインのメールアドレスは無効' do
        user = build(:user, email: 'user@example..com')
        expect(user).not_to be_valid
        expect(user.errors[:email]).to be_present
      end
    end

    context 'メールアドレスの一意性' do
      it '同じメールアドレスで2人目のユーザーは作成不可' do
        create(:user, email: 'duplicate@example.com')
        user = build(:user, email: 'duplicate@example.com')
        expect(user).not_to be_valid
        expect(user.errors[:email]).to be_present
      end

      it 'メールアドレスの大文字小文字を区別しない（一意性）' do
        create(:user, email: 'user@example.com')
        user = build(:user, email: 'USER@EXAMPLE.COM')
        expect(user).not_to be_valid
        expect(user.errors[:email]).to be_present
      end
    end

    context 'メールアドレスの正規化' do
      it '登録前にメールアドレスを小文字に変換する' do
        user = create(:user, email: 'UPPER@EXAMPLE.COM')
        expect(user.email).to eq('upper@example.com')
      end

      it '登録前にメールアドレスの前後スペースを除去する' do
        user = create(:user, email: '  trimmed@example.com  ')
        expect(user.email).to eq('trimmed@example.com')
      end
    end
  end

  # ========================================
  # バリデーション: パスワード
  # ========================================
  describe 'バリデーション: パスワード' do
    context '有効なパスワード' do
      it '8文字のパスワードは有効' do
        user = build(:user, password: 'a' * 8, password_confirmation: 'a' * 8)
        expect(user).to be_valid
      end

      it '128文字のパスワードは有効' do
        user = build(:user, password: 'a' * 128, password_confirmation: 'a' * 128)
        expect(user).to be_valid
      end

      it '英数字混在のパスワードは有効' do
        user = build(:user, password: 'MyP@ssw0rd!', password_confirmation: 'MyP@ssw0rd!')
        expect(user).to be_valid
      end
    end

    context '無効なパスワード' do
      it 'パスワードが空の場合は無効（新規作成時）' do
        user = build(:user, password: '')
        expect(user).not_to be_valid
        expect(user.errors[:password]).to be_present
      end

      it '7文字のパスワードは無効（8文字未満）' do
        user = build(:user, password: 'a' * 7)
        expect(user).not_to be_valid
        expect(user.errors[:password]).to be_present
      end

      it '129文字のパスワードは無効（128文字超）' do
        user = build(:user, password: 'a' * 129)
        expect(user).not_to be_valid
        expect(user.errors[:password]).to be_present
      end
    end
  end

  # ========================================
  # バリデーション: ユーザー名
  # ========================================
  describe 'バリデーション: ユーザー名' do
    it 'ユーザー名が空の場合は無効' do
      user = build(:user, username: '')
      expect(user).not_to be_valid
      expect(user.errors[:username]).to be_present
    end

    it '50文字のユーザー名は有効' do
      user = build(:user, username: 'a' * 50)
      expect(user).to be_valid
    end

    it '51文字のユーザー名は無効' do
      user = build(:user, username: 'a' * 51)
      expect(user).not_to be_valid
      expect(user.errors[:username]).to be_present
    end

    it '同じユーザー名は使用不可（一意性）' do
      create(:user, username: 'takenname')
      user = build(:user, username: 'takenname')
      expect(user).not_to be_valid
      expect(user.errors[:username]).to be_present
    end
  end

  # ========================================
  # パスワードハッシュ化
  # ========================================
  describe 'パスワードハッシュ化（Requirement 1.6）' do
    it 'has_secure_passwordでpassword_digestが生成される' do
      user = create(:user, password: 'secure_password', password_confirmation: 'secure_password')
      expect(user.password_digest).to be_present
    end

    it 'password_digestは元のパスワードと一致しない' do
      plain_password = 'mypassword123'
      user = create(:user, password: plain_password, password_confirmation: plain_password)
      expect(user.password_digest).not_to eq(plain_password)
    end

    it 'password_digestはbcryptのハッシュ形式（$2a$ または $2b$ で始まる）' do
      user = create(:user, password: 'testpassword', password_confirmation: 'testpassword')
      expect(user.password_digest).to match(/\A\$2[ab]\$/)
    end

    it '正しいパスワードで authenticate が成功する' do
      user = create(:user, password: 'correct_password', password_confirmation: 'correct_password')
      expect(user.authenticate('correct_password')).to eq(user)
    end

    it '誤ったパスワードで authenticate が失敗する' do
      user = create(:user, password: 'correct_password', password_confirmation: 'correct_password')
      expect(user.authenticate('wrong_password')).to be_falsey
    end
  end
end
