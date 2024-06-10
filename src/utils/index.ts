import { erc20Abi } from "../abis/ERC20";
import BigNumber from "bignumber.js";
import { TokenDecimalJson } from "../constant/tokenDecimal";
import { rpcMapper } from "../rpcMapper";
import { ethers } from "ethers";
import { assetForwarderAbi } from "../abis/AssetForwarder";
import { QuoteResponse } from "../serviceclients/pathFinderApi/pathfinderApi";
import * as _ from "lodash";
import { IntentBatchTransactionContract } from "../constant/contractMapping";
import { GeneralFilters } from "../service/models/DbModels";
import { TokenData } from "../service/models/CommonModels";
import { NATIVE, NativTokenMapping, WrappedNativeMapping } from "../constant/contractMapping";
import { BatchTransactionHandlerAbi } from "../abis/BatchTransHandlerAdapter";
import { resolve } from "bluebird";
import { MainnetConfigs, TestnetConfigs } from "../constant/ChainIdsEnum";
const abiCoder = ethers.AbiCoder.defaultAbiCoder();
import { service as mainnetPathFinder, QuoteParams } from "../serviceclients/sequencerApi/mainnet";
import { service as testnetPathFinder } from "../serviceclients/sequencerApi/testnet";
import { gasLimitMapping } from "../constant/EncodingParamsData";
import { RESERVED_TOKENS } from "../constant/contractMapping";
export interface nitroEncodeDataParams
{
    partnerId: string;
    destChainIdBytes: string;
    destRecipient: string;
    srcToken: string;
    srcAmt: string;
    destAmt: string;
    destToken: string;
}

export interface TokenAllowanceParams
{
    sourceToken: TokenData;
    sourceChainId: number;
    sender: string;
    allowanceTo: string;
    allowanceToName: string;
    sourceAmount: string;
}

export interface PrioritySteps
{
    contractAddress?: string;
    instructionData: string;
    instructionTitle?: string;
    value: number;
    data?: any;
    chainId: string;
}

export const MAX_UINT_256 = ethers.MaxUint256;
export const formatException = (e: any) =>
{
    if (e instanceof Error)
    {
        return e;
    }
    else if (typeof e === "object")
    {
        return JSON.stringify(e);
    }
    else if (typeof e === "string")
    {
        return e;
    }
    else
    {
        return "Undefined Error Type";
    }
};

export const abiEncode = (types: any[], values: any[]) =>
{
    const res = abiCoder.encode(types, values);
    return res;
};

export const abiDecode = (types: string[], values: string) =>
{
    const res = abiCoder.decode(types, values);
    return res;
};

export const calculateUnitAmt = async (
    buyAmount: any,
    buyTokenAddress: string,
    sellAmt: any,
    chainId: number,
    buyTokenDecimal?: number
) =>
{
    const buyTokenDecimals = await getTokenDecimal(buyTokenAddress, chainId);
    const buyTokenAmountRes = new BigNumber(buyAmount)
        .dividedBy(new BigNumber(10).pow(Number(buyTokenDecimals)))
        .toFixed(8);

    let unitAmt: any = new BigNumber(buyTokenAmountRes).dividedBy(new BigNumber(sellAmt));

    unitAmt = unitAmt.multipliedBy((100 - 1) / 100);
    unitAmt = unitAmt.multipliedBy(1e18).toFixed(0);
    return unitAmt;
};

export const getTokenDecimal = async (address: string, chainId: number) =>
{
    let decimal = TokenDecimalJson[address as keyof typeof TokenDecimalJson];
    if (!decimal)
    {
        try
        {
            const rpcArray = rpcMapper[String(chainId) as keyof typeof rpcMapper].rpc;
            let providerStatus = false;
            let provider;
            let i = 0;
            while (!providerStatus && i < rpcArray.length)
            {
                provider = new ethers.JsonRpcProvider(rpcArray[0]);
                const block = await provider.getBlockNumber();
                if (block > 0)
                {
                    providerStatus = true;
                }
                i++;
            }
            const tokenContract = new ethers.Contract(address, erc20Abi.abi, provider);
            const network = await provider.getNetwork();
            const tokenDecimal = await tokenContract.decimals();
            decimal = parseInt(tokenDecimal);
        }
        catch (ex)
        {
            decimal = 18;
        }
    }
    return decimal;
};

