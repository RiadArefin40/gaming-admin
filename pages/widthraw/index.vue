<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col class="d-flex align-center">
        <h2 class="text-h5 font-bold text-gray-800">Withdrawal Requests</h2>
        <v-spacer />
        <v-text-field
          v-model="search"
          placeholder="Search by username or type..."
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          style="max-width: 300px"
        />
      </v-col>
    </v-row>

    <!-- Withdrawals Table -->
    <v-card class="rounded-2xl elevation-6">
      <v-data-table :headers="headers" :items="filteredWithdrawals" hide-default-footer>
        <!-- Status -->
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            text-color="white"
            small
            pill
          >
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Action -->
        <template #item.action="{ item }">
          <v-btn
            v-if="item.status === 'Pending'"
            color="green"
            class="text-white mr-2"
            small
            @click="openDialog(item, 'approve')"
          >
            Approve
          </v-btn>
          <v-btn
            v-if="item.status === 'Pending'"
            color="red"
            class="text-white"
            small
            @click="openDialog(item, 'reject')"
          >
            Reject
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- APPROVAL DIALOG -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card class="pa-6 rounded-2xl elevation-5 text-center">
        <v-icon size="48" :color="dialogAction === 'approve' ? 'green' : 'red'">
          {{ dialogAction === 'approve' ? 'mdi-check-circle' : 'mdi-close-circle' }}
        </v-icon>
        <h3 class="mt-3">{{ dialogAction === 'approve' ? 'Approve' : 'Reject' }} Withdrawal</h3>
        <p>User: <b>{{ selectedWithdrawal?.username }}</b></p>
        <p>Amount: <b>৳{{ selectedWithdrawal?.amount }}</b></p>
        <v-card-actions class="justify-center mt-4">
          <v-btn variant="tonal" @click="dialog=false">Cancel</v-btn>
          <v-btn
            :color="dialogAction === 'approve' ? 'green' : 'red'"
            class="text-white"
            @click="confirmAction"
          >
            {{ dialogAction === 'approve' ? 'Approve' : 'Reject' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const headers = [
  { title: "Username", value: "username" },
  { title: "Amount", value: "amount" },
  { title: "Requested At", value: "created_at" },
  { title: "Status", value: "status" },
  { title: "Action", value: "action", key:"action" },
];

const withdrawals = ref([]);
const search = ref("");
const dialog = ref(false);
const selectedWithdrawal = ref(null);
const dialogAction = ref("");

// Fetch withdrawals from backend
async function fetchWithdrawals() {
  const res = await fetch("https://api.bajiraj.cloud/withdrawals");
  withdrawals.value = await res.json();
}

// Filtered list
const filteredWithdrawals = computed(() =>
  withdrawals.value.filter(w =>
    Object.values(w)
      .join(" ")
      .toLowerCase()
      .includes(search.value.toLowerCase())
  )
);

function getStatusColor(status) {
  if (status === "pending") return "orange";
  if (status === "approved") return "green";
  if (status === "rejected") return "red";
  return "grey";
}

function openDialog(withdrawal, action) {
  selectedWithdrawal.value = withdrawal;
  dialogAction.value = action;
  dialog.value = true;
}

async function confirmAction() {
  if (!selectedWithdrawal.value) return;

  const action = dialogAction.value;
  const res = await fetch(`/api/withdrawals/${selectedWithdrawal.value.id}/${action}`, {
    method: "PATCH",
  });
  const data = await res.json();

  // Update locally
  const index = withdrawals.value.findIndex(w => w.id === selectedWithdrawal.value.id);
  if (index !== -1) withdrawals.value[index] = data.withdrawal;

  dialog.value = false;
  selectedWithdrawal.value = null;
  dialogAction.value = "";
}

onMounted(() => {
  fetchWithdrawals();
});
</script>


<style scoped>
.rounded-2xl {
  border-radius: 1rem;
}
</style>
