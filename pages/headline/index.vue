<template>
  <div class="admin-settings-page">
    <div class="container">

      <!-- Tabs -->
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.key"
                :class="{ active: activeTab === tab.key }"
                @click="activeTab = tab.key">{{ tab.label }}</button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">

        <!-- Headline Tab -->
        <div v-if="activeTab === 'headline'" class="tab-panel card">
          <h3>Dashboard Headline</h3>
          <input type="text" v-model="title" placeholder="Enter dashboard headline" />
          <button :disabled="loading" @click="updateHeadline">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? "Saving..." : "Save" }}
          </button>
        </div>

        <!-- Turnover Tab -->
        <div v-if="activeTab === 'turnover'" class="tab-panel card">
          <h3>Turnover Settings</h3>
          <input type="number" v-model="delayTime" min="0" placeholder="Delay in minutes" />
          <button :disabled="loading" @click="updateTurnover">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? "Saving..." : "Save" }}
          </button>
        </div>

        <!-- Referral Tab -->
        <div v-if="activeTab === 'referral'" class="tab-panel card">
          <h3>Referral & Deposit Settings</h3>
          <div class="input-group">
            <label>Referral Bonus (%)</label>
            <input type="number" v-model="referralBonus" min="0" max="100" />
          </div>
          <div class="input-group">
            <label>Owner Bonus (%)</label>
            <input type="number" v-model="ownerBonus" min="0" max="100" />
          </div>
          <button :disabled="loading" @click="updateReferral">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? "Saving..." : "Save" }}
          </button>
        </div>

        <!-- Social Links Tab -->
        <div v-if="activeTab === 'social'" class="tab-panel card">
          <h3>Social Group Links</h3>
          <div v-for="platform in socialPlatforms" :key="platform" class="social-card">
            <h4>{{ platform }}</h4>
            <input type="text" v-model="socialLinks[platform]" placeholder="Enter group link" />
            <label class="checkbox-label">
              <input type="checkbox" v-model="socialActive[platform]" />
              Active
            </label>
            <button :disabled="loading" @click="updateSocial(platform)">
              <span v-if="loading" class="spinner"></span>
              Save
            </button>
          </div>
        </div>

        <!-- Hero Sliders Tab -->
        <div v-if="activeTab === 'hero'" class="tab-panel card">
          <h3>Hero Sliders</h3>
          <button class="add-btn" @click="addHeroSlide">+ Add Slide</button>
          <div v-for="slide in heroSlides" :key="slide.id" class="slider-card">
            <input type="text" v-model="slide.image_url" placeholder="Image URL" />
            <input type="text" v-model="slide.title" placeholder="Title" />
            <input type="text" v-model="slide.subtitle" placeholder="Subtitle" />
            <input type="text" v-model="slide.link_url" placeholder="Link URL" />
            <div class="slider-actions">
              <label><input type="checkbox" v-model="slide.is_active" /> Active</label>
              <input type="number" v-model="slide.position" placeholder="Position" />
              <button @click="updateHeroSlide(slide)">Save</button>
              <button @click="deleteHeroSlide(slide.id)" class="delete-btn">Delete</button>
            </div>
          </div>
        </div>

        <!-- Event Sliders Tab -->
        <div v-if="activeTab === 'event'" class="tab-panel card">
          <h3>Event Sliders</h3>
          <button class="add-btn" @click="addEventSlide">+ Add Slide</button>
          <div v-for="slide in eventSlides" :key="slide.id" class="slider-card">
            <input type="text" v-model="slide.image_url" placeholder="Image URL" />
            <input type="text" v-model="slide.title" placeholder="Title" />
            <input type="text" v-model="slide.subtitle" placeholder="Subtitle" />
            <input type="text" v-model="slide.link_url" placeholder="Link URL" />
            <div class="slider-actions">
              <label><input type="checkbox" v-model="slide.is_active" /> Active</label>
              <input type="number" v-model="slide.position" placeholder="Position" />
              <button @click="updateEventSlide(slide)">Save</button>
              <button @click="deleteEventSlide(slide.id)" class="delete-btn">Delete</button>
            </div>
          </div>
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
import { ref } from "vue";

const activeTab = ref("headline");
const tabs = [
  { key: "headline", label: "Dashboard Headline" },
  { key: "turnover", label: "Turnover Settings" },
  { key: "referral", label: "Referral & Deposit" },
  { key: "social", label: "Social Links" },
  { key: "hero", label: "Hero Sliders" },
  { key: "event", label: "Event Sliders" },
];







