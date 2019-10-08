export default function XCBaseMixin(base) {
  return class XCBase extends base {
    constructor() {
      super();
      this._properties = {};
      this._connected = false;
      this._createSetters();
      this._injectStyles();
    }

    connectedCallback() {
      this.innerHTML = this.constructor.htmlMarkup;
      this._connected = true;
      // Need to delay so animations occur
      setTimeout(this._loadProperties.bind(this), 10);
    }

    _injectStyles() {
      var styleId = this.constructor.is + '-styles';
      if (!document.head.querySelector('#' + styleId)) {
        var style = document.createElement('style');
        var markup = this._updateFocusMarkup(this.constructor.cssMarkup);
        style.innerHTML = markup;
        style.setAttribute('id', styleId);
        document.head.appendChild(style);
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      var handler = this[this._attrToCamel(name) + 'Changed'];
      this._properties[name] = newValue === '' || newValue === 'true' || newValue;
      if (handler && this._connected) {
        handler.call(this, oldValue, this._properties[name]);
      }
    }

    _createSetter(name) {
      Object.defineProperty(this, this._attrToCamel(name), {
        get: function() {
          return this._properties[name];
        },
        set: function(value) {
          var oldValue = this._properties[name];
          this._properties[name] = value;

          if (typeof value === 'string') {
            this.setAttribute(name, value);
          } else if (typeof value === 'boolean') {
            value ? this.setAttribute(name, value) : this.removeAttribute(name);
          } else if (this._connected) {
            this.attributeChangedCallback(name, oldValue, value);
          }
        }
      });
    }

    $(selector) {
      return this.querySelector('.' + this.constructor.is + '--' + selector);
    }

    nodesForEach(selector, callback) {
      var items = this.querySelectorAll(selector);
      Array.prototype.forEach.call(items, callback, this);
    }

    _loadProperties() {
      this.constructor.observedAttributes.forEach(function(name) {
        var value = this._properties[name];
        if (value) {
          this.attributeChangedCallback(name, undefined, value);
        }
      }, this);
    }

    _createSetters() {
      this.constructor.observedAttributes.forEach(this._createSetter, this);
    }

    _attrToCamel(name) {
      return name.replace(/-(\w)/g, function(_, ltr) {
        return ltr.toUpperCase();
      });
    }

    _isMobile() {
      return !!navigator.userAgent.match(/iphone|android|blackberry/ig) || false;
    }

    _updateFocusMarkup(markup) {
      var focusRegex = /(\.[a-z,-]+:focus(:before)?,?)+\{.*?\}/g;

      if (this._isMobile()) {
        return markup.replace(focusRegex, function(match) {
          return match.replace(/\{.*?\}/g, '{outline: 0;}');
        });
      }

      return markup;
    }

    _showSiblings(siblings) {
      siblings.forEach(function(sibling) {
        sibling.removeAttribute('aria-hidden');
      });
    }

    _hideSiblings() {
      var hidden = [];
      var elementChildren = document.body.children;

      Array.prototype.forEach.call(elementChildren, function(child) {
        if (child !== this &&
              (!child.hasAttribute('aria-hidden') ||
              child.getAttribute('aria-hidden') !== 'true')) {
          child.setAttribute('aria-hidden', 'true');
          hidden.push(child);
        }
      }.bind(this));
      return hidden;
    }

    _captureFocus(container, firstLink, event) {
      if (this.opened && !container.contains(event.target)) {
        event.stopPropagation();
        firstLink.focus();
      }
    }

    _toggleClass(node, name, add) {
      // Thanks IE11 for not implementing this correctly
      if (add) {
        node.classList.add(name);
      } else {
        node.classList.remove(name);
      }
    }

    fire(eventName, detail, target) {
      var customEventInit = {detail: detail};
      target = target || this;
      target.dispatchEvent(new CustomEvent(eventName, customEventInit), {bubbles: true});
    }

    _onEscape(callback, event) {
      var ESCAPE = 27;

      if (event.keyCode === ESCAPE) {
        callback(event);
        event.preventDefault();
      }
    }

    _setupEmailTS(attrSltr) {
      this.nodesForEach(attrSltr, function(link) {
        var emailHref = link.href;
        var ts = this._getTs();
        link.href = this._getEmailTsHref(emailHref, ts);
      });
    }

    _getTs() {
      var converter = [6, 0, 2, 1, 4, 3, 7, 5],
          input = this._getTsInput(),
          output = [],
          i, len;
      for (i = 0, len = input.length; i < len; i += 1) {
        output[i] = input.substr((converter[i] % len), 1);
      }
      return output.join('');
    }

    _getTsInput() {
      return Math.floor((this._getDate().getTime()) / 1000).toString(16);
    }

    _getDate() {
      return new Date();
    }

    _getEmailTsHref(emailHref, ts) {
      return emailHref.replace(/(ts=[0-9A-Fa-f]*)+/, 'ts=' + ts);
    }
  };
}
