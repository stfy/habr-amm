import {
    Action,
    Asset,
    AttachedPayments,
    Contract,
    Ctx,
    Logger,
    Param,
    Payments,
    preload,
    TVar,
    Var
} from "@wavesenterprise/contract-core";
import BN from 'bn.js';
import {ContractError, ExecutionContext} from "@wavesenterprise/contract-core/dist/execution";
import * as MathUtils from './MathUtils';
import * as Math from './MathUtils';

const DECIMALS = 10 ** 6;

@Contract()
export default class AMM {
    logger = new Logger();

    // Amm State
    @Var() reserve0: TVar<number>;
    @Var() reserve1: TVar<number>;
    @Var() totalSupply: TVar<number>;

    // Amm Config
    @Var() asset0: TVar<string>;
    @Var() asset1: TVar<string>;
    @Var() feeRate: TVar<number>; // 6 decimals
    @Var() lpAssetId: TVar<string>;

    @Action({onInit: true})
    async _contructor(
        @Param('asset0') asset0: string,
        @Param('asset1') asset1: string,
        @Param('feeRate') feeRate: number,
    ) {
        this.feeRate.set(feeRate);
        this.asset0.set(asset0);
        this.asset1.set(asset1);

        this.totalSupply.set(0);
        this.reserve0.set(0);
        this.reserve1.set(0);
    }


    @Action
    async addLiquidity(
        @Payments payments: AttachedPayments,
        @Ctx ctx: ExecutionContext
    ) {
        const [
            reserve0,
            reserve1,
            totalSupply
        ] = await preload(this, ['reserve0', 'reserve1', 'totalSupply']) as [number, number, number]

        const amountIn0 = payments[0].amount;
        const amountIn1 = payments[1].amount;

        if (reserve0 > 0 || reserve1 > 0) {
            assert(
                MathUtils.dmul(amountIn1.toNumber(), reserve0).eq(MathUtils.dmul(amountIn0.toNumber(), reserve1)),
                "Providing liquidity rebalances pool"
            )
        }

        let shares: BN;

        if (totalSupply === 0) {
            shares = MathUtils.sqrt(amountIn0.mul(amountIn1))
        } else {
            shares = BN.min(
                MathUtils.ddiv(
                    MathUtils.dmul(amountIn0, totalSupply),
                    reserve0
                ),
                MathUtils.ddiv(
                    MathUtils.dmul(amountIn1, totalSupply),
                    reserve1
                ),
            );
        }

        assert(!shares.isZero(), 'issued lp tokens should > 0')

        await this.mint(shares, ctx.tx.sender);

        this.logger.info('Update reserves');
        this.reserve0.set(MathUtils.dsum(amountIn0, reserve0).toNumber())
        this.reserve1.set(MathUtils.dsum(amountIn1, reserve1).toNumber())
        this.totalSupply.set(MathUtils.dsum(shares, totalSupply).toNumber())
    }

    private async mint(qty: BN, recipient: string) {
        let assetId = await this.lpAssetId.get()
        let LPAsset: Asset;

        if (!assetId) {
            LPAsset = await Asset.new()

            LPAsset.issue(
                'Habr/Rbah-LP',
                'HabrAMM Habr/Rbah LP Shares',
                qty.toNumber(),
                8,
                true
            )

            this.lpAssetId.set(LPAsset.getId());
        } else {
            LPAsset = Asset.from(assetId);

            LPAsset.reissue(qty.toNumber(), true)
        }

        LPAsset.transfer(recipient, qty.toNumber())
    }

    @Action()
    async swap(
        @Payments payments: AttachedPayments,
        @Ctx ctx: ExecutionContext
    ) {
        const [feeRate, asset0, asset1] = await preload(
            this,
            ['feeRate', 'asset0', 'asset1', 'reserve0', 'reserve1']
        );

        const from = payments[0];

        assert(from, 'Payment required!')
        assert(
            asset0 === from.assetId || asset1 === from.assetId,
            `Attached payment should be only of ${asset0} or ${asset1}`
        )

        let [tokenOut, reserveIn, reserveOut] = asset0 === from.assetId
            ? [asset1, this.reserve0, this.reserve1]
            : [asset0, this.reserve1, this.reserve0]

        const fee = from.amount.muln(feeRate / DECIMALS);

        const amountInWithFee = from.amount.sub(fee);

        const reserveOutV = await reserveOut.get()
        const reserveInV = await reserveIn.get()

        const reserveInAfter = MathUtils.dsum(reserveInV, amountInWithFee.toNumber());

        const amountOut = Math.dmul(amountInWithFee, reserveOutV).div(reserveInAfter);
        const reserveOutAfter = MathUtils.dsub(reserveOutV, amountOut)

        reserveIn.set(reserveInAfter.toNumber());
        reserveOut.set(reserveOutAfter.toNumber());

        Asset.from(tokenOut).transfer(ctx.tx.sender, amountOut.toNumber())
    }
}

function assert(cond, err) {
    if (!cond) {
        throw new ContractError(err)
    }
}



