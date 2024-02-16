import { createEvent, readBackwardsTo } from './client.js'
import mongoClient from '../nosql/client.js';

export default class History {
  constructor({
    streamName,
    schema,
    entityName,
  }) {
    this.streamName = streamName;
    this.schema = schema;
    this.entityName = entityName;
  }

  getDataFromDoc(doc) {
    return Object.keys(this.schema.obj).reduce((acc, cur) => {
      acc[cur] = doc[cur];
      return acc;
    }, {});
  }

  async record(type, data) {
    const eventParams = {
      streamName: this.streamName,
      content: {
        type,
        data,
      }
    };
    await createEvent(eventParams);
  }

  async rollbackTo(revision, primaryKey = 'id') {
    const docModel = await mongoClient.model(this.entityName, this.schema);
    const events = await readBackwardsTo({
      streamName: this.streamName,
      revision,
    });

    const actions = events.reduce((acc, cur) => {
      const { event } = cur;
      const { type, data } = event;

      const id = data[primaryKey];
      switch (type) {
        case 'update': // update doc
        case 'delete': // revert deletion = restore doc
          acc[id] = {};
          for (const attr in data) {
            acc[id][attr] = data[attr];
          }
          break;

        case 'create': // revert creation = delete doc
          acc[id] = 'toDelete';
          break;
      }
      return acc;
    }, {});


    for (const entries of Object.entries(actions)) {
      const [id, data] = entries;
      const search = { [primaryKey]: id };
      let doc = await docModel.findOne(search);
      if (!doc) // doesn't exist (yet)
        doc = new docModel({ ...data });

      /* update */
      if (data !== 'toDelete') {
        for (const attr in data) {
          doc[attr] = data[attr];
        }
        await doc.save();
      }
      /* delete */
      else {
        await doc.deleteOne();
      }
    }

    return 0;
  }
}