export const getContract = async (abi: any, address: string, chainId: number) =>
{
    const rpcArray = rpcMapper[String(chainId) as keyof typeof rpcMapper].rpc;
    let providerStatus = false;
    let provider;
    let i = 0;
    while (!providerStatus && i < rpcArray.length)
    {
        provider = new ethers.JsonRpcProvider(rpcArray[i]);
        const block = await provider.getBlockNumber();
        if (block > 0)
        {
            providerStatus = true;
        }
        i++;
    }
    const contract = new ethers.Contract(address, abi, provider);
    return contract;
};

export const getProvider = async (chainId: number) =>
{
    const rpcArray = rpcMapper[String(chainId) as keyof typeof rpcMapper].rpc;
    let providerStatus = false;
    let provider;
    let i = 0;
    while (!providerStatus && i < rpcArray.length)
    {
        provider = new ethers.JsonRpcProvider(rpcArray[i]);
        const block = await provider.getBlockNumber();
        if (block > 0)
        {
            providerStatus = true;
        }
        i++;
    }
    return provider;
};

export const getNitroEncodedValue = async (data: nitroEncodeDataParams) =>
{
    const iface = new ethers.Interface(assetForwarderAbi);
    const response = iface.encodeFunctionData("iDeposit", [
        data.partnerId,
        data.destChainIdBytes,
        data.destRecipient,
        data.srcToken,
        data.srcAmt,
        data.destAmt,
        data.destToken
    ]);
    return response;
};

export const getEncodedFunctionValue = (
    abi: any,
    functionName: string,
    args: Array<any>
): string =>
{
    // const argArray = Object.entries(args);
    // const abi = abiName == "aaveV3LendingAdapter" ? aaveV3LendingAdapter : aaveV3Pool
    const iface = new ethers.Interface(abi);
    const response = iface.encodeFunctionData(functionName, args);
    return response;
};

export const getEncodedPathfinderData = (
    fromToken: string,
    toToken: string,
    amount: number | string,
    params: QuoteResponse
) =>
{
    const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    // destination tokens

    const newA = params.source?.path;
    if (toToken === ETH)
    {
        newA[newA.length - 1] = ETH;
    }
    if (fromToken === ETH)
    {
        newA[0] = ETH;
    }
    // token == Eth
    // newA[0] = ETH;
    const quoteEncoded = abiEncode(
        ["address[]", "uint256", "uint256", "uint256[]", "bytes[]"],
        [newA, amount, "0", params?.source?.flags, params?.source?.dataTx]
    );
    return quoteEncoded;
};
export const isTokenAddressETH = (tokenAddress: string) =>
{
    return (
        tokenAddress.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee".toLowerCase()
    );
};

export const areTokensEqual = (tokenA: string, tokenB: string): boolean =>
{
    return tokenA.toLowerCase() === tokenB.toLowerCase();
};

export const formatEther = (amount: string, decimal: number) =>
{
    return ethers.formatUnits(amount, decimal);
};

export const parseAmount = (amount: string, decimal: number) =>
{
    return ethers.parseUnits(amount, decimal);
};
export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export const GetBatchHandlerAddress = (chainId: number) =>
{
    return IntentBatchTransactionContract[chainId];
};

export const GetAllowanceStep = async (data: TokenAllowanceParams) =>
{
    try
    {
        const sourceTokenContract = await getContract(
            erc20Abi.abi,
            data.sourceToken.address,
            data.sourceChainId
        );
        const allowance = await sourceTokenContract.allowance(data.sender, data.allowanceTo);
        if (allowance < BigInt(data.sourceAmount))
        {
            const allowanceData = {
                spender: data.allowanceTo,
                amount: data.sourceAmount
            };
            const encodedCallData = getEncodedFunctionValue(erc20Abi.abi, "approve", [
                allowanceData.spender,
                allowanceData.amount
            ]);
            const response: PrioritySteps = {
                contractAddress: data.sourceToken.address,
                data: encodedCallData,
                value: 0,
                instructionData: `Approve ${data.sourceToken.symbol} for ${data.allowanceToName}`,
                instructionTitle: `Approve ${data.sourceToken.symbol}`,
                chainId: String(data.sourceChainId)
            };
            return response;
        }
    }
    catch (ex)
    {
        throw ex;
    }
};

