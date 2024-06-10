import { TokenData } from "../service/models/CommonModels";

export const NATIVE = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export const IntentBatchTransactionContract: { [chainId in number]: `0x${string}` } = {
    5: "0xadA4fbd94553916566503f5324EA2cFaAE491e27",
    80001: "0xfE9Df2131D69954C277cC2439425B6Fcd7Ba45fd",
    43113: "0x4600832A9b77F07f5D79583C81E87Efacea4302c",
    1: "0x4D9733ca83610E1343Ed2581d1779f294638BB33",
    137: "0xF368e21d928bC9C1b1d98c14A43A8b9225051c0a",
    43114: "0x2DdFbf2527384b84c335EAe9C79Ac85fd46ED8f3",
    10: "0x29B7Dbd064654db866d48Ca09e4BC696EAc8e4F9",
    56: "0x1c6A2240bFCbE22f06f5D657490aacA6E0400281",
    42161: "0xc304C00001c2fe8feDeE8b49428eB180c34CB3F6",
    8453: "0x87a4e0abA5960912E65fBfbeFEbA62F097e757bd",
    59144: "0x2312574cC99535eE8febBE516C14A295A560706e",
    534352: "0xe2f77e7B44C02BE634ef5f318c9359571074186C",
    169: "0xd817DBcadC5919b2658A575aF1b395dC87B9C3a3",
    534351: "0x298e2AD30BA8FFaa573814A48929c71824ebC3b9",
    11155111: "0xde7A9FebD3c80AB4c17F76Ac347292bdc7720F06",
    34443: "0x4D9733ca83610E1343Ed2581d1779f294638BB33",
    81457: "0xd5808A8D0Ec8eae3929Bbc380e562649cDb957F0",
    10242: "0xfca06bc88DdA0a43eE03641599217cEd2Bcb5892"
};

export const MetapoolStakingContract: { [chainId in number]: `0x${string}` } = {
    5: "0x748c905130CC15b92B97084Fd1eEBc2d2419146f"
};

export const BenqiStakingContract: { [chainId in number]: `0x${string}` } = {
    43114: "0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE"
};

export const StakeStoneValutContract: { [chainId in number]: `0x${string}` } = {
    1: "0xA62F9C5af106FeEE069F38dE51098D9d81B90572"
};

export const StakeStoneTokenContract: { [chainId in number]: `0x${string}` } = {
    1: "0x7122985656e38BDC0302Db86685bb972b145bD3C",
    5000: "0xEc901DA9c68E90798BbBb74c11406A32A70652C3"
};

export const zkSyncContract: { [chainId in number]: `0x${string}` } = {
    1: "0x32400084C286CF3E17e7B677ea9583e60a000324"
};

export const lidoWethContract: { [chainId in number]: `0x${string}` } = {
    1: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
    11155111: "0xB82381A3fBD3FaFA77B3a7bE693342618240067b"
};

export const AeroSugarContract: { [chainId in number]: `0x${string}` } = {
    8453: "0xf739E2BC37fD5C1D3614dA67756dEEaEE0025667"
};

export const PARIFI_ORDER_MANAGER: { [chainId in number]: `0x${string}` } = {
    "42161": "0xe9976AB03aE60d092ca18009991231fa6b4D68f9",
    "421614": "0xf7f16027eFfA5e1eD5cff057bbd275cB04017691"
};

export const BaseSwapPoolFactory: { [chainId in number]: `0x${string}` } = {
    "8453": "0x38015D05f4fEC8AFe15D7cc0386a126574e8077B"
};

export const ThrusterV2RouterFeePointThree: { [chainId in number]: `0x${string}` } = {
    "81457": "0xb4A7D971D0ADea1c73198C97d7ab3f9CE4aaFA13"
};
export const ThrusterV2RouterFeePointOne: { [chainId in number]: `0x${string}` } = {
    "81457": "0x37836821a2c03c171fB1a595767f4a16e2b93Fc4"
};

export const ThrusterV3PoolFactory: { [chainId in number]: `0x${string}` } = {
    "81457": "0x71b08f13B3c3aF35aAdEb3949AFEb1ded1016127"
};

export const KimV4PoolFactory: { [chainId in number]: `0x${string}` } = {
    "34443": "0xB5F00c2C5f8821155D8ed27E31932CFD9DB3C5D5"
};

export const KimV2PoolFactory: { [chainId in number]: `0x${string}` } = {
    "34443": "0xc02155946dd8C89D3D3238A6c8A64D04E2CD4500"
};

