(function(){;
var define, requireModule, require, requirejs;

(function() {

  var _isArray;
  if (!Array.isArray) {
    _isArray = function (x) {
      return Object.prototype.toString.call(x) === "[object Array]";
    };
  } else {
    _isArray = Array.isArray;
  }

  var registry = {}, seen = {}, state = {};
  var FAILED = false;

  define = function(name, deps, callback) {

    if (!_isArray(deps)) {
      callback = deps;
      deps     =  [];
    }

    registry[name] = {
      deps: deps,
      callback: callback
    };
  };

  function reify(deps, name, seen) {
    var length = deps.length;
    var reified = new Array(length);
    var dep;
    var exports;

    for (var i = 0, l = length; i < l; i++) {
      dep = deps[i];
      if (dep === 'exports') {
        exports = reified[i] = seen;
      } else {
        reified[i] = require(resolve(dep, name));
      }
    }

    return {
      deps: reified,
      exports: exports
    };
  }

  requirejs = require = requireModule = function(name) {
    if (state[name] !== FAILED &&
        seen.hasOwnProperty(name)) {
      return seen[name];
    }

    if (!registry[name]) {
      throw new Error('Could not find module ' + name);
    }

    var mod = registry[name];
    var reified;
    var module;
    var loaded = false;

    seen[name] = { }; // placeholder for run-time cycles

    try {
      reified = reify(mod.deps, name, seen[name]);
      module = mod.callback.apply(this, reified.deps);
      loaded = true;
    } finally {
      if (!loaded) {
        state[name] = FAILED;
      }
    }

    return reified.exports ? seen[name] : (seen[name] = module);
  };

  function resolve(child, name) {
    if (child.charAt(0) !== '.') { return child; }

    var parts = child.split('/');
    var nameParts = name.split('/');
    var parentBase;

    if (nameParts.length === 1) {
      parentBase = nameParts;
    } else {
      parentBase = nameParts.slice(0, -1);
    }

    for (var i = 0, l = parts.length; i < l; i++) {
      var part = parts[i];

      if (part === '..') { parentBase.pop(); }
      else if (part === '.') { continue; }
      else { parentBase.push(part); }
    }

    return parentBase.join('/');
  }

  requirejs.entries = requirejs._eak_seen = registry;
  requirejs.clear = function(){
    requirejs.entries = requirejs._eak_seen = registry = {};
    seen = state = {};
  };
})();

;define("vendor/liquid-fire",
  ["vendor/liquid-fire/transitions","vendor/liquid-fire/animate","vendor/liquid-fire/promise","vendor/liquid-fire/initialize","vendor/liquid-fire/mutation-observer","vendor/liquid-fire/curry","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __exports__) {
    "use strict";
    var Transitions = __dependency1__["default"];
    var animate = __dependency2__.animate;
    var stop = __dependency2__.stop;
    var isAnimating = __dependency2__.isAnimating;
    var timeSpent = __dependency2__.timeSpent;
    var timeRemaining = __dependency2__.timeRemaining;
    var finish = __dependency2__.finish;
    var Promise = __dependency3__["default"];
    var initialize = __dependency4__["default"];
    var MutationObserver = __dependency5__["default"];
    var curryTransition = __dependency6__["default"];
    __exports__.Transitions = Transitions;
    __exports__.animate = animate;
    __exports__.stop = stop;
    __exports__.isAnimating = isAnimating;
    __exports__.timeSpent = timeSpent;
    __exports__.timeRemaining = timeRemaining;
    __exports__.finish = finish;
    __exports__.Promise = Promise;
    __exports__.initialize = initialize;
    __exports__.MutationObserver = MutationObserver;
    __exports__.curryTransition = curryTransition;
  });
;define("vendor/liquid-fire/transitions",
  ["vendor/liquid-fire/transition","vendor/liquid-fire/dsl","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Transition = __dependency1__["default"];
    var DSL = __dependency2__["default"];

    function Transitions() {
      this._map = {};
      this.map(function(){
        this.setDefault({duration: 250});
      });
    }

    Transitions.prototype = {

      activeCount: 0,

      runningTransitions: function() {
        return this.activeCount;
      },

      lookup: function(transitionName) {
        var handler = this.container.lookupFactory('transition:' + transitionName);
        if (!handler) {
          throw new Error("unknown transition name: " + transitionName);
        }
        return handler;
      },

      transitionFor: function(parentView, oldView, newContent, use) {
        var handler, args;
        // "use" matches any transition *except* the initial render
        if (use && oldView) {
          handler = this.lookup(use);
        } else {
          var key = this.match(parentView, oldView, newContent);
          if (key) {
            args = key.args;
            if (typeof(key.method) === 'function') {
              handler = key.method;
            } else {
              handler = this.lookup(key.method);
            }
          }
        }

        return new Transition(parentView, oldView, newContent, handler, args, this);
      },

      map: function(handler) {
        if (handler){
          handler.apply(new DSL(this));
        }
        return this;
      },

      register: function(routes, contexts, parent, action) {
        this._register(this._map, [routes.from, routes.to, parent, contexts.from, contexts.to], action);
      },

      _register: function(ctxt, remaining, payload) {
        var first = remaining[0];
        for (var i = 0; i < first.length; i++) {
          var elt = first[i];
          if (typeof(elt) === 'function') {
            if (!ctxt.__functions) {
              ctxt.__functions = [];
            }
            if (remaining.length === 1) {
              ctxt.__functions.push([elt, payload]);
            } else {
              var c = {};
              this._register(c, remaining.slice(1), payload);
              ctxt.__functions.push([elt, c]);
            }
          } else {
            if (remaining.length === 1) {
              ctxt[elt] = payload;
            } else {
              if (!ctxt[elt]) {
                ctxt[elt] = {};
              }
              this._register(ctxt[elt], remaining.slice(1), payload);
            }
          }
        }
      },

      _viewProperties: function(view, childProp) {
        if (view && childProp) {
          view = view.get(childProp);
        }

        if (!view) {
          return {};
        }

        return {
          route: view.get('renderedName'),
          context: view.get('liquidContext')
        };
      },

      _ancestorsRenderedName: function(view) {
        while (view && !view.get('renderedName')){
          view = view.get('_parentView');
        }
        if (view) {
          return view.get('renderedName');
        }
      },

      match: function(parentView, oldView, newContent) {
        var change = {
          leaving: this._viewProperties(oldView, 'currentView'),
          entering: this._viewProperties(newContent),
          parentView: parentView
        };

        // If the old/new views themselves are not part of a route
        // transition, provide route properties from our surrounding
        // context.
        if (oldView && !change.leaving.route) {
          change.leaving.route = this._ancestorsRenderedName(parentView);
        }
        if (newContent && !change.entering.route) {
          change.entering.route = change.leaving.route || this._ancestorsRenderedName(parentView);
        }

        return this._match(change, this._map, [
          change.leaving.route,
          change.entering.route,
          parentView,
          change.leaving.context,
          change.entering.context
        ]);
      },

      _match: function(change, ctxt, queue) {
        var index = 0,
            first = queue[0],
            rest = queue.slice(1),
            candidate, nextContext, answer,
            candidates = [first || DSL.EMPTY].concat(ctxt.__functions).concat(DSL.ANY);

        for (index = 0; index < candidates.length; index++) {
          candidate = candidates[index];
          if (!candidate) { continue; }
          if (typeof(candidate[0]) === 'function'){
            if (candidate[0].apply(first, this._predicateArgs(change, queue.length))) {
              nextContext = candidate[1];
            } else {
              nextContext = null;
            }
          } else {
            nextContext = ctxt[candidate];
          }
          if (nextContext) {
            if (rest.length === 0) {
              return nextContext;
            } else {
              answer = this._match(change, nextContext, rest);
              if (answer) {
                return answer;
              }
            }
          }
        }
      },

      _predicateArgs: function(change, remainingLevels) {
        var level = 5 - remainingLevels;
        switch (level) {
        case 0:
          return [change.entering.route];
        case 1:
          return [change.leaving.route];
        case 2:
          return [];
        case 3:
          return [change.entering.context];
        case 4:
          return [change.leaving.context];
        }
      },


    };


    Transitions.map = function(handler) {
      var t = new Transitions();
      t.map(handler);
      return t;
    };



    __exports__["default"] = Transitions;
  });
;define("vendor/liquid-fire/transition",
  ["vendor/liquid-fire/promise","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Promise = __dependency1__["default"];

    function Transition(parentView, oldView, newContent, animation, animationArgs, transitionMap) {
      this.parentView = parentView;
      this.oldView = oldView;
      this.newContent = newContent;
      this.animation = animation;
      this.animationArgs = animationArgs;
      this.transitionMap = transitionMap;
    }

    Transition.prototype = {
      run: function() {
        if (!this.animation) {
          this.maybeDestroyOldView();
          return this._insertNewView().then(revealView);
        }
        var self = this;
        self.transitionMap.activeCount += 1;
        return this._invokeAnimation().then(function(){
          self.maybeDestroyOldView();
        }, function(err){
          return self.cleanupAfterError().then(function(){
            throw err;
          });
        }).finally(function(){
          self.transitionMap.activeCount -= 1;
        });
      },

      _insertNewView: function() {
        if (this.inserted) {
          return this.inserted;
        }
        return this.inserted = this.parentView._pushNewView(this.newContent);
      },

      _invokeAnimation: function() {
        this.parentView.cacheSize();
        var self = this,
            animation = this.animation,
            inserter = function(){
              goAbsolute(self.oldView);
              return self._insertNewView().then(function(newView){
                if (!newView) { return; }
                newView.$().show();
                // Measure newView size before parentView sets an explicit size.
                var size = getSize(newView);
                self.parentView.adaptSize();
                goAbsolute(newView, size);
                return self.newView = newView;
              });
            },
            args = [this.oldView, inserter].concat(this.animationArgs);

        // The extra Promise means we will trap an exception thrown
        // immediately by the animation implementation.
        return new Promise(function(resolve, reject){
          animation.apply(self, args).then(resolve, reject);
        }).then(function(){
          if (!self.interruptedLate) {
            goStatic(self.newView);
            self.parentView.unlockSize();
          }
        });
      },

      maybeDestroyOldView: function() {
        if (!this.interruptedEarly && this.oldView) {
          this.oldView.destroy();
        }
      },

      // If the animation blew up, do what we can to leave the DOM in a
      // sane state before re-propagating the error.
      cleanupAfterError: function() {
        this.maybeDestroyOldView();
        return this._insertNewView().then(revealView);
      },

      interrupt: function(){
        // If we haven't yet inserted the new view, don't. And tell the
        // old view not to destroy when our animation stops, because the
        // next transition is going to take over and keep using it.
        if (!this.inserted) {
          this.inserted = Promise.cast(null);
          this.interruptedEarly = true;
        } else {
          this.interruptedLate = true;
        }
      },

      // Lets you compose your transitions out of other named transitions.
      lookup: function(transitionName) {
        return this.transitionMap.lookup(transitionName);
      }
    };

    function revealView(view) {
      var elt;
      if (view && (elt = view.$())) {
        elt.show().css({visibility: ''});
      }
    }

    function getSize(view) {
      var elt;
      if (view && (elt = view.$())) {
        return {
          width: elt.width(),
          height: elt.height()
        };
      }
    }

    function goAbsolute(view, size) {
      var elt;
      if (view && (elt = view.$())) {
        if (!size) {
          size = getSize(view);
        }
        elt.width(size.width);
        elt.height(size.height);
        elt.css({position: 'absolute'});
      }
    }

    function goStatic(view) {
      var elt;
      if (view && (elt = view.$())) {
        elt.css({width: '', height: '', position: ''});
      }
    }



    __exports__["default"] = Transition;
  });
;define("vendor/liquid-fire/promise",
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // Ember is already polyfilling Promise as needed, so just use that.
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.RSVP.Promise;
  });
;define("vendor/liquid-fire/dsl",
  ["ember","vendor/liquid-fire/animate","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var setDefaults = __dependency2__.setDefaults;

    function DSL(map) {
      this.map = map;
    }

    DSL.prototype = {
      setDefault: function(props) {
        setDefaults(props);
      },

      define: function() {
        throw new Error("calling 'define' from within the transition map is deprecated");
      },

      _withEmpty: function(elt){
        return elt || DSL.EMPTY;
      },

      _combineMatchers: function(matchers) {
        return [matchers.reduce(function(a,b){
          if (typeof(a) !== "function" || typeof(b) !== "function") {
            throw new Error("cannot combine empty model matcher with any other constraints");
          }

          return function(){
            return a.apply(this, arguments) && b.apply(this, arguments);
          };
        })];
      },

      transition: function() {
        var action, reverseAction,
            parent = [],
            routes = {},
            contexts = {},
            args = Array.prototype.slice.apply(arguments).reduce(function(a,b){
              return a.concat(b);
            }, []);


        for (var i = 0; i < args.length; i++) {
          var arg = args[i];
          if (arg.type === 'action') {
            if (action) {
              throw new Error("each transition definition must contain exactly one 'use' statement");
            }
            action = { method: arg.payload, args: arg.args };
          } else if (arg.type === 'reverseAction') {
            if (reverseAction) {
              throw new Error("each transition defintiion may contain at most one 'reverse' statement");
            }
            reverseAction = { method: arg.payload, args: arg.args };
          } else if (arg.type === 'route') {
            if (routes[arg.side]) {
              throw new Error("A transition definition contains multiple constraints on " + arg.side + "Route");
            }
            routes[arg.side] = arg.payload.map(this._withEmpty);
          } else if (arg.type === 'parent') {
            parent.push(arg.payload);
          } else {
            if (!contexts[arg.side]){
              contexts[arg.side] = [];
            }
            contexts[arg.side].push(arg.payload);
          }
        }

        if (!action) {
          throw new Error("a transition definition contains no 'use' statement");
        }
        if (!routes.from) {
          routes.from = [DSL.ANY];
        }
        if (!routes.to) {
          routes.to = [DSL.ANY];
        }
        if (parent.length === 0) {
          parent.push(DSL.ANY);
        }
        if (!contexts.from) {
          contexts.from = [DSL.ANY];
        }
        if (!contexts.to) {
          contexts.to = [DSL.ANY];
        }

        parent = this._combineMatchers(parent);
        contexts.from = this._combineMatchers(contexts.from);
        contexts.to = this._combineMatchers(contexts.to);

        this.map.register(routes, contexts, parent, action);
        if (reverseAction) {
          routes = { from: routes.to, to: routes.from };
          contexts = { from: contexts.to, to: contexts.from };
          this.map.register(routes, contexts, parent, reverseAction);
        }
      },

      fromRoute: function() {
        return {
          side: 'from',
          type: 'route',
          payload: Array.prototype.slice.apply(arguments)
        };
      },

      toRoute: function() {
        return {
          side: 'to',
          type: 'route',
          payload: Array.prototype.slice.apply(arguments)
        };
      },

      withinRoute: function() {
        return [
          this.fromRoute.apply(this, arguments),
          this.toRoute.apply(this, arguments)
        ];
      },

      fromModel: function(matcher) {
        return {
          side: 'from',
          type: 'context',
          payload: contextMatcher(matcher)
        };
      },

      toModel: function(matcher) {
        return {
          side: 'to',
          type: 'context',
          payload: contextMatcher(matcher)
        };
      },

      betweenModels: function(matcher) {
        return [
          this.fromModel(matcher),
          this.toModel(matcher)
        ];
      },

      hasClass: function(name) {
        return {
          type: 'parent',
          payload: function() {
            return this && this.get('classNames').indexOf(name) !== -1;
          }
        };
      },

      childOf: function(selector) {
        return {
          type: 'parent',
          payload: function() {
            var elt;
            return this &&
              (this._morph && Ember.$(this._morph.start.parentElement).is(selector)) ||
              (this.morph  && Ember.$('#' + this.morph.start).parent().is(selector)) ||
              ((elt=this.$()) && elt.parent().is(selector));
          }
        };
      },

      fromNonEmptyModel: function(){
        return this.fromModel(function(){
          return typeof(this) !== 'undefined';
        });
      },

      toNonEmptyModel: function(){
        return this.toModel(function(){
          return typeof(this) !== 'undefined';
        });
      },

      betweenNonEmptyModels: function(){
        return this.betweenModels(function(){
          return typeof(this) !== 'undefined';
        });
      },

      use: function(nameOrHandler) {
        return {
          type: 'action',
          payload: nameOrHandler,
          args: Array.prototype.slice.apply(arguments, [1])
        };
      },

      reverse: function(nameOrHandler) {
        return {
          type: 'reverseAction',
          payload: nameOrHandler,
          args: Array.prototype.slice.apply(arguments, [1])
        };
      }
    };

    DSL.ANY = '__liquid-fire-ANY';
    DSL.EMPTY = '__liquid-fire-EMPTY';

    function contextMatcher(matcher) {
      if (!matcher) {
        return DSL.EMPTY;
      }

      if (typeof(matcher) === 'function') {
        return matcher;
      }
      if (matcher.instanceOf) {
        return function() {
          return (this instanceof matcher.instanceOf) || (this && this.get && this.get('model') && this.get('model') instanceof matcher.instanceOf);
        };
      }
      if (typeof(matcher) === 'boolean') {
        return function() {
          if (matcher) {
            return !!this;
          } else {
            return !this;
          }
        };
      }

      throw new Error("unknown context matcher: " + JSON.stringify(matcher));
    }

    __exports__["default"] = DSL;
  });
;define("vendor/liquid-fire/animate",
  ["vendor/liquid-fire/promise","ember","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Promise = __dependency1__["default"];
    var Ember = __dependency2__["default"];

    var Velocity = Ember.$.Velocity;

    // Make sure Velocity always has promise support by injecting our own
    // RSVP-based implementation if it doesn't already have one.
    if (!Velocity.Promise) {
      Velocity.Promise = Promise;
    }

    function animate(view, props, opts, label) {
      // These numbers are just sane defaults in the probably-impossible
      // case where somebody tries to read our state before the first
      // 'progress' callback has fired.
      var state = { percentComplete: 0, timeRemaining: 100, timeSpent: 0 },
          elt;

      if (!view || !(elt = view.$()) || !elt[0]) {
        return Promise.cast();
      }

      if (!opts) {
        opts = {};
      } else {
        opts = Ember.copy(opts);
      }

      // By default, we ask velocity to clear the element's `display`
      // and `visibility` properties at the start of animation. Our
      // animated divs are all initially rendered with `display:none`
      // and `visibility:hidden` to prevent a flash of before-animated
      // content.
      if (typeof(opts.display) === 'undefined') {
        opts.display = '';
      }
      if (typeof(opts.visibility) === 'undefined') {
        opts.visibility = 'visible';
      }

      if (opts.progress) {
        throw new Error("liquid-fire's 'animate' function reserves the use of Velocity's 'progress' option for its own nefarious purposes.");
      }

      opts.progress = function(){
        state.percentComplete = arguments[1];
        state.timeRemaining = arguments[2];
        state.timeSpent = state.timeRemaining / (1/state.percentComplete - 1);
      };

      state.promise = Promise.cast(Velocity.animate(elt[0], props, opts));

      if (label) {
        state.promise = state.promise.then(function(){
          clearLabel(view, label);
        }, function(err) {
          clearLabel(view, label);
          throw err;
        });
        applyLabel(view, label, state);
      }

      return state.promise;
    }

    __exports__.animate = animate;function stop(view) {
      var elt;
      if (view && (elt = view.$())) {
        elt.velocity('stop', true);
      }
    }

    __exports__.stop = stop;function setDefaults(props) {
      for (var key in props) {
        if (props.hasOwnProperty(key)) {
          if (key === 'progress') {
            throw new Error("liquid-fire's 'animate' function reserves the use of Velocity's '" + key + "' option for its own nefarious purposes.");
          }
          Velocity.defaults[key] = props[key];
        }
      }
    }

    __exports__.setDefaults = setDefaults;function isAnimating(view, animationLabel) {
      return view && view._lfTags && view._lfTags[animationLabel];
    }

    __exports__.isAnimating = isAnimating;function finish(view, animationLabel) {
      return stateForLabel(view, animationLabel).promise;
    }

    __exports__.finish = finish;function timeSpent(view, animationLabel) {
      return stateForLabel(view, animationLabel).timeSpent;
    }

    __exports__.timeSpent = timeSpent;function timeRemaining(view, animationLabel) {
      return stateForLabel(view, animationLabel).timeRemaining;
    }

    __exports__.timeRemaining = timeRemaining;function stateForLabel(view, label) {
      var state = isAnimating(view, label);
      if (!state) {
        throw new Error("no animation labeled " + label + " is in progress");
      }
      return state;
    }

    function applyLabel(view, label, state) {
      if (!view){ return; }
      if (!view._lfTags) {
        view._lfTags = {};
      }
      view._lfTags[label] = state;
    }

    function clearLabel(view, label) {
      if (view && view._lfTags) {
        delete view._lfTags[label];
      }
    }
  });
;define("vendor/liquid-fire/initialize",
  ["vendor/liquid-fire/transitions","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Transitions = __dependency1__["default"];

    __exports__["default"] = function initialize(container, config) {
      var tm = Transitions.map(config);
      tm.container = container;
      container.register('transitions:map', tm,
                         {instantiate: false});
      ['outlet', 'with', 'if'].forEach(function(viewName) {
        container.injection('view:liquid-' + viewName, 'transitions', 'transitions:map');
      });
    }
  });
;define("vendor/liquid-fire/mutation-observer",
  ["exports"],
  function(__exports__) {
    "use strict";
    function MutationPoller(callback){
      this.callback = callback;
    }

    MutationPoller.prototype = {
      observe: function(){
        this.interval = setInterval(this.callback, 100);
      },
      disconnect: function() {
        clearInterval(this.interval);
      }
    };

    var M = (window.MutationObserver || window.WebkitMutationObserver || MutationPoller);

    __exports__["default"] = M;
  });
;define("vendor/liquid-fire/curry",
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = function curry(animationName) {
      var curriedArgs= Array.prototype.slice.apply(arguments, [1]);
      return function() {
        var innerHandler = this.lookup(animationName),
            args = Array.prototype.slice.apply(arguments);
        args.splice.apply(args, [2, 0].concat(curriedArgs));
        return innerHandler.apply(this, args);
      };
    }
  });
