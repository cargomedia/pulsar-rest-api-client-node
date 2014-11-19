[![Build Status](https://travis-ci.org/cargomedia/pulsar-rest-api-client-node.png?branch=master)](https://travis-ci.org/cargomedia/pulsar-rest-api-client-node)

(unstable, currently in development)

pulsar-rest-api-client-node
===========================

## About

This is ["Pulsar REST API service"](https://github.com/cargomedia/pulsar-rest-api) client in `node.js`.

## Usage

```js
var PulsarApiClient = require('pulsar-rest-api-client-node');
var pulsarApi = new PulsarApiClient(config);
var job = pulsarApi.createJob('example', 'production', 'deploy');
pulsarApi.runJob(job);
pulsarApi.jobs(function(jobList){
  console.log(jobList);
})
```

## Configuration
**config**: Hash object that contains config parameters. Config parameters have the next format:

```json
{
  "url": "",
  "authToken": "",
  "auxiliary": {
    "{app/env}": {
      "url": "",
      "authToken": ""
    }
  }
}
```

**url**: String. Required. Url of Pulsar REST API.
**authToken**: String. Optional. Authentication token for Pulsar REST API if it requires authentication. Details [here](https://github.com/cargomedia/pulsar-rest-api#authentication).
**auxiliary**: Object. Optional. Contains info about additional pulsar rest api servers. Key in this object must declare an application and an environment for which additional pulsar-rest-api is used. Value must be an object that contains options of additional pulsar-rest-api. For example if you want to use a separate pulsar-rest-api for pulsar commands that are applied to the application `example` and the environment `production` then you need to have a config like this:

```json
{
  "url": "default pulsar-rest-api url. does not matter here",
  "auxiliary": {
    "example/production": {
      "url": "http://example.prod:100033"
    },
    "example/staging": {
      "url": "http://example.staging:100033"
    }
  }
}
```

##API
Please read [jsdoc](src/index.js)
