const fetch = require('node-fetch');
const util = require('util');
const fs = require('fs');
// @ts-ignore
const streamPipeline = util.promisify(require('stream').pipeline);
// @ts-ignore
const path = require('path');
const wpAPIBasePath = 'http://admin.innerpathllc.com/wp-json/wp/v2';

/** @type { import("gatsby").GatsbyNode["sourceNodes"] } */
exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest
}) => {
  const { createNode } = actions;

  // @ts-ignore
  const pages = await (await fetch(`${wpAPIBasePath}/pages`)).json();

  const subLeasersData = await // @ts-ignore
  (await fetch(`${wpAPIBasePath}/subleaser`)).json();

  const subLeasers = subLeasersData
    .filter((subLeaser) => subLeaser.status === 'publish')
    .map((subLeaser) => {
      return {
        slug: subLeaser.slug,
        name: subLeaser.custom_fields.name[0],
        credentials: subLeaser.custom_fields.credentials[0],
        featuredImageId: subLeaser.custom_fields.featured_image[0],
        linkToBlog: subLeaser.custom_fields.link_to_personal_blog[0],
        psychTodayCode: subLeaser.custom_fields.psych_today_code[0],
        aboutPageOrder: subLeaser.custom_fields.about_page_order_number[0],
        pageTitle: subLeaser.title.rendered,
        pageContent: subLeaser.content.rendered
      };
    });

  pages.forEach((page) => {
    const nodeData = {
      slug: page.title.rendered === 'Home' ? '/' : page.slug,
      status: page.status,
      title: page.title.rendered,
      content: page.content.rendered,
      subLeasers: page.slug === 'us' ? subLeasers : null
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

  // @ts-ignore
  const menu = await (await fetch(`${wpAPIBasePath}/menu`)).json();

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

  // @ts-ignore
  const images = (await (await fetch(`${wpAPIBasePath}/media`)).json())
    .filter((media) => media.media_type === 'image')
    .map((image) => {
      return {
        wpID: image.id,
        name: image.slug,
        uploaded: image.date,
        url: image.media_details.sizes.full.source_url
      };
    });

  // @ts-ignore
  const imageCache = JSON.parse(
    // @ts-ignore
    fs.readFileSync(require.resolve('./src/images/cache.json'))
  );
  let imagesDownloaded = false;
  for await (const image of images) {
    const cachedImage = imageCache.find(
      (cached) =>
        cached.wpID === image.wpID && cached.uploaded === image.uploaded
    );
    if (!cachedImage) {
      console.log(
        `Downloading wp image name: ${image.name}, id: ${image.wpID}`
      );
      const imagePathFrag = image.url.split('.');
      const imageExtension = imagePathFrag[imagePathFrag.length - 1];

      await downloadRemoteImage(
        image.url,
        `./src/images/files/${image.wpID}.${imageExtension}`
      );

      imageCache.push(image);
      imagesDownloaded = true;
    }
  }
  if (imagesDownloaded) {
    fs.writeFileSync('./src/images/cache.json', JSON.stringify(imageCache));
  }

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
        node.slug === 'us'
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

async function downloadRemoteImage(imagePath, destination) {
  const res = await fetch(imagePath);
  if (res.ok) {
    // @ts-ignore
    return streamPipeline(res.body, fs.createWriteStream(destination));
  }
  throw new Error(`Image download error ${res.statusText}`);
}
