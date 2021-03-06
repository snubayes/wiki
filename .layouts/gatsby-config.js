const path = require("path");
const pathPrefix = "/";
// Change me
const siteMetadata = {
  title: "Wiki of Bayesian Statistics Lab, SNU",
  shortName: "SNUBAYESWIKI",
  description:
    "Wiki of Bayesian Statistics Lab, Department of Statistics, Seoul National University that use gatsby-theme-primer-wiki, Welcome to our Knowledge Base!",
  // twitterName: "theowenyoung",
  imageUrl: "/graph-visualisation.jpg",
  siteUrl: "https://snubayes.github.io/wiki",
};
module.exports = {
  siteMetadata,
  pathPrefix: `/wiki`,
  flags: {
    DEV_SSR: true,
  },
  plugins: [
    {
      resolve: "gatsby-theme-primer-wiki",
      // Change me
      options: {
        icon: "./static/logo.png",
        sidebarComponents: ["latest", "tag"],
        nav: [
          {
            title: "Github",
            url: "https://github.com/snubayes",
          },
          // {
          //   title: "Twitter",
          //   url: "https://twitter.com/theowenyoung",
          // },
        ],
        editUrl: "https://github.com/snubayes/wiki/blob/main/",
        sidebarDepth: 1,
        searchBody: true,
        shouldShowTagGroupsOnIndex: false,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "content",
        path: `${__dirname}/..`,
        ignore: [`**/\.*/**/*`],
      },
    },

    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: siteMetadata.title,
        short_name: siteMetadata.shortName,
        start_url: pathPrefix,
        background_color: `#f7f0eb`,
        display: `standalone`,
        icon: path.resolve(__dirname, "./static/logo.png"),
      },
    },
    {
      resolve: `gatsby-plugin-sitemap`,
    },
    {
      resolve: "gatsby-plugin-robots-txt",
      options: {
        host: siteMetadata.siteUrl,
        sitemap: `${siteMetadata.siteUrl}/sitemap/sitemap-index.xml`,
        policy: [{ userAgent: "*", allow: "/" }],
      },
    },
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        // You can add multiple tracking ids and a pageview event will be fired for all of them.
        trackingIds: [],
      },
    },
  ],
};
