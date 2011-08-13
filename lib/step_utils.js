'use strict';

var fs = require('fs');
var path = require('path');

var DBG = !!process.env.DBG;

exports.getStepDirectories = getStepDirectories;
exports.loadSteps = loadSteps;
exports.prepend = prepend;
exports.getStore = getStore;

function getStepDirectories(config, dirname) {
  return config.steps_include_path.split(/\s+/);
}

function loadSteps(config, dirs, dirname) {
  var steps = {};
  
  for (var i = 0; i < dirs.length; i++) {
    var files = fs.readdirSync(dirname + '/' + dirs[i]);
    
    if (DBG) console.log('Loading steps from', dirs[i]);
    if (DBG) console.log('  files:', files.join(" "));
    
    // TODO refactor this triply nested loop
    // TODO don't allow overwrites
    for (var j = 0; j < files.length; j++) {
      var base = path.basename(files[j], '.js');
      var key = dirs[i] + (base == 'index' ? '' : '/' + base);
      try {
        var fullPath = dirname + '/' + dirs[i] + '/' + files[j];
        var stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          var step = require(fullPath);
          var keys = Object.keys(step);
          for (var k = 0; k < keys.length; k++) {
            var stepKey = keys[k];
            var id = key + '?' + stepKey;
            if ("function" == typeof step[stepKey]) {
              step[stepKey].stepId = id
              steps[id] = step[stepKey];
              if ('index' == stepKey) steps[key] = step.index;
            }
          }
        }
        else if (stat.isDirectory()) {
          dirs.push(path); // also load subdirectories
        }
        else {
          console.log("WARN:" + fullPath + " neither file nor directory");
        }
      }
      catch (err) {
        console.log("WARN:" + fullPath + ' not available: ' + err.message);
      }
    }
  }
  
  return steps;
}

function prepend(result, steps, all) {
  if (Array == result.constructor) return prependArray(result, steps, all);
  if ('function' == typeof result) return prependFunction(result, steps);
  if ('string' == typeof result) return prependId(result, steps, all);
  
  if (DBG) console.log("prepend() returned undefined");
}

function prependId(id, steps, all) {
  var step = all[id];
  if (DBG) console.log("prepend", id, "=>", step);  
  if (step && 'function' == typeof step) return prependFunction(step, steps);
  
  if (DBG) console.log("prependId() returned undefined");
}

function prependArray(array, steps, all) {
  if (array.length) {
    var newSteps = prepend(array[array.length - 1], steps, all);
    if (newSteps) {
      array.shift();
      return prependArray(array, newSteps, all);
    }
    if (DBG) console.log("prependArray() returned undefined");
  }
  else return steps;
}

function prependFunction(step, steps) {
  if (!step.stepId) step.stepId = createStepId(step);
  if (DBG) console.log("prependFunction() step.stepId:", step.stepId);
  return [step].concat(steps);
}

function createStepId(step) {
  return "dummy_id"; // TODO create unique id by introspection
}

function getStore(task, step) {
  if (!step.id) step.id = createId(step);
  return task.store[id];
}
