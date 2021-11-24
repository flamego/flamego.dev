---
sidebar: false
next:
  text: Starter guide
  link: starter-guide.md
---

![Flamego](https://github.com/flamego/brand-kit/raw/main/banner/banner-01.jpg)

Flamego is a fantastic modular Go web framework boiled with dependency injection.

It is the successor of the [Macaron](https://github.com/go-macaron/macaron), and equips the most powerful routing syntax among all web frameworks within the Go ecosystem.

## Installation

The minimum requirement of Go is **1.16**.

```:no-line-numbers
go get github.com/flamego/flamego
```

## Getting started

```go:no-line-numbers
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

## Features

- The most powerful routing syntax among all web frameworks within the Go ecosystem.
- Limitless routes nesting and grouping.
- [Inject middleware at wherever you want](core-concepts.md#middleware).
- Integrate with any existing Go web application non-intrusively.
- Dependency injection via function signature to write testable and maintainable code.

## Exploring more

- New to Flamego? Check out the [Starter guide](starter-guide.md)!
- Look up [Middleware](middleware/README.md) that are built for Flamego.
- Have any questions? Answers may be found in our [FAQs](faqs.md).
- Please [file an issue](https://github.com/flamego/flamego/issues) or [start a discussion](https://github.com/flamego/flamego/discussions) if you want to reach out.
- Follow our [Twitter](https://twitter.com/flamego_dev) to stay up to the latest news.
- Our [brand kit](https://github.com/flamego/brand-kit) is also available on GitHub!
