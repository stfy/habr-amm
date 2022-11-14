const {We} = require("@wavesenterprise/sdk");
const {TRANSACTIONS} = require("@wavesenterprise/transactions-factory")
const {Keypair} = require("@wavesenterprise/signer")

const SEED_LOCAL = 'copper venture beauty snake wear million champion enact humor visa prepare garment party rapid annual'
const NODE_LOCAL = 'http://localhost:6862'

const sdk = new We(NODE_LOCAL);


//G4oiyA1gnfQ4eGRQeZd7YnQiayLjW8oLT51buAFn6gbu

async function deploy() {
    const config = await sdk.node.config();
    const fee = 0;
    const keyPair = await Keypair.fromExistingSeedPhrase(SEED_LOCAL);

    const tx = TRANSACTIONS.CallContract.V5({
        fee,
        contractId: '6AjT2SntNQm56d3DLHxnoXLB1StQWh1wFGqRzhq5wS51',
        senderPublicKey: await keyPair.publicKey(),
        params: [
            {
                key: 'action', value: 'swap', type: 'string'
            }
        ],
        payments: [
            {assetId: 'Hteuf5cn2zU6XLHNV225M4S3WdfgRfB1BMsGZZa6a2vc', amount: 100000},
        ],
        contractVersion: 18,
        atomicBadge: null,
        apiVersion: "1.0"
    });



    const signedTx = await sdk.signer.getSignedTx(tx, SEED_LOCAL);
    const sentTx = await sdk.broadcast(signedTx);
    console.log(JSON.stringify(sentTx));
}

deploy().then(() => {
    console.log("Success");
}).catch((err) => {

    console.error(JSON.stringify(err))
});


