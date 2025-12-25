<template>
 <v-row justify="center" align="center" id="auth">
    <v-col cols="12" sm="6" md="4">
      <v-card >
        <v-card-title class="justify-center" justify="center" align="center">
                Forgot Password
              </v-card-title>
              <v-divider />
        <v-form>
          <v-card-text>
            <v-text-field
              class="mb-2"
              label="Email"
              bg-color="white" 
              prepend-icon="mdi-email"
              variant="underlined"
            ></v-text-field>

            <p class="text-right ma-0">
              <nuxt-link
                class="error--text"
                to="/auth/login"
              >
                Back To Login Page
              </nuxt-link>
            </p>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" type="submit" variant="tonal"> Send Password Reset Link </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "secondary",
  auth: false
});
</script>
