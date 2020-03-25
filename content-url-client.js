'use strict'

const superagent = require('superagent')

/** Från ContentUrlClient:
* Map an url to a navId. This will overwrite existing url mapping if url is in use
* override def updateOrCreateUrlMapping(url: Url, navId: NavId)
* ##### Motsvarar en PUT mot ContentUrls REST-api
*/

const createMappingEndpoint = contentUrlEndpoint => async (url, navId) => {
  try {
    const res = await superagent
      .put(`${contentUrlEndpoint}`)
      .type('form')
      .send({ url: url })
      .send({ navId: navId })
    // console.log(`Mapped ${res.body.resultUrl} to ${res.body.navId}`)
    return res.body
  } catch (err) {
    console.error(err)
  }
}

module.exports = { createMappingEndpoint }
