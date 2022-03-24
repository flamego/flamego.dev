---
prev:
  text: 中间件集成
  link: ../middleware
---

# binding

binding 中间件为 [Flame 实例](../core-concepts.md#实例)提供请求数据绑定和验证服务，支持的数据格式包括 Form、Multipart Form、JSON 和 YAML。

你可以在 [GitHub](https://github.com/flamego/binding) 上阅读该中间件的源码或通过 [pkg.go.dev](https://pkg.go.dev/github.com/flamego/binding?tab=doc) 查看 API 文档。

## 下载安装

Go 语言的最低版本要求为 **1.16**。

```:no-line-numbers
go get github.com/flamego/binding
```

## 用法示例

::: tip
本小结仅展示 binding 中间件的相关用法，如需了解验证模块的用法请移步 [`validator`](https://pkg.go.dev/github.com/flamego/validator) 的文档。
:::

绑定对象自身会被注入到请求上下文中以供后续的处理器使用，并额外提供 [`binding.Errors`](https://pkg.go.dev/github.com/flamego/binding#Errors) 用于错误传递。

::: danger
禁止传递绑定对象的指针以确保每个处理器都能够获得对象的全新副本，以及避免潜在的副作用而导致的意外错误。
:::

### Form

[`binding.Form`](https://pkg.go.dev/github.com/flamego/binding#Form) 会将请求数据以 `application/x-www-form-urlencoded` 的编码格式将其解析到绑定对象上，[`binding.Options`](https://pkg.go.dev/github.com/flamego/binding#Options) 可以被用于配置该函数的行为。

绑定对象内的字段需要使用结构体标签 `form` 来表示与请求数据之间的绑定关系：

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

[`binding.MultipartForm`](https://pkg.go.dev/github.com/flamego/binding#MultipartForm)  会将请求数据以 `multipart/form-data` 的编码格式将其解析到绑定对象上，[`binding.Options`](https://pkg.go.dev/github.com/flamego/binding#Options) 可以被用于配置该函数的行为。

绑定对象内的字段需要使用结构体标签 `form` 来表示与请求数据之间的绑定关系，用于存储上传文件的字段则必须声明为 [`*multipart.FileHeader`](https://pkg.go.dev/mime/multipart#FileHeader) 类型：

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

[`binding.JSON`](https://pkg.go.dev/github.com/flamego/binding#JSON) 会将请求数据以 `application/json` 的编码格式将其解析到绑定对象上，[`binding.Options`](https://pkg.go.dev/github.com/flamego/binding#Options) 可以被用于配置该函数的行为。

绑定对象内的字段需要使用结构体标签 `json` 来表示与请求数据之间的绑定关系：

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

[`binding.YAML`](https://pkg.go.dev/github.com/flamego/binding#YAML) 会将请求数据以 `application/yaml` 的编码格式将其解析到绑定对象上，[`binding.Options`](https://pkg.go.dev/github.com/flamego/binding#Options) 可以被用于配置该函数的行为。

绑定对象内的字段需要使用结构体标签 `yaml` 来表示与请求数据之间的绑定关系：

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
