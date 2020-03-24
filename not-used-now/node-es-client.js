'use strict'

const { Client } = require('@elastic/elasticsearch')
const host = 'http://latest.elasticsearch-nav-content.service.elastx.consul.dex.nu:9201'
const index = 'content-dmedia'
const type = 'content'
const elasticsearchClient = new Client({ node: host })

async function run () {
  const { body } = await elasticsearchClient.search({
    index: index,
    type: type,
    body: {
      query: {
        match: { quote: 'winter' }
      }
    }
  })

  console.log(body.hits.hits)
}

run().catch(console.log)
