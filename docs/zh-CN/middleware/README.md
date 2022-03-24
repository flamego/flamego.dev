---
sidebar: false
prev:
  text: 路由配置
  link: ../routing
next:
  text: 常见问题
  link: ../faqs
---

# 中间件集成

Flamego 在[核心服务](../core-services.md)之外开发并维护了一定数量的官方中间件来帮助用户开发 Web 应用：

- [template](template.md) 使用 Go 模板引擎渲染 HTML
- [session](session.md) 用于管理用户会话
- [recaptcha](recaptcha.md) 用于集成 [Google reCAPTCHA](https://www.google.com/recaptcha/about/) 验证服务
- [csrf](csrf.md) 用于生成和验证 CSRF 令牌
- [cors](cors.md) 用于配置 [跨域资源共享](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [binding](binding.md) 用于请求数据绑定和验证
- [gzip](gzip.md) 使用 Gzip 压缩响应流
- [cache](cache.md) 用于管理缓存数据
- [brotli](brotli.md) 使用 Brotli 压缩响应流
- [auth](auth.md) 用于提供基于 HTTP Basic 和 Bearer 形式的请求验证
- [i18n](i18n.md) 用于提供应用本地化服务
- [captcha](captcha.md) 用于生成和验证验证码图片
- [hcaptcha](hcaptcha.md) 用于集成 [hCaptcha](https://www.hcaptcha.com/) 验证服务

::: tip
如果你发现列表有缺失，请直接[发送 Pull request 进行补充](https://github.com/flamego/flamego.dev/edit/main/docs/middleware/README.md)！
:::
