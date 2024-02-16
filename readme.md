# About this

This project is a Proof of Concept involving a MongoDB database linked to a event store for history tracking and rollback mechanism.

The project is what could be summarized as a very basic bank application. With each user having a client ID to identify them and a "balance", indicating their current amount of money/credits.

# Requirements

1. Download and install [eventStoreDB](https://www.eventstore.com/downloads)
2. Download and install [MongoDB](https://www.mongodb.com/docs/manual/installation/)
3. Install the lastest version of Node.js
4. Install pnpm: `npm i -g pnpm`
5. Perform a `pnpm i` in the main repository
6. Start the event store: `sudo eventstored --dev --insecure` (on Linux)

# Usage

## Simulate a query

```bash
node src/nosql/bin/update.js '{ "clientId": 1, "mutation": 10 }'
```

This will create an upsert query with the data `{ "clientId": 1, "mutation": 10 }` in the database AND track it in the event store

It's also possible to remove an entry by appending the statement with `true`.
eg:
```bash
node src/nosql/bin/update.js '{ "clientId": 1, "mutation": 10 }' true
```
This will remove the entry with the clientId 1

## Perform a rollback

```bash
node src/eventstore/bin/rollback.js 10
```

Where `10` is the version you wish to rollback to in the EventStoreDB

After a local installation of EventStoreDB, the events and streams can be checked here: http://localhost:2113/