;define("app-addon/helpers/liquid-bind",
  ["exports"],
  function(__exports__) {
    "use strict";
    /* liquid-bind is really just liquid-with with a pre-provided block
       that just says {{this}} */

    __exports__["default"] = function liquidBindHelper() {
      var options = arguments[arguments.length-1],
          container = options.data.view.container,
          liquidWith = container.lookupFactory('helper:liquid-with');
      options.fn = container.lookup('template:liquid-with-self');
      return liquidWith.apply(this, arguments);
    }
  });
;define("app-addon/helpers/liquid-box",
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = function(){
      Ember.assert("liquid-box is deprecated, see CHANGELOG.md", false);
    }
  });
;define("app-addon/helpers/liquid-if",
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = function(property, options) {
      var View = options.data.view.container.lookupFactory('view:liquid-if');
      options.hash.firstTemplate = options.fn;
      delete options.fn;
      options.hash.secondTemplate = options.inverse;
      delete options.inverse;
      options.hash.showFirstBinding = property;
      return Ember.Handlebars.helpers.view.call(this, View, options);
    }
  });
;define("app-addon/helpers/liquid-measure",
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = function(){
      Ember.assert("liquid-measure is deprecated, see CHANGELOG.md", false);
    }
  });
;define("app-addon/helpers/liquid-outlet",
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = function liquidOutletHelper(property, options) {
      if (property && property.data && property.data.isRenderData) {
        options = property;
        property = 'main';
      }
      options.hash.view = 'liquid-outlet';
      return Ember.Handlebars.helpers.outlet.call(this, property, options);
    }
  });
