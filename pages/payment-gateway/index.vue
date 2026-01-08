<template>
  <v-container fluid class="pa-6">

    <!-- Header -->
    <v-row class="mb-6">
      <v-col class="d-flex align-center">
        <!-- <h2 class="text-h5 font-bold text-gray-800">Payment Gateways</h2>
        <v-spacer /> -->
        <v-btn color="gradient-cyan" class="px-6" elevation="3" @click="dialogCreate = true">
          Add Gateway
        </v-btn>
      </v-col>
    </v-row>

<v-row dense class="toggle-grid">
  <!-- Auto Payment -->
  <v-col cols="12" sm="6">
    <div class="toggle-card">
      <div class="toggle-left">
        <div class="toggle-title">Global Auto Payment</div>
        <div class="toggle-sub">Automatically process payments</div>
      </div>

      <v-switch
        v-model="enabled"
        inset
        hide-details
        :color="enabled ? 'success' : 'grey'"
        @change="toggle"
      />
    </div>
  </v-col>

  <!-- Cashout -->
  <v-col cols="12" sm="6">
    <div class="toggle-card">
      <div class="toggle-left">
        <div class="toggle-title">Cashout</div>
        <div class="toggle-sub">Enable user withdrawals</div>
      </div>

      <v-switch
        v-model="enabledCashout"
        inset
        hide-details
        :color="enabledCashout ? 'success' : 'grey'"
        @change="toggleCashout"
      />
    </div>
  </v-col>
</v-row>


<v-container>
  <v-row class="align-center">
    <v-col cols="12" sm="6">
      <span class="font-weight-medium">Cashout</span>
    </v-col>
    <v-col cols="12" sm="6">
      <v-switch
        v-model="enabled"
        label="Enable Auto Payment"
        inset
        :color="enabled ? 'green' : 'red'"
        @change="toggleCashout"
      ></v-switch>
    </v-col>
  </v-row>
</v-container>

    <!-- Payment Gateway Table -->
    <v-card class="rounded-2xl elevation-6">
      <v-data-table
        :headers="headers"
        :items="gateways"
        class="elevation-0"
     
      >
        <!-- Action menu -->
        <template #item.action="{ item }">
          <v-menu offset-y>
            <template #activator="{ props }">
         <v-btn
  v-bind="props"
  icon
  class="kebab-btn"
  elevation="2"
  rounded
  outlined
>
  <v-icon>mdi-dots-vertical</v-icon>
</v-btn>
            </template>

            <v-list>
              <v-list-item @click="openEditDialog(item)">
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>

              <v-divider />

              <v-list-item class="text-red" @click="deleteGateway(item)">
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- CREATE GATEWAY DIALOG -->
    <v-dialog v-model="dialogCreate" max-width="500">
      <v-card class="pa-6 rounded-2xl elevation-5">
        <v-card-title class="text-h6 font-bold">Add Payment Gateway</v-card-title>

        <v-card-text class="d-flex flex-column gap-4">
          <v-text-field label="Gateway Name" v-model="gatewayForm.name" outlined />
          <v-text-field label="Agent Number" v-model="gatewayForm.agent_number" outlined />
        </v-card-text>
        <v-select
  label="Deposit Channel"
  :items="['cashout', 'send_money']"
  v-model="gatewayForm.deposit_channel"
/>

<v-switch
  label="Active"
  v-model="gatewayForm.is_active"
/>


        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="dialogCreate = false">Cancel</v-btn>
          <v-btn color="gradient-cyan" @click="addGateway">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- EDIT GATEWAY DIALOG -->
    <v-dialog v-model="dialogEdit" max-width="500">
      <v-card class="pa-6 rounded-2xl elevation-5">
        <v-card-title class="text-h6 font-bold">Edit Payment Gateway</v-card-title>

        <v-card-text class="d-flex flex-column gap-4">
          <v-text-field label="Gateway Name" v-model="activeGateway.name" outlined />
          <v-text-field label="Agent Number" v-model="activeGateway.agent_number" outlined />
        </v-card-text>

        <v-select
  label="Deposit Channel"
  :items="['cashout', 'send_money']"
  v-model="activeGateway.deposit_channel"
