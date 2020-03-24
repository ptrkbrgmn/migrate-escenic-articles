'use strict'

const { Client } = require('@elastic/elasticsearch')
const host = 'http://latest.elasticsearch-nav-content.service.elastx.consul.dex.nu:9201'
const index = 'content-dmedia'
const type = 'content'
const client = new Client({ node: host })

async function * scrollSearch (params) {
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

async function run () {
  const params = {
    index: index,
    type: type,
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

  for await (const hit of scrollSearch(params)) {
    transformArticle(hit._source)
  }
}

function transformArticle (escenicArticle) {
  // console.log(JSON.stringify(escenicArticle.id, null, 2))
  if (escenicArticle.id.includes('escenic')) {

  }
}

run().catch(console.log)
