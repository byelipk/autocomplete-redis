/**
  This mixin adds support for highlighting text in prompts/replies a user reads
  or in a new reply/prompt a user creates. It is normally mixed into views
  which must implement this functionality.

  It is to be used in conjunction with the AutocompleteRedis.Textable mixin which should
  be included into the view's controller.

  The including view might wish to override the .selectText() function and pass
  in a callback to controller.selectText({}, callback) in order to customize the
  behavior of the controller. The callback must be defined as .handleSelectedText().
  You have the option of defining an action called handleSelectedText(). This is
  preferable to the callback method.

  DOM elements that need to be selectable must have a class of 'discoverable'
  plus the following data attributes:

      data-discoverable-id   - values are either 'new' or the id of the resource
      data-discoverable-type - values are either 'blankslate', 'prompt', or 'reply'

  Example:

    <p class="discoverable" data-discoverable-id="bs-step-1" data-discoverable-type="blankslate">
      Here's some text you wish the user to be able to highlight
    </p>



  @class Selectable
  @extends Ember.Mixin
  @namespace AutocompleteRedis
  @module AutocompleteRedis
**/

AutocompleteRedis.Selectable = Ember.Mixin.create({
  // Default Properties
  isMouseDown: false,
  isTouchInProgress: false,

  /**
    Determines how to display to the user that a selection was made.
    (i.e. popup)
  **/
  watching: Ember.computed.alias('controller.watching'),
  fullBuffer: Em.computed.notEmpty('controller.buffer'),
  canDisplay: Ember.computed.alias('controller.displayable'),
  visible: Ember.computed.and('fullBuffer', 'canDisplay'),

  /**
    Sets the `fullBuffer` property on the controller currently being watched.
  **/
  toggleWatching: function() {
    if (!this.get('watching')) return ;

    this.get('watching').setProperties({
      fullBuffer: this.get('fullBuffer'),
      buffer: this.get('controller.buffer')
    });
  }.observes('fullBuffer'),

  /**
    We want to make sure that a click event on elements with
    these classes does not deselect the text and empty out the buffer.
  **/
  popup: '.discovery-button',
  enqueuer: '.btn-discovery',

  /**
    Text only within an element with this class can be selected.
    This can be overridden in the including controller.
  **/
  selector: '.discoverable',

  // Hooks
  didInsertElement: function() {
    var controller = this.get('controller'),
        view = this;

    $(document)
      .on("mousedown.discovery-button", function(e) {
        view.set('isMouseDown', true);

        var $target = $(e.target);

        // we don't want to deselect when we click on buttons that use it
        if ($target.closest(view.get('popup')).length === 1 ||
            $target.closest(view.get('enqueuer')).length === 1) {
          return ;
        }

        // deselects only when the user left click
        // (allows anyone to `extend` their selection using shift+click)
        if (e.which === 1 && !e.shiftKey) controller.deselectText();
      })
      .on('mouseup.discovery-button', function(e) {
        view.selectText(e.target, controller);
        view.set('isMouseDown', false);
      })
      .on('touchstart.discovery-button', function(){
        view.set('isTouchInProgress', true);
      })
      .on('touchend.discovery-button', function(){
        view.set('isTouchInProgress', false);
      })
      .on('selectionchange', function() {
        // there is no need to handle this event when the mouse is down
        // or if there a touch in progress
        if (view.get('isMouseDown') || view.get('isTouchInProgress')) return;
        // `selection.anchorNode` is used as a target
        view.selectText(window.getSelection().anchorNode, controller);
      });
  },

  willDestroyElement: function() {
    // Reset controller's watching property
    this.get('controller').set('watching', null);

    // Turn off event handlers
    $(document)
      .off("mousedown.discovery-button")
      .off("mouseup.discovery-button")
      .off("touchstart.discovery-button")
      .off("touchend.discovery-button")
      .off("selectionchange");
  },


  // Functions
  selectText: function(target, controller) {
    var $target, selector, action_or_callback,
        discoverable, c, options;

    $target  = $(target);
    selector = this.get('selector');

    // retrieve the reply or prompt id from the DOM
    discoverable = $target.closest('.discoverable').length > 0 ?
                  $target.closest('.discoverable') : $target.closest('.pending-discoverable');

    if (!discoverable) return ;

    if (discoverable.data('discoverable-id') && discoverable.data('discoverable-type')) {
      options = {
        id: discoverable.data('discoverable-id'),
        type: discoverable.data('discoverable-type')
      };

      // Setup options
      c = controller.watchParentControllerFor(options.id);
      options = jQuery.extend(options, c.getProperties('selector', 'showPopup', 'selectableHandler', 'shortCircuitPopup', 'discoverPending', 'bubble'));

      if (options.delegate) {
        // Set a reference to AutocompleteRedis.Textable on the controller
        // c.set('textable', this.get('controller'));
      }

      controller.set('discoverableId', options.id);
      controller.set('discoverableType', options.type);
      controller.set('selectableHandler', options.selectableHandler);
      controller.selectText(options);
    }
  }
})
