class PostImage < ApplicationRecord
  belongs_to :post

  validates :image_key, presence: true
  validates :position,
            presence:     true,
            numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
