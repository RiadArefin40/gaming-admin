<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col class="d-flex align-center">
        <h2 class="text-h5 font-bold text-gray-800">Users</h2>
        <v-spacer />
        <v-btn color="gradient-cyan" :loading="loadingAction" :disabled="loadingAction" @click="createUser">
          Create
        </v-btn>

      </v-col>
    </v-row>
<v-row class="mb-4" align="center">
  <v-col cols="12" sm="4" md="3">
    <v-text-field
      v-model="userSearch"
      placeholder="Search users..."
      prepend-inner-icon="mdi-magnify"
      dense
      hide-details
      rounded
    />
  </v-col>
</v-row>

<!-- User Table -->
<v-card class="rounded-xl elevation-3 modern-table">
  <!-- Skeleton loader -->
  <v-skeleton-loader v-if="loadingUsers" type="table" class="pa-2" />
  
  <v-data-table
    v-else
    :headers="headers"
    :items="filteredUsers"
    dense
 
    class="modern-data-table"
  >
    <!-- Status switch -->
    <template #item.status="{ item }">
      <v-chip
        :color="item.is_block_user ? 'red lighten-2' : 'green lighten-2'"
        text-color="white"
        small
        class="status-chip"
      >
        {{ item.is_block_user ? 'Blocked' : 'Active' }}
      </v-chip>
    </template>

    <!-- Balance editable -->
    <template #item.balance="{ item }">
      <v-text-field
        v-if="currentUserRole === 'admin'"
        v-model.number="item.balance"
        type="number"
        dense
        hide-details
        class="balance-input"
        rounded
      />
      <span v-else>৳{{ item.balance }}</span>
    </template>

    <!-- Action menu -->
    <template #item.action="{ item }">
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn class="small-switch" v-bind="props" icon dense>
            <v-icon >mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list class="modern-menu">
          <v-list-item @click="openDialog('edit', item)">
            <v-list-item-title>Edit</v-list-item-title>
          </v-list-item>
          <v-list-item @click="openDialog('details', item)">
            <v-list-item-title>User Details</v-list-item-title>
          </v-list-item>
          <v-list-item @click="openDialog('transaction', item)">
            <v-list-item-title>Transaction Record</v-list-item-title>
          </v-list-item>
          <v-list-item @click="openDialog('betting', item)">
            <v-list-item-title>Betting Record</v-list-item-title>
          </v-list-item>
          <v-list-item @click="toggleUserStatus(item)">
            <v-list-item-title>Block/Unblock</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item class="text-red" @click="openDialog('delete', item)">
            <v-list-item-title>Delete</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-data-table>
