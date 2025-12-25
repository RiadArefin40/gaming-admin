<template>
  <v-container>
    <v-skeleton-loader v-if="loading" type="paragraph"></v-skeleton-loader>
    <v-card v-else>
        <v-card-text>
            <v-row>
                <v-col cols="6">
                    <v-text-field
                      v-model="taxValue"
                      outlined
                      variant="underlined"
                      prepend-icon="mdi-calendar-month"
                      :label="$t('tax')"
                      vid="tax"
                    />

                </v-col>
                <v-col>
                    <v-btn :loading="loading" @click="handleUpdate" class="bg-cyan text-white" nuxt>
                     {{ $t("update") }}
                   </v-btn>
                </v-col>
            </v-row>
            <VSonner position="top-center" />
        </v-card-text>
 
    </v-card>

  </v-container>
  

</template>
<script setup>
const taxValue = ref('');
const loading = ref(true);
const baseUrl = useUrls();
const router = useRouter();
const url = baseUrl.apiBaseUrl;
const { t } = useI18n();
const useAuthData = useAuth();
const token = useAuthData?.token?.value;
import { VSonner, toast } from "vuetify-sonner";

async function loadTableData() {
  try {
    loading.value = true;
    const { data } = await useFetch(
      `${url}/admin/tax`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    taxValue.value = data?.value.value;
    loading.value = false;
  } catch (error) {
    console.error("Login failed. Here's the raw error:", error);
  }
}
onMounted(async () => {
    await nextTick();

    loadTableData();
})
async function handleUpdate (){
    try {
    loading.value = true;
    const { data } = await useFetch(
      `${url}/admin/tax/update`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body:{ 
            key: "tax",
            value: taxValue.value
        }
      }
    );
    toast.success(t("updatedSuccessfully"));
    loading.value = false;
    router.push(`/tax-management`);

  } catch (error) {
    console.error("Login failed. Here's the raw error:", error);
    loading.value = false;
  }
}
</script>