export const SwapmodePoolFactory: { [chainId in number]: `0x${string}` } = {
    "34443": "0xfb926356BAf861c93C3557D7327Dbe8734A71891"
};

export const ThirdFyPoolFactory: { [chainId in number]: `0x${string}` } = {
    "10242": "0x10253594A832f967994b44f33411940533302ACb"
};

export const DexspanContractAddress: { [chainId in number]: string } = {
    5: "0x6dEcd37F5409e2D32cE5a792d9BcE07d3752c60B",
    43113: "0x7Be251B6Da3086E0f39F4e4E75A20E5ABCf59B93",
    80001: "0xe6CEFc06b1C6f5C9fFDb2B84Ec6fCafa6967e615",
    1: "0x6c45e28a76977a96e263f84f95912b47f927b687",
    137: "0xC57133521ffBd729cB81cc8ddC12d9E9F61E0f6a",
    43114: "0x4406ebEb7028fc0fc06bB7706A736AC6ada8D2bF",
    10: "0x5501A36b1313aC5d27e85418acd2AA4564f50b44",
    56: "0x2F301d3b045544A9D7Ec3FA090CD78986F11f2E7",
    42161: "0xCA94d8C245601B152C904f42fE788B4125f5b46B",
    8453: "0x02D728B9C1513478a6b6de77a92648e1D8F801e7",
    59144: "0x6D6050Ca1dd8e4aAb9164B663d805104a3ECFC34",
    534351: "",
    11155111: "",
    169: "0x8201c02d4AB2214471E8C3AD6475C8b0CD9F2D06",
    534352: "0x5546dA2bCdCFF39b187723434cDE10D4eE99C566",
    34443: "0xf0773508c585246bd09bfb401aa18b72685b03f9",
    81457: "0x710b200D4109B2fe9Aa6D13da6A3539ce1CFD39D",
    10242: ""
};

export const AssetBridgeContractAddress: { [chainId in number]: string } = {
    "1": "0xf9f4c3dc7ba8f56737a92d74fd67230c38af51f2",
    "10": "0x21c1E74CAaDf990E237920d5515955a024031109",
    "250": "0x0000000000000000000000000000000000000000",
    "534352": "0x21c1E74CAaDf990E237920d5515955a024031109",
    "56": "0x21c1E74CAaDf990E237920d5515955a024031109",
    "137": "0xa62ec33abd6d7ebdf8ec98ce874820517ae71e4d",
    "5000": "0x0000000000000000000000000000000000000000",
    "324": "0x8b6f1c18c866f37e6ea98aa539e0c117e70178a2",
    "169": "0x21c1e74caadf990e237920d5515955a024031109",
    "8453": "0x21c1E74CAaDf990E237920d5515955a024031109",
    "34443": "0x0000000000000000000000000000000000000000",
    "10242": "0x27902308573d4F21B4a98Fa7121d04fa7E7bb20E",
    "42161": "0x0Fa205c0446cD9EeDCc7538c9E24BC55AD08207f",
    "43114": "0x8c4acd74ff4385f3b7911432fa6787aa14406f8b",
    "59144": "0x01B4CE0d48Ce91eB6bcaf5dB33870C65d641b894"
};

export const AeroDromePoolFactory: { [chainId in number]: string } = {
    8453: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da"
};

export const VelocoresPoolFactory: { [chainId in number]: string } = {
    59144: "0xBe6c6A389b82306e88d74d1692B67285A9db9A47"
};

export const LynexPoolFactory: { [chainId in number]: string } = {
    59144: "0xBc7695Fd00E3b32D08124b7a4287493aEE99f9ee"
};

export const ThirdfyQuoterFactory: { [chainId in number]: string } = {
    10242: "0x95E325A85B9E6cB4DeA2ccd96218e5F8365E0B0F"
};
export const LynexGaugePoolFactory: { [chainId in number]: string } = {
    59144: "0x0B2c83B6e39E32f694a86633B4d1Fe69d13b63c5"
};

