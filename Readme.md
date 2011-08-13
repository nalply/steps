# Steps

 A node.js web server stepping through requests and responses.
 
    listen: 0.0.0.0:12345
    start_with_step: steps/router
    steps_include_path: views
    options:
      welcome_text: Hello World!
    steps/router:
      - GET  /                views/index
    views/index:
      title: Hello World!
      
 Note! Steps is pre-alpha.
 
## Rationale

 * Asynchronous handling of a web request is confusing.
 * Configuration of web applications should stay clearly arranged.
 * Introspection and managing facilities of middleware needs a rigid and
   enforceable specification: How to call it? How to identify it? How does it
   hand off control back to the web server?
 * Middleware in Steps is called a step, because there are steps also for the
   frontend and the backend.
   
## Facts

 * Configuration with Yamlet.
 * Builds upon unchanged node.js networking.
 * A step is a minimal building block.
 * A step handles an aspect of a web request.
 * A request starts with the first step which may insert more steps, for
   example the router or a virtual hosting step.
 * A step is a function taking a task and a callback.
 * Steps are composable.
 * A step can declare pre- and post-dependencies.
 * A step ends with error(), next(), end(), append() or insert().
 * For easy debugging correct completion of the steps is enforced.
 * Steps are injected from modules and steps calling append() or insert().
 * The router, controllers, views and models are steps.
 * Each step has its own store to save state.
 * Planned: Introspection of a web request step stack.
 * Planned: Connect middleware adapter.
 * Planned: Simple request and response filtering.
 * Planned: Installation tool for a minimal MVC application to get started.

## License

 Copyright Daniel Ly. All rights reserved.
 
 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 'Software'), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:
 
 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
