"use strict";

var utils = require('../utils');

/*!
 * Logger step, adapted from: Connect - logger
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */


/**
 * Log requests with the given `options` or a `format` string.
 *
 * Options:
 *
 *   - `format`  Format string, see below for tokens
 *   - `immediate`  Write log line on request instead of response (for response times)
 *
 * Tokens:
 *
 *   - `:req[header]` ex: `:req[Accept]`
 *   - `:res[header]` ex: `:res[Content-Length]`
 *   - `:http-version`
 *   - `:response-time`
 *   - `:remote-addr`
 *   - `:date`
 *   - `:method`
 *   - `:url`
 *   - `:referrer`
 *   - `:user-agent`
 *   - `:status`
 *
 * Formats:
 *
 *   - `default` ':remote-addr - - [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
 *   - `short` ':remote-addr - :method :url HTTP/:http-version :status :res[content-length] - :response-time ms'
 *   - `tiny`  ':method :url :status :res[content-length] - :response-time ms'
 *   - `dev` concise output colored by response status for development use
 *
 */

exports.index = logger;


function logger(task, cb) {
  var store = task.store(cb);
  
  var loggerConfig = task.config.get(logger.stepId);
  var immediate = loggerConfig.immediate;
  var fmt = loggerConfig.format;
  var out = process.stdout; // no stream config like connect-logger
  
  // no format functions like in connect-logger
  fmt = logger['_' + fmt] || fmt || logger._default;
  if (!utils.isFunction(fmt)) fmt = compile(fmt);
  
  store.startTime = new Date;
  if (immediate) {
    var line = fmt(exports, task);
    if (null == line) return;
    out.write(line + '\n', 'ascii');
    task.next(cb);
  } 
  else {
    var res = task.response;
    var end = res.end;
    res.end = function(chunk, encoding){
      res.end = end;
      res.end(chunk, encoding);
      var line = fmt(exports, task);
      if (null == line) return;
      out.write(line + '\n', 'ascii');
    };
    task.next(cb);
  }
};



/**
 * Compile `fmt` into a function.
 *
 * @param {String} fmt
 * @return {Function}
 * @api private
 */
function compile(fmt) {
  fmt = fmt.replace(/"/g, '\\"');
  var js = '  return "' + fmt.replace(/:([-\w]{2,})(?:\[([^\]]+)\])?/g, 
    function(_, name, arg) {
      return '"\n + (tokens["' + name + '"](task, "' + arg + '") || "-") + "';
    }) + '";'
  ;
  return new Function('tokens, task', js);
};


/**
 * Define a token function with the given `name`.
 *
 * @param {String} name
 * @param {Function} f
 * @return {Object} exports for chaining
 * @api public
 */
logger.token = function(name, f) {
  logger['_' + name] = f;
  return this;
};


/**
 * Define a `fmt` with the given `name`.
 *
 * @param {String} name
 * @param {String|Function} fmt
 * @return {Object} exports for chaining
 * @api public
 */
logger.format = function(name, str) {
  logger['_' + name] = str;
  return this;
};


logger.format('default', 
  ':remote-addr - - [:date] ":method :url HTTP/:http-version" :status'
  + ' :res[content-length] ":referrer" ":user-agent"');


logger.format('short',
  ':remote-addr - :method :url HTTP/:http-version :status :res[content-length]'
  + ' - :response-time ms');


logger.format('tiny',
  ':method :url :status :res[content-length] - :response-time ms');


logger.format('dev', function(tokens, task) {
  var status = task.response.statusCode, color = 32;

  if (status >= 500) color = 31
  else if (status >= 400) color = 33
  else if (status >= 300) color = 36;

  return '\x1b[90m' + task.request.method
    + ' ' + task.request.originalUrl + ' '
    + '\x1b[' + color + 'm' + task.response.statusCode
    + ' \x1b[90m'
    + (new Date - task.config.get(logger.stepId).startTime)
    + 'ms\x1b[0m';
});


logger.token('url', function(task) {
  return task.request.originalUrl;
});


logger.token('method', function(task) {
  return task.request.method;
});


// response time in milliseconds
logger.token('response-time', function(task) {
  return new Date - task.config.get(logger.stepId).startTime;
});


// UTC date
logger.token('date', function() {
  return new Date().toUTCString();
});


logger.token('status', function(task) {
  return task.response.statusCode;
});


// normalized referrer
logger.token('referrer', function(task) {
  return task.request.headers['referer'] || task.request.headers['referrer'];
});


logger.token('remote-addr', function(task) {
  return task.request.socket && (task.request.socket.remoteAddress || 
    (task.request.socket.socket && task.request.socket.socket.remoteAddress));
});


logger.token('http-version', function(task) {
  return task.request.httpVersionMajor + '.' + task.request.httpVersionMinor;
});


logger.token('user-agent', function(task) {
  return task.request.headers['user-agent'];
});


logger.token('req', function(task, field) {
  return task.request.headers[field.toLowerCase()];
});


logger.token('res', function(task, field){
  return (task.response._headers || {})[field.toLowerCase()];
});

