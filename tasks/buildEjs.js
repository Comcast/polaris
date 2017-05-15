'use strict';
const ejs = require('ejs');
const fs = require('fs');

function render(path, data) {
  let markup = fs.readFileSync(path, 'utf8');
  return ejs.render(markup, data, {filename: path});
}

function getData(component, env, dictionary) {
  let data = require(`../elements/${component}/${env}.json`);
  data.lang = function(label) {
    return dictionary[label] || label;
  };
  data.external = function(external) {
    return external ? 'target="_blank"' : '';
  };
  return data;
}

function compile(name, env, dictionary) {
  let path = `./elements/${name}/${name}.ejs`;
  let data = getData(name, env, dictionary);
  let output = render(path, data);
  fs.writeFileSync(path.replace('.ejs', '.html'), output);
}

module.exports = compile;
