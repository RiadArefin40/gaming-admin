<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col class="d-flex align-center">
        <h3 class="mr-6">Incoming SMS</h3>
        <v-spacer />
        <v-text-field
          v-model="search"
          placeholder="Search sender or message..."
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          hide-details
          density="comfortable"
          style="max-width: 350px"
        />
      </v-col>
    </v-row>

    <!-- SMS Table -->
    <v-card class="rounded-2xl elevation-6">
      <v-overlay :value="loading">
        <v-progress-circular indeterminate size="64" color="cyan" />
      </v-overlay>

      <v-data-table
        :headers="headers"
        :items="filteredSms"
        density="compact"
      >
        <!-- Sender -->
        <template #item.sender="{ item }">
          <v-chip color="blue" variant="tonal" small>
            {{ item.sender }}
          </v-chip>
        </template>

        <!-- Message -->
        <template #item.message="{ item }">
          <div class="sms-message">
            {{ item.message }}
          </div>
        </template>

        <!-- Type -->
        <template #item.type="{ item }">
          <v-chip color="purple" variant="tonal" small>
            {{ item.type }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const headers = [
  { title: "ID", value: "id" },
  { title: "Type", value: "type" },
  { title: "Sender", value: "sender" },
  { title: "Message", value: "message" },
  { title: "Received At", value: "received_at" },
];

const smsList = ref([]);
const search = ref("");
const loading = ref(false);

const filteredSms = computed(() =>
  smsList.value.filter((sms) =>
    Object.values(sms)
      .join(" ")
      .toLowerCase()
      .includes(search.value.toLowerCase())
  )
);

async function fetchSms() {
  loading.value = true;
  try {
    const res = await fetch("https://api.spcwin.info/users/admin/sms");
    smsList.value = await res.json();
  } catch (err) {
    console.error("Failed to fetch SMS:", err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchSms();
  setInterval(fetchSms, 10000); // auto refresh every 10s
});
</script>

<style scoped>
.rounded-2xl {
  border-radius: 1rem;
}

.sms-message {
  max-width: 500px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 13px;
}
</style>
