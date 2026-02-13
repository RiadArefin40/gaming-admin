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
          density="comfortable"
        />
      </v-col>
    </v-row>

    <v-row>
      <!-- Chat List -->
      <v-col cols="12" md="4">
        <v-card class="rounded-2xl elevation-4" style="height: 520px; overflow-y: auto;">
          <v-list>
            <v-list-item
              v-for="chat in filteredChats"
              :key="chat.id"
              @click="selectChat(chat)"
              :class="{ 'bg-yellow-100': selectedChat?.id === chat.id }"
              class="cursor-pointer"
            >
              <v-list-item-content>
                <v-list-item-title>
                  <span class="font-bold text-xl">{{ chat.name }}</span>
                </v-list-item-title>
                <v-list-item-subtitle>
                  Messages: {{ chat.user_messages || 0 }} |
                  Status: {{ chat.status }} |
                  <span v-if="chat.unread_count > 0">
                    Unread: <strong class="text-red-700 font-bold">{{ chat.unread_count }}</strong>
                  </span>
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-icon>
                <v-icon :color="onlineUsers.includes(Number(chat.user_id)) ? 'green' : 'red'">
                  mdi-circle
                </v-icon>
                {{ onlineUsers.includes(Number(chat.user_id)) ? 'Online' : 'Offline' }}
              </v-list-item-icon>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Chat Window -->
      <v-col cols="12" md="8">
        <v-card class="rounded-2xl elevation-4" style="height: 520px; display: flex; flex-direction: column;">
          <!-- Header -->
          <v-card-title class="bg-yellow-400 text-black rounded-t-2xl">
            💬 Chat with User {{ selectedChat?.user_id || "" }}
            <v-btn small class="ml-auto" color="green" @click="markRead">Mark Read</v-btn>
          </v-card-title>

          <!-- Messages -->
          <v-card-text class="flex-1 overflow-y-auto px-4 py-2">
            <div v-for="msg in messages" :key="msg.id" class="mb-2">
              <div :class="msg.sender === 'support' ? 'text-right' : 'text-left'">
                <v-chip :color="msg.sender === 'support' ? 'orange lighten-2' : ''" class="ma-1">
                  <template v-if="msg.type === 'image'">
                    <img :src="msg.message" class="max-w-xs rounded" />
                  </template>
                  <template v-else>
                    {{ msg.message }}
                  </template>
                  <span class="text-xs ml-2">{{ formatTime(msg.created_at) }}</span>
                </v-chip>
              </div>
            </div>
            <div ref="chatEnd"></div>
          </v-card-text>

          <!-- Input -->
          <v-card-actions class="border-t border-gray-300 px-3 py-2">
            <v-text-field
              v-model="input"
              placeholder="Type a message..."
              dense
              outlined
              hide-details
              class="flex-1"
              @keydown.enter="sendMessage"
            />
            <!-- Image Upload -->
            <input type="file" accept="image/*" @change="onFileChange" ref="fileInput" style="display:none" />
            <v-btn color="blue darken-2" @click="$refs.fileInput.click()">📎</v-btn>
            <v-btn color="yellow darken-2" @click="sendMessage">Send</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { io } from "socket.io-client";
import axios from "axios";

// ---------------- STATE ----------------
const chats = ref([]);
const selectedChat = ref(null);
const messages = ref([]);
const input = ref("");
const search = ref("");
const chatEnd = ref(null);
const onlineUsers = ref([]);
const unreadCounts = useState('unreadCounts', () => 0);
// ---------------- SOCKET ----------------
const socket = io("https://api.spcwin.info", { transports: ["websocket"], path: "/socket.io" });

socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
  socket.emit("admin_online");
});

// ---------------- RECEIVE TEXT ----------------
socket.on("receive_message", (msg) => handleIncoming(msg));

