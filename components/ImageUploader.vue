<template>
  <v-row>
    <v-col cols="6">
      <v-card class="image-upload" outlined>
        <v-file-input
          v-model="file"
          label="Choose an Image"
          variant="underlined"
          :clearable="false"
          @change="previewImage"
        ></v-file-input>
        <template v-if="imageUrl">
          <v-card-text
            class="d-flex justify-center align-center relative w-100"
          >
            <v-btn @click="removeImage" icon dark class="ma-0 remove bg-pink">
              <v-icon> mdi-delete </v-icon>
            </v-btn>
            <v-img :src="imageUrl" aspect-ratio="1.78" />
          </v-card-text>
        </template>

      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const file = ref(null);
const imageUrl = ref("");

// Function to handle file input change and update image preview
const previewImage = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    imageUrl.value = null;
  }
};
function removeImage() {
  imageUrl.value = null;
  file.value = null;
}
</script>
