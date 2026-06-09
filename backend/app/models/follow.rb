class Follow < ApplicationRecord
  belongs_to :follower, class_name: 'User', inverse_of: :active_follows
  belongs_to :followed, class_name: 'User', inverse_of: :passive_follows

  validates :follower_id,
            uniqueness: { scope: :followed_id, message: '既にフォロー済みです' }

  validate :not_self_follow

  private

  def not_self_follow
    errors.add(:follower_id, '自分自身はフォローできません') if follower_id == followed_id
  end
end
