import { Link } from 'gatsby';
import React from 'react';
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
// Replace any internal anchor links with Gatsby
var processingInstructions = [
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
  {
    // Anything else
    shouldProcessNode: function (node) {
      return true;
    },
    processNode: processNodeDefinitions.processDefaultNode
  }
];

export function parseInternalLinks(htmlString) {
  return htmlToReactParser.parseWithInstructions(
    htmlString,
    isValidNode,
    processingInstructions
  );
}
