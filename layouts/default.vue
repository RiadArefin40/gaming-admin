<template>

    <v-app>
      <v-layout class="rounded rounded-md">
  <v-navigation-drawer
  v-model="drawer"
  :rail="rail"
  permanent
  :width="300"
  class="modern-drawer"
  @click="rail = false"
>
  <!-- LOGO AREA -->
  <div class="drawer-header">
    <div class="logo-circle">BR</div>
    <div v-if="!rail" class="logo-text">
      <h3>Bajiraj</h3>
      <span>Admin Panel</span>
    </div>
  </div>

  <v-divider class="opacity-30"></v-divider>

  <!-- SKELETON -->
  <div v-if="loading" class="px-3">
    <v-skeleton-loader
      v-for="n in 6"
      :key="n"
      type="list-item-two-line"
    />
  </div>

  <!-- MENU -->
  <v-list v-else density="compact" nav class="menu-list">
    
    <p class="menu-section">MAIN</p>

    <NuxtLink to="/">
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
        class="menu-item"
      />
    </NuxtLink>

    <p class="menu-section">MANAGEMENT</p>

    <NuxtLink to="/users">
      <v-list-item prepend-icon="mdi-account-group" title="Users" class="menu-item" />
    </NuxtLink>
    <NuxtLink to="/promocode-management">
  <v-list-item
    prepend-icon="mdi-sale"
    title="Promotions"
    class="menu-item promotion-item"
  />
</NuxtLink>

    <NuxtLink v-if="user && JSON.parse(user).role === 'admin'" to="/admins">
      <v-list-item prepend-icon="mdi-shield-account" title="Admins" class="menu-item" />
    </NuxtLink>

    <NuxtLink to="/headline">
      <v-list-item prepend-icon="mdi-text" title="System Setting" class="menu-item" />
    </NuxtLink>
<!-- 
    <NuxtLink to="/notifications">
      <v-list-item prepend-icon="mdi-bell" title="Notifications" class="menu-item" />
    </NuxtLink> -->

    <NuxtLink to="/payment-gateway">
      <v-list-item prepend-icon="mdi-credit-card" title="Payment Gateway" class="menu-item" />
    </NuxtLink>
<!-- 
    <NuxtLink to="/roles-permissions">
      <v-list-item prepend-icon="mdi-lock" title="Roles & Permissions" class="menu-item" />
    </NuxtLink> -->

    <p class="menu-section">FINANCE</p>

    <NuxtLink to="/transactions">
      <v-list-item prepend-icon="mdi-bank-transfer" title="Deposits" class="menu-item" />
    </NuxtLink>

    <NuxtLink to="/widthraw">
      <v-list-item prepend-icon="mdi-cash" title="Cashout Requests" class="menu-item" />
    </NuxtLink>

  </v-list>
</v-navigation-drawer>

     <v-app-bar elevation="0" class="modern-appbar">
  <template #prepend>
    <v-app-bar-nav-icon @click.stop="rail = !rail" />
  </template>

  <v-spacer />

  <!-- Language -->
  <v-menu>
    <template #activator="{ props }">
      <v-btn v-bind="props" icon="mdi-web" />
    </template>
    <v-list>
      <v-list-item @click="changeLocale('en')">English</v-list-item>
      <v-list-item @click="changeLocale('ar')">Arabic</v-list-item>
    </v-list>
  </v-menu>

  <!-- User -->
  <v-menu>
    <template #activator="{ props }">
      <v-btn v-bind="props" icon="mdi-account-circle" />
    </template>
    <v-list>
      <NuxtLink to="/profile">
        <v-list-item prepend-icon="mdi-account">Profile</v-list-item>
      </NuxtLink>
      <v-list-item prepend-icon="mdi-logout" @click="handleSignOut">
        Logout
      </v-list-item>
    </v-list>
  </v-menu>
</v-app-bar>

 <v-main class="main-area">
  <div class="page-wrapper">
    <div v-if="loading" class="skeleton-wrapper">
      <v-skeleton-loader type="card" />
      <v-skeleton-loader type="card" />
    </div>

    <NuxtPage v-else />
  </div>

  <v-footer class="app-footer">
    <v-divider />
    <div class="footer-text">© 2026 Bajiraj</div>
  </v-footer>
</v-main>

      </v-layout>
      <VSonner position="top-center" />

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

const user = process.client
  ? localStorage.getItem("auth_user")
  : null;

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
  
      if (process.client) {
         localStorage.removeItem("auth_user");
         toast.warning("successfully SignOut");
         navigateTo("/auth/login");
     }
    // await signOut({ callbackUrl: "auth/login/", redirect: true });
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


/* Drawer */
.modern-drawer {
  background: linear-gradient(180deg, #0f172a, #020617);
  color: #fff;
  box-shadow: 8px 0 30px rgba(0, 0, 0, 0.4);
}

/* Header */
.drawer-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
}

.logo-circle {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  display: grid;
  place-items: center;
  font-weight: bold;
  color: #fff;
}

.logo-text h3 {
  font-size: 16px;
  font-weight: 600;
}
.logo-text span {
  font-size: 12px;
  opacity: 0.6;
}

/* Sections */
.menu-section {
  margin: 18px 16px 8px;
  font-size: 11px;
  letter-spacing: 1px;
  opacity: 0.5;
}

/* Menu Item */
.menu-item {
  margin: 6px 10px;
  border-radius: 12px;
  transition: all 0.25s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

/* Active Route */
.router-link-active .menu-item {
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  color: white;
}

/* App Bar */
.modern-appbar {
  background: rgba(15, 14, 51, 0.952) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  color: #ffffff !important;
  font-size: larger !important;
}

/* Page Wrapper */
.page-wrapper {
  /* padding: 24px; */
  min-height: 100vh;
  background: #f2f2f5;
}

/* Main background */
.main-area {
  background: linear-gradient(180deg, #f8fafc, #f1f5f9);
}

/* Page wrapper */
.page-wrapper {
  /* padding: 24px; */
  /* max-width: 1400px; */
  margin: 0 auto;
  min-height: calc(100vh - 64px);
}

/* Skeleton */
.skeleton-wrapper {
  display: grid;
  gap: 16px;
}

/* GLOBAL INNER CONTENT STYLE */
.page-wrapper > * {
  animation: fadeIn 0.25s ease-in;
}

/* Cards inside pages */
.page-wrapper .v-card,
.page-wrapper .card,
.page-wrapper .content-card {
  background: #ffffff;
  border-radius: 18px;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.05),
    0 4px 10px rgba(0, 0, 0, 0.04);
}

/* Tables */
.page-wrapper table,
.page-wrapper .v-data-table {
  background: #b9cbe6;

  overflow: hidden;
}

/* Headings */
.page-wrapper h1 {
  font-size: 32px;
  font-weight: 700;
  color: #e8e9f0 !important;
}

.page-wrapper h2 {
  font-size: 28px;
  font-weight: 600;
  color: #020617;
}

.page-wrapper p {
  color: #3b4452;
}

/* Forms */
.page-wrapper .v-field {
  border-radius: 14px;
}

/* Buttons */
.page-wrapper .v-btn {
  border-radius: 14px;
  text-transform: none;
  font-weight: 500;
}

/* Footer */
.app-footer {
  background: transparent;
  padding: 12px 0 20px;
}

.footer-text {
  font-size: 12px;
  color: #adc1dd;
  margin-top: 8px;
}

/* Animation */

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


</style>
