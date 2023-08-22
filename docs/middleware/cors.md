---
prev:
  text: Middleware
  link: ../middleware
---

# cors

The cors middleware configures [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) for [Flame instances](../core-concepts.md#instances).

You can read source code of this middleware on [GitHub](https://github.com/flamego/cors) and API documentation on [pkg.go.dev](https://pkg.go.dev/github.com/flamego/cors?tab=doc).

## Installation

```:no-line-numbers
go get github.com/flamego/cors
```

## Usage examples

The [`cors.CORS`](https://pkg.go.dev/github.com/flamego/cors#CORS) works out-of-the-box with an optional [`cors.Options`](https://pkg.go.dev/github.com/flamego/cors#Options):

```go:no-line-numbers
package main

import (
	"github.com/flamego/cors"
	"github.com/flamego/flamego"
)

func main() {
	f := flamego.Classic()
	f.Get("/",
		cors.CORS(),
		func(c flamego.Context) string {
			return "This endpoint can be shared cross-origin"
		},
	)
	f.Run()
}
```

The [`cors.Options`](https://pkg.go.dev/github.com/flamego/cors#Options) can be used to further customize the behavior of the middleware:

```go:no-line-numbers{12-14}
package main

import (
	"github.com/flamego/cors"
	"github.com/flamego/flamego"
)

func main() {
	f := flamego.Classic()
	f.Get("/",
		cors.CORS(
            cors.Options{
			    AllowDomain: []string{"cors.example.com"},
		    },
        ),
		func(c flamego.Context) string {
			return "This endpoint can be shared cross-origin"
		},
	)
	f.Run()
}
```
