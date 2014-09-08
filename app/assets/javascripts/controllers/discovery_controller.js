// for more details see: http://emberjs.com/guides/controllers/

AutocompleteRedis.DiscoveryController = Ember.Controller.extend({
  actions: {
    reveal: function() {
      this.toggleProperty("isRevealed");
      alert("Show it!");
    }
  }
});
