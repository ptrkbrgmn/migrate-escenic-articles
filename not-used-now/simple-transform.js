'use strict'

const clonedeep = require('lodash.clonedeep')
const escenicArticle = require('./data/escenic.article.example.2.json')

function transform (escenicArticle) {
  const deepcloned = clonedeep(escenicArticle)
  deepcloned.id = escenicArticle.id.replace('dmedia', 'dagensmedia')
  deepcloned.document.id = escenicArticle.document.id.replace('dmedia', 'dagensmedia')
  deepcloned.document.sectionPath = escenicArticle.document.sectionPath.map(documentSection => documentSection.id.replace('dmedia', 'dagensmedia'))
  deepcloned.document.bylines = escenicArticle.document.bylines.map(byline => byline.id.replace('dmedia', 'dagensmedia'))
  deepcloned.indexed.sections = escenicArticle.indexed.sections.map(section => section.replace('dmedia', 'dagensmedia'))
  deepcloned.indexed.tags = escenicArticle.indexed.tags.map(tag => tag.replace('dmedia', 'dagensmedia'))
  deepcloned.indexed.brand = 'dagensmedia'
  return deepcloned
}

function run () {
  const result = transform(escenicArticle)
  console.log(JSON.stringify(result, null, 2))
}

run()
