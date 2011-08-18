# Introduction

Steps is a node.js server framework. The step is the core concept of the
framework. What does «step» mean?

- A step is a minimal unit of work to handle a task.
- Formally a step is a function taking a task object and a callback.
- Steps are uniquely identifiable (even if the same step is used twice).
- The step runner manages clean asynchronous completion of the steps.

What is a «task»?

- A task is created when a request comes in.
- The task contains everything what a steps might need about a request:
  - The request object shim
  - The response object shim with events
  - A list of all available steps
  - The complete configuration
  - The store for temporary task information
  - Helper methods to interact with the step runner
- To ensure cooperation between steps, the request and the response objects
  are protected.
  - For temporary data use the store. 
  - Do not monkey-patch. Use the response object shim events.

A configuration file defines the server and its steps. The configuration
has a key-value structure. The keys are the steps ids and the values
the step-specific configurations. Additionally there is the `servers` key
to configure the server instances.

On server start up all steps in the include path are required and initialized.
Then the configured servers are started. When a request comes in, the task
object is created and the step runner starts running the steps.

If configured, a router or a vhost step injects more steps depending on the
url or the host header. The router and the vhost steps are, like all other
steps, configured using their step ids. The router configuration contains
a list of routes and to each route a list of steps to be executed if a route
matches.

TODO: response object shim does not yet have events.

TODO: include directive (for example for separate configuration of virtual
hosts).

TODO: currently there is only one server.

# About Steps

Steps need to be loaded into the application and identified uniquely. Also
what does it mean that a step is a function taking a task and a callback?
How are steps initialized? How are they managed by the step runner? What
happens if the same step is used twice?

## Step loading

In the beginning the step loader recursively walks the include path
`server.include` and also `lib/steps` for the core steps. Steps are also
injected dynamically.

## Step identification

All steps have an unique identification. Steps loaded from the include path
get an identification of the form:

`<include>.<sub-path>.<module>#<export>;<version>`

- **include** one of the items in the include path, eg. `steps` or `views`.
- **sub-path** the sub-path, omitted for toplevel steps. Replace the directory
  separator by a dot. Example: `views/news/posts/edit.js` → `news.posts`.
- **module** the filename without `.js`, omitted if `index`. Example:
  `views/news/posts/edit.js` → `edit`.
- **export** one of the module exported Javascript identifiers, omitted with
  preceding hash if `index`.
- **version** the version id of same steps in the task, omitted if there is
  only one same step. If the same step is used more than once, the first step
  gets version `first`, and the other must be given unique names, like this:
  `steps.Logger;detailed`.

Steps injected dynamically get an identification of the form:

`.<module-id>#<function>.<position>;<version>`

- Note the leading dot to ensure uniqueness between loaded and injected steps.
- **module-id** the module module-id of the code doing the injecting.
- **function** the name of the function, omitted if anonymous.
- **position** the code position. Not yet clear whether this is technically
  possible at all. Important is a unique identification within the module, no
  matter how. As a compromise, use 10 randomly selected Base64 characters.
- **version** same as above, the version id.

### Examples (assuming `server.include: views actions models`)

- `steps.Logger` the first logger, uses the index() function in
  `lib/steps/Logger.js`.
- `steps.Logger;detailed` the detailed logger additionally to the first one,
   also uses the index() function in `lib/steps/Logger.js`.

### Usage

Because all steps are uniquely identifiable, even two steps of same class
(with version), it is possible to give them centralized configuration. Let's
say we have two Loggers: `steps.Logger` and `steps.Logger;detailed`, then we
can have the configuration:

    steps.Logger:
      format: short
    steps.Logger;detailed:
      format: dev
      immediate: true

## Step function

A step is formally a function taking two arguments: `task` and `cb`. The step
follows this protocol:

- A step must not return synchronously before having called one of:
  - `task.next(cb)`
  - `task.end(cb)`
  - `task.error(cb, error)`
  - `task.wait(cb)`
  
- A step might have asynchronous work. It must call `task.wait()` before
  returning and later call one of:
  - `task.next(cb)`
  - `task.end(cb)`
  - `task.error(cb, error)`

- A step is not allowed to call one of these methods more than once.

- A step can inject other steps by calling `task.insert(cb, steps)` and
  `task.append(cb, steps)`.

The step runner detects if a step did not call one of the compulsive methods
and will log a warning and/or produce a 500. TODO: works only partially.

## Step initialization

A step can be initialized when the application gets booted up. If the step
function has a property `init`, which is a function, it is called with
`config`, which is the step's own configuration.

### Example with initialization

Let's say we have the file `examples/StackTraceLimit.js`:

    exports.index = function() {};
    exports.index.init = function(config) {
      var value = config.get(exports.index.stepId).limit
      Error.stackTraceLimit = value;
      console.log("Initialization: Error.stackTraceLimit set to", value);
    }

and the configuration

    examples.StackTraceLimit:
      limit: Infinity

and also the step being injected somewhere, then the application will be set 
`Error.stackTraceLimit` to `Infinity`.

## Step versions

Step versions are not initialized separately. Let's say we have steps
`steps.Logger;first` and `steps.Logger;detailed`. `logger.init()` is called
only once and its `stepId` is `steps.Logger`. Initialization must prepare
for all versions. When running, the step can use:

- `task.config(cb)` get the config of the step only. Two step versions of same
  step will get two different configs.
- `task.store(cb)` get the store of the step only. Two step versions of same
  step will get two different stores. TODO.
- `task.id(cb)` get the step id with version. TODO.

This way the step knows which version it is running on.

## Step dependencies

A step can declare pre-dependencies, i. e. it expects steps to be ran before
it can do its work and post-dependencies, i. e. it expects steps to be ran
after it. TODO.

## The step runner

TODO.

# About the configuration file

TODO.

# About tasks

TODO.

