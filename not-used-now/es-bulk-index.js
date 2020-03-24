'use strict'

require('array.prototype.flatmap').shim()

async function bulkIndex (client, index, type, articles) {
  const body = articles.flatMap(doc => [{ index: { _index: index, _type: type, _id: doc.id } }, doc])

  const { body: bulkResponse } = await client.bulk({ refresh: true, body })

  if (bulkResponse.errors) {
    const erroredDocuments = []
    // The items array has the same order of the dataset we just indexed.
    // The presence of the `error` key indicates that the operation
    // that we did for the document has failed.
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0]
      if (action[operation].error) {
        erroredDocuments.push({
          // If the status is 429 it means that you can retry the document,
          // otherwise it's very likely a mapping error, and you should
          // fix the document before to try it again.
          status: action[operation].status,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1]
        })
      }
    })
    console.log(erroredDocuments)
  }

  // Patrik: Finns det nåt sätt att returnera hur många artiklar med indexed.brand=dagensmedia som indexerades?
  const { body: count } = await client.count({ index: index, type: type })
  console.log(count)
}

module.exports = { bulkIndex }
