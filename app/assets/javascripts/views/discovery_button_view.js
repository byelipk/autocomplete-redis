// for more details see: http://emberjs.com/guides/views/

AutocompleteRedis.DiscoveryButtonView = Ember.View.extend(
  AutocompleteRedis.Selectable, {

  // Properties
  layoutName: 'layouts/discovery_popup',
  template: 'discovery_button',
  classNames: ['discovery-button'],
  classNameBindings: ['visible']
});
