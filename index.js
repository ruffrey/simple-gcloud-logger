'use strict';
var google = require('googleapis');
var logging = google.logging('v1beta3').projects.logs.entries.write;
var uuid = require('uuid');
var Debug = require('debug');
/**
 * A simple google cloud logging utility, that will send your logs to google
 * cloud log aggregation.
 *
 * @param object options
 * @param string options.name - DEBUG=prefix name to display when outputting
 * to console
 * @param string options.agent - Instance of googleapis jwt client
 * @param string options.project - cloud platform project ID
 * @param string options.logId - name that these logs will show up under
 * @param string options.clientEmail - google service account credential email
 * @param string options.privateKeyPath - path to the private key for the
 * cloud platform service account (.pem, .p12)
 * @param number options.interval=60000 - how often to send logs every this many
 * @param boolean verbose=false - log activity of this library?
 * miliseconds
 * @param boolean send=true - send the logs to google
 * @param object options.commonLabels - Applied to all log entries.
 *
 */
function GCloudLogger(options) {
    options = options || {};
    options.interval = options.interval || 60000;
    options.send = typeof options.send === 'undefined' ? true : options.send;
    var debug = Debug(options.name || options.logId);

    function addEntry(entry) {
        params.resource.entries.push(entry);
    }
    function doLog() {
        var pendingLogs = params.resource.entries.length;

        if (!self.jwtClient.isAuthenticated) {
            if (options.verbose) {
                debug('GCloudLogger: waiting on agent auth');
            }
        } else if (pendingLogs) {
            if (options.send) {
                if (options.verbose) {
                    debug('GCloudLogger about to send ' + pendingLogs);
                }
                params.auth = self.jwtClient;
                logging(params, function (err, data) {
                    if (err) {
                        debug('GCloudLogger Error', err);
                    } else if (options.verbose) {
                        debug('GCloudLogger sent ' + pendingLogs + ' logs.');
                    }
                });
            }
            params.resource.entries = [];
        } else if (options.verbose) {
            debug('GCloudLogger: No pending logs.');
        }
        setTimeout(doLog, options.interval);
    }
    var params = {
        projectsId: options.project,
        logsId: options.logId, // the name of the log
        resource: {
            entries: [],
        }
    };
    if (options.commonLabels) {
        params.resource.commonLabels = options.commonLabels;
    }

    var self = this;

    self._LEVELS = 'DEBUG INFO WARNING ERROR CRITICAL';


    self.log = function (data) {
        if (!data) return;

        var entry = {
            insertId: data.insertId || uuid.v4(), // unique ID for the log entry
            metadata: {
                labels: data.labels, // appears to do nothing
                userId: options.userId, // appears to do nothing
                timestamp: data.timestamp || new Date().toISOString(),
                region: options.region, // "us-central1"
                zone: options.zone, // "us-central1-f"
                serviceName: options.serviceName || 'compute.googleapis.com',
                // the log level
                severity: ~self._LEVELS.indexOf(data.level) ? data.level.toUpperCase() : undefined,
            }
        };
        delete data.timestamp;
        delete data.level;
        delete data.insertId;
        delete data.labels;
        for (var i in entry.metadata) {
            if (typeof entry.metadata[i] === 'undefined') {
                delete entry.metadata[i];
            }
        }
        debug(data);
        if (typeof data === 'string') {
            entry.textPayload = data;
        } else {
            entry.structPayload = data;
        }

        addEntry(entry);
    };
    self._LEVELS.split(' ').forEach(function (l) {
        self[l.toLowerCase()] = function (data) {
            data.level = l;
            self.log(data);
        };
    });

    // init

    var _user = null;
    var _scopes = ['https://www.googleapis.com/auth/logging.write'];

    if (options.agent) {
        self.jwtClient = options.agent;
        doLog();
    } else {

        self.jwtClient = new google.auth.JWT(
            options.clientEmail,
            options.privateKeyPath,
            null,
            _scopes,
            _user
        );

        self.jwtClient.authorize(function (err, tokens) {
            if (err) {
                debug('GCloudLogger failed to authenticate', err);
                return;
            }
            if (options.verbose) debug('GCloudLogger is authenticated');
            self.jwtClient.isAuthenticated = true;
            doLog();
        });
    }
}
module.exports = GCloudLogger;