// Headline
const title = ref("");

// Turnover
const delayTime = ref(0);

// Referral
const referralBonus = ref(0);
const ownerBonus = ref(0);

const loading = ref(false);
const message = ref("");
const messageType = ref("");

// Social Links
const socialPlatforms = ["telegram","whatsapp","messenger"];
const socialLinks = ref({ telegram: "", whatsapp: "", messenger: "" });
const socialActive = ref({ telegram: true, whatsapp: true, messenger: true });

// Hero & Event Sliders
const heroSlides = ref([]);
const eventSlides = ref([]);

// Fetch initial data
onMounted(async () => {
  try {
    // HEADLINE
    const resHeadline = await fetch("https://api.bajiraj.cloud/users/headline");
    const dataHeadline = await resHeadline.json();
    title.value = dataHeadline.title || "";

    // TURNOVER
    const resDelay = await fetch("https://api.bajiraj.cloud/withdrawals/system/settings/turnover-delay");
    const dataDelay = await resDelay.json();
    delayTime.value = dataDelay.turnover_delay || 0;

    // REFERRAL
    const resReferral = await fetch("https://api.bajiraj.cloud/users/referral-setting");
    const dataReferral = await resReferral.json();
    referralBonus.value = dataReferral.referred_bonus || 0;
    ownerBonus.value = dataReferral.owner_bonus || 0;

    // SOCIAL LINKS
    const resSocial = await fetch("https://api.bajiraj.cloud/users/social-link");
    const socialData = await resSocial.json();
    socialData.data.forEach(link => {
      socialLinks.value[link.platform] = link.group_link;
      socialActive.value[link.platform] = link.is_active;
    });

    // HERO SLIDERS
    const resHero = await fetch("https://api.bajiraj.cloud/users/hero-slider");
    const heroData = await resHero.json();
    heroSlides.value = heroData.data;

    // EVENT SLIDERS
    const resEvent = await fetch("https://api.bajiraj.cloud/users/event-slider");
    const eventData = await resEvent.json();
    eventSlides.value = eventData.data;

  } catch (err) {
    console.error("Failed to fetch settings:", err);
  }
});

// Update Headline
const updateHeadline = async () => {
  if (!title.value.trim()) return showMessage("Headline cannot be empty!", "error");
  loading.value = true;
  try {
    await fetch("https://api.bajiraj.cloud/users/headline", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ title: title.value }) });
    showMessage("Headline updated!", "success");
  } catch { showMessage("Error updating headline", "error"); }
  finally { loading.value = false; }
};

// Update Turnover
const updateTurnover = async () => {
  loading.value = true;
  try {
    await fetch("https://api.bajiraj.cloud/withdrawals/system/settings//turnover-delay", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ value: delayTime.value }) });
    showMessage("Turnover updated!", "success");
  } catch { showMessage("Error updating turnover", "error"); }
  finally { loading.value = false; }
};

// Update Referral
const updateReferral = async () => {
  loading.value = true;
  try {
    await fetch("https://api.bajiraj.cloud/users/referral-setting", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ referred_bonus: referralBonus.value, owner_bonus: ownerBonus.value }) });
    showMessage("Referral updated!", "success");
  } catch { showMessage("Error updating referral", "error"); }
  finally { loading.value = false; }
};

// Update Social Link
const updateSocial = async (platform) => {
  loading.value = true;
  try {
    await fetch("https://api.bajiraj.cloud/users/social-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, group_link: socialLinks.value[platform], is_active: socialActive.value[platform] }),
    });
    showMessage(`${platform} updated!`, "success");
  } catch { showMessage(`Error updating ${platform}`, "error"); }
  finally { loading.value = false; }
};

