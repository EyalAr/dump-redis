/**
 * Dump all Redis data to a json file.
 * Specify settings in rConf.js
 *
 * Usage:
 * 1. Set your configuration in rConf.js
 * 2. run `node dumpRedis.js`
 *
 * Why use an event emmiter?
 * -------------------------
 * This scrit dumps all the databases in a Redis server, possibly 16
 * or more. All redis calls are async, which means we cannot select the next
 * database before all queries for the current database are done.
 * This potentially creates a very long callbacks chain, with which we keep
 * track of when handling the current database is done, and when we are ready
 * to select the next one.
 * In order to prevent going too deep in the call stack, we use event emitters,
 * which simply register an event in the events queue when the next database
 * is ready to be processed. Thus starting a new call stack for every database.
 */

(function() {

    var redis = require('redis'),
        path = require('path'),
        events = require('events'),
        fs = require('fs'),
        rConf = require(path.resolve('rConf'));

    var client = redis.createClient(null || rConf.rPort, null || rConf.rHost),
        nextDBEmitter = new events.EventEmitter(),
        currDB = 0,
        result = {};

    var processDB = function(db, next) {

        client.select(db, function(err) {

            if (err) {

                console.log("Unable to select database", db, ":", err);

            } else {

                result[db] = {};

                client.keys('*', function(err, keys) {

                    if (err) {

                        console.log("Unable to get keys for database",
                            db, ":", err);

                    } else if (keys.length == 0) {

                        // database is empty

                        next();

                    } else {

                        // All redis calls are async, which means we have to
                        // wait for all queries in the current database to
                        // finish before we can select the next databse.
                        // we use the 'wait' variable as a semaphore - 
                        // everytime we put a callback in the queue for the
                        // current database, we increase 'wait', and when we
                        // handle the callback we decrease it. Eventually when
                        // all callbacks have been handled, wait is 0 and we can
                        // continue to the next database.

                        var wait = 0;

                        keys.forEach(function(key, i) {

                            wait++;

                            client.type(key, function(err, type) {

                                wait--;

                                if (err) {

                                    console.log("Unable to detect type of key",
                                        key, ":", err);

                                } else if (type == 'set') {

                                    result[db][key] = [];

                                    wait++;

                                    client.smembers(key, function(err, members) {

                                        wait--;

                                        if (err) {

                                            console.log("Unable to get members of set",
                                                key, ":", err);

                                        } else {

                                            members.forEach(function(member, i) {

                                                result[db][key].push(member);

                                            });

                                        }

                                        if (!wait) {

                                            // all callbacks have been handled,
                                            // continue to next database.

                                            next();

                                        }

                                    });

                                } else if (type == 'list') {

                                    // TODO

                                } else if (type == 'string') {

                                    wait++;

                                    client.get(key, function(err, value) {

                                        wait--;

                                        if (err) {

                                            console.log("Unable to get value for key",
                                                key, ":", err);

                                        } else {

                                            result[db][key] = value;

                                        }

                                        if (!wait) next();

                                    });

                                } else if (type == 'hash') {

                                    // TODO

                                } else if (type == 'zset') {

                                    // TODO (sorted set)

                                }


                            });

                        });

                    }

                });

            }

        });

    }

    var next = function() {

        if (currDB < rConf.databases.length - 1) {

            processDB(rConf.databases[currDB], function() {

                // when finished processing the current database, move to the
                // next one and emit the 'nextDB' event.

                currDB++;

                nextDBEmitter.emit('nextDB');

            });

        } else {

            // We are at the last database. When finished, close the Redis
            // client and write the results to the JSON file.

            processDB(rConf.databases[currDB], function() {

                client.quit();

                var data = JSON.stringify(result, null, rConf.jsonSpaces),
                    fPath = path.resolve(rConf.dumpFile, rConf.dumpDir);

                fs.writeFile(fPath, data + "\n", function(err) {

                    if (err) throw err;

                });

            });

        }

    }

    // Register the 'nextDB' event:
    nextDBEmitter.on('nextDB', next);

    if (rConf.rPass) {

        // Start the script by authorizing with Redis.
        client.auth(rConf.rPass, function(err) {

            if (err) {

                console.log("Unable to authorize. ", err);

            } else {

                // Authorization complete, emit the 'nextDB' event to invoke
                // the first run of the 'next' function.
                nextDBEmitter.emit('nextDB');

            }

        });

    } else {

        // No authorization needed. emit the 'nextDB' event to invoke
        // the first run of the 'next' function.
        nextDBEmitter.emit('nextDB');

    }

})();