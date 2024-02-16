
import config from '../config/eventStore.config.json' assert { type: 'json' };;
import {
  EventStoreDBClient,

  jsonEvent,
  FORWARDS,
  BACKWARDS,
  START,
  END,
} from "@eventstore/db-client";
import all from 'it-all';


const client = new EventStoreDBClient(
  config.connectionSettings,
  config.channelCredentials,
);

const DEFAULT_STREAM_NAME = 'default_stream';

export async function getEvents({ streamName = DEFAULT_STREAM_NAME,
  offset = START,
  limit = 10,
  sort = FORWARDS
} = {}) {
  const events = await client.readStream(streamName, {
    fromRevision: offset,
    maxCount: limit,
    direction: sort,
  });

  return events;
}

export async function createEvent({ streamName = DEFAULT_STREAM_NAME, content } = {}) {
  const event = jsonEvent({
    ...content
  });

  const appendResult = await client.appendToStream(streamName, [event]);

  return appendResult;
}

export async function readBackwardsFrom({ streamName = DEFAULT_STREAM_NAME, revision = END, limit = 10 }) {
  const events = client.readStream(streamName, {
    direction: BACKWARDS,
    fromRevision: revision,
    maxCount: limit,
  });

  const eventsAsArray = await all(events);
  return eventsAsArray;
}

export async function readBackwardsTo({ streamName = DEFAULT_STREAM_NAME, revision = 1 }) {
  const readLastEvent = client.readStream(streamName, {
    direction: BACKWARDS,
    fromRevision: END,
    maxCount: 1,
  });

  const lastRevision = Number((await all(readLastEvent))[0].event.revision);
  const limit = lastRevision - revision + 1

  return readBackwardsFrom({ streamName, revision: END, limit });
}

export default client;
