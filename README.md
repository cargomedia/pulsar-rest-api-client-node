[![Build Status](https://travis-ci.org/cargomedia/pulsar-rest-api-client-node.png?branch=master)](https://travis-ci.org/cargomedia/pulsar-rest-api-client-node)

(unstable, currently in development)

pulsar-rest-api-client-node
===========================

## About

This is ["Pulsar REST API service"](https://github.com/cargomedia/pulsar-rest-api) client in `node.js`.

## Installation

### Config format
```json
{
  "url": "",
  "authToken": ""
}
```

`url`: String. Required. Url of Pulsar REST API.
`authToken`: String. Optional. Authentication token for Pulsar REST API if it requires authentication. Details [here](https://github.com/cargomedia/pulsar-rest-api#authentication).
