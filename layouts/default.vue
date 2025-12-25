<template>

    <v-app>
      <v-layout class="rounded rounded-md">
        <v-navigation-drawer
          :width="300"
          v-model="drawer"
          :rail="rail"
          permanent
          @click="rail = false"
        >
          <v-list-item id="navbar" class="h-[64px]"> </v-list-item>

          <v-divider></v-divider>
          <div v-if="loading">
          <v-skeleton-loader
            v-for="n in 6"
            :key="n"
            :loading="loading"
            type="list-item-two-line"
            width="300"
          >
            <v-list-item
              lines="two"
              subtitle="Subtitle"
              title="Title"
              rounded
            ></v-list-item>
          </v-skeleton-loader>
        </div>

          <v-list v-else density="compact" nav>
            <Nuxt-link to="/">
              <v-list-item
                class="border-b"
                prepend-icon="mdi-view-dashboard"
                :title="('dashboard')"
                value="home"
              >
              </v-list-item>
            </Nuxt-link>

            <Nuxt-link

              to="/users"
            >
              <v-list-item
                class="border-b"
                prepend-icon="mdi-account"
                :title="('Users')"
                value="users"
              ></v-list-item>
            </Nuxt-link>
            <Nuxt-link
    
              to="/notifications"
            >
              <v-list-item
                class="border-b"
                prepend-icon="mdi-taxi"
                :title="('Send Notifications')"
                value="driver-management"
              ></v-list-item>
            </Nuxt-link>

            <Nuxt-link
           
              to="/payment-gateway"
            >
              <v-list-item
                class="border-b"
                prepend-icon="mdi-lock"
                :title="('Payment gateway')"
                value="roles"
              ></v-list-item>
            </Nuxt-link>

            <Nuxt-link
    
              to="/roles-permissions"
            >
              <v-list-item
                class="border-b"
                prepend-icon="mdi-lock"
                :title="('Roles Permission')"
                value="Role permission"
              ></v-list-item>
            </Nuxt-link>

                        <Nuxt-link
    
              to="/sliders"
            >
              <v-list-item
                class="border-b"
                prepend-icon="mdi-lock"
                :title="('Sliders')"
                value="Sliders"
              ></v-list-item>
            </Nuxt-link>

            <Nuxt-link
     
              to="/promocode-management"
            >
              <v-list-item
                class="border-b"
                prepend-icon="mdi-percent"
                :title="('Promocode Management')"
                value="promo"
              ></v-list-item>
            </Nuxt-link>
      
      
  
  
   
      
        
   
        
            
         

            <Nuxt-link to="/transactions">
              <v-list-item
                class="border-b"
                prepend-icon="mdi-cog"
                :title="('Deposits')"
                value="Settings"
              ></v-list-item>
            </Nuxt-link>
            
            <Nuxt-link to="/widthraw">
              <v-list-item
                class="border-b"
                prepend-icon="mdi-cog"
                :title="('Cashout Request')"
                value="Settingsss"
              ></v-list-item>
            </Nuxt-link>
          </v-list>
        </v-navigation-drawer>
        <v-app-bar :elevation="2" id="navbar">
          <template v-slot:prepend>
            <v-app-bar-nav-icon @click.stop="rail = !rail"></v-app-bar-nav-icon>
          </template>

          <template v-slot:append>
            <div class="text-center">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-web"> </v-btn>
                </template>

                <v-list>
                  <v-list-item @click="changeLocale('en')">English</v-list-item>
                  <v-list-item @click="changeLocale('ar')">{{
                    ("Arabic")
                  }}</v-list-item>
                </v-list>
              </v-menu>
            </div>

            <div class="text-center">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-account"> </v-btn>
                </template>

                <v-list>
                  <nuxt-link to="/profile">
                    <v-list-item prepend-icon="mdi-account">
                      <p>Profile</p>
                    </v-list-item>
                  </nuxt-link>

                  <v-list-item @click="handleSignOut" prepend-icon="mdi-logout"
                    ><p>Logout</p></v-list-item
                  >
                </v-list>
              </v-menu>
            </div>
          </template>
        </v-app-bar>
        <v-main>
          
          <div  class="page-wrapper">
            <div v-if="loading" class="mt-14"> 
              <v-skeleton-loader  type="card"></v-skeleton-loader>
              <v-skeleton-loader  type="card"></v-skeleton-loader>
            </div>
            <NuxtPage v-else />
          </div>

          <v-footer class="text-center d-flex flex-column">
            <v-divider></v-divider>
            <div></div>
          </v-footer>
        </v-main>
      </v-layout>
      <VSonner position="top-center" />
      <!-- see location in map -->
      <v-dialog v-model="seeLocation" max-width="1000px">
        <v-container>
          <v-card class="p-4 m-">
            <div v-if="locationBtnLoading" class="flex justify-center h-[400px] items-center">
              <v-progress-circular
              :size="70"
              :width="7"
              color="primary"
              indeterminate
            ></v-progress-circular>

            </div>
            <GoogleMap v-else :markers="allLocations" />
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                @click="seeLocation = false"
                class="text-white bg-orange"
                >{{ ("cancel") }}</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-container>
      </v-dialog>
    </v-app>

