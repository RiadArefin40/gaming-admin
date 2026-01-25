<template>
  <v-row class="bg-slate-200" justify="center" align="center" id="auth">
    <v-col cols="12" sm="6" md="3">
      <v-card class="!bg-slate-300 mx-2">
        <v-form v-model="formValid" @submit.prevent="handleLogin">
          <v-card-text>
            <v-text-field
              class="mb-2"
              label="Email"
              v-model="username"
     
              variant="underlined"
            />

            <v-text-field
              class="mb-2"
              label="Password"
               v-model="password"
              type="password"
              variant="underlined"
            />
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
          
              type="submit"
              :loading="loading"
    
            >
              Sign In
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
  console.log(username.value , password.value)
if(username.value == "mdrohulmia2025@gmail.com" && password.value == "123456"){
   try {
    
console.log("okk")
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
           username: "mdrohulmia2025@gmail.com",
           loggedIn: true,
        })
      );
          toast.success("Successfully logged in");
      navigateTo("/");
        loading.value = false
  } catch (err) {
    console.error('login',err);
    loading.value = false;
  }
}
else{
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
