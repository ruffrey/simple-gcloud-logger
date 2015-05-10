# simple-gcloud-logger
An easy interface to send logs to Google Cloud Platform Logging for Compute Engine, for Node.js.

## Getting started - important

This is an unofficial wrapper library.

This library is **strictly for writing logs** and will not have permission
or APIs to do anything else.

**Before using this library**, look at the official docs real quick. so you understand
the necessary requirements for doing logging. Certain fields are required
and have expected values.

https://cloud.google.com/logging/docs/api/tasks/creating-logs#write_log_entries

At the time of writing, this was a beta service of google and you must ask
for access.


## Usage

```bash
npm i simple-gcloud-logger
```

```javascript
var GCloudLogger = require('simple-gcloud-logger');
var logger = new GCloudLogger({
    clientEmail: '377-d14539nf65sx4@developer.gserviceaccount.com',
    privateKeyPath: '/path/to/my/gcloud-credentials-file.p12',
    project: 'gcloud-project-name-3543',
    logId: 'mycustomservice',
    verbose: false,
    send: true,
    commonLabels: {
        // "compute.googleapis.com/resource_id": "12345",
        // "compute.googleapis.com/resource_type": "instance",
    }
});
logger.log('Hey');
logger.log({
    insertId: +new Date() + '-asdf', // custom log entry unique id
    myText: 'Asdf',
    myCode: 7
});
```

To print output, pass environment variables via `DEBUG=<logId>`.
This package uses the `debug` module internally.

## Methods

```javascript
logger.log('I will be INFO');

logger.debug('I will be DEBUG');
logger.info('I will be INFO');
logger.warning('I will be WARNING');
logger.error('I will be ERROR');
logger.critical('I will be CRITICAL');
```

The logger can also be passed an object.

```javascript
logger.log({
    level: 'DEBUG',
    someData: {
        send: 'to gcloud loggin'
    }
});

logger.error({
    err: new Error('We need more spaghetti'),
    status: 400,
    something: 'else'
});
```

## Log method options

When passing an object to a logger method, the following internal properties
are used. All other properties are passed through and will be written
to the console according to `DEBUG=`, as well as show up in the GCloud Log
Viewer.

```javascript
logger.log({
    // internal gcloud logging fields - will not be outputted to debug if
    // they are included in a log message
    level: 'INFO',
    insertId: '123-asdf-456',
    timestamp: new Date().toISOString(),
    labels: {
        "compute.googleapis.com/resource_id": "12345",
        "compute.googleapis.com/resource_type": "instance",
    },

    // will be logged
    myProperty: 75,
    someText: 'hot dogs'
});
```
