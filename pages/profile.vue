<template>
  <div id="myProfile">
    <v-container grid-list-xl fluid>
      <v-row>
        <v-col cols="12">
          <v-card class="my-2">
            <v-container grid-list-xl>
              <v-row>
                <v-col cols="12" md="3" class="text-xs-center">
                  <v-avatar color="purple red--after" size="150px">
                    <span class="!text-3xl"> User </span>
                  </v-avatar>
                </v-col>
                <v-col cols="12" md="9">
                  <v-form @submit.prevent="handleSubmit">
                    <div class="pos-r">
                      <v-subheader> General Information </v-subheader>
                      <v-divider />
                      <v-btn
                          fab
                          small
                          dark
                          icon
                          :class="info_readonly ? 'bg-primary' : 'bg-pink'"
                          bottom
                          right
                          absolute
                          @click="info_readonly = !info_readonly"
                        >
                          <v-icon>
                            mdi-{{ info_readonly ? 'pencil' : 'close-circle' }}
                          </v-icon>
                        </v-btn>
                    </div>

                    <v-container class="pa-2" grid-list-xl>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="firstName"
                            append-icon="mdi-account"
                            label="First Name"
                            variant="underlined"
                            :disabled="info_readonly"
                          />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="lastName"
                            append-icon="mdi-account"
                            label="Last Name"
                            variant="underlined"
                            :disabled="info_readonly"
                          />
                        </v-col>
                      </v-row>
                    </v-container>
                    <v-container class="pa-2" grid-list-xl>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="email"
                            append-icon="mdi-email"
                            label="Email"
                            type="email"
                            variant="underlined"
                            :disabled="info_readonly"
                          />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field :disabled="info_readonly" v-model="phone" append-icon="mdi-phone" label="Phone" variant="underlined" />
                        </v-col>
                      </v-row>
                    </v-container>
                    <v-card-actions v-if="!info_readonly">
                      <v-spacer />
                      <v-btn :loading="loading" color="primary" type="submit" class="bg-primary text-white">
                        Update
                      </v-btn>
                    </v-card-actions>
                  </v-form>

                  <div>
                    <v-form @submit.prevent="handleSubmit">
                      <div class="pos-r">
                        <v-subheader> Reset Password</v-subheader>
                        <v-divider />
                        <v-btn
                            fab
                            small
                            dark
                            icon
                            :class="password_readonly ? 'bg-primary' : 'bg-pink'"
                            bottom
                            right
                            absolute
                            @click="password_readonly = !password_readonly"
                          >
                            <v-icon>
                              mdi-{{
                                password_readonly ? 'pencil' : 'close-circle'
                              }}
                            </v-icon>
                          </v-btn>
                      </div>
                      <v-container class="pa-2" grid-list-xl>
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-text-field
                              :label="$t('password')"
                              v-model="password"
                              :append-inner-icon="
                                show ? 'mdi-eye-off' : 'mdi-eye'
                              "
                              :type="show ? 'text' : 'password'"
                              prepend-icon="mdi-lock"
                              variant="underlined"
                              :disabled = "password_readonly"
                              @click:appendInner="show = !show"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field
                            :label="$t('confirmPassword')"
                              v-model="confirmPassword"
                              :append-inner-icon="
                                show ? 'mdi-eye-off' : 'mdi-eye'
                              "
                              :type="show ? 'text' : 'password'"
                              prepend-icon="mdi-lock"
                              variant="underlined"
                              :disabled = "password_readonly"
                              @click:appendInner="show = !show"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-container>
                      <v-card-actions v-if="!password_readonly">
                        <v-spacer />
                        <v-btn
                          :loading="password_updating"
                          color="primary"
                          type="submit"
                          class="bg-primary text-white"
                        >
                          Update
                        </v-btn>
                      </v-card-actions>
                    </v-form>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script setup lang="ts">
const loading = ref(false);
const password_readonly = ref(true);
const info_readonly = ref(true);
const password_updating = ref(false);
const password = ref("");
const show = ref(false);
const confirmPassword = ref('');
const { status, data, signIn, signOut } = useAuth();
const firstName = data.value.data.name;
const lastName = data.value.data.username;
const email = data.value.data.email;
const phone = data.value.data.phone_number;



async function handleSubmit() {}
</script>
