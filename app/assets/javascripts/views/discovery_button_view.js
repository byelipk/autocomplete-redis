// for more details see: http://emberjs.com/guides/views/

Kalanso.DiscoveryButtonView = Ember.View.extend(
  Kalanso.Selectable, {

  // Properties
  layoutName: 'layouts/discovery_popup',
  template: 'discovery_button',
  classNames: ['discovery-button'],
  classNameBindings: ['visible']
});
