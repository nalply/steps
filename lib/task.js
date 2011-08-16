"use strict";

require('colors');

var stepper = require('./stepper');
var utils = require('./utils');

var DBG = !!process.env.DBG;

module.exports.Task = Task;

function Task(request, response, config, steps) {
  this.request = Object.freeze(request);
  this.response = freezedResponse(response);  
  this.config = Object.freeze(config);
  this.allSteps = Object.freeze(steps);
  
  // It is difficult to protect objects of other steps. Let's say I freeze
  // store shims of other steps, and the step stores a mutable object, then
  // the evil step cannot delete the object but mutate it. To provide read-
  // only-shims I would have to dynamically create frozen shims on each
  // property access.
  // Scheme:
  // 1. Have a mutable store in a closure variable unaccessible by steps.
  // 2. Make two read-only properties myStore and store.
  // 3. myStore retrieves a closure variable. run() let point the variable
  //    to the step's own store.
  // 4. store retrieves a closure variable. run() creates a frozen shim of
  //    the mutable store populated with read-only properties creating frozen
  //     shims dynamically and let point the variable to the shim.
  // So, myStore is changed to the step's own mutable store dynamically and
  // store is recursively readable but not mutable. 
  // UNCLEAR: can Javascript have a property returning functions?
  this.store = {};
  
  Object.freeze(this);
}

Task.prototype.start = _start;
Task.prototype.run = _run;

Task.prototype.error = _error;
Task.prototype.wait = _wait;
Task.prototype.end = _end;
Task.prototype.next = _next;
Task.prototype.insert = _insert;

function freezedResponse(response) {
  var shim = {};
  
  // todo use readonly-property for functions
  [ 'writeContinue', 'writeHead', 'setHeader', 'getHeader', 'removeHeader',
    'write', 'addTrailers', 'end', 'destroy', 'on', 'once',
  ].forEach(function(name) { shim[name] = response[name].bind(response) });
  
  [ 'writable', 'statusCode' ].forEach(function(name) {
    Object.defineProperty(shim, name, {
      get: function() { return response[name] },
      set: function(value) { response[name] = value },
      enumerable: true,
    });
  });

  return Object.freeze(shim);
}


function _start() {
  var start = this.allSteps[this.config.server.start];
  if (!start) utils.fatal("Step " + this.config.server.start + " unavailable");

  this.run([start], function(err) {
    if (err && err.warn) utils.warn(err.what); // TODO a bit clumsy
    else if (err) utils.fatal(err);
  });
}

// Todo append a default http closing step (maybe causing a 500 and a warn)

function _run(steps, cb) {
  if (DBG) console.log(' run() '.grey.inverse, 
    steps.map(function(step) { return step.stepId } ).join(" "));
  
  var that = this;
  var counter = 0;
  
  // Step verification
  var calledBack; // TODO use object with key = counter + step.stepID
  var ended = false;
  
  if (steps.length == 0) {
    if (ended) return cb(null); // loop has ended correctly
    else cb('No more steps, but no step called task.end()');
  }
  
  if (DBG) console.log(' ====> '.cyan.inverse, steps[0].stepId);        
  steps[0](that, function(err, param) {
    calledBack = true;
    
    if (err) {
      if (DBG) console.log(' X <== '.red.inverse, steps[0].stepId);        
      return cb(err);
    }
 
    if (param === WAIT) {
      if (DBG) console.log('√ wait '.grey.inverse, steps[0].stepId); 
      return;
    }
    
    if (param === INSERT) {
      if (DBG) console.log(' √ ins '.grey.inverse, steps[0].stepId); 
      
      var oldStep = steps[0];
      var insertees = Array.prototype.slice.call(arguments, 2);
      steps = stepper.insertSteps(insertees, steps, that.allSteps);
      console.log("Inserted", insertees.join(' '), '-->', 
        steps.map(function(step) { return step.stepId + '()'}).join(' ')
      );
    
      calledBack = false; // because insert() still needs a next()
      
      return steps ? undefined : cb({warn: 1, 
        what: oldStep.stepId + ': could not insert ' + arguments[2]});
      // TODO problem with more than a step TODO check should be fixed now
    }
    
    var doneStep = steps.shift();
    
    if (param === END) {
      if (DBG) {
        console.log(' √ <== '.green.inverse, doneStep.stepId); 
        console.log('  end  '.green.inverse, '\n');
      }
      ended = true;
      return cb(null);
    }
    
    if (param === NEXT) {
      if (DBG) console.log(' √ <== '.green.inverse, doneStep.stepId); 
      return that.run(steps, cb);
    }
    
    cb(doneStep.name + ': Step not completed correctly. Task.run() got a bogus'
      + ' callback: 2nd parameter is: ' + param);
  });
  
  if (!calledBack) cb(steps[0].name + ': Step not completed correctly.'
    + ' Call one of the task methods complete a task cleanly: next(cb),'
    + ' end(cb), wait(cb), insert(cb, ...) or wait(cb, ...).');
  
  // TODO handle if a step called back more than once (using a key of the
  // step id and the step run counter)
}

function _error(cb, err) {
  if (!err) err = new Error("Unknown");
  cb(err);
}

// Starting with dot because step ids don't start with dot.
var WAIT = '.wait', END = '.end', NEXT = '.next';
var INSERT = '.insert', APPEND = '.append';

function _wait(cb) {
  cb(null, WAIT);
}

function _end(cb) {
  cb(null, END);
}

function _next(cb) {
  cb(null, NEXT);
}

// Todo use arguments
function _insert(cb, what) {
  cb(null, INSERT, what);
}


