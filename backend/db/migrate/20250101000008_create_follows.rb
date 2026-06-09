class CreateFollows < ActiveRecord::Migration[7.2]
  def change
    create_table :follows do |t|
      t.bigint :follower_id, null: false
      t.bigint :followed_id, null: false

      t.datetime :created_at, null: false
    end

    add_foreign_key :follows, :users, column: :follower_id
    add_foreign_key :follows, :users, column: :followed_id

    add_index :follows, %i[follower_id followed_id], unique: true, name: 'idx_follows_follower_followed'
    add_index :follows, :followed_id,                              name: 'idx_follows_followed_id'
    add_index :follows, %i[follower_id created_at],                name: 'idx_follows_follower_created'
    add_index :follows, %i[followed_id created_at],                name: 'idx_follows_followed_created'
  end
end
