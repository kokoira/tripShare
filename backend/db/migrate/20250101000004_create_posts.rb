class CreatePosts < ActiveRecord::Migration[7.2]
  def change
    create_table :posts do |t|
      t.references :user,           null: false, foreign_key: true, index: false
      t.text       :body,           null: false
      t.integer    :comments_count, null: false, default: 0
      t.integer    :likes_count,    null: false, default: 0

      t.timestamps
    end

    add_index :posts, :user_id,    name: 'idx_posts_user_id'
    add_index :posts, :created_at, name: 'idx_posts_created_at'
  end
end
