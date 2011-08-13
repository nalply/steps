'use strict';

exports.start = start;

var http = require('http');
var fs = require('fs');
var path = require('path');
var yamlet = require('yamlet');

var step_utils = require('./step_utils');
var Task = require('./task').Task;

var DBG = !!process.env.DBG;

function start(configPath) {
  console.log('');
  console.log(new Date());
  if (DBG) console.log("Loading config");
  
  var data = fs.readFileSync(configPath, 'utf8');  
  var config = yamlet.parse("\n" + data); // ugly hack
  config.DBG = DBG;
  
  if (DBG) console.log(config);
    
  var dirname = path.resolve(path.dirname(configPath));
  var dirs = step_utils.getStepDirectories(config, dirname);
  var steps = step_utils.loadSteps(config, dirs, dirname);
  
  if (DBG) console.log("All steps", Object.keys(steps).join(" "));
  
  var serverFactory = config.server_factory;
  var server = serverFactory
    ? require(factory.package)[factory.name]()
    : http.createServer()
  ;
  
  server.on('request', function(request, response) {
    new Task(request, response, config, steps).start();
  });
  
  var listen = (config.listen || '0.0.0.0:64125').split(":");
  server.listen(listen[1], listen[0], function() {
      console.log('Now listening at', listen.join(":"));
  });
}


 
