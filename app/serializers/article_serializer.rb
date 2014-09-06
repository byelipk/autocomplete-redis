class ArticleSerializer < ActiveModel::Serializer
  attributes :id, :headline, :lead_paragraph, :pubdate, :word_count

  has_many :keywords, embed: :ids
end
