export const metapoolStakingAbi = [
    {
        inputs: [
            {
                internalType: "uint16",
                name: "_acceptableUnderlyingChangeSent",
                type: "uint16"
            },
            {
                internalType: "uint16",
                name: "_maxAcceptableUnderlyingChange",
                type: "uint16"
            }
        ],
        name: "AcceptableUnderlyingChangeTooBig",
        type: "error"
    },
    {
        inputs: [],
        name: "DepositRootMismatch",
        type: "error"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_minAmount",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_amountSent",
                type: "uint256"
            }
        ],
        name: "DepositTooLow",
        type: "error"
    },
    {
        inputs: [
            {
                internalType: "uint16",
                name: "_sentFee",
                type: "uint16"
            },
            {
                internalType: "uint16",
                name: "_maxFee",
                type: "uint16"
            }
        ],
        name: "FeeSentTooBig",
        type: "error"
    },
    {
        inputs: [
            {
                internalType: "uint64",
                name: "_from",
                type: "uint64"
            },
            {
                internalType: "uint64",
                name: "_lastEpochReported",
                type: "uint64"
            }
        ],
        name: "InvalidEpochFrom",
        type: "error"
    },
    {
        inputs: [
            {
                internalType: "uint64",
                name: "_from",
                type: "uint64"
            },
            {
                internalType: "uint64",
                name: "_to",
                type: "uint64"
            }
        ],
        name: "InvalidEpochs",
        type: "error"
    },
    {
        inputs: [
            {
                internalType: "bytes",
                name: "_pubkey",
                type: "bytes"
            }
        ],
        name: "NodeAlreadyUsed",
        type: "error"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_stakingBalance",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_requestedToPool",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_requestedToWithdrawal",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_requiredBalance",
                type: "uint256"
            }
        ],
        name: "NotEnoughETHtoStake",
        type: "error"
    },
    {
        inputs: [
            {
                internalType: "int256",
                name: "_rewardsPerSecondSent",
                type: "int256"
            },
            {
                internalType: "int256",
                name: "_maxRewardsPerSecond",
                type: "int256"
            }
        ],
        name: "RewardsPerSecondTooBig",
        type: "error"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_unlockTimestamp",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_currentTimestamp",
                type: "uint256"
            }
        ],
        name: "SubmitReportTimelocked",
        type: "error"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_currentTotalAssets",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_newTotalUnderlying",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_difference",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_maxDifference",
                type: "uint256"
            }
        ],
        name: "UpdateTooBig",
        type: "error"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_user",
                type: "address"
            }
        ],
        name: "UserNotWhitelisted",
        type: "error"
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "_address",
                type: "string"
            }
        ],
        name: "ZeroAddress",
        type: "error"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "spender",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256"
            }
        ],
        name: "Approval",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "assets",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "shares",
                type: "uint256"
            }
        ],
        name: "Deposit",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint8",
                name: "version",
                type: "uint8"
            }
        ],
        name: "Initialized",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "assets",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "shares",
                type: "uint256"
            }
        ],
        name: "Mint",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                components: [
                    {
                        internalType: "uint64",
                        name: "from",
                        type: "uint64"
                    },
                    {
                        internalType: "uint64",
                        name: "to",
                        type: "uint64"
                    },
                    {
                        internalType: "uint256",
                        name: "rewards",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "penalties",
                        type: "uint256"
                    }
                ],
                indexed: false,
                internalType: "struct Staking.EpochsReport",
                name: "report",
                type: "tuple"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newTotalUnderlying",
                type: "uint256"
            }
        ],
        name: "ReportEpochs",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "previousAdminRole",
                type: "bytes32"
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "newAdminRole",
                type: "bytes32"
            }
        ],
        name: "RoleAdminChanged",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address"
            }
        ],
        name: "RoleGranted",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address"
            }
        ],
        name: "RoleRevoked",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "nodeId",
                type: "uint256"
            },
            {
                indexed: true,
                internalType: "bytes",
                name: "pubkey",
                type: "bytes"
            }
        ],
        name: "Stake",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "from",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "value",
                type: "uint256"
            }
        ],
        name: "Transfer",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "nodeId",
                type: "uint256"
            },
            {
                components: [
                    {
                        internalType: "bytes",
                        name: "pubkey",
                        type: "bytes"
                    },
                    {
                        internalType: "bytes",
                        name: "signature",
                        type: "bytes"
                    },
                    {
                        internalType: "bytes32",
                        name: "depositDataRoot",
                        type: "bytes32"
                    }
                ],
                indexed: false,
                internalType: "struct Staking.Node",
                name: "data",
                type: "tuple"
            }
        ],
        name: "UpdateNodeData",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "receiver",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "owner",
                type: "address"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "assets",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "shares",
                type: "uint256"
            }
        ],
        name: "Withdraw",
        type: "event"
    },
    {
        inputs: [],
        name: "ACTIVATOR_ROLE",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "DEFAULT_ADMIN_ROLE",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "MAX_ACCEPTABLE_UNDERLYING_CHANGE",
        outputs: [
            {
                internalType: "uint16",
                name: "",
                type: "uint16"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "MAX_DEPOSIT_FEE",
        outputs: [
            {
                internalType: "uint16",
                name: "",
                type: "uint16"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "MAX_REWARDS_FEE",
        outputs: [
            {
                internalType: "uint16",
                name: "",
                type: "uint16"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "MIN_DEPOSIT",
        outputs: [
            {
                internalType: "uint64",
                name: "",
                type: "uint64"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "SUBMIT_REPORT_TIMELOCK",
        outputs: [
            {
                internalType: "uint64",
                name: "",
                type: "uint64"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "UPDATER_ROLE",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "acceptableUnderlyingChange",
        outputs: [
            {
                internalType: "uint16",
                name: "",
                type: "uint16"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address[]",
                name: "addresses",
                type: "address[]"
            }
        ],
        name: "addToWhitelist",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address"
            },
            {
                internalType: "address",
                name: "spender",
                type: "address"
            }
        ],
        name: "allowance",
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
                internalType: "address",
                name: "spender",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "approve",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "asset",
        outputs: [
            {
                internalType: "address",
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
                internalType: "address",
                name: "account",
                type: "address"
            }
        ],
        name: "balanceOf",
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
                internalType: "uint256",
                name: "shares",
                type: "uint256"
            }
        ],
        name: "convertToAssets",
        outputs: [
            {
                internalType: "uint256",
                name: "assets",
                type: "uint256"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "assets",
                type: "uint256"
            }
        ],
        name: "convertToShares",
        outputs: [
            {
                internalType: "uint256",
                name: "shares",
                type: "uint256"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "decimals",
        outputs: [
            {
                internalType: "uint8",
                name: "",
                type: "uint8"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "spender",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "subtractedValue",
                type: "uint256"
            }
        ],
        name: "decreaseAllowance",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_assets",
                type: "uint256"
            },
            {
                internalType: "address",
                name: "_receiver",
                type: "address"
            }
        ],
        name: "deposit",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "depositContract",
        outputs: [
            {
                internalType: "contract IDeposit",
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
                internalType: "address",
                name: "_receiver",
                type: "address"
            }
        ],
        name: "depositETH",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            }
        ],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [],
        name: "depositFee",
        outputs: [
            {
                internalType: "uint16",
                name: "",
                type: "uint16"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "estimatedRewardsPerSecond",
        outputs: [
            {
                internalType: "int256",
                name: "",
                type: "int256"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            }
        ],
        name: "getRoleAdmin",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                internalType: "address",
                name: "account",
                type: "address"
            }
        ],
        name: "grantRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                internalType: "address",
                name: "account",
                type: "address"
            }
        ],
        name: "hasRole",
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
                internalType: "address",
                name: "spender",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "addedValue",
                type: "uint256"
            }
        ],
        name: "increaseAllowance",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_liquidPool",
                type: "address"
            },
            {
                internalType: "address",
                name: "_withdrawal",
                type: "address"
            },
            {
                internalType: "address",
                name: "_depositContract",
                type: "address"
            },
            {
                internalType: "contract IERC20MetadataUpgradeable",
                name: "_weth",
                type: "address"
            },
            {
                internalType: "address",
                name: "_treasury",
                type: "address"
            },
            {
                internalType: "address",
                name: "_updater",
                type: "address"
            },
            {
                internalType: "address",
                name: "_activator",
                type: "address"
            }
        ],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "lastEpochReported",
        outputs: [
            {
                internalType: "uint64",
                name: "",
                type: "uint64"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "liquidUnstakePool",
        outputs: [
            {
                internalType: "address payable",
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
                internalType: "address",
                name: "",
                type: "address"
            }
        ],
        name: "maxDeposit",
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
                internalType: "address",
                name: "",
                type: "address"
            }
        ],
        name: "maxMint",
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
                internalType: "address",
                name: "owner",
                type: "address"
            }
        ],
        name: "maxRedeem",
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
                internalType: "address",
                name: "owner",
                type: "address"
            }
        ],
        name: "maxWithdraw",
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
                internalType: "uint256",
                name: "shares",
                type: "uint256"
            },
            {
                internalType: "address",
                name: "receiver",
                type: "address"
            }
        ],
        name: "mint",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "name",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes",
                name: "",
                type: "bytes"
            }
        ],
        name: "nodePubkeyUsed",
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
                name: "assets",
                type: "uint256"
            }
        ],
        name: "previewDeposit",
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
                internalType: "uint256",
                name: "shares",
                type: "uint256"
            }
        ],
        name: "previewMint",
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
                internalType: "uint256",
                name: "shares",
                type: "uint256"
            }
        ],
        name: "previewRedeem",
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
                internalType: "uint256",
                name: "assets",
                type: "uint256"
            }
        ],
        name: "previewWithdraw",
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
                components: [
                    {
                        internalType: "bytes",
                        name: "pubkey",
                        type: "bytes"
                    },
                    {
                        internalType: "bytes",
                        name: "signature",
                        type: "bytes"
                    },
                    {
                        internalType: "bytes32",
                        name: "depositDataRoot",
                        type: "bytes32"
                    }
                ],
                internalType: "struct Staking.Node[]",
                name: "_nodes",
                type: "tuple[]"
            },
            {
                internalType: "uint256",
                name: "_requestPoolAmount",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_requestWithdrawalAmount",
                type: "uint256"
            },
            {
                internalType: "bytes32",
                name: "_depositContractRoot",
                type: "bytes32"
            }
        ],
        name: "pushToBeacon",
        outputs: [] as any,
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "shares",
                type: "uint256"
            },
            {
                internalType: "address",
                name: "receiver",
                type: "address"
            },
            {
                internalType: "address",
                name: "owner",
                type: "address"
            }
        ],
        name: "redeem",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address[]",
                name: "addresses",
                type: "address[]"
            }
        ],
        name: "removeFromWhitelist",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                internalType: "address",
                name: "account",
                type: "address"
            }
        ],
        name: "renounceRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "uint64",
                        name: "from",
                        type: "uint64"
                    },
                    {
                        internalType: "uint64",
                        name: "to",
                        type: "uint64"
                    },
                    {
                        internalType: "uint256",
                        name: "rewards",
                        type: "uint256"
                    },
                    {
                        internalType: "uint256",
                        name: "penalties",
                        type: "uint256"
                    }
                ],
                internalType: "struct Staking.EpochsReport",
                name: "_epochsReport",
                type: "tuple"
            },
            {
                internalType: "int256",
                name: "_estimatedRewardsPerSecond",
                type: "int256"
            }
        ],
        name: "reportEpochs",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_requestedETH",
                type: "uint256"
            }
        ],
        name: "requestEthFromLiquidPoolToWithdrawal",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                internalType: "address",
                name: "account",
                type: "address"
            }
        ],
        name: "revokeRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "rewardsFee",
        outputs: [
            {
                internalType: "uint16",
                name: "",
                type: "uint16"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "submitReportUnlockTime",
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
                internalType: "bytes4",
                name: "interfaceId",
                type: "bytes4"
            }
        ],
        name: "supportsInterface",
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
        inputs: [],
        name: "symbol",
        outputs: [
            {
                internalType: "string",
                name: "",
                type: "string"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "toggleWhitelistEnabled",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "totalAssets",
        outputs: [
            {
                internalType: "uint256",
                name: "assets",
                type: "uint256"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "totalNodesActivated",
        outputs: [
            {
                internalType: "uint32",
                name: "",
                type: "uint32"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "totalSupply",
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
        inputs: [],
        name: "totalUnderlying",
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
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "transfer",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "from",
                type: "address"
            },
            {
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "transferFrom",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "treasury",
        outputs: [
            {
                internalType: "address",
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
                internalType: "uint16",
                name: "_acceptableUnderlyingChange",
                type: "uint16"
            }
        ],
        name: "updateAcceptableUnderlyingChange",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint16",
                name: "_depositFee",
                type: "uint16"
            }
        ],
        name: "updateDepositFee",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "int256",
                name: "_estimatedRewardsPerSecond",
                type: "int256"
            }
        ],
        name: "updateEstimatedRewardsPerSecond",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address payable",
                name: "_liquidPool",
                type: "address"
            }
        ],
        name: "updateLiquidPool",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint16",
                name: "_rewardsFee",
                type: "uint16"
            }
        ],
        name: "updateRewardsFee",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address payable",
                name: "_withdrawal",
                type: "address"
            }
        ],
        name: "updateWithdrawal",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "whitelistEnabled",
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
                internalType: "address",
                name: "",
                type: "address"
            }
        ],
        name: "whitelistedAccounts",
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
                name: "assets",
                type: "uint256"
            },
            {
                internalType: "address",
                name: "receiver",
                type: "address"
            },
            {
                internalType: "address",
                name: "owner",
                type: "address"
            }
        ],
        name: "withdraw",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "withdrawal",
        outputs: [
            {
                internalType: "address payable",
                name: "",
                type: "address"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "withdrawalCredential",
        outputs: [
            {
                internalType: "bytes",
                name: "",
                type: "bytes"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        stateMutability: "payable",
        type: "receive"
    }
];
