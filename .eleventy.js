const CleanCSS = require("clean-css");
const format = require('date-fns/format');
const pluginRss = require("@11ty/eleventy-plugin-rss");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItTOC = require("markdown-it-toc-done-right");

module.exports = function(eleventyConfig) {
  let options = {
    html: true
  };
  let markdownLib = markdownIt(options).use(markdownItAnchor, {
    level: 2,
    permalink: true
  })
  .use(markdownItTOC, {level: 2});

  eleventyConfig.addPlugin(syntaxHighlight);
  
  eleventyConfig.setLibrary("md", markdownLib);
  
  eleventyConfig.setLiquidOptions({
    dynamicPartials: true
  });
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });
  eleventyConfig.addFilter('jsonify', function (variable) {
    return JSON.stringify(variable);
  });
  eleventyConfig.addFilter('objToArray', function(obj) {
    return obj ? Object.values(obj) : []
  });
  
  eleventyConfig.addFilter('where', function(array, key, val) {
    return array.filter(item => item[key] == val)
  });

  eleventyConfig.addFilter('toCollection', function(val) {
    return JSON.parse(val);
  });

  eleventyConfig.addFilter('getType', function(val) {
    return typeof val;
  });

  eleventyConfig.addFilter('formatDate', function(dateOrTimestamp, formatString) {
    let date;
    if (typeof dateOrTimestamp === 'number') {
      date = new Date();
      date.setTime(dateOrTimestamp * 1000);
    } else {
      date = dateOrTimestamp;
    }
    return format(date, formatString);
  });
 
  eleventyConfig.addFilter('sortBy', function(array, key) {
    return array.slice().sort(function(a,b) {
      return a[key] - b[key];
    })
  });

  eleventyConfig.addFilter('to_integer', function(string) {
    if (string === "") {
      return 0;
    }
    return parseInt(string, 10);
  });

  eleventyConfig.addFilter('absoluteUrl', (url) => `https://kabardinovd.com${url}`);

  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy('site.webmanifest');
  return {
    passthroughFileCopy: true
  }
};