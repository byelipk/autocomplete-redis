/**
    // AutocompleteRedis.Textable API for controllers that need an ability to handle text selection //

      NOTE: AutocompleteRedis.Textable is designed to work with a view that includes AutocompleteRedis.Selectable


      You can implement these properties on your controller:

      If you want to use a custom callback after the text has been selected,
      implement the `selectableHandler` and assign it as a string to a
      controller action.

     @ selectableHandler: 'handleSelectedText',

      If you want to invoke the handler and short circuit the popup, set to true. Otherwise
      any custom handler will be invoked after the popup is displayed.

    @ shortCircuitPopup: true,

      If you want a popup to be hidden once the text is selected, set `showPopup`
      to false. `showPopup` defaults to true.

    @ showPopup: false,

      If you want a popup to discover response actions in a body of text which
      you are currently editing, set this flag to true. At this time you must
      mixin AutocompleteRedis.ModalDiscoverable which handles making pending discoveries.

      When this flag is set to true, the default selector becomes `.pending-discoverable`.

    @ discoverPending: true

  @class Selectable
  @extends Ember.Mixin
  @namespace AutocompleteRedis
  @module AutocompleteRedis
**/

AutocompleteRedis.Textable = Ember.Mixin.create({
  needs: ['prompt', 'promptIndex', 'modalNewReply', 'modalNewPrompt', 'factBin'],

  // Properties
  buffer: null,
  displayable: false,

  // The current discoverable controller
  watching: null,

  // Reset all controller state when the buffer is empty
  bufferChanged: function() {
    if (this.get('buffer') === '') {
      this.set('factBin', null);
      this.set('discoverable', null);
      this.set('watching', null);
    }
  }.observes('buffer'),

  // Functions
  selectText: function(options) {
    var id, type, selector, popup,
        selection, range,
        cloned, $ancestor, selectedText,
        markerOffset, position, $target, sel;

    if (!AutocompleteRedis.CurrentUser) return;

    // Set default properties as if we were making a discovery on a reply
    DEFAULTS = {
      id:       'new',
      type:     'reply',
      popup:    '.discovery-button',
      selector: options.discoverPending ? '.pending-discoverable' : '.discoverable',
      showPopup: true,
      shortCircuitPopup: false,
      discoverPending: false
    }

    id         = options.id        || DEFAULTS.id;
    type       = options.type      || DEFAULTS.type;
    popup      = options.popup     || DEFAULTS.popup;
    selector   = options.selector  || DEFAULTS.selector;

    showPopup          = options.hasOwnProperty('showPopup') ? options.showPopup : DEFAULTS.showPopup;
    shortCircuitPopup  = options.hasOwnProperty('shortCircuitPopup') ? options.shortCircuitPopup : DEFAULTS.shortCircuitPopup;
    discoverPending    = options.hasOwnProperty('discoverPending') ? options.discoverPending : DEFAULTS.discoverPending;
    action_or_callback = this.get('selectableHandler');


    // Create a selection object
    selection = window.getSelection();

    // Return if there was no selection made
    if ((selection.rangeCount === 0) || (selection.type == 'Caret')) return;

    // retrieve the selected range
    range     = selection.getRangeAt(0);
    cloned    = range.cloneRange();
    $ancestor = $(range.commonAncestorContainer);

    if ($ancestor.closest(selector).length > 0) {
      selectedText = AutocompleteRedis.Utilities.selectedText();
    } else {
      this.set('buffer', '');
      return;
    }

    switch (type) {
      case 'blankslate':

        break;

      case 'prompt':
        // break if we're creating a new prompt
        if (id === 'new-prompt') { break; }

        this.set('discoverable', this.get('controllers.prompt.model'));
        this.set('factBin', this.get('controllers.factBin.model'));

        break;

      case 'reply':
        if (id === 'new-reply') { break; }

        this.set('discoverable', this.get('controllers.prompt.replies')
            .findBy('id', id.substring(9)));
        this.set('factBin', this.get('controllers.factBin.model'));

        break;

      default:
         throw "Invalid selection type";
         return ;
    }

    if (this.get('buffer') === selectedText) return;

    this.set('buffer', selectedText);

    /**
      Prepare the popup to be displayed and positioned
    **/
    if (showPopup) {
      // collapse the range at the beginning of the selection
      // (ie. moves the end point to the start point)
      range.collapse(true);

      // create a marker element
      // containing a single invisible character
      // and insert it at the beginning of our selection range
      markerElement = document.createElement("span");
      markerElement.appendChild(document.createTextNode("\ufeff"));
      range.insertNode(markerElement);

      // Determine
      markerOffset = $(markerElement).offset();
      $popup       = $(popup);
      position     = this.getPosition(markerOffset, $popup);

      // remove the marker from the parent node (usually a <p></p>)
      markerElement.parentNode.removeChild(markerElement);

      // work around Chrome that would sometimes lose the selection
      sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(cloned);
    }

    // Do we need to do anything to the controller we are watching?

    // Use a custom callback if available or send an action defined in the controllers actions hash
    // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call
    if (action_or_callback && typeof action_or_callback === 'string' && shortCircuitPopup) {
      this.get('watching').send(action_or_callback, this.get('buffer'));
      return;
    }

    if (showPopup) {
      // Schedule the Ember run loop to render the popup
      Em.run.schedule('afterRender', function() {
        $popup.offset(position);
      });
    }

    /**
      Set the displayable flag which communicates with the view about
      whether or not the popup can be visually displayed upon a valid selection.
    **/
    this.set('displayable', showPopup);

  },

  deselectText: function() {
    // clear selected text
    window.getSelection().removeAllRanges();
    // clean up the buffer
    this.setProperties({
      buffer: '',
      fullBuffer: false,
      displayable: false
    });
  },

  getPosition: function(markerOffset, $target) {
    var position = {
      'top': null,
      'left': null
    };

    var $w = $(window),
        windowWidth = $w.width();

    // Check high or low
    if ((markerOffset.top - $target.height() - $w.scrollTop()) > 10) {
      position.top = markerOffset.top - $target.outerHeight() - 5;

    } else {
      position.top = markerOffset.top + 25; // line-height: 20px
    }

    // Check left or right
    if ((windowWidth - markerOffset.left) < $target.width()) {
      /* Extra small devices (phones, less than 768px) */
      /* Small devices (tablets, 768px and up) */
      /* Medium devices (desktops, 992px and up) */
      /* Large devices (large desktops, 1200px and up) */

      if (windowWidth <= 400) {
        // We want to center the element

        position.left = (windowWidth - $target.width()) / 2;

      } else {
        // We want to align the element on the left

        // find difference between window width and marker position
        var diffWinMar = windowWidth - markerOffset.left;

        // find difference between amount of button onscreen vs offscreen
        var diffOnOff = $target.width() - diffWinMar;

        // reduce the marker offset by that amount and reduce by an additional 20px.
        position.left = markerOffset.left - diffOnOff - 20;
      }

    } else {

      position.left = markerOffset.left;

    }

    return position;
  },

  // Actions
  actions: {
    save: function(type, value) {
      // Initialize variables
      var controller    = this;
      var factBin       = this.get('controllers.prompt.factBin'),
          raw           = this.get('buffer').trim(),

          // Need to pass in currentUser.content to get the actual user object
          user           = this.get('session.currentUser.user.content'),
          discoverable   = this.get('discoverable');

      if (raw.length > 255) {
        throw "Returning - too long";
        return;
      }


      if (!discoverable) {
        throw "Returning - no disc";
        return;
      }

      // Create record
      var ra = this.store.createRecord('responseAction', {
        raw: raw,
        raType: type,
        raValue: value,
        user: user,
        factBin: factBin,
        discoverable: discoverable
      });


      ra.save().then(function(success) {
        factBin.get('responseActions').then(function(array) {
          array.unshiftObject(success);
        });

        controller.deselectText();
        discoverable.get('descendantResponseActions').unshiftObject(success);

      }, function(failure) {

        throw failure;
        return;

      });
    },

    dismiss: function() {
      this.deselectText();
    },

    choose: function(type, value) {
      // Provide the watching controller the text, the id of the containing
      // element of the selected text, type and value of chosen discovery
      this.get('watching').send('handleDiscoveredText',
                                  this.get('buffer'),
                                  this.get('discoverableId'),
                                  type,
                                  value);

      // hide popup
      this.deselectText();
    }
  },

  watchParentControllerFor: function(id) {
    var controller;

    if (id.match(/ks-prompt/)) {
      // We're making a discovery inside a prompt or reply

      controller = this.get('controllers.prompt');

    } else if (id.match(/ks-reply/)) {

      controller = this.get('controllers.promptIndex');

    } else {
      switch (id.substring(0, 3)) {
        case 'new':
          var suffix = "modal" + id.camelize().capitalize();
          controller = this.get('controllers.' + suffix);

          break;

        default:
          throw "Unrecognized controller: " + id + ". Make sure you add the necessary controller to the `needs` array."
          return;
      }
    }


    // If there is a controller set a reference to it so we can use the callback later
    // and return the controller
    this.set('watching', controller) ;
    return controller;
  }
});
