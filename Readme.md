# Preliminary note

This project is abandoned. I still think there are good ideas in it but:

- It's too complicated
- I don't have enough time
- It attacks connect.js

It was an interesting experience to develop it. I learnt a lot.

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

 * Asynchronous handling of middleware is confusing.
 * Middleware is a misnomer, because steps also do work in the frontend
   (render views) and in the backend (access database). So let's call them
   **steps**.
 * Verification and insightful error messages are helpful to fix bugs.
 * Introspection and verification need identifiable middleware.
 * Steps can be both sequenced synchronously or started asynchronously.
 * My god it's full of steps!
   
## Facts

 * Steps is a node.js server framework.
 * A task is a request and its response.
 * A step is an identifiable minimal unit of work for a task.
 * A step is formally a function taking a task and a callback.
 * A step is given a short human-readable meaningful ID like views.Hello.
 * A task starts with a given first step.
 * The step runner verifies correct completion of steps and tasks.
 * Each step has its own store to save state.
 * A step declares its work as completed with error(), next() or end().
 * A step declares that it does work asynchronously with wait().
 * A step can declare pre- and post-dependencies.
 * A step injects steps (e.g. a router) with insert() or append().
 * The router, controllers, views and models are steps.
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
