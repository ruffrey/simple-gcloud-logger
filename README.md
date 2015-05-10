# simple-gcloud-logger
An easy interface to send logs to Google Cloud Platform Logging for Compute Engine, for Node.js.

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
    send: true
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

When passing an object to a logger method, the following internal properties are used. All other properties are passed through.

```javascript
logger.log({
    level: 'INFO', // not part of log
    insertId: '123-asdf-456', // not part of log
    timestamp: new Date().toISOString(), // not part of log
    myProperty: 75, // will be logged
    someText: 'hot dogs' // will be logged
});
```
