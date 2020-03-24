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
const fromDMediaToDagensMedia = transform('dmedia', 'dagensmedia')

const createMappingEndpoint = require('./content-url-client').createMappingEndpoint
const createMapping = createMappingEndpoint('https://content-url-latest.internal.elx.ohoy.io/id-mapping/')

// Only for testing
const localhostHost = 'http://es-content.dev.bonnier.news:9200'
const esLocalclient = new Client({ node: localhostHost })
const indexToContentBbm = require('./es-index').index(esLocalclient)('content-bbm', '_doc')

const transformUrlMapAndIndex = async article => {
  const transformedArticle = fromDMediaToDagensMedia(article)
  transformedArticle.indexed.urls
    .reverse()
    .map(url => createMapping(url, transformedArticle.id))
  indexToContentBbm(transformedArticle)
}

const indexEscenicArticlesInContentDMediaToContentBbm = require('./es-scroll-search-2').handleArticles(esLastestClient)(elascticsearchSourceIndexParams)('escenic')(transformUrlMapAndIndex)

indexEscenicArticlesInContentDMediaToContentBbm()
