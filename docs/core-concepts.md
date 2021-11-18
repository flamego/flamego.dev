---
prev:
  text: Starter guide
  link: starter-guide.md
next:
  text: Core services
  link: core-services.md
---

# Core concepts

This page describes foundational concepts that are required to be proficient of using Flamego to build web applications that are most optimal.

## Classic Flame

The classic Flame instance is the one that comes with a reasonable list of default middleware and could be your starting point for build web applications using Flamego.

A fresh classic Flame instance is returned every time you call [`flamego.Classic`](https://pkg.go.dev/github.com/flamego/flamego#Classic), and following middleware are registered automatically:

- [`flamego.Logger`](core-services.md#routing-logger) for logging requested routes
- [`flamego.Recovery`](core-services.md#panic-recovery) for recovering from panic
- [`flamego.Static`](core-services.md#serving-static-files) for serving static files

::: tip
If you look up [the source code of the `flamego.Classic`](https://github.com/flamego/flamego/blob/8505d18c5243f797d5bb7160797d26454b9e5011/flame.go#L65-L77), it is fairly simple:

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

Do keep in mind that `flamego.Classic` may not always be what you want if you do not use these default middleware (e.g. for using custom implementations), or to use different config options, or even just want to change the order of middleware as sometimes the order matters (i.e. middleware are being invoked in the same order as they are registered).
:::

## Instances

The function [`flamego.New`](https://pkg.go.dev/github.com/flamego/flamego#New) is used to create bare Flame instances that do not have default middleware registered, and any type that contains the [`flamego.Flame`](https://pkg.go.dev/github.com/flamego/flamego#Flame) can be seen as a Flame instance.

Each Flame instace is independent of other Flame instances in the sense that instance state is not shared and is maintained separately by each of them. For example, you can have two Flame instances simultaneously and both of them can have different middleware, routes and handlers registered or defined:

```go:no-line-numbers
func main() {
	f1 := flamego.Classic()

	f2 := flamego.New()
	f2.Use(flamego.Recovery())

    ...
}
```

In the above example, `f1` has some default middleware registered as a classic Flame instance, while `f2` only has a single middleware `flamego.Recovery`.

::: tip 💬 Do you agree?
Storing states in the way that is polluting global namespace is such a bad practice that not only makes the code hard to maintain in the future, but also creates more tech debt with every single new line of the code.

It feels so elegent to have isolated state managed by each Flame instance, and make it possible to migrate existing web applications to use Flamego progressively.
:::

