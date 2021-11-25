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
        [
            "link",
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200;0,400;0,600;0,700;1,200;1,400;1,600;1,700&family=Source+Sans+Pro:ital,wght@0,200;0,400;0,600;0,700;1,200;1,400;1,600;1,700&display=swap",
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
        ],
        logo: "/favicon.png",
        repo: "flamego/flamego",
        repoLabel: "GitHub",
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
