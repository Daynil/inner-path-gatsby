import { Button, Card, CardActions, CardHeader } from '@material-ui/core';
import { graphql, Link } from 'gatsby';
import React from 'react';
import { parseInternalLinks } from '../util/link-parser';
import Layout from './layout';

export default function Page({ path, data }) {
  return (
    <Layout path={path}>
      <h1 className="header-text text-center">{data.wordpressPage.title}</h1>
      <div
        className="about-layout"
        style={{
          minHeight: 'calc(100vh - 64px - 530px)',
          margin: '0 auto',
          width: 'fit-content'
        }}
      >
        <div style={{ margin: '20px 0 0 20px' }}>
          {data.wordpressPage.subLeasers
            .sort((a, b) => a.aboutPageOrder - b.aboutPageOrder)
            .map((subLeaser, i) => {
              return (
                <Card key={i} style={{ width: '298px', marginTop: '20px' }}>
                  <CardHeader
                    title={subLeaser.name}
                    subheader={subLeaser.credentials}
                  />
                  <img src={subLeaser.featuredImage}></img>
                  <CardActions style={{ margin: '8px 0 10px 0' }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      style={{ textTransform: 'none', margin: 0, padding: 0 }}
                    >
                      <Link
                        to={'../' + subLeaser.slug}
                        style={{
                          width: '100%',
                          color: 'black',
                          padding: '10px'
                        }}
                      >
                        More Info
                      </Link>
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
        </div>
        <div className="entry-content">
          {parseInternalLinks(data.wordpressPage.content)}
        </div>
        {/* <div
          className="entry-content"
          dangerouslySetInnerHTML={{ __html: data.wordpressPage.content }}
        ></div> */}
      </div>
    </Layout>
  );
}

export const query = graphql`
  query($slug: String!) {
    wordpressPage(slug: { eq: $slug }) {
      title
      content
      subLeasers {
        slug
        aboutPageOrder
        name
        credentials
        featuredImage
      }
    }
  }
`;
