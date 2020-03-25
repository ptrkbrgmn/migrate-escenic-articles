'use strict'

const clonedeep = require('lodash.clonedeep')

const transform = (fromBrand, toBrand) => article => {
  const deepcloned = clonedeep(article)
  deepcloned.id = article.id.replace(fromBrand, toBrand)
  deepcloned.document.id = article.document.id.replace(fromBrand, toBrand)
  deepcloned.document.sectionPath = article.document.sectionPath.map(sectionPathEntry => {
    sectionPathEntry.id = sectionPathEntry.id.replace(fromBrand, toBrand)
    return sectionPathEntry
  })
  deepcloned.document.tags = article.document.tags.map(tag => {
    tag.id = tag.id.replace(fromBrand, toBrand)
    return tag
  })
  deepcloned.document.bylines = article.document.bylines.map(byline => {
    byline.id = byline.id.replace(fromBrand, toBrand)
    return byline
  })
  deepcloned.indexed.sections = article.indexed.sections.map(section => section.replace(fromBrand, toBrand))
  deepcloned.indexed.tags = article.indexed.tags.map(tag => tag.replace(fromBrand, toBrand))
  deepcloned.indexed.urls = article.indexed.urls.map(url => url.replace(fromBrand, toBrand))
  deepcloned.indexed.brand = toBrand
  // console.log(`Transformed article, source-id ${article.id}. result-id ${deepcloned.id}`)
  return deepcloned
}

// const escenicArticle = require('./data/escenic.article.example.2.json')
// const result = transform('dmedia','dagensmedia')(escenicArticle)
// console.log(JSON.stringify(result, null, 2))

module.exports = { transform }
