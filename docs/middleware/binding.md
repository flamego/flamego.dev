---
prev:
  text: Middleware
  link: ../middleware
---

# binding

The binding middleware provides request data binding and validation for [Flame instances](../core-concepts.md#instances), including Form, Multipart Form, JSON and YAML formats.

You can read source code of this middleware on [GitHub](https://github.com/flamego/binding) and API documentation on [pkg.go.dev](https://pkg.go.dev/github.com/flamego/binding?tab=doc).

## Installation

The minimum requirement of Go is **1.16**.

```:no-line-numbers
go get github.com/flamego/binding
```

## Usage examples

::: tip
Examples included in this section is to demonstrate the usage of the binding middleware, please refer to the documentation of [`validator`](https://pkg.go.dev/github.com/flamego/validator) package for validation syntax and constraints.
:::

The type of binding object is injected into the request context and the special data type [`binding.Errors`](https://pkg.go.dev/github.com/flamego/binding#Errors) is provided to indicate any errors occurred in binding and/or validation phases.

::: danger
Pointers is prohibited be passed as the binding object to prevent side effects, and to make sure every handler gets a fresh copy of the object on every request.
:::

### Form

The [`binding.Form`](https://pkg.go.dev/github.com/flamego/binding#Form) takes a binding object and parses the request payload encoded as `application/x-www-form-urlencoded`, a [`binding.Options`](https://pkg.go.dev/github.com/flamego/binding#Options) can be used to further customize the behavior of the function.

The `form` struct tag should be used to indicate the binding relations between the payload and the object:

:::: code-group
::: code-group-item main.go
```go:no-line-numbers
package main

import (
	"fmt"
	"net/http"

	"github.com/flamego/binding"
	"github.com/flamego/flamego"
	"github.com/flamego/template"
	"github.com/flamego/validator"
)

type User struct {
	FirstName string   `form:"first_name" validate:"required"`
	LastName  string   `form:"last_name" validate:"required"`
	Age       int      `form:"age" validate:"gte=0,lte=130"`
	Email     string   `form:"email" validate:"required,email"`
	Hashtags  []string `form:"hashtag"`
}

func main() {
	f := flamego.Classic()
	f.Use(template.Templater())
	f.Get("/", func(t template.Template) {
		t.HTML(http.StatusOK, "home")
	})
	f.Post("/", binding.Form(User{}), func(w http.ResponseWriter, form User, errs binding.Errors) {
		if len(errs) > 0 {
			var err error
			switch errs[0].Category {
			case binding.ErrorCategoryValidation:
				err = errs[0].Err.(validator.ValidationErrors)[0]
			default:
				err = errs[0].Err
			}
			w.WriteHeader(http.StatusBadRequest)
			_, _ = w.Write([]byte(fmt.Sprintf("Oops! Error occurred: %v", err)))
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(fmt.Sprintf("User: %#+v", form)))
	})
	f.Run()
}
```
:::
::: code-group-item templates/home.tmpl
```html:no-line-numbers
<form method="POST">
  <div>
    <label>First name:</label>
    <input type="text" name="first_name" value="John">
  </div>
  <div>
    <label>Last name:</label>
    <input type="text" name="last_name" value="Smith">
  </div>
  <div>
    <label>Age:</label>
    <input type="number" name="age" value="90">
  </div>
  <div>
    <label>Email:</label>
    <input type="email" name="email" value="john@example.com">
  </div>
  <div>
    <label>Hashtags:</label>
    <select name="hashtag" multiple>
      <option value="driver">Driver</option>
      <option value="developer">Developer</option>
      <option value="runner">Runner</option>
    </select>
  </div>
  <input type="submit" name="button" value="Submit">
</form>
```
:::
::::

### Multipart Form

The [`binding.MultipartForm`](https://pkg.go.dev/github.com/flamego/binding#MultipartForm) takes a binding object and parses the request payload encoded as `multipart/form-data`, a [`binding.Options`](https://pkg.go.dev/github.com/flamego/binding#Options) can be used to further customize the behavior of the function.

The `form` struct tag should be used to indicate the binding relations between the payload and the object, and [`*multipart.FileHeader`](https://pkg.go.dev/mime/multipart#FileHeader) should be type of the field that you're going to store the uploaded content:

:::: code-group
::: code-group-item main.go
```go:no-line-numbers
package main

import (
	"fmt"
	"mime/multipart"
	"net/http"

	"github.com/flamego/binding"
	"github.com/flamego/flamego"
	"github.com/flamego/template"
	"github.com/flamego/validator"
)

type User struct {
	FirstName string                `form:"first_name" validate:"required"`
	LastName  string                `form:"last_name" validate:"required"`
	Avatar    *multipart.FileHeader `form:"avatar"`
}

func main() {
	f := flamego.Classic()
	f.Use(template.Templater())
	f.Get("/", func(t template.Template) {
		t.HTML(http.StatusOK, "home")
	})
	f.Post("/", binding.MultipartForm(User{}), func(w http.ResponseWriter, form User, errs binding.Errors) {
		if len(errs) > 0 {
			var err error
			switch errs[0].Category {
			case binding.ErrorCategoryValidation:
				err = errs[0].Err.(validator.ValidationErrors)[0]
			default:
				err = errs[0].Err
			}
			w.WriteHeader(http.StatusBadRequest)
			_, _ = w.Write([]byte(fmt.Sprintf("Oops! Error occurred: %v", err)))
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(fmt.Sprintf("User: %#+v", form)))
	})
	f.Run()
}
```
:::
::: code-group-item templates/home.tmpl
```html:no-line-numbers
<form enctype="multipart/form-data" method="POST">
  <div>
    <label>First name:</label>
    <input type="text" name="first_name" value="John">
  </div>
  <div>
    <label>Last name:</label>
    <input type="text" name="last_name" value="Smith">
  </div>
  <div>
    <label>Avatar:</label>
    <input type="file" name="avatar">
  </div>
  <input type="submit" name="button" value="Submit">
</form>
```
:::
::::

### JSON

The [`binding.JSON`](https://pkg.go.dev/github.com/flamego/binding#JSON) takes a binding object and parses the request payload encoded as `application/json`, a [`binding.Options`](https://pkg.go.dev/github.com/flamego/binding#Options) can be used to further customize the behavior of the function.

The `json` struct tag should be used to indicate the binding relations between the payload and the object:

```go:no-line-numbers
package main

import (
	"fmt"
	"net/http"

	"github.com/flamego/binding"
	"github.com/flamego/flamego"
	"github.com/flamego/validator"
)

type Address struct {
	Street string `json:"street" validate:"required"`
	City   string `json:"city" validate:"required"`
	Planet string `json:"planet" validate:"required"`
	Phone  string `json:"phone" validate:"required"`
}

type User struct {
	FirstName string     `json:"first_name" validate:"required"`
	LastName  string     `json:"last_name" validate:"required"`
	Age       uint8      `json:"age" validate:"gte=0,lte=130"`
	Email     string     `json:"email" validate:"required,email"`
	Addresses []*Address `json:"addresses" validate:"required,dive,required"`
}

func main() {
	f := flamego.Classic()
	f.Post("/", binding.JSON(User{}), func(w http.ResponseWriter, form User, errs binding.Errors) {
		if len(errs) > 0 {
			var err error
			switch errs[0].Category {
			case binding.ErrorCategoryValidation:
				err = errs[0].Err.(validator.ValidationErrors)[0]
			default:
				err = errs[0].Err
			}
			w.WriteHeader(http.StatusBadRequest)
			_, _ = w.Write([]byte(fmt.Sprintf("Oops! Error occurred: %v", err)))
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(fmt.Sprintf("User: %#+v", form)))
	})
	f.Run()
}
```

### YAML

The [`binding.YAML`](https://pkg.go.dev/github.com/flamego/binding#YAML) takes a binding object and parses the request payload encoded as `application/yaml`, a [`binding.Options`](https://pkg.go.dev/github.com/flamego/binding#Options) can be used to further customize the behavior of the function.

The `yaml` struct tag should be used to indicate the binding relations between the payload and the object:

```go:no-line-numbers
package main

import (
	"fmt"
	"net/http"

	"github.com/flamego/binding"
	"github.com/flamego/flamego"
	"github.com/flamego/validator"
)

type Address struct {
	Street string `yaml:"street" validate:"required"`
	City   string `yaml:"city" validate:"required"`
	Planet string `yaml:"planet" validate:"required"`
	Phone  string `yaml:"phone" validate:"required"`
}

type User struct {
	FirstName string     `yaml:"first_name" validate:"required"`
	LastName  string     `yaml:"last_name" validate:"required"`
	Age       uint8      `yaml:"age" validate:"gte=0,lte=130"`
	Email     string     `yaml:"email" validate:"required,email"`
	Addresses []*Address `yaml:"addresses" validate:"required,dive,required"`
}

func main() {
	f := flamego.Classic()
	f.Post("/", binding.YAML(User{}), func(w http.ResponseWriter, form User, errs binding.Errors) {
		if len(errs) > 0 {
			var err error
			switch errs[0].Category {
			case binding.ErrorCategoryValidation:
				err = errs[0].Err.(validator.ValidationErrors)[0]
			default:
				err = errs[0].Err
			}
			w.WriteHeader(http.StatusBadRequest)
			_, _ = w.Write([]byte(fmt.Sprintf("Oops! Error occurred: %v", err)))
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(fmt.Sprintf("User: %#+v", form)))
	})
	f.Run()
}
```
