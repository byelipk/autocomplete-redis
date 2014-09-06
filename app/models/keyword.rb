# == Schema Information
#
# Table name: keywords
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  value      :string(255)
#  count      :integer
#  created_at :datetime
#  updated_at :datetime
#

class Keyword < ActiveRecord::Base
  has_many :taggings
  has_many :articles, through: :taggings, source: :article
end
