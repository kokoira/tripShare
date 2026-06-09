class User < ApplicationRecord
  # パスワードハッシュ化（bcrypt）
  has_secure_password

  # アソシエーション
  has_many :sessions,     dependent: :destroy
  has_many :posts,        dependent: :destroy
  has_many :comments,     dependent: :destroy
  has_many :likes,        dependent: :destroy
  has_many :post_images,  through: :posts

  has_many :active_follows,
           class_name:  'Follow',
           foreign_key: :follower_id,
           dependent:   :destroy,
           inverse_of:  :follower

  has_many :passive_follows,
           class_name:  'Follow',
           foreign_key: :followed_id,
           dependent:   :destroy,
           inverse_of:  :followed

  has_many :following, through: :active_follows,  source: :followed
  has_many :followers, through: :passive_follows, source: :follower

  # バリデーション
  validates :email,
            presence:   true,
            uniqueness: { case_sensitive: false },
            format:     { with: URI::MailTo::EMAIL_REGEXP }

  validates :username,
            presence:   true,
            uniqueness: true,
            length:     { maximum: 50 }

  validates :password,
            length: { minimum: 8, maximum: 128 },
            if:     :password_required?

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
