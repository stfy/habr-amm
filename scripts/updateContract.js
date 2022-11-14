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

    const tx = TRANSACTIONS.UpdateContract.V4({
        fee,
        imageHash: "ec5c0ec4163bcd78d8317b4b18f13271a61fe555bfd66e56bb9136b7bb3fc2b7",
        image: "amm-example1:latest",
        contractId: '6AjT2SntNQm56d3DLHxnoXLB1StQWh1wFGqRzhq5wS51',
        validationPolicy: {type: "any"},
        senderPublicKey: await keyPair.publicKey(),
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


