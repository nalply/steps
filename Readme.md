# Steps

A node.js web server stepping through requests and responses.
 
    server.listen: 0.0.0.0:2000
    server.start: steps.Router
    server.include: steps views
    
    steps.Router:
      - get / views.Hello
      - all views.404
    
    views.Hello:
      title: Hello World!
    
    steps.StackTraceLimit:
      limit: 20
          
Note! Steps is pre-alpha.

## Rationale

 * Asynchronous handling of a web request is confusing.
 * Steps can be both sequenced synchronously or started asynchronously.
 * Verification and insightful error messages are helpful to fix bugs.
 * Introspection and verification need identifiable middleware.
 * Middleware is a misnomer, because steps also work in the frontend (render
   views) and in the backend (access database).
 * My god it's full of steps!
   
## Facts

 * A step is an identifiable minimal unit of work for a web request.
 * A step is formally a function taking a task and a callback.
 * A request starts with a predefined first step.
 * A step can inject other steps into the task, like a router or a vhost steps.
 * A step can declare pre- and post-dependencies.
 * A step declares its work as completed with error(), next(), end().
 * The step runner verifies correct completion of steps and tasks.
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
