"use strict";

var colors = require('colors');

// todo: solve problem with including from steps
// perhaps like this: core steps use relative paths
// other steps use direct paths (because of node_modules)
var utils = require('../lib/utils');

exports.index = router;
exports.index.init = initRouter;
exports.index.methods = Methods;

var DBG;

function router(task, cb) {
  var steps = route(task.request);
  if (DBG) console.log('Routing url', task.request.url, 'to', steps.join(' '));  
  task.insert(cb, steps);
  task.next(cb);
  
}


/* Router configuration example:

steps.Router:
  - get /             views.Hello
  - get /video/:hash  views.Video
  - method GET /example views.Example
  - resources videos
  - rx ^/videos?/([a-z0-9]+)$
  
The methods are exported like this: exports.index.methods.get, etc.
*/

var routes;

function initRouter(config) {
  DBG = config.server.DBG;
  
  if ("undefined" != typeof routes) utils.fatal("routes already configured");
  
  routes = [];
  var routesConfig = config.get(router.stepId);
  for (var i = 0; i < routesConfig.length; i++) {
    var params = routesConfig[i].split(" ");
    var method = params[0];
    if (!utils.isFunction(Methods[method])) {
      utils.warn(method + " not a router method, ignoring route");
      continue;
    } 
    routes.push({ method: Methods[method], params: params.slice(1) });
  }
  
  if (DBG) console.log("Routes:", routesToString(routes));  
}

function route(request) {
  for (var i = 0; i < routes.length; i++) {
    var match = routes[i].method(request, routes[i].params);
    if (match) return match;
  }
}

function routesToString(routes) {
  if (!routes.length) return 'empty'.red;
  var s = '\n';
  for (var i = 0; i < routes.length; i++) 
    s += utils.keyOf(Methods, routes[i].method).green
      + ' ' + routes[i].params.join(" ") + "\n";

  return s;
}

var Methods = {};

Methods.get = matchUrl.bind({}, 'GET');
Methods.post = matchUrl.bind({}, 'POST');

function matchUrl(method, request, params) {
  if (params[0].indexOf(':') > 0)
    utils.warn('urls with parameters not yet supported');
  
  return request.url === params[0] && request.method === method 
    ? params.slice(1) : false;
}

Methods.all = function(request, params) {
  return params;
}


