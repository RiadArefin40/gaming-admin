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
            <v-skeleton-loader
              v-if="loading"
              type="paragraph"
            ></v-skeleton-loader>
            <v-card v-else>
              <v-container>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="userName"
                      outlined
                      prepend-icon="mdi-account"
                      :label="$t('userName')"
                      :rules="[required]"
                      vid="user_name"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="name"
                      outlined
                      prepend-icon="mdi-account"
                      :label="$t('name')"
                      :rules="[required]"
                      vid="name"
                    />
                  </v-col>
                </v-row>
              </v-container>
              <v-container>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="email"
                      outlined
                      prepend-icon="mdi-email"
                      :label="$t('email')"
                      :rules="[required]"
                      vid="email"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="phone"
                      outlined
                      prepend-icon="mdi-phone"
                      :label="$t('phone')"
                      :rules="[required]"
                      vid="phone"
                    />
                  </v-col>
                </v-row>
              </v-container>
              <v-container>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="role"
                      :items="roles"
                      item-text="label"
                      item-value="name"
                      prepend-icon="mdi-lock"
                      outlined
                      :label="$t('selectRole')"
                      :rules="[required]"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-checkbox
                      v-model="showRating"
                      :label="$t('showRating')"
                    />
                  </v-col>
                </v-row>
              </v-container>
              <v-container>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-checkbox v-model="verify" :label="$t('lockAccount')" />
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
                class="m-4 bg-cyan text-white"
                type="submit"
                :loading="loading"
                :disabled="!numberForm"
                nuxt
              >
                {{ $t("create ") }}
              </v-btn>
              <v-btn
                v-else
                class="m-4 bg-cyan text-white"
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
const numberForm = ref(false);
const name = ref("");
const userName = ref("");
const email = ref("");
const phone = ref();
const role = ref("");
const verify = ref(false);
const showRating = ref(false);
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

function required(v: any) {
  return !!v || "Field is required";
}

onMounted(async () => {
  await nextTick();
  getAllRoles();
  if (route.query.id) {
    try {
      loading.value = true;
      const { data } = await useFetch(
        `${url}/admin/customer/${route.query.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      name.value = data?.value?.data?.name;
      userName.value = data?.value?.data?.username;
      email.value = data?.value?.data?.email;
      role.value = data?.value?.data?.role;
      phone.value = data?.value?.data?.phone_number;
      verify.value = data?.value?.data?.look_out_enabled;
      showRating.value = data?.value?.data?.show_rating;
      loading.value = false;
    } catch {}
  } else {
    loading.value = false;
  }
});

async function getAllRoles() {
  try {
    const { data } = await useFetch(`${url}/admin/role`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    roles.value = data?.value?.data?.map(({ name }) => name);
  } catch (e) {
    console.log(e);
  }
}

async function handleSubmit() {
  loading.value = true;
  if (route.query.id) {
    const method = "PUT";
    try {
      const res = await useFetch(`${url}/admin/customer/${route.query.id}`, {
        method: `${method}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          username: userName.value,
          name: name.value,
          email: email.value,
          phone_number: phone.value,
          look_out_enabled: verify.value,
          show_rating: showRating.value,
          role: role.value,
        },
      });
      toast.success(t("updatedSuccessfully"));
      loading.value = false;
      router.push("/users");
    } catch (e) {
      console.log(e);
      loading.value = false;
    }
  } else {
    const method = "POST";
    try {
      const res = await useFetch(`${url}/admin/customer`, {
        method: `${method}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          username: userName.value,
          name: name.value,
          email: email.value,
          phone_number: phone.value,
          look_out_enabled: verify.value,
          show_rating: showRating.value,
          role: role.value,
        },
      });
      toast.success(t("createdSuccessfully"));
      loading.value = false;
      router.push("/users");
    } catch (e) {
      console.log(e);
      loading.value = false;
    }
  }
}

const can_edit = computed(() => !!route.query.id);
</script>