</template>

<script setup>
import { useLocale } from "vuetify";
// const { locale, setLocale, t } = useI18n();
import { VSonner, toast } from "vuetify-sonner";
import { useLanguageStore } from "~/stores/language";
const languageStore = useLanguageStore();
import "vuetify-sonner/style.css";
import { onMounted } from "vue";
const baseUrl = useUrls();
const url = baseUrl.apiBaseUrl;
const loading = ref(false);
import GoogleMap from "~/components/GoogleMap.vue";
const seeLocation = ref(false);
const allLocations = [];
const locationBtnLoading = ref(false);

//  const token = useAuthData?.token?.value;
const token = '';

// const { doesUserHaveAnyPermissions } = await permission();
// const {
//   userManagementPermissions,
//   driverManagementPermissions,
//   roleManagementPermissions,
//   rolePerManagementPermissions,
//   contentManagementPermissions,
//   promoManagementPermissions,
//   packageManagementPermissions,
//   linkManagementPermissions,
//   celebrityManagementPermissions,
//   driverComManagementPermissions,
//   orderManagementPermissions,
//   regionManagementPermissions,
//   locationManagementPermissions,
//   sliderManagementPermissions,
//   saleManagementPermissions,
//   paymentProblemPermissions,
// } = await permissionChecker();
const drawer = ref(true);
const rail = ref(false);   
const { current } = useLocale();

// if (process.client) {
//   await nextTick();
//   useNuxtApp().$i18n.setLocale('en');
//   setTimeout(() => {
//     current.value = 'en';
//     loading.value = false;
//   }, 10);
// }

// function changeLocale(locale) {
//   current.value = 'en';
//   setLocale('en');
//   languageStore.setLanguage('en');
// }
async function handleSignOut() {
  try {
    toast.warning(t("successfullySignOut"));
    await signOut({ callbackUrl: "auth/login/", redirect: true });
  } catch (e) {
    console.log(e);
  }
}

const loadLocationData = async () => {
  try {
    locationBtnLoading.value = true;
    const response = await useFetch(`${url}/admin/locations?page=-1&per_page=-1`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const locations = response?.data?.value?.data;
    if (locations) {
      locations.forEach((element) => {
        allLocations.push({
          lat: element.latitude,
          lng: element.longitude,
        });
      });
    }
    locationBtnLoading.value  = false;
  } catch (error) {
    console.error("Login failed. Here's the raw error:", error);
  }
};
const showLocation = async () => {
  seeLocation.value = true;
  await loadLocationData() 
};
onMounted(() => {
  loadLocationData();
});
</script>

<style>
.page-wrapper {
  min-height: calc(100vh - 64px - 41px);
}
.mt-14{
  padding-top: 30px;
}
</style>
