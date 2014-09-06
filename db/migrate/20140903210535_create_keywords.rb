class CreateKeywords < ActiveRecord::Migration
  def change
    create_table :keywords do |t|
      t.string :name
      t.string :value
      t.integer :taggings_count

      t.timestamps
    end
  end
end
