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

