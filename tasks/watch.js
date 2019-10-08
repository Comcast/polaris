const chokidar = require('chokidar');
const url = require('url');
const browserSync = require('browser-sync');
const build = require('./build.js');
const env = 'prod';
const browsersWithCustomElements = /Chrome|AppleWebKit.*Version\/10\.[1-9]/;

const reloadPolaris = browserSync.reload.bind(
  this,
  './dist/polaris.' + env + '.js'
);

const getLanguage = function(req) {
  const lang = req.headers['accept-language'];
  const firstLanguage = /^(.+?),/.exec(lang);

  return firstLanguage ? firstLanguage[1].split('-')[0] : 'en';
};

const getBrowser = function(req) {
  const ua = req.headers['user-agent'];
  const hasCustomElements = browsersWithCustomElements.test(ua);

  return hasCustomElements ? '' : 'polyfill.';
};

const getIE = function(req) {
  const ua = req.headers['user-agent'];
  const isIE = /Trident/.test(ua);

  return isIE ? 'legacy.' : '';
};

const updatePolarisPath = function(req, res, next) {
  var fileName = url.parse(req.url);

  if (/polaris\.js/.test(fileName.href)) {
    const polyfill = getBrowser(req);
    const legacy = getIE(req);
    const lang = getLanguage(req);

    req.url = req.url.replace(
      /js$/,
      polyfill + legacy + env + '.' + lang + '.js'
    );
  }
  next();
};

const serverStarted = function(err, bs) {
  const urls = bs.getOption('urls').toJS();
  const hosts = {
    prod: urls['external'],
    staging: urls['external']
  };

  build({dev: true, hosts});

  chokidar
    .watch(['./elements/**/*', './dist/index.html'])
    .on('change', path => {
      if (path.includes('.html')) {
        return;
      }

      const buildEjs = path.includes('.ejs');

      try {
        build({dev: true, hosts, buildLegacy: false, buildEjs});
      } catch (error) {
        console.warn(error);
      }
      reloadPolaris();
    });
};

browserSync(
  {
    server: './dist/',
    port: 3000,
    notify: false,
    middleware: [updatePolarisPath]
  },
  serverStarted
);
process.on('exit', browserSync.exit);
