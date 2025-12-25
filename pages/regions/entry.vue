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
                      <v-text-field
                        v-model="name"
                        outlined
                        variant="underlined"
                        prepend-icon="mdi-rename"
                        :label="$t('name')"
                        vid="name"
                        :rules="[required]"
                      />
                    </v-col>
               
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="arabicName"
                        outlined
                        variant="underlined"
                        prepend-icon="mdi-rename"
                        :label="$t('arName')"
                        vid="name"
                        :rules="[required]"
                      />
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
                  class="m-4 !bg-[#58c6e2]"
                  :loading = "loading"
                  type="submit"
                
                  
                >
                {{$t('create')}}
                </v-btn>
                <v-btn  :loading = "loading" v-else class="m-4" type="submit" color="primary" nuxt>
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
  const name = ref("");
  const arabicName = ref("");
  const role = ref("");
  const verify = ref(false);
  const roles = ref([]);

  import { VSonner, toast } from "vuetify-sonner";
  import "vuetify-sonner/style.css";
  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();
  const loading = ref(true);
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
          `${url}/admin/regions/${route.query.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        name.value = data?.value?.name;
        arabicName.value = data?.value?.arabicName;
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
   
        const res = await useFetch(`${url}/admin/regions/${route.query.id}`, {
          method: `${method}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: {
            name : name.value,
            arabicName : arabicName.value
          }
         
          ,
        });
        toast.success(t("updatedSuccessfully"));
        loading.value = false;
        router.push("/regions");
      } catch (e) {
        console.log(e);
      }
    } else {
      const method = "POST";
      try {
      loading.value = true;
 
        const res = await useFetch(`${url}/admin/regions`, {
          method: `${method}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: {
            name : name.value,
            arabicName : arabicName.value
          },
        });
        toast.success(t("createdSuccessfully"));
        loading.value = false;
        router.push("/regions");
      } catch (e) {
        console.log(e);
      }
    }
  }
  const formTitle = computed(() =>
    route.query.id ? "Update Material " : "Create Material"
  );
  
  const can_edit = computed(() => !!route.query.id);

  </script>
  