<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
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
      <!-- Chats list -->
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
                <v-list-item-title>User: {{ chat.user_id }} </v-list-item-title>
                <v-list-item-subtitle>
                  Messages: {{ chat.user_messages || 0 }} | Status: {{ chat.status }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-icon>
                <v-icon v-if="chat.status === 'open'" color="green">mdi-circle</v-icon>
                <v-icon v-else color="red">mdi-circle-off</v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Chat window -->
      <v-col cols="12" md="8">
        <v-card class="rounded-2xl elevation-4" style="height: 520px; display: flex; flex-direction: column;">
          <!-- Chat header -->
          <v-card-title class="bg-yellow-400 text-black rounded-t-2xl">
            💬 Chat with User {{ selectedChat?.user_id || "" }}
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

// ----------------- STATE -----------------
const chats = ref([]);
const selectedChat = ref(null);
const messages = ref([]);
const input = ref("");
const search = ref("");
const chatEnd = ref(null);

let previousChatId = null;

// ----------------- SOCKET -----------------
const socket = io("https://api.spcwin.info", {
  transports: ["websocket"],
  path: "/socket.io",
});

socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
socket.on("connect_error", (err) => console.error("❌ Socket error:", err));

socket.on("receive_message", (msg) => {
  console.log("[DEBUG] Socket received message:", msg);
  if (selectedChat.value && msg.chat_id === selectedChat.value.id) {
    // prevent duplicate messages
    if (!messages.value.find((m) => m.id === msg.id)) {
      messages.value.push(msg);
      scrollToEnd();
    }
  }
});

// ----------------- FETCH CHATS -----------------
const fetchChats = async () => {
  try {
    const { data } = await axios.get("https://api.spcwin.info/users/admin/chats");
    chats.value = data;
    console.log("[DEBUG] Fetched chats:", data);
  } catch (err) {
    console.error("Failed to fetch chats:", err);
  }
};

// Filtered chats
const filteredChats = computed(() =>
  chats.value.filter(chat =>
    chat.user_id?.toString().includes(search.value.toLowerCase())
  )
);

// ----------------- SELECT CHAT -----------------
const selectChat = async (chat) => {
  if (!chat) return;

  // Leave previous room
  if (previousChatId) socket.emit("leave_chat", { chatId: previousChatId });

  selectedChat.value = chat;
  previousChatId = chat.id;

  // Join socket room
  socket.emit("join_chat", { chatId: chat.id });

  // Fetch messages
  try {
    const { data } = await axios.get(`https://api.spcwin.info/users/admin/chats/${chat.id}/messages`);
    messages.value = data;
    scrollToEnd();
  } catch (err) {
    console.error("Failed to fetch messages:", err);
  }
};

// ----------------- SEND MESSAGE -----------------
const sendMessage = async () => {
  if (!input.value.trim() || !selectedChat.value) return;

  const msgText = input.value.trim();
  input.value = "";

  try {
    const { data: savedMsg } = await axios.post(
      `https://api.spcwin.info/users/admin/chats/${selectedChat.value.id}/message`,
      { message: msgText }
    );
    console.log("[DEBUG] Admin sent message:", savedMsg);
    // no need to push locally, backend emits it
  } catch (err) {
    console.error("Failed to send message:", err);
  }
};

// ----------------- SCROLL -----------------
const scrollToEnd = async () => {
  await nextTick();
  chatEnd.value?.scrollIntoView({ behavior: "smooth" });
};

// ----------------- TIME FORMAT -----------------
const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ----------------- ON MOUNT -----------------
onMounted(() => {
  fetchChats();
});
</script>

<style scoped>
.rounded-2xl {
  border-radius: 1rem;
}
.cursor-pointer {
  cursor: pointer;
}
.bg-yellow-100 {
  background-color: #fff9c4 !important;
}
</style>
