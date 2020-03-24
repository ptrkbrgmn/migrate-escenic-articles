'use strict'

const { Client } = require('@elastic/elasticsearch')
const esLastestHost = 'http://latest.elasticsearch-nav-content.service.elastx.consul.dex.nu:9201'
const esLastestClient = new Client({ node: esLastestHost })
const elascticsearchSourceIndexParams = {
  index: 'content-dmedia',
  type: 'content',
  scroll: '1m',
  size: 1,
  terminateAfter: 1,
  body: {
    query: {
      bool: {
        must: [
          {
            query_string: {
              query: 'objectType:article'
            }
          }
        ]
      }
    }
  }
}

const transform = require('./transform').transform
// const escenicArticle = require('./data/escenic.article.example.2.json')
const fromDMediaToDagensMedia = transform('dmedia', 'dagensmedia')
// const result = fromDMediaToDagensMedia(escenicArticle)
// console.log(JSON.stringify(result, null, 2))

// ---

const createMappingEndpoint = require('./content-url-client').createMappingEndpoint
const createMapping = createMappingEndpoint('https://content-url-latest.internal.elx.ohoy.io/id-mapping/')

// async function run () {
//   const result = await createMapping('https://www.dagensmedia.se/test-slug/', 'dagensmedia.escenic.123456')
//   console.log(JSON.stringify(result, null, 2))
// }
// run()

// --

const localhostHost = 'http://es-content.dev.bonnier.news:9200'
// const { Client } = require('@elastic/elasticsearch')
const esLocalclient = new Client({ node: localhostHost })
const indexToContentBbm = require('./es-index').index(esLocalclient)('content-bbm', '_doc')

const f = async article => {
  const transformedArticle = fromDMediaToDagensMedia(article)
  transformedArticle.indexed.urls
    .reverse()
    .map(url => createMapping(url, transformedArticle.id))
  indexToContentBbm(transformedArticle)
}

const indexEscenicArticlesInContentDMediaToContentBbm = require('./es-scroll-search-2').handleArticles(esLastestClient)(elascticsearchSourceIndexParams)('escenic')(f)

indexEscenicArticlesInContentDMediaToContentBbm()

