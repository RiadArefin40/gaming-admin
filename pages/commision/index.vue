<template>
  <v-container fluid class="pa-6">

    <!-- -------------------- -->
    <!-- Cron Config Panel -->
    <!-- -------------------- -->
    <v-card class="mb-6 rounded-xl pa-4 elevation-3">
      <v-row align="center" justify="space-between">
        <v-col cols="12" sm="3">
          <v-switch
            v-model="cronConfig.enabled"
            label="Enable Affiliate Settlement"
          />
        </v-col>

        <v-col cols="12" sm="3">
          <v-select
            v-model="cronConfig.type"
            :items="['daily', 'weekly', 'monthly']"
            label="Frequency"
            dense
          />
        </v-col>

        <v-col cols="12" sm="3" v-if="cronConfig.type === 'weekly'">
          <v-select
            v-model="cronConfig.day"
            :items="daysOfWeek"
            label="Day of week"
            dense
          />
        </v-col>

        <v-col cols="12" sm="3">
          <v-text-field
            v-model="cronConfig.time"
            label="Time (HH:MM UTC)"
            dense
            placeholder="00:05"
          />
        </v-col>

        <v-col cols="12" sm="12" class="mt-2">
          <v-btn color="primary" @click="updateCronConfig">Update Schedule</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- -------------------- -->
    <!-- Search + Table -->
    <!-- -------------------- -->
    <v-row class="mb-4" align="center">
      <v-col cols="12" sm="4" md="3">
        <v-text-field
          v-model="search"
          placeholder="Search commissions..."
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          hide-details
          class="search-input"
          density="comfortable"
        />
      </v-col>
    </v-row>

    <v-card class="rounded-xl elevation-3 modern-table">
      <v-skeleton-loader v-if="loading" type="table" class="pa-2" />
      
      <v-data-table
        v-else
        :headers="headers"
        :items="filteredCommissions"
        dense
        class="modern-data-table"
      >
        <template #item.status="{ item }">
          <v-chip
            :color="statusColor(item.status)"
            text-color="white"
            small
            class="status-chip"
          >
            {{ item.status.toUpperCase() }}
          </v-chip>
        </template>

        <template #item.commission_amount="{ item }">
          ৳{{ item.commission_amount }}
        </template>

        <template #item.action="{ item }">
          <v-btn
            v-if="item.status === 'pending'"
            color="green lighten-1"
            small
            @click="approveCommission(item)"
          >
            Approve
          </v-btn>
          <v-btn
            v-if="item.status === 'pending'"
            color="red lighten-1"
            small
            @click="rejectCommission(item)"
          >
            Reject
          </v-btn>
          <v-btn
            color="blue lighten-1"
            small
            @click="viewDetails(item)"
          >
            Details
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Commission Details Dialog -->
    <v-dialog v-model="dialogDetails" max-width="500">
      <v-card class="pa-6 rounded-2xl elevation-5">
        <v-card-title class="text-h6 font-bold">Commission Details</v-card-title>
        <v-divider class="my-3" />
        <v-card-text class="text-gray-700">
          <p><b>Referrer:</b> {{ activeCommission?.referrer_name }}</p>
          <p><b>Referred User:</b> {{ activeCommission?.referred_name }}</p>
          <p><b>Total Deposit:</b> ৳{{ activeCommission?.total_deposit }}</p>
          <p><b>Total Withdraw:</b> ৳{{ activeCommission?.total_withdraw }}</p>
          <p><b>Loss:</b> ৳{{ activeCommission?.loss_amount }}</p>
          <p><b>Commission:</b> ৳{{ activeCommission?.commission_amount }}</p>
          <p><b>Status:</b> {{ activeCommission?.status }}</p>
          <p><b>Date Range:</b> {{ formatDate(activeCommission?.from_date) }} - {{ formatDate(activeCommission?.to_date) }}</p>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const commissions = ref([]);
const loading = ref(false);
const search = ref("");
const dialogDetails = ref(false);
const activeCommission = ref(null);

const cronConfig = ref({
  enabled: false,
  type: 'weekly',
  day: 1,
  time: '00:05',
});
const daysOfWeek = [
  { text: "Sunday", value: 0 },
  { text: "Monday", value: 1 },
  { text: "Tuesday", value: 2 },
  { text: "Wednesday", value: 3 },
  { text: "Thursday", value: 4 },
  { text: "Friday", value: 5 },
  { text: "Saturday", value: 6 },
];

const headers = [
  { title: "Referrer", value: "referrer_name" },
  { title: "Referred User", value: "referred_name" },
  { title: "Loss", value: "loss_amount" },
  { title: "Commission", value: "commission_amount" },
  { title: "Status", value: "status" },
  { title: "Date Range", value: "from_date" },
  { title: "Action", value: "action" },
];

// --------------------
// Fetch commissions
// --------------------
async function fetchCommissions() {
  loading.value = true;
  try {
    const res = await fetch("https://api.spcwin.info/users/affiliate/commissions");
    commissions.value = await res.json();
  } catch (e) {
    console.error(e);
    alert("Failed to fetch commissions");
  } finally {
    loading.value = false;
  }
}

// --------------------
// Fetch cron config
// --------------------
async function fetchCronConfig() {
  try {
    const res = await fetch("https://api.spcwin.info/users/affiliate-cron");
    const data = await res.json();
    cronConfig.value = { ...cronConfig.value, ...data };
  } catch (err) {
    console.error(err);
    alert("Failed to fetch cron config");
  }
}

// --------------------
// Update cron config
// --------------------
async function updateCronConfig() {
  try {
    const res = await fetch("https://api.spcwin.info/users/affiliate-cron", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cronConfig.value),
    });
    const data = await res.json();
    if (res.ok) alert("Cron config updated!");
    else throw new Error(data.error || "Failed to update");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// --------------------
// Approve/Reject commissions
// --------------------
async function approveCommission(item) {
  try {
    const res = await fetch(`https://api.spcwin.info/users/affiliate/${item.id}/approve`, { method: "PATCH" });
    if (!res.ok) throw new Error("Failed to approve");
    item.status = "approved";
    alert("Commission approved!");
  } catch (e) { console.error(e); alert(e.message); }
}
async function rejectCommission(item) {
  try {
    const res = await fetch(`https://api.spcwin.info/users/affiliate/${item.id}/reject`, { method: "PATCH" });
    if (!res.ok) throw new Error("Failed to reject");
    item.status = "rejected";
    alert("Commission rejected!");
  } catch (e) { console.error(e); alert(e.message); }
}
function viewDetails(item) {
  activeCommission.value = { ...item };
  dialogDetails.value = true;
}

// --------------------
// Computed / Helpers
// --------------------
const filteredCommissions = computed(() => {
  if (!search.value) return commissions.value;
  return commissions.value.filter(c =>
    Object.values(c).join(" ").toLowerCase().includes(search.value.toLowerCase())
  );
});

function statusColor(status) {
  if (status === "pending") return "orange lighten-2";
  if (status === "approved") return "green lighten-2";
  if (status === "rejected") return "red lighten-2";
  return "grey";
}

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : "";
}

onMounted(() => {
  fetchCommissions();
  fetchCronConfig();
});
</script>

<style scoped>
.modern-data-table th { font-weight: 600; font-size: 12px; }
.status-chip { font-weight: 600; text-transform: uppercase; font-size: 11px; }
.search-input { max-width: 360px; }
.v-btn { font-size: 12px; text-transform: none; margin-right: 4px; }
</style>
