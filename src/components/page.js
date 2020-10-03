import { graphql } from 'gatsby';
import React from 'react';
import { parseInternalLinks } from '../util/link-parser';
import Layout from './layout';

export default function Page({ path, data }) {
  return (
    <Layout path={path}>
      <div style={{ minHeight: 'calc(100vh - 64px - 530px)' }}>
        {data.wordpressPage.title === 'Home' ? (
          <div style={{ marginBottom: '10px' }}></div>
        ) : (
          <h1 className="header-text text-center">
            {data.wordpressPage.title}
          </h1>
        )}
        <div className="entry-content">
          {parseInternalLinks(data.wordpressPage.content)}
        </div>
        {/* <div
          className="entry-content"
          dangerouslySetInnerHTML={{ __html: data.wordpressPage.content }}
        ></div> */}
        {data.wordpressPage.psychTodayCode ? (
          <div
            className="entry-content"
            style={{ width: 'fit-content', margin: '0 auto' }}
            dangerouslySetInnerHTML={{
              __html: data.wordpressPage.psychTodayCode
            }}
          ></div>
        ) : null}
      </div>
    </Layout>
  );
}

export const query = graphql`
  query($slug: String!) {
    wordpressPage(slug: { eq: $slug }) {
      title
      content
      psychTodayCode
    }
  }
`;
