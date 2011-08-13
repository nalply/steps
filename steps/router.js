"use strict";

exports.index = router;

function router(task, cb) {
  var DBG = task.config.DBG;
  
  if (DBG) console.log("Router started. NOTE: Hardcoded routing.");
  
  // TODO router logic
  
  if (DBG) console.log("Router inserting dummy intermediate step...");  
  task.insert(cb, function(task, cb) {
    if (DBG) console.log("Dummy intermediate step started.");
    if (DBG) console.log("Router inserting step 'views/hello'...");
    task.insert(cb, 'views/hello');
  });
}

