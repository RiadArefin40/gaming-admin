<template>
  <v-container fluid class="pa-6">
    <!-- Search -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          placeholder="Search user..."
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          hide-details
        />
      </v-col>
    </v-row>

    <v-row>
      <!-- LEFT: CHAT LIST -->
      <v-col cols="12" md="4">
        <v-card height="520" class="overflow-y-auto">
          <v-list>
            <v-list-item
              v-for="chat in filteredChats"
              :key="chat.id"
              @click="selectChat(chat)"
              :class="{ 'bg-grey-lighten-3': selectedChat?.id === chat.id }"
              class="cursor-pointer"
            >
              <v-list-item-title>
                {{ chat.name }}
              </v-list-item-title>

              <v-list-item-subtitle>
                Unread:
                <span v-if="chat.unread_count > 0" class="text-red font-weight-bold">
                  {{ chat.unread_count }}
                </span>
                <span v-else>0</span>
              </v-list-item-subtitle>

              <template #append>
                <v-icon
                  size="12"
                  :color="onlineUsers.includes(Number(chat.user_id)) ? 'green' : 'red'"
                >
                  mdi-circle
                </v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- RIGHT: CHAT WINDOW -->
      <v-col cols="12" md="8">
        <v-card height="520" class="d-flex flex-column">
          <!-- Header -->
          <v-card-title class="bg-yellow-darken-2 text-white">
            Chat with {{ selectedChat?.name || "" }}
            <v-spacer />
            <v-btn size="small" color="green" @click="markRead">
              Mark Read
            </v-btn>
          </v-card-title>

          <!-- Messages -->
          <v-card-text class="flex-grow-1 overflow-y-auto">
            <div v-for="msg in messages" :key="msg.id" class="mb-2">
              <div :class="msg.sender === 'support' ? 'text-right' : 'text-left'">
                <v-chip
                  :color="msg.sender === 'support' ? 'orange' : 'blue'"
                  class="ma-1"
                >
                  <template v-if="msg.type === 'image'">
                    <img :src="msg.message" style="max-width:200px;" />
                  </template>
                  <template v-else>
                    {{ msg.message }}
                  </template>
                </v-chip>
                <div class="text-caption">
                  {{ formatTime(msg.created_at) }}
                </div>
              </div>
            </div>
            <div ref="chatEnd"></div>
          </v-card-text>

          <!-- Input -->
          <v-card-actions>
            <v-text-field
              v-model="input"
              placeholder="Type message..."
              hide-details
              @keydown.enter="sendMessage"
            />

            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              hidden
              @change="onFileChange"
            />

            <v-btn icon="mdi-paperclip" @click="fileInput.click()" />
            <v-btn color="yellow-darken-2" @click="sendMessage">
              Send
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue"
import { io } from "socket.io-client"
import axios from "axios"

/* ---------------- STATE ---------------- */

const chats = ref([])
const selectedChat = ref(null)
const messages = ref([])
const input = ref("")
const search = ref("")
const chatEnd = ref(null)
const fileInput = ref(null)
const onlineUsers = ref([])
const previousChatId = ref(null)

/* ---------------- SOCKET ---------------- */

const socket = io("https://api.spcwin.info", {
  transports: ["websocket"],
  path: "/socket.io"
})

socket.on("connect", () => {
  console.log("Socket connected:", socket.id)
  socket.emit("admin_online")
})

socket.on("online_users", users => {
  onlineUsers.value = users
})

socket.on("receive_message", msg => {
  if (selectedChat.value?.id === msg.chatId) {
    if (!messages.value.find(m => m.id === msg.id)) {
      messages.value.push(msg)
      scrollToEnd()
    }
  } else {
    const chat = chats.value.find(c => c.id === msg.chatId)
    if (chat) chat.unread_count++
  }
})

socket.on("receive_image", msg => {
  const imageMsg = {
    id: msg.id,
    chatId: msg.chatId,
    sender: msg.sender,
    message: msg.image,
    type: "image",
    created_at: new Date().toISOString()
  }

  if (selectedChat.value?.id === msg.chatId) {
    messages.value.push(imageMsg)
    scrollToEnd()
  }
})

/* ---------------- SEND TEXT ---------------- */

const sendMessage = async () => {
  if (!input.value.trim() || !selectedChat.value) return

  const text = input.value.trim()
  input.value = ""

  const tempMsg = {
    id: Date.now(),
    chatId: selectedChat.value.id,
    sender: "support",
    message: text,
    type: "text",
    created_at: new Date().toISOString()
  }

  messages.value.push(tempMsg)
  scrollToEnd()

  try {
    await axios.post(
      `https://api.spcwin.info/admin/chats/${selectedChat.value.id}/message`,
      { message: text }
    )

    socket.emit("send_message", tempMsg)
  } catch (err) {
    console.error(err)
  }
}

/* ---------------- SEND IMAGE ---------------- */

const onFileChange = event => {
  const file = event.target.files[0]
  if (!file || !selectedChat.value) return

  const reader = new FileReader()
  reader.onload = () => {
    const base64 = reader.result

    const imgMsg = {
      id: Date.now(),
      chatId: selectedChat.value.id,
      sender: "support",
      image: base64,
      type: "image",
      created_at: new Date().toISOString()
    }

    messages.value.push({
      ...imgMsg,
      message: base64
    })

    scrollToEnd()

    socket.emit("send_image", imgMsg)
  }

  reader.readAsDataURL(file)
  event.target.value = ""
}

/* ---------------- SELECT CHAT ---------------- */

const selectChat = async chat => {
  if (!chat) return

  if (previousChatId.value) {
    socket.emit("leave_chat", { chatId: previousChatId.value })
  }

  selectedChat.value = chat
  previousChatId.value = chat.id

  socket.emit("join_chat", { chatId: chat.id })

  try {
    const { data } = await axios.get(
      `https://api.spcwin.info/admin/chats/${chat.id}/messages`
    )
    messages.value = data
    scrollToEnd()
  } catch (err) {
    console.error(err)
  }
}

/* ---------------- MARK READ ---------------- */

const markRead = async () => {
  if (!selectedChat.value) return

  try {
    await axios.post(
      `https://api.spcwin.info/admin/chats/${selectedChat.value.id}/read`
    )

    selectedChat.value.unread_count = 0
  } catch (err) {
    console.error(err)
  }
}

/* ---------------- FETCH CHATS ---------------- */

const fetchChats = async () => {
  const { data } = await axios.get(
    "https://api.spcwin.info/admin/chats"
  )
  chats.value = data
}

const filteredChats = computed(() =>
  chats.value.filter(chat =>
    chat.name?.toLowerCase().includes(search.value.toLowerCase())
  )
)

/* ---------------- HELPERS ---------------- */

const scrollToEnd = async () => {
  await nextTick()
  chatEnd.value?.scrollIntoView({ behavior: "smooth" })
}

const formatTime = ts =>
  new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })

/* ---------------- LIFECYCLE ---------------- */

onMounted(fetchChats)

onUnmounted(() => {
  socket.disconnect()
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>