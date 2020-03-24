const scrollSearch = client => async query => {
  // start things off by searching, setting a scroll timeout, and pushing
  // our first response into the queue to be processed
  const initialResponse = await client.search({
    size: 100,
    scroll: '30s', // keep the search results "scrollable" for 30 seconds
    ...query
  })
  const result = []
  const responseQueue = [initialResponse]
  while (responseQueue.length) {
    const response = responseQueue.shift()
    // collect the hits from this response
    result.push(...response.hits.hits)
    // check to see if we have collected all of the hits
    if (response.hits.total === result.length) {
      break
    }
    // get the next response if there are more quotes to fetch
    responseQueue.push(
      await client.scroll({
        scrollId: response._scroll_id,
        scroll: '30s'
      })
    )
  }
  return result
}

module.exports = { scrollSearch }
