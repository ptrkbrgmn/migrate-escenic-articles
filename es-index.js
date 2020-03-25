'use strict'

const index = client => (index, type) => async (doc) => {
  const result = await client.index({
    index: index,
    type: type,
    id: doc.id,
    body: doc
  })
  // console.log(`Indexed article with id: ${result.body._id}`)
  return result
}

module.exports = { index }
