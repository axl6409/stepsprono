module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    '@fullhuman/postcss-purgecss': {
      content: ['./src/**/*.html', './src/**/*.jsx'],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    }
  }
}