<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col class="d-flex align-center">
        <h2 class="text-h5 font-bold text-gray-800">VIP Labels & Coin Exchange</h2>
        <v-spacer />
        <v-btn color="gradient-cyan" class="px-6" elevation="3" @click="dialogCreate = true">
          Add VIP Level
        </v-btn>
      </v-col>
    </v-row>

    <!-- VIP Table -->
    <v-card class="rounded-2xl elevation-6">
      <v-data-table
        :headers="headers"
        :items="vipLevels"
        class="elevation-0"
        hide-default-footer
      >
        <!-- Coin to Money -->
        <template #item.exchange="{ item }">
          <v-text-field
            v-model.number="item.coinPerUnit"
            type="number"
            dense
            hide-details
            style="max-width: 100px"
            append-inner-icon="mdi-currency-usd"
          />
        </template>

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

              <v-list-item class="text-red" @click="deleteVIP(item)">
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- CREATE VIP DIALOG -->
    <v-dialog v-model="dialogCreate" max-width="500">
      <v-card class="pa-6 rounded-2xl elevation-5">
        <v-card-title class="text-h6 font-bold">Add VIP Level</v-card-title>

        <v-card-text class="d-flex flex-column gap-4">
          <v-text-field label="VIP Label" v-model="vipForm.label" outlined />
          <v-text-field label="Coins per Money Unit" v-model.number="vipForm.coinPerUnit" type="number" outlined />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="dialogCreate = false">Cancel</v-btn>
          <v-btn color="gradient-cyan" @click="addVIP">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- EDIT VIP DIALOG -->
    <v-dialog v-model="dialogEdit" max-width="500">
      <v-card class="pa-6 rounded-2xl elevation-5">
        <v-card-title class="text-h6 font-bold">Edit VIP Level</v-card-title>

        <v-card-text class="d-flex flex-column gap-4">
          <v-text-field label="VIP Label" v-model="activeVIP.label" outlined />
          <v-text-field label="Coins per Money Unit" v-model.number="activeVIP.coinPerUnit" type="number" outlined />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="dialogEdit = false">Cancel</v-btn>
          <v-btn color="gradient-cyan" @click="updateVIP">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from "vue";

const headers = [
  { title: "VIP Label", value: "label" },
  { title: "Coin per 1 Money", value: "exchange" },
  { title: "Action", value: "action" },
];

// Static VIP Levels
const vipLevels = ref([
  { id: 1, label: "Bronze", coinPerUnit: 1000 },
  { id: 2, label: "Silver", coinPerUnit: 5000 },
  { id: 3, label: "Gold", coinPerUnit: 10000 },
]);

const dialogCreate = ref(false);
const dialogEdit = ref(false);
const vipForm = ref({ label: "", coinPerUnit: 1000 });
const activeVIP = ref({});

// Add VIP Level
function addVIP() {
  vipLevels.value.push({
    id: Date.now(),
    label: vipForm.value.label,
    coinPerUnit: vipForm.value.coinPerUnit,
  });
  dialogCreate.value = false;
  vipForm.value = { label: "", coinPerUnit: 1000 };
}

// Edit VIP Level
function openEditDialog(vip) {
  activeVIP.value = { ...vip };
  dialogEdit.value = true;
}

function updateVIP() {
  const index = vipLevels.value.findIndex(v => v.id === activeVIP.value.id);
  if (index !== -1) {
    vipLevels.value[index] = { ...activeVIP.value };
  }
  dialogEdit.value = false;
}

// Delete VIP Level
function deleteVIP(vip) {
  vipLevels.value = vipLevels.value.filter(v => v.id !== vip.id);
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
