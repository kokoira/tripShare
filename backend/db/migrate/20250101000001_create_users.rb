class CreateUsers < ActiveRecord::Migration[7.2]
  def change
    create_table :users do |t|
      t.string :email,           null: false
      t.string :username,        null: false
      t.string :password_digest, null: false
      t.string :avatar_key
      t.integer :following_count, null: false, default: 0
      t.integer :followers_count, null: false, default: 0

      t.timestamps
    end

    # ユニークインデックス（email, username）
    add_index :users, :email,    unique: true, name: 'idx_users_email'
    add_index :users, :username, unique: true, name: 'idx_users_username'
  end
end
