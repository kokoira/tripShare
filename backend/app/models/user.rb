class User < ApplicationRecord
  # パスワードハッシュ化（bcrypt）
  has_secure_password

  # アソシエーション（タスク 1.3 でマイグレーション作成後に有効化）
  # has_many :sessions, dependent: :destroy
  # has_many :posts, dependent: :destroy
  # has_many :comments, dependent: :destroy
  # has_many :likes, dependent: :destroy
  # has_many :follows_as_follower, class_name: 'Follow', foreign_key: :follower_id, dependent: :destroy
  # has_many :follows_as_followed, class_name: 'Follow', foreign_key: :followed_id, dependent: :destroy
  # has_many :following, through: :follows_as_follower, source: :followed
  # has_many :followers, through: :follows_as_followed, source: :follower

  # バリデーション
  validates :email,
            presence: true,
            uniqueness: { case_sensitive: false },
            format: { with: URI::MailTo::EMAIL_REGEXP }

  validates :username,
            presence: true,
            uniqueness: true,
            length: { maximum: 255 }

  validates :password,
            length: { minimum: 8, maximum: 128 },
            if: :password_required?

  # メールアドレスを小文字に正規化
  before_validation :normalize_email

  private

  def normalize_email
    self.email = email.downcase.strip if email.present?
  end

  def password_required?
    new_record? || password.present?
  end
end
