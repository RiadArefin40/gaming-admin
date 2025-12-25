<template>
  <div id="roleList">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col class="m-2">
          <div style="display: flex">
            <h3>{{$t('regions')}}</h3>
            <v-spacer />
            <v-btn @click="handleCreate" class="!bg-[#58c6e2] text-white" nuxt>
              {{$t('create')}}
            </v-btn>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card class="pt-2 pb-4">
            <v-divider />
            <v-card-text class="pa-0">
              <v-data-table-server
                :items-per-page-options="[10,25,50]"
                v-model:items-per-page="itemsPerPage"
                :items-length="total"
                :items="roles"
                item-value="name"
                :headers="headers"
                :search="searching"
                :loading="loading"
                @update:options="getRegionsByPagination"
              >
                <template v-slot:top>
                  <v-text-field
                    class="pl-3"
                    v-model="searching"
                    prepend-inner-icon="mdi-magnify"
                    placeholder="Type something ..."
                    append-inner-icon="mdi-filter-variant"
                    hide-details
                    variant="underlined"
                  ></v-text-field>
                </template>
                <template v-slot:tbody>
                  <v-dialog v-model="dialogDelete" max-width="500px">
                    <v-card class="text-center !p-8">
                      <v-card-title class="text-h5"
                        >{{$t('sureRemove')}}</v-card-title
                      >
                      <v-card-text
                        >{{$t('ableRevert')}}</v-card-text
                      >
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          @click="dialogDelete = false"
                          class="text-white bg-green"
                          >{{$t('cancel')}}</v-btn
                        >
                        <v-btn
                          @click="deleteRoleData()"
                          class="text-white bg-red"
                          >{{$t('confirm')}}</v-btn
                        >
                        <v-spacer></v-spacer>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </template>
                <template v-slot:item.action="{ item }">
                  <nuxt-link >
                    <v-icon @click="handleEdit(item.id)" class="me-4"> mdi-pencil </v-icon></nuxt-link
                  >

                  <v-icon class="text-red" @click="deleteItem(item.id)">
                    mdi-delete
                  </v-icon>
                </template>
              </v-data-table-server>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <VSonner position="top-center" />
    </v-container>
  </div>
</template>
<script setup lang="ts">
import { VSonner, toast } from "vuetify-sonner";
import "vuetify-sonner/style.css";
const selected = ref([]);
const total = ref(0);
const dialogDelete = ref(false);
const deleteRoleId = ref();
const headers = [
  { title: "Id", value: "id", sortable: false },
  { title: "Name", value: "name", sortable: false},
  { title: "Arabic Name", value: "arabicName", sortable: false },
  { title: "Action", value: "action", key: "action", sortable: false },
];
const itemsPerPage = ref();
const page = ref();
const loading = ref(true);
const searching = ref("");
const roles = ref([]);
const baseUrl = useUrls();
const url = baseUrl.apiBaseUrl;
const useAuthData = useAuth();
const token = useAuthData?.token?.value;
const router = useRouter();
const { t } = useI18n();

const { doesUserHaveAnyPermissions } = await permission();
function handleCreate() {
  if (doesUserHaveAnyPermissions('create region')) {
    // If permission is granted, navigate to the specified route
    router.push("/regions/entry");
  } else {
    // If permission is not granted, show a notification
    toast.success(t("permissionDenied"));
  }
}
function handleEdit(id) {
  if (doesUserHaveAnyPermissions('update region')) {
    router.push(`/regions/entry?id=${id}`);
  } else {
    toast.success(t("permissionDenied"));
  }
}

async function getRegionsByPagination({ page, itemsPerPage, sortBy }) {
  loadTableData({ page, itemsPerPage, sortBy });
}
async function loadTableData({ page, itemsPerPage, sortBy }) {
  let paginationurl = `page=${page}&per_page=${itemsPerPage}`;
  if (searching) {
    paginationurl += `&query=${searching.value}`;
  }
  if (sortBy.length) {
    const direction = "asc";
    paginationurl += `&direction=${direction}&sortBy=${sortBy[0].key}`;
  }

  try {
    loading.value = true;
    const role = await useFetch(`${url}/admin/regions?${paginationurl}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    roles.value = role?.data?.value?.data;
    total.value = role?.data?.value?.meta?.total;
    loading.value = false;
  } catch (error) {
    console.error("Login failed. Here's the raw error:", error);
  }
}
async function deleteItem(id) {
  dialogDelete.value = true;
  deleteRoleId.value = id;
}
async function deleteRoleData() {
  if (doesUserHaveAnyPermissions('delete region')) {
    try {
      const role = await useFetch(
        `${url}/admin/regions/${deleteRoleId.value}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dialogDelete.value = false;
      roles.value = roles.value.filter((obj) => obj.id !== deleteRoleId.value);
      toast.success(t("deletedSuccessfully"));
    } catch (error) {
      console.log(error);
    }
  } else {
    toast.success(t("permissionDenied"));
  }
}

onMounted(async () => {});
</script>
