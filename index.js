'use strict'

const fs = require('fs')
const { Client } = require('@elastic/elasticsearch')
const esLastestClient = new Client({ node: 'http://latest.elasticsearch-nav-content.service.elastx.consul.dex.nu:9201' })
const getEscenicArticles = require('./es-scroll-search').getEscenicArticles
const transformToDagensMedia = require('./transform').transform('dmedia', 'dagensmedia')
// const contentUrlHost = 'https://content-url-latest.internal.elx.ohoy.io/id-mapping/'
const contentUrlHost = 'http://content-url.dev.internal.bonnier.news/id-mapping'
const createUrlMapping = require('./content-url-client').createMappingEndpoint(contentUrlHost)

// Only for testing
const esLocalclient = new Client({ node: 'http://es-content.dev.bonnier.news:9200' })
const indexToContentBbm = require('./es-index').index(esLocalclient)('content-bbm', '_doc')

async function run () {
  try {
    const escenicArticles = await getEscenicArticles(esLastestClient)
    console.log(`Found ${escenicArticles.length} escenic articles`)
    for (const escenicArticle of escenicArticles) {
      if (!escenicArticle.id.includes('escenic')) {
        console.error(`Aborting, found non escenic article: ${escenicArticle.id}`)
        process.exit(1)
      }
      const transformedArticle = transformToDagensMedia(escenicArticle)
      await createUrlMapping(transformedArticle.indexed.urls[0], transformedArticle.id)
      await indexToContentBbm(transformedArticle)
    }
    process.exit(1)
  } catch (e) {
    console.log(e)
    fs.appendFileSync('errors.txt', JSON.stringify(e))
  }
}
run()
