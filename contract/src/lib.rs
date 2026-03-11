use near_sdk::collections::UnorderedMap;
use near_sdk::{env, near, require, PanicOnDefault};

#[near(serializers = [json])]
#[derive(Clone, Debug)]
pub struct PropertyInput {
    pub property_id: String,
    pub description: String,
    pub owner: String,
}

#[near(serializers = [borsh, json])]
#[derive(Clone, Debug)]
pub struct PropertyRecord {
    pub property_id: String,
    pub description: String,
    pub owner: String,
    pub timestamp: u64,
    pub updated_by: String,
}

#[near(serializers = [json])]
#[derive(Clone, Debug)]
pub struct BatchUpsertSummary {
    pub processed: u64,
    pub created: u64,
    pub updated: u64,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct PropertyRegistry {
    properties: UnorderedMap<String, PropertyRecord>,
}

#[near]
impl PropertyRegistry {
    #[init]
    pub fn new() -> Self {
        Self {
            properties: Self::empty_registry(),
        }
    }

    #[payable]
    pub fn create_property(&mut self, property_id: String, description: String, owner: String) {
        let property_id = Self::normalize_field(property_id, "property_id");
        require!(
            self.properties.get(&property_id).is_none(),
            "Property already exists"
        );

        let record = self.build_record(property_id.clone(), description, owner);
        self.properties.insert(&property_id, &record);
    }

    #[payable]
    pub fn upsert_property(&mut self, property_id: String, description: String, owner: String) {
        let property_id = Self::normalize_field(property_id, "property_id");
        let record = self.build_record(property_id.clone(), description, owner);
        self.properties.insert(&property_id, &record);
    }

    #[payable]
    pub fn update_property(&mut self, property_id: String, description: String, owner: String) {
        let property_id = Self::normalize_field(property_id, "property_id");
        require!(
            self.properties.get(&property_id).is_some(),
            "Property not found"
        );

        let record = self.build_record(property_id.clone(), description, owner);
        self.properties.insert(&property_id, &record);
    }

    #[payable]
    pub fn batch_upsert_properties(&mut self, items: Vec<PropertyInput>) -> BatchUpsertSummary {
        require!(!items.is_empty(), "items cannot be empty");

        let mut created = 0_u64;
        let mut updated = 0_u64;

        for item in items {
            let property_id = Self::normalize_field(item.property_id, "property_id");
            let already_exists = self.properties.get(&property_id).is_some();
            let record = self.build_record(property_id.clone(), item.description, item.owner);
            self.properties.insert(&property_id, &record);

            if already_exists {
                updated += 1;
            } else {
                created += 1;
            }
        }

        BatchUpsertSummary {
            processed: created + updated,
            created,
            updated,
        }
    }

    #[payable]
    pub fn transfer_property(&mut self, property_id: String, new_owner: String) {
        let property_id = Self::normalize_field(property_id, "property_id");
        let mut record = self
            .properties
            .get(&property_id)
            .unwrap_or_else(|| env::panic_str("Property not found"));

        record.owner = Self::normalize_field(new_owner, "new_owner");
        record.timestamp = env::block_timestamp();
        record.updated_by = env::predecessor_account_id().to_string();

        self.properties.insert(&property_id, &record);
    }

    pub fn get_property(&self, property_id: String) -> Option<PropertyRecord> {
        let property_id = property_id.trim().to_string();
        if property_id.is_empty() {
            return None;
        }

        self.properties.get(&property_id)
    }

    pub fn get_all_properties(&self) -> Vec<PropertyRecord> {
        self.properties.iter().map(|(_, value)| value).collect()
    }

    pub fn get_properties_by_owner(&self, owner: String) -> Vec<PropertyRecord> {
        let owner = owner.trim();
        if owner.is_empty() {
            return vec![];
        }

        self.properties
            .iter()
            .filter_map(|(_, value)| if value.owner == owner { Some(value) } else { None })
            .collect()
    }

    #[payable]
    pub fn delete_property(&mut self, property_id: String) {
        let property_id = Self::normalize_field(property_id, "property_id");
        require!(
            self.properties.remove(&property_id).is_some(),
            "Property not found"
        );
    }

    pub fn count_properties(&self) -> u64 {
        self.properties.len()
    }

    #[payable]
    pub fn reset_registry(&mut self) {
        self.assert_contract_owner();
        self.properties = Self::empty_registry();
    }

    fn build_record(&self, property_id: String, description: String, owner: String) -> PropertyRecord {
        PropertyRecord {
            property_id,
            description: Self::normalize_field(description, "description"),
            owner: Self::normalize_field(owner, "owner"),
            timestamp: env::block_timestamp(),
            updated_by: env::predecessor_account_id().to_string(),
        }
    }

    fn normalize_field(value: String, field_name: &str) -> String {
        let trimmed = value.trim().to_string();
        require!(!trimmed.is_empty(), &format!("{} cannot be empty", field_name));
        trimmed
    }

    fn empty_registry() -> UnorderedMap<String, PropertyRecord> {
        let mut prefix = b"property-registry:".to_vec();
        prefix.extend_from_slice(&env::block_timestamp().to_le_bytes());
        UnorderedMap::new(prefix)
    }

    fn assert_contract_owner(&self) {
        require!(
            env::predecessor_account_id() == env::current_account_id(),
            "Only the contract account can reset the registry"
        );
    }
}
