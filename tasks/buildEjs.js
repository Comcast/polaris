'use strict';
const ejs = require('ejs');
const fs = require('fs');

function render(path, data) {
  const markup = fs.readFileSync(path, 'utf8');
  return ejs.render(markup, data, {filename: path});
}

function getData(component, env, dictionary) {
  const data = require(`../elements/${component}/${env}.json`);
  data.lang = function(label) {
    return dictionary[label] || label;
  };
  data.external = function(external) {
    return external ? 'target="_blank"' : '';
  };
  return data;
}

function compile(name, env, dictionary) {
  const path = `./elements/${name}/${name}.ejs`;
  const data = getData(name, env, dictionary);
  const output = render(path, data);
  fs.writeFileSync(path.replace('.ejs', '.html'), output);
}

module.exports = compile;
