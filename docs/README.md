![Flamego](https://github.com/flamego/brand-kit/raw/main/banner/banner-01.jpg)

Flamego is a fantastic modular Go web framework boiled with dependency injection.

It is the successor of the [Macaron](https://github.com/go-macaron/macaron), and equips the most powerful routing syntax among all web frameworks within the Go ecosystem.

## Installation

The minimum requirement of Go is **1.16**.

	go get github.com/flamego/flamego

## Getting started

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

## Features

- The most powerful routing syntax among all web frameworks within the Go ecosystem.
- Limitless routes nesting and grouping.
- Inject middleware at wherever you want.
- Integrate with any existing Go web application non-intrusively.
- Dependency injection via function signature to write testable and maintainable code.

_Stay tuned!_
