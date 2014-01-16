/**
 * angular-bootstrap-scrollspy
 * @version v0.2.1 - 2013-07-24
 * @link https://github.com/mgcrea/angular-bootstrap-scrollspy
 * @author Olivier Louvignes <olivier@mg-crea.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';
angular.module('mgcrea.bootstrap.scrollspy', ['mgcrea.jquery']).directive('bsScrollspy', [
  '$window',
  '$location',
  '$routeParams',
  'jQuery',
  'debounce',
  function ($window, $location, $routeParams, jQuery, debounce) {
    var slice = Array.prototype.slice;
    var offset;
    var offsets = [];
    var targets = [];
    var activeTarget;
    var refresh = function (options) {
      offsets = [];
      targets = [];
      slice.call(jQuery(options.target).children()).map(function (el) {
        return [
          jQuery(el).offset().top,
          el.id
        ];
      }).sort(function (a, b) {
        return a[0] - b[0];
      }).forEach(function (el) {
        offsets.push(el[0]);
        targets.push(el[1]);
      });
      if (options.offset) {
        offset = options.offset === 'auto' ? offsets.length && offsets[0] : options.offset * 1;
      }
    };
    var process = function (scope, el, options) {
      if (!offsets.length)
        return;
      var scrollTop = el[0].scrollTop + offset;
      var scrollHeight = el[0].scrollHeight || document.body.scrollHeight;
      if (scrollTop < offsets[0] && activeTarget !== targets[0]) {
        return activate(scope, targets[0], options);
      }
      for (var i = offsets.length; i--;) {
        if (activeTarget !== targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1])) {
          activate(scope, targets[i], options);
        }
      }
    };
    var activate = function (scope, selector, options) {
      activeTarget = selector;
      jQuery(options.target + ' > .active').removeClass('active');
      jQuery('#' + activeTarget).addClass('active');
      scope.$apply($location.search(options.search || 'page', selector));
    };
    return {
      restrict: 'EAC',
      link: function postLink(scope, iElement, iAttrs) {
        var refreshPositions = function () {
          refresh(iAttrs);
          process(scope, iElement, iAttrs);
        };
        var debouncedRefresh = debounce(refreshPositions, 300);
        scope.$on('$viewContentLoaded', debouncedRefresh);
        scope.$on('$includeContentLoaded', debouncedRefresh);
        angular.element($window).bind('scroll', function () {
          process(scope, iElement, iAttrs);
        });
      }
    };
  }
]);
(function (window, document, undefined) {
  'use strict';
  angular.module('mgcrea.bootstrap.affix', ['mgcrea.jqlite.dimensions']).provider('$affix', function () {
    var jqLite = angular.element;
    var defaults = this.defaults = { offsetTop: 'auto' };
    this.$get = [
      '$window',
      'dimensions',
      function ($window, dimensions) {
        var windowEl = jqLite($window);
        var bodyEl = jqLite($window.document.body);
        function AffixFactory(element, config) {
          var $affix = {};
          var options = angular.extend({}, defaults, config);
          var reset = 'affix affix-top affix-bottom', initialAffixTop = 0, initialOffsetTop = 0, affixed = null, unpin = null;
          var parent = element.parent();
          if (options.offsetParent) {
            if (options.offsetParent.match(/^\d+$/)) {
              for (var i = 0; i < options.offsetParent * 1 - 1; i++) {
                parent = parent.parent();
              }
            } else {
              parent = jqLite(options.offsetParent);
            }
          }
          var offsetTop = 0;
          if (options.offsetTop) {
            if (options.offsetTop === 'auto' || options.offsetTop.match(/^[-+]\d+$/)) {
              initialAffixTop -= options.offsetTop * 1;
              if (options.offsetParent) {
                offsetTop = dimensions.offset(parent[0]).top + options.offsetTop * 1;
              } else {
                offsetTop = dimensions.offset(element[0]).top - dimensions.css(element[0], 'marginTop', true) + options.offsetTop * 1;
              }
            } else {
              offsetTop = options.offsetTop * 1;
            }
          }
          var offsetBottom = 0;
          if (options.offsetBottom) {
            if (options.offsetParent && options.offsetBottom.match(/^[-+]\d+$/)) {
              offsetBottom = $window.document.body.scrollHeight - (dimensions.offset(parent[0]).top + dimensions.height(parent[0])) + options.offsetBottom * 1 + 1;
            } else {
              offsetBottom = options.offsetBottom * 1;
            }
          }
          $affix.init = function () {
            initialOffsetTop = dimensions.offset(element[0]).top + initialAffixTop;
            windowEl.on('scroll', this.checkPosition);
            windowEl.on('click', this.checkPositionWithEventLoop);
            this.checkPosition();
            this.checkPositionWithEventLoop();
          };
          $affix.destroy = function () {
            windowEl.off('scroll', this.checkPosition);
            windowEl.off('click', this.checkPositionWithEventLoop);
          };
          $affix.checkPositionWithEventLoop = function () {
            setTimeout(this.checkPosition, 1);
          };
          $affix.checkPosition = function () {
            var scrollTop = $window.pageYOffset;
            var position = dimensions.offset(element[0]);
            var elementHeight = dimensions.height(element[0]);
            var affix = getRequiredAffixClass(unpin, position, elementHeight);
            if (affixed === affix)
              return;
            affixed = affix;
            element.removeClass(reset).addClass('affix' + (affix !== 'middle' ? '-' + affix : ''));
            if (affix === 'top') {
              unpin = null;
              element.css('position', options.offsetParent ? '' : 'relative');
              element.css('top', '');
            } else if (affix === 'bottom') {
              if (options.offsetUnpin) {
                unpin = -(options.offsetUnpin * 1);
              } else {
                unpin = position.top - scrollTop;
              }
              element.css('position', options.offsetParent ? '' : 'relative');
              element.css('top', options.offsetParent ? '' : bodyEl[0].offsetHeight - offsetBottom - elementHeight - initialOffsetTop + 'px');
            } else {
              unpin = null;
              element.css('position', 'fixed');
              element.css('top', initialAffixTop + 'px');
            }
          };
          function getRequiredAffixClass(unpin, position, elementHeight) {
            var scrollTop = $window.pageYOffset;
            var scrollHeight = $window.document.body.scrollHeight;
            if (scrollTop <= offsetTop) {
              return 'top';
            } else if (unpin !== null && scrollTop + unpin <= position.top) {
              return 'middle';
            } else if (offsetBottom !== null && position.top + elementHeight + initialAffixTop >= scrollHeight - offsetBottom) {
              return 'bottom';
            } else {
              return 'middle';
            }
          }
          $affix.init();
          return $affix;
        }
        return AffixFactory;
      }
    ];
  }).directive('wgAffix', [
    '$affix',
    'dimensions',
    function ($affix, dimensions) {
      var forEach = angular.forEach;
      var isDefined = angular.isDefined;
      var jqLite = angular.element;
      return {
        restrict: 'EAC',
        link: function postLink(scope, element, attr) {
          var options = {
              scope: scope,
              offsetTop: 'auto'
            };
          forEach([
            'offsetTop',
            'offsetBottom',
            'offsetParent',
            'offsetUnpin'
          ], function (key) {
            if (isDefined(attr[key]))
              options[key] = attr[key];
          });
          var affix = $affix(element, options);
          scope.$on('$destroy', function () {
            options = null;
            affix = null;
          });
        }
      };
    }
  ]);
}(window, document));