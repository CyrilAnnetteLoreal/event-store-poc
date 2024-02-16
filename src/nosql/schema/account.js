import { Schema } from 'mongoose';
import History from '../../eventstore/history.class.js';

const fields = {
  clientId: Number,
  balance: Number,
};
const schema = new Schema(fields);
const streamName = 'test_hooks';
const history = new History({ streamName, schema, entityName: 'Account' });

schema.pre('save', async function (next) {
  const type = this.isNew ? 'create' : 'update';
  await history.record(type, this);
  return next();
});

schema.pre('deleteOne', { document: true, query: false }, async function (next) {
  await history.record('delete', this);
  return next();
});

export default schema;