// HERO SLIDER METHODS
const addHeroSlide = () => heroSlides.value.push({ image_url:"", title:"", subtitle:"", link_url:"", position:0, is_active:true });
const updateHeroSlide = async (slide) => {
  loading.value = true;
  try {
    const method = slide.id ? "PUT" : "POST";
    const url = slide.id ? `https://api.bajiraj.cloud/users/hero-slider/${slide.id}` : `https://api.bajiraj.cloud/users/hero-slider`;
    const res = await fetch(url, { method, headers:{ "Content-Type":"application/json" }, body:JSON.stringify(slide) });
    const data = await res.json();
    if (data.success) slide.id = data.data.id;
    showMessage("Hero slide saved!", "success");
  } catch { showMessage("Error saving hero slide", "error"); }
  finally { loading.value = false; }
};
const deleteHeroSlide = async (id) => {
  if (!confirm("Delete this slide?")) return;
  loading.value = true;
  try {
    await fetch(`https://api.bajiraj.cloud/users/hero-slider/${id}`, { method:"DELETE" });
    heroSlides.value = heroSlides.value.filter(s => s.id !== id);
    showMessage("Hero slide deleted!", "success");
  } catch { showMessage("Error deleting hero slide", "error"); }
  finally { loading.value = false; }
};

// EVENT SLIDER METHODS
const addEventSlide = () => eventSlides.value.push({ image_url:"", title:"", subtitle:"", link_url:"", position:0, is_active:true });
const updateEventSlide = async (slide) => {
  loading.value = true;
  try {
    const method = slide.id ? "PUT" : "POST";
    const url = slide.id ? `https://api.bajiraj.cloud/users/event-slider/${slide.id}` : `https://api.bajiraj.cloud/users/event-slider`;
    const res = await fetch(url, { method, headers:{ "Content-Type":"application/json" }, body:JSON.stringify(slide) });
    const data = await res.json();
    if (data.success) slide.id = data.data.id;
    showMessage("Event slide saved!", "success");
  } catch { showMessage("Error saving event slide", "error"); }
  finally { loading.value = false; }
};
const deleteEventSlide = async (id) => {
  if (!confirm("Delete this slide?")) return;
  loading.value = true;
  try {
    await fetch(`https://api.bajiraj.cloud/users/event-slider/${id}`, { method:"DELETE" });
    eventSlides.value = eventSlides.value.filter(s => s.id !== id);
    showMessage("Event slide deleted!", "success");
  } catch { showMessage("Error deleting event slide", "error"); }
  finally { loading.value = false; }
};

// MESSAGE
function showMessage(msg, type="success") {
  message.value = msg;
  messageType.value = type;
  setTimeout(()=> message.value="", 3000);
}
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

/* Page */
.admin-settings-page { padding: 30px; background:#f7f8fa; min-height:100vh; font-family:"Inter",sans-serif; }

/* Container */
.container { max-width: 900px; margin:auto; }

/* Tabs */
.tabs { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px; }
.tabs button {
  flex:1;
  padding:10px 15px;
  border:none;
  border-radius:12px;
  background:#e2e8f0;
  cursor:pointer;
  font-weight:600;
  transition:0.3s;
}
.tabs button.active { background:#6366f1; color:#fff; box-shadow:0 5px 15px rgba(99,102,241,0.3); }

/* Card Layout */
.card { background:#fff; padding:20px; border-radius:15px; margin-bottom:20px; box-shadow:0 10px 25px rgba(0,0,0,0.05); }

/* Input Groups */
.input-group { margin-bottom:15px; display:flex; flex-direction:column; }
.input-group label { font-weight:600; margin-bottom:5px; }
.input-group input { padding:10px 12px; border-radius:10px; border:1px solid #ccc; }

/* Buttons */
button { padding:10px 15px; border:none; border-radius:10px; background:linear-gradient(135deg,#6366f1,#22d3ee); color:#fff; cursor:pointer; transition:0.3s; }
button:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 15px rgba(99,102,241,0.3); }
.delete-btn { background:#ef4444; margin-left:10px; }
.add-btn { background:#10b981; margin-bottom:15px; }

/* Slider Cards */
.slider-card { padding:15px; background:#f3f4f6; border-radius:12px; margin-bottom:12px; display:flex; flex-direction:column; gap:8px; }
.slider-actions { display:flex; align-items:center; gap:8px; }

/* Checkbox */
.checkbox-label { display:flex; align-items:center; gap:6px; font-weight:500; }

/* Spinner */
.spinner { border:3px solid rgba(255,255,255,0.3); border-top:3px solid #fff; border-radius:50%; width:18px; height:18px; animation:spin 1s linear infinite; }
@keyframes spin { 0%{ transform:rotate(0deg); } 100%{ transform:rotate(360deg); } }

/* Messages */
.message { margin-top:15px; padding:12px 15px; border-radius:10px; font-weight:500; }
.success { background:#d1fae5; color:#065f46; }
.error { background:#fee2e2; color:#b91c1c; }

</style>
