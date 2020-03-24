'use strict'

const DataTransform = require('node-json-transform').DataTransform
const escenicArticle = require('./data/escenic.article.example.2.json')

var data = {
  excenicArticles: [escenicArticle]
}

var map = {
  list: 'excenicArticles',
  article: {
    id: 'id',
    document: 'document'
  },
  operate: [
    {
      run: function (id) { return id.replace('dmedia', 'dagensmedia') }, on: 'id'
    },
    {
      run: function (documentId) { return documentId.replace('dmedia', 'dagensmedia') }, on: 'document.id'
    },
    {
      run: function (documentSections) { return documentSections.map(documentSection => documentSection.id.replace('dmedia', 'dagensmedia')) }, on: 'document.sectionPath'
    },
    {
      run: function (bylines) { return bylines.map(byline => byline.id.replace('dmedia', 'dagensmedia')) }, on: 'document.bylines'
    },
    {
      run: function (indexedSections) { return indexedSections.map(section => section.replace('dmedia', 'dagensmedia')) }, on: 'indexed.sections'
    },
    {
      run: function (indexedTags) { return indexedTags.map(tag => tag.replace('dmedia', 'dagensmedia')) }, on: 'indexed.tags'
    }
  ],
  each: function (item) {
    // make changes
    item.iterated = true
    return item
  }
}

function run () {
  var dataTransform = DataTransform(data, map)
  var result = dataTransform.transform()
  console.log(JSON.stringify(result, null, 2))
}

run()
