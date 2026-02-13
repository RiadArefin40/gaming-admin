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
      <!-- Chat list -->
      <v-col cols="12" md="4">
        <v-card class="rounded-2xl elevation-4" style="height: 520px; overflow-y: auto;">
          <v-list>
            <v-list-item
              v-for="chat in filteredChats"
              :key="chat.id"
              @click="selectChat(chat)"
              :class="{'bg-yellow-100': selectedChat?.id === chat.id}"
              class="cursor-pointer"
            >
              <v-list-item-content>
                <v-list-item-title ><span class="font-bold text-xl">{{ chat.name }}</span> </v-list-item-title>
                <v-list-item-subtitle>
                  Messages: {{ chat.user_messages || 0 }} |
                  Status: {{ chat.status }} |
                  Unread: <strong>{{ chat.unread_count }}</strong>
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

      <!-- Chat window -->
      <v-col cols="12" md="8">
        <v-card class="rounded-2xl elevation-4" style="height: 520px; display: flex; flex-direction: column;">
          <!-- Header -->
          <v-card-title class="bg-yellow-400 text-black rounded-t-2xl">
            💬 Chat with User {{ selectedChat?.user_id || "" }}
            <v-btn small class="ml-auto" color="green" @click="markRead">
              Mark Read
            </v-btn>
          </v-card-title>

          <!-- Messages -->
          <v-card-text class="flex-1 overflow-y-auto px-4 py-2">
            <div v-for="msg in messages" :key="msg.id" class="mb-2">
              <div :class="msg.sender === 'support' ? 'text-right' : 'text-left'">
                <v-chip
                  :color="msg.sender == 'support' ? 'orange' : ''"
                  class="ma-1"
                >
                  {{ msg.message }}
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
              @keydown.enter="sendMessage"
              class="flex-1"
            />
            <v-btn color="yellow darken-2" @click="sendMessage">Send</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import { io } from "socket.io-client";
import axios from "axios";

// ---------------- STATE ----------------
const chats = ref([]);
const selectedChat = ref(null);
const messages = ref([]);
const input = ref("");
const search = ref("");
const chatEnd = ref(null);
// store online user_ids as a Set

// ---------------- SOCKET ----------------
const socket = io("https://api.spcwin.info", {
  transports: ["websocket"],
  path: "/socket.io",
});

socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
socket.emit("admin_online"); // let server know admin is online

socket.on("receive_message", (msg) => {
  const chatIndex = chats.value.findIndex(c => c.id === msg.chat_id);

  if (selectedChat.value?.id === msg.chat_id) {
    if (!messages.value.find(m => m.id === msg.id)) {
      messages.value.push(msg);
      scrollToEnd();
    }
  } else if (chatIndex !== -1) {
    // reactive unread count
    chats.value[chatIndex] = {
      ...chats.value[chatIndex],
      unread_count: (chats.value[chatIndex].unread_count || 0) + 1
    };
  }
});

socket.on("unread_count", ({ chatId, count }) => {
  const chatIndex = chats.value.findIndex(c => c.id === chatId);
  if (chatIndex !== -1) {
    chats.value[chatIndex] = {
      ...chats.value[chatIndex],
      unread_count: count
    };
  }
});

// ---------------- ONLINE USERS ----------------
const onlineUsers = ref([]); // <-- array, not Set

socket.on("online_users", (users) => {
  onlineUsers.value = users; // array from server
  console.log("Online users updated:", onlineUsers.value);
});

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
  chats.value.filter(chat =>
    chat.user_id?.toString().includes(search.value.toLowerCase())
  )
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

// ---------------- SEND MESSAGE ----------------
const sendMessage = async () => {
  if (!input.value.trim() || !selectedChat.value) return;
  const msgText = input.value.trim();
  input.value = "";

  try {
    await axios.post(
      `https://api.spcwin.info/admin/chats/${selectedChat.value.id}/message`,
      { message: msgText }
    );
  } catch (err) {
    console.error("Send message failed:", err);
  }
};

// ---------------- MARK READ ----------------
const markRead = async () => {
  if (!selectedChat.value) return;
  try {
    await axios.post(`https://api.spcwin.info/admin/chats/${selectedChat.value.id}/read`);
    selectedChat.value.unread_count = 0;
    fetchChats();
  } catch (err) {
    console.error("Mark read failed:", err);
  }
};

// ---------------- SCROLL ----------------
const scrollToEnd = async () => {
  await nextTick();
  chatEnd.value?.scrollIntoView({ behavior: "smooth" });
};

const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

onMounted(() => {
  fetchChats();
});
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.bg-yellow-100 { background-color: #fff9c4 !important; }
</style>