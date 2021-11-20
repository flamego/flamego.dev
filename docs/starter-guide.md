---
sidebar: false
next:
  text: Core concepts
  link: core-concepts.md
---

# Starter guide

::: warning
This guide is not intended to teach you how to use [Go](https://golang.org), and would assume you already have basic knowledge about HTTP, web applications development and programming in Go.
:::

Let's start with the minimal example you may have seen on the front page:

```go
package main

import "github.com/flamego/flamego"

func main() {
	f := flamego.Classic()
	f.Get("/", func() string {
		return "Hello, Flamego!"
	})
	f.Run()
}
```

On line 6, the function [`flamego.Classic`](https://pkg.go.dev/github.com/flamego/flamego#Classic) creates and returns a [classic Flame instance](core-concepts.md#classic-flame) with a default list of middleware, including [`flamego.Logger`](core-services.md#routing-logger), [`flamego.Recovery`](core-services.md#panic-recovery) and [`flamego.Static`](core-services.md#serving-static-files).

On line 7, the method [`f.Get`](https://pkg.go.dev/github.com/flamego/flamego#Router) registers the anonymous function (from line 7 to 9) to be the [handler](core-concepts.md#handlers) of the root path ("/") when a HTTP GET request comes in. In this case, the handler simply reponds a "Hello, Flamego!" string to the client.

On line 10, we start the web server by calling [`f.Run`](https://pkg.go.dev/github.com/flamego/flamego#Flame.Run). By default, the [Flame instance](core-concepts.md#instances) listens on the address `0.0.0.0:2830`.

Alright, now save the file and initialize a [Go module](https://go.dev/blog/using-go-modules#:~:text=A%20module%20is%20a%20collection,needed%20for%20a%20successful%20build.):

```:no-line-numbers
$ mkdir flamego-example
$ cd flamego-example
$ nano main.go

$ go mod init flamego-example
go: creating new go.mod: module flamego-example
$ go mod tidy
go: finding module for package github.com/flamego/flamego
...

$ go run main.go
[Flamego] Listening on 0.0.0.0:2830 (development)
```

Once you see the last line from your terminal, you're good to go!

You may verify the result by either visiting [http://localhost:2830](http://localhost:2830) ([why 2830?](faqs.md#why-the-default-port-is-2830)) in your browser, or through the folllowing `curl` command:

```:no-line-numbers
$ curl http://localhost:2830
Hello, Flamego!
```

::: tip 💡 Did you know?
If you have used other Go web frameworks like [Gin](https://github.com/gin-gonic/gin) or [Echo](https://echo.labstack.com/), you may be surpised that you can directly return a string in Flamego handlers as the response body to the client.

That is exactly right! Of course, this won't be the only way to make a response body (which would be a very unfriendly design!). If you're interested in reading more, the [return values](core-concepts.md#return-values) is the magician behind the scene.
:::

## Unfolding hidden parts

The minimal example aims for the least lines of code for a functioning example, but it inevitably hides some interesting details. Therefore, we're going to unfold those hidden parts to understand more about how things are assembled.

Let's first modify our `main.go` file as follows:

```go
package main

import (
	"log"
	"net/http"

	"github.com/flamego/flamego"
)

func main() {
	f := flamego.Classic()
	f.Get("/{*}", printRequestPath)

	log.Println("Server is running...")
	log.Println(http.ListenAndServe("0.0.0.0:2830", f))
}

func printRequestPath(c flamego.Context) string {
	return "The request path is: " + c.Request().RequestURI
}
```

As you may have guessed, this program responds back the request path that the client is requesting.

Take a look!

:::: code-group
::: code-group-item Run
```:no-line-numbers
$ go run main.go
2021/11/18 14:00:03 Server is running...
```
:::
::: code-group-item Test
```:no-line-numbers
$ curl http://localhost:2830
The request path is: /

$ curl http://localhost:2830/hello-world
The request path is: /hello-world

$curl http://localhost:2830/never-mind
The request path is: /never-mind

$ curl http://localhost:2830/bad-ass/who-am-i
404 page not found
```
:::
::::

So what are different now?

On line 11, we're still using the `flamego.Classic` to give us a classic Flame instance.

On line 12, insetad of using an anonymous function, function `printRequestPath` is registered as the handler for all of the HTTP GET requests under root path ("/") using the notation `{*}`. The routing match stops at the slash ("/") as you can tell from the last test request to "http://localhost:2830/bad-ass/who-am-i" that gives us 404.

::: tip
Try using the notation `{**: **}`, then redo all test requests and see what changes. If you're interested in reading more, the [routing](routing.md) has the best resources you would want.
:::

On line 15, the call of `f.Run` is replaced by the [`http.ListenAndServe`](https://pkg.go.dev/net/http#ListenAndServe), which is the most common way to start a web server in Go, and maybe more familiar to you if you have used other Go web frameworks. This is possible with Flamego because Flame instances implement the [`http.Handler`](https://pkg.go.dev/net/http#Handler) interface. Therefore, a Flame instance can be plugged into anywhere that accepts a `http.Handler`, and is particularly useful when you want to progressively migrate an existing Go web application to use Flamego.

On line 18 to 20, we define the signature and the body of the `printRequestPath`. It accepts one argument with the type [`flaemgo.Context`](core-services.md#context) and returns a string. It then calls the `Request` method to retrieve the [`http.Request`](https://pkg.go.dev/net/http#Request) which contains the request path from the client.

::: tip 💡 Did you know?
You may start wondering that we did not tell the Flame instance what arguments it should pass to the `printRequestPath` when the function is being invoked, and if you look up the definition of [`flamego.Handler`](https://pkg.go.dev/github.com/flamego/flamego#Handler), it is nothing but [an empty interface (`interface{}`)](https://github.com/flamego/flamego/blob/8505d18c5243f797d5bb7160797d26454b9e5011/handler.go#L17).

So how does the Flame instance determine what to pass down to its handlers at runtime?

This is the beauty (or confusion? 😅) of the [service injection](core-concepts.md#service-injection), and [`flamego.Context`](core-services#context) is one of the default services that are injected into every request.
:::

## Wrapping up

At this point, you should have some basic understanding of what is Flamego and how to start using it in your Go web applications.

Starting a new journey is never easy, especially when there are a lot of new concepts and content to learn. Please don't be hesitate reaching out for help and have a nice day!
