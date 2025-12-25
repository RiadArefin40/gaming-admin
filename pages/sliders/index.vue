<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col class="d-flex align-center">
        <h2 class="text-h5 font-bold text-gray-800">Homepage Slider Management</h2>
        <v-spacer />
        <v-btn color="gradient-cyan" class=" px-6" elevation="3" @click="dialogAdd = true">
          Add Slide
        </v-btn>
      </v-col>
    </v-row>

    <!-- Slider Table -->
    <v-card class="rounded-2xl elevation-6">
      <v-data-table
        :headers="headers"
        :items="slides"
        hide-default-footer
        class="elevation-0"
      >
        <template #item.image="{ item }">
          <v-img :src="item.image" max-width="120" max-height="60" class="rounded-lg" contain />
        </template>

        <template #item.status="{ item }">
          <v-chip :color="item.active ? 'green lighten-2' : 'red lighten-2'" text-color="white" small pill>
            {{ item.active ? 'Active' : 'Inactive' }}
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
              <v-list-item @click="openDialog('edit', item)">
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>

              <v-list-item @click="deleteSlide(item)">
                <v-list-item-title class="text-red">Delete</v-list-item-title>
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

    <!-- ADD/EDIT DIALOG -->
    <v-dialog v-model="dialogAdd" max-width="600">
      <v-card class="pa-6 rounded-2xl elevation-5">
        <v-card-title class="text-h6 font-bold">{{ editSlide ? 'Edit Slide' : 'Add Slide' }}</v-card-title>

        <v-card-text class="d-flex flex-column gap-4">
          <v-text-field label="Title" v-model="slideForm.title" outlined />
          <v-text-field label="Subtitle" v-model="slideForm.subtitle" outlined />
          <v-file-input
            label="Slide Image"
            v-model="slideForm.image"
            accept="image/*"
            show-size
            outlined
          />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="closeDialog">Cancel</v-btn>
          <v-btn color="gradient-cyan" class="" @click="saveSlide">
            {{ editSlide ? 'Update' : 'Add' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from "vue";

const headers = [
  { title: "Image", value: "image" },
  { title: "Title", value: "title" },
  { title: "Subtitle", value: "subtitle" },
  { title: "Status", value: "status" },
  { title: "Action", value: "action" },
];

const slides = ref([
  { id: 1, image: "https://via.placeholder.com/300x150", title: "Slide 1", subtitle: "Welcome to our site", active: true },
  { id: 2, image: "https://via.placeholder.com/300x150", title: "Slide 2", subtitle: "Check out features", active: false },
]);

const dialogAdd = ref(false);
const slideForm = ref({ id: null, title: "", subtitle: "", image: null, active: true });
const editSlide = ref(false);

function openDialog(type, item) {
  if (type === "edit") {
    editSlide.value = true;
    slideForm.value = { ...item };
    dialogAdd.value = true;
  } else {
    editSlide.value = false;
    slideForm.value = { id: null, title: "", subtitle: "", image: null, active: true };
    dialogAdd.value = true;
  }
}

function closeDialog() {
  dialogAdd.value = false;
  slideForm.value = { id: null, title: "", subtitle: "", image: null, active: true };
  editSlide.value = false;
}

function saveSlide() {
  if (editSlide.value) {
    const index = slides.value.findIndex(s => s.id === slideForm.value.id);
    slides.value[index] = { ...slideForm.value };
  } else {
    slides.value.push({ ...slideForm.value, id: Date.now() });
  }
  closeDialog();
}

function deleteSlide(slide) {
  slides.value = slides.value.filter(s => s.id !== slide.id);
}

function toggleStatus(slide) {
  slide.active = !slide.active;
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
.rounded-2xl {
  border-radius: 1rem;
}
</style>
