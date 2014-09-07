// for more details see: http://emberjs.com/guides/controllers/

Kalanso.DiscoveryButtonController = Ember.Controller.extend(
  Kalanso.Textable, {

    discoveryList: function() {
      return Kalanso.DiscoveryList.all();
    }.property(),

});
