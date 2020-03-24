const { Client } = require('@elastic/elasticsearch')
const ElasticsearchScrollStream = require('elasticsearch-scroll-stream')

const pageSize = '5'
const stopCounterIndex = 5
let counter = 0
let currentDoc
const elasticSearchClient = new Client({ node: 'http://latest.elasticsearch-nav-content.service.elastx.consul.dex.nu:9201' })

const escenicIds = []

const esStream = new ElasticsearchScrollStream(elasticSearchClient, {
  index: 'content-dmedia',
  type: 'content',
  scroll: '10s',
  size: pageSize,
  _source: ['id'],
  body: {
    query: {
      bool: {
        must: [
          {
            query_string: {
              default_field: '_all',
              query: 'objectType:article*'
            }
          }
        ]
      }
    }
  }
}, ['_id', '_score'])

esStream.on('data', function (data) {
  currentDoc = JSON.parse(data.toString())

  if (currentDoc._id.includes('escenic')) {
    escenicIds.push(currentDoc._id)
  }

  if (counter === stopCounterIndex) {
    esStream.close()
  }
  counter++
})

esStream.on('end', function () {
  console.log(counter)
  escenicIds.forEach(id => getArticle(id))
})

esStream.on('error', function (err) {
  console.log(err)
})

function getArticle (id) {
  console.log(id)
}
