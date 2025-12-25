<template>
  <v-card  class="mt-14">
 <v-card-text>
  <v-skeleton-loader v-if = "!taxData" type="card"></v-skeleton-loader>
        <v-table v-else density="compact">
                <thead>
                  <tr>
                    <th class="text-start">
                     Name
                    </th>
                    <th class="text-start">
                     Value
                    </th>
                    <th class="text-start">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{{ taxData?.key }}</td>
                    <td>{{  taxData?.value}}</td>
                    <td>
                      <nuxt-link @click="handleEdit()">
                      <v-icon class="me-4 cursor-pointer"> mdi-pencil </v-icon></nuxt-link
                  >
                    </td>
                  </tr>
                </tbody>
          </v-table>
  </v-card-text>            


  </v-card>

</template>
<script setup>


const taxData = ref();
const loading = ref(false);
const baseUrl = useUrls();
const url = baseUrl.apiBaseUrl;
const useAuthData = useAuth();
const token = useAuthData?.token?.value;
const router = useRouter();
// const {
//   hasDriverUpdateManagementPermission,
// } = await permission();
const { doesUserHaveAnyPermissions } = await permission();



loadTableData();

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
    taxData.value = data?.value
  } catch (error) {
    console.error("Login failed. Here's the raw error:", error);
  }
}
function handleEdit(id) {
  if (doesUserHaveAnyPermissions('update driver')) {
    router.push(`tax-management/entry`);
  } else {
    toast.success(t("permissionDenied"));
  }
}
</script>