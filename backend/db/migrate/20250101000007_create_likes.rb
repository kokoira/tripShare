class CreateLikes < ActiveRecord::Migration[7.2]
  def change
    create_table :likes do |t|
      t.references :post, null: false, foreign_key: true, index: false
      t.references :user, null: false, foreign_key: true, index: false

      t.datetime :created_at, null: false
    end

    add_index :likes, %i[post_id user_id], unique: true, name: 'idx_likes_post_user'
    add_index :likes, :user_id,                          name: 'idx_likes_user_id'
  end
end
