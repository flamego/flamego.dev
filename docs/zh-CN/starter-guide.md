---
sidebar: false
next:
  text: 核心概念
  link: core-concepts
---

::: danger
本页内容尚未完成简体中文的翻译，目前显示为英文版内容。如有意协助翻译，请前往 [GitHub](https://github.com/flamego/flamego/issues/78) 认领，感谢支持！
:::

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

On line 15, the call of `f.Run` is replaced by the [`http.ListenAndServe`](https://pkg.go.dev/net/http#ListenAndServe), which is the most common way to start a web server in Go, and maybe more familiar to you if you have used other Go web frameworks. This is possible with Flamego because Flame instances implement the [`http.Handler`](https://pkg.go.dev/net/http#Handler) interface. Therefore, a Flame instance can be plugged into anywhere that accepts a `http.Handler`, and is particularly useful when you want to progressively migrate an existing Go web application to use Flamego.

On line 18 to 20, we define the signature and the body of the `printRequestPath`. It accepts one argument with the type [`flaemgo.Context`](core-services.md#context) and returns a string. It then calls the `Request` method to retrieve the [`http.Request`](https://pkg.go.dev/net/http#Request) which contains the request path from the client.

::: tip 💡 小贴士
You may start wondering that we did not tell the Flame instance what arguments it should pass to the `printRequestPath` when the function is being invoked, and if you look up the definition of [`flamego.Handler`](https://pkg.go.dev/github.com/flamego/flamego#Handler), it is nothing but [an empty interface (`interface{}`)](https://github.com/flamego/flamego/blob/8505d18c5243f797d5bb7160797d26454b9e5011/handler.go#L17).

So how does the Flame instance determine what to pass down to its handlers at runtime?

This is the beauty (or confusion? 😅) of the [service injection](core-concepts.md#service-injection), and [`flamego.Context`](core-services#context) is one of the default services that are injected into every request.
:::

## Wrapping up

At this point, you should have some basic understanding of what is Flamego and how to start using it in your Go web applications.

Starting a new journey is never easy, especially when there are a lot of new concepts and content to learn. Please don't be hesitate reaching out for help and have a nice day!
