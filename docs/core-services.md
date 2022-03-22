---
prev:
  text: Core concepts
  link: core-concepts
next:
  text: Custom services
  link: custom-services
---

# Core services

 To get you off the ground, Flamego provides some core services that are essential to almost all web applications. However, you are not required to use all of them. The design principle of Flamego is always building the minimal core and pluggable addons at your own choice.

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

The [routing logger](#routing-logger) is taking advantage of this feature to [collect the duration and status code of requests](https://github.com/flamego/flamego/blob/8709b65452b2f8513508500017c862533ca767ee/logger.go#L74-L83).

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

[URL parameters](https://www.semrush.com/blog/url-parameters/), also known as "URL query parameters", or "URL query strings", are commonly used to pass arguments to the backend for all HTTP methods (POST forms have to be sent with POST method, as the counterpart).

The `Query` method is built as a helper for accessing the URL parameters, and return an empty string if no such parameter found with the given key:

:::: code-group
::: code-group-item Code
```go:no-line-numbers
package main

import (
	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Get("/", func(c flamego.Context) string {
		return "The name is " + c.Query("name")
	})
	f.Run()
}
```
:::
::: code-group-item Test
```:no-line-numbers
$ curl http://localhost:2830?name=joe
The name is joe

$ curl http://localhost:2830
The name is
```
:::
::::

There is a family of `Query` methods available at your fingertips, including:

- `QueryTrim` trims spaces and returns value.
- `QueryStrings` returns a list of strings.
- `QueryUnescape` returns unescaped query result.
- `QueryBool` returns value parsed as bool.
- `QueryInt` returns value parsed as int.
- `QueryInt` returns value parsed as int64.
- `QueryFloat64` returns value parsed as float64.

::: tip
If you are not happy with the functionality that is provided by the family of `Query` methods, it is always possible to build your own helpers (or middlware) for the URL parameters by accessing the underlying [`url.Values`](https://pkg.go.dev/net/url#Values) directly:

```go:no-line-numbers
vals := c.Request().URL.Query()
```
:::

### Is `flamego.Context` a replacement to `context.Context`?

No.

The `flamego.Context` is a representation of the request context and should live within the routing layer, where the `context.Context` is a general purpose context and can be propogated to almost anywhere (e.g. database layer).

You can retrieve the `context.Context` of a request using the following methods:

```go:no-line-numbers
f.Get(..., func(c flamego.Context) {
    ctx := c.Request().Context()
    ...
})

// or

f.Get(..., func(r *http.Request) {
    ctx := r.Context()
    ...
})
```

## Default logger

The [`*log.Logger`](https://pkg.go.dev/log#Logger) is available to all handers for general logging purposes, this is particularly useful if you're writing middleware:

```go:no-line-numbers
package main

import (
	"log"

	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Get("/", func(log *log.Logger) {
		log.Println("Hello, Flamego!")
	})
	f.Run()
}
```

When you run the above program and do `curl http://localhost:2830/`, the following logs are printed to your terminal:

```:no-line-numbers
[Flamego] Listening on 0.0.0.0:2830 (development)
[Flamego] Hello, Flamego!
```

The [routing logger](#routing-logger) is taking advantage of this feature to [print the duration and status code of requests](https://github.com/flamego/flamego/blob/8709b65452b2f8513508500017c862533ca767ee/logger.go#L98).

## Response stream

The response stream of a request is represented by the type [`http.ResponseWriter`](https://pkg.go.dev/net/http#ResponseWriter), you may use it as an argument of your handlers or through the `ResponseWriter` method of the `flamego.Context`:

```go:no-line-numbers
f.Get(..., func(w http.ResponseWriter) {
    ...
})

// or

f.Get(..., func(c flamego.Context) {
    w := c.ResponseWriter()
    ...
})
```

::: tip 💡 小贴士
Not all handlers that are registered for a route are always being invoked, the request context (`flamego.Context`) stops invoking subsequent handlers [when the response status code has been written](https://github.com/flamego/flamego/blob/1114ba32a13be474a80a702fb3909ccd49250523/context.go#L201-L202) by the current handler. This is similar to how the [short circuit evaluation](https://en.wikipedia.org/wiki/Short-circuit_evaluation) works.
:::

## Request object

The request object is represented by the type [`*http.Request`](https://pkg.go.dev/net/http#Request), you may use it as an argument of your handlers or through the `Request().Request` field of the `flamego.Context`:

```go:no-line-numbers
f.Get(..., func(r *http.Request) {
    ...
})

// or

f.Get(..., func(c flamego.Context) {
    r := c.Request().Request
    ...
})
```

You may wonder what does `c.Request()` return in the above example?

Good catch! It returns a thin wrapper of the `*http.Request` and has the type [`*flamego.Request`](https://pkg.go.dev/github.com/flamego/flamego#Request), which provides helpers to read the request body:

```go:no-line-numbers
f.Get(..., func(c flamego.Context) {
    body := c.Request().Body().Bytes()
    ...
})
```

## Routing logger

::: tip
This middleware is automatically registered when you use [`flamego.Classic`](https://pkg.go.dev/github.com/flamego/flamego#Classic) to create a Flame instance.
:::

The [`flamego.Logger`](https://pkg.go.dev/github.com/flamego/flamego#Logger) is the middleware that provides logging of requested routes and corresponding status code:

```go:no-line-numbers
package main

import (
	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Use(flamego.Logger())
	f.Get("/", func() (int, error) {
		return http.StatusOK, nil
	})
	f.Run()
}
```

When you run the above program and do `curl http://localhost:2830/`, the following logs are printed to your terminal:

```:no-line-numbers
[Flamego] Listening on 0.0.0.0:2830 (development)
[Flamego] ...: Started GET / for 127.0.0.1
[Flamego] ...: Completed GET / 200 OK in 165.791µs
```

## Panic recovery

::: tip
This middleware is automatically registered when you use [`flamego.Classic`](https://pkg.go.dev/github.com/flamego/flamego#Classic) to create a Flame instance.
:::

The [`flamego.Recovery`](https://pkg.go.dev/github.com/flamego/flamego#Recovery) is the middleware that is for recovering from panic:

```go:no-line-numbers
package main

import (
	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Use(flamego.Recovery())
	f.Get("/", func() {
		panic("I can't breath")
	})
	f.Run()
}
```

When you run the above program and visit [http://localhost:2830/](http://localhost:2830/), the recovered page is displayed:

![panic recovery](/imgs/panic-recovery.png)

## Serving static files

::: tip
This middleware is automatically registered when you use [`flamego.Classic`](https://pkg.go.dev/github.com/flamego/flamego#Classic) to create a Flame instance.
:::

The [`flamego.Static`](https://pkg.go.dev/github.com/flamego/flamego#Static) is the middleware that is for serving static files, and it accepts an optional [`flamego.StaticOptions`](https://pkg.go.dev/github.com/flamego/flamego#StaticOptions):

```go:no-line-numbers
func main() {
	f := flamego.New()
	f.Use(flamego.Static(
		flamego.StaticOptions{
			Directory: "public",
		},
	))
	f.Run()
}
```

You may also omit passing the options for using all default values:

```go:no-line-numbers
func main() {
	f := flamego.New()
	f.Use(flamego.Static())
	f.Run()
}
```

### Example: Serving the source file

In this example, we're going to treat our source code file as the static resources:

```go{11-12}
package main

import (
	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Use(flamego.Static(
		flamego.StaticOptions{
			Directory: "./",
			Index:     "main.go",
		},
	))
	f.Run()
}
```

On line 11, we changed the `Directory` to be the working directory (`"./"`) instead of the default value `"public"`.

On line 12, we changed the index file (the file to be served when listing a directory) to be `main.go` instead of the default value `"index.html"`.

When you save the above program as `main.go` and run it, both `curl http://localhost:2830/` and `curl http://localhost:2830/main.go` will response the content of this `main.go` back to you.


### Example: Serving multiple directories

In this example, we're going to serve static resources for two different directories.

Here is the setup for the example:

:::: code-group
::: code-group-item Directory
```:no-line-numbers
$ tree .
.
├── css
│   └── main.css
├── go.mod
├── go.sum
├── js
│   └── main.js
└── main.go

2 directories, 5 files
```
:::
::: code-group-item css/main.css
```css:no-line-numbers
html {
    color: red;
}
```
:::
::: code-group-item js/main.js
```js:no-line-numbers
console.log("Hello, Flamego!");
```
:::
::: code-group-item main.go
```go:no-line-numbers
package main

import (
	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Use(flamego.Static(
		flamego.StaticOptions{
			Directory: "js",
		},
	))
	f.Use(flamego.Static(
		flamego.StaticOptions{
			Directory: "css",
		},
	))
	f.Run()
}
```
:::
::: code-group-item Test
```:no-line-numbers
$ curl http://localhost:2830/main.css
html {
    color: red;
}

$ curl http://localhost:2830/main.js
console.log("Hello, Flamego!");
```
:::
::::

You may have noticed that the client should not include the value of `Directory`, which are `"css"` and `"js"` in the example. If you would like the client to include these values, you can use the `Prefix` option:

```go:no-line-numbers{4}
f.Use(flamego.Static(
    flamego.StaticOptions{
        Directory: "css",
        Prefix:    "css",
    },
))
```

::: tip 💡 小贴士
The value of `Prefix` does not have to be the same as the value of `Directory`.
:::

### Example: Serving the `embed.FS`

In this example, we're going to serve static resources from the [`embed.FS`](https://pkg.go.dev/embed#FS) that was [introduced in Go 1.16](https://blog.jetbrains.com/go/2021/06/09/how-to-use-go-embed-in-go-1-16/).

Here is the setup for the example:

:::: code-group
::: code-group-item Directory
```:no-line-numbers
tree .
.
├── css
│   └── main.css
├── go.mod
├── go.sum
└── main.go

1 directory, 4 files
```
:::
::: code-group-item css/main.css
```css:no-line-numbers
html {
    color: red;
}
```
:::
::: code-group-item main.go
```go:no-line-numbers
package main

import (
	"embed"
	"net/http"

	"github.com/flamego/flamego"
)

//go:embed css
var css embed.FS

func main() {
	f := flamego.New()
	f.Use(flamego.Static(
		flamego.StaticOptions{
			FileSystem: http.FS(css),
		},
	))
	f.Run()
}
```
:::
::: code-group-item Test
```:no-line-numbers
$ curl http://localhost:2830/css/main.css
html {
    color: red;
}
```
:::
::::

::: warning
Because the Go embed encodes the entire path (i.e. including parent directories), the client have to use the full path, which is different from serving static files directly from the local disk.

In other words, the following command will not work for the example:

```:no-line-numbers
$ curl http://localhost:2830/main.css
404 page not found
```
:::

## Rendering content

The [`flamego.Renderer`](https://pkg.go.dev/github.com/flamego/flamego#Renderer) is a minimal middleware that is for rendering content, and it accepts an optional [`flamego.RenderOptions`](https://pkg.go.dev/github.com/flamego/flamego#RenderOptions).

The service [`flamego.Render`](https://pkg.go.dev/github.com/flamego/flamego#Render) is injected to your request context and you can use it to render JSON, XML, binary and plain text content:

:::: code-group
::: code-group-item Code
```go{13}
package main

import (
	"net/http"

	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Use(flamego.Renderer(
		flamego.RenderOptions{
			JSONIndent: "  ",
		},
	))
	f.Get("/", func(r flamego.Render) {
		r.JSON(http.StatusOK,
			map[string]interface{}{
				"id":       1,
				"username": "joe",
			},
		)
	})
	f.Run()
}
```
:::
::: code-group-item Test
```:no-line-numbers
$ curl -i http://localhost:2830/
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
...

{
  "id": 1,
  "username": "joe"
}
```
:::
::::

::: tip
Try changing the line 13 to `JSONIndent: "",`, then redo all test requests and see what changes.
:::