export function convertToMongooseFilters(filters: GeneralFilters): Record<string, any>
{
    const mongooseFilters: Record<string, any> = {};

    for (const key in filters)
    {
        if (Object.prototype.hasOwnProperty.call(filters, key))
        {
            const filter = filters[key];
            if (!filter) continue;

            mongooseFilters[key] = {};
            if (filter.eq !== undefined) mongooseFilters[key] = filter.eq;
            if (filter.gt !== undefined) mongooseFilters[key].$gt = filter.gt;
            if (filter.lt !== undefined) mongooseFilters[key].$lt = filter.lt;
            if (filter.gte !== undefined) mongooseFilters[key].$gte = filter.gte;
            if (filter.lte !== undefined) mongooseFilters[key].$lte = filter.lte;
            if (filter.in !== undefined) mongooseFilters[key].$in = filter.in;
            if (filter.nin !== undefined) mongooseFilters[key].$nin = filter.nin;
        }
    }

    return mongooseFilters;
}

export const estimateGasPrice = async (
    address: string,
    data: string,
    value: string,
    chainId: number,
    from: string
) =>
{
    try
    {
        const provider = await getProvider(chainId);
        let gasAmount;
        try
        {
            gasAmount = await provider.estimateGas({
                to: address,
                value: value,
                data: data,
                from: from
            });
            return gasAmount;
        }
        catch (ex)
        {
            gasAmount = await provider.estimateGas({
                to: address,
                value: value ? value : ethers.parseEther("0.01"),
                from: from
            });
        }
        // const feeData = await provider.getFeeData();
        let feeData;
        try
        {
            feeData = await provider.getFeeData();
        }
        catch (ex)
        {
            feeData = { gasPrice: 100n };
        }

        const gasFee = feeData.gasPrice;
        const gas = gasAmount * gasFee;
        return gas;
    }
    catch (ex)
    {
        throw ex;
    }
};

export const estimateGasLimit = async (chainId: number) =>
{
    try
    {
        let gasLimit = gasLimitMapping[chainId];
        if (!gasLimit)
        {
            gasLimit = 900000;
        }
        return gasLimit;
    }
    catch (ex)
    {
        throw ex;
    }
};

export const getTransactionTime = async (chainId: number) =>
{
    try
    {
        const provider = await getProvider(chainId);
        const span = 10;
        const times = [];
        const currentNumber = await provider.getBlockNumber();
        const firstBlock = await provider.getBlock(currentNumber - span);
        let prevTimestamp = firstBlock.timestamp;

        for (let i = currentNumber - span + 1; i <= currentNumber; i++)
        {
            const block = await provider.getBlock(i);
            const time = block.timestamp - prevTimestamp;
            prevTimestamp = block.timestamp;
            times.push(time);
        }

        return Math.round(times.reduce((a, b) => a + b) / times.length);
    }
    catch (ex)
    {
        throw ex;
    }
};

export const checkPathForNativeToken = async (
    toTokenAddress: string,
    fromTokenAddress: string,
    sourceChain: number,
    destChain: number,
    path: Array<string>
) =>
{
    if (
        toTokenAddress.toLowerCase() === NATIVE.toLowerCase() &&
        Number(sourceChain) === Number(destChain)
    )
    {
        path[path.length - 1] = NATIVE.toLowerCase();
    }

    if (fromTokenAddress.toLowerCase() === NATIVE.toLowerCase())
    {
        path[0] = NATIVE;
    }

    return path;
};

export const getTokenSummary = async (token: TokenData) =>
{
    return {
        decimals: token?.decimals,
        name: token?.name,
        chainId: token?.chainId,
        address: token?.address
    };
};