;define("app-addon/helpers/liquid-with",
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = function liquidWithHelper() {
      var context = arguments[0],
          options = arguments[arguments.length-1],
          View = options.data.view.container.lookupFactory('view:liquid-with'),
          innerOptions = {
            data: options.data,
            hash: {},
            hashTypes: {}
          };

      View = View.extend({
        originalArgs: Array.prototype.slice.apply(arguments, [0, -1]),
        originalHash: options.hash,
        originalHashTypes: options.hashTypes,
        innerTemplate: options.fn
      });
      innerOptions.hash.boundContextBinding = context;

      ['class', 'classNames', 'classNameBindings', 'use', 'id'].forEach(function(field){
        if (options.hash[field]) {
          innerOptions.hash[field] = options.hash[field];
          innerOptions.hashTypes[field] = options.hashTypes[field];
        }
      });

      return Ember.Handlebars.helpers.view.call(this, View, innerOptions);
    }
  });
;define("app-addon/helpers/with-apply",
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    // This helper is internal to liquid-with.
    __exports__["default"] = function withApplyHelper(options){
      var view = options.data.view,
          parent = view.get('liquidWithParent'),
          withArgs = parent.get('originalArgs').slice();

      withArgs[0] = 'lwith-view.boundContext';
      options = Ember.copy(options);
      options.data.keywords['lwith-view'] = view;
      options.fn = parent.get('innerTemplate');
      options.hash = parent.get('originalHash');
      options.hashTypes = parent.get('originalHashTypes');
      withArgs.push(options);
      return Ember.Handlebars.helpers.with.apply(this, withArgs);
    }
  });
