// for more details see: http://emberjs.com/guides/models/defining-models/

AutocompleteRedis.Article = DS.Model.extend({
  headline:       DS.attr("string"),
  leadParagraph:  DS.attr("string"),
  pubdate:        DS.attr("string"),
  wordCount:      DS.attr("date"),

  keywords: DS.hasMany("keyword", {
    async: true
  })
});
