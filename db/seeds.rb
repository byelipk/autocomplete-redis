# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
require 'net/http'

API_KEY = "abc6c740f1cfbcd4bea0411df4bc8a74:10:69661191"

["arts", "sports"].each do |category|
(0..2).each do |i|
    # Call api
    uri = URI("http://api.nytimes.com/svc/search/v2/articlesearch.json?fq=news_desk:(#{category})&api-key=#{API_KEY}&page=#{i}")
    json = JSON.parse(Net::HTTP.get(uri))
    data = json["response"]["docs"]

    data.each do |doc|
      article = Article.find_or_create_by({
        headline:       doc["headline"]["main"],
        lead_paragraph: doc["lead_paragraph"],
        pubdate:        doc["pub_date"],
        word_count:     doc["word_count"].to_i
      })

      doc["keywords"].each do |keyword|
        keyword = Keyword.find_or_create_by({
          name: keyword["name"],
          value: keyword["value"]
        })

        article.taggings.create(keyword_id: keyword.id)
      end
    end
  end
end
