# == Schema Information
#
# Table name: taggings
#
#  id         :integer          not null, primary key
#  article_id :integer
#  keyword_id :integer
#  created_at :datetime
#  updated_at :datetime
#

class Tagging < ActiveRecord::Base
  belongs_to :article
  belongs_to :keyword, counter_cache: true

  validates :article_id, presence: true
  validates :keyword_id, presence: true
end
