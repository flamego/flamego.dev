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

    themeConfig: {
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
            {
                text: "中文文档",
                link: "https://flamego.cn",
            },
        ],
        editLinkText: "Edit this page on GitHub",
        lastUpdatedText: "Last updated",
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
                placeholder: "Search",
                translations: {
                    button: {
                        buttonText: "Search",
                    },
                },
            },
        ],
    ],
};
