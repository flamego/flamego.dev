---
prev:
  text: Middleware
  link: middleware
---

# 常见问题

## 如何修改监听地址？

通过 `Run` 方法启动的 Flame 实例可以通过环境变量 `FLAMEGO_ADDR` 来修改监听地址：

```sh:no-line-numbers
export FLAMEGO_ADDR=localhost:8888
```

或通过传递参数给 `Run` 方法：

```go:no-line-numbers
f.Run("localhost")       // => localhost:2830
f.Run(8888)              // => 0.0.0.0:8888
f.Run("localhost", 8888) // => localhost:8888
```

或者直接使用 [`http.ListenAndServe`](https://pkg.go.dev/net/http#ListenAndServe) 或 [`http.ListenAndServeTLS`](https://pkg.go.dev/net/http#ListenAndServeTLS) 方法启动实例：

```go:no-line-numbers
http.ListenAndServe("localhost:8888", f)
http.ListenAndServeTLS("localhost:8888", "certFile", "keyFile", f)
```

## 如何实现优雅停机？

[github.com/ory/graceful](https://github.com/ory/graceful) 可被用于实现 Flame 实例的优雅停机：

```go:no-line-numbers
package main

import (
	"net/http"

	"github.com/flamego/flamego"
	"github.com/ory/graceful"
)

func main() {
	f := flamego.New()

	...

	server := graceful.WithDefaults(
		&http.Server{
			Addr:    "0.0.0.0:2830",
			Handler: f,
		},
	)
	if err := graceful.Graceful(server.ListenAndServe, server.Shutdown); err != nil {
		// 处理错误
	}
}
```

## 如何集成到现有的 Web 应用？

因为 Flame 实例实现了 [`http.Handler`](https://pkg.go.dev/net/http#Handler) 接口，所以可以被集成到任何接受 `http.Handler` 作为参数的地方。

### 示例：与 `net/http` 集成

下面展示了如何集成到 `net/http` 的路由系统中，并响应路径为 `"/user/info"` 的请求：

:::: code-group
::: code-group-item Code
```go:no-line-numbers
package main

import (
	"log"
	"net/http"

	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Get("/user/info", func() string {
		return "The user is Joe"
	})

	// 将所有以 "/user/" 开头的请求路径都交给 Flame 示例处理
	http.Handle("/user/", f)

	if err := http.ListenAndServe("0.0.0.0:2830", nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
```
:::
::: code-group-item 测试
```:no-line-numbers
$ curl -i http://localhost:2830/user/info
The user is Joe
```
:::
::::

### 示例：与 Macaron 集成

下面展示了如何集成到 Macaron 的路由系统中，并响应路径为 `"/user/info"` 的请求：

:::: code-group
::: code-group-item Code
```go:no-line-numbers
package main

import (
	"log"
	"net/http"

	"github.com/flamego/flamego"
	"gopkg.in/macaron.v1"
)

func main() {
	f := flamego.New()
	f.Get("/user/info", func() string {
		return "The user is Joe"
	})

	// 将所有以 "/user/" 开头的请求路径都交给 Flame 示例处理
	m := macaron.New()
	m.Any("/user/*", f.ServeHTTP)

	if err := http.ListenAndServe("0.0.0.0:2830", m); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
```
:::
::: code-group-item 测试
```:no-line-numbers
$ curl -i http://localhost:2830/user/info
The user is Joe
```
:::
::::

## `inject.Invoker` 和 `inject.FastInvoker` 有什么区别？

[`inject.Invoker`](https://pkg.go.dev/github.com/flamego/flamego/inject#Invoker) 是 Flame 实例通过反射调用函数的实现形式。

在 2016 年，[@tupunco](https://github.com/tupunco) [提出并贡献了](https://github.com/go-macaron/inject/commit/07e997cf1c187f573791bd7680cfdcba43161c22) [`inject.FastInvoker`](https://pkg.go.dev/github.com/flamego/flamego/inject#FastInvoker) 的最初实现，即通过实现接口的形式实现函数调用，提升了大约 30% 的调用性能，并且降低了运行时的内存消耗。

## 和 Macaron/Martini 的关系是什么？

Martini 是 Go 语言中依赖注入型 Web 框架的鼻祖，开创了一个全新的流派。但受限于原作者的实现细节，它的性能和内存消耗都非常不尽如人意。很多人将性能原因归咎于反射并嗤之以鼻，但我觉得这纯属无脑喷，标准库的 JSON 实现用的就是反射，这么多 Go 语言实现的应用还不是用的开开心心？

Macaron 秉承了相同的理念，通过更好的实现细节提升了可观的性能并大幅降低了内存占用。遗憾的是，当时只是作为 [Gogs](https://gogs.io) 项目的衍生品，所以没有好好进行设计，或者干脆点说，当时根本就没什么设计思想。所有的功能当时都只是为了支持项目的快速开发。

缺乏整体架构和设计原则的思考导致了许多回头来看非常错误的决定，包括但不限于：

- [`*macaron.Context`](https://pkg.go.dev/github.com/go-macaron/macaron#Context) 包含了过多的内容，完全没有[职责分离](https://en.wikipedia.org/wiki/Separation_of_concerns)可言
- [命名参数](https://go-macaron.com/middlewares/routing#named-parameters)的语法选择也非常的落后，即使用冒号表达（如 `:name`），这从根本上杜绝了路由配置语法的可扩展性
- 一些过于自以为是的决定，比如 [`SetConfig`](https://pkg.go.dev/github.com/go-macaron/macaron#SetConfig) 和 [`Config`](https://pkg.go.dev/github.com/go-macaron/macaron#Config) 就导致强行捆绑用户引入 `"gopkg.in/ini.v1"` 这样的在 99% 的情况下都用不到的额外依赖
- [设定 Cookie 的方式](https://go-macaron.com/core_services#cookie)完全就是纯脑残

总而言之，我始终认为 Macaron 是一款非常牛逼的 Web 框架，只不过 Flamego 作为继任者而言会更加牛逼 🙂

## 为什么默认端口是 2830？

![keyboard layout 2830](/imgs/keyboard-layout-2830.png)
