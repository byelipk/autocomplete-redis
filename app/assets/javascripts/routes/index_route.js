// For more information see: http://emberjs.com/guides/routing/

AutocompleteRedis.IndexRoute = Ember.Route.extend({
  model: function() {
    return this.store.find('article');
  },

  /**
  *  Use the after model hook to load has many associations
  *  and still take advantage of the loading route!
  */
  afterModel: function(model, transition, params) {
    return Ember.RSVP.all(model.getEach("keywords"));
  },

  actions: {
    loading: function(transition, originRoute) {
      // displayLoadingSpinner();

      // substate implementation when returning `true`
      return true;
    }
  }
});
