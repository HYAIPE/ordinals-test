# ordinals-backend

Contains the backend logic for managing web3 users, information about supported mintable ordinal collections, and managing the state for the vast asynchronous inscription flow

Built on top of:

- DynamoDB for DB things
- S3 for storage of inscription transactions (which can be too big for DynamoDB)
- EventBus / SQS for eventing and queuing of work (for example, watching for funding onchain and managing the genesis / reveal flows for inscriptions)
- Bitcoin network related services (via mempool api)
