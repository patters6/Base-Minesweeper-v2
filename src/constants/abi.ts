export const BASE_SWEEPER_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalCheckIns",
        "type": "uint256"
      }
    ],
    "name": "CheckedIn",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "checkIn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_player",
        "type": "address"
      }
    ],
    "name": "getPlayerStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "lastCheckIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalCheckIns",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentStreak",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "players",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "lastCheckIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalCheckIns",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "currentStreak",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
