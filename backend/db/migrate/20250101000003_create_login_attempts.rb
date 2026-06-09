class CreateLoginAttempts < ActiveRecord::Migration[7.2]
  def change
    create_table :login_attempts do |t|
      t.string   :email,        null: false
      t.datetime :attempted_at, null: false
      t.boolean  :success,      null: false
    end

    add_index :login_attempts, %i[email attempted_at], name: 'idx_login_attempts_email_time'
  end
end
