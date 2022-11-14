const {We} = require("@wavesenterprise/sdk");
const {TRANSACTIONS, TRANSACTION_TYPES} = require("@wavesenterprise/transactions-factory")
const {Keypair} = require("@wavesenterprise/signer")

const SEED_LOCAL = 'copper venture beauty snake wear million champion enact humor visa prepare garment party rapid annual'
const NODE_LOCAL = 'http://localhost:6862'

const sdk = new We(NODE_LOCAL);


//G4oiyA1gnfQ4eGRQeZd7YnQiayLjW8oLT51buAFn6gbu

async function deploy() {
    const config = await sdk.node.config();
    const fee = config[TRANSACTION_TYPES];
    const keyPair = await Keypair.fromExistingSeedPhrase(SEED_LOCAL);

    const tx = TRANSACTIONS.CreateContract.V5({
        fee,
        imageHash: "ec5c0ec4163bcd78d8317b4b18f13271a61fe555bfd66e56bb9136b7bb3fc2b7",
        image: "habr-amm:latest",
        validationPolicy: {type: "any"},
        senderPublicKey: await keyPair.publicKey(),
        params: [
            {
                key: 'asset0',
                type: 'string',
                value: '8nAvDr6rVGNn4HVvv1f6ovmopbq2otSoPWtaK5Eogr9A'
            },
            {
                key: 'asset1',
                type: 'string',
                value: 'Hteuf5cn2zU6XLHNV225M4S3WdfgRfB1BMsGZZa6a2vc'
            },
            {
                key: 'feeRate',
                type: 'integer',
                value: 30000
            }
        ],
        payments: [],
        contractName: "HabrAMM",
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


