"use strict";

var step_utils = require('./step_utils');

var DBG = !!process.env.DBG;

module.exports.Task = Task;

function Task(request, response, config, steps) {
  this.request = Object.freeze(request);
//  this.response = Object.freeze(response);
  this.response = response;
  this.config = Object.freeze(config);
  this.allSteps = Object.freeze(steps);
  this.store = {};
}

Task.prototype.start = _start;
Task.prototype.run = _run;

Task.prototype.error = _error;
Task.prototype.wait = _wait;
Task.prototype.end = _end;
Task.prototype.next = _next;
Task.prototype.insert = _insert;

function error(err) {
  console.log("ERROR:", err);
  process.exit(1);
}

function _start() {  
  var start_id = this.config.start_width_step || 'steps/router';
  var start = this.allSteps[start_id];
  if (!start) error("Task start step " + start_id + " undefined");
  if (DBG) console.log("Task started with step", start_id);

  this.run([start], function(err) {
    if (err && err.warn) console.log('WARN:', err);
    if (err) error(err);
    
    if (DBG) console.log("Task ended");
  });
}

function _run(steps, cb) {
  if (DBG) console.log("Running steps", steps);
  
  var that = this;
  var callbackInvoked;
  if (steps.length) steps[0](that, function(err, result) {
    if (DBG) console.log("Step", steps[0].stepId, "called back");        
    callbackInvoked = true;
    
    // error happened
    if (err) return cb(err);
    
    // signaled delayed return: ignore
    if (result === '') return;
    
    // remove completed step
    steps.shift();
    
    // false: end task
    if (result === false) return cb(null);
    
    // true: continue with next steps    
    if (result === true) return that.run(steps, cb);
    
    // else: prepend new steps and continue running
    steps = step_utils.prepend(result, steps, that.allSteps);
    if (steps) return that.run(steps, cb);
    else return cb({warn: 'step ' + steps[0], what: result});
  });
  else return cb(null);
  
  if (!callbackInvoked)
  cb(steps[0].name + ': Step not completed correctly. Call one of these '
    + 'functions to complete a task cleanly: task.next(cb), task.end(cb), '
    + 'task.wait(cb) or task.insert(cb, ...).');
  
  // TODO handle if a step called back more than once
}

function _error(cb, err) {
  if (!err) err = new Error("Unknown");
  cb(err);
}

function _wait(cb) {
  cb(null, '');
}

function _end(cb) {
  cb(null, false);
}

function _next(cb) {
  cb(null, true);
}

// Todo use arguments
function _insert(cb, what) {
  cb(null, what);
}


