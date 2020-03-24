'use strict'

const transformEscenicArticle = require('./transform').transformEscenicArticle
const { Client } = require('@elastic/elasticsearch')
const host = 'http://latest.elasticsearch-nav-content.service.elastx.consul.dex.nu:9201'
const client = new Client({ node: host })
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
const getEscenicArticles = require('./es-scroll-search').getEscenicArticles

// const localhostHost = 'http://es-content.dev.bonnier.news:9200'
// const esLocalclient = new Client({ node: localhostHost })
// const bulkIndex = (articles) => require('./es-bulk-index').bulkIndex(esLocalclient, 'content-bbm', '_doc', articles)

const createMappingEndpoint = require('./content-url-client')
const createMapping = createMappingEndpoint('https://content-url-latest.internal.elx.ohoy.io/id-mapping/')

function createUrlNavIdMapping (article) {
  article.indexed.urls
    .forEach(url =>
      createMapping(url, article.id)
    )
}

// escenicArticles.forEach(article => console.log(JSON.stringify(article, null, 2)))
// transformedArticles.forEach(article => console.log(JSON.stringify(article, null, 2)))
async function run () {
  const escenicArticles = await getEscenicArticles(client, elascticsearchSourceIndexParams).catch(console.log)
  const transformedArticles = transformEscenicArticle(escenicArticles)
  transformedArticles
    .map(article => createUrlNavIdMapping(article))
  // await bulkIndex(transformedArticles)
}

run()
