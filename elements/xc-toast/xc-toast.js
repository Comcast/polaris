import XCBaseMixin from '../xc-base';
import markup from './xc-toast.html';
import styles from './xc-toast.scss';

export default class XCToast extends XCBaseMixin(HTMLElement) {
  static get cssMarkup() {
    return styles;
  }

  static get htmlMarkup() {
    return markup;
  }

  static get is() {
    return 'xc-toast';
  }

  connectedCallback() {
    super.connectedCallback();

    this._container = this.$('container');
    this._toggle = this._toggle.bind(this);
    this._open = this._open.bind(this);
    this._close = this._close.bind(this);
    this._handleEscape = super._onEscape.bind(this, this._close);
    this._getButtonTemplate();
    this.$('close').addEventListener('click', this._close);
  }

  static get observedAttributes() {
    return ['opened', 'data'];
  }

  openedChanged(oldValue, newValue) {
    this._toggle(newValue);
  }

  _open() {
    this._lastFocus = document.activeElement;
    this._firstLink = this.querySelector('a');
    this._firstLink.focus();
    this._captureFocus = super._captureFocus.bind(this, this._container, this._firstLink);
    document.addEventListener('keydown', this._handleEscape, true);
    document.addEventListener('focus', this._captureFocus, true);
    this.removeEventListener('transitionend', this._open);
  }

  _close() {
    this.opened = false;
  }

  _toggle(opened) {
    if (opened) {
      this.addEventListener('transitionend', this._open);
      this._hiddenSiblings = this._hideSiblings();
    } else {
      document.removeEventListener('keydown', this._handleEscape);
      document.removeEventListener('focus', this._captureFocus);
      if (this._lastFocus) {
        this._lastFocus.focus();
      }
      this.setAttribute('aria-hidden', 'true');
      this._showSiblings(this._hiddenSiblings);
    }
    this._toggleClass(this, 'opened', opened);
  }

  _getButtonTemplate() {
    var buttonContainer = this.$('container');
    var buttonTemplate = this.$('action');
    this._buttonTemplate = buttonContainer.removeChild(buttonTemplate);
  }

  _createButton(link) {
    var buttonNode = this._buttonTemplate.cloneNode(true);
    buttonNode.textContent = link.text;
    buttonNode.href = link.url;
    if (link.target) {
      buttonNode.setAttribute('target', link.target);
    }
    this.$('container').insertBefore(buttonNode, this.$('close'));
  }

  _clearButtons() {
    while (this.$('action')) {
      var button = this.$('action');
      button.parentNode.removeChild(button);
    }
  }

  dataChanged(old, message) {
    if (message) {
      this.$('message-main').textContent = message.main;
      this.$('message-sub').textContent = message.sub;
      this._clearButtons();
      if (message.link) {
        this._createButton(message.link);
      } else if (message.links) {
        message.links.forEach(this._createButton.bind(this));
      }
    }
  }
}
customElements.define(XCToast.is, XCToast);
