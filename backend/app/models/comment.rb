class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :post

  validates :body,
            presence: true,
            length: { minimum: 1, maximum: 200 }

  validate :body_not_blank

  private

  def body_not_blank
    errors.add(:body, '空白のみのコメントは保存できません') if body.present? && body.strip.blank?
  end
end
