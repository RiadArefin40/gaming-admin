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

<NuxtLink to="/transactions" class="d-flex align-center">
  <v-badge
    :content="unreadCount"
    color="red"
    overlap
    v-if="unreadCount > 0"
  >
    <v-list-item
      prepend-icon="mdi-bank-transfer"
      title="Deposits"
      class="menu-item"
    />
  </v-badge>

  <!-- If no unread, just show list item normally -->
  <v-list-item
    v-else
    prepend-icon="mdi-bank-transfer"
    title="Deposits"
    class="menu-item"
  />
</NuxtLink>


  <NuxtLink to="/widthraw" class="d-flex align-center">
  <v-badge
    :content="unreadWithdrawCount"
    color="orange"
    overlap
    v-if="unreadWithdrawCount > 0"
  >
    <v-list-item
      prepend-icon="mdi-cash"
      title="Cashout Requests"
      class="menu-item"
    />
  </v-badge>

  <!-- If no unread, just show list item normally -->
  <v-list-item
    v-else
    prepend-icon="mdi-cash"
    title="Cashout Requests"
    class="menu-item"
  />
</NuxtLink>


  </v-list>
</v-navigation-drawer>

     <v-app-bar elevation="0" class="modern-appbar">
  <template #prepend>
    <v-app-bar-nav-icon @click.stop="rail = !rail" />
  </template>

  <v-spacer />

  <!-- Language -->
<!-- Notifications -->
<v-menu v-model="notificationsModal" bottom right transition="scale-transition">
  <template #activator="{ props }">
    <v-btn v-bind="props" icon>
      <v-badge
        :content="unreadCount"
        color="red"
        overlap
        v-if="unreadCount > 0"
      >
        <v-icon size="28">mdi-bell</v-icon>
      </v-badge>
      <v-icon size="28" v-else>mdi-bell-outline</v-icon>
    </v-btn>
  </template>

  <v-card class="notifications-card">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6">Notifications</span>
      <v-btn text small color="primary" @click="markAllRead">
        Mark all as read
      </v-btn>
    </v-card-title>

    <v-divider></v-divider>

    <v-list dense class="notifications-list">
      <v-list-item
        v-for="notif in notifications"
        :key="notif.id"
        @click="markAsRead(notif)"
        class="notification-item"
        :class="{'notification-unread': !notif.read}"
      >
        <v-list-item-avatar>
          <v-icon color="primary">mdi-bell-ring</v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title class="text-body-1">
            {{ notif.message }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption grey--text">
            {{ new Date(notif.created_at).toLocaleString() }}
          </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-icon v-if="!notif.read">
          <v-icon color="red">mdi-circle-small</v-icon>
        </v-list-item-icon>
      </v-list-item>

      <v-list-item v-if="notifications.length === 0">
        <v-list-item-content class="text-center grey--text">
          No new notifications
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>
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


const showLocation = async () => {
  seeLocation.value = true;
  await loadLocationData() 
};



// Notifications
const notifications = ref([]);
const unreadCount = ref(0);
const notificationsModal = ref(false);



const fetchNotifications = async () => {
  try {
    const { data, error } = await useFetch("https://api.bajiraj.cloud/deposit/admin/notifications?unread=true", {
      method: "GET",
    });

    if (error.value) {
      console.error("Failed to fetch notifications:", error.value);
      return;
    }

    notifications.value = data.value.notifications;
    unreadCount.value = notifications.value.filter(n => !n.read).length;
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
  }
};

// Mark a notification as read
const markAsRead = async (notif) => {
  try {
    const { error } = await useFetch(`https://api.bajiraj.cloud/deposit/admin/notifications/${notif.id}/read`, {
      method: "PATCH",
    });

    if (error.value) {
      console.error("Failed to mark notification as read:", error.value);
      return;
    }

    notif.read = true;
    unreadCount.value = notifications.value.filter(n => !n.read).length;
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
  }
};

onMounted(fetchNotifications);


// Run fetch only on client
onMounted(() => {
  fetchNotifications();

  // Auto-refresh every 15s
  setInterval(() => {
    fetchNotifications();
  }, 10000);
});

const withdrawNotifications = ref([]);
const unreadWithdrawCount = ref(0);
const withdrawModal = ref(false);



// Fetch withdrawal notifications
const fetchWithdrawNotifications = async () => {
  try {
    const { data, error } = await useFetch("https://api.bajiraj.cloud/withdrawals/admin/withdraw_notifications?unread=true", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!error.value && data.value) {
      withdrawNotifications.value = data.value.notifications;
      unreadWithdrawCount.value = withdrawNotifications.value.filter(n => !n.read).length;
    }
  } catch (err) {
    console.error("Failed to fetch withdrawal notifications:", err);
  }
};

// Mark single notification as read
const markWithdrawAsRead = async (notif) => {
  try {
    await useFetch(`https://api.bajiraj.cloud/withdrawals/admin/withdraw_notifications/${notif.id}/read`, {
      method: "PATCH",
    });

    notif.read = true;
    unreadWithdrawCount.value = withdrawNotifications.value.filter(n => !n.read).length;
  } catch (err) {
    console.error("Failed to mark withdrawal notification as read:", err);
  }
};

// Mark all as read
const markAllWithdrawRead = async () => {
  try {
    for (const notif of withdrawNotifications.value.filter(n => !n.read)) {
      await useFetch(`https://api.bajiraj.cloud/withdrawals/admin/withdraw_notifications/${notif.id}/read`, {
        method: "PATCH",
      });
      notif.read = true;
    }
    unreadWithdrawCount.value = 0;
  } catch (err) {
    console.error("Failed to mark all withdrawal notifications as read:", err);
  }
};

onMounted(() => {
  fetchWithdrawNotifications();

  setInterval(() => {
    fetchWithdrawNotifications();
  }, 10000); // auto-refresh every 15s
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

.notifications-card {
  width: 450px;
  max-height: 450px;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.notifications-list {
  padding: 0;
}

.notification-item {
  cursor: pointer;
  transition: background 0.2s ease;
  padding-top: 12px;
  padding-bottom: 12px;
}

.notification-item:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.notification-unread {
  background-color: rgba(0, 123, 255, 0.1);
  font-weight: 600;
  border-left: 4px solid #1976d2;
}



</style>
