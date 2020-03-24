'use strict'

const { Client } = require('@elastic/elasticsearch')
const host = 'http://latest.elasticsearch-nav-content.service.elastx.consul.dex.nu:9201'
const index = 'content-dmedia'
const type = 'content'
const client = new Client({ node: host })

const sectionPages = []
const sections = []

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
  console.log('SECTION PAGES:')
  console.log(sectionPages)
  console.log('')
  console.log('SECTIONS:')
  console.log(sections)
}

function getSectionPageAndSection (escenicArticle) {
  const pathSegments = escenicArticle.document.url.match(/[^/]+/g)
  // console.log(pathSegments)

  if (pathSegments.length === 3) {
    if (!sectionPages.includes(pathSegments[0])) {
      sectionPages.push(pathSegments[0])
    }
    if (!sections.includes(pathSegments[1])) {
      sections.push(pathSegments[1])
    }
  } else if (pathSegments.length === 2) {
    if (!sections.includes(pathSegments[0])) {
      sections.push(pathSegments[0])
    }
  } else {
    console.log('--------------- ' + escenicArticle.document.url)
  }
}

function transformArticle (escenicArticle) {
  // console.log(JSON.stringify(escenicArticle.id, null, 2))
  if (escenicArticle.id.includes('escenic')) {
    getSectionPageAndSection(escenicArticle)
  }
}

run().catch(console.log)
