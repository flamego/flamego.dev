---
prev:
  text: 核心概念
  link: core-concepts
next:
  text: 自定义服务
  link: custom-services
---

# 核心服务

为了帮助用户快速构建 Web 应用，Flamego 提供了一些几乎每个 Web 应用都会使用到的核心服务，但是否使用这些核心服务的选择权仍旧在用户手里。Flamego 的设计理念永远是简洁的核心以及按需扩展，不会捆绑给用户不需要的东西。

## 请求上下文

每个处理器在运行时被调用都会获得一个类型为 [`flamego.Context`](https://pkg.go.dev/github.com/flamego/flamego#Context) 的请求上下文。除了一些如缓存、数据库连接等有状态的资源之外，每个请求上下文之间的数据和状态并不隐性共享。

因为，`flamego.Context` 可以在你的处理器中被直接使用：

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

当一个路由被匹配时，Flame 实例会将与路由绑定的中间件和处理器按照注册的顺序[生成一个调用栈](https://github.com/flamego/flamego/blob/8709b65452b2f8513508500017c862533ca767ee/flame.go#L82-L84)。

在默认情况下，调用栈中的处理器只有在前一个处理器执行完成并退出后才会调用后续的处理器。但是，你可以通过调用 `Next` 方法来改变这种默认行为，从而使得当前处理器的逻辑暂停执行，直到后续的所有处理器执行完成后再恢复执行。

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

运行上面的程序并执行 `curl http://localhost:2830/` 后，可以在终端看到如下输出：

```:no-line-numbers
[Flamego] Listening on 0.0.0.0:2830 (development)
starting the first handler
executing the second handler
exiting the first handler
```

[路由日志](#路由日志)就是利用这个功能实现[响应时间和状态码的收集](https://github.com/flamego/flamego/blob/8709b65452b2f8513508500017c862533ca767ee/logger.go#L74-L83)。

### 客户端地址

Web 应用经常会想要知道客户端的来源地址，`RemoteAddr()` 则是一个提供获取客户端地址的辅助方法：

```go:no-line-numbers
func main() {
	f := flamego.New()
	f.Get("/", func(c flamego.Context) string {
		return "The remote address is " + c.RemoteAddr()
	})
	f.Run()
}
```

标准库的 `http.Request.RemoteAddr` 字段仅会记录客户端的最近发起地址，如果 Web 应用存在反向代理的话，这个字段的值就显得毫无意义。`RemoteAddr()` 方法会按照如下顺序从一些特定的 HTTP 请求头中获取潜在的客户端地址：

- `X-Real-IP`
- `X-Forwarded-For`
- `http.Request.RemoteAddr`

这样一来，就可以配置反向代理提供这些请求头来将客户端地址传递给你的 Web 应用。

::: warning
目前并没有绝对可靠的方法来获取真实的客户端地址，尤其是在客户端使用 VPN 或者代理访问 Web 应用的情况下。
:::

### 重定向

`Redirect` 方法是 [`http.Redirect` 方法的语法糖](https://github.com/flamego/flamego/blob/8709b65452b2f8513508500017c862533ca767ee/context.go#L225-L232)，因为它可以直接从 Flame 实例的请求上下文中获取重定向所需的 `http.ResponseWriter` 和 `*http.Request` 对象，并使用 `http.StatusFound` 作为默认的跳转码：

:::: code-group
::: code-group-item 代码
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
::: code-group-item 测试
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
`Redirect` 仅实现了无脑的重定向逻辑，因此可能使你的 Web 应用遭受[开放重定向漏洞](https://portswigger.net/kb/issues/00500100_open-redirection-reflected)的攻击，例如：

```go:no-line-numbers
c.Redirect("https://www.google.com")
```

请务必在进行重定向之前检验用户的输入！
:::

### URL 参数

[URL 参数](https://www.semrush.com/blog/url-parameters/)，也叫“URL 查询参数”，又叫“URL 查询字符串”，常被用于页面传递参数给后端服务器。

`Query` 是用于获取 URL 参数的辅助方法，若指定参数不存在则返回空字符串：

:::: code-group
::: code-group-item 代码
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
::: code-group-item 测试
```:no-line-numbers
$ curl http://localhost:2830?name=joe
The name is joe

$ curl http://localhost:2830
The name is
```
:::
::::

Flame 实例的请求上下文提供了一系列相关的辅助方法，包括：

- `QueryTrim` 去除空格并返回值
- `QueryStrings` 返回字符串列表
- `QueryUnescape` 返回未经反转义的值
- `QueryBool` 返回解析为 `bool` 类型的值
- `QueryInt` 返回解析为 `int` 类型的值
- `QueryInt` 返回解析为 `int64` 类型的值
- `QueryFloat64` 返回解析为 `float64` 类型的值

::: tip
如果现有的辅助方法不能满足应用需求，你还可以通过直接操作底层的 [`url.Values`](https://pkg.go.dev/net/url#Values) 来获取：

```go:no-line-numbers
vals := c.Request().URL.Query()
```
:::

### `flamego.Context` 是否可以替代 `context.Context`？

不可以。

`flamego.Context` 是请求上下文的容器，仅适用于路由层，而 `context.Context` 是通用的上下文容器，应当被用于后续的传递（如传递到数据库层）。

你可以通过如下方法获取请求所对应的 `context.Context`：

```go:no-line-numbers
f.Get(..., func(c flamego.Context) {
    ctx := c.Request().Context()
    ...
})

// 或

f.Get(..., func(r *http.Request) {
    ctx := r.Context()
    ...
})
```

## 默认日志器

[`*log.Logger`](https://pkg.go.dev/log#Logger) 可以作为所有中间件和处理器的通用日志器使用：

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

运行上面的程序并执行 `curl http://localhost:2830/` 后，可以在终端看到如下输出：

```:no-line-numbers
[Flamego] Listening on 0.0.0.0:2830 (development)
[Flamego] Hello, Flamego!
```

[路由日志](#路由日志)就是使用了这个核心服务实现[响应时间和状态码的打印](https://github.com/flamego/flamego/blob/8709b65452b2f8513508500017c862533ca767ee/logger.go#L98)。

## 响应流

请求的响应流是通过 [`http.ResponseWriter`](https://pkg.go.dev/net/http#ResponseWriter) 类型来表示的，你可以通过处理器参数或调用 `flamego.Context` 的 `ResponseWriter` 方法来获取它：

```go:no-line-numbers
f.Get(..., func(w http.ResponseWriter) {
    ...
})

// 或

f.Get(..., func(c flamego.Context) {
    w := c.ResponseWriter()
    ...
})
```

::: tip 💡 小贴士
并不是所有在调用栈中的中间件和处理器都一定会被调用，请求上下文（`flamego.Context`）会在[任一输出状态码的处理器](https://github.com/flamego/flamego/blob/1114ba32a13be474a80a702fb3909ccd49250523/context.go#L201-L202)执行完成之后停止调用剩余的处理器，这个机制类似于[短路评估](https://en.wikipedia.org/wiki/Short-circuit_evaluation)。
:::

## 请求对象

请求对象是通过 [`*http.Request`](https://pkg.go.dev/net/http#Request) 类型来表示的，你可以通过处理器参数或调用 `flamego.Context` 的 `Request().Request` 方法来获取它：

```go:no-line-numbers
f.Get(..., func(r *http.Request) {
    ...
})

// 或

f.Get(..., func(c flamego.Context) {
    r := c.Request().Request
    ...
})
```

你可能会疑惑上例中的 `c.Request()` 返回的是什么类型？

这个方法返回的是 `*http.Request` 类型的一层简单封装 [`*flamego.Request`](https://pkg.go.dev/github.com/flamego/flamego#Request)，包含了一些用于读取请求体的辅助方法，例如：

```go:no-line-numbers
f.Get(..., func(c flamego.Context) {
    body := c.Request().Body().Bytes()
    ...
})
```

## 路由日志

::: tip
该中间件是通过 [`flamego.Classic`](https://pkg.go.dev/github.com/flamego/flamego#Classic) 所创建的 Flame 实例的默认中间件之一。
:::

[`flamego.Logger`](https://pkg.go.dev/github.com/flamego/flamego#Logger) 是用于提供请求路由和状态码记录的中间件：

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

运行上面的程序并执行 `curl http://localhost:2830/` 后，可以在终端看到如下输出：

```:no-line-numbers
[Flamego] Listening on 0.0.0.0:2830 (development)
[Flamego] ...: Started GET / for 127.0.0.1
[Flamego] ...: Completed GET / 200 OK in 165.791µs
```

## Panic 恢复

::: tip
该中间件是通过 [`flamego.Classic`](https://pkg.go.dev/github.com/flamego/flamego#Classic) 所创建的 Flame 实例的默认中间件之一。
:::

[`flamego.Recovery`](https://pkg.go.dev/github.com/flamego/flamego#Recovery) 是用于捕捉 panic 并自动恢复的中间件：

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

运行上面的程序并访问 [http://localhost:2830/](http://localhost:2830/) 可以看到如下内容：

![panic recovery](/imgs/panic-recovery.png)

## 响应静态资源

::: tip
该中间件是通过 [`flamego.Classic`](https://pkg.go.dev/github.com/flamego/flamego#Classic) 所创建的 Flame 实例的默认中间件之一。
:::

[`flamego.Static`](https://pkg.go.dev/github.com/flamego/flamego#Static) 是用于向客户端提供静态资源响应的中间件，并可以通过 [`flamego.StaticOptions`](https://pkg.go.dev/github.com/flamego/flamego#StaticOptions) 进行配置：

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

你也可以直接使用默认配置：

```go:no-line-numbers
func main() {
	f := flamego.New()
	f.Use(flamego.Static())
	f.Run()
}
```

### 示例：响应源文件

在本例中，我们会将源文件本身作为静态资源响应给客户端：

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

在示例的第 11 行，我们将 `Directory` 的值设置为工作目录（`"./"`）而非默认值 `"public"`。

在示例的第 12 行，我们将索引文件设置为 `main.go` 而非默认值 `"index.html"`。

将上面的程序保存至 `main.go` 并且运行它，然后执行 `curl http://localhost:2830/` 或 `curl http://localhost:2830/main.go` 都可以得到 `main.go` 的文件内容本身。

### 示例：响应多个目录

在本例中，我们会将两个不同目录的文件作为静态资源响应给客户端：

:::: code-group
::: code-group-item 文件树
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
::: code-group-item 测试
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

你可能注意到客户端不需要将 `Directory` 的值作为请求路径的一部分，即本例中的 `"css"` 和 `"js"`。如果你希望客户端带有请求前缀，则可以通过配置 `Prefix` 实现：

```go:no-line-numbers{4}
f.Use(flamego.Static(
    flamego.StaticOptions{
        Directory: "css",
        Prefix:    "css",
    },
))
```

::: tip 💡 小贴士
虽然本例中的 `Prefix` 和 `Directory` 值是相同的，但并不是必须的，它们之间没有直接关联。
:::

### 示例：响应 `embed.FS`

在本例中，我们会将自 [Go 1.16 起支持](https://blog.jetbrains.com/go/2021/06/09/how-to-use-go-embed-in-go-1-16/)的 [`embed.FS`](https://pkg.go.dev/embed#FS) 作为静态资源的数据来源响应给客户端：

:::: code-group
::: code-group-item 文件树
```:no-line-numbers
tree .
.
├── css
│   └── main.css
├── go.mod
├── go.sum
└── main.go
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
::: code-group-item 测试
```:no-line-numbers
$ curl http://localhost:2830/css/main.css
html {
    color: red;
}
```
:::
::::

::: warning
由于 Go embed 功能会编码文件的完整路径，客户端必须携带父目录的信息才可以访问到对应的资源，这和直接从本地文件响应有所区别。

下面是错误的客户端请求方式：

```:no-line-numbers
$ curl http://localhost:2830/main.css
404 page not found
```
:::

## 渲染内容

[`flamego.Renderer`](https://pkg.go.dev/github.com/flamego/flamego#Renderer) 是用于向客户端渲染指定数据格式的中间件，并可以通过 [`flamego.RenderOptions`](https://pkg.go.dev/github.com/flamego/flamego#RenderOptions) 进行配置。

[`flamego.Render`](https://pkg.go.dev/github.com/flamego/flamego#Render) 会作为渲染服务注入到请求的上下文中，你可以用它渲染 JSON、XML、二进制或纯文本格式的数据：

:::: code-group
::: code-group-item 代码
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
::: code-group-item 测试
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
尝试将第 13 行修改为 `JSONIndent: "",`，然后重新运行一遍之前的测试，看看会有什么不同。
:::
