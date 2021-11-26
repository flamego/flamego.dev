---
prev:
  text: Custom services
  link: custom-services.md
next:
  text: Middleware
  link: middleware
---

# Routing

Every request goes through the routing in order to reach its handlers, that is how important the routing is to be ergonomic. Flamego spends great amount of effort on designing and implementing the routing capability and future extensibility to ensure your developer happiness.

In Flamego, a route is an HTTP method paired with a URL-matching pattern, and each route takes a chain of handlers.

Below are the helpers to register routes for each HTTP method:

```go:no-line-numbers
f.Get("/", func() { ... })
f.Patch("/", func() { ... })
f.Post("/", func() { ... })
f.Put("/", func() { ... })
f.Delete("/", func() { ... })
f.Options("/", func() { ... })
f.Head("/", func() { ... })
f.Connect("/", func() { ... })
f.Trace("/", func() { ... })
```

If you want to match all HTTP methods for a single route, `Any` is available for you:

```go:no-line-numbers
f.Any("/", func() { ... })
```

When you want to match a selected list of HTTP methods for a single route, `Routes` is your friend:

```go:no-line-numbers
f.Routes("/", "GET,POST", func() { ... })
```

## Static routes

The static routes are probably the most common routes you have been seeing and using, routes are defined in literals and only looking for _exact matches_:

```go:no-line-numbers
f.Get("/user", func() { ... })
f.Get("/repo", func() { ... })
```

In the above example, requests to routes other than `/user` and `/repo` will result in 404.

::: warning
Unlike the router in `net/http`, where you may use `/user/` to match all subpaths under the `/user` path, it is still a static route in Flamego, and only matches a route IFF the request path is exactly the `/user/`.

Let's write an example:

```go:no-line-numbers
package main

import (
	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Get("/user/", func() string {
		return "You got it!"
	})
	f.Run()
}
```

Then run some tests as follows:

```:no-line-numbers
$ curl http://localhost:2830/user
404 page not found

$ curl http://localhost:2830/user/
You got it!

$ curl http://localhost:2830/user/info
404 page not found
```
:::

## Dynamic routes

### Placeholders

### Regular expressions

### Globs

## Combo routes

## Group routes

## Optional routes

## Matching priority

## Constructing URL paths

## Customizing the `NotFound` handler

## Auto-registering `HEAD` method

## Syntax references