export const calculateSlippage = (amount: any, slippage: string, scale = 1) =>
{
    try
    {
        let newAmount: any = new BigNumber(amount);
        newAmount = newAmount
            .multipliedBy(100 * scale - Math.floor(parseFloat(String(slippage)) * scale))
            .dividedBy(100 * scale)
            .toFixed(0);

        const minReturn = Math.round((Number(amount) * (100 - Number(slippage))) / 100).toString();
        const x = parseFloat(minReturn);
        const bigIntValue = BigInt(x);
        return bigIntValue.toString();
    }
    catch (e)
    {
        throw "Slippage error";
    }
};

export function isTokenNativeOrWrapped(chainId: number, token: string)
{
    const nativeToken = NativTokenMapping[chainId].address;

    const wnativeToken = WrappedNativeMapping[chainId].address;

    if (nativeToken == null || wnativeToken == null)
        throw Error("Can't find native token for " + chainId);

    if (
        nativeToken.toLowerCase() == token.toLowerCase() ||
        wnativeToken.toLowerCase() == token.toLowerCase()
    )
    {
        return true;
    }

    return false;
}

export async function getDexspanMappedAddress(chainId: number)
{
    try
    {
        const batchHandlerAddress = GetBatchHandlerAddress(chainId);
        if (!batchHandlerAddress)
        {
            resolve("");
        }
        const batchContract = await getContract(
            BatchTransactionHandlerAbi,
            batchHandlerAddress,
            chainId
        );

        const dexspanAddress = await batchContract.dexspan();
        return dexspanAddress;
    }
    catch (ex)
    {
        throw ex;
    }
}

export async function getForwarderMappedAddress(chainId: number)
{
    try
    {
        const batchHandlerAddress = GetBatchHandlerAddress(chainId);
        if (!batchHandlerAddress)
        {
            resolve("");
        }
        const batchContract = await getContract(
            BatchTransactionHandlerAbi,
            batchHandlerAddress,
            chainId
        );

        const assetAddress = await batchContract.assetForwarder();
        return assetAddress;
    }
    catch (ex)
    {
        throw ex;
    }
}

export function isMainnet(chainId: number)
{
    const isMainnet = MainnetConfigs.includes(Number(chainId));
    if (isMainnet)
    {
        return true;
    }
    else
    {
        return false;
    }
}

export function sortTokens(tokenA: TokenData, tokenB: TokenData)
{
    if (tokenA.address == tokenB.address && tokenA.chainId == tokenB.chainId)
        throw "same token pair sent";
    const [token0, token1] = tokenA.address < tokenB.address ? [tokenA, tokenB] : [tokenB, tokenA];
    return [token0, token1];
}

