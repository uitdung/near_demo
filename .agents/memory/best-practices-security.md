# NEAR Protocol - Best Practices & Security Guide

**Ngày tạo:** 06/03/2026  
**Mục đích:** Hướng dẫn best practices và security cho smart contract development

---

## Smart Contract Anatomy

### Best Practices
- [Best Practices](https://docs.near.org/smart-contracts/anatomy/best-practices.md): A collection of best practices for writing smart contracts on NEAR.
- [Basic Anatomy](https://docs.near.org/smart-contracts/anatomy/anatomy.md): Learn the basic anatomy of all smart contracts.
- [Environment](https://docs.near.org/smart-contracts/anatomy/environment.md): Know which account called you, how much gas and tokens were attached.
- [External Interface](https://docs.near.org/smart-contracts/anatomy/functions.md): Learn how to define your contract's interface.

### Data Management
- [Collections](https://docs.near.org/smart-contracts/anatomy/collections.md): Efficiently store, access, and manage data in smart contracts.
- [State](https://docs.near.org/smart-contracts/anatomy/storage.md): Explore how NEAR smart contracts manage their state.
- [SDK Types](https://docs.near.org/smart-contracts/anatomy/types.md): Learn everything the SDK has to offer to efficiently store data.

### Optimization
- [Reducing Contract Size](https://docs.near.org/smart-contracts/anatomy/reduce-size.md): Learn strategies to reduce NEAR smart contract size.
- [Serialization Protocols](https://docs.near.org/smart-contracts/anatomy/serialization-protocols.md): Learn which protocols smart contracts use to serialize data.

### Advanced Features
- [Cross-Contract Calls](https://docs.near.org/smart-contracts/anatomy/crosscontract.md): Contract can interact with other contracts on the network.
- [Yield and Resume](https://docs.near.org/smart-contracts/anatomy/yield-resume.md): Wait for an external response and resume execution.
- [Transfers & Actions](https://docs.near.org/smart-contracts/anatomy/actions.md): Learn how contracts can make transfers, call other contracts.

---

## Security Best Practices

### Core Security
- [Security Overview](https://docs.near.org/smart-contracts/security/welcome.md): Learn about smart contract security best practices on NEAR.
- [✅ Security Checklist](https://docs.near.org/smart-contracts/security/checklist.md): Best practices for security and common safeguards.

### Attack Vectors
- [Reentrancy Attacks](https://docs.near.org/smart-contracts/security/reentrancy.md): Learn about reentrancy attacks and how to prevent them.
- [Front Running](https://docs.near.org/smart-contracts/security/frontrunning.md): Learn about frontrunning attacks and MEV protection.
- [Sybil Attacks](https://docs.near.org/smart-contracts/security/sybil.md): Learn about sybil attacks and anti-gaming mechanisms.
- [Storage Security](https://docs.near.org/smart-contracts/security/storage.md): Learn about "Million Small Deposits" attack prevention.

### Security Patterns
- [One Yocto Pattern](https://docs.near.org/smart-contracts/security/one-yocto.md): Verify account ownership with 1 yoctoNEAR attachment.
- [Random Numbers](https://docs.near.org/smart-contracts/security/random.md): Secure random number generation in smart contracts.
- [Callback Security](https://docs.near.org/smart-contracts/security/callbacks.md): Proper error handling and state management in callbacks.

---

## Testing

### Testing Guide
- [Introduction to Testing](https://docs.near.org/smart-contracts/testing/introduction.md): Learn about testing NEAR smart contracts.
- [Unit Testing](https://docs.near.org/smart-contracts/testing/unit-test.md): Write and run unit tests for individual methods.
- [Integration Tests](https://docs.near.org/smart-contracts/testing/integration-test.md): Test using Sandbox and realistic blockchain environments.

---

## Deployment

### Release Management
- [Deploying Contracts](https://docs.near.org/smart-contracts/release/deploy.md): Deploy a contract to the network.
- [Updating Contracts](https://docs.near.org/smart-contracts/release/upgrade.md): Learn how to upgrade contracts safely.
- [Locking Accounts](https://docs.near.org/smart-contracts/release/lock.md): Prevent unauthorized modifications.
- [Reproducible Builds](https://docs.near.org/smart-contracts/anatomy/reproducible-builds.md): Create identical builds across environments.

---

## Web3 Applications

### Authentication
- [Authenticate NEAR Users](https://docs.near.org/web3-apps/backend/backend-login.md): Backend user authentication with wallet signatures.
- [Web Login Methods](https://docs.near.org/web3-apps/concepts/web-login.md): All login options for your web app.
- [Wallet Login](https://docs.near.org/web3-apps/tutorials/wallet-login.md): Connect users with secure connector library.

### Data Handling
- [Handling NEAR Types](https://docs.near.org/web3-apps/concepts/data-types.md): Handle common data types when interacting with NEAR.

### Quick Start
- [Your First Web3 App](https://docs.near.org/web3-apps/quickstart.md): Build a React/Next.js app with NEAR integration.
- [What are Web3 Apps?](https://docs.near.org/web3-apps/what-is.md): Learn about dApps and blockchain data.

---

## Tutorials & Examples

### Basic Contracts
- [Using Basic Examples](https://docs.near.org/smart-contracts/tutorials/basic-contracts.md): Counter, Guest Book, Donation, Coin Flip, Hello World.
- [Your First Smart Contract](https://docs.near.org/smart-contracts/quickstart.md): Create your first contract.
- [What is a Smart Contract?](https://docs.near.org/smart-contracts/what-is.md): Learn about the apps that can live in accounts.

---

## Key Takeaways for Demo Project

### 1. Input Validation
```rust
pub fn set_data(&mut self, key: String, value: String) {
    if key.is_empty() {
        env::panic_str("Key cannot be empty");
    }
    if value.is_empty() {
        env::panic_str("Value cannot be empty");
    }
    // ... rest of logic
}
```

### 2. Storage Cost Management
- Consider charging users for storage they consume
- Implement rate limiting to prevent "Million Small Deposits" attack
- Use `env::storage_usage()` to track storage

### 3. Access Control
```rust
pub fn delete_data(&mut self, key: String) {
    let entry = self.data.get(&key).expect("Key not found");
    if entry.sender != env::predecessor_account_id() {
        env::panic_str("Only the sender can delete this data");
    }
    self.data.remove(&key);
}
```

### 4. One Yocto Pattern (for sensitive operations)
```rust
#[payable]
pub fn delete_data(&mut self, key: String) {
    // Require exactly 1 yoctoNEAR to ensure user confirmation
    assert_eq!(env::attached_deposit(), 1, "Requires 1 yoctoNEAR");
    // ... delete logic
}
```

---

[Index](index.md)
