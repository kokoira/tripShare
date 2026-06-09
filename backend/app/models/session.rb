class Session < ApplicationRecord
  belongs_to :user

  validates :session_token, presence: true, uniqueness: true
  validates :expires_at,    presence: true

  # 有効期限チェック
  def expired?
    expires_at < Time.current
  end

  # セッショントークンを生成して保存
  def self.create_for_user(user)
    create!(
      user:          user,
      session_token: SecureRandom.urlsafe_base64(32),
      expires_at:    24.hours.from_now,
    )
  end
end
