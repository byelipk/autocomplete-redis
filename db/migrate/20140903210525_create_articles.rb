class CreateArticles < ActiveRecord::Migration
  def change
    create_table :articles do |t|
      t.string :headline
      t.string :lead_paragraph
      t.datetime :pubdate
      t.integer :word_count

      t.timestamps
    end
  end
end
