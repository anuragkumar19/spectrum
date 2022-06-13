<template>
  <v-row justify="center" align="center" style="height: 100vh">
    <v-col sm="12" class="px-4 py-12" style="max-width: 500px">
      <v-card elevation="0" outlined class="w-100" :loading="submitting">
        <v-card-text class="text-center py-10 px-4">
          <img src="/logo.png" style="width: 150px" class="mb-3" alt="" />
          <h4 class="mb-6" style="color: #000; font-weight: 400">
            Forgot Your password? Don't worry we are always here to help.
          </h4>
          <template>
            <v-form v-model="valid">
              <v-container>
                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="Email"
                  required
                  outlined
                  autofocus
                ></v-text-field>
                <div class="mb-3">
                  <v-btn
                    color="primary"
                    :disabled="submitting || !valid"
                    :loading="submitting"
                    @click="forgotPassword"
                    >Get Otp</v-btn
                  >
                </div>
              </v-container>
            </v-form>
          </template>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "ForgotPasswordPage",
  auth: "guest",
  head: {
    title: "Forgot Password",
  },
  layout: "auth",
  data() {
    return {
      email: "",
      emailRules: [
        (v) => !!v || "Email is required",
        (v) => /.+@.+\..+/.test(v) || "Email must be valid",
      ],
      valid: false,
      submitting: false,
    };
  },
  methods: {
    async forgotPassword() {
      if (this.valid) {
        try {
          this.submitting = true;

          const res = await this.$axios.post("/auth/forgot-password", {
            email: this.email,
          });

          this.$toast.success(res.data.message);
          this.$store.commit("setResetEmail", this.email);

          this.$router.push("/reset-password");
        } catch (err) {
          this.$toast.error(err.response.data.message);
        } finally {
          this.submitting = false;
        }
      }
    },
  },
};
</script>
