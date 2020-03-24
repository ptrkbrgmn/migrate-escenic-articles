'use strict'

const clonedeep = require('lodash.clonedeep')

const transform = (fromBrand, toBrand) => article => {
  const deepcloned = clonedeep(article)
  deepcloned.id = article.id.replace(fromBrand, toBrand)
  deepcloned.document.id = article.document.id.replace(fromBrand, toBrand)
  deepcloned.document.sectionPath = article.document.sectionPath.map(documentSection => documentSection.id.replace(fromBrand, toBrand))
  deepcloned.document.bylines = article.document.bylines.map(byline => byline.id.replace(fromBrand, toBrand))
  deepcloned.indexed.sections = article.indexed.sections.map(section => section.replace(fromBrand, toBrand))
  deepcloned.indexed.tags = article.indexed.tags.map(tag => tag.replace(fromBrand, toBrand))
  deepcloned.indexed.urls = article.indexed.urls.map(url => url.replace(fromBrand, toBrand))
  deepcloned.indexed.brand = toBrand
  console.log(`Transformed article, resulting id ${deepcloned.id}`)
  return deepcloned
}

module.exports = { transform }
