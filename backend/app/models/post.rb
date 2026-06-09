class Post < ApplicationRecord
  belongs_to :user
  has_many   :post_images, dependent: :destroy
  has_many   :comments,    dependent: :destroy
  has_many   :likes,       dependent: :destroy

  validates :body,
            presence: true,
            length:   { maximum: 280 }

  validate :body_not_only_whitespace

  private

  def body_not_only_whitespace
    errors.add(:body, '空白のみの投稿は保存できません') if body.present? && body.strip.blank?
  end
end
