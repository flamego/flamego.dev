---
prev:
  text: Core concepts
  link: core-concepts.md
next:
  text: Custom services
  link: custom-services.md
---

# Core services

To accelerate your development, Flamego provides some core services that are essential to almost all web applications. However, you are not required to use all of them. The design principle of Flamego is always building the minimal core and pluggable addons at your own choice.

## Context

Every handler invocation comes with its own request context, which is represented as the type [`flamego.Context`](https://pkg.go.dev/github.com/flamego/flamego#Context). Data and state are not shared among these request contexts, which makes handler invocations independent from each other unless your web application has defined some other shared resources (e.g. database connections, cache).

Thereforce, `flamego.Context` is available to use out-of-the-box by your handlers:

```go:no-line-numbers
func main() {
	f := flamego.New()
	f.Get("/", func(c flamego.Context) string {
		return "The remote address is " + c.RemoteAddr()
	})
	f.Run()
}
```

### Next

When a route is matched by a request, the Flame instance [queues a chain of handlers](https://github.com/flamego/flamego/blob/8709b65452b2f8513508500017c862533ca767ee/flame.go?_pjax=%23js-repo-pjax-container%2C%20div%5Bitemtype%3D%22http%3A%2F%2Fschema.org%2FSoftwareSourceCode%22%5D%20main%2C%20%5Bdata-pjax-container%5D#L82-L84) (including middleware) to be invoked in the same order as they are registered.

By default, the next handler will only be invoked after the previous one in the chain has finished. You may change this behvaior using the `Next` method, which allows you to pause the execution of the current handler and resume after the rest of the chain finished.

```go:no-line-numbers
package main

import (
	"fmt"

	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Get("/",
		func(c flamego.Context) {
			fmt.Println("starting the first handler")
			c.Next()
			fmt.Println("exiting the first handler")
		},
		func() {
			fmt.Println("executing the second handler")
		},
	)
	f.Run()
}
```

When you run the above program and do `curl http://localhost:2830/`, the following logs are printed to your terminal:

```:no-line-numbers
[Flamego] Listening on 0.0.0.0:2830 (development)
starting the first handler
executing the second handler
exiting the first handler
```

In fact, the [routing logger](#routing-logger) is taking advantage of this feature to [collect the duration and status code of requests](https://github.com/flamego/flamego/blob/8709b65452b2f8513508500017c862533ca767ee/logger.go?_pjax=%23js-repo-pjax-container%2C%20div%5Bitemtype%3D%22http%3A%2F%2Fschema.org%2FSoftwareSourceCode%22%5D%20main%2C%20%5Bdata-pjax-container%5D#L74-L83).

### Remote address

### Redirect

### URL parameters

### Is `flamego.Context` a replacement to `context.Context`?

## Default logger

## Response stream

## Request object

## Routing logger

## Panic recovery

## Serving static files
