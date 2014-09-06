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

require 'test_helper'

class ArticlesTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
