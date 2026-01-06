<template>
  <v-row justify="center" align="center" id="auth">
    <v-col cols="12" sm="6" md="3">
      <v-card>
        <v-form v-model="formValid" @submit.prevent="handleLogin">
          <v-card-text>
            <v-text-field
              class="mb-2"
              label="Username"
              v-model="username"
              :rules="[required]"
              prepend-icon="mdi-account"
              variant="underlined"
            />

            <v-text-field
              class="mb-2"
              label="Password"
              v-model="password"
              :rules="[required]"
              prepend-icon="mdi-lock"
              type="password"
              variant="underlined"
            />
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              variant="tonal"
              type="submit"
              :loading="loading"
    
            >
              Login
            </v-btn>
          </v-card-actions>

          <VSonner position="top-center" />
        </v-form>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { VSonner, toast } from "vuetify-sonner";
import "vuetify-sonner/style.css";

definePageMeta({ layout: "secondary" });

/* ================= STATIC AUTH ================= */
const STATIC_USERNAME = "sadmin";
const STATIC_PASSWORD = "p123456";

/* ================= STATE ================= */
const username = ref("");
const password = ref("");
const loading = ref(false);
const formValid = ref(false);

/* ================= VALIDATION ================= */
function required(v: any) {
  return !!v || "Field is required";
}

/* ================= LOGIN ================= */
async function  handleLogin() {
  loading.value = true;

   try {
   const res = await fetch("https://api.bajiraj.cloud/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify({ identifier: username.value, password: password.value }),
    });

    const data = await res.json();
    if(data.user.role !== "admin" && data.user.role !== "agent"){
      toast.error("You do not have permission to access this panel");
      loading.value = false;
      return;
    }
    console.log(data);
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
           username: data.user.name,
           role: data.user.role,
           loggedIn: true,
        })
      );
          toast.success("Successfully logged in");
      navigateTo("/");
  } catch (err) {
    console.error('login',err);
    loading.value = false;
  }

  // setTimeout(() => {
  // {


  //     toast.success("Successfully logged in");
  //     navigateTo("/");
  //   } 

  //   loading.value = false;
  // }, 800); // fake delay
}
</script>