;define("app-addon/initializers/liquid-fire",
  ["vendor/liquid-fire","ember","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var initialize = __dependency1__.initialize;
    var Ember = __dependency2__["default"];

    __exports__["default"] = {
      name: 'liquid-fire',

      initialize: function(container) {
        if (!Ember.$.Velocity) {
          Ember.warn("Velocity.js is missing");
        } else {
          var version = Ember.$.Velocity.version;
          var recommended = [0, 11, 8];
          if (Ember.compare(recommended, [version.major, version.minor, version.patch]) === 1) {
            Ember.warn("You should probably upgrade Velocity.js, recommended minimum is " + recommended.join('.'));
          }
        }

        initialize(container, container.lookupFactory('transitions:main'));
        if (Ember.testing) {
          Ember.Test.registerWaiter(function(){
            return container.lookup('transitions:map').runningTransitions() === 0;
          });
        }
      }
    };
  });
;define("app-addon/templates/liquid-with-self",
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1;


      stack1 = helpers._triageMustache.call(depth0, "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n");
      return buffer;

    });
  });
;define("app-addon/templates/liquid-with",
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    __exports__["default"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1;


      stack1 = helpers._triageMustache.call(depth0, "with-apply", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n\n\n");
      return buffer;

    });
  });
;define("app-addon/transitions/cross-fade",
  ["vendor/liquid-fire","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // BEGIN-SNIPPET cross-fade-definition
    var animate = __dependency1__.animate;
    var stop = __dependency1__.stop;
    var Promise = __dependency1__.Promise;
    __exports__["default"] = function crossFade(oldView, insertNewView, opts) {
      stop(oldView);
      return insertNewView().then(function(newView) {
        return Promise.all([
          animate(oldView, {opacity: 0}, opts),
          animate(newView, {opacity: [1, 0]}, opts)
        ]);
      });
    }
    // END-SNIPPET
  });
