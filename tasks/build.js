'use strict';
const ejs = require('./buildEjs');
const fs = require('fs');
const rollup = require('rollup').rollup;
const envs = ['prod', 'staging'];
const dist = 'dist';
const hosts = {
  prod: 'https://polaris.xfinity.com',
  staging: 'https://polaris.staging.xfinity.com',
};
const languages = ['en', 'es'];
const components = ['xc-header', 'xc-footer', 'xc-toast'];
const wcPath = './node_modules/@webcomponents';
const customElementsPolyfill = readFile(`${wcPath}/custom-elements/custom-elements.min.js`);
const platformPolyfill = readFile(`${wcPath}/webcomponents-platform/webcomponents-platform.js`);
const babel = require('babel-core');
var rollupConfig = require('../rollup.config.js');

function readFile(name) {
  return fs.readFileSync(name, 'utf8');
}

function writeFile(name, output) {
  return fs.writeFileSync(name, output);
}

function buildComponent(env, language, config) {
  const dictionary = require(`../elements/data/languages/${language}.json`);

  components.forEach(c => {
    ejs(c, env, dictionary);
  });

  return rollup(config).then(bundle => {
    const result = bundle.generate({
      format: 'iife'
    });

    const polyfillOutput = babel.transform(result.code, {
      presets: ['es2015-ie'],
      compact: false,
      retainLines: true,
    });
    writeFile(`${dist}/polaris.polyfill.legacy.${env}.${language}.js`,
      [platformPolyfill, customElementsPolyfill, polyfillOutput.code].join('\n'));

    writeFile(`${dist}/polaris.polyfill.${env}.${language}.js`, customElementsPolyfill + '\n' + result.code);
    writeFile(`${dist}/polaris.${env}.${language}.js`, result.code);
  });
}

function buildComponents(envs, languages, hosts, dev) {
  let chain;

  envs.forEach(env => {
    const config = rollupConfig(hosts[env], dev);

    languages.forEach(language => {
      if (chain) {
        chain = chain.then(buildComponent.bind(null, env, language, config));
      } else {
        chain = buildComponent(env, language, config);
      }
    });
  });

  return chain;
}

function build(options = {}) {
  options.buildLegacy = options.dev ? options.buildLegacy : true;

  if (options.dev) {
    options.languages = languages.slice(0, 1);
    options.envs = options.envs || envs.slice(0, 1);
  }

  buildComponents(options.envs || envs,
    options.languages || languages,
    options.hosts || hosts,
    options.dev);
}
build();

module.exports = build;
