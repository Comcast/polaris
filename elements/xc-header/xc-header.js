import XCBaseMixin from '../xc-base';
import markup from './xc-header.html';
import styles from './xc-header.scss';

export default class XCHeader extends XCBaseMixin(HTMLElement) {
  static get cssMarkup() {
    return styles;
  }

  static get htmlMarkup() {
    return markup;
  }

  static get is() {
    return 'xc-header';
  }

  connectedCallback() {
    super.connectedCallback();
    this._toggleHamburger = this._toggleHamburger.bind(this);
    this._captureFocus = super._captureFocus.bind(this, this.$('container'), this.$('container-nav a'));
    this._escapeToggleHamburger = this._onEscape.bind(this, this._toggleHamburger);
    this._getNotificationTemplate();
    this._setupEmailTS('a[name="email"]');
    this._setupListeners();
    this.fire('XCHeaderLoaded', {}, document);
  }

  static get observedAttributes() {
    return ['client-id', 'disable-controller', 'disable-email-count', 'disable-notifications',
      'disable-skip', 'email-count', 'external-links', 'first-name', 'is-authed', 'login-url',
      'notifications', 'sign-in-url', 'sign-out-url', 'slimnav', 'state', 'tab', 'width'];
  }

  _getNotificationTemplate() {
    var notificationsContainer = this.$('notifications-ul');
    var template = this.$('notifications-li');
    this._notificationTemplate = notificationsContainer.removeChild(template);
  }

  stateChanged(_, state) {
    var isAuthenticated = (state === 'authenticated');
    var shopLink = this.$('navigation-link[name="shop"]');
    this._toggleClass(this.$('signin-container'), 'xc-unrecognized', !isAuthenticated);
    this._toggleClass(shopLink, 'xc-unrecognized', (state === 'unrecognized'));
    shopLink.href = shopLink.getAttribute('data-' + state);
    this._updateNavLinkTracking(state);
  }

  _updateNavLinkTracking(state) {
    var stateAbbr = state.slice(0, 2);

    this.nodesForEach('.xc-header--navigation-link', function(link) {
      link.href = link.href.replace(/\?CMP=.*/, '') + '?CMP=' + [
        'nav',
        link.getAttribute('name'),
        this.clientId,
        stateAbbr
      ].join('_');
    });
  }

  isAuthedChanged(_, isAuthed) {
    this.setAttribute('state', isAuthed ? 'authenticated' : 'recognized');
    this.fire('authed-changed', {value: isAuthed});
  }

  widthChanged(_, newWidth) {
    // Add 48px, 24px for each side margin
    this.$('container').style.maxWidth = newWidth ? parseInt(newWidth, 10) + 48 + 'px' : 'auto';
    if (this.slimnav) {
      this.$('slim-navigation-ul').style.maxWidth = newWidth ? parseInt(newWidth, 10) + 48 + 'px' : 'auto';
    }
  }

  notificationsChanged(oldValue, notifications) {
    var notificationsContainer = this.$('notifications-ul');
    var doOnce = !oldValue;

    notifications.forEach(function(notification, index) {
      var node = this._createNotification(notification, index);
      notificationsContainer.appendChild(node);
    }, this);
    this._updateNotificationCount();

    if (doOnce) {
      this._setupNotificationsListeners();
    }
  }

  _createNotification(notification, index) {
    var node = this._notificationTemplate.cloneNode(true);
    var close = node.querySelector('.xc-header--notifications-close');
    var link = node.querySelector('.xc-header--notifications-link');
    if (index > 0) {
      link.removeAttribute('aria-describedby');
    }
    link.href = notification.url;
    if (this.externalLinks) {
      link.setAttribute('target', '_blank');
    }
    if (notification.dismissable) {
      var closeItem = this._closeItem.bind(this, node, this.notifications[index]);
      close.addEventListener('click', function(event) {
        event.stopPropagation();
        closeItem(event);
      });
      link.addEventListener('click', closeItem);
    } else {
      close.setAttribute('hidden', true);
    }
    node.querySelector('.xc-header--notifications-main').textContent = notification.main;
    node.querySelector('.xc-header--notifications-sub').textContent = notification.sub || '';
    return node;
  }

