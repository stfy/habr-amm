const {We} = require("@wavesenterprise/sdk");
const {TRANSACTIONS, TRANSACTION_TYPES} = require("@wavesenterprise/transactions-factory")
const {Keypair} = require("@wavesenterprise/signer")

const SEED_LOCAL = 'copper venture beauty snake wear million champion enact humor visa prepare garment party rapid annual'
const NODE_LOCAL = 'http://localhost:6862'

const sdk = new We(NODE_LOCAL);

async function issue() {
    const config = await sdk.node.config();
    const fee = config[TRANSACTION_TYPES.Issue];
    const keyPair = await Keypair.fromExistingSeedPhrase(SEED_LOCAL);

    const tx = TRANSACTIONS.Issue.V2({
        fee: fee,
        reissuable: false,
        quantity: 10000000000,
        decimals: 6,
        name: "Habr Token",
        description: "Habr Token",
        amount: 10000000000,
        senderPublicKey: await keyPair.publicKey()
    })

    const signedTx = await sdk.signer.getSignedTx(tx, SEED_LOCAL);
    const sentTx = await sdk.broadcast(signedTx);

    console.log('Token successffully issued')
}

issue()
    .then(console.log)
    .catch(console.error);
