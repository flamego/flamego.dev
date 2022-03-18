---
sidebar: false
prev:
  text: Routing
  link: ../routing
next:
  text: FAQs
  link: ../faqs
---

# Middleware

To accelerate your development, the Flamego core team and the community have built some useful middleware in addition to the [core services](../core-services.md) that are builtin to the core framework.

- [template](template.md) for rendering HTML using Go template.
- [session](session.md) for managing user sessions.
- [recaptcha](recaptcha.md) for providing [Google reCAPTCHA](https://www.google.com/recaptcha/about/) verification.
- [csrf](csrf.md) for generating and validating CSRF tokens.
- [cors](cors.md) for configuring [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).
- [binding](https://github.com/flamego/binding) for request data binding and validation.
- [gzip](gzip.md) for Gzip compression to responses.
- [cache](cache.md) for managing cache data.
- [brotli](brotli.md) for Brotli compression to responses.
- [auth](auth.md) for providing basic and bearer authentications.
- [i18n](i18n.md) for providing internationalization and localization.
- [captcha](captcha.md) for generating and validating captcha images.
- [hcaptcha](hcaptcha.md) for providing [hCaptcha](https://www.hcaptcha.com/) verification.

::: tip
If you notice any middleware that is missing from the list, please don't hesitate to [send a pull request to this page](https://github.com/flamego/flamego.dev/edit/main/docs/middleware/README.md)!
:::
