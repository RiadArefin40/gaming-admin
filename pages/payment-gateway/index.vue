<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col class="d-flex align-center">
        <h2 class="text-h5 font-bold text-gray-800">Payment Gateways</h2>
        <v-spacer />
        <v-btn color="gradient-cyan" class="px-6" elevation="3" @click="dialogCreate = true">
          Add Gateway
        </v-btn>
      </v-col>
    </v-row>

    <!-- Payment Gateway Table -->
    <v-card class="rounded-2xl elevation-6">
      <v-data-table
        :headers="headers"
        :items="gateways"
        class="elevation-0"
        hide-default-footer
      >
        <!-- Action menu -->
        <template #item.action="{ item }">
          <v-menu offset-y>
            <template #activator="{ props }">
              <v-btn v-bind="props" icon>
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
          <v-text-field label="Agent Number" v-model="gatewayForm.agentNumber" outlined />
        </v-card-text>

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
          <v-text-field label="Agent Number" v-model="activeGateway.agentNumber" outlined />
        </v-card-text>

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

const headers = [
  { title: "Gateway Name", value: "name" },
  { title: "Agent Number", value: "agentNumber" },
  { title: "Action", value: "action" },
];

// Static gateway data
const gateways = ref([
  { id: 1, name: "Bkash", agentNumber: "01712345678" },
  { id: 2, name: "Nagad", agentNumber: "01812345678" },
  { id: 3, name: "Rocket", agentNumber: "01912345678" },
]);

const dialogCreate = ref(false);
const dialogEdit = ref(false);
const gatewayForm = ref({ name: "", agentNumber: "" });
const activeGateway = ref({});

// Add new gateway
function addGateway() {
  gateways.value.push({
    id: Date.now(),
    name: gatewayForm.value.name,
    agentNumber: gatewayForm.value.agentNumber,
  });
  dialogCreate.value = false;
  gatewayForm.value = { name: "", agentNumber: "" };
}

// Edit gateway
function openEditDialog(gateway) {
  activeGateway.value = { ...gateway };
  dialogEdit.value = true;
}

function updateGateway() {
  const index = gateways.value.findIndex(g => g.id === activeGateway.value.id);
  if (index !== -1) {
    gateways.value[index] = { ...activeGateway.value };
  }
  dialogEdit.value = false;
}

// Delete gateway
function deleteGateway(gateway) {
  gateways.value = gateways.value.filter(g => g.id !== gateway.id);
}
</script>

<style scoped>
.gradient-cyan {
  background: linear-gradient(to right, #00bcd4, #00acc1);
}
.text-red {
  color: #c62828;
}
</style>
