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

The Flame instance is building on top of the [`inject.TypeMapper`](https://pkg.go.dev/github.com/flamego/flamego/inject#TypeMapper) to provide service injections for your handlers. Both [`flamego.Flame`](https://pkg.go.dev/github.com/flamego/flamego#Flame) and [`flamego.Context`](https://pkg.go.dev/github.com/flamego/flamego#Context) have embeded the `inject.TypeMapper` that allow you to inject services at anywhere you want.

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

The `MapTo` method works similar to `Map` but instead of ~~mapping values to their own types~~, it allows you to _map values to interfaces_:

```go:no-line-numbers
buf := &bytes.Buffer{}
f := flamego.New()
f.MapTo(buf, (*io.Writer)(nil))
```

You may also use the `MapTo` method to transform interfaces to other interfaces:

```go:no-line-numbers
var w io.ReadCloser = io.NopCloser(&bytes.Buffer{})
f := flamego.New()
f.MapTo(w, (*io.Reader)(nil))
f.MapTo(w, (*io.Closer)(nil))
```

::: warning
The `MapTo` method does a naive mapping and runtime panic could occur if the interface you're mapping to is not implemented by the type of the underlying value you're giving.
:::

### Global services

### Group services

### Route-level services

## Overriding services

## `inject.Invoker` vs `inject.FastInvoker`

