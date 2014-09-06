// for more details see: http://emberjs.com/guides/models/defining-models/

AutocompleteRedis.Keyword = DS.Model.extend({
  name:   DS.attr("string"),
  value:  DS.attr("string"),

  articles: DS.hasMany("article", {
    async: true
  })
});
