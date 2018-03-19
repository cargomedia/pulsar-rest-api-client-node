UNMAINTAINED
============
This project is not maintained anymore.
If you want to take over contact us at tech@cargomedia.ch.

pulsar-rest-api-client-node [![Build Status](https://travis-ci.org/cargomedia/pulsar-rest-api-client-node.svg?branch=master)](https://travis-ci.org/cargomedia/pulsar-rest-api-client-node)
===========================

This is ["Pulsar REST API service"](https://github.com/cargomedia/pulsar-rest-api) client in `node.js`.

## Usage
```js
var PulsarApiClient = require('pulsar-rest-api-client-node');
var pulsarApi = new PulsarApiClient(config);
var job = pulsarApi.createJob('example', 'production', 'deploy');
pulsarApi.runJob(job).then(function(job){});
pulsarApi.jobs().then(function(jobList){
  console.log(jobList);
  pulsarApi.killJob(job).then(function(job){
    console.log(job + ' has been killed');
  });
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
**auxiliary**: Object. Optional. Contains info about additional pulsar rest api servers. It is designated for cases when you want to use different Pulsar REST API for different application/environment. Key in this object must declare a pair of application and environment that you want to distinguish. Value must be an object that contains options of additional pulsar-rest-api. For example if you want to use a separate pulsar-rest-api for pulsar commands that are applied to the application `example` and the environment `production` then you need to have a config like this:

```json
{
  "url": "default pulsar-rest-api url",
  "auxiliary": {
    "example/production": {
      "url": "http://example.prod:100033"
    }
  }
}
```

If we add also an additional server for `example`/`staging`:
```json
{
  "url": "default pulsar-rest-api url",
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

## API
Our node source code is fully documented using jsdoc. Using proper IDE with code-completion will aid your coding experience. Otherwise browse source-code.

## Test
To run tests just use `npm test`.

## Release
 - update package.json with a new version
 - release a new git tag with the updated package.json

After that the npm release should be done automatically. If it didn't happen then release it manually:
```
npm publish https://github.com/cargomedia/pulsar-rest-api-client-node/archive/<GitTagWithUpdatedPackageJson>.tar.gz
```
