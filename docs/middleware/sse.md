---
prev:
  text: Middleware
  link: ../middleware
---

# sse

The sse middleware provides [Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) integration for [Flame instances](../core-concepts.md#instances).

You can read source code of this middleware on [GitHub](https://github.com/flamego/sse) and API documentation on [pkg.go.dev](https://pkg.go.dev/github.com/flamego/sse?tab=doc).

## Installation

The minimum requirement of Go is **1.18**.

```:no-line-numbers
go get github.com/flamego/sse
```

## Usage examples

:::: code-group
::: code-group-item main.go
```go:no-line-numbers{28}
package main

import (
	"math/rand"
	"net/http"
	"time"

	"github.com/flamego/flamego"
	"github.com/flamego/sse"
	"github.com/flamego/template"
)

var bulletins = []string{"Hello Flamego!", "Flamingo? No, Flamego!", "Most powerful routing syntax", "Slim core but limitless extensibility"}

type bulletin struct {
	Data        string
	PublishedAt time.Time
}

func main() {
	f := flamego.Classic()
	f.Use(template.Templater(), flamego.Renderer())

	f.Get("/", func(ctx flamego.Context, t template.Template) {
		t.HTML(http.StatusOK, "index")
	})

	f.Get("/bulletin", sse.Bind(bulletin{}), func(msg chan<- *bulletin) {
		for {
			select {
			case <-time.Tick(1 * time.Second):
				msg <- &bulletin{
					Data:        bulletins[rand.Intn(len(bulletins))],
					PublishedAt: time.Now(),
				}
			}
		}
	})

	f.Run()
}
```
:::
::: code-group-item templates/index.html
```html:no-line-numbers
<script src="https://cdn.jsdelivr.net/npm/way-js@0.2.1/dist/way.js"></script>
<p><b><span way-data="data"></span></b>[<span way-data="published-at"></span>]</p>
<script>
  let es = new EventSource("/bulletin");
  es.onmessage = (evt) => {
    let bulletin = JSON.parse(evt.data);
    way.set('data', bulletin.Data)
    way.set('published-at', new Date(bulletin.PublishedAt).toLocaleString())
  };
</script>
```
