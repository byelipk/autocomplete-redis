class CreateTaggings < ActiveRecord::Migration
  def change
    create_table :taggings do |t|
      t.integer :article_id
      t.integer :keyword_id

      t.timestamps
    end
  end
end
