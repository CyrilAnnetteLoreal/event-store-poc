import History from '../history.class.js';
import AccountSchema from '../../nosql/schema/account.js';


/*

Usage:
node rollback.js 10
=> to launch a rollback to the revision #10

*/

const [, , revision = 0] = process.argv;
const history = new History({streamName: 'test_hooks', schema: AccountSchema, entityName: 'Account'});

(async () => {
  try {
    await history.rollbackTo(revision, 'clientId');
    console.log('rollback complete');
    process.exit();

  } catch (e) {
    console.error(e);
  }
})();