export function getTokensInBytes32(token: TokenData)
{
    if (token.address.toLowerCase() == NATIVE.toLowerCase())
    {
        return "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    }
    else
    {
        return ethers.zeroPadValue(token.address, 32);
    }
}

export async function divideAmountToTokens(
    tokenAReserveAmount: string,
    tokenBReserveAmount: string,
    amountSupplied: string,
    tokenA: TokenData,
    tokenB: TokenData,
    supplyToken: TokenData
)
{
    try
    {
        const slippageSupplyAmount = calculateSlippage(amountSupplied, (1 / 2).toString(), 10);

        const minAmountComputed = new BigNumber(slippageSupplyAmount);

        const tokenAComputed = new BigNumber(tokenAReserveAmount);
        const tokenBComputed = new BigNumber(tokenBReserveAmount);

        if (tokenAComputed.eq(0))
        {
            return ["0", minAmountComputed];
        }
        else if (tokenBComputed.eq(0))
        {
            return [minAmountComputed, "0"];
        }

        const tokenA_Allocated = minAmountComputed.div(2);

        const tokenB_Allocated = minAmountComputed.minus(tokenA_Allocated);

        const tokA = tokenA_Allocated.toFixed(0);
        const tokB = tokenB_Allocated.toFixed(0);
        return [tokA, tokB];
    }
    catch (ex)
    {
        throw ex;
    }
    // const commonDecimals = Math.max(tokenA.decimals, tokenB.decimals);
}

export async function getMinimumAmount(tokenAmount: string)
{
    const amount = new BigNumber(tokenAmount);
    const minAmount = amount.dividedBy(1000).toFixed(0);
    return minAmount;
}

export function getEpochTime(delayInHr?: number, delayInDay?: number)
{
    let currentTime = Date.now();
    if (delayInHr ?? delayInDay)
    {
        const delayHr = delayInHr ?? 1;
        const delayDay = delayInHr ?? 1;
        currentTime = currentTime + delayDay * delayHr * 60 * 60 * 1000;
    }

    return currentTime;
}

export function getCommonDecimalComputedValue(
    amount: string,
    selfDecimal: number,
    commonDecimal: number
)
{
    const computedValue = new BigNumber(Math.pow(10, commonDecimal))
        .dividedBy(Math.pow(10, selfDecimal))
        .multipliedBy(new BigNumber(amount))
        .toFixed(0);
    return computedValue;
}

export async function getTokenReverseValue(
    tokenIn: TokenData,
    tokenOut: TokenData,
    amount: string
)
{
    try
    {
        const isMainnetChain = isMainnet(Number(tokenIn.chainId));
        const seqQuoteParams: QuoteParams = {
            fromTokenAddress: tokenIn.address,
            toTokenAddress: tokenOut.address,
            amount: String(amount),
            fromTokenChainId: Number(tokenIn.chainId),
            toTokenChainId: Number(tokenOut.chainId),
            partnerId: 0
        };
        const quotation = isMainnetChain
            ? await mainnetPathFinder.QuoteApi(seqQuoteParams)
            : await testnetPathFinder.QuoteApi(seqQuoteParams);
        const tokenOutAmount = quotation.destination.tokenAmount;
        return tokenOutAmount;
    }
    catch (ex)
    {
        throw ex;
    }
}

export function getRemainderValue(
    totalAmount: string,
    currentTokenDecimal: number,
    secAmountCal: string,
    secTokenDecimal: number,
    returnDecimal: number
)
{
    if (currentTokenDecimal !== secTokenDecimal)
    {
        throw "token decimals didn't match";
    }
    const totalAmountCalculated = new BigNumber(totalAmount);
    const amountToSubstract = new BigNumber(secAmountCal);
    const tokenLeft = totalAmountCalculated.minus(amountToSubstract).toFixed(0);
    const returnAmount = getCommonDecimalComputedValue(
        tokenLeft,
        currentTokenDecimal,
        returnDecimal
    );

    return returnAmount;
}

export function checkForNonIntentType(type: string)
{
    const divType = type.split("_");
    if (divType[0] == "#")
    {
        return true;
    }
    else
    {
        return false;
    }
}

export function getReserveToken(tokenPair: Array<TokenData>, destinationChain: number)
{
    let reserveToken = RESERVED_TOKENS[destinationChain][0];
    tokenPair.map((token: TokenData) =>
    {
        const checkReserve = RESERVED_TOKENS[destinationChain].find(
            item => item.address.toLowerCase() === token.address.toLowerCase()
        );
        if (checkReserve)
        {
            reserveToken = token;
        }
    });

    return reserveToken;
}

export function toToken32Bit(spec: string, id: number, addr: string)
{
    return ethers.solidityPacked(
        ["uint8", "uint88", "address"],
        [["erc20", "erc721", "erc1155"].indexOf(spec), id, addr]
    );
}
export function toPoolId32Bit(i: string, poolAddress: string)
{
    return ethers.solidityPacked(["bytes1", "uint88", "address"], [i, 0, poolAddress]);
}
export function tokenInformationAmountEncoded32Bit(
    index: string,
    amountType: string,
    amount: string
)
{
    return ethers.solidityPacked(
        ["uint8", "uint8", "uint112", "int128"],
        [index, ["exactly", "at most", "all", "flashloan"].indexOf(amountType), 0, amount]
    );
}

export function estimateTime(
    isCrossChain: boolean,
    timeInSec: number,
    totalTime: number,
    crossChainTime: number
)
{
    if (!isCrossChain)
    {
        if (totalTime > 0)
        {
            if (timeInSec && timeInSec <= totalTime)
            {
                totalTime = timeInSec;
                totalTime += crossChainTime;
            }
        }
        else
        {
            totalTime = timeInSec;
        }
    }
    else
    {
        totalTime += timeInSec;
    }

    return totalTime;
}
