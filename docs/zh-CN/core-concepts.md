---
prev:
  text: 初学指南
  link: starter-guide
next:
  text: 核心服务
  link: core-services
---

# 核心概念

本文档讲解了精通 Flamego 开发 Web 应用所必备的基础概念。

## 经典 Flame

经典 Flame 实例集成了一些大多数 Web 应用都会用到的默认中间件。

每次调用 [`flamego.Classic`](https://pkg.go.dev/github.com/flamego/flamego#Classic) 方法都会返回一个全新的经典 Flame 实例，并自动注册以下中间件：

- [`flamego.Logger`](core-services.md#routing-logger) 用于请求路由日志
- [`flamego.Recovery`](core-services.md#panic-recovery) 用于从 panic 恢复
- [`flamego.Static`](core-services.md#serving-static-files) 用于响应静态资源

::: tip
如果查看 [`flamego.Classic` 的源码](https://github.com/flamego/flamego/blob/8505d18c5243f797d5bb7160797d26454b9e5011/flame.go#L65-L77)则不难发现它其实也不过一层浅浅的封装：

```go:no-line-numbers
func Classic() *Flame {
	f := New()
	f.Use(
		Logger(),
		Recovery(),
		Static(
			StaticOptions{
				Directory: "public",
			},
		),
	)
	return f
}
```

不过 `flamego.Classic` 只是在一定程度上提供了便利，但并不总是你所需要的，比如需要使用第三方开发的中间件来替换官方实现、更改自定义中间件的配置选项或变换中间件的注册顺序等等。
:::

## 实例

[`flamego.New`](https://pkg.go.dev/github.com/flamego/flamego#New) 函数可以创建没有注册任何中间件的纯净 Flame 实例，并且任何包含 [`flamego.Flame`](https://pkg.go.dev/github.com/flamego/flamego#Flame) 的类型都可以被视作一个 Flame 实例。

每个 Flame 实例都是独立于其它 Flame 实例而存在的。换句话说，实例之间的状态不会进行隐性地共享或相互影响。例如，你可以同时创建两个 Flame 实例并为它们注册不同的中间件、配置不同的路由和定义不同的处理器：

```go:no-line-numbers
func main() {
	f1 := flamego.Classic()

	f2 := flamego.New()
	f2.Use(flamego.Recovery())

    ...
}
```

在上例中，`f1` 集成了经典 Flame 实例所自带的默认中间件，而 `f2` 仅仅注册了其中一个中间件，即 `flamego.Recovery`。

::: tip 💬 话题讨论
在全局命名空间中存储的状态会容易受到其它因素的副作用而发生隐性的绑定关系，这种隐性绑定关系对于未来的代码维护和升级都是巨大的挑战，是产生技术债务的主要来源之一。

与之相对的，Flame 实例的状态管理非常干净和优雅，实例之间从设计上进行状态隔离，并为渐进式迁移现有 Web 应用提供了便利。
:::

## 处理器

[`flamego.Hander`](https://pkg.go.dev/github.com/flamego/flamego#Handler) 是 Flamego 中处理器的类型容器，如果你打开源码便能发现其本质上就是一个空接口（`interface{}`）：

```go:no-line-numbers
// Handler is any callable function. Flamego attempts to inject services into
// the Handler's argument list and panics if any argument could not be fulfilled
// via dependency injection.
type Handler interface{}
```

根据注释文档的所言，任何可以被调用的函数都是有效的 `flamego.Handler`，无论是匿名函数、声明函数还是某个类型的方法：

:::: code-group
::: code-group-item 代码
```go:no-line-numbers
package main

import (
	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Get("/anonymous", func() string {
		return "Respond from an anonymous function"
	})
	f.Get("/declared", declared)

	t := &customType{}
	f.Get("/method", t.handler)

	f.Run()
}

func declared() string {
	return "Respond from a declared function"
}

type customType struct{}

func (t *customType) handler() string {
	return "Respond from a method of a type"
}
```
:::
::: code-group-item 测试
```:no-line-numbers
$ curl http://localhost:2830/anonymous
Respond from an anonymous function

$ curl http://localhost:2830/declared
Respond from a declared function

$ curl http://localhost:2830/method
Respond from a method of a type
```
:::
::::

## 返回值

Web 应用向客户端响应内容的一般做法是向 [`http.ResponseWriter`](https://pkg.go.dev/net/http#ResponseWriter) 写入内容（该对象可以通过 [`flamego.Context`](https://pkg.go.dev/github.com/flamego/flamego#Context) 的 `ResponseWriter` 获得）。在部分 Web 框架中，还允许用户额外返回一个 `error` 类型的返回值用于表示是否发生服务端错误：

```go:no-line-numbers
func handler(w http.ResponseWriter, r *http.Request) error
```

即便如此，仍旧没有解决用户所定义的处理器必须符合几个有限的函数签名设计。Flamego 的一大特性便是允许用户为不同的处理器灵活定义它们所需要的返回值，不管是错误、字符串还是状态码。

下面列举了一些处理器可以使用的内置返回值：

:::: code-group
::: code-group-item 代码
```go
package main

import (
	"errors"

	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Get("/string", func() string {
		return "Return a string"
	})
	f.Get("/bytes", func() []byte {
		return []byte("Return some bytes")
	})
	f.Get("/error", func() error {
		return errors.New("Return an error")
	})
	f.Run()
}
```
:::
::: code-group-item 测试
```:no-line-numbers
$ curl -i http://localhost:2830/string
HTTP/1.1 200 OK
...

Return a string

$ curl -i http://localhost:2830/bytes
HTTP/1.1 200 OK
...

Return some bytes

$ curl -i http://localhost:2830/error
HTTP/1.1 500 Internal Server Error
...

Return an error
...
```
:::
::::

如上所示，当处理器返回错误时，Flame 实例会将 HTTP 状态码自动设为 500.

::: tip
尝试将第 18 行的返回值修改为 `nil`，然后重新运行一遍之前的测试，看看会有什么不同。
:::

### 返回状态码

你也可以通过返回值来精准控制每个处理器响应给客户端的状态码：

:::: code-group
::: code-group-item 代码
```go:no-line-numbers
package main

import (
	"errors"
	"net/http"

	"github.com/flamego/flamego"
)

func main() {
	f := flamego.New()
	f.Get("/string", func() (int, string) {
		return http.StatusOK, "Return a string"
	})
	f.Get("/bytes", func() (int, []byte) {
		return http.StatusOK, []byte("Return some bytes")
	})
	f.Get("/error", func() (int, error) {
		return http.StatusForbidden, errors.New("Return an error")
	})
	f.Run()
}
```
:::
::: code-group-item 测试
```:no-line-numbers
$ curl -i http://localhost:2830/string
HTTP/1.1 200 OK
...

Return a string

$ curl -i http://localhost:2830/bytes
HTTP/1.1 200 OK
...

Return some bytes

$ curl -i http://localhost:2830/error
HTTP/1.1 403 Forbidden
...

Return an error
...
```
:::
::::

![How cool is that?](https://media0.giphy.com/media/hS4Dz87diTpnDXf98E/giphy.gif?cid=ecf05e47go1oiqgxj1ro7e3t1usexogh109gigssvhxlp93a&rid=giphy.gif&ct=g)

## 服务注入

Flamego 的[依赖注入](https://en.wikipedia.org/wiki/Dependency_injection)思想主要体现在服务注入上，是整个框架的灵魂所在。Flame 实例通过 [`inject.Injector`](https://pkg.go.dev/github.com/flamego/flamego/inject#Injector) 来管理服务注入和依赖解析，实现在运行时为每个处理器提供其所需的参数对象。

依赖注入和服务注入都是比较抽象的概念，直接通过例子讲解会更容易上手：

```go:no-line-numbers
// http.ResponseWriter 和 *http.Request 都已经被注入到请求上下文中，
// 因此它们可以直接被当作处理器的参数使用。
f.Get("/", func(w http.ResponseWriter, r *http.Request) { ... })

// flamego.Context 是使用 Flamego 构建的 Web 应用中最常见的服务
f.Get("/", func(c flamego.Context) { ... })
```

那假如处理器使用了未被注入的服务作为参数会发生什么？

:::: code-group
::: code-group-item 代码
```go:no-line-numbers
package main

import (
	"github.com/flamego/flamego"
)

type myService struct{}

func main() {
	f := flamego.New()
	f.Get("/", func(s myService) {})
	f.Run()
}
```
:::
::: code-group-item 测试
```:no-line-numbers
http: panic serving 127.0.0.1:50061: unable to invoke the 0th handler [func(main.myService)]: value not found for type main.myService
...
```
:::
::::

::: tip
如果你对服务注入的底层原理感兴趣，可以阅读[自定义服务](custom-services.md)的相关内容。
:::

### 内置服务

Flame 实例为每个请求都提供了一些内置的服务，包括 [`*log.Logger`](https://pkg.go.dev/log#Logger)、[`flamego.Context`](https://pkg.go.dev/github.com/flamego/flamego#Context)、[`http.ResponseWriter`](https://pkg.go.dev/net/http#ResponseWriter) 和 [`*http.Request`](https://pkg.go.dev/net/http#Request)。

## 中间件

中间件是一种特殊的处理器，它们被设计为可复用的组件并允许用户通过配置选项进行自定义。站在编译器的角度上，处理器和中间件没有任何区别。

中间件和处理器虽然只是名称上的不同，但一般会使用中间件来表示提供特定服务的处理器，可以是[将某个服务注入到请求上下文](https://github.com/flamego/session/blob/f8f1e1893ea6c15f071dd53aefd9494d41ce9e48/session.go#L183-L184)或者是[解析请求内容](https://github.com/flamego/auth/blob/dbec68df251ff382e908eb5659453d4918a042aa/basic.go#L38-L42)。处理器则与路由进行配合为 Web 应用提供特定的业务逻辑支撑。

中间件可以被用在任何接受 `flamego.Handler` 类型的地方，包括全局、组级或路由级。

```go{6-9}
// 全局中间件会在其它所有中间件和处理器之前被调用
f.Use(middleware1, middleware2, middleware3)

// 组级中间件仅在组内定义的路由被匹配时才被调用
f.Group("/",
	func() {
		f.Get("/hello", func() { ... })
	},
	middleware4, middleware5, middleware6,
)

// 路由级中间件仅在所绑定的路由被匹配时才被调用
f.Get("/hi", middleware7, middleware8, middleware9, func() { ... })
```

需要注意的是，中间件永远比处理器先被调用。例如第 9 行的组级中间件虽然在语法上是后于组内路由的处理器（第 6 至 8 行）定义的，但在运行时它们仍旧是先于这些处理器被调用。

::: tip 💡 小贴士
无论是否发生路由匹配，全局中间件总是会被调用。
:::

::: tip
如果你想要创建自己的中间件进行服务注入，可以阅读[自定义服务](custom-services.md)的相关内容。
:::

## 运行环境

Flamego 运行环境为中间件和处理器提供了统一的环境变量接口 [`EnvType`](https://pkg.go.dev/github.com/flamego/flamego#EnvType)，从而允许中间件和处理器的代码逻辑可以根据不同的运行环境定义不同的行为。目前预定义的运行环境包括 `flamego.EnvTypeDev`、`flamego.EnvTypeProd` 和 `flamego.EnvTypeTest`，分别代表了开发环境、生产环境和测试环境。

例如，[template](./middleware/template.md#模板缓存) 中间件会在[运行环境为 `flamego.EnvTypeDev` 时为响应每个请求而重新编译模板](https://github.com/flamego/template/blob/ced6948bfc8cb49e32412380e407cbbe01485937/template.go#L229-L241)，但在其它运行环境缓存模板的编译结果。

Flamego 的运行环境一般通过环境变量 `FLAMEGO_ENV` 进行配置：

```sh:no-line-numbers
export FLAMEGO_ENV=development
export FLAMEGO_ENV=production
export FLAMEGO_ENV=test
```

当然，Web 应用也可以在运行时通过 [`Env`](https://pkg.go.dev/github.com/flamego/flamego#Env) 和 [`SetEnv`](https://pkg.go.dev/github.com/flamego/flamego#SetEnv) 方法对运行环境实现并发安全地读取和更新。
