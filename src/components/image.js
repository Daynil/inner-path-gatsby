import { graphql, useStaticQuery } from 'gatsby';
import Img from 'gatsby-image';
import React, { useMemo } from 'react';

const Image = ({ src, ...props }) => {
  const data = useStaticQuery(graphql`
    query {
      allFile(filter: { internal: { mediaType: { regex: "images/" } } }) {
        edges {
          node {
            relativePath
            childImageSharp {
              fluid(maxWidth: 1600) {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
    }
  `);

  const match = useMemo(() => {
    return data.allFile.edges.find(
      ({ node }) => src === node.relativePath.split('.')[0]
    );
  }, [data, src]);

  return <Img fluid={match.node.childImageSharp.fluid} {...props} />;
};

export default Image;
