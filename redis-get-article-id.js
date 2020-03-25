'use strict'

// 'redis-sentinel://test.redis-sentinel.service.elastx.consul.dex.nu:26379/0?sentinelMasterId=nav-latest'
const redis = require('redis')
redis.add_command('JSON.SET')
redis.add_command('JSON.ARRAPPEND')
const RedisSentinel = require('redis-sentinel-client')

const redisOptions = {
  redisSentinelHost: 'test.redis-sentinel.service.elastx.consul.dex.nu', // || redisSentinelHost,
  port: 26379, // Default sentinel port.
  masterName: 'nav-latest'
}

var client = RedisSentinel.createClient(26379, 'test.redis-sentinel.service.elastx.consul.dex.nu', redisOptions)

function run (client) {
  // client.get('https://www.dagensmedia.se/medier/medier/watch-arnold-schwarzenegger-give-coronavirus-tips-from-his-hot-tub/', redis.print)
  client.get('https://www.dagensmedia.se/some-nice-updated-slug', redis.print)
}

client.on('error', function (error) {
  console.error(error)
})

client.on('connect', function () {
  run(client)
})
