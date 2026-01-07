<template>
  <div class="admin-settings-page">
    <div class="container">

      <!-- Tabs -->
      <div class="tabs">
        <button
          :class="{ active: activeTab === 'headline' }"
          @click="activeTab = 'headline'"
        >
          Dashboard Headline
        </button>
        <button
          :class="{ active: activeTab === 'turnover' }"
          @click="activeTab = 'turnover'"
        >
          Turnover Settings
        </button>
        <button
          :class="{ active: activeTab === 'referral' }"
          @click="activeTab = 'referral'"
        >
          Referral & Deposit
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">

        <!-- Headline Tab -->
        <div v-if="activeTab === 'headline'" class="tab-panel">
          <input
            type="text"
            v-model="title"
            placeholder="Enter dashboard headline"
          />
          <button :disabled="loading" @click="updateHeadline">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? "Saving..." : "Save" }}
          </button>
        </div>

        <!-- Turnover Tab -->
        <div v-if="activeTab === 'turnover'" class="tab-panel">
          <label>Turnover Finish Time</label>
          <input type="time" v-model="turnoverTime" step="60" />

          <label>Delay Time (minutes)</label>
          <input type="number" v-model="delayTime" min="0" placeholder="Enter delay" />

          <button :disabled="loading" @click="updateTurnover">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? "Saving..." : "Save" }}
          </button>
        </div>

        <!-- Referral & Deposit Tab -->
        <div v-if="activeTab === 'referral'" class="tab-panel">
          <label>Referral Bonus (%)</label>
          <input type="number" v-model="referralBonus" min="0" max="100" placeholder="Enter referral %" />

          <label>Deposit Condition (Min Amount)</label>
          <input type="number" v-model="depositCondition" min="0" placeholder="Enter min deposit" />

          <button :disabled="loading" @click="updateReferral">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? "Saving..." : "Save" }}
          </button>
        </div>

      </div>

      <!-- Message -->
      <transition name="fade">
        <div v-if="message" :class="['message', messageType]">{{ message }}</div>
      </transition>

    </div>
  </div>
</template>



<script setup>
import { ref, onMounted } from "vue";

const activeTab = ref("headline");
const title = ref("");

const loading = ref(false);
const message = ref("");
const messageType = ref("");

onMounted(async () => {
  try {
    const res = await fetch("https://api.bajiraj.cloud/users/headline");
    const data = await res.json();
    title.value = data.title || "";
    turnoverTime.value = data.turnover_time || "23:59";
  } catch (err) {
    console.error(err);
  }
});


const turnoverTime = ref("23:59");
const delayTime = ref(0); // new: delay time in minutes

const updateTurnover = async () => {
  loading.value = true;
  message.value = "";

  try {
    const res = await fetch("https://api.bajiraj.cloud/users/headline", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        turnover_time: turnoverTime.value,
        delay_minutes: delayTime.value
      }),
    });

    if (!res.ok) throw new Error("Failed to update turnover time");

    message.value = "Turnover settings updated!";
    messageType.value = "success";
  } catch (err) {
    message.value = "Something went wrong.";
    messageType.value = "error";
  } finally {
    loading.value = false;
  }
};


const updateHeadline = async () => {
  if (!title.value.trim()) {
    message.value = "Headline cannot be empty!";
    messageType.value = "error";
    return;
  }

  loading.value = true;
  message.value = "";

  try {
    const res = await fetch("https://api.bajiraj.cloud/users/headline", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.value }),
    });

    if (!res.ok) throw new Error("Failed to update headline");

    message.value = "Headline updated successfully!";
    messageType.value = "success";
  } catch (err) {
    message.value = "Something went wrong.";
    messageType.value = "error";
  } finally {
    loading.value = false;
  }
};


</script>


<style scoped>
/* Base */
.admin-settings-page {
  padding: 40px 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa, #e4ebf7);
  font-family: "Inter", sans-serif;
}

.container {
  max-width: 500px;
  margin: auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px 25px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
  backdrop-filter: blur(12px);
}

/* Tabs */
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.tabs button {
  flex: 1;
  padding: 10px 0;
  font-weight: 600;
  font-size: 14px;
  border-radius: 12px;
  border: none;
  background: #e2e8f0;
  color: #374151;
  cursor: pointer;
  transition: all 0.25s ease;
}

.tabs button.active {
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  color: white;
  box-shadow: 0 6px 16px rgba(99,102,241,0.3);
}

/* Tab panel */
.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Inputs */
.tab-panel input {
  padding: 14px 16px;
  font-size: 15px;
  border-radius: 12px;
  border: none;
  outline: none;
  background: #f0f3f7;
  box-shadow: inset 4px 4px 8px rgba(0,0,0,0.05),
              inset -4px -4px 8px rgba(255,255,255,0.7);
  transition: 0.3s;
}

.tab-panel input:focus {
  box-shadow: inset 4px 4px 10px rgba(0,0,0,0.08),
              inset -4px -4px 10px rgba(255,255,255,0.8);
}

/* Button */
.tab-panel button {
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  color: white;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.tab-panel button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.5);
}

.spinner {
  border: 3px solid rgba(255,255,255,0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

</style>
