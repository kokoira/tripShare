class Comment < ApplicationRecord
  belongs_to :post, counter_cache: true
  belongs_to :user

  validates :body,
            presence: true,
            length:   { maximum: 200 }

  validate :body_not_only_whitespace

  private

  def body_not_only_whitespace
    errors.add(:body, '空白のみのコメントは保存できません') if body.present? && body.strip.blank?
  end
end
