"use strict";

exports.index = function() {};
exports.index.init = function() {
  Error.stackTraceLimit = Infinity;
  console.log("Error.stackTraceLimit set to Infinity");
}
