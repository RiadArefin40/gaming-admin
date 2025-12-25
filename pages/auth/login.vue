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
const STATIC_USERNAME = "admin";
const STATIC_PASSWORD = "123456";

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
function handleLogin() {
  loading.value = true;

  setTimeout(() => {
    if (
      username.value === STATIC_USERNAME &&
      password.value === STATIC_PASSWORD
    ) {
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          username: username.value,
          loggedIn: true,
        })
      );

      toast.success("Successfully logged in");
      navigateTo("/");
    } else {
      toast.warning("Invalid username or password");
    }

    loading.value = false;
  }, 800); // fake delay
}
</script>
