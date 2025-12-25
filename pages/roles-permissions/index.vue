<template>
  <v-container fluid class="pa-6">
    <!-- Page Header -->
    <v-row class="mb-6">
      <v-col class="d-flex align-center">
        <h2 class="text-h5 font-weight-bold text-gray-800">Role & Permission Management</h2>
        <v-spacer />
        <!-- <v-btn color="gradient-cyan" class="text-white px-6" elevation="4">
          Create Role
        </v-btn> -->
      </v-col>
    </v-row>

    <v-row dense>
      <!-- ROLE LIST -->
      <v-col cols="12" md="4">
        <v-card class="rounded-2xl elevation-6">
          <v-card-title class="d-flex align-center bg-cyan-lighten-5 rounded-t-2xl px-4 py-3">
            <span class="text-subtitle-1 font-medium">Roles</span>
            <v-spacer />
            <v-text-field
              v-model="roleSearch"
              placeholder="Search role"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              hide-details
              rounded
              class="bg-white elevation-2 px-2"
              style="max-width: 180px"
            />
          </v-card-title>

          <v-divider />

          <v-list class="py-2">
            <v-list-item
              v-for="role in filteredRoles"
              :key="role.id"
              :active="selectedRole?.id === role.id"
              @click="selectRole(role)"
              class="cursor-pointer hover:bg-cyan-lighten-5 transition-all rounded-lg mx-3 my-1"
            >
              <v-list-item-title class="font-medium text-gray-700">{{ role.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- PERMISSIONS -->
      <v-col cols="12" md="8">
        <v-card class="rounded-2xl elevation-6">
          <v-card-title class="d-flex align-center bg-gradient-to-r from-cyan-200 to-cyan-100 rounded-t-2xl px-4 py-1">
            <span class="text-subtitle-1 font-medium">Permissions —</span>
            <span class="ml-2 font-bold text-cyan-800">{{ selectedRole?.name }}</span>

            <v-spacer />

            <v-text-field
              v-model="permissionSearch"
              placeholder="Search permission"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              hide-details
              rounded
              class="bg-white elevation-2 px-2"
              style="max-width: 220px"
            />
          </v-card-title>

          <v-divider />

          <v-card-text class="py-2 px-4">
            <v-row dense>
              <v-col
                v-for="perm in filteredPermissions"
                :key="perm.key"
                cols="12"
                md="6"
 
              >
                <v-switch
                  v-model="perm.enabled"
                  color="cyan"
                  inset
                  :label="perm.label"
                  class="text-gray-700 font-medium"
                />
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider />

          <v-card-actions class="justify-end px-6 py-4">
            <v-btn variant="tonal" class="mr-3">Reset</v-btn>
            <v-btn color="cyan" class="text-white px-6" elevation="2">Save Permissions</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue"

/* ---------- ROLES ---------- */
const roles = ref([
  { id: 1, name: "Admin" },
  { id: 2, name: "Agent" },
  { id: 3, name: "User" },
])

const selectedRole = ref(roles.value[0])
const roleSearch = ref("")

const filteredRoles = computed(() =>
  roles.value.filter(r =>
    r.name.toLowerCase().includes(roleSearch.value.toLowerCase())
  )
)

function selectRole(role) {
  selectedRole.value = role
}

/* ---------- PERMISSIONS ---------- */
const permissions = ref([
  { key: "create_user", label: "Create User", enabled: true },
  { key: "edit_user", label: "Edit User", enabled: true },
  { key: "delete_user", label: "Delete User", enabled: false },
  { key: "view_user", label: "View User", enabled: true },
  { key: "block_user", label: "Block / Unblock User", enabled: false },
  { key: "view_transactions", label: "View Transactions", enabled: true },
  { key: "manage_roles", label: "Manage Roles", enabled: false },
  { key: "add_coins", label: "Add Coins", enabled: false },
])

const permissionSearch = ref("")

const filteredPermissions = computed(() =>
  permissions.value.filter(p =>
    p.label.toLowerCase().includes(permissionSearch.value.toLowerCase())
  )
)
</script>

<style scoped>
.bg-cyan-lighten-5 {
  background-color: #e0f7fa !important;
}
.bg-gradient-to-r {
  background: linear-gradient(to right, #b2ebf2, #80deea) !important;
}
.text-gray-700 {
  color: #4a4a4a !important;
}
.text-cyan-800 {
  color: #006064 !important;
}
.hover\:bg-cyan-lighten-5:hover {
  background-color: #b2ebf2 !important;
}
</style>
