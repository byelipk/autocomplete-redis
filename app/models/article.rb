# == Schema Information
#
# Table name: articles
#
#  id             :integer          not null, primary key
#  headline       :string(255)
#  lead_paragraph :string(255)
#  pubdate        :datetime
#  word_count     :integer
#  created_at     :datetime
#  updated_at     :datetime
#

class Article < ActiveRecord::Base
  has_many :taggings
  has_many :keywords, through: :taggings, source: :keyword
end
