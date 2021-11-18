module.exports = {
    title: "Flamego",
    description:
        "A fantastic modular Go web framework boiled with dependency injection",

    head: [
        ["meta", { name: "theme-color", content: "#2e8bee" }],
        ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
        [
            "meta",
            { name: "apple-mobile-web-app-status-bar-style", content: "black" },
        ],
        ["link", { rel: "icon", href: "/favicon.png" }],
    ],

    themeConfig: {
        navbar: [
            {
                text: "Starter guide",
                link: "/starter-guide.html",
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
        logo: "/favicon.png",
        repo: "flamego/flamego",
        repoLabel: "GitHub",
        sidebar: {},
        editLinks: true,
        editLinkText: "Edit this page on GitHub",
        docsRepo: "flamego/flamego.dev",
        docsBranch: "main",
        docsDir: "docs",
        lastUpdated: true,
        lastUpdatedText: "Last updated",
        contributors: false,
    },
};
