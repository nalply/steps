"use strict";

var readFileSync = require('fs').readFileSync;
var parse = require('yamlet').parse;
var utils = require('./utils');

exports.Config = Config;
exports.readConfigSync = readConfigSync;

// Todo 1: don't overwrite config settings. Example:
// steps.Router:
//   - GET / views.Hello
// steps.Router:
//   aggressive: true
// Todo 2: problems with lines containing only spaces.

function readConfigSync(path) {
  var config = Object.create(Config);
  
  // ugly hack with \n because of a yamlet issue
  var configString = '\n' + readFileSync(path, 'utf8');
  var configData = deepen(directives(parse(configString)));
  
  return utils.mergeTo(config, configData);
}

// Todo
// Directives are keys starting with a dot, like this: .include: file
function directives(data) {
  return data;
}

// Deepen keys like so: alpha.beta: {} ==> alpha: { beta: {}}
// Warning: fails for objects with cycles. objects from yamlet.parse() are ok.
function deepen(object) {
  var keys = Object.keys(object);
  for (var k = 0; k < keys.length; k++) {
    var dot = keys[k].indexOf('.');
    if (dot > 0) { // note not >= 0 because .alpha is not deepened
      deepenKey(object, keys[k], dot);
    }
  }
  
  return object;
}

function deepenKey(object, key, dot) {
  var deepenedKey = key.substring(0, dot);
  var restKey = key.substring(dot + 1);
  if (!restKey) return;
  
  if ("undefined" == typeof object[deepenedKey]) object[deepenedKey] = {};
  object[deepenedKey][restKey] = object[key];
  delete object[key];
  
  deepen(object[deepenedKey]);
}

var Config = {};

Config.get = get;

function get(key) {
  var config = this, keys = key.split(".");
  
  for (var i = 0; i < keys.length && config; i++) config = config[keys[i]];
  
  return config;
}
  
  
