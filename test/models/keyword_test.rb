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

require 'test_helper'

class KeywordsTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