/>

<v-switch
  label="Active"
  v-model="activeGateway.is_active"
/>


        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="dialogEdit = false">Cancel</v-btn>
          <v-btn color="gradient-cyan" @click="updateGateway">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from "vue";

import axios from "axios";





const headers = [
  { title: "Gateway Name", value: "name" },
  { title: "Agent Number", value: "agent_number" },
  { title: "Channel", value: "deposit_channel" },
  { title: "Status", value: "is_active" },
  { title: "Action", value: "action" },
];


// Static gateway data
const gateways = ref([

]);

const gatewayForm = ref({
  name: "",
  agent_number: "",
  deposit_channel: "cashout",
  is_active: true,
});

const dialogCreate = ref(false);
const dialogEdit = ref(false);
const enabled = ref(true);
const enabledCashout = ref(true);
const activeGateway = ref({});

// Load current value
const loadSetting = async () => {
  const res = await axios.get("https://api.bajiraj.cloud/payment-gateways/auto-payment");
  enabled.value = res.data.auto_payment_enabled;

    const res1 = await axios.get("https://api.bajiraj.cloud/payment-gateways/widthraw");
  enabledCashout.value = res1.data.widthraw;
};

const toggle = async () => {
  try {
    await axios.post("https://api.bajiraj.cloud/payment-gateways/auto-payment", {
      enabled: enabled.value
    });
    console.log(`Global auto payment is now ${enabled.value ? "ON" : "OFF"}`);
  } catch (err) {
    console.error("Failed to update auto-payment setting:", err);
  }
};

const toggleCashout = async () => {
  try {
    await axios.post("https://api.bajiraj.cloud/payment-gateways/widthraw", {
      enabled: enabledCashout.value
    });
    console.log(`Global auto payment is now ${enabledCashout.value ? "ON" : "OFF"}`);
  } catch (err) {
    console.error("Failed to update auto-payment setting:", err);
  }
};

onMounted(loadSetting);


const fetchGateways = async () => {
  const { data } = await axios.get("https://api.bajiraj.cloud/payment-gateways/");
  gateways.value = data;
};

onMounted(fetchGateways);

// Add new gateway
async function addGateway() {
  await axios.post("https://api.bajiraj.cloud/payment-gateways", gatewayForm.value);
  dialogCreate.value = false;
  gatewayForm.value = {
    name: "",
    agent_number: "",
    deposit_channel: "cashout",
    is_active: true,
  };
  fetchGateways();
}


// Edit gateway
function openEditDialog(gateway) {
  activeGateway.value = { ...gateway };
  dialogEdit.value = true;
}

async function updateGateway() {
  await axios.put(
    `https://api.bajiraj.cloud/payment-gateways/${activeGateway.value.id}`,
    activeGateway.value
  );
  dialogEdit.value = false;
  fetchGateways();
}


// Delete gateway
async function deleteGateway(gateway) {
  await axios.delete(`https://api.bajiraj.cloud/payment-gateways/${gateway.id}`);
  fetchGateways();
}

</script>

<style scoped>
.gradient-cyan {
  background: linear-gradient(to right, #00bcd4, #00acc1);
}
.text-red {
  color: #c62828;
}
.toggle-grid {
  margin-bottom: 16px;
}

.toggle-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #e6e8ec;
  transition: all 0.25s ease;
}

.toggle-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.toggle-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toggle-title {
  font-weight: 600;
  font-size: 14px;
}

.toggle-sub {
  font-size: 12px;
  color: #8b8f97;
}
.kebab-btn {
  background: #ffffff;
  color: #475569;
  transition: all 0.25s ease;
  border-radius: 12px;
  padding: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kebab-btn:hover {
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  color: #ffffff;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25);
  transform: translateY(-1px);
}

.kebab-btn .v-icon {
  font-size: 20px;
  transition: color 0.25s ease;
}

/* Optional: ripple effect removal for smoother hover */
.kebab-btn .v-ripple__container {
  opacity: 0 !important;
}

</style>
