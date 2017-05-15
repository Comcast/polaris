/* global process */
const chokidar = require('chokidar');
const url = require('url');
const browserSync = require('browser-sync');
const build = require('./build.js');
const env = 'prod';
const browsersWithCustomElements = /Chrome|AppleWebKit.*Version\/10\.[1-9]/;

let reloadPolaris = browserSync.reload.bind(this, './dist/polaris.' + env + '.js');

let getLanguage = function(req) {
  let lang = req.headers['accept-language'];
  let firstLanguage = /^(.+?),/.exec(lang);

  return firstLanguage ? firstLanguage[1].split('-')[0] : 'en';
};

let getBrowser = function(req) {
  let ua = req.headers['user-agent'];
  let hasCustomElements = browsersWithCustomElements.test(ua);

  return hasCustomElements ? '' : 'polyfill.';
};

let getIE = function(req) {
  let ua = req.headers['user-agent'];
  let isIE = /Trident/.test(ua);

  return isIE ? 'legacy.' : '';
};

let updatePolarisPath = function(req, res, next) {
  var fileName = url.parse(req.url);

  if (/polaris\.js/.test(fileName.href)) {
    let polyfill = getBrowser(req);
    let legacy = getIE(req);
    let lang = getLanguage(req);

    req.url = req.url.replace(/js$/, polyfill + legacy + env + '.' + lang + '.js');
  }
  next();
};

let serverStarted = function(err, bs) {
  let urls = bs.getOption('urls').toJS();
  let hosts = {
    prod: urls['external'],
    staging: urls['external'],
  };

  build({dev: true, hosts});

  chokidar.watch(['./elements/**/*', './dist/index.html'])
    .on('change', path => {
      if (path.includes('.html')) {
        return;
      }

      let buildEjs = path.includes('.ejs');

      try {
        build({dev: true, hosts, buildLegacy: false, buildEjs});
      } catch (error) {
        console.warn(error);
      }
      reloadPolaris();
    });
};

browserSync({server: './dist/', port: 3000, notify: false, middleware: [updatePolarisPath]}, serverStarted);
process.on('exit', browserSync.exit);
