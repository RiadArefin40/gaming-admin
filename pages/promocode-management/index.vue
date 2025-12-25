<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col class="d-flex align-center">
        <h2 class="text-h5 font-bold text-gray-800">Promo Code Management</h2>
        <v-spacer />
        <v-btn color="gradient-cyan" class=" px-6" elevation="3" @click="openDialog('add')">
          Add Promo Code
        </v-btn>
      </v-col>
    </v-row>

    <!-- Promo Code Table -->
    <v-card class="rounded-2xl elevation-6">
      <v-data-table :headers="headers" :items="promoCodes" hide-default-footer>
        <!-- Status Chip -->
        <template #item.status="{ item }">
          <v-chip :color="item.active ? 'green lighten-2' : 'red lighten-2'" text-color="white" small pill>
            {{ item.active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <!-- Action Menu -->
        <template #item.action="{ item }">
          <v-menu offset-y>
            <template #activator="{ props }">
              <v-btn v-bind="props" icon>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item @click="openDialog('edit', item)">
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>

              <v-list-item class="text-red" @click="deletePromo(item)">
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>

              <v-divider />

              <v-list-item @click="toggleStatus(item)">
                <v-list-item-title>{{ item.active ? 'Deactivate' : 'Activate' }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- ADD/EDIT PROMO CODE DIALOG -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card class="pa-6 rounded-2xl elevation-5">
        <v-card-title class="text-h6 font-bold">{{ editPromo ? 'Edit Promo Code' : 'Add Promo Code' }}</v-card-title>

        <v-card-text class="d-flex flex-column gap-4">
          <v-text-field label="Promo Code" v-model="promoForm.code" outlined />
          <v-text-field label="Deposit Bonus (%)" v-model.number="promoForm.depositBonus" type="number" outlined />
          <v-text-field label="Turnover (x)" v-model.number="promoForm.turnover" type="number" outlined />
          <v-switch label="Active" v-model="promoForm.active" color="cyan" inset />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="closeDialog">Cancel</v-btn>
          <v-btn color="gradient-cyan" class="" @click="savePromo">
            {{ editPromo ? 'Update' : 'Add' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from "vue";

// Table headers
const headers = [
  { title: "Promo Code", value: "code" },
  { title: "Deposit Bonus (%)", value: "deposit_bonus" },
  { title: "Turnover (x)", value: "turnover" },
  { title: "Status", value: "status", key:"status" },
  { title: "Action", value: "action" },
];
const promoCodes = ref([])
async function fetchPromos() {
  const res = await fetch("https://api.bajiraj.cloud/promos");
  promoCodes.value = await res.json();
}


async function savePromo() {
  const method = editPromo.value ? "PUT" : "POST";
  const url = editPromo.value
    ? `https://api.bajiraj.cloud/promos/${promoForm.value.id}`
    : "https://api.bajiraj.cloud/promos";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(promoForm.value)
  });

  if (!res.ok) return alert("Failed");

  await fetchPromos();
  closeDialog();
}


async function deletePromo(item) {
  await fetch(`https://api.bajiraj.cloud/promos/${item.id}`, {
    method: "DELETE"
  });

  fetchPromos();
}



async function toggleStatus(item) {
  await fetch(`https://api.bajiraj.cloud/promos/${item.id}/toggle`, {
    method: "PATCH"
  });

  fetchPromos();
}



// Dialog & Form
const dialog = ref(false);
const promoForm = ref({ id: null, code: "", depositBonus: 0, turnover: 0, active: true });
const editPromo = ref(false);

function openDialog(type, item) {
  if (type === "edit") {
    editPromo.value = true;
    promoForm.value = { ...item };
  } else {
    editPromo.value = false;
    promoForm.value = { id: null, code: "", depositBonus: 0, turnover: 0, active: true };
  }
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
  promoForm.value = { id: null, code: "", depositBonus: 0, turnover: 0, active: true };
  editPromo.value = false;
}



onMounted(fetchPromos);

</script>

<style scoped>
.gradient-cyan {
  background: linear-gradient(to right, #00bcd4, #00acc1);
}
.text-red {
  color: #c62828;
}
.text-green {
  color: #2e7d32;
}
.rounded-2xl {
  border-radius: 1rem;
}
</style>
