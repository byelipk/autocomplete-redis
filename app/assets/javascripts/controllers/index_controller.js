// for more details see: http://emberjs.com/guides/controllers/

AutocompleteRedis.IndexController = Ember.ArrayController.extend({

  searchText: null,

  filteredResults: function() {
    var searchText, regex, searchResults;

    /**
    *  Grab search text
    */
    searchText = this.get('searchText');

    /**
    *  Return the array controller if there is no search text
    */
    if (!searchText) { return this; }

    /**
    *  Tell the controller we're performing a search
    */
    this.set('isSearching', true);

    /**
    *  Create a new regex with the search text
    */
    regex = new RegExp(searchText, 'i');

    /**
    *  Filter all the articles first based on the headline.
    *  If there was no match then filter based on the keywords.
    */
    searchResults = this.filter(function(article) {
      // Search over headline first
      if (article.get('headline').match(regex)) { return true; }

      // Search through keywords
      keywordMatches = article.get('keywords').filter(function(keyword) {
        return keyword.get('value').match(regex);
      });

      // Return an article if there is a matching keyword
      if (keywordMatches.get('length') > 0) { return true; }
    });

    /**
    *  Tell the controller the search has finished
    */
    this.set('isSearching', false);

    /**
    * Return the results
    */
    return searchResults;

  }.property('searchText', 'model.@each')

});
