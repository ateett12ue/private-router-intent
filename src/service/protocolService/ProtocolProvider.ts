import { IProtocolProvider } from "../protocolService/IProtocolProvider";
import { Protocols } from "../../constant/ProtocolEnum";
import DefaultAdapter from "../protocolService/Protocols/DefaultProtocol";
import { IProtocol } from "../protocolService/Protocols/IProtocol";
import StaderProtocol from "../protocolService/Protocols/Stader/index";
import LidoProtocol from "../protocolService/Protocols/Lido";
import AerodromeProtocol from "../protocolService/Protocols/Aerodrome";
import BenqiProtocol from "./Protocols/Benqi";
import ParifiProtocol from "./Protocols/Parifi";
import VelocoreProtocol from "./Protocols/Velocore";
import StakeStoneProtocol from "./Protocols/StakeStone";
import KimProtocol from "./Protocols/Kim";
import SwapmodeProtocol from "./Protocols/Swapmode";
import BaseSwapProtocol from "./Protocols/BaseSwap";
import LynexProtocol from "./Protocols/Lynex";
import ThrusterProtocol from "./Protocols/Thruster";
import ThirdfyProtocol from "./Protocols/ThirdFy";
class ProtocolProvider implements IProtocolProvider
{
    private map: { [id: string]: IProtocol };

    constructor()
    {
        this.map = {};
        this.map[Protocols.NONE] = new DefaultAdapter();
        this.map[Protocols.DEFAULT] = new DefaultAdapter();
        this.map[Protocols.STADER] = new StaderProtocol();
        this.map[Protocols.LIDO] = new LidoProtocol();
        this.map[Protocols.AERODROME] = new AerodromeProtocol();
        this.map[Protocols.BENQI] = new BenqiProtocol();
        this.map[Protocols.PARIFI] = new ParifiProtocol();
        this.map[Protocols.VELOCORE] = new VelocoreProtocol();
        this.map[Protocols.STAKESTONE] = new StakeStoneProtocol();
        this.map[Protocols.KIM] = new KimProtocol();
        this.map[Protocols.SWAPMODE] = new SwapmodeProtocol();
        this.map[Protocols.BASESWAP] = new BaseSwapProtocol();
        this.map[Protocols.LYNEX] = new LynexProtocol();
        this.map[Protocols.THRUSTER] = new ThrusterProtocol();
        this.map[Protocols.THIRDFY] = new ThirdfyProtocol();
    }

    GetProtocol(adapterId: string): any
    {
        const provider = this.map[adapterId];
        if (!provider)
        {
            throw "protocol not found";
        }
        return provider;
    }
}

export const protocolProvider = new ProtocolProvider();
