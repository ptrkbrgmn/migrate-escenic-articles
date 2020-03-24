'use strict'

async function * scrollSearch (client, params) {
  var response = await client.search(params)

  while (true) {
    const sourceHits = response.body.hits.hits

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

const handleArticles = client => params => identifier => f => async () => {
  for await (const hit of scrollSearch(client, params)) {
    const article = hit._source
    if (article.id.includes(identifier)) {
      f(article)
    }
  }
}

module.exports = { handleArticles }
