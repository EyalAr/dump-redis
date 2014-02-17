# Dump Redis

Dump a Redis server to a JSON file.

## Usage

Specify your configuration in rConf.js and run:

    node dumpRedis.js

## Why

Sometimes when developing you need a convenient way to see your Redis data.

## Settings

Modify `rConf.js`.

* `rPass` - Redis server password.
* `rPort` - Port of the Redis server.
* `rHost` - Host for the Redis server.
* `dumpFile` - Name of the JSON file.
* `dumpDir` - The directory in which to write `dumpFile`.
* `jsonSpaces` - Number of spaces to indent the JSON file. Use 0 for no spaces.
* `databases` - An array of Redis databases to dump into the JSON file.

## Output

A JSON object with every key corresponds to a Redis database.

In each database object every key corresponds to a Redis key. Key values are
according to the Redis key type:

### String

Keys corresponding to Redis keys of type 'string' will have a Javascript string
as a value.

    {
        "0": {
            "key": "value"
        }
    }

### List

Keys corresponding to Redis keys of type 'list' will have a Javascript array as
a value.

    {
        "0": {
            "key": ["element 1", "element 2", ... ]
        }
    }

### Set

Keys corresponding to Redis keys of type 'set' will have a Javascript object as
a value; with each key of the object representing a set member, will have a
'true' value.

    {
        "0": {
            "key": {
                "member 1": true,
                "member 2": true,
                ...
            }
        }
    }

### Sorted Set

Keys corresponding to Redis keys of type 'zset' will have a Javascript object as
a value; with each key of the object representing a set member, will have the
member's score as a value (a floating point number).

    {
        "0": {
            "key": {
                "member 1": /* score */,
                "member 2": /* score */,
                ...
            }
        }
    }

### Hash

Keys corresponding to Redis keys of type 'hash' will have a Javascript object as
a value; with each key of the object representing a field of the hash, will
have the fields's value as a string.

    {
        "0": {
            "key": {
                "field 1": "value 1",
                "field 2": "value 2,
                ...
            }
        }
    }

## Dependencies

1. [NodeJS](http://nodejs.org/)
2. [Redis](http://redis.io/)
3. [node_redis](https://github.com/mranney/node_redis)
