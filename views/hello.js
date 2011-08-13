"use strict";

exports.index = hello;

function hello(task, cb) {
  var DBG = task.config.DBG;
  
  if (DBG) console.log("Step 'view/hello' started");
  if (DBG) console.log("ID of this step:", arguments.callee.stepId);
  
  task.response.writeHead(200, {'Content-Type': 'text/plain'});
  task.response.end('Hello World!\n');
  
  console.log("hello did its work"); // Should be a logger step
  task.end(cb);
}

