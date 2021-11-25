---
prev:
  text: Middleware
  link: middleware
---

# FAQs

## How do I change the listen address?

If you're using the `Run` method to start the web server, you may change the listen address using either the environment variable `FLAMEGO_ADDR`:

```sh:no-line-numbers
export FLAMEGO_ADDR=localhost:8888
```

Or the variable arguments of the `Run` method:

```go:no-line-numbers
f.Run("localhost")       // => localhost:2830
f.Run(8888)              // => 0.0.0.0:8888
f.Run("localhost", 8888) // => localhost:8888
```

Alternatively, [`http.ListenAndServe`](https://pkg.go.dev/net/http#ListenAndServe) or [`http.ListenAndServeTLS`](https://pkg.go.dev/net/http#ListenAndServeTLS) can also be used to change the listen address:

```go:no-line-numbers
http.ListenAndServe("localhost:8888", f)
http.ListenAndServeTLS("localhost:8888", "certFile", "keyFile", f)
```

## How do I do graceful shutdown?

## How do I integrate into existing applications?

## What is the difference between `inject.Invoker` and `inject.FastInvoker`?

The [`inject.Invoker`](https://pkg.go.dev/github.com/flamego/flamego/inject#Invoker) is the default way that the Flame instance uses to invoke a function through reflection.

In 2016, [@tupunco](https://github.com/tupunco) [contributed a patch](https://github.com/go-macaron/inject/commit/07e997cf1c187f573791bd7680cfdcba43161c22) with the concept and the implementation of the [`inject.FastInvoker`](https://pkg.go.dev/github.com/flamego/flamego/inject#FastInvoker), which invokes a function through interface. The `inject.FastInvoker` is about 30% faster to invoke a function and uses less memory.

## What is the idea behind this other than Macaron/Martini?

## Why the default port is 2830?

![keyboard layout 2830](imgs/keyboard-layout-2830.png)