export const RESERVED_TOKENS: { [chainId in number]: TokenData[] } = {
    5: [
        {
            chainId: "5",
            address: "0x2227E4764be4c858E534405019488D9E5890Ff9E",
            name: "USDT",
            symbol: "USDT",
            decimals: 6,
            resourceID: "usdi",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "5",
            address: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
            name: "WETH",
            symbol: "WETH",
            decimals: 18,
            resourceID: "native-eth",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "5",
            address: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
            name: "USDC",
            symbol: "USDC",
            decimals: 6,
            resourceID: "usdc-circle",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    80001: [
        {
            chainId: "80001",
            address: "0x22bAA8b6cdd31a0C5D1035d6e72043f4Ce6aF054",
            name: "USDT",
            symbol: "USDT",
            decimals: 12,
            resourceID: "usdi",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "80001",
            address: "0x3C6Bb231079c1023544265f8F26505bc5955C3df",
            name: "WETH",
            symbol: "WETH",
            decimals: 18,
            resourceID: "native-eth",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    43113: [
        {
            chainId: "43113",
            address: "0xb452b513552aa0B57c4b1C9372eFEa78024e5936",
            name: "USDT",
            symbol: "USDT",
            decimals: 6,
            resourceID: "usdi",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "43113",
            address: "0xce811501ae59c3E3e539D5B4234dD606E71A312e",
            name: "WETH",
            symbol: "WETH",
            decimals: 18,
            resourceID: "native-eth",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    137: [
        {
            chainId: "137",
            address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
            name: "Tether USD",
            symbol: "USDT",
            decimals: 6,
            resourceID: "usdt",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "137",
            address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
            name: "USDC",
            symbol: "USDC",
            decimals: 6,
            resourceID: "usdc-circle",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "137",
            address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
            name: "Wrapped Ether",
            symbol: "WETH",
            decimals: 18,
            resourceID: "native-eth",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    43114: [
        {
            chainId: "43114",
            address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
            name: "USDT",
            symbol: "USDT",
            decimals: 6,
            resourceID: "usdt",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "43114",
            address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
            name: "USDC",
            symbol: "USDC",
            decimals: 6,
            resourceID: "usdc-circle",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    1: [
        {
            chainId: "1",
            address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            name: "Tether USD",
            symbol: "USDT",
            decimals: 6,
            resourceID: "usdt",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "1",
            address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            name: "USDC",
            symbol: "USDC",
            decimals: 6,
            resourceID: "usdc-circle",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "1",
            address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            name: "WETH",
            symbol: "WETH",
            decimals: 18,
            resourceID: "native-eth",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    10: [
        {
            chainId: "10",
            address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
            name: "USDT",
            symbol: "USDT",
            decimals: 6,
            resourceID: "usdt",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "10",
            address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
            name: "USDC",
            symbol: "USDC",
            decimals: 6,
            resourceID: "usdc-circle",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "10",
            address: "0x4200000000000000000000000000000000000006",
            name: "WETH",
            symbol: "WETH",
            decimals: 18,
            resourceID: "native-eth",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    56: [
        {
            chainId: "56",
            address: "0x55d398326f99059fF775485246999027B3197955",
            name: "Tether USD",
            symbol: "USDT",
            decimals: 18,
            resourceID: "usdt",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "56",
            address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
            name: "USDC",
            symbol: "USDC",
            decimals: 18,
            resourceID: "usdc-circle",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    42161: [
        {
            chainId: "42161",
            address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
            name: "Tether USD",
            symbol: "USDT",
            decimals: 6,
            resourceID: "usdt",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "42161",
            address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
            name: "USD Coin",
            symbol: "USDC",
            decimals: 6,
            resourceID: "usdc-circle",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "42161",
            address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
            name: "WETH",
            symbol: "WETH",
            decimals: 18,
            resourceID: "native-eth",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    8453: [
        {
            chainId: "8453",
            address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
            name: "USDC",
            symbol: "USDC",
            decimals: 6,
            resourceID: "usdc-circle",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "8453",
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
            resourceID: "eth",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    59144: [
        {
            chainId: "59144",
            address: "0xa219439258ca9da29e9cc4ce5596924745e12b93",
            name: "USDT",
            symbol: "USDT",
            decimals: 6,
            resourceID: "usdt",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "59144",
            address: "0x176211869ca2b568f2a7d4ee941e073a821ee1ff",
            name: "USDC",
            symbol: "USDC",
            decimals: 6,
            resourceID: "usdc-circle",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "59144",
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
            resourceID: "eth",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    534351: [
        {
            chainId: "534351",
            address: "0x778a1f43459a05accd8b57007119f103c249f929",
            name: "AFTT",
            symbol: "AFTT",
            decimals: 18,
            resourceID: "aftt",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    11155111: [
        {
            chainId: "11155111",
            address: "0xb75f7E3256A5FDa11A3e95Dd25e8129189F78dA3",
            name: "AFTT",
            symbol: "AFTT",
            decimals: 18,
            resourceID: "aftt",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "11155111",
            address: "0x3e3FE7dBc6B4C189E7128855dD526361c49b40Af",
            name: "stETH",
            symbol: "STETH",
            decimals: 18,
            resourceID: "steth",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    169: [
        {
            chainId: "169",
            address: "0xf417F5A458eC102B90352F697D6e2Ac3A3d2851f",
            name: "USDT",
            symbol: "USDT",
            decimals: 6,
            resourceID: "usdt",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "169",
            address: "0xb73603C5d87fA094B7314C74ACE2e64D165016fb",
            name: "USDC",
            symbol: "USDC",
            decimals: 6,
            resourceID: "usdc-circle",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "169",
            address: "0x0Dc808adcE2099A9F62AA87D9670745AbA741746",
            name: "WETH",
            symbol: "WETH",
            decimals: 18,
            resourceID: "native-eth",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    534352: [
        {
            chainId: "534352",
            address: "0xf55bec9cafdbe8730f096aa55dad6d22d44099df",
            name: "USDT",
            symbol: "USDT",
            decimals: 6,
            resourceID: "usdt",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "534352",
            address: "0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4",
            name: "USDC",
            symbol: "USDC",
            decimals: 6,
            resourceID: "usdc-circle",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "534352",
            address: "0x5300000000000000000000000000000000000004",
            name: "WETH",
            symbol: "WETH",
            decimals: 18,
            resourceID: "native-eth",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    34443: [
        {
            chainId: "34443",
            address: "0xf0F161fDA2712DB8b566946122a5af183995e2eD",
            name: "Tether USD",
            symbol: "USDT",
            decimals: 6,
            resourceID: "usdt",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "34443",
            address: "0xd988097fb8612cc24eeC14542bC03424c656005f",
            name: "USDC",
            symbol: "USDC",
            decimals: 6,
            resourceID: "usdc-circle",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "34443",
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
            resourceID: "eth",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    81457: [
        {
            chainId: "81457",
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
            resourceID: "native-eth",
            isMintable: false,
            isWrappedAsset: false
        }
    ],
    10242: [
        {
            chainId: "10242",
            address: "0x6c45e28a76977a96e263f84f95912b47f927b687",
            name: "Tether USD",
            symbol: "USDT",
            decimals: 6,
            resourceID: "usdt",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "10242",
            address: "0x8c4acd74ff4385f3b7911432fa6787aa14406f8b",
            name: "USDC",
            symbol: "USDC",
            decimals: 6,
            resourceID: "usdc-circle",
            isMintable: false,
            isWrappedAsset: false
        },
        {
            chainId: "10242",
            address: "0x29AE05C93549bb93827cd651C6ee1c25960dB847",
            name: "WETH",
            symbol: "WETH",
            decimals: 18,
            resourceID: "native-eth",
            isMintable: false,
            isWrappedAsset: false
        }
    ]
};

export const NativTokenMapping: { [chainId in number]: TokenData } = {
    5: {
        chainId: "5",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    80001: {
        chainId: "80001",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
        resourceID: "",
        isMintable: false,
        isWrappedAsset: false
    },
    43113: {
        chainId: "43113",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "AVAX",
        symbol: "AVAX",
        decimals: 18,
        resourceID: "native-avax",
        isMintable: false,
        isWrappedAsset: false
    },
    1: {
        chainId: "1",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    137: {
        chainId: "137",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
        resourceID: "",
        isMintable: false,
        isWrappedAsset: false
    },
    43114: {
        chainId: "43114",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "AVAX",
        symbol: "AVAX",
        decimals: 18,
        resourceID: "",
        isMintable: false,
        isWrappedAsset: false
    },
    10: {
        chainId: "10",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    56: {
        chainId: "56",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "BNB",
        symbol: "BNB",
        decimals: 18,
        resourceID: "native-bnb",
        isMintable: false,
        isWrappedAsset: false
    },
    42161: {
        chainId: "42161",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    8453: {
        chainId: "8453",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    59144: {
        chainId: "59144",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    534351: {
        chainId: "534351",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    11155111: {
        chainId: "11155111",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    169: {
        chainId: "169",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    534352: {
        chainId: "534352",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    34443: {
        chainId: "34443",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    81457: {
        chainId: "81457",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    10242: {
        chainId: "10242",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        name: "AA",
        symbol: "AA",
        decimals: 18,
        resourceID: "",
        isMintable: false,
        isWrappedAsset: false
    }
};

export const WrappedNativeMapping: { [chainId in number]: TokenData } = {
    5: {
        chainId: "5",
        address: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
        name: "WETH",
        symbol: "WETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    80001: {
        chainId: "80001",
        address: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
        name: "Wrapped MATIC",
        symbol: "WMATIC",
        decimals: 18,
        resourceID: "",
        isMintable: false,
        isWrappedAsset: false
    },
    43113: {
        chainId: "43113",
        address: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
        name: "Wrapped AVAX",
        symbol: "WAVAX",
        decimals: 18,
        resourceID: "",
        isMintable: false,
        isWrappedAsset: false
    },
    1: {
        chainId: "1",
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        name: "WETH",
        symbol: "WETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    137: {
        chainId: "137",
        address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
        name: "WMATIC",
        symbol: "WMATIC",
        decimals: 18,
        resourceID: "",
        isMintable: false,
        isWrappedAsset: false
    },
    43114: {
        chainId: "43114",
        address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
        name: "WAVAX",
        symbol: "WAVAX",
        decimals: 18,
        resourceID: "",
        isMintable: false,
        isWrappedAsset: false
    },
    10: {
        chainId: "10",
        address: "0x4200000000000000000000000000000000000006",
        name: "WETH",
        symbol: "WETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    56: {
        chainId: "56",
        address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        name: "Wrapped BNB",
        symbol: "WBNB",
        decimals: 18,
        resourceID: "native-bnb",
        isMintable: false,
        isWrappedAsset: false
    },
    42161: {
        chainId: "42161",
        address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        name: "WETH",
        symbol: "WETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    8453: {
        chainId: "8453",
        address: "0x4200000000000000000000000000000000000006",
        name: "WETH",
        symbol: "WETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    59144: {
        chainId: "59144",
        address: "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f",
        name: "WETH",
        symbol: "WETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    534351: {
        chainId: "534351",
        address: "0x5300000000000000000000000000000000000004",
        name: "WETH",
        symbol: "WETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    11155111: {
        chainId: "11155111",
        address: "0xb16f35c0ae2912430dac15764477e179d9b9ebea",
        name: "WETH",
        symbol: "WETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    169: {
        chainId: "169",
        address: "0x0Dc808adcE2099A9F62AA87D9670745AbA741746",
        name: "WETH",
        symbol: "WETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    534352: {
        chainId: "534352",
        address: "0x5300000000000000000000000000000000000004",
        name: "WETH",
        symbol: "WETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    34443: {
        chainId: "34443",
        address: "0x4200000000000000000000000000000000000006",
        name: "WETH",
        symbol: "WETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    81457: {
        chainId: "81457",
        address: "0x4300000000000000000000000000000000000004",
        name: "WETH",
        symbol: "WETH",
        decimals: 18,
        resourceID: "native-eth",
        isMintable: false,
        isWrappedAsset: false
    },
    10242: {
        chainId: "10242",
        address: "0x69D349E2009Af35206EFc3937BaD6817424729F7",
        name: "WAA",
        symbol: "WAA",
        decimals: 18,
        resourceID: "",
        isMintable: false,
        isWrappedAsset: false
    }
};

export const ForwarderContractAddress: { [chainId in number]: string } = {
    5: "0x925bfc688d003023a12149c32b040a411f1ae1d1",
    43113: "0x2dc0cc49904efe8744c103269269610739b72df3",
    80001: "0x9a25fb4d3ddada4ca9ad8bdff6fa63757a9fe55a",
    1: "0xC21e4ebD1d92036Cb467b53fE3258F219d909Eb9",
    137: "0x1396f41d89b96eaf29a7ef9ee01ad36e452235ae",
    43114: "0xf9f4c3dc7ba8f56737a92d74fd67230c38af51f2",
    10: "0x8201c02d4ab2214471e8c3ad6475c8b0cd9f2d06",
    56: "0x260687ebc6c55dadd578264260f9f6e968f7b2a5",
    42161: "0xef300fb4243a0ff3b90c8ccfa1264d78182adaa4",
    8453: "0x0fa205c0446cd9eedcc7538c9e24bc55ad08207f",
    59144: "0x8c4acd74ff4385f3b7911432fa6787aa14406f8b",
    534351: "",
    11155111: "",
    169: "0x21c1e74caadf990e237920d5515955a024031109",
    534352: "0x01b4ce0d48ce91eb6bcaf5db33870c65d641b894",
    34443: "0xc21e4ebd1d92036cb467b53fe3258f219d909eb9"
};
