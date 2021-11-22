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
        ...
	})
	f.Run()
}
```

### Next

When a route is matched by a request, the Flame instance [queues a chain of handlers](https://github.com/flamego/flamego/blob/8709b65452b2f8513508500017c862533ca767ee/flame.go#L82-L84) (including middleware) to be invoked in the same order as they are registered.

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

In fact, the [routing logger](#routing-logger) is taking advantage of this feature to [collect the duration and status code of requests](https://github.com/flamego/flamego/blob/8709b65452b2f8513508500017c862533ca767ee/logger.go#L74-L83).

### Remote address

Web applications often want to know where clients are coming from, then the `RemoteAddr()` method is the convenient helper made for you:

```go:no-line-numbers
func main() {
	f := flamego.New()
	f.Get("/", func(c flamego.Context) string {
		return "The remote address is " + c.RemoteAddr()
	})
	f.Run()
}
```

The `RemoteAddr()` method is smarter than the standard library that only looks at the `http.Request.RemoteAddr` field (which stops working if your web application is behind a reverse proxy), it also takes into consideration of some well-known headers.

This method looks at following things in the order to determine which one is more likely to contain the real client address:

- The `X-Real-IP` request header
- The `X-Forwarded-For` request header
- The `http.Request.RemoteAddr` field

This way, you can configure your reverse proxy to pass on one of these headers.

::: warning
The client can always fake its address using a proxy or VPN, getting the remote address is always considered as a best effort in web applications.
:::

### Redirect

The `Redirect` method is [a shorthand for the `http.Redirect`](https://github.com/flamego/flamego/blob/8709b65452b2f8513508500017c862533ca767ee/context.go#L225-L232) given the fact that the request context knows what the `http.ResponseWriter` and `*http.Request` are for the current request, and uses the `http.StatusFound` as the default status code for the redirection:

:::: code-group
::: code-group-item Code
```go:no-line-numbers
package main

import (
	"net/http"

	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Get("/", func(c flamego.Context) {
		c.Redirect("/signup")
	})
	f.Get("/login", func(c flamego.Context) {
		c.Redirect("/signin", http.StatusMovedPermanently)
	})
	f.Run()
}
```
:::
::: code-group-item Test
```:no-line-numbers
$ curl -i http://localhost:2830/
HTTP/1.1 302 Found
...

$ curl -i http://localhost:2830/login
HTTP/1.1 301 Moved Permanently
...
```
:::
::::

::: warning
Be aware that the `Redirect` method does a naive redirection and is vulnerable to the [open redirect vulnerability](https://portswigger.net/kb/issues/00500100_open-redirection-reflected).

For example, the following is also works as a valid redirection:

```go:no-line-numbers
c.Redirect("https://www.google.com")
```

Please make sure to always first validating the user input!
:::

### URL parameters

### Is `flamego.Context` a replacement to `context.Context`?

## Default logger

## Response stream

## Request object

## Routing logger

## Panic recovery

## Serving static files