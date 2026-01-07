<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col class="d-flex align-center">
        <!-- <h2 class="text-h5 font-bold text-gray-800">Transaction Manual Approval</h2> -->
        <!-- <v-spacer /> -->
        <v-text-field
          v-model="search"
          placeholder="Search by username or type..."
    prepend-inner-icon="mdi-magnify"
  variant="solo"
  hide-details
  class="search-input"
  density="comfortable"
        />
      </v-col>
    </v-row>

    <!-- Transactions Table -->
    <v-card class="rounded-2xl elevation-6">
      <v-overlay :value="loading">
        <v-progress-circular indeterminate size="64" color="cyan"></v-progress-circular>
      </v-overlay>

      <v-data-table :headers="headers" :items="filteredTransactions" densed>
        <!-- Status -->
        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" text-color="white" small pill>
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Action -->
        <template #item.actions="{ item }">
         {{  }}
          <v-btn
            v-if="item.status === 'pending'"
            color="green"
            class="text-white mr-2"
            small
            @click="openApprovalDialog(item, 'approve')"
          >
            Approve
          </v-btn>
          <v-btn
            v-if="item.status === 'pending'"
            color="red"
            class="text-white"
            small
            @click="openApprovalDialog(item, 'reject')"
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
        <h3 class="mt-3">{{ dialogAction === 'approve' ? 'Approve' : 'Reject' }} Transaction</h3>
        <p>User: <b>{{ selectedTransaction?.username }}</b></p>
        <p>Amount: <b>৳{{ selectedTransaction?.amount }}</b></p>
        <p v-if="selectedTransaction?.promo_code">Promo: <b>{{ selectedTransaction.promo_code }}</b></p>
        <v-card-actions class="justify-center mt-4">
          <v-btn variant="tonal" @click="dialog = false">Cancel</v-btn>
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

// Table headers
const headers = [
  { title: "Name", value: "user_name" },
  { title: "Type", value: "payment_gateway" },
  { title: "Amount", value: "amount" },
   { title: "TRNX", value: "transaction_id" },
    { title: "Promo", value: "promo_code" },
  { title: "Bonus", value: "bonus_amount" },
   { title: "Sender", value: "sender_number" },
    { title: "Receiver", value: "receiver_number" },
    {title: "Time", value:"created_at"},
    {title:"Required Turnover", value: "turnover_required"},
    {title:"Auto Payment Id", value: "external_payout_id"},
    {title:"Failure Reason", value:"failure_reason"},
  { title: "Status" , key:"status"},
   { title: "Action" , key:"actions"},
];

const transactions = ref([]);
const search = ref("");
const dialog = ref(false);
const selectedTransaction = ref(null);
const dialogAction = ref("");
const loading = ref(false);

// Status color helper
function getStatusColor(status) {
  if (status === "Pending") return "orange";
  if (status === "Approved") return "green";
  if (status === "Rejected") return "red";
  return "grey";
}

// Filtered transactions
const filteredTransactions = computed(() =>
  transactions.value.filter((t) =>
    Object.values(t).join(" ").toLowerCase().includes(search.value.toLowerCase())
  )
);

// Open dialog
function openApprovalDialog(transaction, action) {
  selectedTransaction.value = transaction;
  dialogAction.value = action;
  dialog.value = true;
}

// Confirm approve/reject
async function confirmAction() {
  if (!selectedTransaction.value) return;

  const depositId = selectedTransaction.value.id;
  const action = dialogAction.value; // 'approve' or 'reject'

  try {
    const res = await fetch(`https://stage.api.bajiraj.com/deposit/${depositId}/${action}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();

    if (!res.ok) {
      // Handle error from backend
      alert(data.error || "Failed to update deposit status");
      return;
    }

    // Update local state with updated deposit from backend
    const index = transactions.value.findIndex(t => t.id === depositId);
    if (index !== -1) transactions.value[index] = { ...transactions.value[index], ...data.deposit };

    dialog.value = false;
    selectedTransaction.value = null;
    dialogAction.value = "";

  } catch (err) {
    console.error(err);
    alert("Something went wrong while updating deposit status");
  }
}


// Fetch deposits from backend
async function fetchTransactions() {
  loading.value = true;
  try {
    const res = await fetch("https://stage.api.bajiraj.com/deposit"); // Replace with real endpoint
    transactions.value = await res.json();
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => fetchTransactions());
</script>

<style scoped>
.rounded-2xl {
  border-radius: 1rem;
}
</style>
