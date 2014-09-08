// for more details see: http://emberjs.com/guides/controllers/

AutocompleteRedis.DiscoveryButtonController = Ember.Controller.extend(
  AutocompleteRedis.Textable, {

    discoveryList: function() {
      return AutocompleteRedis.DiscoveryList.all();
    }.property()
});
