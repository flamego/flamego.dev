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
f.Get("/", ...)
f.Patch("/", ...)
f.Post("/", ...)
f.Put("/", ...)
f.Delete("/", ...)
f.Options("/", ...)
f.Head("/", ...)
f.Connect("/", ...)
f.Trace("/", ...)
```

If you want to match all HTTP methods for a single route, `Any` is available for you:

```go:no-line-numbers
f.Any("/", ...)
```

When you want to match a selected list of HTTP methods for a single route, `Routes` is your friend:

```go:no-line-numbers
f.Routes("/", "GET,POST", ...)
```

## Terminology

- A **URL path segment** is the portion between two forward slashes, e.g. `/<segment>/`, the trailing forward slash may not present.
- A **bind parameter** uses curly brackets (`{}`) as its notation, e.g. `{<bind_parameter>}`, bind parameters are only available in [dynamic routes](#dynamic-routes).

## Static routes

The static routes are probably the most common routes you have been seeing and using, routes are defined in literals and only looking for _exact matches_:

```go:no-line-numbers
f.Get("/user", ...)
f.Get("/repo", ...)
```

In the above example, any request that is not a GET request to `/user` or `/repo` will result in 404.

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

The dynamic routes, by its name, they match request paths dynamically. Flamego provides most powerful dynamic routes in the Go ecosystem, at the time of writing, there is simply no feature parity you can find in all other existing Go web frameworks.

The `flamego.Context` provides a family of `Param` methods to access values that are captured by bind parameters, including:

- `Params` returns all bind parameters.
- `Param` returns value of the given bind parameter.
- `ParamInt` returns value parsed as int.
- `ParamInt64` returns value parsed as int64.

### Placeholders

A placeholder captures anything but a forward slash (`/`), and you may have one or more placeholders within a URL path segment.

Below are all valid usages of placeholders:

```go
f.Get("/users/{name}", ...)
f.Get("/posts/{year}-{month}-{day}.html", ...)
f.Get("/geo/{state}/{city}", ...)
```

On line 1, the placeholder named `{name}` to capture everything in a URL path segment.

On line 2, three placeholders `{year}`, `{month}` and `{day}` are used to capture different portions in a URL path segment.

On line 3, two placeholders are used independently in different URL path segments.

Let's see some examples:

:::: code-group
::: code-group-item Code
```go:no-line-numbers
package main

import (
	"fmt"
	"strings"

	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Get("/users/{name}", func(c flamego.Context) string {
		return fmt.Sprintf("The user is %s", c.Param("name"))
	})
	f.Get("/posts/{year}-{month}-{day}.html", func(c flamego.Context) string {
		return fmt.Sprintf(
			"The post date is %d-%d-%d",
			c.ParamInt("year"), c.ParamInt("month"), c.ParamInt("day"),
		)
	})
	f.Get("/geo/{state}/{city}", func(c flamego.Context) string {
		return fmt.Sprintf(
			"Welcome to %s, %s!",
			strings.Title(c.Param("city")),
			strings.ToUpper(c.Param("state")),
		)
	})
	f.Run()
}
```
:::
::: code-group-item Test
```:no-line-numbers
$ curl http://localhost:2830/users/joe
The user is joe

$ curl http://localhost:2830/posts/2021-11-26.html
The post date is 2021-11-26

$ curl http://localhost:2830/geo/ma/boston
Welcome to Boston, MA!
```
:::
::::

::: tip
Try a test request using `curl http://localhost:2830/posts/2021-11-abc.html` and see what changes.
:::

### Regular expressions

A bind parameter can be defined with a custom regular expression to capture characters in a URL path segment, and you may have one or more such bind parameters within a URL path segment. The regular expressions are needed to be surrounded by a pair of forward slashes (`/<regexp>/`).

Below are all valid usages of bind parameters with regular expressions:

```go
f.Get("/users/{name: /[a-zA-Z0-9]+/}", ...)
f.Get("/posts/{year: /[0-9]{4}/}-{month: /[0-9]{2}/}-{day: /[0-9]{2}/}.html", ...)
f.Get("/geo/{state: /[A-Z]{2}/}/{city}", ...)
```

On line 1, the placeholder named `{name}` to capture everything in a URL path segment.

On line 2, three placeholders `{year}`, `{month}` and `{day}` are used to capture different portions in a URL path segment.

On line 3, two placeholders are used independently in different URL path segments.

::: tip
Because forward slashes are used to indicate the use of regular expressions, they cannot be captured via regular expressions, and will cause a routing parser error when you are trying to do so:

```:no-line-numbers
panic: unable to parse route "/{name: /abc\\//}": 1:15: unexpected token "/" (expected "}")
```
:::

Let's see some examples:

:::: code-group
::: code-group-item Code
```go:no-line-numbers
package main

import (
	"fmt"
	"strings"

	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Get("/users/{name: /[a-zA-Z0-9]+/}",
		func(c flamego.Context) string {
			return fmt.Sprintf("The user is %s", c.Param("name"))
		},
	)
	f.Get("/posts/{year: /[0-9]{4}/}-{month: /[0-9]{2}/}-{day: /[0-9]{2}/}.html",
		func(c flamego.Context) string {
			return fmt.Sprintf(
				"The post date is %d-%d-%d",
				c.ParamInt("year"), c.ParamInt("month"), c.ParamInt("day"),
			)
		},
	)
	f.Get("/geo/{state: /[A-Z]{2}/}/{city}",
		func(c flamego.Context) string {
			return fmt.Sprintf(
				"Welcome to %s, %s!",
				strings.Title(c.Param("city")),
				strings.ToUpper(c.Param("state")),
			)
		},
	)
	f.Run()
}
```
:::
::: code-group-item Test
```:no-line-numbers
$ curl http://localhost:2830/users/joe
The user is joe

$ curl http://localhost:2830/posts/2021-11-26.html
The post date is 2021-11-26

$ curl http://localhost:2830/geo/MA/boston
Welcome to Boston, MA!
```
:::
::::

::: tip
Try doing following test requests and see what changes:

```:no-line-numbers
$ curl http://localhost:2830/users/logan-smith
$ curl http://localhost:2830/posts/2021-11-abc.html
$ curl http://localhost:2830/geo/ma/boston
```
:::

### Globs

## Combo routes

## Group routes

## Optional routes

## Matching priority

## Constructing URL paths

## Customizing the `NotFound` handler

## Auto-registering `HEAD` method

## Syntax references
