---
prev:
  text: 自定义服务
  link: custom-services
next:
  text: 中间件集成
  link: middleware
---

::: danger
本页内容尚未完成简体中文的翻译，目前显示为英文版内容。如有意协助翻译，请前往 [GitHub](https://github.com/flamego/flamego/issues/78) 认领，感谢支持！
:::

# 路由配置

每一个来自客户端的请求都会经过路由系统，因此路由系统的易用性对于一个 Web 框架来说是至关重要的。Flamego 在路由系统的设计和实现上花费了大量精力，在确保易用性的同时保留了未来的可扩展性。

路由是指 HTTP 请求方法和 URL 匹配模式的组合，并且每个路由都可以绑定多个处理器。

下面列举了对应不同 HTTP 请求的辅助方法：

```go:no-line-numbers
f.Get("/", ...)
f.Patch("/", ...)
f.Post("/", ...)
f.Put("/", ...)
f.Delete("/", ...)
f.Options("/", ...)
f.Head("/", ...)
f.Connect("/", ...)
f.Trace("/", ...)
```

`Any` 方法可以将单个路由与所有 HTTP 请求方法进行组合：

```go:no-line-numbers
f.Any("/", ...)
```

当你需要将单个路由与多个 HTTP 请求方法进行组合时，则可以使用 `Routes` 方法：

```go:no-line-numbers
f.Routes("/", "GET,POST", ...)
```

## 术语

- **URL 路径块**是指介于两个斜杠之间的部分，如 `/<segment>/`，且尾部的斜杠可以被省略
- **绑定参数** 使用花括号（`{}`）进行表示，并仅限用于[动态路由](#动态路由)

## 静态路由

静态路由是 Web 应用中最为常见的一种路由，即要求客户端的请求路径与配置的路径完整一致才能被匹配：

```go:no-line-numbers
f.Get("/user", ...)
f.Get("/repo", ...)
```

上例中，任何不为 `/user` 或 `/repo` 的请求路径都将收到 404。

::: warning
标准库的 `net/http` 允许用户使用 `/user/` 来匹配所有以 `/user` 开头的请求路径，但在 Flamego 中这仍旧只是一个单纯的静态路由，所以要求客户端的请求路径与 `/user/` 完全一致才能被匹配。

来看个例子就明白了：

```go:no-line-numbers
package main

import (
	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Get("/user/", func() string {
		return "You got it!"
	})
	f.Run()
}
```

运行如下测试：

```:no-line-numbers
$ curl http://localhost:2830/user
404 page not found

$ curl http://localhost:2830/user/
You got it!

$ curl http://localhost:2830/user/info
404 page not found
```
:::

## 动态路由

顾名思义，动态路由指的是可以进行动态匹配的路由配置。在撰写本文档时，Flamego 的动态路由在整个 Go 语言生态中依然首屈一指，无人望其项背。

`flamego.Context` 提供了一系列的辅助方法来获取动态路由中的绑定参数，包括：

- `Params` 返回所有的绑定参数
- `Param` 返回指定的绑定参数值
- `ParamInt` 返回解析为 `int` 类型的绑定参数值
- `ParamInt64` 返回解析为 `int64` 类型的绑定参数值

### 占位符

占位符可以用于匹配除了斜杠（`/`）以外的所有字符，并且在单个 URL 路径块中可以使用任意多个占位符。

下面列举了一些占位符的用法：

```go
f.Get("/users/{name}", ...)
f.Get("/posts/{year}-{month}-{day}.html", ...)
f.Get("/geo/{state}/{city}", ...)
```

在第 1 行，名为 `{name}` 的占位符会匹配整个 URL 路径块。

在第 2 行，`{year}`、`{month}` 和 `{day}` 这三个占位符会分别匹配 URL 路径块的三个部分。

在第 3 行，两个占位符由于在不同的 URL 路径块中，因此相互独立不受影响。

再来一些完整的例子：

:::: code-group
::: code-group-item 代码
```go:no-line-numbers
package main

import (
	"fmt"
	"strings"

	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Get("/users/{name}", func(c flamego.Context) string {
		return fmt.Sprintf("The user is %s", c.Param("name"))
	})
	f.Get("/posts/{year}-{month}-{day}.html", func(c flamego.Context) string {
		return fmt.Sprintf(
			"The post date is %d-%d-%d",
			c.ParamInt("year"), c.ParamInt("month"), c.ParamInt("day"),
		)
	})
	f.Get("/geo/{state}/{city}", func(c flamego.Context) string {
		return fmt.Sprintf(
			"Welcome to %s, %s!",
			strings.Title(c.Param("city")),
			strings.ToUpper(c.Param("state")),
		)
	})
	f.Run()
}
```
:::
::: code-group-item 测试
```:no-line-numbers
$ curl http://localhost:2830/users/joe
The user is joe

$ curl http://localhost:2830/posts/2021-11-26.html
The post date is 2021-11-26

$ curl http://localhost:2830/geo/ma/boston
Welcome to Boston, MA!
```
:::
::::

::: tip
尝试执行 `curl http://localhost:2830/posts/2021-11-abc.html` 并观察输出的变化。
:::

### 正则表达式

正则表达式可以被用来进一步限定绑定参数的匹配规则，并使用斜杠进行表示，如 `/<regexp>/`。

下面列举了一些使用正则表达式定义的绑定参数：

```go
f.Get("/users/{name: /[a-zA-Z0-9]+/}", ...)
f.Get("/posts/{year: /[0-9]{4}/}-{month: /[0-9]{2}/}-{day: /[0-9]{2}/}.html", ...)
f.Get("/geo/{state: /[A-Z]{2}/}/{city}", ...)
```

在第 1 行，名为 `{name}` 的占位符会匹配整个 URL 路径块中的字母和数字。

在第 2 行，`{year}`、`{month}` 和 `{day}` 这三个占位符会分别匹配 URL 路径块中具有特定长度的数字。

在第 3 行，`{state}` 仅会匹配长度为 2 的大写字母。

::: tip
由于正则表达式自身是通过斜杠进行表示的，因此它们匹配规则不可以包含斜杠：

```:no-line-numbers
panic: unable to parse route "/{name: /abc\\//}": 1:15: unexpected token "/" (expected "}")
```
:::

再来一些完整的例子：

:::: code-group
::: code-group-item 代码
```go:no-line-numbers
package main

import (
	"fmt"
	"strings"

	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Get("/users/{name: /[a-zA-Z0-9]+/}",
		func(c flamego.Context) string {
			return fmt.Sprintf("The user is %s", c.Param("name"))
		},
	)
	f.Get("/posts/{year: /[0-9]{4}/}-{month: /[0-9]{2}/}-{day: /[0-9]{2}/}.html",
		func(c flamego.Context) string {
			return fmt.Sprintf(
				"The post date is %d-%d-%d",
				c.ParamInt("year"), c.ParamInt("month"), c.ParamInt("day"),
			)
		},
	)
	f.Get("/geo/{state: /[A-Z]{2}/}/{city}",
		func(c flamego.Context) string {
			return fmt.Sprintf(
				"Welcome to %s, %s!",
				strings.Title(c.Param("city")),
				c.Param("state"),
			)
		},
	)
	f.Run()
}
```
:::
::: code-group-item 测试
```:no-line-numbers
$ curl http://localhost:2830/users/joe
The user is joe

$ curl http://localhost:2830/posts/2021-11-26.html
The post date is 2021-11-26

$ curl http://localhost:2830/geo/MA/boston
Welcome to Boston, MA!
```
:::
::::

::: tip
尝试运行以下测试并观察输出的变化：

```:no-line-numbers
$ curl http://localhost:2830/users/logan-smith
$ curl http://localhost:2830/posts/2021-11-abc.html
$ curl http://localhost:2830/geo/ma/boston
```
:::

### 通配符

A bind parameter can be defined with globs to capture characters across URL path segments (including forward slashes). The only notation for the globs is `**` and allows an optional argument `capture` to define how many URL path segments to capture _at most_.

Below are all valid usages of bind parameters with globs:

```go
f.Get("/posts/{**}", ...) // A shorthand for "{**: **}"
f.Get("/webhooks/{repo: **}/events", ...)
f.Get("/geo/{**: **, capture: 2}", ...)
```

On line 1, the glob captures everything under the `/posts/` path.

On line 2, the glob captures everything in between a path starts with `/webhooks/` and ends with `/events`.

On line 3, the glob captures at most two URL path segments under the `/geo/` path.

Let's see some examples:

:::: code-group
::: code-group-item 代码
```go:no-line-numbers
package main

import (
	"fmt"
	"strings"

	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Get("/posts/{**}",
		func(c flamego.Context) string {
			return fmt.Sprintf("The post is %s", c.Param("**"))
		},
	)
	f.Get("/webhooks/{repo: **}/events",
		func(c flamego.Context) string {
			return fmt.Sprintf("The event is for %s", c.Param("repo"))
		},
	)
	f.Get("/geo/{**: **, capture: 2}",
		func(c flamego.Context) string {
			fields := strings.Split(c.Param("**"), "/")
			return fmt.Sprintf(
				"Welcome to %s, %s!",
				strings.Title(fields[1]),
				strings.ToUpper(fields[0]),
			)
		},
	)
	f.Run()
}
```
:::
::: code-group-item 测试
```:no-line-numbers
$ curl http://localhost:2830/posts/2021/11/26.html
The post is 2021-11-26.html

$ curl http://localhost:2830/webhooks/flamego/flamego/events
The event is for flamego/flamego

$ curl http://localhost:2830/geo/ma/boston
Welcome to Boston, MA!
```
:::
::::

::: tip
尝试运行以下测试并观察输出的变化：

```:no-line-numbers
$ curl http://localhost:2830/webhooks/flamego/flamego
$ curl http://localhost:2830/geo/ma/boston/02125
```
:::

## 组合路由

The `Combo` method can create combo routes when you have different handlers for different HTTP methods of the same route:

```go:no-line-numbers
f.Combo("/").Get(...).Post(...)
```

## 组路由

Organizing routes in groups not only help code readability, but also encourages code reuse in terms of shared middleware.

It is as easy as wrapping your routes with the `Group` method, and there is no limit on how many level of nestings you may have:

```go{4}
f.Group("/user", func() {
    f.Get("/info", ...)
    f.Group("/settings", func() {
        f.Get("", ...)
        f.Get("/account_security", ...)
    }, middleware3)
}, middleware1, middleware2)
```

The line 4 in the above example may seem unusual to you, but that is not a mistake! The equivalent version of it is as follows:

```go:no-line-numbers
f.Get("/user/settings", ...)
```

![how does that work](https://media0.giphy.com/media/2gUHK3J2NCMsqsz1su/200w.webp?cid=ecf05e47d3syetfd9ja7nr3qwjfdrs4mnhjh46xq1numt01p&rid=200w.webp&ct=g)

That's because the Flamego router uses [string concatenation to combine group routes](https://github.com/flamego/flamego/blob/503ddd0f43a7281b5d334173aba5e32de2d2b31f/router.go#L201-L205).

Huh, so this also works?

```go:no-line-numbers{3-5}
f.Group("/user", func() {
    f.Get("/info", ...)
    f.Group("/sett", func() {
        f.Get("ings", ...)
        f.Get("ings/account_security", ...)
    }, middleware3)
}, middleware1, middleware2)
```

Yes!

## 可选路由

Optional routes may be used for both static and dynamic routes, and use question mark (`?`) as the notation:

```go:no-line-numbers
f.Get("/user/?settings", ...)
f.Get("/users/?{name}", ...)
```

The above example is essentially a shorthand for the following:

```go:no-line-numbers
f.Get("/user", ...)
f.Get("/user/settings", ...)
f.Get("/users", ...)
f.Get("/users/{name}", ...)
```

::: warning
The optional routes can only be used for the last URL path segment.
:::

## 匹配优先级

When your web application grows large enough, you'll start to want to make sense of which route gets matched at when. This is where the matching priority comes into play.

The matching priority is based on different URL-matching patterns, the matching scope (the narrower scope has the higher priority), and the order of registration.

Here is the breakdown:

1. Static routes are always being matched first, e.g. `/users/settings`.
1. Dynamic routes with placeholders not capturing everything, e.g. `/users/{name}.html`
1. Dynamic routes with single placeholder captures everything, e.g. `/users/{name}`.
1. Dynamic routes with globs in the middle, e.g. `/users/{**}/events`.
1. Dynamic routes with globs in the end, e.g. `/users/{**}`.

## 构建 URL 路径

The URL path can be constructed using the `URLPath` method if you give the corresponding route a name, which helps prevent URL paths are getting out of sync spread across your codebase:

```go:no-line-numbers
f.Get("/user/?settings", ...).Name("UserSettings")
f.Get("/users/{name}", ...).Name("UsersName")

f.Get(..., func(c flamego.Context) {
   c.URLPath("UserSettings")                         // => /user
   c.URLPath("UserSettings", "withOptional", "true") // => /user/settings
   c.URLPath("UsersName", "name", "joe")             // => /users/joe
})
```

## 自定义 `NotFound` 处理器

By default, the [`http.NotFound`](https://pkg.go.dev/net/http#NotFound) is invoked for 404 pages, you can customize the behavior using the `NotFound` method:

```go:no-line-numbers
f.NotFound(func() string {
    return "This is a cool 404 page"
})
```

## 自动注册 `HEAD` 方法

By default, only GET requests is accepted when using the `Get` method to register a route, but it is not uncommon to allow HEAD requests to your web application.

The `AutoHead` method can automatically register HEAD method with same chain of handlers to the same route whenever a GET method is registered:

```go:no-line-numbers
f.Get("/without-head", ...)
f.AutoHead(true)
f.Get("/with-head", ...)
```

Please note that only routes that are registered after call of the `AutoHead(true)` method will be affected, existing routes remain unchanged.

In the above example, only GET requests are accepted for the `/without-head` path. Both GET and HEAD requests are accepted for the `/with-head` path.
