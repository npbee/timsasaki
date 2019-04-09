const tailwindcss = require('tailwindcss');
const cssnano = require('cssnano');

module.exports = {
  plugins: [
    // ...
    tailwindcss('./tailwind.js'),
    cssnano({
      preset: 'default'
    })
    // require('autoprefixer'),
    // ...
  ]
}