;define("app-addon/transitions/fade",
  ["vendor/liquid-fire","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    // BEGIN-SNIPPET fade-definition
    var isAnimating = __dependency1__.isAnimating;
    var finish = __dependency1__.finish;
    var timeSpent = __dependency1__.timeSpent;
    var animate = __dependency1__.animate;
    var stop = __dependency1__.stop;
    __exports__["default"] = function fade(oldView, insertNewView, opts) {
      var firstStep,
          outOpts = opts;

      if (isAnimating(oldView, 'fade-out')) {
        // if the old view is already fading out, let it finish.
        firstStep = finish(oldView, 'fade-out');
      } else {
        if (isAnimating(oldView, 'fade-in')) {
          // if the old view is partially faded in, scale its fade-out
          // duration appropriately.
          outOpts = { duration: timeSpent(oldView, 'fade-in') };
        }
        stop(oldView);
        firstStep = animate(oldView, {opacity: 0}, outOpts, 'fade-out');
      }

      return firstStep.then(insertNewView).then(function(newView){
        return animate(newView, {opacity: [1, 0]}, opts, 'fade-in');
      });
    }
    // END-SNIPPET
  });
;define("app-addon/transitions/move-over",
  ["vendor/liquid-fire","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var stop = __dependency1__.stop;
    var animate = __dependency1__.animate;
    var Promise = __dependency1__.Promise;
    var isAnimating = __dependency1__.isAnimating;
    var finish = __dependency1__.finish;

    __exports__["default"] = function moveOver(oldView, insertNewView, dimension, direction, opts) {
      var oldParams = {},
          newParams = {},
          firstStep,
          property,
          measure;

      if (dimension.toLowerCase() === 'x') {
        property = 'translateX';
        measure = 'width';
      } else {
        property = 'translateY';
        measure = 'height';
      }

      if (isAnimating(oldView, 'moving-in')) {
        firstStep = finish(oldView, 'moving-in');
      } else {
        stop(oldView);
        firstStep = Promise.cast();
      }


      return firstStep.then(insertNewView).then(function(newView){
        if (newView && newView.$() && oldView && oldView.$()) {
          var bigger = Math.max.apply(null, [newView.$()[measure](), oldView.$()[measure]()]);
          oldParams[property] = (bigger * direction) + 'px';
          newParams[property] = ["0px", (-1 * bigger * direction) + 'px'];
        } else {
          oldParams[property] = (100 * direction) + '%';
          newParams[property] = ["0%", (-100 * direction) + '%'];
        }

        return Promise.all([
          animate(oldView, oldParams, opts),
          animate(newView, newParams, opts, 'moving-in')
        ]);
      });
    }
  });
