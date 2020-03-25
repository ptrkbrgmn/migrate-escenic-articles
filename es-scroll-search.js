'use strict'

let nRead = 0; let nMFoundEscenicArticles = 0; let nTotal
const start = Date.now()
setInterval(() => {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  const throughput = (1000 * nMFoundEscenicArticles) / (Date.now() - start)
  process.stdout.write(`Read ${nRead}, Found Escenic articles ${nMFoundEscenicArticles}, total ${nTotal}, throughput ${throughput.toFixed(2)} msgs/s`)
}, 500)

async function * scrollSearch (client) {
  console.log('\nRunning scrollSearch')

  const params = {
    index: 'content-dmedia',
    type: 'content',
    scroll: '20m',
    size: 10,
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
  var response = await client.search(params)

  while (true) {
    const sourceHits = response.body.hits.hits
    nRead += response.body.hits.hits.length
    nTotal = response.body.hits.total

    if (sourceHits.length === 0) {
      break
    }

    for (const hit of sourceHits) {
      yield hit
    }

    if (!response.body._scroll_id) {
      break
    }

    response = await client.scroll({
      scrollId: response.body._scroll_id,
      scroll: params.scroll
    })
  }
}

async function getEscenicArticles (client) {
  console.log('\nRunning getEscenicArticles')

  const articles = []
  for await (const hit of scrollSearch(client)) {
    const article = hit._source
    if (article.id.includes('escenic')) {
      articles.push(article)
      nMFoundEscenicArticles++
    }
  }
  return articles
}

module.exports = { getEscenicArticles }
