"use strict";

require('colors');

exports.isFunction = isFunction;
exports.mergeTo = mergeTo;
exports.clone = clone;
exports.values = values;
exports.keyOf = keyOf;
exports.fatal = fatal;
exports.warn = warn;

// todo add to function prototype but not as own property
function isFunction(o) {
  return !!(o && o.constructor && o.call && o.apply);
}

function mergeTo(mergeTo, mergeFrom) {
  var keys = Object.keys(mergeFrom), n = keys.length;
  for (var i = 0; i < n; i++) mergeTo[keys[i]] = mergeFrom[keys[i]];
  return mergeTo;
}

function clone(object) { return mergeTo({}, object) }

function fatal(err) {
  console.log(" FATAL ".inverse.red, err);
  process.exit(1);
}

function warn(msg) {
  console.log("  WARN ".inverse.red, msg);
}

// Same as Object.keys() but returns values, not keys.
function values(object) {
  return Object.keys(object).map(function(key) { return object[key] });
}

// Same as Array.indexOf() but for objects.
function keyOf(object, value) {
  for (var key in object) if (object[key] === value) return key;
}

