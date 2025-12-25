<template>
    <div id="userEntry">
      <v-container fluid>
        <v-row>
          <v-col>
            <h4 v-if="!can_edit">{{$t('create')}}</h4>
            <h4 v-else>{{$t('update')}}</h4>
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
                      <v-textarea
                        v-model="content"
                        outlined
                        variant="underlined"
                        prepend-icon="mdi-rename"
                        :label="$t('description')"
                        vid="name"
                        :rules="[required]"
                      />
                    </v-col>
                    <v-col>
                      <v-textarea
                        v-model="arContent"
                        outlined
                        variant="underlined"
                        prepend-icon="mdi-rename"
                        :label="$t('arDescription')"
                        vid="name"
                        :rules="[required]"
                      />
                    </v-col>
                    
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="title"
                        outlined
                        variant="underlined"
                        prepend-icon="mdi-rename"
                        :label="$t('title')"
                        vid="Title"
                        :rules="[required]"
                      />
                    </v-col>
                  <v-col cols="6">
                      <!-- Image uploader -->
                    <v-card class="image-upload" outlined>
                      <v-file-input
                        v-model="file"
                        :label="$t('chooseFile')"
                        variant="underlined"
                        :clearable="false"
                        @change="previewImage"
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
                </v-row>
   
                </v-container>
                <v-btn
                  class="!ml-4"
                  color="warning"
                  outlined
                  @click="$router.back()"
                >
                  {{$t('cancel')}}
                </v-btn>
                <v-btn
                  v-if="!can_edit"
                  :disabled="!numberForm"
                  class="m-4"
                  type="submit"
                  color="primary"
                >
                {{$t('create')}}
                </v-btn>
                <v-btn v-else class="m-4" type="submit" color="primary" nuxt>
                  {{$t('update')}}
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
  const arContent = ref("");
  const content = ref("");
  const verify = ref(false);
  const loading = ref(true);
  const title = ref("");
  const file = ref(null);
  const imageUrl = ref("");
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
    await nextTick();
    if (route.query.id) {
      try {
        const { data } = await useFetch(
          `${url}/admin/content-managements/${route.query.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        title.value = data?.value?.title;
        content.value = data?.value?.content;
        arContent.value = data?.value?.arabicContent;
        loading.value = false;
      } catch {}
    }
    else{
      loading.value = false;
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
      formData.append('title', title.value);
      formData.append('content', content.value);
      formData.append('arabicContent', arContent.value);

        const res = await useFetch(`${url}/admin/influencer-videos/${route.query.id}`, {
          method: `${method}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData
         
          ,
        });
        toast.success(t("updatedSuccessfully"));
        router.push("/content-management");
      } catch (e) {
        console.log(e);
      }
    } else {
      const method = "POST";
      try {
      loading.value = true;
      const formData = new FormData();
      formData.append('title', name.value);
      formData.append('content', content.value);
      formData.append('visible', verify.value);
      formData.append('file', file.value);
        const res = await useFetch(`${url}/admin/influencer-videos`, {
          method: `${method}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        toast.success(t("createdSuccessfully"));
        router.push("/celebrity-content-management");
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
  