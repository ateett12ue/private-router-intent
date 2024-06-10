import { ethers } from "ethers";
import { getProvider, estimateGasLimit } from "./index";
import { assetForwarderAbi } from "../abis/AssetForwarder";
import { ForwarderContractAddress } from "../constant/contractMapping";
import BigNumber from "bignumber.js";
export interface RelayDataMessage
{
    amount: string;
    srcChainId: string;
    depositId: number;
    destToken: string;
    recipient: string;
    message: string;
    isNative: boolean;
}

export async function calDestinationGasLimit(data: RelayDataMessage, chainId: number)
{
    try
    {
        const provider = await getProvider(chainId);
        const contractAddress = ForwarderContractAddress[chainId];
        const contractAbi = assetForwarderAbi;

        const increaseLimit = 20; //20%
        const contract = new ethers.Contract(contractAddress, contractAbi, provider);

        const relayDataValues = {
            amount: BigInt(data.amount),
            srcChainId: data.srcChainId,
            depositId: BigInt(data.depositId),
            destToken: data.destToken,
            recipient: data.recipient,
            message: data.message
        };

        const encodedFunctionData = contract.interface.encodeFunctionData("iRelayMessage", [
            relayDataValues
        ]);

        console.log("encodedFunctionData", encodedFunctionData);
        const gasEstimated = await providerEstimateGas(
            data.amount,
            provider,
            contractAddress,
            encodedFunctionData,
            data.isNative
        );
        const gasLimitCalculated = upgradeAmountByPercentage(gasEstimated, increaseLimit, true);
        return gasLimitCalculated;
    }
    catch (ex)
    {
        const gasLimit = estimateGasLimit(chainId);
        return gasLimit;
    }
}
async function providerEstimateGas(
    amount: string,
    provider: any,
    contractAddress: string,
    encodedFunctionData: string,
    native?: boolean
)
{
    try
    {
        const gas = await provider.estimateGas({
            to: contractAddress,
            from: "0x00051d55999c7cd91b17af7276cbecd647dbc000",
            data: encodedFunctionData,
            value: native ? amount : "0x00"
        });
        return gas;
    }
    catch (error)
    {
        console.error("Static call failed:", error);
        throw error;
    }
}

async function upgradeAmountByPercentage(amount: string, percentage: number, isIncreased: boolean)
{
    const amountBigInt = new BigNumber(amount);
    let percentageToMultiple;
    if (isIncreased)
    {
        percentageToMultiple = 1 + percentage / 100;
    }
    else
    {
        percentageToMultiple = 1 - percentage / 100;
    }

    const updatedAmount = amountBigInt.multipliedBy(percentageToMultiple).toString();
    return updatedAmount;
}
