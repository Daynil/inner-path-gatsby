import { Link } from 'gatsby';
import React from 'react';
import Image from '../components/image';
var HtmlToReact = require('html-to-react');
var HtmlToReactParser = require('html-to-react').Parser;

let isValidNode = function () {
  return true;
};

// @ts-ignore
var htmlToReactParser = new HtmlToReactParser();
// @ts-ignore
let processNodeDefinitions = new HtmlToReact.ProcessNodeDefinitions(React);

// Traverse the wordpress HTML content string
var processingInstructions = [
  // Replace any internal anchor links with Gatsby
  {
    replaceChildren: false,
    shouldProcessNode: function (node) {
      return (
        node.attribs &&
        node.attribs['href'] &&
        node.attribs['href'].substring(0, 4) !== 'http'
      );
    },
    processNode: function (node, children, index) {
      return <Link to={node.attribs['href']}>{node.children[0].data}</Link>;
    }
  },
  // Adjust resized Wordpress image wrappers to suite Gatsby Image Fluid
  {
    replaceChildren: false,
    shouldProcessNode: function (node) {
      return (
        node.name === 'figure' &&
        node.attribs['class'] &&
        node.attribs['class'].includes('is-resized')
      );
    },
    processNode: function (node, children, index) {
      const nodeWidth =
        node.children[0] && node.children[0].attribs['width']
          ? node.children[0].attribs['width']
          : null;
      const nodeHeight =
        node.children[0] && node.children[0].attribs['height']
          ? node.children[0].attribs['height']
          : null;
      if (nodeWidth && nodeHeight)
        return (
          <figure
            className={node.attribs['class']}
            style={{ width: `${nodeWidth}px`, height: `${nodeHeight}px` }}
          >
            {children}
          </figure>
        );
      return <figure className={node.attribs['class']}>{children}</figure>;
    }
  },
  // Replace image tags with Gatsby image
  {
    replaceChildren: false,
    shouldProcessNode: function (node) {
      return (
        node.attribs &&
        node.attribs['class'] &&
        node.attribs['class'].substring(0, 8) === 'wp-image'
      );
    },
    processNode: function (node, children, index) {
      // e.g. wp-image-22
      const parsedImageID = node.attribs['class'].split('-')[2];
      return (
        <Image
          src={`${parsedImageID}`}
          alt={node.attribs['alt'] ? node.attribs['alt'] : ''}
          key={parsedImageID}
        />
      );
    }
  },
  // Custom template tag map
  {
    replaceChildren: false,
    shouldProcessNode: function (node) {
      return (
        node.children &&
        node.children[0] &&
        node.children[0].type === 'text' &&
        node.children[0].data === '{{map}}'
      );
    },
    processNode: function (node, children, index) {
      return (
        <iframe
          className="map"
          frameBorder="0"
          style={{ border: '0' }}
          src="https://www.google.com/maps/embed/v1/place?key=AIzaSyCWcXzaBIDCFf1WHLLwUhhytG0PLiSWV9Y&q=Inner+Path,+Westmont,+IL+60559"
          allowFullScreen
        ></iframe>
      );
    }
  },
  // Custom template tag contact form
  {
    replaceChildren: false,
    shouldProcessNode: function (node) {
      return (
        node.children &&
        node.children[0] &&
        node.children[0].type === 'text' &&
        node.children[0].data === '{{contactForm}}'
      );
    },
    processNode: function (node, children, index) {
      return (
        <iframe
          className="map"
          frameBorder="0"
          style={{ border: '0' }}
          src="https://www.google.com/maps/embed/v1/place?key=AIzaSyCWcXzaBIDCFf1WHLLwUhhytG0PLiSWV9Y&q=Inner+Path,+Westmont,+IL+60559"
          allowFullScreen
        ></iframe>
      );
    }
  },
  {
    // Anything else
    shouldProcessNode: function (node) {
      return true;
    },
    processNode: processNodeDefinitions.processDefaultNode
  }
];

export function parseWPHTMLString(htmlString) {
  return htmlToReactParser.parseWithInstructions(
    htmlString,
    isValidNode,
    processingInstructions
  );
}
