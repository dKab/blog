const CleanCSS = require("clean-css");
const format = require('date-fns/format')
module.exports = function(eleventyConfig) {
  let markdownIt = require("markdown-it");
  let markdownItAnchor = require("markdown-it-anchor");
  let options = {
    html: true
  };
  let markdownLib = markdownIt(options).use(markdownItAnchor, {
    level: 2,
    permalink: true
  });
  
  eleventyConfig.setLibrary("md", markdownLib);
  
  eleventyConfig.setLiquidOptions({
    dynamicPartials: true
  });
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

  eleventyConfig.addFilter('formatTimestampAsDate', function(timestamp, formatString) {
    const date = new Date();
    date.setTime(timestamp * 1000);
    return format(date, formatString);
  })
 
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
  return {
    passthroughFileCopy: true
  }
};