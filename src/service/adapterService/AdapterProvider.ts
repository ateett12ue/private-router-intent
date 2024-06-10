import { IAdapterProvider } from "./IAdapterProvider";
import { Adapters } from "../../constant/AdaptersEnum";
import DefaultAdapter from "./Adapters/DefaultAdapter";
import { IAdapter } from "./Adapters/IAdapter";
import StaderStakeAdapter from "./Adapters/stake/Stader/stake";
import LidoStakeAdapter from "./Adapters/stake/Lido/stake";
import LidoCanonicalAdapter from "./Adapters/bridge/CanonicalBridge";
import BenqiStakeAdapter from "./Adapters/stake/Benqi/stake";
import MetapoolStakeAdapter from "./Adapters/stake/Metapool/stake";
import SwellStakeAdapter from "./Adapters/stake/Swell/stake";
import ForwarderAdapter from "./Adapters/bridge/Forwarder";
import DexspanSwapAdapter from "./Adapters/swap/Dexspan";
import StaderUnstake from "./Adapters/stake/Stader/unstake";
import StaderClaim from "./Adapters/stake/Stader/claim";
import AerodromeDeposit from "./Adapters/amm/aerodrome/deposit";
import ParifiDeposit from "./Adapters/perps/parifi/deposit";
import VelocoreDeposit from "./Adapters/amm/velocore/deposit";
import StakeStoneStake from "./Adapters/stake/Stakestone/stake";
import VelocoreStakeAdapter from "./Adapters/amm/velocore/stake";
import ParifiOpenPosition from "./Adapters/perps/parifi/openPosition";
import KimV4Deposit from "./Adapters/amm/kim/v4_deposit";
import KimV2Deposit from "./Adapters/amm/kim/v2_deposit";
import SwapmodeV3Deposit from "./Adapters/amm/swapmode/v3_deposit";
import SwapmodeV2Deposit from "./Adapters/amm/swapmode/v2_deposit";
import BaseSwapV3Deposit from "./Adapters/amm/BaseSwap/base_swap_deposit";
import LynexV2Deposit from "./Adapters/amm/lynex/v2_deposit";
import ThrusterV3Deposit from "./Adapters/amm/thruster/v3_deposit";
import ThrusterV2Deposit from "./Adapters/amm/thruster/v2_deposit";
import ThirdfyDeposit from "./Adapters/amm/thirdFy/third_fy_deposit";
import ThirdfySwap from "./Adapters/swap/ThirdFySwap";
import AssetBridge from "./Adapters/bridge/AssetBridge";

import LynexStake from "./Adapters/amm/lynex/stake";
class AdapterProvider implements IAdapterProvider
{
    private map: { [id: string]: IAdapter };

    constructor()
    {
        this.map = {};
        this.map[Adapters.NONE] = new DefaultAdapter();
        this.map[Adapters.DEFAULT] = new DefaultAdapter();
        this.map[Adapters.STADERSTAKE] = new StaderStakeAdapter();
        this.map[Adapters.DEXSPANSWAP] = new DexspanSwapAdapter();
        this.map[Adapters.FORWARDERBRIDGE] = new ForwarderAdapter();
        this.map[Adapters.LIDOSTAKE] = new LidoStakeAdapter();
        this.map[Adapters.LIDO_CANONICAL_BRIDGE] = new LidoCanonicalAdapter();
        this.map[Adapters.BENQISTAKE] = new BenqiStakeAdapter();
        this.map[Adapters.METAPOOLSTAKE] = new MetapoolStakeAdapter();
        this.map[Adapters.SWELLSTAKE] = new SwellStakeAdapter();
        this.map[Adapters.STADERUNSTAKE] = new StaderUnstake();
        this.map[Adapters.STADERCLAIM] = new StaderClaim();
        this.map[Adapters.AERODROMEDEPOSIT] = new AerodromeDeposit();
        this.map[Adapters.PARIFIDEPOSIT] = new ParifiDeposit();
        this.map[Adapters.VELOCOREDEPOSIT] = new VelocoreDeposit();
        this.map[Adapters.STAKESTONE_STAKE] = new StakeStoneStake();
        this.map[Adapters.STAKESTONE_CANONICAL_BRIDGE] = new LidoCanonicalAdapter();
        this.map[Adapters.VELOCORESTAKE] = new VelocoreStakeAdapter();
        this.map[Adapters.PARIFIOPENPOSITION] = new ParifiOpenPosition();
        this.map[Adapters.KIMDEPOSITV4] = new KimV4Deposit();
        this.map[Adapters.KIMDEPOSITV2] = new KimV2Deposit();
        this.map[Adapters.SWAPMODEDEPOSITV3] = new SwapmodeV3Deposit();
        this.map[Adapters.SWAPMODEDEPOSITV2] = new SwapmodeV2Deposit();
        this.map[Adapters.BASESWAPDEPOSITV3] = new BaseSwapV3Deposit();
        this.map[Adapters.LYNEXDEPOSITV2] = new LynexV2Deposit();
        this.map[Adapters.THRUSTERDEPOSITV2] = new ThrusterV2Deposit();
        this.map[Adapters.THRUSTERDEPOSITV3] = new ThrusterV3Deposit();
        this.map[Adapters.THIRDFYDEPOSIT] = new ThirdfyDeposit();
        this.map[Adapters.THIRDFYSWAP] = new ThirdfySwap();
        this.map[Adapters.ASSETBRIDGE] = new AssetBridge();
        this.map[Adapters.LYNEXSTAKE] = new LynexStake();
    }

    GetAdapter(adapterId: string): any
    {
        const provider = this.map[adapterId];
        if (!provider)
        {
            throw "adapter not found";
        }
        return provider;
    }
}

export const adapterProvider = new AdapterProvider();
