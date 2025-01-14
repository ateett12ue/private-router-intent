export const velocorePoolFactoryAbi = [
    {
        inputs: [
            {
                internalType: "contract IVault",
                name: "vault_",
                type: "address"
            },
            {
                internalType: "contract ConstantProductLibrary",
                name: "lib_",
                type: "address"
            }
        ],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "contract ConstantProductPool",
                name: "pool",
                type: "address"
            },
            {
                indexed: false,
                internalType: "Token",
                name: "t1",
                type: "bytes32"
            },
            {
                indexed: false,
                internalType: "Token",
                name: "t2",
                type: "bytes32"
            }
        ],
        name: "PoolCreated",
        type: "event"
    },
    {
        inputs: [
            {
                internalType: "Token",
                name: "quoteToken",
                type: "bytes32"
            },
            {
                internalType: "Token",
                name: "baseToken",
                type: "bytes32"
            }
        ],
        name: "deploy",
        outputs: [
            {
                internalType: "contract ConstantProductPool",
                name: "",
                type: "address"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "begin",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "maxLength",
                type: "uint256"
            }
        ],
        name: "getPools",
        outputs: [
            {
                internalType: "contract ConstantProductPool[]",
                name: "pools",
                type: "address[]"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "contract ConstantProductPool",
                name: "",
                type: "address"
            }
        ],
        name: "isPool",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            }
        ],
        name: "poolList",
        outputs: [
            {
                internalType: "contract ConstantProductPool",
                name: "",
                type: "address"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "Token",
                name: "",
                type: "bytes32"
            },
            {
                internalType: "Token",
                name: "",
                type: "bytes32"
            }
        ],
        name: "pools",
        outputs: [
            {
                internalType: "contract ConstantProductPool",
                name: "",
                type: "address"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "poolsLength",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint32",
                name: "decay_",
                type: "uint32"
            }
        ],
        name: "setDecay",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint32",
                name: "fee1e9_",
                type: "uint32"
            }
        ],
        name: "setFee",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }
];
