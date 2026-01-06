<template>
  <div class="admin-headline-page">
    <div class="container">
      <h2>Update Dashboard Headline</h2>
    

      <div class="headline-form">
   
        <input
          id="title"
          type="text"
          v-model="title"
          placeholder="Enter dashboard headline"
        />

        <button :disabled="loading" @click="updateHeadline">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? "Saving..." : "Save" }}
        </button>
      </div>

      <transition name="fade">
        <div v-if="message" :class="['message', messageType]">{{ message }}</div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const title = ref("");
const loading = ref(false);
const message = ref("");
const messageType = ref("");

onMounted(async () => {
  try {
    const res = await fetch("https://stage.api.bajiraj.com/users/headline");
    const data = await res.json();
    title.value = data.title || "";
  } catch (err) {
    console.error(err);
  }
});

const updateHeadline = async () => {
  if (!title.value.trim()) {
    message.value = "Headline cannot be empty!";
    messageType.value = "error";
    return;
  }

  loading.value = true;
  message.value = "";

  try {
    const res = await fetch("https://stage.api.bajiraj.com/users/headline", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.value }),
    });

    if (!res.ok) throw new Error("Failed to update headline");

    message.value = "Headline updated successfully!";
    messageType.value = "success";
  } catch (err) {
    console.error(err);
    message.value = "Something went wrong. Please try again.";
    messageType.value = "error";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Base */
.admin-headline-page {
  /* margin: 5px; */
  padding: 50px 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa, #e4ebf7);
  font-family: "Inter", sans-serif;
}

/* Container Card */
.container {
  width: 100%;
  max-width: 500px;
  padding: 40px 30px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(12px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.container:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.12);
}

h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: #111827;
}

.subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: #6b7280;
}

/* Form */
.headline-form {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.headline-form label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

/* Neumorphic Input */
.headline-form input {
  padding: 14px 18px;
  font-size: 15px;
  border-radius: 12px;
  border: none;
  outline: none;
  background: #f0f3f7;
  box-shadow: inset 4px 4px 8px rgba(0,0,0,0.05),
              inset -4px -4px 8px rgba(255,255,255,0.7);
  transition: 0.3s;
}

.headline-form input:focus {
  box-shadow: inset 4px 4px 10px rgba(0,0,0,0.08),
              inset -4px -4px 10px rgba(255,255,255,0.8);
}

/* Glass Button */
.headline-form button {
  padding: 14px 18px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  color: white;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.headline-form button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.5);
}

.headline-form button:disabled {
  background: #93c5fd;
  cursor: not-allowed;
  box-shadow: 0 6px 12px rgba(147,197,253,0.4);
}

/* Spinner inside button */
.spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

/* Message */
.message {
  margin-top: 20px;
  padding: 14px 18px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
}

.success {
  background-color: #d1fae5;
  color: #065f46;
}

.error {
  background-color: #fee2e2;
  color: #b91c1c;
}

/* Fade animation */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Spinner animation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 600px) {
  .container {
    padding: 30px 20px;
    border-radius: 16px;
  }

  h2 {
    font-size: 22px;
  }

  .headline-form button {
    font-size: 14px;
  }
}
</style>
