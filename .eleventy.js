const CleanCSS = require("clean-css");
module.exports = function(eleventyConfig) {
  eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });
  eleventyConfig.addFilter('jsonify', function (variable) {
    return JSON.stringify(variable);
  });
  eleventyConfig.addPassthroughCopy('assets');
  return {
    passthroughFileCopy: true
  }
};