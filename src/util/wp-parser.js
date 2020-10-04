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
  // Replace image tags with Gatsby image
  {
    replaceChildren: false,
    shouldProcessNode: function (node) {
      if (
        node.attribs &&
        node.attribs['class'] &&
        node.attribs['class'].substring(0, 8) === 'wp-image'
      )
        console.log(node);
      return (
        node.attribs &&
        node.attribs['class'] &&
        node.attribs['class'].substring(0, 8) === 'wp-image'
      );
    },
    processNode: function (node, children, index) {
      // e.g. wp-image-22
      const parsedImageID = node.attribs['class'].split('-')[2];
      const imagePathFrag = node.attribs['src'].split('.');
      const imageExtension = imagePathFrag[imagePathFrag.length - 1];
      return <Image src={`${parsedImageID}.${imageExtension}`}></Image>;
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
