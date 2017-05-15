import XCBaseMixin from '../xc-base';
import markup from './xc-footer.html';
import styles from './xc-footer.scss';

export default class XCFooter extends XCBaseMixin(HTMLElement) {
  static get cssMarkup() {
    return styles;
  }

  static get htmlMarkup() {
    return markup;
  }

  static get is() {
    return 'xc-footer';
  }

  connectedCallback() {
    super.connectedCallback();
    this._setupEmailTS('a[href*="wnamp"]');
    this.nodesForEach('.xc-footer--toggle', function(toggle) {
      toggle.addEventListener('click', this._toggleOpened);
    });
  }

  static get observedAttributes() {
    return ['client-id', 'external-links', 'width'];
  }

  widthChanged(_, width) {
    if (width) {
      width = parseInt(width, 10) + 48 + 'px';
    } else {
      width = 'none';
    }
    this.$('panels').style.maxWidth = width;
    this.$('bottom-container').style.maxWidth = width;
  }

  externalLinksChanged() {
    this.nodesForEach('a', function(link) {
      link.setAttribute('target', '_blank');
    });
  }

  _toggleOpened(event) {
    event.currentTarget.parentNode.classList.toggle('xc-opened');
  }
}
customElements.define(XCFooter.is, XCFooter);
