<template>
  <v-container fluid class="pa-6">

    <!-- HEADER -->
    <v-row class="mb-6">
      <v-col class="d-flex align-center">
        <h2 class="text-h5 font-bold">Wheel Management</h2>
        <v-spacer />
        <v-btn color="gradient-cyan" @click="dialogCreate = true">
          Add Prize
        </v-btn>
      </v-col>
    </v-row>

    <!-- SPIN COST CARD -->
    <v-card class="mb-6 pa-6 rounded-2xl elevation-4">
      <div class="d-flex align-center">
        <v-text-field
          label="Spin Cost (VIP Points)"
          v-model="spinCost"
          type="number"
          class="mr-4"
        />
        <v-btn color="success" @click="updateSpinCost">
          Update Cost
        </v-btn>
      </div>
    </v-card>

    <!-- PRIZE TABLE -->
    <v-card class="rounded-2xl elevation-6">
      <v-data-table
        :headers="headers"
        :items="prizes"
        class="elevation-0"
      >
        <template #item.type="{ item }">
          <span class="font-weight-medium">
            {{ item.type === "amount" ? "Amount (৳)" : "VIP Points" }}
          </span>
        </template>

        <template #item.active="{ item }">
          <v-switch
            v-model="item.active"
            inset
            hide-details
            @change="toggleActive(item)"
          />
        </template>

        <template #item.action="{ item }">
          <v-menu offset-y>
            <template #activator="{ props }">
              <v-btn v-bind="props" icon class="kebab-btn">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item @click="openEditDialog(item)">
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>

              <v-divider />

              <v-list-item class="text-red" @click="deletePrize(item)">
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- CREATE DIALOG -->
    <v-dialog v-model="dialogCreate" max-width="500">
      <v-card class="pa-6 rounded-2xl">
        <v-card-title>Add Prize</v-card-title>

        <v-card-text>
          <v-select
            label="Prize Type"
            :items="['amount', 'vip_points']"
            v-model="prizeForm.type"
          />

          <v-text-field
            label="Value"
            type="number"
            v-model="prizeForm.value"
          />

          <v-text-field
            label="Probability (weight)"
            type="number"
            v-model="prizeForm.probability"
          />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn @click="dialogCreate = false">Cancel</v-btn>
          <v-btn color="gradient-cyan" @click="addPrize">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- EDIT DIALOG -->
    <v-dialog v-model="dialogEdit" max-width="500">
      <v-card class="pa-6 rounded-2xl">
        <v-card-title>Edit Prize</v-card-title>

        <v-card-text>
          <v-select
            label="Prize Type"
            :items="['amount', 'vip_points']"
            v-model="activePrize.type"
          />

          <v-text-field
            label="Value"
            type="number"
            v-model="activePrize.value"
          />

          <v-text-field
            label="Probability"
            type="number"
            v-model="activePrize.probability"
          />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn @click="dialogEdit = false">Cancel</v-btn>
          <v-btn color="gradient-cyan" @click="updatePrize">
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const API = "https://api.spcwin.info";

const headers = [
  { title: "Type", value: "type" },
  { title: "Value", value: "value" },
  { title: "Probability", value: "probability" },

  { title: "Action", value: "action" },
];

const prizes = ref([]);
const spinCost = ref(0);

const dialogCreate = ref(false);
const dialogEdit = ref(false);

const prizeForm = ref({
  type: "amount",
  value: 0,
  probability: 1,
});

const activePrize = ref({});

// LOAD DATA
const loadData = async () => {
  const res1 = await axios.get(`${API}/users/wheel-prizes`);
  prizes.value = res1.data;

  const res2 = await axios.get(`${API}/users/wheel-settings`);
  spinCost.value = res2.data.spin_cost;
};

onMounted(loadData);

// UPDATE SPIN COST
const updateSpinCost = async () => {
  await axios.post(`${API}/users/set-spin-cost`, {
    spin_cost: spinCost.value,
  });
  alert("Spin cost updated");
};

// ADD PRIZE
const addPrize = async () => {
  if (prizes.value.length >= 5) {
    alert("Maximum 5 prizes allowed");
    return;
  }

  await axios.post(`${API}/users/add-wheel-prize`, prizeForm.value);
  dialogCreate.value = false;
  loadData();
};

// EDIT
const openEditDialog = (item) => {
  activePrize.value = { ...item };
  dialogEdit.value = true;
};

const updatePrize = async () => {
  await axios.put(
    `${API}/users/update-wheel-prize/${activePrize.value.id}`,
    activePrize.value
  );
  dialogEdit.value = false;
  loadData();
};

// DELETE
const deletePrize = async (item) => {
  await axios.delete(`${API}/users/delete-wheel-prize/${item.id}`);
  loadData();
};

// TOGGLE ACTIVE
const toggleActive = async (item) => {
  await axios.post(`${API}/users/toggle-prize/`, {
    prize_id: item.id,
    active: item.active,
  });
};
</script>

<style scoped>
.gradient-cyan {
  background: linear-gradient(to right, #00bcd4, #00acc1);
}
.text-red {
  color: #c62828;
}
.kebab-btn {
  background: #ffffff;
  border-radius: 10px;
}
</style>