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

require 'test_helper'

class TaggingTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