  _updateNotificationCount() {
    var container = this.$('notification-count--container');
    var count = this.$('notification-count');
    var num = this.querySelectorAll('.xc-header--notifications-li:not(.xc-dismissed)').length;
    var message = '';

    count.textContent = num;
    if (num > 0) {
      message = 'You have ' + num + ' notification' + (num > 1 ? 's' : '');
      container.removeAttribute('hidden');
    } else {
      container.setAttribute('hidden', '');
    }
    this.$('notifications-summary').textContent = message;
  }

  firstNameChanged(_, name) {
    var link = this.$('signin-profile-link');
    link.textContent = name;
    link.title = name;
  }

  // deprecated
  loginUrlChanged(_, url) {
    this.$('signin-link').href = url;
  }

  signInUrlChanged(_, url) {
    this.$('signin-link').href = url;
  }

  signOutUrlChanged(_, url) {
    this.$('signin-signout-link').href = url;
  }

  disableSkipChanged() {
    this.nodesForEach('.xc-header--skip', function(link) {
      link.remove();
    });
  }

  externalLinksChanged() {
    this.nodesForEach('.xc-header--container-nav a, .xc-header--xfinity-logo',
      function(link) {
        link.setAttribute('target', '_blank');
      });
  }

  emailCountChanged(_, count) {
    var emailCount = this.$('email-count');
    count = parseInt(count, 10);
    if (count) {
      var countText = document.createElement('b');
      countText.classList.add('xc-screen-reader-text');
      count = count > 99 ? '99+' : count;
      emailCount.textContent = count;
      countText.textContent = ' unread emails';
      emailCount.appendChild(countText);
      emailCount.removeAttribute('hidden');
    }
  }

  slimnavChanged() {
    var slimnav = this.$('slim-container');
    slimnav.removeAttribute('hidden');
  }

  tabChanged(_, tab) {
    this.nodesForEach('a[name="' + tab + '"]', function(link) {
      link.classList.add('xc-header--active');
    });
  }

  _toggleHamburger(event) {
    var menu = this.$('container-nav');
    var opened = menu.classList.toggle('xc-expanded');
    var hamburger = this.$('hamburger');
    this.opened = opened;
    this._toggleClass(this.$('signin-container'), 'xc-visible', opened);
    hamburger.setAttribute('aria-expanded', opened);
    hamburger.querySelector('.xc-screen-reader-text').textContent = opened ? 'Close ' : 'Open ';
    this._toggleClass(document.body, 'hamburger-opened', opened);

    if (opened) {
      var menuHeight = menu.getBoundingClientRect().height + 'px';
      document.body.style.height = menuHeight;
      this._hiddenSiblings = this._hideSiblings();
    } else {
      document.querySelector('html').style.overflow = '';
      document.body.style.height = 'auto';
      this._showSiblings(this._hiddenSiblings);
    }

    event.stopPropagation();
    // close hamburger on body click
    var addOrRemove = opened ? 'addEventListener' : 'removeEventListener';
    document[addOrRemove].call(document, 'click', this._toggleHamburger);
    document[addOrRemove].call(document, 'focus', this._captureFocus, true);
    document[addOrRemove].call(document, 'keydown', this._escapeToggleHamburger, true);
  }

  _showMenu(toggle, menu, event) {
    if (this._menuIsClosed(menu) && this._closeOpenMenu) {
      this._closeOpenMenu();
    }
    clearTimeout(this._closeMenuTimer);
    this._toggleMenu(toggle, menu, 'opened', event);
  }

  _hideMenu(toggle, menu, event) {
    if (this._menuIsClosed(menu) || !this._closeOpenMenu) {
      return;
    }
    this._closeMenuTimer = setTimeout(this._closeOpenMenu, 500);
  }

