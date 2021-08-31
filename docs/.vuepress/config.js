module.exports = {
    /**
     * Ref：https://v1.vuepress.vuejs.org/config/#title
     */
    title: 'Flamego',
    /**
     * Ref：https://v1.vuepress.vuejs.org/config/#description
     */
    description: 'A fantastic modular Go web framework boiled with dependency injection',

    /**
    * Extra tags to be injected to the page HTML `<head>`
    *
    * ref：https://v1.vuepress.vuejs.org/config/#head
    */
    head: [
        ['meta', { name: 'theme-color', content: '#2e8bee' }],
        ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
        ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
        ['link', { rel: "icon", href: "/favicon.png"}]
    ],

    /**
     * Theme configuration, here is the default theme configuration for VuePress.
     *
     * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
     */
    themeConfig: {
        repo: 'flamego/flamego',
        repoLabel: 'GitHub',
        docsRepo: 'flamego/flamego.dev',
        docsDir: 'docs',
        docsBranch: 'main',
        editLinks: true,
        editLinkText: '',
        lastUpdated: true,
        smoothScroll: true,
        nav: [
            // {
            //     text: '指南',
            //     link: '/guide/',
            // }
        ],
        sidebar: {
            // '/guide/': [
            //     {
            //         title: '指南',
            //         collapsable: false,
            //         children: [
            //             '',
            //             'requirement',
            //         ]
            //     }
            // ]
        }
    },
}