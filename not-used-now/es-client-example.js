'use strict'

const { Client } = require('@elastic/elasticsearch')
const host = 'http://latest.elasticsearch-nav-content.service.elastx.consul.dex.nu:9201'
const index = 'content-dmedia'
const type = 'content'
const client = new Client({ node: host })

async function run () {
  const { body } = await client.search({
    index: index,
    type: type,
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
  })

  console.log(body.hits.hits)
}

run().catch(console.log)
