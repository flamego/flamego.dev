---
prev:
  text: Middleware
  link: ../middleware
---

# captcha

The captcha middleware generates and validates captcha images for [Flame instances](../core-concepts.md#instances), it relies on the [session](session.md) middleware.

You can read source code of this middleware on [GitHub](https://github.com/flamego/captcha) and API documentation on [pkg.go.dev](https://pkg.go.dev/github.com/flamego/captcha?tab=doc).

## Installation

```:no-line-numbers
go get github.com/flamego/captcha
```

## Usage examples

::: warning
Examples included in this section is to demonstrate the usage of the captcha middleware, by no means illustrates the idiomatic or even correct way of doing user authentication.
:::

The [`captcha.Captchaer`](https://pkg.go.dev/github.com/flamego/captcha#Captchaer) works out-of-the-box with an optional [`captcha.Options`](https://pkg.go.dev/github.com/flamego/captcha#Options), and the `captcha.ValidText` should be used to validate captcha tokens:

:::: code-group
::: code-group-item main.go
```go:no-line-numbers{19,23}
package main

import (
	"net/http"

	"github.com/flamego/captcha"
	"github.com/flamego/flamego"
	"github.com/flamego/session"
	"github.com/flamego/template"
)

func main() {
	f := flamego.Classic()
	f.Use(template.Templater())
	f.Use(session.Sessioner())
	f.Use(captcha.Captchaer())

	f.Get("/", func(t template.Template, data template.Data, captcha captcha.Captcha) {
		data["CaptchaHTML"] = captcha.HTML()
		t.HTML(http.StatusOK, "home")
	})
	f.Post("/", func(c flamego.Context, captcha captcha.Captcha) {
		if !captcha.ValidText(c.Request().FormValue("captcha")) {
			c.ResponseWriter().WriteHeader(http.StatusBadRequest)
			_, _ = c.ResponseWriter().Write([]byte(http.StatusText(http.StatusBadRequest)))
		} else {
			c.ResponseWriter().WriteHeader(http.StatusOK)
			_, _ = c.ResponseWriter().Write([]byte(http.StatusText(http.StatusOK)))
		}
	})

	f.Run()
}
```
:::
::: code-group-item templates/home.tmpl
```html:no-line-numbers
<form method="POST">
  {{.CaptchaHTML}} <br>
  <input name="captcha">
  <button>Submit</button>
</form>
```
:::
::::

Below is how it would look like in your browser for the above example:

![Form with captcha](https://user-images.githubusercontent.com/2946214/158567419-9a9556ad-c9d0-48db-b96a-32b9d4b67045.png)

As the tooltip implies, single left-click on the captcha image would reload for a different one if characters in the current image is hard to recognize.
