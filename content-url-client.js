'use strict'

const superagent = require('superagent')

const createMappingEndpoint = contentUrlEndpoint => async (url, navId) => {
  try {
    const res = await superagent
      .post(`${contentUrlEndpoint}`)
      .type('form')
      .send({ url: url })
      .send({ navId: navId })
    console.log(`Mapped ${res.body.resultUrl} to ${res.body.navId}`)
    return res.body
  } catch (err) {
    console.error(err)
  }
}

module.exports = { createMappingEndpoint }
