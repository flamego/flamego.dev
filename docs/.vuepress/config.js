module.exports = {
    title: "Flamego",
    description:
        "A fantastic modular Go web framework with a slim core but limitless extensibility",
    head: [
        ["meta", { name: "theme-color", content: "#2e8bee" }],
        ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
        [
            "meta",
            { name: "apple-mobile-web-app-status-bar-style", content: "black" },
        ],
        ["link", { rel: "icon", href: "/favicon.png" }],
        [
            "link",
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200;0,400;0,600;0,700;1,200;1,400;1,600;1,700&family=Source+Sans+Pro:ital,wght@0,200;0,400;0,600;0,700;1,200;1,400;1,600;1,700&display=swap",
            },
        ],
        [
            "script",
            {
                src: "https://plausible.io/js/plausible.js",
                defer: true,
            },
        ],
    ],
    locales: {
        "/": {
            lang: "en-US",
            title: "Flamego",
            description:
                "A fantastic modular Go web framework with a slim core but limitless extensibility",
        },
        "/zh-CN/": {
            lang: "zh-CN",
            title: "Flamego",
            description: "一款简洁的、极易扩展且模块化的 Go Web 框架",
        },
    },

    themeConfig: {
        locales: {
            "/": {
                selectLanguageName: "English",
                navbar: [
                    {
                        text: "Starter guide",
                        link: "/starter-guide.html",
                    },
                    {
                        text: "References",
                        children: [
                            "/core-concepts.html",
                            "/core-services.html",
                            "/custom-services.html",
                            "/routing.html",
                        ],
                    },
                    {
                        text: "Middleware",
                        link: "/middleware/",
                    },
                    {
                        text: "FAQs",
                        link: "/faqs.html",
                    },
                ],
                editLinkText: "Edit this page on GitHub",
                lastUpdatedText: "Last updated",
            },
            "/zh-CN/": {
                selectLanguageName: "简体中文",
                selectLanguageText: "选择语言",
                selectLanguageAriaLabel: "选择语言",
                navbar: [
                    {
                        text: "初学指南",
                        link: "/zh-CN/starter-guide.html",
                    },
                    {
                        text: "开发手册",
                        children: [
                            "/zh-CN/core-concepts.html",
                            "/zh-CN/core-services.html",
                            "/zh-CN/custom-services.html",
                            "/zh-CN/routing.html",
                        ],
                    },
                    {
                        text: "中间件集成",
                        link: "/zh-CN/middleware/",
                    },
                    {
                        text: "常见问题",
                        link: "/zh-CN/faqs.html",
                    },
                ],

                // page meta
                editLinkText: "在 GitHub 上编辑此页",
                lastUpdatedText: "上次更新",
                contributorsText: "贡献者",

                // custom containers
                tip: "提示",
                warning: "注意",
                danger: "警告",

                // 404 page
                notFound: [
                    "这里什么都没有",
                    "我们怎么到这来了？",
                    "这是一个 404 页面",
                    "看起来我们进入了错误的链接",
                ],
                backToHome: "返回首页",

                // a11y
                openInNewWindow: "在新窗口打开",
                toggleDarkMode: "切换夜间模式",
                toggleSidebar: "切换侧边栏",
            },
        },
        logo: "/favicon.png",
        repo: "flamego/flamego",
        repoLabel: "GitHub",
        editLinks: true,
        docsRepo: "flamego/flamego.dev",
        docsBranch: "main",
        docsDir: "docs",
        lastUpdated: true,
        contributors: false,
    },
};