  _menuIsClosed(menu) {
    return !menu.classList.contains('xc-expanded');
  }

  _createCloseOpenMenu(toggle, menu) {
    this._closeOpenMenu = function() {
      this._toggleMenu(toggle, menu, 'closed');
      this._closeOpenMenu = false;
    }.bind(this);
  }

  _toggleMenu(toggle, menu, forceState, event) {
    var openMenu;
    var menuIsClosed = this._menuIsClosed(menu);

    if (typeof forceState === 'string') {
      openMenu = forceState === 'opened';
    } else {
      openMenu = menuIsClosed;
    }

    if ((openMenu && menuIsClosed) || (!openMenu && !menuIsClosed)) {
      this._setMenu(toggle, menu, openMenu, event);
    }
  }

  _setMenu(toggle, menu, open, event) {
    if (open) {
      this._focusCloseListener = this._toggleMenu.bind(this, toggle, menu, 'closed');
      if (menu.hasAttribute('data-hide')) {
        menu.removeAttribute('hidden');
      }
      toggle.addEventListener('focus', this._focusCloseListener);
      this._createCloseOpenMenu(toggle, menu);
    } else {
      if (menu.hasAttribute('data-hide')) {
        var transitionend = function() {
          if (menu.classList.contains('xc-expanded')) {
            return;
          }
          menu.setAttribute('hidden', '');
          menu.removeEventListener('transitionend', transitionend);
        };
        menu.addEventListener('transitionend', transitionend);
      }
      toggle.removeEventListener('focus', this._focusCloseListener);
    }
    this._toggleClass(menu, 'xc-expanded', open);
    toggle.setAttribute('aria-expanded', open);
  }

  _closeItem(listItem, item, event) {
    var type = listItem.getAttribute('data-type');
    listItem.classList.add('xc-dismissed');
    listItem.addEventListener('transitionend', function() {
      this.style.display = 'none';
    });
    this.fire('dismissed-clicked', {type: type, item: item});
    this._updateNotificationCount();
  }

  signOut() {
    this.fire('signout-clicked', {});
  }

  _setupNotificationsListeners() {
    var menu = this.$('notifications-ul');
    var toggle = this.$('notification-count--container');
    var showNotifications = this._showMenu.bind(this, toggle, menu);
    var hideNotifications = this._hideMenu.bind(this, toggle, menu);

    this.nodesForEach('.xc-header--notifications-ul a', function(link) {
      link.addEventListener('focus', showNotifications);
      link.addEventListener('blur', hideNotifications);
    });
    toggle.addEventListener('mouseover', showNotifications);
    menu.addEventListener('mouseover', showNotifications);
    toggle.addEventListener('mouseout', hideNotifications);
    menu.addEventListener('mouseout', hideNotifications);
  }

  _setupMenuListeners(container, menu) {
    var toggle = container.querySelector('button');
    menu.querySelector('li:last-child a').addEventListener('blur', this._toggleMenu.bind(this, toggle, menu, 'closed'));
    toggle.setAttribute('aria-haspopup', 'true');
    toggle.setAttribute('aria-expanded', 'false');

    container.addEventListener('mouseover', this._showMenu.bind(this, toggle, menu));
    container.addEventListener('mouseout', this._hideMenu.bind(this, toggle, menu));
    toggle.addEventListener('click', this._toggleMenu.bind(this, toggle, menu, null));
  }

  _setupListeners() {
    this.$('hamburger').addEventListener('click', this._toggleHamburger);
    this.$('signin-signout-link').addEventListener('click', this.signOut.bind(this));
    this.$('skip').addEventListener('click', this._linkToLocation.bind(this));
    this._setupMenuListeners(
      this.$('personal-li.personal-more'),
      this.$('more-ul')
    );
  }

  _linkToLocation(event) {
    var location = event.currentTarget.hash;
    var target = this.querySelector(location);

    event.preventDefault();
    target.scrollIntoView();
    target.focus();
  }

}
customElements.define(XCHeader.is, XCHeader);
