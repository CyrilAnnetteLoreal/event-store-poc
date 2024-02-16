import mongoClient from '../client.js'

import AccountSchema from '../schema/account.js';

const model = mongoClient.model('Account', AccountSchema);

const [, , dataAsJSON = { clientId: 1, mutation: 10 }, deleteMode = false] = process.argv;

const data = JSON.parse(dataAsJSON);

(async () => {
    const { clientId, mutation } = data;
    let account = await model.findOne({ clientId });

    if (deleteMode && !!account) {
        await account.deleteOne();
    } else {
        if (!account) // doesn't exist (yet)
            account = new model({ clientId, balance: 0 });
        account.balance += mutation;
        await account.save();
    }

    process.exit();
})()