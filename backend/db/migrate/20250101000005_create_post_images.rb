class CreatePostImages < ActiveRecord::Migration[7.2]
  def change
    create_table :post_images do |t|
      t.references :post,          null: false, foreign_key: true, index: false
      t.string     :image_key,     null: false
      t.string     :thumbnail_key
      t.integer    :position,      null: false

      t.datetime :created_at, null: false
    end

    add_index :post_images, :post_id, name: 'idx_post_images_post_id'
  end
end
