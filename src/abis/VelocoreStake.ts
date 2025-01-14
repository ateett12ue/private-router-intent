export const velocoreStakeAbi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "contract IGauge",
                name: "gauge",
                type: "address"
            },
            {
                indexed: true,
                internalType: "contract IBribe",
                name: "bribe",
                type: "address"
            }
        ],
        name: "BribeAttached",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "contract IGauge",
                name: "gauge",
                type: "address"
            },
            {
                indexed: true,
                internalType: "contract IBribe",
                name: "bribe",
                type: "address"
            }
        ],
        name: "BribeKilled",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "contract IConverter",
                name: "pool",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address"
            },
            {
                indexed: false,
                internalType: "Token[]",
                name: "tokenRef",
                type: "bytes32[]"
            },
            {
                indexed: false,
                internalType: "int128[]",
                name: "delta",
                type: "int128[]"
            }
        ],
        name: "Convert",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "contract IGauge",
                name: "pool",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address"
            },
            {
                indexed: false,
                internalType: "Token[]",
                name: "tokenRef",
                type: "bytes32[]"
            },
            {
                indexed: false,
                internalType: "int128[]",
                name: "delta",
                type: "int128[]"
            }
        ],
        name: "Gauge",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "contract IGauge",
                name: "gauge",
                type: "address"
            },
            {
                indexed: false,
                internalType: "bool",
                name: "killed",
                type: "bool"
            }
        ],
        name: "GaugeKilled",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "contract ISwap",
                name: "pool",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address"
            },
            {
                indexed: false,
                internalType: "Token[]",
                name: "tokenRef",
                type: "bytes32[]"
            },
            {
                indexed: false,
                internalType: "int128[]",
                name: "delta",
                type: "int128[]"
            }
        ],
        name: "Swap",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address"
            },
            {
                indexed: false,
                internalType: "Token[]",
                name: "tokenRef",
                type: "bytes32[]"
            },
            {
                indexed: false,
                internalType: "int128[]",
                name: "delta",
                type: "int128[]"
            }
        ],
        name: "UserBalance",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "contract IGauge",
                name: "pool",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address"
            },
            {
                indexed: false,
                internalType: "int256",
                name: "voteDelta",
                type: "int256"
            }
        ],
        name: "Vote",
        type: "event"
    },
    {
        inputs: [
            {
                internalType: "contract IFacet",
                name: "implementation",
                type: "address"
            }
        ],
        name: "admin_addFacet",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bool",
                name: "t",
                type: "bool"
            }
        ],
        name: "admin_pause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "contract IAuthorizer",
                name: "auth_",
                type: "address"
            }
        ],
        name: "admin_setAuthorizer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "implementation",
                type: "address"
            },
            {
                internalType: "bytes4[]",
                name: "sigs",
                type: "bytes4[]"
            }
        ],
        name: "admin_setFunctions",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "treasury",
                type: "address"
            }
        ],
        name: "admin_setTreasury",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "contract IGauge",
                name: "gauge",
                type: "address"
            },
            {
                internalType: "contract IBribe",
                name: "bribe",
                type: "address"
            }
        ],
        name: "attachBribe",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "ballotToken",
        outputs: [
            {
                internalType: "Token",
                name: "",
                type: "bytes32"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "emissionToken",
        outputs: [
            {
                internalType: "Token",
                name: "",
                type: "bytes32"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "Token[]",
                name: "tokenRef",
                type: "bytes32[]"
            },
            {
                internalType: "int128[]",
                name: "deposit",
                type: "int128[]"
            },
            {
                components: [
                    {
                        internalType: "bytes32",
                        name: "poolId",
                        type: "bytes32"
                    },
                    {
                        internalType: "bytes32[]",
                        name: "tokenInformations",
                        type: "bytes32[]"
                    },
                    {
                        internalType: "bytes",
                        name: "data",
                        type: "bytes"
                    }
                ],
                internalType: "struct VelocoreOperation[]",
                name: "ops",
                type: "tuple[]"
            }
        ],
        name: "execute",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "lens",
                type: "address"
            },
            {
                internalType: "bytes",
                name: "data",
                type: "bytes"
            }
        ],
        name: "inspect",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "contract IGauge",
                name: "gauge",
                type: "address"
            },
            {
                internalType: "contract IBribe",
                name: "bribe",
                type: "address"
            }
        ],
        name: "killBribe",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "contract IGauge",
                name: "gauge",
                type: "address"
            },
            {
                internalType: "bool",
                name: "t",
                type: "bool"
            }
        ],
        name: "killGauge",
        outputs: [],
        stateMutability: "nonpayable",
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
                internalType: "uint128",
                name: "",
                type: "uint128"
            },
            {
                internalType: "uint128",
                name: "",
                type: "uint128"
            }
        ],
        name: "notifyInitialSupply",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address"
            },
            {
                internalType: "Token[]",
                name: "tokenRef",
                type: "bytes32[]"
            },
            {
                internalType: "int128[]",
                name: "deposit",
                type: "int128[]"
            },
            {
                components: [
                    {
                        internalType: "bytes32",
                        name: "poolId",
                        type: "bytes32"
                    },
                    {
                        internalType: "bytes32[]",
                        name: "tokenInformations",
                        type: "bytes32[]"
                    },
                    {
                        internalType: "bytes",
                        name: "data",
                        type: "bytes"
                    }
                ],
                internalType: "struct VelocoreOperation[]",
                name: "ops",
                type: "tuple[]"
            }
        ],
        name: "query",
        outputs: [
            {
                internalType: "int128[]",
                name: "",
                type: "int128[]"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    }
];
