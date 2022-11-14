import BN from 'bn.js';

export function dsub(a: number | BN, b: number | BN): BN {
    return new BN(a).sub(new BN(b));
}

export function dsum(a: number | BN, b: number | BN): BN {
    return new BN(a).add(new BN(b));
}

export function ddiv(a: number | BN, b: number | BN): BN {
    return new BN(a).div(new BN(b));
}

export function dmul(a: number | BN, b: number | BN): BN {
    return new BN(a).mul(new BN(b));
}

export const sqrt = (num: BN): BN => {
    if (num.lt(new BN(0))) {
        throw new Error("Sqrt only works on non-negtiave inputs")
    }
    if (num.lt(new BN(2))) {
        return num
    }

    const smallCand = sqrt(num.shrn(2)).shln(1)
    const largeCand = smallCand.add(new BN(1))

    if (largeCand.mul(largeCand).gt(num)) {
        return smallCand
    } else {
        return largeCand
    }
}