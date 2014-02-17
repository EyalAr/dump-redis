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

## Dependencies

1. [NodeJS][http://nodejs.org/]
2. [Redis][http://redis.io/]
3. [node_redis][https://github.com/mranney/node_redis]

## Issues

Only Redis sets are dumped.
Still need to implement lists, hashes, strings and sorted sets.