---
prev:
  text: 中间件集成
  link: ../middleware
---

::: danger
本页内容尚未完成简体中文的翻译，目前显示为英文版内容。如有意协助翻译，请前往 [GitHub](https://github.com/flamego/flamego/issues/78) 认领，感谢支持！
:::

# brotli

The brotli middleware provides Brotli compression to responses for [Flame instances](../core-concepts.md#instances).

You can read source code of this middleware on [GitHub](https://github.com/flamego/brotli) and API documentation on [pkg.go.dev](https://pkg.go.dev/github.com/flamego/brotli?tab=doc).

## Installation

The minimum requirement of Go is **1.16**.

```:no-line-numbers
go get github.com/flamego/brotli
```

## Usage examples

You should register the [`brotli.Brotli`](https://pkg.go.dev/github.com/flamego/brotli#Brotli) _before all other middleware or handlers_ that would write response to clients, and it works out-of-the-box with the default settings:

```go:no-line-numbers
package main

import (
	"github.com/flamego/brotli"
	"github.com/flamego/flamego"
)

func main() {
	f := flamego.Classic()
	f.Use(brotli.Brotli())
	f.Get("/", func() string {
		return "Hello, Brotli!"
	})
	f.Run()
}
```

The [`brotli.Options`](https://pkg.go.dev/github.com/flamego/brotli#Options) can be used to further customize the behavior of the middleware:

```go:no-line-numbers{11-13}
package main

import (
	"github.com/flamego/brotli"
	"github.com/flamego/flamego"
)

func main() {
	f := flamego.Classic()
	f.Use(brotli.Brotli(
		brotli.Options{
			CompressionLevel: 11, // Best compression
		},
	))
	f.Get("/", func() string {
		return "Hello, Brotli!"
	})
	f.Run()
}
```
