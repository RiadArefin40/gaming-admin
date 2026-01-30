<template>
  <v-container fluid class="pa-6">

    <!-- ---------------- HEADER ---------------- -->
    <v-row class="mb-6" align="center">
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="categorySearch"
          placeholder="Search categories..."
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          hide-details
          density="comfortable"
        />
      </v-col>
      <v-col class="d-flex justify-end">
        <v-btn size="32" color="gradient-cyan" @click="dialogCreateCategory = true">
          New Category
        </v-btn>
      </v-col>
    </v-row>

    <!-- ---------------- CATEGORY TABLE ---------------- -->
    <v-card class="rounded-xl elevation-3 modern-table mb-8">
      <v-skeleton-loader v-if="loadingCategories" type="table" />
      <v-data-table
        v-else
        :headers="categoryHeaders"
        :items="filteredCategories"
        dense
      >
        <template #item.image_url="{ item }">
          <v-img height="35px" width="50px" :src="API_BASE + item.image_url" />
        </template>

        <template #item.is_active="{ item }">
          <v-chip :color="item.is_active ? 'green lighten-2' : 'red lighten-2'" text-color="white">
            {{ item.is_active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template #item.action="{ item }">
          <v-menu offset-y>
            <template #activator="{ props }">
              <v-btn size="32" v-bind="props" icon>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="editCategory(item)">
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>
              <v-list-item @click="deleteCategory(item)">
                <v-list-item-title class="text-red">Delete</v-list-item-title>
              </v-list-item>
              <v-list-item @click="selectCategory(item)">
                <v-list-item-title>Manage Games</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- ---------------- GAMES SECTION ---------------- -->
    <v-row v-if="selectedCategory">
      <v-col cols="12" class="d-flex justify-space-between mb-4">
        <div class="text-h6 font-bold">Games in "{{ selectedCategory.title }}"</div>
        <v-btn size="32" color="gradient-cyan" @click="dialogCreateGame = true">Add Game</v-btn>
      </v-col>
   
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="gameSearch"
          placeholder="Search Games..."
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          hide-details
          density="comfortable"
        />
      </v-col>

      <v-col cols="12">
<v-data-table
  :headers="gameHeaders"
  :items="parentGames"
  item-key="id"
  dense
>
  <template #item="{ item }">
    <tr>
      <td>{{ item.uid }}</td>
      <td>{{ item.title }}</td>
      <td> <v-img height="50px" width="60px" :src="API_BASE + item.image_url" cover /></td>
      <td>
        <v-chip :color="item.is_active ? 'green lighten-2' : 'red lighten-2'" text-color="white">
          {{ item.is_active ? 'Active' : 'Inactive' }}
        </v-chip>
      </td>
      <td>{{ item.position }}</td>
      <td>
        <v-chip :color="item.is_provider ? 'blue lighten-2' : 'grey lighten-2'" text-color="white">
          {{ item.is_provider ? 'Provider' : 'Individual' }}
        </v-chip>
      </td>
      <td>
                    <v-btn size="32"
    icon
    small
    v-if="item.is_provider"
    @click="addChildGame(item)"
  >
    <v-icon color="primary">mdi-plus</v-icon>
  </v-btn>
        <v-btn size="32"  icon small @click="editGame(item)"><v-icon>mdi-pencil</v-icon></v-btn>
        <v-btn size="32" icon small @click="deleteGame(item)"><v-icon color="red">mdi-delete</v-icon></v-btn>
      </td>
      <td>
        <v-btn size="32" icon small v-if="item.is_provider" @click="toggleExpand(item.id)">
          <v-icon>{{ expandedGames.includes(item.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </td>
    </tr>

    <!-- Nested child games -->
    <tr v-if="item.is_provider && expandedGames.includes(item.id)">
      <td colspan="7">
        <v-data-table
          :headers="childGameHeaders"
          :items="childGames(item.id)"
          hide-default-footer
          dense
        >
          <template #item.uid="{ item }">{{ item.uid }}</template>
          <template #item.title="{ item }">{{ item.title }}</template>

     <template #item.image="{ item }"><v-img height="50px" width="60px" :src="API_BASE + item.image_url" cover /></template>

          <template #item.is_active="{ item }">
            <v-chip :color="item.is_active ? 'green lighten-2' : 'red lighten-2'" text-color="white">
              {{ item.is_active ? 'Active' : 'Inactive' }}
            </v-chip>
          </template>
          <template #item.position="{ item }">{{ item.position }}</template>
      
          <template #item.action="{ item }">
            <v-btn size="32" icon small @click="editGame(item)"><v-icon>mdi-pencil</v-icon></v-btn>

            <v-btn size="32" icon small @click="deleteGame(item)"><v-icon color="red">mdi-delete</v-icon></v-btn>
          </template>
        </v-data-table>
      </td>
    </tr>
  </template>
</v-data-table>

      </v-col>
    </v-row>

    <!-- ---------------- CREATE / EDIT CATEGORY DIALOG ---------------- -->
    <v-dialog v-model="dialogCreateCategory" max-width="500">
      <v-card class="pa-6 rounded-2xl elevation-5">
        <v-card-title class="text-h6 font-bold">{{ editingCategory ? 'Edit' : 'Create' }} Category</v-card-title>
        <v-card-text class="d-flex flex-column gap-4">
          <v-text-field label="Title" v-model="categoryForm.title" outlined />
          <v-file-input label="Image" accept="image/*" v-model="categoryForm.image" outlined />
          <v-text-field label="Position" v-model.number="categoryForm.position" type="number" outlined />
          <v-switch label="Active" v-model="categoryForm.is_active" />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn  variant="tonal" @click="closeCategoryDialog">Cancel</v-btn>
          <v-btn color="gradient-cyan" @click="saveCategory">{{ editingCategory ? 'Save' : 'Create' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ---------------- CREATE / EDIT GAME DIALOG ---------------- -->
    <v-dialog v-model="dialogCreateGame" max-width="500">
      <v-card class="pa-6 rounded-2xl elevation-5">
        <v-card-title class="text-h6 font-bold">{{ editingGame ? 'Edit' : 'Add' }} Game</v-card-title>
        <v-card-text class="d-flex flex-column gap-4">
          <v-text-field label="UID" v-model="gameForm.uid" outlined />
          <v-text-field label="Title" v-model="gameForm.title" outlined />
          <v-file-input label="Image" accept="image/*" v-model="gameForm.image" outlined />
          <v-text-field label="Position" v-model.number="gameForm.position" type="number" outlined />
          <v-switch label="Active" v-model="gameForm.is_active" />
         <v-switch
  label="Provider"
  v-model="gameForm.is_provider"
  :disabled="!!gameForm.parent_id"
/>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="closeGameDialog">Cancel</v-btn>
          <v-btn  color="gradient-cyan" @click="saveGame">{{ editingGame ? 'Save' : 'Add' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_BASE = 'https://api.spcwin.info' // adjust your API

// ---------------- STATES ----------------
const categories = ref([])
const games = ref([])
const selectedCategory = ref(null)

const categorySearch = ref('')
const gameSearch = ref('')
const dialogCreateCategory = ref(false)
const dialogCreateGame = ref(false)

const editingCategory = ref(false)
const editingGame = ref(false)

// ---------------- FORMS ----------------
const categoryForm = ref({ title: '', image: null, position: 0, is_active: true })
const gameForm = ref({
  uid: '',
  title: '',
  image: null,
  position: 0,
  is_active: true,
  is_provider: false,
  parent_id: null,
})

// ---------------- TABLE HEADERS ----------------
const categoryHeaders = [
  { title: 'Title', value: 'title' },
  { title: 'Image', value: 'image_url' },
  { title: 'Status', value: 'is_active' },
  { title: 'Position', value: 'position' },
  { title: 'Action', value: 'action' },
]

const gameHeaders = [
  { title: 'UID', value: 'uid' },
  { title: 'Title', value: 'title' },
  { title: 'Image', value: 'image_url' },
  { title: 'Status', value: 'is_active' },
  { title: 'Position', value: 'position' },
  { title: 'Provider', value: 'is_provider' },
  { title: 'Action', value: 'action' },
  { title: 'Expand', value: 'expand' },
]

const childGameHeaders = [
  { title: 'UID', value: 'uid' },
  { title: 'Title', value: 'title' },
   { title: 'Image', value: 'image' },
  { title: 'Status', value: 'is_active' },
  { title: 'Position', value: 'position' },
    { title: 'Provider', value: 'is_provider' },
  { title: 'Action', value: 'action' },
   { title: 'Expand', value: 'expand' },
]

// ---------------- COMPUTED ----------------
const filteredCategories = computed(() => {
  if (!categorySearch.value) return categories.value
  return categories.value.filter(cat => cat.title.toLowerCase().includes(categorySearch.value.toLowerCase()))
})

const filteredGames = computed(() => {
  if (!gameSearch.value) return parentGames.value
  return parentGames.value.filter(cat => cat.title.toLowerCase().includes(gameSearch.value.toLowerCase()))
})

// Only parent games (providers + individual non-child)
const parentGames = computed(() =>
  games.value.filter(g => !g.parent_id)
)

// Expanded IDs
const expandedGames = ref([])

function toggleExpand(gameId) {
  if (expandedGames.value.includes(gameId)) {
    expandedGames.value = expandedGames.value.filter(id => id !== gameId)
  } else {
    expandedGames.value.push(gameId)
  }
}

// Return child games for a provider
function childGames(parentId) {
  return games.value.filter(g => g.parent_id === parentId)
}

// ---------------- FETCH ----------------
async function fetchCategories() {
  const res = await fetch(`${API_BASE}/users/game-categories`)
  categories.value = await res.json()
}

async function fetchGames(categoryId) {
  const res = await fetch(`${API_BASE}/users/game-categories/${categoryId}/games`)
  games.value = await res.json()
}

// ---------------- CATEGORY METHODS ----------------
function selectCategory(cat) {
  selectedCategory.value = cat
  fetchGames(cat.id)
}

function editCategory(cat) {
  editingCategory.value = true
  dialogCreateCategory.value = true
  categoryForm.value = { ...cat, image: null }
}

function closeCategoryDialog() {
  dialogCreateCategory.value = false
  editingCategory.value = false
  categoryForm.value = { title: '', image: null, position: 0, is_active: true }
}

async function saveCategory() {
  const fd = new FormData()
  fd.append('title', categoryForm.value.title)
  fd.append('position', categoryForm.value.position)
  fd.append('is_active', categoryForm.value.is_active)
  if (categoryForm.value.image) fd.append('image', categoryForm.value.image)

  if (editingCategory.value) {
    await fetch(`${API_BASE}/users/game-categories/${categoryForm.value.id}`, { method: 'PUT', body: fd })
  } else {
    await fetch(`${API_BASE}/users/game-categories`, { method: 'POST', body: fd })
  }
  closeCategoryDialog()
  fetchCategories()
}

// ---------------- GAME METHODS ----------------
function editGame(game) {
  editingGame.value = true
  dialogCreateGame.value = true
  gameForm.value = { ...game, image: null }
}

function closeGameDialog() {
  dialogCreateGame.value = false
  editingGame.value = false
  gameForm.value = { uid: '', title: '', image: null, position: 0, is_active: true, is_provider: false, parent_id: null }
}

async function saveGame() {
  const fd = new FormData()
  fd.append('uid', gameForm.value.uid)
  fd.append('title', gameForm.value.title)
  fd.append('position', gameForm.value.position)
  fd.append('is_active', gameForm.value.is_active)
  fd.append('is_provider', gameForm.value.is_provider)
  fd.append('category_id', selectedCategory.value.id)
  if (gameForm.value.image) fd.append('image', gameForm.value.image)
  if (gameForm.value.parent_id) fd.append('parent_id', gameForm.value.parent_id)

  if (editingGame.value) {
    await fetch(`${API_BASE}/users/games/${gameForm.value.id}`, { method: 'PUT', body: fd })
  } else {
    await fetch(`${API_BASE}/users/games`, { method: 'POST', body: fd })
  }

  closeGameDialog()
  fetchGames(selectedCategory.value.id)
}

// ---------------- DELETE METHODS ----------------
async function deleteCategory(cat) {
  if (!confirm(`Delete category "${cat.title}"?`)) return
  await fetch(`${API_BASE}/users/game-categories/${cat.id}`, { method: 'DELETE' })
  fetchCategories()
}

async function deleteGame(game) {
  if (!confirm(`Delete game "${game.title}"?`)) return
  await fetch(`${API_BASE}/users/games/${game.id}`, { method: 'DELETE' })
  fetchGames(selectedCategory.value.id)
}
function addChildGame(parentGame) {
  editingGame.value = false
  dialogCreateGame.value = true

  gameForm.value = {
    uid: '',
    title: '',
    image: null,
    position: 0,
    is_active: true,
    is_provider: false, // child is NEVER provider
    parent_id: parentGame.id, // 👈 THIS IS THE KEY
  }
}


// ---------------- ON MOUNT ----------------
onMounted(() => {
  fetchCategories()
})
</script>
