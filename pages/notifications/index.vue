<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col class="d-flex align-center">
        <h2 class="text-h5 font-bold text-gray-800">Notifications</h2>
        <v-spacer />
        <v-btn color="gradient-cyan" class="px-6" elevation="3" @click="dialogCreate = true">
          Send Notification
        </v-btn>
      </v-col>
    </v-row>

    <!-- Notifications Table -->
    <v-card class="rounded-2xl elevation-6">
      <v-card-title class="d-flex align-center">
        <v-text-field
          v-model="search"
          placeholder="Search notifications..."
          density="compact"
          prepend-inner-icon="mdi-magnify"
          hide-details
          rounded
          style="max-width: 300px"
        />
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="filteredNotifications"
        class="elevation-0"
        hide-default-footer
      >
        <template #item.status="{ item }">
          <v-chip
            :color="item.sent ? 'green lighten-2' : 'orange lighten-2'"
            text-color="white"
            small
            pill
          >
            {{ item.sent ? 'Sent' : 'Pending' }}
          </v-chip>
        </template>

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
              <v-list-item class="text-red" @click="deleteNotification(item)">
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- CREATE/EDIT NOTIFICATION DIALOG -->
    <v-dialog v-model="dialogCreate" max-width="600">
      <v-card class="pa-6 rounded-2xl elevation-5">
        <v-card-title class="text-h6 font-bold">
          {{ isEditing ? "Edit Notification" : "Send Notification" }}
        </v-card-title>

        <v-card-text class="d-flex flex-column gap-4">
          <v-text-field label="Title" v-model="notificationForm.title" outlined />
          <v-textarea label="Message" v-model="notificationForm.message" outlined />
          <v-select
            label="Send To"
            :items="['All Users', 'Admin', 'Agent', 'User']"
            v-model="notificationForm.sendTo"
            outlined
          />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="closeDialog">Cancel</v-btn>
          <v-btn color="gradient-cyan" @click="sendNotification">
            {{ isEditing ? "Save" : "Send" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";

const headers = [
  { title: "Title", value: "title" },
  { title: "Message", value: "message" },
  { title: "Send To", value: "sendTo" },
  { title: "Status", value: "status" },
  { title: "Action", value: "action" },
];

// Static notifications
const notifications = ref([
  { id: 1, title: "Welcome", message: "Welcome to our platform", sendTo: "All Users", sent: true },
  { id: 2, title: "Bonus", message: "Deposit now and get 50% bonus", sendTo: "User", sent: false },
]);

const dialogCreate = ref(false);
const notificationForm = ref({ title: "", message: "", sendTo: "All Users" });
const isEditing = ref(false);
const activeNotification = ref({});
const search = ref("");

// Filtered notifications by search
const filteredNotifications = computed(() =>
  notifications.value.filter(n =>
    Object.values(n).join(" ").toLowerCase().includes(search.value.toLowerCase())
  )
);

// Open edit dialog
function openEditDialog(notification) {
  activeNotification.value = { ...notification };
  notificationForm.value = { ...notification };
  isEditing.value = true;
  dialogCreate.value = true;
}

// Close dialog
function closeDialog() {
  dialogCreate.value = false;
  isEditing.value = false;
  notificationForm.value = { title: "", message: "", sendTo: "All Users" };
}

// Send or update notification
function sendNotification() {
  if (isEditing.value) {
    const index = notifications.value.findIndex(n => n.id === activeNotification.value.id);
    if (index !== -1) notifications.value[index] = { ...notificationForm.value, id: activeNotification.value.id, sent: true };
  } else {
    notifications.value.unshift({ ...notificationForm.value, id: Date.now(), sent: true });
  }
  closeDialog();
}

// Delete notification
function deleteNotification(notification) {
  notifications.value = notifications.value.filter(n => n.id !== notification.id);
}
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
</style>
