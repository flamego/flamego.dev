---
prev:
  text: Middleware
  link: middleware
# next:
#   text: Core services
#   link: core-services.md
---

# auth

The auth middleware provides request authentication for [Flame instances](../core-concepts.md#instances), including basic and bearer authentications.

You can read source code of this middleware on [GitHub](https://github.com/flamego/auth) and API documentation on [pkg.go.dev](https://pkg.go.dev/github.com/flamego/auth?tab=doc).

## Installation

The minimum requirement of Go is **1.16**.

```:no-line-numbers
go get github.com/flamego/auth
```

## Basic authentication

The [`auth.Basic`](https://pkg.go.dev/github.com/flamego/auth#Basic) takes a static combination of username and password to protect routes behind it. Upon successful authentication, the [`auth.User`](https://pkg.go.dev/github.com/flamego/auth#User) is injected into the request context, which simply contains the username:

```go:no-line-numbers
package main

import (
	"github.com/flamego/auth"
	"github.com/flamego/flamego"
)

func main() {
	f := flamego.Classic()
	f.Use(auth.Basic("username", "secretpassword"))
	f.Get("/", func(user auth.User) string {
		return "Welcome, " + string(user)
	})
	f.Run()
}
```

The [`auth.BasicFunc`](https://pkg.go.dev/github.com/flamego/auth#BasicFunc) can be used to support dynamic combinations of username and password:

```go:no-line-numbers{16}
package main

import (
	"github.com/flamego/auth"
	"github.com/flamego/flamego"
)

func main() {
	credentials := map[string]string{
		"alice": "pa$$word",
		"bob":   "secretpassword",
	}

	f := flamego.Classic()
	f.Use(auth.BasicFunc(func(username, password string) bool {
		return auth.SecureCompare(credentials[username], password)
	}))
	f.Get("/", func(user auth.User) string {
		return "Welcome, " + string(user)
	})
	f.Run()
}
```

The [`auth.SecureCompare`](https://pkg.go.dev/github.com/flamego/auth#SecureCompare) is a function that does constant time compare of two strings to prevent timing attacks.

## Bearer authentication

TODO