;define("app-addon/transitions/to-down",
  ["vendor/liquid-fire","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var curryTransition = __dependency1__.curryTransition;
    __exports__["default"] = curryTransition("move-over", 'y', 1);
  });
;define("app-addon/transitions/to-left",
  ["vendor/liquid-fire","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var curryTransition = __dependency1__.curryTransition;
    __exports__["default"] = curryTransition("move-over", 'x', -1);
  });
;define("app-addon/transitions/to-right",
  ["vendor/liquid-fire","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var curryTransition = __dependency1__.curryTransition;
    __exports__["default"] = curryTransition("move-over", 'x', 1);
  });
;define("app-addon/transitions/to-up",
  ["vendor/liquid-fire","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var curryTransition = __dependency1__.curryTransition;
    __exports__["default"] = curryTransition("move-over", 'y', -1);
  });
;define("app-addon/views/liquid-child",
  ["ember","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];

    __exports__["default"] = Ember.ContainerView.extend({
      classNames: ['liquid-child'],
      resolveInsertionPromise: Ember.on('didInsertElement', function(){
        // Children start out hidden and invisible.
        // Measurement will `show` them and Velocity will make them visible.
        // This prevents a flash of pre-animated content.
        this.$().css({visibility: 'hidden'}).hide();
        if (this._resolveInsertion) {
          this._resolveInsertion(this);
        }
      })
    });
  });
;define("app-addon/views/liquid-if",
  ["app-addon/views/liquid-outlet","ember","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var LiquidOutlet = __dependency1__["default"];
    var Ember = __dependency2__["default"];

    __exports__["default"] = LiquidOutlet.extend({
      liquidUpdate: Ember.on('init', Ember.observer('showFirst', function(){
        var template = this.get((this.get('showFirst') ? 'first' : 'second') + 'Template');
        var view = Ember._MetamorphView.create({
          container: this.container,
          template: template,
          liquidParent: this,
          contextBinding: 'liquidParent.context',
          liquidContext: this.get("showFirst"),
          hasLiquidContext: true
        });
        this.set('currentView', view);
      }))

    });
  });
