"use strict";

exports.index = hello;

function hello(task, cb) {
  var DBG = task.config.DBG;
  
  task.response.writeHead(404, {'Content-Type': 'text/plain'});
  task.response.end('Not found\n');
  
  task.end(cb);
}

