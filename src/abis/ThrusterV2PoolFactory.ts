export const ThrusterV2PoolFactoryAbi = [
    {
        inputs: [
            { internalType: "address", name: "_yieldToSetter", type: "address" },
            { internalType: "address", name: "_pointsAdmin", type: "address" }
        ],
        payable: false,
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
            { indexed: true, internalType: "address", name: "token0", type: "address" },
            { indexed: true, internalType: "address", name: "token1", type: "address" },
            { indexed: false, internalType: "address", name: "pair", type: "address" },
            { indexed: false, internalType: "uint256", name: "", type: "uint256" }
        ],
        name: "PairCreated",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [{ indexed: false, internalType: "uint256", name: "yieldCut", type: "uint256" }],
        name: "SetYieldCut",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [{ indexed: true, internalType: "address", name: "yieldTo", type: "address" }],
        name: "SetYieldTo",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "newYieldToSetter", type: "address" }
        ],
        name: "SetYieldToSetter",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "pair", type: "address" },
            { indexed: true, internalType: "address", name: "sender", type: "address" },
            { indexed: false, internalType: "uint256", name: "amount0In", type: "uint256" },
            { indexed: false, internalType: "uint256", name: "amount1In", type: "uint256" },
            { indexed: false, internalType: "uint256", name: "amount0Out", type: "uint256" },
            { indexed: false, internalType: "uint256", name: "amount1Out", type: "uint256" },
            { indexed: true, internalType: "address", name: "to", type: "address" }
        ],
        name: "Swap",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "pair", type: "address" },
            { indexed: false, internalType: "uint112", name: "reserve0", type: "uint112" },
            { indexed: false, internalType: "uint112", name: "reserve1", type: "uint112" }
        ],
        name: "Sync",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "pair", type: "address" },
            { indexed: true, internalType: "address", name: "from", type: "address" },
            { indexed: true, internalType: "address", name: "to", type: "address" },
            { indexed: false, internalType: "uint256", name: "value", type: "uint256" }
        ],
        name: "Transfer",
        type: "event"
    },
    {
        constant: true,
        inputs: [],
        name: "BLAST",
        outputs: [{ internalType: "contract IBlast", name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        name: "allPairs",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "allPairsLength",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { internalType: "address", name: "_recipient", type: "address" },
            { internalType: "uint256", name: "_minClaimRateBips", type: "uint256" }
        ],
        name: "claimGas",
        outputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { internalType: "address", name: "tokenA", type: "address" },
            { internalType: "address", name: "tokenB", type: "address" }
        ],
        name: "createPair",
        outputs: [{ internalType: "address", name: "pair", type: "address" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { internalType: "address", name: "sender", type: "address" },
            { internalType: "uint256", name: "amount0In", type: "uint256" },
            { internalType: "uint256", name: "amount1In", type: "uint256" },
            { internalType: "uint256", name: "amount0Out", type: "uint256" },
            { internalType: "uint256", name: "amount1Out", type: "uint256" },
            { internalType: "address", name: "to", type: "address" }
        ],
        name: "emitSwap",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { internalType: "uint112", name: "reserve0", type: "uint112" },
            { internalType: "uint112", name: "reserve1", type: "uint112" }
        ],
        name: "emitSync",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [
            { internalType: "address", name: "from", type: "address" },
            { internalType: "address", name: "to", type: "address" },
            { internalType: "uint256", name: "liquidity", type: "uint256" }
        ],
        name: "emitTransfer",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [
            { internalType: "address", name: "", type: "address" },
            { internalType: "address", name: "", type: "address" }
        ],
        name: "getPair",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "manager",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "pairExists",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "pointsAdmin",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: false,
        inputs: [{ internalType: "address", name: "_manager", type: "address" }],
        name: "setManager",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [{ internalType: "uint256", name: "_yieldCut", type: "uint256" }],
        name: "setYieldCut",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [{ internalType: "address", name: "_yieldTo", type: "address" }],
        name: "setYieldTo",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: false,
        inputs: [{ internalType: "address", name: "_newYieldToSetter", type: "address" }],
        name: "setYieldToSetter",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "yieldCut",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "yieldTo",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    },
    {
        constant: true,
        inputs: [],
        name: "yieldToSetter",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function"
    }
];