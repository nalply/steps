"use strict";

exports.index = hello;

function hello(task, cb) {
  var DBG = task.config.DBG;
  
  task.response.writeHead(200, {'Content-Type': 'text/plain'});
  task.response.end(task.config.views.Hello.title + "\n");
  
  console.log("hello did its work"); // Should be a logger step
  task.end(cb);
}

