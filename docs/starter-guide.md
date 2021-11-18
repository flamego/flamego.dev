---
next:
  text: Core concepts
  link: core-concepts.md
---

# Starter guide

::: warning
This guide is not intended to teach you how to use [Go](https://golang.org), and would assume you already have basic knowledge about HTTP, web applications and programming in Go.
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

On line 7, the method [`f.Get`](https://pkg.go.dev/github.com/flamego/flamego#Router) registers the anonymous function (line 7 to 9) to be the [Handler](core-concepts.md#handlers) of the root path ("/") when a HTTP GET request comes in. In this case, the handler simply reponds a "Hello world!" string to the client.

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

You may verify the result by either visiting [http://localhost:2830](http://localhost:2830) in your browser, or through the folllowing `curl` command:

```:no-line-numbers
$ curl http://localhost:2830
Hello, Flamego!
```

