'use strict'

const { Client } = require('@elastic/elasticsearch')
const esLatestClient = new Client({ node: 'http://latest.elasticsearch-nav-content.service.elastx.consul.dex.nu:9201' })
const scrollSize = 10
const scrollTime = '20m'
const transformToDagensMedia = require('./transform').transform('dmedia', 'dagensmedia')
const contentUrlHost = 'https://content-url-latest.internal.elx.ohoy.io/id-mapping/'
// const contentUrlHost = 'http://content-url.dev.internal.bonnier.news/id-mapping'
const createUrlMapping = require('./content-url-client').createMappingEndpoint(contentUrlHost)
// Only for testing
// const esLocalclient = new Client({ node: 'http://es-content.dev.bonnier.news:9200' })
const indexToContentBbm = require('./es-index').index(esLatestClient)('content-bbm', '_doc')

const fs = require('fs')
const scrollIdFile = 'migrate-escenic-scroll.txt'
let nRead = 0; let nMigratedEscenicArticles = 0; let nTotal
const start = Date.now()
setInterval(() => {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  const throughput = (1000 * nMigratedEscenicArticles) / (Date.now() - start)
  process.stdout.write(`Read ${nRead}, migrated Escenic articles ${nMigratedEscenicArticles}, total ${nTotal}, throughput ${throughput.toFixed(2)} msgs/s`)
}, 500)

async function search () {
  const elascticsearchSourceIndexParams = {
    index: 'content-dmedia',
    type: 'content',
    scroll: scrollTime,
    size: scrollSize,
    // terminateAfter: 1,
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
  const result = await esLatestClient.search(elascticsearchSourceIndexParams)
  return handleEsResult(result)
}

function handleEsResult (result) {
  nRead += result.body.hits.hits.length
  nTotal = result.body.hits.total
  return {
    scrollId: result.body._scroll_id,
    entries: result.body.hits.hits
      .map(hit => hit._source)
  }
}

const fetch = async (scrollId) => {
  const query = {
    scrollId: scrollId,
    scroll: scrollTime
  }
  const result = await esLatestClient.scroll(query)
  return handleEsResult(result)
}

async function loop (prevScrollId) {
  fs.writeFileSync(scrollIdFile, prevScrollId)
  const { entries, scrollId } = await fetch(prevScrollId)
  if (entries.length === 0) {
    console.log(`\nNo more data to fecth. Migrated ${nMigratedEscenicArticles} Escenic articles`)
    process.exit(0)
  }
  await transformMapIndex(entries)
  loop(scrollId)
}

async function transformMapIndex (articles) {
  try {
    for (const article of articles) {
      if (article.id.includes('escenic')) {
        const transformedArticle = transformToDagensMedia(article)
        await createUrlMapping(transformedArticle.indexed.urls[0], transformedArticle.id)
        await indexToContentBbm(transformedArticle)
        nMigratedEscenicArticles++
      }
    }
  } catch (e) {
    console.log(e)
    fs.appendFileSync('errors.txt', e)
  }
}

async function migrate () {
  let scrollId
  if (fs.existsSync(scrollIdFile)) {
    scrollId = fs.readFileSync(scrollIdFile, 'utf-8')
    console.log('Using scrollId from file', scrollIdFile, ':', scrollId)
  } else {
    const result = await search()
    scrollId = result.scrollId
    await transformMapIndex(result.entries)
    console.log('Create new scroll id', scrollId)
  }
  loop(scrollId)
}

migrate()
