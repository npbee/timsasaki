const tailwindcss = require("tailwindcss");
const cssnano = require("cssnano");
const simpleVars = require("postcss-simple-vars");
const autoprefixer = require("autoprefixer");
const purgecss = require("@fullhuman/postcss-purgecss");

const isProd = process.env.NODE_ENV === "production";

// Custom PurgeCSS extractor for Tailwind that allows special characters in
// class names.
//
// https://github.com/FullHuman/purgecss#extractor
class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-Za-z0-9-_:\/]+/g) || [];
  }
}

module.exports = {
  plugins: [
    simpleVars(),
    tailwindcss("./tailwind.js"),
    autoprefixer(),
    isProd &&
      cssnano({
        preset: "default",
      }),
    isProd &&
      purgecss({
        content: ["./src/index.html"],
        extractors: [
          {
            extractor: TailwindExtractor,
            extensions: ["html"],
          },
        ],
      }),
  ],
};
