'use strict';

var fs = require('fs');
var path = require('path');
var isFunction = require('./utils').isFunction;

var DBG = !!process.env.DBG;

exports.getStepDirectories = getStepDirectories;
exports.loadSteps = loadSteps;
exports.insertSteps = insertSteps;
exports.getStore = getStore;

function getStepDirectories(config) {
  return ((config.server && config.server.include) || 'steps').split(/\s+/);
}

function loadSteps(config, dirs) {
  var steps = {};
  
  // Load core steps from lib/steps
  loadStepsFrom(__dirname, 'steps');
  
  // Load more steps as configured in server.include
  var base = path.resolve(path.dirname(config.config_dirname));
  for (var d = 0; d < dirs.length; d++) loadStepsFrom(base, dirs[d]);

  return steps;
  
  function loadStepsFrom(base, dir) {
    var files = fs.readdirSync(base + '/' + dir);
    
    if (DBG) console.log('Loading steps from directory', dir);
    if (DBG) console.log('  files:', files.join(" "));
    
    for (var f = 0; f < files.length; f++) load(base, dir, files[f]);
  }
  
  // TODO don't allow overwrites
  // TODO replace / by . for subdirectories
  function load(base, dir, file) {
    var fullPath = base + '/' + dir + '/' + file;
    var basename = path.basename(file, '.js');
    var preId = dir + (basename == 'index' ? '' : '.' + basename);
    
    try { var stat = fs.statSync(fullPath); }
    catch (err) {
      console.log("WARN: " + fullPath + ' ' + err.message);
      return;
    }
    
    if (stat.isFile()) requireStep(fullPath, preId);
    else if (stat.isDirectory()) pushSubDirectory(fullPath);
    else console.log("WARN: " + fullPath + " neither file nor directory");
  }
  
  function requireStep(fullPath, preId) {                 
    var stepModule = require(fullPath);
    var keys = Object.keys(stepModule);
    for (var k = 0; k < keys.length; k++) {
      var step = stepModule[keys[k]];
      if (isFunction(step)) {
        var id = preId + '#' + keys[k];                 
        step.stepId = id;
        steps[id] = step;
        
        // Special handling of index
        if ('index' == keys[k]) {
          steps[preId] = step;
          step.stepId = preId;
        }
        
        if (isFunction(step.init)) step.init(config);
      }
    }
  }
  
  function pushSubDirectory(fullPath) {
    dirs = dirs.push(path); // also load subdirectories
  }
  
}

function insertSteps(insertee, steps, all) {
  if (Array.isArray(insertee)) return insertArray(insertee, steps, all);
  if (isFunction(insertee)) return insertFunction(insertee, steps);
  return insertId(insertee, steps, all);
}

function insertId(id, steps, all) {
  if (all[id] && isFunction(all[id])) return insertFunction(all[id], steps);
}

function insertArray(array, steps, all) {
  array.map(function(insertee) { insertSteps(insertee, steps, all) });
  
  return steps;
}

// Todo better id'ing for anonymous steps
function insertFunction(step, steps) {
  if (!step.stepId) step.stepId = createStepId(step);
  if (DBG) console.log("Inserted step", step.stepId);
  steps.push(step);
  return steps;
}

function getStructuredStack() {
  var stack;
  
  var limit = Error.stackTraceLimit;
  Error.stackTraceLimit = Infinity;
  Error.prepareStackTrace = function(error, trace) { stack = trace };
  function Capturer() { Error.captureStackTrace(this, Capturer) };
  ;(new Capturer).stack;
  delete Error.prepareStackTrace;
  Error.stackTraceLimit = limit;
  
  return stack;
}  

// todo does not work if a file has more than a dynamic step
// => perhaps use pos (not documented)
function createStepId(step) {
  var stack = getStructuredStack();
  var stepString = step.toString();
  var name = step.name || "";
  for (var i = 0; i < stack.length; i++) {
    if (stack[i].getFunction().toString().indexOf(stepString) >= 0) {
      // todo same path as the other steps (like views/hello instead of hello)
      var file = path.basename(stack[i].getFileName(), '.js');
      var line = stack[i].getLineNumber();
      var column = stack[i].getColumnNumber();
      return file + '#' + name + '/' + line + '/' + column;
    }
  }
  console.log("Did not find the file of the function");
  return "dummy_id"; // TODO create unique id by introspection
}

function getStore(task, step) {
  if (!step.id) step.id = createId(step);
  return task.store[id];
}
