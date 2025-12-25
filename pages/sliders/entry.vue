<template>
  <div id="userEntry">
    <v-container fluid>
      <v-row>
        <v-col>
          <h4 v-if="!can_edit">{{ $t("create") }}</h4>
          <h4 v-else>{{ $t("update") }}</h4>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-form @submit.prevent="handleSubmit()" v-model="numberForm">
            <v-skeleton-loader v-if="loading" type="paragraph"></v-skeleton-loader>
            <v-card v-else>
              <v-container>
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="name"
                      outlined
                      variant="underlined"
                      prepend-icon="mdi-rename"
                      :label="$t('title')"
                      vid="name"
                      :rules="[required]"
                    />
                  </v-col>
                  <v-col>
                    <v-text-field
                      v-model="ranking"
                      outlined
                      variant="underlined"
                      prepend-icon="mdi-rename"
                      :label="$t('order')"
                      vid="name"
                      :rules="[required]"
                    />
                  </v-col>
                </v-row>

                <v-row v-if="!route.query.id">
                  <v-col cols="6">
                    <v-card class="image-upload" outlined>
                      <v-file-input
                        v-model="file"
                        :label="$t('chooseFile')"
                        variant="underlined"
                        :clearable="false"
                        :rules="[required]"
                        @change="previewDesktopImage"
                      ></v-file-input>
                      <template v-if="imageUrl">
                        <v-card-text
                          class="d-flex justify-center align-center relative w-100"
                        >
                          <v-btn
                            @click="removeImage"
                            icon
                            dark
                            class="ma-0 remove bg-pink"
                          >
                            <v-icon> mdi-delete </v-icon>
                          </v-btn>
                          <v-img :src="imageUrl" aspect-ratio="1.78" />
                        </v-card-text>
                      </template>
                    </v-card>
                  </v-col>
                  <v-col cols="6">
                    <v-card class="image-upload" outlined>
                      <v-file-input
                        v-model="mobileFile"
                        :label="$t('chooseMobFile')"
                        variant="underlined"
                        :clearable="false"
                        :rules="[required]"
                        @change="previewMobileImage"
                      ></v-file-input>
                      <template v-if="mobileImageUrl">
                        <v-card-text
                          class="d-flex justify-center align-center relative w-100"
                        >
                          <v-btn
                            @click="removeMobileImage"
                            icon
                            dark
                            class="ma-0 remove bg-pink"
                          >
                            <v-icon> mdi-delete </v-icon>
                          </v-btn>
                          <v-img :src="mobileImageUrl" aspect-ratio="1.78" />
                        </v-card-text>
                      </template>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-checkbox v-model="verify" :label="$t('isActive')" />
                  </v-col>
                </v-row>
              </v-container>
              <v-btn
                class="!ml-4"
                color="warning"
                outlined
                @click="$router.back()"
              >
                {{ $t("cancel") }}
              </v-btn>
              <v-btn
                v-if="!can_edit"
                :disabled="!numberForm"
                class="m-4"
                type="submit"
                color="primary"
                :loading="loading"
              >
                {{ $t("create") }}
              </v-btn>
              <v-btn
                v-else
                :loading="loading"
                class="m-4"
                type="submit"
                color="primary"
                nuxt
              >
                {{ $t("update") }}
              </v-btn>
            </v-card>
          </v-form>
        </v-col>
      </v-row>
      <VSonner position="top-center" />
    </v-container>
  </div>
</template>

<script setup lang="ts">
const name = ref("");
const content = ref("");
const email = ref("");
const phone = ref("");
const ranking = ref("");
const verify = ref(false);
const loading = ref(true);
const roles = ref([]);
const file = ref(null);
const mobileFile = ref(null);
const imageUrl = ref("");
const mobileImageUrl = ref("");
import { VSonner, toast } from "vuetify-sonner";
import "vuetify-sonner/style.css";
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const baseUrl = useUrls();
const url = baseUrl.apiBaseUrl;
const useAuthData = useAuth();
const token = useAuthData?.token?.value;
const numberForm = ref(false);

onMounted(async () => {
  await nextTick()
  if (route.query.id) {
    try {
      const { data } = await useFetch(
        `${url}/admin/slider-items/${route.query.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      name.value = data?.value?.name;
      ranking.value = data?.value?.order;
      verify.value = data?.value?.visible;
      imageUrl.value = data?.value?.imageUrl;
      mobileImageUrl.value = data?.value?.mobileImageUrl;
      loading.value = false;
    } catch {}
  }
  else{
    loading.value = false
  }
});

function required(v: any) {
  return !!v || "Field is required";
}

async function handleSubmit() {
  if (route.query.id) {
    const method = "PUT";
    try {
      loading.value = true;
      const formData = new URLSearchParams();
      formData.append("name", name.value);
      formData.append("ranking", ranking.value);
      formData.append("visible", verify.value);
      const res = await useFetch(
        `${url}/admin/slider-items/${route.query.id}`,
        {
          method: `${method}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      toast.success(t("updatedSuccessfully"));
      router.push("/sliders");
    } catch (e) {
      console.log(e);
    }
  } else {
    const method = "POST";
    try {
      loading.value = true;
      const formData = new FormData();
      formData.append("name", name.value);
      formData.append("ranking", ranking.value);
      formData.append("visible", verify.value);
      formData.append("desktop_image", file.value);
      formData.append("mobile_image", mobileFile.value);
      const res = await useFetch(`${url}/admin/slider-items`, {
        method: `${method}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      console.log(res, "res");
      toast.success(t("createdSuccessfully"));
      router.push("/sliders");
    } catch (e) {
      console.log(e);
    }
  }
}
const formTitle = computed(() =>
  route.query.id ? "Update Material " : "Create Material"
);

const can_edit = computed(() => !!route.query.id);

// Function to handle file input change and update image preview
const previewDesktopImage = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    imageUrl.value = "";
  }
};
const previewMobileImage = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      mobileImageUrl.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    mobileImageUrl.value = "";
  }
};
function removeImage() {
  imageUrl.value = "";
  file.value = null;
}
function removeMobileImage() {
  mobileImageUrl.value = "";
  mobileFile.value = null;
}
</script>
