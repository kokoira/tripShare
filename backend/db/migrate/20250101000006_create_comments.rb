class CreateComments < ActiveRecord::Migration[7.2]
  def change
    create_table :comments do |t|
      t.references :post, null: false, foreign_key: true, index: false
      t.references :user, null: false, foreign_key: true, index: false
      t.text       :body, null: false

      t.timestamps
    end

    add_index :comments, %i[post_id created_at], name: 'idx_comments_post_id_created'
    add_index :comments, :user_id,               name: 'idx_comments_user_id'
  end
end