</v-card>

    <!-- CREATE USER DIALOG -->
    <v-dialog v-model="dialogCreate" max-width="600">
      <v-card class="pa-6 rounded-2xl elevation-5">
        <v-card-title class="text-h6 font-bold">Create User</v-card-title>

        <v-card-text class="d-flex flex-column gap-4">
          <v-text-field label="Username" v-model="createForm.username" outlined />
          <v-text-field label="Email" v-model="createForm.email" outlined />
          <v-text-field label="Phone" v-model="createForm.phone" outlined />
          <v-text-field label="Password" type="password" v-model="createForm.password" outlined />
          <v-select label="Role" :items="['user', 'agent', 'admin']" v-model="createForm.role" outlined />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="dialogCreate = false">Cancel</v-btn>
          <v-btn color="gradient-cyan" @click="createUser">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- EDIT USER DIALOG -->
    <v-dialog v-model="dialogEdit" max-width="600">
      <v-card class="pa-6 rounded-2xl elevation-5">
        <v-card-title class="text-h6 font-bold">Edit User</v-card-title>

        <v-card-text class="d-flex flex-column gap-4">
          <v-text-field label="Username" v-model="activeUser.name" outlined />
          <v-text-field label="Phone" v-model="activeUser.phone" outlined />
          <v-select label="Role" :items="['user', 'agent', 'admin']" v-model="activeUser.role" outlined />
          <v-text-field v-if="currentUserRole === 'admin'" label="Balance" v-model.number="activeUser.wallet"
            type="number" outlined />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="dialogEdit = false">Cancel</v-btn>
          <v-btn color="gradient-cyan" :loading="loadingAction" :disabled="loadingAction" @click="updateUser">
            Save
          </v-btn>

        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- USER DETAILS DIALOG -->
    <v-dialog v-model="dialogDetails" max-width="500">
      <v-card class="pa-6 rounded-2xl elevation-5">
        <v-card-title class="text-h6 font-bold">User Details</v-card-title>
        <v-divider class="my-3" />
        <v-card-text class="text-gray-700">
          <p><b>Username:</b> {{ activeUser?.name }}</p>
          <p><b>Email:</b> {{ activeUser?.email }}</p>
          <p><b>Phone:</b> {{ activeUser?.phone }}</p>
          <p><b>Balance:</b> ৳{{ activeUser?.wallet }}</p>
          <p><b>Role:</b> {{ activeUser?.role }}</p>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- TRANSACTION DIALOG -->
    <!-- TRANSACTION DIALOG -->
    <v-dialog v-model="dialogTransaction" max-width="900">
      <v-card class="pa-6 rounded-2xl elevation-5">

        <!-- Header -->
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-h6 font-weight-bold">Transaction History</span>

          <v-text-field v-model="transactionSearch" placeholder="Search..." density="compact"
            prepend-inner-icon="mdi-magnify" hide-details rounded style="max-width: 220px" />
        </v-card-title>

        <!-- Profit Summary -->
        <v-row class="mt-2 mb-4" dense>
          <v-col cols="3" v-for="(item, i) in profitSummary" :key="i">
            <v-card class="pa-3 text-center" variant="tonal">
              <div class="text-caption">{{ item.label }}</div>
              <div class="text-h6" :class="item.value >= 0 ? 'text-green' : 'text-red'">
                {{ item.value }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Tabs -->

        <!-- MANUAL TABS -->
        <div class="tab-wrapper mb-4">
          <button class="tab-btn" :class="{ active: activeTab === 'deposit' }" @click="activeTab = 'deposit'">
            Deposit
          </button>

          <button class="tab-btn" :class="{ active: activeTab === 'withdraw' }" @click="activeTab = 'withdraw'">
            Withdraw
          </button>
        </div>

        <!-- TABLE -->
        <v-table v-if="!loadingTransactions" density="compact">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Gateway</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(t, i) in filteredTransactions" :key="i">
              <td>{{ formatDate(t.created_at) }}</td>

              <td :class="t.amount > 0 ? 'text-green' : 'text-red'">
                {{ t.amount }}
              </td>

              <td>{{ t.status }}</td>
              <td>{{ t.payment_gateway }}</td>
            </tr>
          </tbody>
        </v-table>

        <v-skeleton-loader v-else type="table" />


        <v-divider class="my-3" />


      </v-card>
    </v-dialog>


    <!-- BETTING DIALOG -->
    <v-dialog v-model="dialogBetting" max-width="700">
      <v-card class="pa-6 rounded-2xl elevation-5">
        <v-card-title class="d-flex align-center">
          Betting Record
          <v-spacer />
          <v-text-field v-model="bettingSearch" placeholder="Search betting..." density="compact"
            prepend-inner-icon="mdi-magnify" hide-details rounded style="max-width: 220px" />
        </v-card-title>

        <v-divider />
        <v-table v-if="!loadingBettings" density="compact" class="mt-4">
          <tbody>
            <tr v-for="(b, i) in filteredBettings" :key="i">
              <td>{{ b.game }}</td>
              <td>৳{{ b.bet }}</td>
              <td :class="b.result === 'Win' ? 'text-green' : 'text-red'">
                {{ b.result }}
              </td>
            </tr>
          </tbody>
        </v-table>

        <v-skeleton-loader v-else type="table" class="mt-4" />

      </v-card>
    </v-dialog>

    <!-- DELETE DIALOG -->
    <v-dialog v-model="dialogDelete" max-width="420">
      <v-card class="pa-6 text-center rounded-2xl elevation-5">
        <v-icon size="48" color="red lighten-2">mdi-alert</v-icon>
        <h3 class="mt-3 font-bold">Delete User?</h3>
        <p class="text-gray-600">This action cannot be undone.</p>
        <v-card-actions class="justify-center mt-4">
          <v-btn variant="tonal" @click="dialogDelete = false">Cancel</v-btn>
          <v-btn color="red lighten-2" :loading="loadingAction" :disabled="loadingAction" @click="deleteUser">
            Delete
          </v-btn>

        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const currentUserRole = ref("admin");


const dialogTransaction = ref(false)
const loadingTransactions = ref(false)

const activeTab = ref("deposit")


const deposits = ref([])
const withdrawals = ref([])

// onMounted(fetchTransactions)

const headers = [
  { title: "Username", value: "name" },
  { title: "Password", value: "password" },
  { title: "Role", value: "role" },
  { title: "Status", value: "is_block_user", key: "status" },
  { title: "Phone", value: "phone" },
  { title: "Balance", value: "wallet" },
  { title: "Active Turnover", value: "turnover" },
  { title: "Action", value: "action" },
];

const roles = ref([]);
const activeUser = ref({});

// dialogs
const dialogCreate = ref(false);
const dialogEdit = ref(false);
const dialogDetails = ref(false);

const dialogBetting = ref(false);
const dialogDelete = ref(false);

// loading states
const loadingUsers = ref(false);
const loadingAction = ref(false);

const loadingBettings = ref(false);

// forms
const createForm = ref({
  name: "",
  phone: "",
  password: "",
  referred_by: "",
  role: "user",
});

// search
const transactionSearch = ref("");
const bettingSearch = ref("");

const transactions = ref([]);
const bettings = ref([]);

const userSearch = ref("");

const filteredUsers = computed(() => {
  if (!userSearch.value) return roles.value;

  return roles.value.filter(user =>
    Object.values(user)
      .join(" ")
      .toLowerCase()
      .includes(userSearch.value.toLowerCase())
  );
});

// ---------------- FETCH USERS ----------------
async function fetchUsers() {
  loadingUsers.value = true;
  try {
    const res = await fetch("https://api.bajiraj.cloud/users");
    roles.value = await res.json();
  } catch (err) {
    console.error(err);
  } finally {
    loadingUsers.value = false;
  }
}

// ---------------- CREATE USER ----------------
async function createUser() {
  loadingAction.value = true;
  try {
    const res = await fetch("https://api.bajiraj.cloud/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm.value),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    roles.value.unshift(data.user);
    dialogCreate.value = false;

    createForm.value = {
      name: "",
      phone: "",
      password: "",
      referred_by: "",
      role: "user",
    };
  } catch (err) {
    alert(err.message);
  } finally {
    loadingAction.value = false;
  }
}

// ---------------- UPDATE USER ----------------
async function updateUser() {
  loadingAction.value = true;

  try {
    const res = await fetch(
      `https://api.bajiraj.cloud/users/${activeUser.value.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeUser.value),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const index = roles.value.findIndex(
      (u) => u.id === activeUser.value.id
    );

    if (index !== -1) roles.value[index] = data.user;

    dialogEdit.value = false;
  } catch (err) {
    alert(err.message);
  } finally {
    loadingAction.value = false;
  }
}

// ---------------- DELETE USER ----------------
async function deleteUser() {
  loadingAction.value = true;

  try {
    await fetch(`https://api.bajiraj.cloud/users/${activeUser.value.id}`, {
      method: "DELETE",
    });

    roles.value = roles.value.filter(
      (u) => u.id !== activeUser.value.id
    );

    dialogDelete.value = false;
  } catch (err) {
    alert("Delete failed");
  } finally {
    loadingAction.value = false;
  }
}




// block/unblock user
async function toggleUserStatus(user) {
  try {
    const res = await fetch(
      `https://api.bajiraj.cloud/users/${user.id}/toggle-status`,
      { method: "PATCH" }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // Update UI instantly
    const index = roles.value.findIndex(u => u.id === user.id);
    if (index !== -1) {
      roles.value[index].is_block_user = data.user.is_block_user;
    }

  } catch (err) {
    alert(err.message);
  }
}



// // ---------------- TRANSACTIONS ----------------
// async function fetchTransactions(userId) {
//   loadingTransactions.value = true;
//   try {
//     const res = await fetch(`https://api.bajiraj.cloud/users/${userId}/transactions`);
//     transactions.value = await res.json();
//     dialogTransaction.value = true;
//   } catch {
//     alert("Failed to load transactions");
//   } finally {
//     loadingTransactions.value = false;
//   }
// }

// ---------------- BETTINGS ----------------
async function fetchBettings(userId) {
  loadingBettings.value = true;
  try {
    const res = await fetch(`https://api.bajiraj.cloud/users/${userId}/bettings`);
    bettings.value = await res.json();
    dialogBetting.value = true;
  } catch {
    alert("Failed to load bettings");
  } finally {
    loadingBettings.value = false;
  }
}

// ---------------- HELPERS ----------------
function openDialog(type, item) {
  activeUser.value = { ...item };
  console.log('user', item)
  if (type === "edit") dialogEdit.value = true;
  if (type === "details") dialogDetails.value = true;
  if (type === "transaction") fetchTransactions(item.id);
  if (type === "betting") fetchBettings(item.id);
  if (type === "delete") dialogDelete.value = true;
}

// ---------------- COMPUTED ----------------
// const filteredTransactions = computed(() =>
//   transactions.value.filter((t) =>
//     Object.values(t).join(" ").toLowerCase().includes(transactionSearch.value.toLowerCase())
//   )
// );

const filteredBettings = computed(() =>
  bettings.value.filter((b) =>
    Object.values(b).join(" ").toLowerCase().includes(bettingSearch.value.toLowerCase())
  )
);

onMounted(fetchUsers);


// onMounted(fetchTransactions)

async function fetchTransactions(userId) {
  loadingTransactions.value = true

  try {
    const [depositRes, withdrawRes] = await Promise.all([
      fetch(`https://api.bajiraj.cloud/deposit/${userId}`),
      fetch(`https://api.bajiraj.cloud/withdrawals/${userId}`)
    ])
    const depositData = await depositRes.json()
    const withdrawData = await withdrawRes.json()
    console.log(depositData, withdrawData)
    deposits.value = depositData.data || []
    withdrawals.value = withdrawData || []
    dialogTransaction.value = true;
  } catch (e) {
    console.error(e)
  } finally {
    loadingTransactions.value = false
  }
}

/* ----------------------------
   FILTERED TRANSACTIONS
-----------------------------*/
const filteredTransactions = computed(() => {
  const source =
    activeTab.value === "deposit" ? deposits.value : withdrawals.value

  return source.filter(item =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(transactionSearch.value.toLowerCase())
  )
})

/* ----------------------------
   DATE FILTER HELPERS
-----------------------------*/
const isSameDay = (date) =>
  new Date(date).toDateString() === new Date().toDateString()

const isSameWeek = (date) => {
  const now = new Date()
  const d = new Date(date)
  const diff = now - d
  return diff <= 7 * 24 * 60 * 60 * 1000
}

const isSameMonth = (date) => {
  const now = new Date()
  const d = new Date(date)
  return (
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

/* ----------------------------
   PROFIT CALCULATION
-----------------------------*/
const calcProfit = (filterFn) => {
  const depositSum = deposits?.value?.filter(d => d.status === "approved" && filterFn(d.created_at))
    .reduce((a, b) => a + Number(b.amount), 0)

  const withdrawSum = withdrawals?.value?.filter(w => w.status === "approved" && filterFn(w.created_at))
    .reduce((a, b) => a + Number(b.amount), 0)

  return depositSum - withdrawSum
}

const profitSummary = computed(() => [
  { label: "Today", value: calcProfit(isSameDay) },
  { label: "This Week", value: calcProfit(isSameWeek) },
  { label: "This Month", value: calcProfit(isSameMonth) },
  { label: "All Time", value: calcProfit(() => true) }
])

/* ----------------------------
   UTILS
-----------------------------*/
const formatDate = (date) =>
  new Date(date).toLocaleString()
</script>

<style scoped>
.gradient-cyan {
  background: linear-gradient(to right, #00bcd4, #00acc1);
}

.text-green {
  color: #2e7d32;
}

.text-red {
  color: #c62828;
}

.text-gray-600 {
  color: #6b7280;
}

.text-gray-800 {
  color: #1f2937;
}

.tab-wrapper {
  display: flex;
  gap: 10px;
}

.tab-btn {
  padding: 8px 18px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  background: #e5e7eb;
  font-weight: 500;
  transition: 0.2s;
}

.tab-btn.active {
  background: #1976d2;
  color: white;
}

.small-switch {
  transform: scale(0.65);
  transform-origin: left center;
}

/* .v-data-table__tr {
  height: 10px !important;
} */
/* Modern dense table */
.modern-data-table {
  border-radius: 12px;
  overflow: hidden;
  font-size: 13px;
}

.modern-data-table th {
  font-weight: 600;
  color: #374151;
  background: #f3f4f6;
  text-transform: uppercase;
  font-size: 12px;
  padding: 8px 12px;
}

.modern-data-table td {
  padding: 6px 12px;
  vertical-align: middle;
}

.status-chip {
  font-weight: 600;
  text-transform: uppercase;
}

.balance-input {
  max-width: 90px;
  font-size: 13px;
  text-align: right;
}

.modern-menu {
  min-width: 180px;
}

.v-data-table__wrapper {
  border-radius: 12px;
}

/* Dense switch styling */
.v-input--switch {
  margin: 0 auto;
}

/* Row hover effect */
.v-data-table__wrapper tr:hover {
  background-color: #f9fafb;
  transform: translateY(-1px);
  transition: 0.2s;
}

/* Skeleton loader rounded */
.v-skeleton-loader {
  border-radius: 10px;
}
/* Buttons */
.gradient-cyan {
  background: linear-gradient(135deg, #00bcd4, #00acc1);
  color: white !important;
}
.table__wrapper > table > thead > tr > th{
  background-color: #f3f4f6;
}
.v-table > .v-table__wrapper > table > tbody > tr > th, .v-table > .v-table__wrapper > table > thead > tr > th, .v-table > .v-table__wrapper > table > tfoot > tr > th {
  font-weight: 600 !important;
  font-size: 12px !important;
  color: #374151 !important;
}
.v-btn {
  font-size: 13px;
  text-transform: none;
  padding: 4px 12px;
}

/* Table */
.modern-data-table {
  border-radius: 12px;
  font-size: 13px;
  overflow: hidden;
}

.modern-data-table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
  color: #374151;
  background: #f3f4f6;
  padding: 6px 10px;
}

.modern-data-table td {
  padding: 4px 10px;
  vertical-align: middle;
}

.v-data-table__wrapper tr:hover {
  background-color: #f9fafb;
  transform: translateY(-1px);
  transition: 0.15s;
}

.status-chip {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
}

/* Balance input */
.balance-input {
  max-width: 80px;
  text-align: right;
  font-size: 13px;
}

/* Action menu */
.modern-menu {
  min-width: 160px;
  font-size: 13px;
}

/* Tabs */
.tab-wrapper {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 6px 16px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  background: #e5e7eb;
  color: #374151;
}

.tab-btn.active {
  background: #1976d2;
  color: white;
}

/* Skeleton loader */
.v-skeleton-loader {
  border-radius: 8px;
}

/* Switch compact */
.small-switch {
  transform: scale(0.65);
  transform-origin: left center;
}

/* Dialogs */
.v-dialog .v-card {
  border-radius: 16px;
  font-size: 13px;
}

/* Profit cards */
.v-card[variant="tonal"] {
  border-radius: 12px;
  font-size: 13px;
}

/* Text colors */
.text-green {
  color: #10b981;
}
.text-red {
  color: #ef4444;
}
.text-gray-600 {
  color: #6b7280;
}
.text-gray-800 {
  color: #1f2937;
}

</style>
