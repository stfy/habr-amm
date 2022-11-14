import {initContract} from "@wavesenterprise/contract-core";

initContract({
    contractPath: './src/Amm'
})
.then(() => {
    console.log('contract started');
})