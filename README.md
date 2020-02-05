# EOSIO Service to monitor token transfers

![GitHub package.json version](https://img.shields.io/github/package-json/v/myx0m0p/TokenTransferOracle)
![GitHub](https://img.shields.io/github/license/myx0m0p/TokenTransferOracle)

This service monitors EOSIO chain actions and sends payload to DApp backend through Bull Queue service.   

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project for production uses.

### Prerequisites

EOSIO API node, you can use UOS Api node as an example:
```
https://api.uos.network:7889
``` 

[Bull Queue](https://github.com/OptimalBits/bull) uses [Redis](https://redis.io/) as a backend, so you will need an access to an instance.


### Installing

Clone the repository 

```
git clone https://github.com/myx0m0p/TokenTransferOracle.git
```

Create a `.env` file from `env.sample` and replace placeholders with actual values

```
NODE_ENV=development
API_URL=<EOSIO_API_NODE> - Your EOSIO api node url
LISTEN_ACTION=<eosio.token::transfer> - You can put any action here, format is <<contract>::<action>>
LISTEN_ACCOUNT=<ACCOUNT NAME> - EOSIO account name to monitor incoming actions
NOTIFICATION_URL=<BACKEND URL> - Your backend URL where do you want to send payloads
REDIS_HOST=<REDIS HOST> - Redis instance host
REDIS_PORT=<REDIS PORT> - Redis instance port
...
```

Then you can proceed with
```
npm install
```

### Running the service

This service consists of two workers, one for monitoring EOSIO chain state and another to process the queue of messages.

To start demux worker:
```
npm run demux
```

To start queue worker:
```
npm run queue
```

There is an [ecosystem config](ecosystem.config.js) for PM2 to start everything at once:
```
npx pm2 start ecosystem.config.js
```

## Sample payloads

Payloads received from EOSIO chain
```
payload:
{
  transactionId: 'c46524bdd2a81afd400bf97ca2983ea215e633927efcae21cd904eaa132b5451',
  actionIndex: 0,
  account: 'eosio.token',
  name: 'transfer',
  authorization: [ { actor: 'andrewufirst', permission: 'active' } ],
  data: { from: 'andrewufirst', to: 'u', quantity: '3.0000 UOS', memo: '3m' }
}
```
```
blockInfo:
{
  blockNumber: 14286200,
  blockHash: '00d9fd787adcc6664c2890de176613a5504c1ca1814ebd67688f1e0adb183bfb',
  previousBlockHash: '00d9fd77ce3b5acdcfc2f032da20b8990137b8639f2d147498f9366506ca76f5',
  timestamp: 2020-02-04T06:57:22.500Z
}
``` 
This is the payload to DApp backend
```
DApp payload:
{
  blockNumber: 14286200,
  blockHash: '00d9fd787adcc6664c2890de176613a5504c1ca1814ebd67688f1e0adb183bfb',
  blockTime: 2020-02-04T06:57:22.500Z,
  transactionId: 'c46524bdd2a81afd400bf97ca2983ea215e633927efcae21cd904eaa132b5451',
  transferFrom: 'andrewufirst',
  transferTo: 'u',
  transferQuantity: '3.0000 UOS',
  transferMemo: '3m'
}
```

## Deployment

For production, you can deploy it on Heroku or any other similar service. **npm start** target is optimized to run on Heroku.
```
"start": "pm2-runtime start ecosystem.config.js --env production"
```

## Built With

* [Demux-eos](https://github.com/EOSIO/demux-js-eos) - Demux-js Action Reader implementations for EOSIO blockchains.
* [Bull](https://github.com/OptimalBits/bull) - Premium Queue package for handling distributed jobs and messages in NodeJS.

## Help

- [Author](https://t.me/myx0m0p)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
