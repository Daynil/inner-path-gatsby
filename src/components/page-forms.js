import { saveAs } from 'file-saver';
import { graphql } from 'gatsby';
import React from 'react';
import PDFIcon from '../assets/pdf-icon';
import { parseWPHTMLString } from '../util/wp-parser';
import Layout from './layout';

export default function Form({ path, data }) {
  const [forms, setForms] = React.useState([]);

  React.useEffect(() => {
    const fetchPdfs = async () => {
      const pdfMeta = await (await fetch('/pdfMeta.json')).json();
      setForms(pdfMeta);
    };
    fetchPdfs();
  }, []);

  return (
    <Layout path={path}>
      <div style={{ minHeight: 'calc(100vh - 64px - 530px)' }}>
        <h1 className="header-text text-center">{data.wordpressPage.title}</h1>
        <div className="entry-content">
          {parseWPHTMLString(data.wordpressPage.content)}
          <div>
            {forms.map((form) => (
              <div className="form" style={{ margin: '12px' }}>
                <a
                  onClick={() =>
                    saveAs(`/forms/${form.slug}.pdf`, `${form.slug}.pdf`)
                  }
                >
                  <PDFIcon
                    style={{
                      width: '20px',
                      marginRight: '6px'
                    }}
                  />
                  <span
                    dangerouslySetInnerHTML={{ __html: form.displayString }}
                  ></span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const query = graphql`
  query($slug: String!) {
    wordpressPage(slug: { eq: $slug }) {
      title
      content
    }
  }
`;
