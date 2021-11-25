---
prev:
  text: Core services
  link: core-services.md
next:
  text: Routing
  link: routing.md
---

# Custom services

The [core services](core-services.md) from Flamego are great, but they are certainly not enough for your web applications, Inevitably, you will start want to make your own [middleware](core-concepts.md#middleware) and custom services that are specifically fitting your needs.

## Injecting services

The Flame instance is building on top of the [`inject.Injector`](https://pkg.go.dev/github.com/flamego/flamego/inject#Injector) to provide service injections for your handlers. Both [`flamego.Flame`](https://pkg.go.dev/github.com/flamego/flamego#Flame) and [`flamego.Context`](https://pkg.go.dev/github.com/flamego/flamego#Context) have embeded the `inject.Injector` that allow you to inject services at anywhere you want.

The `Map` method is used to inject services (aka. map values to their own types), the injected service can be a concrete type ([`*log.Logger`](https://pkg.go.dev/log#Logger)) or an interface ([`io.Writer`](https://pkg.go.dev/io#Writer)):

```go:no-line-numbers
l := log.New(os.Stdout, "[Flamego] ", 0)
f := flamego.New()
f.Map(l)

// or

var w io.Writer = &bytes.Buffer{}
f := flamego.New()
f.Map(w)
```

### Global services

### Group services

### Route-level services

## Mapping values to interfaces

## Overriding services

## `inject.Invoker` vs `inject.FastInvoker`

