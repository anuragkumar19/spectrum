<template>
  <main>
    <v-row justify="center" align="center" style="height: 100vh">
      <v-col sm="12" class="px-4 py-12" style="max-width: 500px">
        <v-card elevation="0" outlined class="w-100" :loading="submitting">
          <v-card-text class="text-center py-10 px-4">
            <img src="/logo.png" style="width: 150px" class="mb-3" alt="" />
            <h1 class="mb-6" style="color: #000; font-weight: 400">Sign in</h1>
            <template>
              <v-form v-model="valid">
                <v-container>
                  <v-text-field
                    v-model="identifier"
                    :rules="identifierRules"
                    label="Username or Email"
                    required
                    outlined
                    autofocus
                  ></v-text-field>
                  <v-text-field
                    v-model="password"
                    :rules="passwordRules"
                    label="Password"
                    type="password"
                    required
                    outlined
                  ></v-text-field>
                  <div class="mb-3">
                    <v-btn
                      color="primary"
                      :disabled="submitting || !valid"
                      :loading="submitting"
                      @click="login"
                      >Sign in</v-btn
                    >
                  </div>
                  <nuxt-link to="/forgot-password">Forgot Password?</nuxt-link>
                  <v-divider class="my-3"></v-divider>
                  <p class="pa-0 ma-0">
                    Don't have an account?
                    <nuxt-link to="/signup">Sign up</nuxt-link>
                  </p>
                </v-container>
              </v-form>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!-- Dialog for choose MFA type -->
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent max-width="500">
        <v-card>
          <v-card-title class="text-h5">
            MFA is enabled for your account
          </v-card-title>
          <v-card-text>
            <p>Please choose a method to authenticate</p>
            <div class="text-center">
              <v-btn
                color="primary"
                v-for="(mfaType, i) in mfaTypes"
                :key="i"
                @click="next(mfaType)"
              >
                {{
                  mfaType === "authenticator"
                    ? "Google Authenticator"
                    : "Email OTP"
                }}
              </v-btn>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="closeDialog">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
    <!-- Dialog for verify otp -->
    <v-row justify="center">
      <v-dialog v-model="dialog2" persistent max-width="500">
        <v-card>
          <v-card-title class="text-h5">
            {{
              selectedMfaType === "authenticator"
                ? "Enter Google Authenticator Code"
                : "Enter OTP send to your email"
            }}
          </v-card-title>
          <v-card-text>
            <div class="text-center">
              <v-otp-input
                length="6"
                plain
                type="number"
                v-model="mfaCode"
                @input="validateOtp"
              ></v-otp-input>
              <v-btn
                color="primary"
                @click="verify"
                :loading="submitting"
                :disabled="submitting || !validOtp"
                class="mt-3"
              >
                Verify
              </v-btn>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="red darken-1"
              text
              @click="closeDialog"
              :loading="submitting"
              :disabled="submitting"
            >
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </main>
</template>

<script>
export default {
  name: "LoginPage",
  auth: "guest",
  head: {
    title: "Login",
  },
  layout: "auth",
  data() {
    return {
      dialog: false,
      dialog2: false,
      validOtp: false,
      selectedMfaType: "",
      mfaTypes: [],
      mfaCode: "",
      identifier: "",
      password: "",
      valid: false,
      submitting: false,
      identifierRules: [(v) => !!v || "Username or email is required"],
      passwordRules: [
        (v) => !!v || "Password is required",
        (v) => (v && v.length >= 8) || "Password must be at least 8 characters",
      ],
    };
  },
  methods: {
    async login() {
      try {
        this.submitting = true;
        const res = await this.$auth.loginWith("local", {
          data: {
            identifier: this.identifier,
            password: this.password,
          },
        });
      } catch (err) {
        console.dir(err);
        if (err.response.data.mfaEnabled) {
          this.mfaTypes = err.response.data.mfaTypes;
          this.dialog = true;
        } else {
          this.$toast.error(err.response.data.message);
        }
      } finally {
        this.submitting = false;
      }
    },
    async verify() {
      try {
        this.submitting = true;
        const res = await this.$auth.loginWith("local", {
          type: "mfa",
          data: {
            identifier: this.identifier,
            password: this.password,
            mfaType: this.selectedMfaType,
            mfaCode: this.mfaCode,
          },
        });
      } catch (err) {
        this.$toast.error(err.response.data.message);
      } finally {
        this.submitting = false;
      }
    },
    closeDialog() {
      this.mfaTypes = [];
      this.dialog = false;
      this.dialog2 = false;
      this.selectedMfaType = "";
    },
    async next(mfaType) {
      this.dialog = false;
      this.dialog2 = true;
      this.selectedMfaType = mfaType;

      if (mfaType === "emailOtp") {
        try {
          await this.$axios.post("/auth/mfa/send-otp", {
            identifier: this.identifier,
            password: this.password,
          });
        } catch (err) {
          this.$toast.error(err.response.data.message);
        }
      }
    },
    validateOtp() {
      if (this.mfaCode.length === 6) {
        this.validOtp = true;
      } else {
        this.validOtp = false;
      }
    },
  },
};
</script>
