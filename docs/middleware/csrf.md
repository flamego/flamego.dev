---
prev:
  text: Middleware
  link: ../middleware
---

# csrf

The csrf middleware generates and validates CSRF tokens for [Flame instances](../core-concepts.md#instances), it relies on the [session](session.md) middleware.

You can read source code of this middleware on [GitHub](https://github.com/flamego/session) and API documentation on [pkg.go.dev](https://pkg.go.dev/github.com/flamego/session?tab=doc).

## Installation

```:no-line-numbers
go get github.com/flamego/csrf
```

## Usage examples

::: warning
Examples included in this section is to demonstrate the usage of the csrf middleware, by no means illustrates the idiomatic or even correct way of doing user authentication.
:::

The [`csrf.Csrfer`](https://pkg.go.dev/github.com/flamego/csrf#Csrfer) works out-of-the-box with an optional [`csrf.Options`](https://pkg.go.dev/github.com/flamego/csrf#Options), and the [`csrf.Validate`](https://pkg.go.dev/github.com/flamego/csrf#Validate) should be used to guard routes that needs CSRF validation:

:::: code-group
::: code-group-item main.go
```go:no-line-numbers{41-42,46-47}
package main

import (
	"net/http"

	"github.com/flamego/csrf"
	"github.com/flamego/flamego"
	"github.com/flamego/session"
	"github.com/flamego/template"
)

func main() {
	f := flamego.Classic()
	f.Use(template.Templater())
	f.Use(session.Sessioner())
	f.Use(csrf.Csrfer())

	// Simulate the authentication of a session. If the "userID" exists,
	// then redirect to a form that requires CSRF protection.
	f.Get("/", func(c flamego.Context, s session.Session) {
		if s.Get("userID") == nil {
			c.Redirect("/login")
			return
		}
		c.Redirect("/protected")
	})

	// Set uid for the session
	f.Get("/login", func(c flamego.Context, s session.Session) {
		s.Set("userID", 123)
		c.Redirect("/")
	})

	// Render a protected form by passing a CSRF token using x.Token()
	f.Get("/protected", func(c flamego.Context, s session.Session, x csrf.CSRF, t template.Template, data template.Data) {
		if s.Get("userID") == nil {
			c.Redirect("/login", http.StatusUnauthorized)
			return
		}

		// Pass token to the protected template
		data["CSRFToken"] = x.Token()
		t.HTML(http.StatusOK, "protected")
	})

	// Apply CSRF validation to route
	f.Post("/protected", csrf.Validate, func(c flamego.Context, s session.Session, t template.Template) {
		if s.Get("userID") != nil {
			c.ResponseWriter().Write([]byte("You submitted with a valid CSRF token"))
			return
		}
		c.Redirect("/login", http.StatusUnauthorized)
	})

	f.Run()
}
```
:::
::: code-group-item templates/protected.tmpl
```html:no-line-numbers
<form action="/protected" method="POST">
  <input type="hidden" name="_csrf" value="{{.CSRFToken}}">
  <button>Submit</button>
</form>
```
:::
::::
