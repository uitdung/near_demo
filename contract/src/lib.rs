use near_sdk::collections::UnorderedMap;
use near_sdk::{env, near, PanicOnDefault};

#[near(serializers = [borsh, json])]
#[derive(Clone, Debug)]
pub struct DataEntry {
    pub key: String,
    pub value: String,
    pub sender: String,
    pub timestamp: u64,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct KeyValueStore {
    data: UnorderedMap<String, DataEntry>,
}

#[near]
impl KeyValueStore {
    #[init]
    pub fn new() -> Self {
        Self {
            data: UnorderedMap::new(b"d"),
        }
    }

    #[payable]
    pub fn set_data(&mut self, key: String, value: String) {
        let sender = env::predecessor_account_id().to_string();
        let timestamp = env::block_timestamp();

        let entry = DataEntry {
            key: key.clone(),
            value,
            sender,
            timestamp,
        };

        self.data.insert(&key, &entry);
    }

    pub fn get_data(&self, key: String) -> Option<DataEntry> {
        self.data.get(&key)
    }

    pub fn get_all_data(&self) -> Vec<DataEntry> {
        self.data.iter().map(|(_, value)| value).collect()
    }

    #[payable]
    pub fn delete_data(&mut self, key: String) {
        self.data.remove(&key);
    }

    pub fn count(&self) -> u64 {
        self.data.len()
    }
}
