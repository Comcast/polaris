const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const sass = require('rollup-plugin-sass');
const html = require('rollup-plugin-html');
const uglify = require('rollup-plugin-uglify');
const minify = require('uglify-js-harmony').minify;

module.exports = (host, dev) => {
  const spriteUrl = `$sprite: '${host}/sprite.png'; \n`;

  const config = {
    entry: 'elements/index.js',
    moduleName: 'CX',
    format: 'iife',
    dest: 'dist/polaris.js',
    plugins: [
      resolve(),
      commonjs({
        include: 'node_modules/**',
        sourceMap: false
      }),
      html({
        include: 'elements/**/*.html',
        htmlMinifierOptions: {
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          ignoreCustomFragments: [/<!--#[\s\S]*?-->/]
        }
      }),
      sass({
        options: {
          outputStyle: 'compressed',
          data: spriteUrl,
          includePaths: ['./elements/']
        }
      }),
      uglify({}, minify)
    ]
  };
  if (dev) {
    config.plugins.splice(-1);
  }
  return config;
};
