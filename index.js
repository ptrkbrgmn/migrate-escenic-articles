'use strict'

const fs = require('fs')
const getEscenicArticles = require('./es-scroll-search').getEscenicArticles
const transform = require('./transform').transform
const createMappingEndpoint = require('./content-url-client').createMappingEndpoint
const { Client } = require('@elastic/elasticsearch')
const esLastestClient = new Client({ node: 'http://latest.elasticsearch-nav-content.service.elastx.consul.dex.nu:9201' })
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

const fromDMediaToDagensMedia = transform('dmedia', 'dagensmedia')
const createMapping = createMappingEndpoint('https://content-url-latest.internal.elx.ohoy.io/id-mapping/')

// Only for testing
// const esLocalclient = new Client({ node: 'http://es-content.dev.bonnier.news:9200' })
// const indexToContentBbm = require('./es-index').index(esLocalclient)('content-bbm', '_doc')
const indexToContentBbm = require('./es-index').index(esLastestClient)('content-bbm', '_doc')

async function run () {
  try {
    const escenicArticles = await getEscenicArticles(esLastestClient, elascticsearchSourceIndexParams)
    for (const escenicArticle of escenicArticles) {
      const transformedArticle = fromDMediaToDagensMedia(escenicArticle)
      await createMapping(transformedArticle.indexed.urls[0], transformedArticle.id)
      await indexToContentBbm(transformedArticle)
    }
  } catch (e) {
    console.log(e)
    fs.appendFileSync('errors.txt', e)
  }
}
run()
