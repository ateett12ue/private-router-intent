export const ThrusterV3PoolFactoryAbi = [
    {
        inputs: [
            { internalType: "address", name: "_owner", type: "address" },
            { internalType: "address", name: "_pointsAdmin", type: "address" }
        ],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "recipient", type: "address" },
            { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
        ],
        name: "ClaimGas",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "uint24", name: "fee", type: "uint24" },
            { indexed: true, internalType: "int24", name: "tickSpacing", type: "int24" }
        ],
        name: "FeeAmountEnabled",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "oldOwner", type: "address" },
            { indexed: true, internalType: "address", name: "newOwner", type: "address" }
        ],
        name: "OwnerChanged",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "token0", type: "address" },
            { indexed: true, internalType: "address", name: "token1", type: "address" },
            { indexed: true, internalType: "uint24", name: "fee", type: "uint24" },
            { indexed: false, internalType: "int24", name: "tickSpacing", type: "int24" },
            { indexed: false, internalType: "address", name: "pool", type: "address" }
        ],
        name: "PoolCreated",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "pool", type: "address" },
            { indexed: true, internalType: "address", name: "sender", type: "address" },
            { indexed: true, internalType: "address", name: "recipient", type: "address" },
            { indexed: false, internalType: "int256", name: "amount0", type: "int256" },
            { indexed: false, internalType: "int256", name: "amount1", type: "int256" },
            { indexed: false, internalType: "uint160", name: "sqrtPriceX96", type: "uint160" },
            { indexed: false, internalType: "uint128", name: "liquidity", type: "uint128" },
            { indexed: false, internalType: "int24", name: "tick", type: "int24" }
        ],
        name: "Swap",
        type: "event"
    },
    {
        inputs: [],
        name: "BLAST",
        outputs: [{ internalType: "contract IBlast", name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "_recipient", type: "address" }],
        name: "claimDeployerGas",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "_recipient", type: "address" },
            { internalType: "uint256", name: "_minClaimRateBips", type: "uint256" }
        ],
        name: "claimGas",
        outputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "tokenA", type: "address" },
            { internalType: "address", name: "tokenB", type: "address" },
            { internalType: "uint24", name: "fee", type: "uint24" }
        ],
        name: "createPool",
        outputs: [{ internalType: "address", name: "pool", type: "address" }],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "deployer",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "sender", type: "address" },
            { internalType: "address", name: "recipient", type: "address" },
            { internalType: "int256", name: "amount0", type: "int256" },
            { internalType: "int256", name: "amount1", type: "int256" },
            { internalType: "uint160", name: "sqrtPriceX96", type: "uint160" },
            { internalType: "uint128", name: "liquidity", type: "uint128" },
            { internalType: "int24", name: "tick", type: "int24" }
        ],
        name: "emitSwap",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "uint24", name: "fee", type: "uint24" },
            { internalType: "int24", name: "tickSpacing", type: "int24" }
        ],
        name: "enableFeeAmount",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint24", name: "", type: "uint24" }],
        name: "feeAmountTickSpacing",
        outputs: [{ internalType: "int24", name: "", type: "int24" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "", type: "address" },
            { internalType: "address", name: "", type: "address" },
            { internalType: "uint24", name: "", type: "uint24" }
        ],
        name: "getPool",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "manager",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "owner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "pointsAdmin",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "poolExists",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "_deployer", type: "address" }],
        name: "setDeployer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "_manager", type: "address" }],
        name: "setManager",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "_owner", type: "address" }],
        name: "setOwner",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "_pointsAdmin", type: "address" }],
        name: "updatePointsAdmin",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }
];
