# NEAR Protocol Documentation

> NEAR is a layer-1 blockchain built for scale and multichain compatibility,
> featuring AI-native infrastructure and chain abstraction capabilities.
> This documentation covers smart contracts, Web3 applications, AI agents,
> cross-chain development, and the complete NEAR ecosystem.

NEAR Protocol is a proof-of-stake blockchain that enables developers to build
decentralized applications with seamless user experiences. Key features include
human-readable account names, minimal transaction fees, and built-in developer
tools. The platform supports multiple programming languages and provides chain
abstraction for cross-blockchain interactions.

This documentation is organized into several main sections: Protocol fundamentals,
AI and agent development, chain abstraction features, smart contract development,
Web3 application building, and comprehensive API references. Each section includes
tutorials, examples, and detailed technical specifications.


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

## AI and Agents
- [AI and NEAR](https://docs.near.org/ai/introduction.md): Introduction to NEAR's User-Owned AI vision, featuring Shade Agents and NEAR AI.
- [NEAR MCP Server](https://docs.near.org/ai/near-mcp.md): Equip AI agents with tools for using the NEAR blockchain via Model Context Protocol (MCP).
- [AI Inference](https://docs.near.org/ai/shade-agents/concepts/ai-inference.md): Learn how to use AI with Shade Agents.
- [Framework Overview](https://docs.near.org/ai/shade-agents/concepts/framework-overview.md): Learn about the core components of the Shade Agent Framework with a high-level overview of each of its parts.
- [Security Considerations](https://docs.near.org/ai/shade-agents/concepts/security.md): Learn key security practices when deploying Shade Agents, including preventing duplicate actions, handling failed or unsent transactions, restricting API routes, removing agent contract keys, removing local deployment, approved measurements limits, public logs, storing agent keys, public PPIDs, fixed Docker images, trusting RPCs, and verifying the state.
- [Terminology](https://docs.near.org/ai/shade-agents/concepts/terminology.md): Learn the key terms and concepts used in the Shade Agent Framework.
- [What can you Build?](https://docs.near.org/ai/shade-agents/concepts/what-can-you-build.md): Explore the features of Shade Agents and what they enable you to build, including Agentic Protocols, autonomous yield optimizers, and verifiable oracles.
- [Shade Agents](https://docs.near.org/ai/shade-agents/getting-started/introduction.md): Learn about Shade Agents - decentralized and trustless AI agents that control accounts and assets across multiple blockchains using TEEs and NEAR's decentralized key management.
- [Key Components](https://docs.near.org/ai/shade-agents/getting-started/quickstart/components.md): Learn about the components of a simple Shade Agent.
- [Deploying an Agent](https://docs.near.org/ai/shade-agents/getting-started/quickstart/deploying.md): Learn how to quickly deploy your first Shade Agent.
- [Agent Contract](https://docs.near.org/ai/shade-agents/reference/agent-contract.md): Review the agent contract template for the Shade Agent Framework.
- [Shade Agent API](https://docs.near.org/ai/shade-agents/reference/api.md): Use the Shade Agent API (TypeScript/JavaScript) to connect your agent to the Shade Agent Framework
- [Shade Agent CLI](https://docs.near.org/ai/shade-agents/reference/cli.md): Use the Shade Agent CLI to deploy your Shade Agent.
- [DAO Agent Contract](https://docs.near.org/ai/shade-agents/tutorials/ai-dao/dao-agent-contract.md): Learn about the key parts of the agent contract as part of the Verifiable AI DAO Shade Agent tutorial, including how to create a custom agent contract and create a yield and resume-based Shade Agent.
- [DAO Agent](https://docs.near.org/ai/shade-agents/tutorials/ai-dao/dao-agent.md): Learn about the key parts of the agent as part of the Verifiable AI DAO Shade tutorial that walks through how to index the agent contract, using verifiable AI, and interacting with the custom agent contract.
- [Deploying the AI DAO](https://docs.near.org/ai/shade-agents/tutorials/ai-dao/deploying.md): Learn how to deploy the Verifiable AI DAO Shade Agent which includes how to deploy a custom agent contract.
- [Overview](https://docs.near.org/ai/shade-agents/tutorials/ai-dao/overview.md): A brief overview of the Verifiable AI DAO tutorial built using the Shade Agent Framework that walks through NEAR native deployments, using yield and resume with Shade Agents and leveraging verifiable AI.
- [Tutorials and Templates](https://docs.near.org/ai/shade-agents/tutorials/tutorials-overview.md): Review the list of our Shade Agent tutorials and templates.
- [Using NEAR documentation with your AI Coding Agents](https://docs.near.org/ai/using-llms.md): Using llms.txt to improve your workflow when using AI coding agents.

## Chain Abstraction
- [What are Chain Signatures?](https://docs.near.org/chain-abstraction/chain-signatures.md): Learn how Chain Signatures enable NEAR accounts to sign and execute transactions across multiple blockchains using Multi-Party Computation for secure cross-chain operations.
- [Getting Started with Chain Signatures](https://docs.near.org/chain-abstraction/chain-signatures/getting-started.md): Learn how to sign and execute cross-chain transactions
- [Implementing Chain Signatures](https://docs.near.org/chain-abstraction/chain-signatures/implementation.md): Learn how to sign transactions across multiple blockchains.
- [Rollup Data Availability](https://docs.near.org/chain-abstraction/data-availability.md): Learn about NEAR's Data Availability layer for rollups, including blob store contracts, light clients, RPC nodes, and integrations with L2 solutions like Polygon CDK and Optimism.
- [FastAuth SDK](https://docs.near.org/chain-abstraction/fastauth-sdk.md): Learn about FastAuth SDK, a key management system that enables users to recover or sign up for NEAR accounts using their email address.
- [NEAR Intents](https://docs.near.org/chain-abstraction/intents/overview.md): Learn how the intents protocol works
- [Building a Meta Transaction Relayer](https://docs.near.org/chain-abstraction/meta-transactions-relayer.md): Learn how to build a meta transaction relayer that allows users to transact on NEAR without paying gas fees while maintaining transaction security through signed delegates.
- [Meta Transactions](https://docs.near.org/chain-abstraction/meta-transactions.md): Learn about NEP-366 meta transactions on NEAR, allowing users to execute transactions without owning gas tokens by using relayers to cover transaction fees.
- [How Omni Bridge Works](https://docs.near.org/chain-abstraction/omnibridge/how-it-works.md): Learn how Omni Bridge uses Chain Signatures to enable cross-chain transfers.
- [Implementation Details](https://docs.near.org/chain-abstraction/omnibridge/implementation-details.md): Explore Omni Bridge's technical architecture
- [Omni Bridge Overview](https://docs.near.org/chain-abstraction/omnibridge/overview.md): Learn about Omni Bridge, a multi-chain asset bridge that enables secure and efficient transfers between blockchain networks using Chain Signatures and MPC technology.
- [Omni Bridge Roadmap](https://docs.near.org/chain-abstraction/omnibridge/roadmap.md): Explore the Omni Bridge roadmap, including hybrid architecture launch, Chain Signatures migration path, and future development plans for cross-chain infrastructure.
- [What is Chain Abstraction?](https://docs.near.org/chain-abstraction/what-is.md): Learn how NEAR allows you to seamlessly work across all chains

## Smart Contracts
- [Transfers & Actions](https://docs.near.org/smart-contracts/anatomy/actions.md): Learn how contracts can make transfers, call other contracts, and more
- [Basic Anatomy](https://docs.near.org/smart-contracts/anatomy/anatomy.md): Learn the basic anatomy of all smart contracts.
- [Best Practices](https://docs.near.org/smart-contracts/anatomy/best-practices.md): A collection of best practices for writing smart contracts on NEAR.
- [Collections](https://docs.near.org/smart-contracts/anatomy/collections.md): Efficiently store, access, and manage data in smart contracts.
- [Cross-Contract Calls](https://docs.near.org/smart-contracts/anatomy/crosscontract.md): Contract can interact with other contracts on the network
- [Environment](https://docs.near.org/smart-contracts/anatomy/environment.md): Know which account called you, how much gas and tokens were attached, and more.
- [External Interface](https://docs.near.org/smart-contracts/anatomy/functions.md): Learn how to define your contract's interface.
- [Reducing Contract Size](https://docs.near.org/smart-contracts/anatomy/reduce-size.md): Learn strategies to reduce NEAR smart contract size for optimized deployment and performance.
- [Reproducible Builds](https://docs.near.org/smart-contracts/anatomy/reproducible-builds.md): Create identical builds across different developer environments.
- [Serialization Protocols](https://docs.near.org/smart-contracts/anatomy/serialization-protocols.md): Learn which protocols smart contracts use to serialize data.
- [Notes on Serialization](https://docs.near.org/smart-contracts/anatomy/serialization.md): Learn how contract serialize data for function calls and storage.
- [State](https://docs.near.org/smart-contracts/anatomy/storage.md): Explore how NEAR smart contracts manage their state.
- [SDK Types](https://docs.near.org/smart-contracts/anatomy/types.md): Learn everything the SDK has to offer to efficiently store data.
- [Yield and Resume](https://docs.near.org/smart-contracts/anatomy/yield-resume.md): Wait for an external response and resume execution
- [Contracts List](https://docs.near.org/smart-contracts/contracts-list.md): Explore NEAR contracts deployed across projects.
- [Global Contracts](https://docs.near.org/smart-contracts/global-contracts.md): Deploy a contract once and reuse it across accounts.
- [Your First Smart Contract](https://docs.near.org/smart-contracts/quickstart.md): Create your first contract using your favorite language.
- [Deploying](https://docs.near.org/smart-contracts/release/deploy.md): Deploy a contract to the network.
- [Locking Accounts](https://docs.near.org/smart-contracts/release/lock.md): Learn how to lock NEAR smart contracts to prevent unauthorized modifications and ensure contract immutability when needed.
- [Updating Contracts](https://docs.near.org/smart-contracts/release/upgrade.md): Learn how to upgrade NEAR smart contracts safely, including programmatic updates, migration strategies, and best practices for contract versioning.
- [Cross-Contract Calls](https://docs.near.org/smart-contracts/security/callbacks.md): Learn about callback security in NEAR smart contracts, including proper error handling, state management, and preventing callback-related vulnerabilities.
- [✅ Checklist](https://docs.near.org/smart-contracts/security/checklist.md): Best practices for security and common safeguards.
- [Front Running](https://docs.near.org/smart-contracts/security/frontrunning.md): Learn about frontrunning attacks in NEAR smart contracts and how to prevent them with proper transaction ordering and MEV protection techniques.
- [Ensure it is the User (1yⓃ)](https://docs.near.org/smart-contracts/security/one-yocto.md): Learn about the one yocto security pattern in NEAR smart contracts for verifying account ownership and preventing unauthorized access.
- [Random Numbers](https://docs.near.org/smart-contracts/security/random.md): Learn about secure random number generation in NEAR smart contracts and how to avoid predictable randomness vulnerabilities.
- [Reentrancy Attacks](https://docs.near.org/smart-contracts/security/reentrancy.md): Learn about reentrancy attacks in NEAR smart contracts and how to prevent them with proper security measures and coding practices.
- [Million Small Deposits](https://docs.near.org/smart-contracts/security/storage.md): Learn about storage security best practices in NEAR smart contracts, including storage costs, state management, and preventing storage-related vulnerabilities.
- [Sybil Attacks](https://docs.near.org/smart-contracts/security/sybil.md): Learn about sybil attacks in NEAR smart contracts and how to prevent them with proper identity verification and anti-gaming mechanisms.
- [Security](https://docs.near.org/smart-contracts/security/welcome.md): Learn about smart contract security best practices on NEAR, including common vulnerabilities, attack vectors, and how to build secure decentralized applications.
- [Integration Tests](https://docs.near.org/smart-contracts/testing/integration-test.md): Learn how to write and run integration tests for NEAR smart contracts using Sandbox testing and realistic blockchain environments.
- [Introduction](https://docs.near.org/smart-contracts/testing/introduction.md): Learn about testing NEAR smart contracts, including unit tests, integration tests, and best practices for ensuring contract reliability and security.
- [Unit Testing](https://docs.near.org/smart-contracts/testing/unit-test.md): Learn how to write and run unit tests for NEAR smart contracts to test individual methods and functions in isolation.
- [Using our Basic Examples](https://docs.near.org/smart-contracts/tutorials/basic-contracts.md): Learn NEAR smart contract basics through practical examples: Counter, Guest Book, Donation, Coin Flip, and Hello World.
- [What is a Smart Contract?](https://docs.near.org/smart-contracts/what-is.md): Learn about the apps that can live in our accounts.

## Web3 Applications
- [Authenticate NEAR Users](https://docs.near.org/web3-apps/backend/backend-login.md): Learn how to authenticate NEAR users in your backend service by creating challenges, requesting wallet signatures, and verifying signatures.
- [Handling NEAR Types](https://docs.near.org/web3-apps/concepts/data-types.md): Learn how to handle common data types when interacting with NEAR
- [Web Login Methods](https://docs.near.org/web3-apps/concepts/web-login.md): Learn all the login options available for your website or web app
- [Your First Web3 App](https://docs.near.org/web3-apps/quickstart.md): Quick guide to create a Web3 frontend application with NEAR integration - build a React/Next.js app where users can login with wallets and interact with smart contracts.
- [Introduction](https://docs.near.org/web3-apps/tutorials/localnet/introduction.md): Learn what is localnet on NEAR.
- [Run Your Own Localnet](https://docs.near.org/web3-apps/tutorials/localnet/run.md): Learn how to run a localnet on NEAR.
- [Wallet Login](https://docs.near.org/web3-apps/tutorials/wallet-login.md): Connect users to NEAR wallets with a secure, sandbox-based connector library
- [What are Web3 Apps?](https://docs.near.org/web3-apps/what-is.md): Learn about Web3 applications (dApps) that leverage smart contracts and blockchain data to offer transparency, security, and user control over assets and data.

## Tokens and Primitives
- [Decentralized Autonomous Organizations](https://docs.near.org/primitives/dao.md): Learn about Decentralized Autonomous Organizations (DAOs) on NEAR - self-organized groups that coordinate membership, decision-making, and funding through smart contract voting.
- [Decentralized Exchanges (DEX)](https://docs.near.org/primitives/dex.md): Learn how to interact with decentralized exchanges on NEAR Protocol, including token swapping, liquidity pools, and integration with Ref Finance DEX.
- [Decentralized Identifiers (DIDs)](https://docs.near.org/primitives/did.md): Learn about W3C-compliant identity resolution on NEAR.
- [Using FTs](https://docs.near.org/primitives/ft/ft.md): Learn how to create, transfer, and integrate FT in your dApp
- [Create FT using Contract Tools](https://docs.near.org/primitives/ft/sdk-contract-tools.md): Learn how to create a fungible token (FT) using Contract Tools package
- [The Standard](https://docs.near.org/primitives/ft/standard.md): Learn how Fungible Tokens (FT) are defined on NEAR
- [Using Linkdrops](https://docs.near.org/primitives/linkdrop/linkdrop.md): Learn about linkdrops following NEP-452 standard - distribute assets and onboard users to Web3 apps through simple web links using access keys and the Keypom platform.
- [The Standard](https://docs.near.org/primitives/linkdrop/standard.md): Learn how Linkdrops are defined on NEAR
- [Deploying Your Own Contract](https://docs.near.org/primitives/liquid-staking/deploy-your-own-contract.md): Learn how to deploy your own Liquid Staking Contract on NEAR
- [Using Liquid Staking](https://docs.near.org/primitives/liquid-staking/liquid-staking.md): Learn about Liquid Staking on NEAR — a smart contract that issues a fungible token representing staked NEAR, enabling instant liquidity and validator diversification.
- [Introduction](https://docs.near.org/primitives/lockup/introduction.md): Learn about Lockup contracts on NEAR – smart contracts that escrow tokens with time-based release schedules, supporting lockups, vesting, staking, and termination by foundation.
- [Lockup Contracts](https://docs.near.org/primitives/lockup/lockup.md): Learn about Lockup contracts on NEAR – smart contracts that escrow tokens with time-based release schedules, supporting lockups, vesting, staking, and termination by foundation.
- [Create NFT using Contract Tools](https://docs.near.org/primitives/nft/nft-contract-tools.md): Learn how to create a non-fungible token (NFT) using Contract Tools package
- [Using NFTs](https://docs.near.org/primitives/nft/nft.md): Learn about NEAR non-fungible tokens (NFT) following NEP-171 and NEP-177 standards - mint, transfer, query, and trade unique digital assets with comprehensive examples.
- [The Standard](https://docs.near.org/primitives/nft/standard.md): Learn how Non-Fungible Tokens (NFT) are defined on NEAR
- [Oracles](https://docs.near.org/primitives/oracles.md): Learn about blockchain oracles on NEAR Protocol, including price feeds, data integration, and using oracle services like NearDefi Price Oracle and Pyth Network.
- [What are Primitives?](https://docs.near.org/primitives/what-is.md): Learn about blockchain primitives including Fungible Tokens (FT), Non-Fungible Tokens (NFT), Decentralized Autonomous Organizations (DAO), and LinkDrops as building blocks for applications.

## Developer Tools
- [Clear Contract State](https://docs.near.org/tools/clear-state.md): Clean up a contract's state.
- [Explorer](https://docs.near.org/tools/explorer.md): Explore the chain through a Web UI.
- [NEAR API](https://docs.near.org/tools/near-api.md): Learn to use APIs in JavaScript, Rust, and Python to interact with the blockchain.
- [NEAR CLI](https://docs.near.org/tools/near-cli.md): Interact with NEAR through the terminal.
- [NEAR SDK](https://docs.near.org/tools/sdk.md): Choose an SDK to start building contracts.

## Tutorials and Examples
- [Auction factory](https://docs.near.org/tutorials/auction/auction-factory.md): Create new auctions through a factory.
- [Basic Auction](https://docs.near.org/tutorials/auction/basic-auction.md): Learn how to build n auction smart contract on NEAR.
- [Bidding with FTs](https://docs.near.org/tutorials/auction/bidding-with-fts.md): Learn how to enable bidding with fungible tokens
- [Creating a Frontend](https://docs.near.org/tutorials/auction/creating-a-frontend.md): Lets create a frontend for our auction using React.
- [Deploying to Testnet](https://docs.near.org/tutorials/auction/deploy.md): Lets deploy our action contract to testnet.
- [Indexing Historical Data](https://docs.near.org/tutorials/auction/indexing-historical-data.md): Using data apis to retrieve the history of auctions
- [A Step-by-Step Guide to Mastering NEAR](https://docs.near.org/tutorials/auction/introduction.md): Build a full web3 app, from its contract to a frontend using indexers.
- [Sandbox Testing](https://docs.near.org/tutorials/auction/sandbox-testing.md): Lets test our contract in a realistic sandbox environment.
- [Updating the Frontend](https://docs.near.org/tutorials/auction/updating-the-frontend.md): Update the frontend to display the new token information.
- [Winning an NFT](https://docs.near.org/tutorials/auction/winning-an-nft.md): Lets make the auction winner get an NFT.
- [Controlling a NEAR account](https://docs.near.org/tutorials/controlling-near-accounts/introduction.md): Learn to control a NEAR account securely using Multi-Party Computation.
- [Transfer Near tokens on behalf of a controlled account](https://docs.near.org/tutorials/controlling-near-accounts/transfer.md): Build transaction arguments, request MPC signatures, and broadcast signed NEAR token transfers securely.
- [Complex Cross Contract Call](https://docs.near.org/tutorials/examples/advanced-xcc.md): Batching, parallel actions, and callback handling.
- [Factory](https://docs.near.org/tutorials/examples/factory.md): Learn how a factory contract deploys other contracts on sub-accounts using a global contract ID.
- [Frontend Interacting with Multiple Contracts](https://docs.near.org/tutorials/examples/frontend-multiple-contracts.md): Interact with multiple contracts in your frontend.
- [Global Contracts](https://docs.near.org/tutorials/examples/global-contracts.md): Learn how to deploy a Global contract and use it from another account.
- [Near Drop](https://docs.near.org/tutorials/examples/near-drop.md): Learn how NEAR Drop enables token drops (NEAR, FT, NFT) claimable via private keys.
- [Self Upgrade & State Migration](https://docs.near.org/tutorials/examples/update-contract-migrate-state.md): Learn NEAR smart contract upgrades, including self-updating contracts, state migration, and versioning patterns.
- [Cross Contract Call](https://docs.near.org/tutorials/examples/xcc.md): Learn how to perform a basic cross-contract call on NEAR to set and retrieve greetings.
- [Fungible Tokens Zero to Hero](https://docs.near.org/tutorials/fts.md): Master NEAR fungible tokens from pre-deployed contracts to building fully-featured FT smart contracts.
- [Near Multi-Chain DAO Governance](https://docs.near.org/tutorials/multichain-dao/introduction.md): Learn how Abstract DAO enables a single vote on NEAR to execute actions across multiple EVM chains.
- [Abstract DAO: Requests](https://docs.near.org/tutorials/multichain-dao/request.md): Learn how to create a signature request in Abstract DAO to execute actions on foreign EVM chains.
- [Abstract Dao: Signatures](https://docs.near.org/tutorials/multichain-dao/signing.md): Learn how to sign Abstract DAO requests for different chains and relay them to target EVM networks.
- [MultiSig Voting](https://docs.near.org/tutorials/multichain-dao/voting.md): Learn how to deploy a MultiSig contract and vote on multi-chain proposals using the Abstract DAO.
- [NFT Zero to Hero JavaScript Edition](https://docs.near.org/tutorials/nfts-js.md): Learn NFTs from minting to building a full-featured smart contract in this Zero to Hero series.
- [NFT Zero to Hero](https://docs.near.org/tutorials/nfts.md): Learn how to mint NFTs and build a full NFT contract step by step.
- [Create a NEAR Account](https://docs.near.org/tutorials/protocol/create-account.md): Understand how to create a NEAR account using a wallet and the NEAR CLI
- [Importing a NEAR Account](https://docs.near.org/tutorials/protocol/importing-account.md): Learn how to import an existing NEAR account into a wallet or the CLI

## API Reference
- [Access Keys](https://docs.near.org/api/rpc/access-keys.md): Learn how to retrieve and track NEAR account access keys using the RPC
- [Block / Chunk](https://docs.near.org/api/rpc/block-chunk.md): Learn how to retrieve details about blocks and chunks from the RPC
- [Accounts / Contracts](https://docs.near.org/api/rpc/contracts.md): Learn to query information from accounts and contracts using the RPC
- [RPC Errors](https://docs.near.org/api/rpc/errors.md): Understand common RPC errors and how to handle them.
- [Gas](https://docs.near.org/api/rpc/gas.md): Query gas prices for specific blocks or hashes using the NEAR RPC API.
- [NEAR RPC API](https://docs.near.org/api/rpc/introduction.md): Learn how to interact with the NEAR network using the RPC API, including available providers, node snapshots, and quick links to all RPC endpoints.
- [Maintenance Windows](https://docs.near.org/api/rpc/maintenance-windows.md): Query future maintenance windows for validators in the current epoch using the NEAR RPC API.
- [Network](https://docs.near.org/api/rpc/network.md): Query node status, network connections, and active validators using the RPC.
- [Protocol](https://docs.near.org/api/rpc/protocol.md): Learn how to retrieve the genesis and current protocol configurations
- [RPC Providers](https://docs.near.org/api/rpc/providers.md): Discover NEAR RPC providers for mainnet and testnet
- [Setup](https://docs.near.org/api/rpc/setup.md): Learn how to configure NEAR RPC endpoints and test API requests
- [Transactions](https://docs.near.org/api/rpc/transactions.md): Send transactions and query their status using the RPC

## Data Infrastructure
- [BigQuery Public Dataset](https://docs.near.org/data-infrastructure/big-query.md): Learn how to use NEAR Protocol's BigQuery public dataset for blockchain data analysis, including querying on-chain data, understanding costs, and accessing historical transaction data.
- [Data APIs](https://docs.near.org/data-infrastructure/data-apis.md): Explore community-built APIs for accessing on-chain data
- [Existing Services](https://docs.near.org/data-infrastructure/data-services.md): Indexers are constantly listening for transactions and storing them so they can be easily queried.
- [Introduction to Indexers](https://docs.near.org/data-infrastructure/indexers.md): Learn about blockchain indexers, how they work with NEAR Protocol, the difference between pull and push models, and when to use indexers for data querying.
- [NEAR Lake Indexer](https://docs.near.org/data-infrastructure/lake-framework/near-lake.md): Learn how NEAR Lake indexes the network
- [What is NEAR Indexer?](https://docs.near.org/data-infrastructure/near-indexer.md): A framework to handle real-time events on the blockchain
- [What is Lake Framework?](https://docs.near.org/data-infrastructure/near-lake-framework.md): A library to build your own indexer using the existing Data Lake
- [Tutorial: Simple Indexer](https://docs.near.org/data-infrastructure/tutorials/listen-function-calls.md): This tutorial will guide you through building a simple indexer using the NEAR Lake Framework. The indexer will listen for FunctionCalls on a specific contract and log the details of each call.
- [Tutorial: Creating an Indexer](https://docs.near.org/data-infrastructure/tutorials/listen-to-realtime-events.md): This tutorial will guide you through building an indexer using the NEAR Indexer Framework. The indexer will listen for FunctionCalls on a specific contract and log the details of each call.
- [NFT Indexer](https://docs.near.org/data-infrastructure/tutorials/nft-indexer.md): Learn to build a simple NFT indexer with NEAR Lake Framework.
- [NFT indexer for Python](https://docs.near.org/data-infrastructure/tutorials/python-nft-indexer.md): Learn to build a Python NFT indexer with NEAR Lake Framework
- [Credentials](https://docs.near.org/data-infrastructure/tutorials/running-near-lake/credentials.md): Learn how to provide AWS credentials to access NEAR Lake data
- [Start options](https://docs.near.org/data-infrastructure/tutorials/running-near-lake/lake-start-options.md): Learn how to create an indexer using the NEAR Lake Framework.
- [Running Lake Indexer](https://docs.near.org/data-infrastructure/tutorials/running-near-lake/run-lake-indexer.md): Learn how to set up and run a NEAR Lake Indexer, including prerequisites, network configuration, and commands for syncing from the latest or a specific block.
- [Tutorial: State Changes](https://docs.near.org/data-infrastructure/tutorials/state-changes.md): This tutorial will guide you through building a simple indexer using the NEAR Lake Framework. The indexer will listen for StateChange events and print relevant data about account changes.
- [What is Data Infrastructure?](https://docs.near.org/data-infrastructure/what-is.md): Explore NEAR's data infrastructure for accessing on-chain data

## Integration Examples
- [Accounts](https://docs.near.org/integrations/accounts.md): Learn about NEAR account management for exchanges and integrations, including account creation, key management, and balance tracking.
- [Balance changes](https://docs.near.org/integrations/balance-changes.md): Learn how to query and track account balances in NEAR protocol, including native NEAR tokens, fungible tokens, and balance management for integrations.
- [Create Transactions](https://docs.near.org/integrations/create-transactions.md): Learn how to create, sign, and send transactions on NEAR protocol, including transaction structure, actions, and best practices for integration.
- [Source Code Survey](https://docs.near.org/integrations/errors/error-implementation.md): Learn how to properly implement error handling in NEAR protocol applications, including best practices for catching and managing errors.
- [Introduction](https://docs.near.org/integrations/errors/introduction.md): Learn about common error patterns in NEAR protocol integrations and how to handle and troubleshoot issues in your applications.
- [Avoiding Token Loss](https://docs.near.org/integrations/errors/token-loss.md): Learn how to prevent and handle token loss scenarios in NEAR protocol integrations, including common causes and recovery strategies.
- [Exchange Integration](https://docs.near.org/integrations/exchange-integration.md): Learn how to integrate NEAR Protocol into exchanges, including transactions, accounts, tokens, blocks, finality, archival nodes, and staking.
- [Integrator FAQ](https://docs.near.org/integrations/faq.md): Frequently asked questions about NEAR protocol integrations, including account management, transaction fees, and common development challenges.
- [Fungible tokens](https://docs.near.org/integrations/fungible-tokens.md): Learn how to integrate NEAR tokens (NEAR, FT, and NFT) into your application, including balance queries, transfers, and token metadata.
- [Implicit Accounts](https://docs.near.org/integrations/implicit-accounts.md): Learn about implicit accounts in NEAR, how they work with Ethereum-style addresses, and their role in chain abstraction and multi-chain integration.

## Aurora
- [Build on Aurora](https://docs.near.org/aurora/build-on-aurora.md): Learn how to build on Aurora, our EVM compatible chain
- [Launch a Virtual Chain](https://docs.near.org/aurora/launch-virtual-chain.md): Learn how to create your own customized chain
- [What is Aurora?](https://docs.near.org/aurora/what-is.md): Learn about our EVM-compatible blockchain on NEAR

## Learning Quests
- [Access Keys & Permissions](https://docs.near.org/quest/accounts/access-keys.md): Learn about the two main types of NEAR Addresses
- [Address Types](https://docs.near.org/quest/accounts/address.md): Learn about the different types of accounts in NEAR Protocol
- [Introduction](https://docs.near.org/quest/accounts/introduction.md): Learn everything on NEAR accounts
- [Implicit & Named Accounts](https://docs.near.org/quest/accounts/named-vs-implicit.md): Learn about the two main types of NEAR Addresses
- [Smart Contracts](https://docs.near.org/quest/accounts/smart-contracts.md): Learn about the two main types of NEAR Addresses
- [Takeaways](https://docs.near.org/quest/accounts/takeaways.md): Main takeaways from this lesson
- [Building Blocks](https://docs.near.org/quest/dapps/building-blocks.md): Learn what are the main building blocks of Web3 apps
- [Examples of Web3 Apps](https://docs.near.org/quest/dapps/examples.md): Understand what kinds of applications can be built on NEAR Protocol with real-world examples.
- [Introduction](https://docs.near.org/quest/dapps/intro-to-web3.md): Learn what Decentralized applications are at a high level
- [Takeaways](https://docs.near.org/quest/dapps/takeaway.md): Final key takeaways and quiz to reinforce your understanding of Web3 applications on NEAR Protocol.
- [Why NEAR?](https://docs.near.org/quest/dapps/why-near.md): Discover why NEAR Protocol is the best choice for building Web3 applications
- [Understanding Data Flow in NEAR Protocol](https://docs.near.org/quest/data-flow.md): Learn how data moves through NEAR Protocol - understand transactions, receipts, gas fees, and how the blockchain processes your requests step by step.
- [Home](https://docs.near.org/quest/introduction.md): Learn NEAR development through interactive quests and challenges designed to build your skills step by step
- [Understanding the NEAR Network](https://docs.near.org/quest/near-network.md): Learn how the NEAR network operates - understand validators, epochs, different network environments, and how the blockchain stays secure and decentralized.
- [Understanding NEAR Primitives](https://docs.near.org/quest/primitives.md): Learn about NEAR Protocol's primitives - the fundamental building blocks that make Web3 applications possible. Understand tokens, NFTs, linkdrops, and DAOs in simple terms.
- [Understanding Smart Contracts](https://docs.near.org/quest/smart-contracts.md): Learn about smart contracts - the automated programs that power Web3 applications. Understand what they do, how they work, and the different programming languages you can use to build them.
