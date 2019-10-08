/* global a11ySuite */
/* eslint no-unused-vars: 0 */
if ('customElements' in window) { // Chrome
  document.write('\x3Cscript src="/dist/polaris.prod.en.js">\x3C/script>');
} else if (/Trident/.test(navigator.userAgent)) { // IE
  document.write('\x3Cscript src="/dist/polaris.polyfill-ie.prod.en.js">\x3C/script>');
} else { // Everything else - Firefox, Safari, Edge, etc
  document.write('\x3Cscript src="/dist/polaris.polyfill.prod.en.js">\x3C/script>');
}

function isHidden(el) {
  return (el.offsetParent === null);
}

// Add a11yhelper
function createFixtureMock() {
  var mockFixture = document.createElement('div');
  mockFixture.create = function() {};
  mockFixture.restore = function() {};
  mockFixture.setAttribute('id', 'fixtureMock');
  document.body.appendChild(mockFixture);
}

function a11ySuiteTest() {
  createFixtureMock();
  a11ySuite('fixtureMock');
}