;define("app-addon/views/liquid-outlet",
  ["ember","vendor/liquid-fire","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Ember = __dependency1__["default"];
    var Promise = __dependency2__.Promise;
    var animate = __dependency2__.animate;
    var stop = __dependency2__.stop;
    var capitalize = Ember.String.capitalize;

    __exports__["default"] = Ember.ContainerView.extend({
      classNames: ['liquid-container'],
      growDuration: 250,
      growPixelsPerSecond: 200,
      growEasing: 'slide',
      enableGrowth: true,

      init: function(){
        // The ContainerView constructor normally sticks our "currentView"
        // directly into _childViews, but we want to leave that up to
        // _currentViewDidChange so we have the opportunity to launch a
        // transition.
        this._super();
        Ember.A(this._childViews).clear();
      },

      // Deliberately overriding a private method from
      // Ember.ContainerView!
      //
      // We need to stop it from destroying our outgoing child view
      // prematurely.
      _currentViewWillChange: Ember.beforeObserver('currentView', function() {}),

      // Deliberately overriding a private method from
      // Ember.ContainerView!
      _currentViewDidChange: Ember.on('init', Ember.observer('currentView', function() {
        // Normally there is only one child (the view we're
        // replacing). But sometimes there may be two children (because a
        // transition is already in progress). In any case, we tell all of
        // them to start heading for the exits now.

        var oldView = this.get('childViews.lastObject'),
            newView = this.get('currentView');

        // Idempotence
        if ((!oldView && !newView) ||
            (oldView && oldView.get('currentView') === newView) ||
            (this._runningTransition &&
             this._runningTransition.oldView === oldView &&
             this._runningTransition.newContent === newView
            )) {
          return;
        }

        // `transitions` comes from dependency injection, see the
        // liquid-fire app initializer.
        var transition = this.get('transitions').transitionFor(this, oldView, newView, this.get('use'));

        if (this._runningTransition) {
          this._runningTransition.interrupt();
        }

        this._runningTransition = transition;
        transition.run().catch(function(err){
          // Force any errors through to the RSVP error handler, because
          // of https://github.com/tildeio/rsvp.js/pull/278.  The fix got
          // into Ember 1.7, so we can drop this once we decide 1.6 is
          // EOL.
          Ember.RSVP.Promise.cast()._onerror(err);
        });
      })),

      _liquidChildFor: function(content) {
        if (content && !content.get('hasLiquidContext')){
          content.set('liquidContext', content.get('context'));
        }
        var LiquidChild = this.container.lookupFactory('view:liquid-child');
        return LiquidChild.create({
          currentView: content
        });
      },

      _pushNewView: function(newView) {
        var child = this._liquidChildFor(newView),
            promise = new Promise(function(resolve) {
              child._resolveInsertion = resolve;
            });
        this.pushObject(child);
        return promise;
      },

      cacheSize: function() {
        var elt = this.$();
        if (elt) {
          // Measure original size.
          this._cachedSize = getSize(elt);
        }
      },

      unlockSize: function() {
        var self = this;
        function doUnlock(){
          var elt = self.$();
          if (elt) {
            elt.css({width: '', height: ''});
          }
        }
        if (this._scaling) {
          this._scaling.then(doUnlock);
        } else {
          doUnlock();
        }
      },

      _durationFor: function(before, after) {
        return Math.min(this.get('growDuration'), 1000*Math.abs(before - after)/this.get('growPixelsPerSecond'));
      },

      _adaptDimension: function(dimension, before, after) {
        if (before[dimension] === after[dimension] || !this.get('enableGrowth')) {
          var elt = this.$();
          if (elt) {
            elt[dimension](after[dimension]);
          }
          return Promise.cast();
        } else {
          // Velocity deals in literal width/height, whereas jQuery deals
          // in box-sizing-dependent measurements.
          var target = {};
          target[dimension] = [
            after['literal'+capitalize(dimension)],
            before['literal'+capitalize(dimension)],
          ];
          return animate(this, target, {
            duration: this._durationFor(before[dimension], after[dimension]),
            queue: false,
            easing: this.get('growEasing')
          });
        }
      },

      adaptSize: function() {
        stop(this);

        var elt = this.$();
        if (!elt) { return; }

        // Measure new size.
        var newSize = getSize(elt);
        if (typeof(this._cachedSize) === 'undefined') {
          this._cachedSize = newSize;
        }

        // Now that measurements have been taken, lock the size
        // before the invoking the scaling transition.
        elt.width(this._cachedSize.width);
        elt.height(this._cachedSize.height);

        this._scaling = Promise.all([
          this._adaptDimension('width', this._cachedSize, newSize),
          this._adaptDimension('height', this._cachedSize, newSize),
        ]);
      }

    });

    // We're tracking both jQuery's box-sizing dependent measurements and
    // the literal CSS properties, because it's nice to get/set dimensions
    // with jQuery and not worry about boz-sizing *but* Velocity needs the
    // raw values.
    function getSize(elt) {
      return {
        width: elt.width(),
        literalWidth: parseInt(elt.css('width'),10),
        height: elt.height(),
        literalHeight: parseInt(elt.css('height'),10)
      };
    }
  });
