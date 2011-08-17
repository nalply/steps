# Steps application examples

The example applications are themselves npm packages and declare at least the
dependency on steps. To run them they need Steps in node_modules. Do:
`cd <example>; npm update` or link manually upwards: 

    mkdir <example>/node_modules
    cd <example>/node_modules
    ln -s ../../../ steps
    cd ..

Then start with `node <example>.js` or for real insight how the step runner
works (lots of output!) `DBG=1 node <example>.js`.

More examples will follow.

## Hello World

A tiny hello world application. Try `curl localhost:2000/`. You will get the
contents of views.Hello.title  configured in `hello.yaml`. Other urls will
send 404 Not Found.
