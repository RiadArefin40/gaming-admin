<template>
  <div id="roleList">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col class="m-2">
          <div style="display: flex">
            <h3>{{ $t("Settings") }}</h3>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card class="pt-2 pb-4">
            <v-divider />
            <v-card-text class="pa-0">
              <v-table>
                <thead>
                  <tr>
                    <th class="text-left">Key</th>
                    <th class="text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Cache</td>
                    <td class="space-x-2">
                      <v-btn
                        color="primary"
                        @click="showCacheClearConfirDilalog"
                      >
                        Clear Cache
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <VSonner position="top-center" />
    </v-container>

    <v-dialog v-model="openCacheClearConfirmDialog" max-width="500px">
      <v-card class="text-center !p-8">
        <v-card-title class="text-h5"
          >Are you sure you want to clear the cache?</v-card-title
        >
        <v-card-text>You won't be able to revert this!</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="openCacheClearConfirmDialog = false"
            class="text-white bg-green"
            >Cancel</v-btn
          >
          <v-btn
            @click="clearServerCache()"
            :disabled="cacheClearBtnLoading"
            :loading="cacheClearBtnLoading"
            class="text-white bg-red"
            >OK</v-btn
          >
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { VSonner, toast } from "vuetify-sonner";
import "vuetify-sonner/style.css";

const openCacheClearConfirmDialog = ref(false);
const cacheClearBtnLoading = ref(false);
const baseUrl = useUrls();
const url = baseUrl.apiBaseUrl;
const useAuthData = useAuth();
const token = useAuthData?.token?.value;

const showCacheClearConfirDilalog = () => {
  openCacheClearConfirmDialog.value = true;
};

const clearServerCache = async () => {
  cacheClearBtnLoading.value = true;
  try {
    const response = await useFetch(`${url}/admin/cache-clear/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.value.success) {
      toast.success(response.data.value.message);
    }
  } catch (error) {
    console.error("Login failed. Here's the raw error:", error);
  } finally {
    openCacheClearConfirmDialog.value = false;
    cacheClearBtnLoading.value = false;
  }
};
</script>
