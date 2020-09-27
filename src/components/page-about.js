import { graphql } from 'gatsby';
import React from 'react';
import Layout from './layout';

export default function Page({ path, data }) {
  return (
    <Layout path={path}>
      <div style={{ minHeight: 'calc(100vh - 64px - 530px)' }}>
        <div>
          {data.wordpressPage.subLeasers.map((subLeaser) => {
            return <div>{subLeaser.name}</div>;
          })}
        </div>
        <div
          className="entry-content"
          dangerouslySetInnerHTML={{ __html: data.wordpressPage.content }}
        ></div>
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
        name
        credentials
        featuredImage
      }
    }
  }
`;
