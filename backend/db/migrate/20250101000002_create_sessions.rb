class CreateSessions < ActiveRecord::Migration[7.2]
  def change
    create_table :sessions do |t|
      t.references :user,          null: false, foreign_key: true, index: false
      t.string     :session_token, null: false
      t.datetime   :expires_at,    null: false

      t.datetime :created_at, null: false
    end

    add_index :sessions, :session_token, unique: true, name: 'idx_sessions_token'
    add_index :sessions, :user_id,                     name: 'idx_sessions_user_id'
    add_index :sessions, :expires_at,                  name: 'idx_sessions_expires_at'
  end
end
