class LoginAttempt < ApplicationRecord
  validates :email,        presence: true
  validates :attempted_at, presence: true
  validates :success,      inclusion: { in: [true, false] }

  # 指定時間内の失敗回数を取得
  def self.failure_count_within(email, duration)
    where(email: email.downcase, success: false)
      .where('attempted_at >= ?', duration.ago)
      .count
  end

  # アカウントロック状態チェック（5分間に10回失敗 → 30分ロック）
  def self.locked?(email)
    failure_count_within(email, 5.minutes) >= 10
  end
end
