---
prev:
  text: 中间件集成
  link: ../middleware
---

# brotli

brotli 中间件为 [Flame 实例](../core-concepts.md#实例) 提供基于 Brotli 的响应流压缩服务。

你可以在 [GitHub](https://github.com/flamego/brotli) 上阅读该中间件的源码或通过 [pkg.go.dev](https://pkg.go.dev/github.com/flamego/brotli?tab=doc) 查看 API 文档。

## 下载安装

Go 语言的最低版本要求为 **1.16**。

```:no-line-numbers
go get github.com/flamego/brotli
```

## 用法示例

[`brotli.Brotli`](https://pkg.go.dev/github.com/flamego/brotli#Brotli) 需要在 _其它任何可能写入内容到响应流的中间件之前_ 被注册：

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

[`brotli.Options`](https://pkg.go.dev/github.com/flamego/brotli#Options) 可以被用于配置该中间件的行为：

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
			CompressionLevel: 11, // 最优压缩
		},
	))
	f.Get("/", func() string {
		return "Hello, Brotli!"
	})
	f.Run()
}
```
