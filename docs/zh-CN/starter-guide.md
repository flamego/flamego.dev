---
sidebar: false
next:
  text: 核心概念
  link: core-concepts
---

# 初学指南

::: warning
本指南仅适用于已经熟悉 [Go 语言](https://go.dev/)，并且对 HTTP、Web 应用开发有一定了解的用户。
:::

让我们先来看一个非常简单且随处可见的例子：

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

在示例的第 6 行，函数 [`flamego.Classic`](https://pkg.go.dev/github.com/flamego/flamego#Classic) 会创建并返回一个 [经典 Flame 实例](core-concepts.md#经典-flame)，这个经典实例集成了一些默认的中间件，包括 [`flamego.Logger`](core-services.md#routing-logger)、[`flamego.Recovery`](core-services.md#panic-recovery) 和 [`flamego.Static`](core-services.md#serving-static-files)。

在示例的第 7 行，调用 [`f.Get`](https://pkg.go.dev/github.com/flamego/flamego#Router) 方法会注册一个匿名函数（第 7 至 9 行）作为接收到 GET 请求时根路径（`"/"`）的[处理器](core-concepts.md#处理器)。在本例中，这个处理器会向客户端发送 `"Hello, Flamego!"` 字符串。

在示例的第 10 行，我们通过调用 [`f.Run`](https://pkg.go.dev/github.com/flamego/flamego#Flame.Run) 来启动 Web 服务。默认情况下，[Flame 实例](core-concepts.md#实例)会使用 `0.0.0.0:2830` 作为监听地址。

接下来让我们运行这段示例代码，我们需要保存代码到本地文件并初始化一个 [Go 模块](https://go.dev/blog/using-go-modules#:~:text=A%20module%20is%20a%20collection,needed%20for%20a%20successful%20build.)：

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

当你看到最后一行日志出现的时候，说明 Web 服务已经准备就绪！

我们可以通过在浏览器中访问地址 [http://localhost:2830](http://localhost:2830) ([为什么是 2830？](faqs.md#为什么默认端口是-2830)) 或使用 `curl` 命令行工具：

```:no-line-numbers
$ curl http://localhost:2830
Hello, Flamego!
```

::: tip 💡 小贴士
如果你之前使用过诸如 [Gin](https://github.com/gin-gonic/gin) 或 [Echo](https://echo.labstack.com/) 之类的 Web 框架，你可能会对 Flamego 能够直接将函数返回的字符串（`string`）作为响应给客户端的输出而感到奇怪。

没错！但这只是 Flamego 诸多的便利特性之一，而且也不是向客户端响应内容的唯一方式。如果你对这方面的细节感兴趣，可以阅读[返回值](core-concepts.md#返回值)的相关内容。
:::

## 解构最简示例

最简示例旨在通过最少的代码量实现一个可以运行的程序，但不可避免地隐藏了许多有趣的细节。因此，我们将在这个小结对这些细节进行展开，并了解它们是如何构成最终的程序的。

我们先来看一段修改版本的 `main.go` 文件：

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

至于这段程序的作用，正如你所想，就是向客户端反向输出当前请求的路径。

我们可以通过运行一些例子来佐证：

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

再来看看这个程序所做出的变更。

在程序的第 11 行，我们仍旧使用 `flamego.Classic` 来创建一个经典 Flame 实例。

在程序的第 12 行，`printRequestPath` 函数被作为接收到 GET 请求时根路径（`"/"`）的处理器来替换之前的匿名函数，不过这里使用了通配符语法 `{*}`。这里的路由只会匹配到出现斜杠（`/`）为止，因此你会看到针对 `http://localhost:2830/bad-ass/who-am-i` 请求返回了 404。

::: tip
尝试使用 `{**}` 作为通配符语法，然后重新运行一遍之前的测试，看看会有什么不同。如果你对这里的细节感兴趣，可以阅读[路由配置](routing.md)的相关内容。
:::

在程序的第 15 行，使用 Go 语言 Web 应用中最常使用的 [`http.ListenAndServe`](https://pkg.go.dev/net/http#ListenAndServe) 来替换 Flame 实例内置的 `f.Run` 启动 Web 服务。你可能好奇为什么 Flame 实例可以被传递给 `http.ListenAndServe` 作为参数，这是因为每个 Flame 实例都实现了 [`http.Handler`](https://pkg.go.dev/net/http#Handler) 接口。由于这个特性的存在，使得将现有 Web 应用从其它 Web 框架逐步迁移到 Flamego 变得切实可行。

在程序的第 18 至 20 行，我们定义了一个名为 `printRequestPath` 的函数，使它接受 [`flaemgo.Context`](core-services.md#context) 作为参数并返回一个字符串作为返回值。在函数体内，通过调用 `Request` 方法获取到包含客户端请求路径的 [`http.Request`](https://pkg.go.dev/net/http#Request) 对象。

::: tip 💡 小贴士
你可能会疑惑 `printRequestPath` 函数在被调用的时候是如何获得对应的参数对象的，这涉及到 Flamego 中处理器的本质。如果你查看 [`flamego.Handler`](https://pkg.go.dev/github.com/flamego/flamego#Handler) 的类型定义便会发现它其实是一个[空接口（`interface{}`）](https://github.com/flamego/flamego/blob/8505d18c5243f797d5bb7160797d26454b9e5011/handler.go#L17)。

那么 Flame 实例又是如何在运行时确定将哪些参数传递给对应的处理器的呢？

这就是[服务注入](core-concepts.md#服务注入)的魅力（或者说迷惑 😅）所在，[`flamego.Context`](core-services#context) 只不过是被注入每个请求中的默认服务之一罢了。
:::

## 小结

现在，你应该对 Flamego 有了基本的了解，并知道如何使用它进行构建 Go Web 应用了。

学习一项新的知识从来不是简单的过程，尤其是当会接触到许多新概念的时候。所以请及时寻求帮助，并祝生活愉快！
