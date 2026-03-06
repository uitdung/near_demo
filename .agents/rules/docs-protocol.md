---
trigger: always_on
glob: 
description: docs protocol
---
# NEAR Protocol Documentation - Protocol & Tools

> Source: https://docs.near.org/llms.txt

---

## Core Protocol

- [Access Keys](https://docs.near.org/protocol/access-keys.md): Learn about NEAR's access key system with Full-Access Keys for complete account control and Function-Call Keys for restricted, shareable permissions to specific contracts.
- [Address (Account ID)](https://docs.near.org/protocol/account-id.md): Learn all about NEAR account addresses
- [NEAR Accounts](https://docs.near.org/protocol/account-model.md): Learn about NEAR Protocol's account model, including named and implicit accounts, access keys, permissions, and how NEAR accounts differ from other blockchain platforms.
- [Architecture](https://docs.near.org/protocol/architecture.md): A comprehensive high-level overview of NEAR Protocol's architecture
- [What is NEAR?](https://docs.near.org/protocol/basics.md): A scalable and secure chain with an amazing developer experience
- [NEAR Data Flow](https://docs.near.org/protocol/data-flow/near-data-flow.md): Learn how data flows in NEAR Protocol, including transactions, receipts, shards, and cross-shard communication.
- [Token Transfer](https://docs.near.org/protocol/data-flow/token-transfer-flow.md): Learn all steps involved on a token transfer.
- [Gas (Execution Fees)](https://docs.near.org/protocol/gas.md): Learn about NEAR's gas system - execution fees that prevent spam, incentivize developers with 30% of burned gas, and use deterministic gas units with dynamic pricing.
- [Epoch](https://docs.near.org/protocol/network/epoch.md): Learn about epochs in NEAR Protocol, including their duration, role in validator selection, and how they affect network operations and data retention.
- [NEAR Networks](https://docs.near.org/protocol/network/networks.md): Explore the different networks available in NEAR
- [Runtime](https://docs.near.org/protocol/network/runtime.md): Explore NEAR Protocol's runtime system, including core runtime operations, cross-contract calls, action and data receipts, and state management.
- [Validator Staking](https://docs.near.org/protocol/network/staking.md): Learn how to stake NEAR, delegate to validators, track rewards, and withdraw staked tokens safely.
- [Avoiding Token Loss](https://docs.near.org/protocol/network/token-loss.md): Learn about scenarios that can lead to token loss in NEAR Protocol and how to prevent them, including key management, account deletion, and smart contract failures.
- [Tokens](https://docs.near.org/protocol/network/tokens.md): Learn about NEAR's native token and its role in the network
- [Validators](https://docs.near.org/protocol/network/validators.md): Learn about NEAR Protocol validators, their roles in network security, consensus mechanisms, validator economics, and how to become a validator.
- [Decentralized Storage Solutions](https://docs.near.org/protocol/storage/storage-solutions.md): Explore decentralized storage alternatives for NEAR Protocol applications, including Arweave, Crust, and IPFS integration for cost-effective data storage.
- [Storage Staking](https://docs.near.org/protocol/storage/storage-staking.md): Learn about NEAR Protocol's storage staking mechanism, including costs, storage pricing, attack prevention, and strategies for managing on-chain data storage.
- [Anatomy of a Transaction](https://docs.near.org/protocol/transaction-anatomy.md): Learn about the structure and components of NEAR Protocol transactions, including signers, receivers, actions, and transaction validation fields.
- [Lifecycle of a Transaction](https://docs.near.org/protocol/transaction-execution.md): Learn how NEAR transactions are executed and finalized
- [Transactions](https://docs.near.org/protocol/transactions.md): Learn how users interact with NEAR through transactions composed of actions, signed with private keys, and processed by the network with deterministic gas costs.

---

## Chain Abstraction

- [What are Chain Signatures?](https://docs.near.org/chain-abstraction/chain-signatures.md): Learn how Chain Signatures enable NEAR accounts to sign and execute transactions across multiple blockchains using Multi-Party Computation for secure cross-chain operations.
- [Getting Started with Chain Signatures](https://docs.near.org/chain-abstraction/chain-signatures/getting-started.md): Learn how to sign and execute cross-chain transactions
- [Implementing Chain Signatures](https://docs.near.org/chain-abstraction/chain-signatures/implementation.md): Learn how to sign transactions across multiple blockchains.
- [Rollup Data Availability](https://docs.near.org/chain-abstraction/data-availability.md): Learn about NEAR's Data Availability layer for rollups.
- [FastAuth SDK](https://docs.near.org/chain-abstraction/fastauth-sdk.md): Learn about FastAuth SDK, a key management system that enables users to recover or sign up for NEAR accounts using their email address.
- [NEAR Intents](https://docs.near.org/chain-abstraction/intents/overview.md): Learn how the intents protocol works
- [Building a Meta Transaction Relayer](https://docs.near.org/chain-abstraction/meta-transactions-relayer.md): Learn how to build a meta transaction relayer.
- [Meta Transactions](https://docs.near.org/chain-abstraction/meta-transactions.md): Learn about NEP-366 meta transactions on NEAR.
- [How Omni Bridge Works](https://docs.near.org/chain-abstraction/omnibridge/how-it-works.md): Learn how Omni Bridge uses Chain Signatures to enable cross-chain transfers.
- [Implementation Details](https://docs.near.org/chain-abstraction/omnibridge/implementation-details.md): Explore Omni Bridge's technical architecture
- [Omni Bridge Overview](https://docs.near.org/chain-abstraction/omnibridge/overview.md): Learn about Omni Bridge, a multi-chain asset bridge.
- [Omni Bridge Roadmap](https://docs.near.org/chain-abstraction/omnibridge/roadmap.md): Explore the Omni Bridge roadmap.
- [What is Chain Abstraction?](https://docs.near.org/chain-abstraction/what-is.md): Learn how NEAR allows you to seamlessly work across all chains

---

## Web3 Applications

- [Authenticate NEAR Users](https://docs.near.org/web3-apps/backend/backend-login.md): Learn how to authenticate NEAR users in your backend service.
- [Handling NEAR Types](https://docs.near.org/web3-apps/concepts/data-types.md): Learn how to handle common data types when interacting with NEAR
- [Web Login Methods](https://docs.near.org/web3-apps/concepts/web-login.md): Learn all the login options available for your website or web app
- [Your First Web3 App](https://docs.near.org/web3-apps/quickstart.md): Quick guide to create a Web3 frontend application with NEAR integration.
- [Introduction](https://docs.near.org/web3-apps/tutorials/localnet/introduction.md): Learn what is localnet on NEAR.
- [Run Your Own Localnet](https://docs.near.org/web3-apps/tutorials/localnet/run.md): Learn how to run a localnet on NEAR.
- [Wallet Login](https://docs.near.org/web3-apps/tutorials/wallet-login.md): Connect users to NEAR wallets with a secure connector library
- [What are Web3 Apps?](https://docs.near.org/web3-apps/what-is.md): Learn about Web3 applications (dApps).

---

## Developer Tools

- [Clear Contract State](https://docs.near.org/tools/clear-state.md): Clean up a contract's state.
- [Explorer](https://docs.near.org/tools/explorer.md): Explore the chain through a Web UI.
- [NEAR API](https://docs.near.org/tools/near-api.md): Learn to use APIs in JavaScript, Rust, and Python to interact with the blockchain.
- [NEAR CLI](https://docs.near.org/tools/near-cli.md): Interact with NEAR through the terminal.
- [NEAR SDK](https://docs.near.org/tools/sdk.md): Choose an SDK to start building contracts.

---

[Index](index.md)
