'use strict';

exports.start = start;

var http = require('http');
var path = require('path');

var readConfigSync = require('./config').readConfigSync;
var createTask = require('./task').createTask;
var utils = require('./utils');
var stepper = require('./stepper');

var DBG = !!process.env.DBG;

function start(configPath) {
  console.log('');
  console.log(new Date());
  if (DBG) console.log("Loading config");
  
  var config = readConfigSync(configPath);
  if (!config.server) utils.fatal("missing key 'server' in configuration");
  if (!config.server.start) utils.fatal("server.start not configured");
  
  config.server.configPath = path.resolve(configPath);
  config.server.DBG = DBG;
  
  if (DBG) console.log(config);
    
  var dirs = stepper.getStepDirectories(config);
  var steps = stepper.loadSteps(config, dirs);
  
  if (DBG) console.log("All steps", Object.keys(steps).join(" "));
  
  var factory = config.server.Factory;
  var server = factory
    ? require(factory.packageName)[factory.functionName]()
    : http.createServer()
  ;
  
  server.on('request', function(request, response) {
    createTask(request, response, config, steps).start();
  });
  
  var listen = (config.server.listen || '127.0.0.1:12345').split(":");
  server.listen(listen[1], listen[0], function() {
    console.log('Now listening at', listen.join(":"));
  });
}


 
