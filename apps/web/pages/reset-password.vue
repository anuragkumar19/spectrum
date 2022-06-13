<template>
  <v-row justify="center" align="center" style="height: 100vh">
    <v-col sm="12" class="px-4 py-12" style="max-width: 500px">
      <v-card elevation="0" outlined class="w-100" :loading="submitting">
        <v-card-text class="text-center py-10 px-4">
          <img src="/logo.png" style="width: 150px" class="mb-3" alt="" />
          <h4 class="mb-6" style="color: #000; font-weight: 400">
            A OTP has been sent to your email
            <code>{{ $store.state.resetEmail }}</code> to reset your password
          </h4>
          <template>
            <v-form v-model="valid">
              <v-container>
                <v-otp-input
                  length="6"
                  plain
                  type="number"
                  v-model="otp"
                  @input="validate"
                ></v-otp-input>
                <v-text-field
                  v-model="password"
                  :rules="passwordRules"
                  label="New Password"
                  type="password"
                  required
                  outlined
                ></v-text-field>
                <div class="mb-3">
                  <v-btn
                    color="primary"
                    :disabled="!(valid && isOtpValid)"
                    :loading="submitting"
                    @click="resetPassword"
                    >Reset Password</v-btn
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
  name: "ResetPasswordPage",
  auth: "guest",
  head: {
    title: "Reset Password",
  },
  layout: "auth",
  data() {
    return {
      isOtpValid: false,
      otp: "",
      valid: false,
      submitting: false,
      password: "",
      passwordRules: [
        (v) => !!v || "Password is required",
        (v) => v.length >= 8 || "Password must be at least 8 characters",
      ],
    };
  },
  methods: {
    async resetPassword() {
      try {
        this.submitting = true;
        const res = await this.$axios.$post("/auth/reset-password", {
          email: this.$store.state.resetEmail,
          otp: this.otp,
          password: this.password,
        });
        this.$toast.success(res.message);
        this.$store.commit("setResetEmail", "");
        this.$router.push("/login");
      } catch (err) {
        this.$toast.error(err.response.data.message);
      } finally {
        this.submitting = false;
      }
    },
    validate() {
      this.isOtpValid = this.otp.length === 6;
    },
  },
  created() {
    if (!this.$store.state.resetEmail) {
      this.$router.push("/login");
    }
  },
};
</script>
