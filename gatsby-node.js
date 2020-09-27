const fetch = require('node-fetch');

/** @type { import("gatsby").GatsbyNode["sourceNodes"] } */
exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest
}) => {
  const { createNode } = actions;

  const pages = await (
    await fetch('http://admin.innerpathllc.com/wp-json/wp/v2/pages')
  ).json();

  const subLeasersData = await (
    await fetch('http://admin.innerpathllc.com/wp-json/wp/v2/subleaser')
  ).json();

  const subLeasers = await Promise.all(
    subLeasersData
      .filter((subLeaser) => subLeaser.status === 'publish')
      .map(async (subLeaser) => {
        const featuredImage = await getFeaturedImageUrl(
          subLeaser.custom_fields.featured_image[0]
        );
        return {
          slug: subLeaser.slug,
          name: subLeaser.custom_fields.name[0],
          credentials: subLeaser.custom_fields.credentials[0],
          featuredImage,
          linkToBlog: subLeaser.custom_fields.link_to_personal_blog[0],
          psychTodayCode: subLeaser.custom_fields.psych_today_code[0],
          aboutPageOrder: subLeaser.custom_fields.about_page_order_number[0],
          pageTitle: subLeaser.title.rendered,
          pageContent: subLeaser.content.rendered
        };
      })
  );

  pages.forEach((page) => {
    const nodeData = {
      slug: page.title.rendered === 'Home' ? '/' : page.slug,
      status: page.status,
      title: page.title.rendered,
      content: page.content.rendered,
      subLeasers: page.slug === 'about-us' ? subLeasers : null
    };

    if (nodeData.status === 'publish') {
      const nodeMetaData = {
        id: createNodeId(`id-${page.slug}`),
        parent: null,
        children: [],
        internal: {
          type: 'WordpressPage',
          mediaType: 'text/html',
          contentDigest: createContentDigest(nodeData)
        }
      };
      createNode(Object.assign({}, nodeData, nodeMetaData));
    }
  });

  const menu = await (
    await fetch('http://admin.innerpathllc.com/wp-json/wp/v2/menu')
  ).json();

  menu.forEach((menuItem) => {
    const itemUrlParts = menuItem.url.split('/');

    const nodeData = {
      wpID: menuItem.ID,
      name: menuItem.title,
      parentWpID: parseInt(menuItem.menu_item_parent),
      targetSlug:
        menuItem.url[menuItem.url.length - 1] === '/'
          ? itemUrlParts[itemUrlParts.length - 2]
          : itemUrlParts[itemUrlParts.length - 1]
    };
    if (nodeData.name === 'Home') nodeData.targetSlug = '/';

    const nodeMetaData = {
      id: createNodeId(`id-${nodeData.wpID}`),
      parent: null,
      children: [],
      internal: {
        type: 'WordpressMenuItem',
        contentDigest: createContentDigest(nodeData)
      }
    };
    createNode(Object.assign({}, nodeData, nodeMetaData));
  });

  subLeasers.forEach((subLeaser) => {
    // Create page data for each subleaser
    const pageNodeData = {
      slug: subLeaser.slug,
      title: subLeaser.pageTitle,
      content: subLeaser.pageContent,
      psychTodayCode: subLeaser.psychTodayCode
    };

    const pageNodeMetaData = {
      id: createNodeId(`id-${subLeaser.slug}`),
      parent: null,
      children: [],
      internal: {
        type: 'WordpressPage',
        mediaType: 'text/html',
        contentDigest: createContentDigest(pageNodeData)
      }
    };
    createNode(Object.assign({}, pageNodeData, pageNodeMetaData));
  });

  return;
};

/** @type { import("gatsby").GatsbyNode["createPages"] } */
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const wpPages = await graphql(`
    query {
      allWordpressPage {
        edges {
          node {
            slug
          }
        }
      }
    }
  `);

  wpPages.data.allWordpressPage.edges.forEach(({ node }) => {
    createPage({
      path: node.slug,
      component:
        node.slug === 'about-us'
          ? require.resolve('./src/components/page-about.js')
          : require.resolve('./src/components/page.js'),
      context: {
        slug: node.slug
      }
    });
  });
};

// For debugging purposes
/** @type { import("gatsby").GatsbyNode["onCreateWebpackConfig"] } */
exports.onCreateWebpackConfig = ({ actions }) => {
  if (process.env.NODE_ENV === 'development') {
    actions.setWebpackConfig({
      devtool: 'eval-source-map'
    });
  }
};

async function getFeaturedImageUrl(imageId) {
  const imageData = await (
    await fetch(
      `http://admin.innerpathllc.com/wp-json/wp/v2/media/${parseInt(imageId)}`
    )
  ).json();
  return imageData.media_details.sizes.full.source_url;
}