;define("app-addon/views/liquid-with",
  ["app-addon/views/liquid-outlet","ember","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var LiquidOutlet = __dependency1__["default"];
    var Ember = __dependency2__["default"];

    __exports__["default"] = LiquidOutlet.extend({
      liquidUpdate: Ember.on('init', Ember.observer('boundContext', function(){
        var view = Ember._MetamorphView.create({
          container: this.container,
          templateName: 'liquid-with',
          boundContext: this.get('boundContext'),
          liquidWithParent: this,
          liquidContext: this.get('boundContext'),
          hasLiquidContext: true,
        });
        this.set('currentView', view);
      }))

    });
  });
;define('vendor/liquid-fire-shim', ["exports"], function(__exports__) {__exports__.initialize = function(container){
container.register('helper:liquid-bind', require('app-addon/helpers/liquid-bind')['default']);
container.register('helper:liquid-bind'.camelize(), require('app-addon/helpers/liquid-bind')['default']);
container.register('helper:liquid-box', require('app-addon/helpers/liquid-box')['default']);
container.register('helper:liquid-box'.camelize(), require('app-addon/helpers/liquid-box')['default']);
container.register('helper:liquid-if', require('app-addon/helpers/liquid-if')['default']);
container.register('helper:liquid-if'.camelize(), require('app-addon/helpers/liquid-if')['default']);
container.register('helper:liquid-measure', require('app-addon/helpers/liquid-measure')['default']);
container.register('helper:liquid-measure'.camelize(), require('app-addon/helpers/liquid-measure')['default']);
container.register('helper:liquid-outlet', require('app-addon/helpers/liquid-outlet')['default']);
container.register('helper:liquid-outlet'.camelize(), require('app-addon/helpers/liquid-outlet')['default']);
container.register('helper:liquid-with', require('app-addon/helpers/liquid-with')['default']);
container.register('helper:liquid-with'.camelize(), require('app-addon/helpers/liquid-with')['default']);
container.register('helper:with-apply', require('app-addon/helpers/with-apply')['default']);
container.register('helper:with-apply'.camelize(), require('app-addon/helpers/with-apply')['default']);
container.register('template:liquid-with-self', require('app-addon/templates/liquid-with-self')['default']);
container.register('template:liquid-with-self'.camelize(), require('app-addon/templates/liquid-with-self')['default']);
container.register('template:liquid-with', require('app-addon/templates/liquid-with')['default']);
container.register('template:liquid-with'.camelize(), require('app-addon/templates/liquid-with')['default']);
container.register('transition:cross-fade', require('app-addon/transitions/cross-fade')['default']);
container.register('transition:cross-fade'.camelize(), require('app-addon/transitions/cross-fade')['default']);
container.register('transition:fade', require('app-addon/transitions/fade')['default']);
container.register('transition:fade'.camelize(), require('app-addon/transitions/fade')['default']);
container.register('transition:move-over', require('app-addon/transitions/move-over')['default']);
container.register('transition:move-over'.camelize(), require('app-addon/transitions/move-over')['default']);
container.register('transition:to-down', require('app-addon/transitions/to-down')['default']);
container.register('transition:to-down'.camelize(), require('app-addon/transitions/to-down')['default']);
container.register('transition:to-left', require('app-addon/transitions/to-left')['default']);
container.register('transition:to-left'.camelize(), require('app-addon/transitions/to-left')['default']);
container.register('transition:to-right', require('app-addon/transitions/to-right')['default']);
container.register('transition:to-right'.camelize(), require('app-addon/transitions/to-right')['default']);
container.register('transition:to-up', require('app-addon/transitions/to-up')['default']);
container.register('transition:to-up'.camelize(), require('app-addon/transitions/to-up')['default']);
container.register('view:liquid-child', require('app-addon/views/liquid-child')['default']);
container.register('view:liquid-child'.camelize(), require('app-addon/views/liquid-child')['default']);
container.register('view:liquid-if', require('app-addon/views/liquid-if')['default']);
container.register('view:liquid-if'.camelize(), require('app-addon/views/liquid-if')['default']);
container.register('view:liquid-outlet', require('app-addon/views/liquid-outlet')['default']);
container.register('view:liquid-outlet'.camelize(), require('app-addon/views/liquid-outlet')['default']);
container.register('view:liquid-with', require('app-addon/views/liquid-with')['default']);
container.register('view:liquid-with'.camelize(), require('app-addon/views/liquid-with')['default']);
};});
;/* global define, require */

define('ember', ["exports"], function(__exports__) {
  __exports__['default'] = window.Ember;
});

window.LiquidFire = require('vendor/liquid-fire');
window.LiquidFire._deferredMaps = [];
window.LiquidFire._deferredDefines = [];

window.LiquidFire.map = function(handler) {
  window.LiquidFire._deferredMaps.push(handler);
};

window.LiquidFire.defineTransition = function(name, implementation) {
  window.LiquidFire._deferredDefines.push([name, implementation]);
};

window.Ember.Application.initializer({
  name: 'liquid-fire-standalone',
  initialize: function(container) {
    require('vendor/liquid-fire').initialize(container, function(){
      var self = this;
      window.LiquidFire._deferredMaps.forEach(function(m){
        m.apply(self);
      });
      window.LiquidFire._deferredDefines.forEach(function(pair){
        container.register('transition:' + pair[0], pair[1]);
      });
    });
    require('vendor/liquid-fire-shim').initialize(container);
  }
});
})();
