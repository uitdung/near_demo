---
trigger: always_on
glob: 
description: docs data integration
---
# NEAR Protocol Documentation - Data & Integration

> Source: https://docs.near.org/llms.txt

---

## Data Infrastructure

- [BigQuery Public Dataset](https://docs.near.org/data-infrastructure/big-query.md): Learn how to use NEAR Protocol's BigQuery public dataset for blockchain data analysis.
- [Data APIs](https://docs.near.org/data-infrastructure/data-apis.md): Explore community-built APIs for accessing on-chain data
- [Existing Services](https://docs.near.org/data-infrastructure/data-services.md): Indexers are constantly listening for transactions and storing them so they can be easily queried
- [Introduction to Indexers](https://docs.near.org/data-infrastructure/indexers.md): Learn about blockchain indexers, how they work with NEAR Protocol, the difference between pull and push models, and when to use indexers for data querying.
- [NEAR Lake Indexer](https://docs.near.org/data-infrastructure/lake-framework/near-lake.md): Learn how NEAR Lake indexes the network
- [What is NEAR Indexer?](https://docs.near.org/data-infrastructure/near-indexer.md): A framework to handle real-time events on the blockchain
- [What is Lake Framework?](https://docs.near.org/data-infrastructure/near-lake-framework.md): A library to build your own indexer using the existing Data Lake
- [Tutorial: Simple Indexer](https://docs.near.org/data-infrastructure/tutorials/listen-function-calls.md): Build a simple indexer using NEAR Lake Framework
- [Tutorial: Creating an Indexer](https://docs.near.org/data-infrastructure/tutorials/listen-to-realtime-events.md): Build an indexer using NEAR Indexer Framework
- [NFT Indexer](https://docs.near.org/data-infrastructure/tutorials/nft-indexer.md): Build a simple NFT indexer with NEAR Lake Framework
- [NFT indexer for Python](https://docs.near.org/data-infrastructure/tutorials/python-nft-indexer.md): Build a Python NFT indexer NEAR Lake Framework
- [Credentials](https://docs.near.org/data-infrastructure/tutorials/running-near-lake/credentials.md): Learn how to provide AWS credentials to access NEAR Lake data
- [Start options](https://docs.near.org/data-infrastructure/tutorials/running-near-lake/lake-start-options.md): Learn how to create an indexer using NEAR Lake Framework
- [Running Lake Indexer](https://docs.near.org/data-infrastructure/tutorials/running-near-lake/run-lake-indexer.md): Set up and run a NEAR Lake Indexer
- [Tutorial: State Changes](https://docs.near.org/data-infrastructure/tutorials/state-changes.md): Build a simple indexer using NEAR Lake Framework
- [What is Data Infrastructure?](https://docs.near.org/data-infrastructure/what-is.md): Explore NEAR's data infrastructure for accessing on-chain data

---

## API Reference

- [Access Keys](https://docs.near.org/api/rpc/access-keys.md): Learn how to retrieve and track NEAR account access keys using the RPC
- [Block / Chunk](https://docs.near.org/api/rpc/block-chunk.md): Learn how to retrieve details about blocks and chunks from the RPC
- [Accounts / Contracts](https://docs.near.org/api/rpc/contracts.md): Learn to query information from accounts and contracts using the RPC
- [RPC Errors](https://docs.near.org/api/rpc/errors.md): Understand common RPC errors and how to handle them.
- [Gas](https://docs.near.org/api/rpc/gas.md): Query gas prices for specific blocks or hashes using the NEAR RPC API.
- [NEAR RPC API](https://docs.near.org/api/rpc/introduction.md): Learn how to interact with the NEAR network using the RPC API, including available providers, node snapshots, and quick links to all RPC endpoints.
- [Maintenance Windows](https://docs.near.org/api/rpc/maintenance-windows.md): Query future maintenance windows for validators in the current epoch using the NEAR RPC API.
- [Network](https://docs.near.org/api/rpc/network.md): Query node status, network connections, and active validators using the RPC
- [Protocol](https://docs.near.org/api/rpc/protocol.md): Learn how to retrieve the genesis and current protocol configurations
- [RPC Providers](https://docs.near.org/api/rpc/providers.md): Discover NEAR RPC providers for mainnet and testnet
- [Setup](https://docs.near.org/api/rpc/setup.md): Learn how to configure NEAR RPC endpoints and test API requests
- [Transactions](https://docs.near.org/api/rpc/transactions.md): Send transactions and query their status using the RPC

---

## Integration Examples

- [Accounts](https://docs.near.org/integrations/accounts.md): NEAR account management for exchanges and integrations
- [Balance changes](https://docs.near.org/integrations/balance-changes.md): Query and track account balances in NEAR protocol, including native NEAR tokens, fungible tokens, and balance management for integrations.
- [Create Transactions](https://docs.near.org/integrations/create-transactions.md): Create, sign, and send transactions on NEAR protocol.
- [Source Code Survey](https://docs.near.org/integrations/errors/error-implementation.md): Proper error handling in NEAR protocol applications
- [Introduction](https://docs.near.org/integrations/errors/introduction.md): Common error patterns in NEAR protocol integrations
- [Avoiding Token Loss](https://docs.near.org/integrations/errors/token-loss.md): Prevent token loss in NEAR protocol integrations
- [Exchange Integration](https://docs.near.org/integrations/exchange-integration.md): Integrate NEAR Protocol into exchanges
- [Integrator FAQ](https://docs.near.org/integrations/faq.md): Frequently asked questions about NEAR protocol integrations
- [Fungible tokens](https://docs.near.org/integrations/fungible-tokens.md): Integrate NEAR tokens (NEAR, FT, and NFT) into your application
- [Implicit Accounts](https://docs.near.org/integrations/implicit-accounts.md): Learn about implicit accounts and how they work with Ethereum-style addresses

---

[Index](index.md)
