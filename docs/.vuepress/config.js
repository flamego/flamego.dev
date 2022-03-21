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

    plugins: [
        [
            "@vuepress/plugin-docsearch",
            {
                apiKey: "a255dc3bbb7f4982286e930e43161e08",
                appId: "A5MMRNIDGB",
                indexName: "flamego",
                locales: {
                    "/": {
                        placeholder: "Search",
                        translations: {
                            button: {
                                buttonText: "Search",
                            },
                        },
                    },
                    "/zh-CN/": {
                        placeholder: "搜索文档",
                        translations: {
                            button: {
                                buttonText: "搜索文档",
                            },
                            modal: {
                                searchBox: {
                                    resetButtonTitle: "清除查询条件",
                                    resetButtonAriaLabel: "清除查询条件",
                                    cancelButtonText: "取消",
                                    cancelButtonAriaLabel: "取消",
                                },
                                startScreen: {
                                    recentSearchesTitle: "搜索历史",
                                    noRecentSearchesText: "没有搜索历史",
                                    saveRecentSearchButtonTitle:
                                        "保存至搜索历史",
                                    removeRecentSearchButtonTitle:
                                        "从搜索历史中移除",
                                    favoriteSearchesTitle: "收藏",
                                    removeFavoriteSearchButtonTitle:
                                        "从收藏中移除",
                                },
                                errorScreen: {
                                    titleText: "无法获取结果",
                                    helpText: "你可能需要检查你的网络连接",
                                },
                                footer: {
                                    selectText: "选择",
                                    navigateText: "切换",
                                    closeText: "关闭",
                                    searchByText: "搜索提供者",
                                },
                                noResultsScreen: {
                                    noResultsText: "无法找到相关结果",
                                    suggestedQueryText: "你可以尝试查询",
                                    openIssueText: "你认为该查询应该有结果？",
                                    openIssueLinkText: "点击反馈",
                                },
                            },
                        },
                    },
                },
            },
        ],
    ],
};