// ---------------- RECEIVE IMAGE ----------------
socket.on("receive_image", (msg) => {
  const imageMsg = {
    id: msg.id,
    chatId: msg.chatId,
    sender: msg.sender,
    message: msg.image,
    type: "image",
    created_at: new Date().toISOString()
  };
  if (selectedChat.value?.id === msg.chatId) {
    messages.value.push(imageMsg);
    scrollToEnd();
  }
});
socket.on("unread_count", ({ chatId, count }) => {
  unreadCounts.value = count || 0;
  const chatIndex = chats.value.findIndex(c => c.id === chatId);
  if (chatIndex !== -1) {
    chats.value[chatIndex] = {
      ...chats.value[chatIndex],
      unread_count: count
    };
  }
});

// ---------------- HANDLE INCOMING ----------------
const handleIncoming = (msg) => {
  const chatIndex = chats.value.findIndex(c => c.id === msg.chatId);
  if (selectedChat.value?.id === msg.chatId) {
    if (!messages.value.find(m => m.id === msg.id)) {
      messages.value.push(msg);
      scrollToEnd();
    }
  } else if (chatIndex !== -1) {
    chats.value[chatIndex].unread_count = (chats.value[chatIndex].unread_count || 0) + 1;
  }
};

// ---------------- SEND TEXT ----------------
const sendMessage = async () => {
  if (!input.value.trim() || !selectedChat.value) return;
  const msgText = input.value.trim();
  input.value = "";

  try {
    await axios.post(`https://api.spcwin.info/admin/chats/${selectedChat.value.id}/message`, { message: msgText });
  } catch (err) {
    console.error("Send message failed:", err);
  }
};

// ---------------- SEND IMAGE ----------------
const onFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file || !selectedChat.value) return;

  const reader = new FileReader();
  reader.onload = () => {
    const base64Data = reader.result;
    const tempMsg = {
      id: Date.now(),
      chatId: selectedChat.value.id,
      sender: "support",
      message: base64Data,
      type: "image",
      created_at: new Date()
    };
    messages.value.push(tempMsg);
    scrollToEnd();

    socket.emit("send_image", {
      chatId: selectedChat.value.id,
      image: base64Data,
      sender: "support",
      id: tempMsg.id
    });
  };
  reader.readAsDataURL(file);
  event.target.value = "";
};

// ---------------- SCROLL ----------------
const scrollToEnd = async () => {
  await nextTick();
  chatEnd.value?.scrollIntoView({ behavior: "smooth" });
};

// ---------------- FETCH CHATS ----------------
const fetchChats = async () => {
  try {
    const { data } = await axios.get("https://api.spcwin.info/admin/chats");
    chats.value = data;
  } catch (err) {
    console.error("Failed to fetch chats:", err);
  }
};

const filteredChats = computed(() =>
  chats.value.filter(chat => chat.user_id?.toString().includes(search.value.toLowerCase()))
);

// ---------------- SELECT CHAT ----------------
const previousChatId = ref(null);
const selectChat = async (chat) => {
  if (!chat) return;

  if (previousChatId.value) socket.emit("leave_chat", { chatId: previousChatId.value });
  selectedChat.value = chat;
  previousChatId.value = chat.id;

  socket.emit("join_chat", { chatId: chat.id });

  try {
    const { data } = await axios.get(`https://api.spcwin.info/admin/chats/${chat.id}/messages`);
    messages.value = data;
    scrollToEnd();
  } catch (err) {
    console.error("Failed to fetch messages:", err);
  }
};

// ---------------- MARK READ ----------------
const markRead = async () => {
   unreadCounts.value =  0;
  if (!selectedChat.value) return;
  try {
    await axios.post(`https://api.spcwin.info/admin/chats/${selectedChat.value.id}/read`);
    selectedChat.value.unread_count = 0;
    fetchChats();
  } catch (err) {
    console.error("Mark read failed:", err);
  }
};

// ---------------- ONLINE USERS ----------------
socket.on("online_users", (users) => {
  onlineUsers.value = users;
  console.log("Online users:", users);
});

// ---------------- TIME FORMAT ----------------
const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

onMounted(() => fetchChats());
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.bg-yellow-100 { background-color: #fff9c4 !important; }
</style>