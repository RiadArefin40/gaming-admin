<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col class="d-flex align-center">
        <h2 class="text-h5 font-bold text-gray-800">Users</h2>
        <v-spacer />
        <v-btn
        color="gradient-cyan"
        :loading="loadingAction"
        :disabled="loadingAction"
        @click="createUser"
      >
        Create
      </v-btn>

      </v-col>
    </v-row>

    <!-- User Table -->
    <v-card class="rounded-2xl elevation-6">
      <v-skeleton-loader
    v-if="loadingUsers"
    type="table"
    class="pa-4"
  />
      <v-data-table
         v-else
        :headers="headers"
        :items="roles"
        class="elevation-0"
        hide-default-footer
      >
        <!-- Status chip -->
  <template #item.status="{ item }">
<v-switch
  v-model="item.is_block_user"
  color="red"
  inset
  @change="toggleUserStatus(item)"
  :label="item.is_block_user ? 'Blocked' : 'Active'"
/>
</template>

        <!-- Balance editable only for admin -->
        <template #item.balance="{ item }">
          <v-text-field
            v-if="currentUserRole === 'admin'"
            v-model.number="item.balance"
            type="number"
            dense
            hide-details
            style="max-width: 100px"
          />
          <span v-else>৳{{ item.balance }}</span>
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
          <v-select label="Role" :items="['user','agent','admin']" v-model="createForm.role" outlined />
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
          <v-select label="Role" :items="['user','agent','admin']" v-model="activeUser.role" outlined />
          <v-text-field
            v-if="currentUserRole === 'admin'"
            label="Balance"
            v-model.number="activeUser.wallet"
            type="number"
            outlined
          />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="dialogEdit = false">Cancel</v-btn>
          <v-btn
            color="gradient-cyan"
            :loading="loadingAction"
            :disabled="loadingAction"
            @click="updateUser"
          >
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
    <v-dialog v-model="dialogTransaction" max-width="700">
      <v-card class="pa-6 rounded-2xl elevation-5">
        <v-card-title class="d-flex align-center">
          Transaction Record
          <v-spacer />
          <v-text-field
            v-model="transactionSearch"
            placeholder="Search transactions..."
            density="compact"
            prepend-inner-icon="mdi-magnify"
            hide-details
            rounded
            style="max-width: 220px"
          />
        </v-card-title>

        <v-divider />
        <v-table v-if="!loadingTransactions" density="compact" class="mt-4">
          <tbody>
            <tr v-for="(t,i) in filteredTransactions" :key="i">
              <td>{{ t.date }}</td>
              <td>{{ t.type }}</td>
              <td :class="t.amount > 0 ? 'text-green' : 'text-red'">
                {{ t.amount }}
              </td>
            </tr>
          </tbody>
        </v-table>

<v-skeleton-loader
  v-else
  type="table"
  class="mt-4"
/>
      </v-card>
    </v-dialog>

    <!-- BETTING DIALOG -->
    <v-dialog v-model="dialogBetting" max-width="700">
      <v-card class="pa-6 rounded-2xl elevation-5">
        <v-card-title class="d-flex align-center">
          Betting Record
          <v-spacer />
          <v-text-field
            v-model="bettingSearch"
            placeholder="Search betting..."
            density="compact"
            prepend-inner-icon="mdi-magnify"
            hide-details
            rounded
            style="max-width: 220px"
          />
        </v-card-title>

        <v-divider />
        <v-table v-if="!loadingBettings" density="compact" class="mt-4">
          <tbody>
            <tr v-for="(b,i) in filteredBettings" :key="i">
              <td>{{ b.game }}</td>
              <td>৳{{ b.bet }}</td>
              <td :class="b.result === 'Win' ? 'text-green' : 'text-red'">
                {{ b.result }}
              </td>
            </tr>
          </tbody>
        </v-table>

        <v-skeleton-loader
          v-else
          type="table"
          class="mt-4"
        />

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
        <v-btn
            color="red lighten-2"
            :loading="loadingAction"
            :disabled="loadingAction"
            @click="deleteUser"
          >
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

const headers = [
  { title: "Username", value: "name" },
   { title: "Password", value: "password" },
  { title: "Role", value: "role" },
  { title: "Status", value: "is_block_user", key:"status" },
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
const dialogTransaction = ref(false);
const dialogBetting = ref(false);
const dialogDelete = ref(false);

// loading states
const loadingUsers = ref(false);
const loadingAction = ref(false);
const loadingTransactions = ref(false);
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



// ---------------- TRANSACTIONS ----------------
async function fetchTransactions(userId) {
  loadingTransactions.value = true;
  try {
    const res = await fetch(`https://api.bajiraj.cloud/users/${userId}/transactions`);
    transactions.value = await res.json();
    dialogTransaction.value = true;
  } catch {
    alert("Failed to load transactions");
  } finally {
    loadingTransactions.value = false;
  }
}

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
  console.log('user', item )
  if (type === "edit") dialogEdit.value = true;
  if (type === "details") dialogDetails.value = true;
  if (type === "transaction") fetchTransactions(item.id);
  if (type === "betting") fetchBettings(item.id);
  if (type === "delete") dialogDelete.value = true;
}

// ---------------- COMPUTED ----------------
const filteredTransactions = computed(() =>
  transactions.value.filter((t) =>
    Object.values(t).join(" ").toLowerCase().includes(transactionSearch.value.toLowerCase())
  )
);

const filteredBettings = computed(() =>
  bettings.value.filter((b) =>
    Object.values(b).join(" ").toLowerCase().includes(bettingSearch.value.toLowerCase())
  )
);

onMounted(fetchUsers);
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
</style>
