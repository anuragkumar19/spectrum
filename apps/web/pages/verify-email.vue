<template>
  <v-row justify="center" align="center" style="height: 100vh">
    <v-col sm="12" class="px-4 py-12" style="max-width: 500px">
      <v-card elevation="0" outlined class="w-100" :loading="submitting">
        <v-card-text class="text-center py-10 px-4">
          <img src="/logo.png" style="width: 150px" class="mb-3" alt="" />
          <h4 class="mb-6" style="color: #000; font-weight: 400">
            A OTP has been sent to your email
            <code>{{ $store.state.signupEmail }}</code> to verify your email
          </h4>
          <template>
            <v-form>
              <v-container>
                <v-otp-input
                  length="6"
                  plain
                  type="number"
                  v-model="otp"
                  @input="validate"
                ></v-otp-input>
                <div class="mb-3">
                  <v-btn
                    color="primary"
                    :disabled="submitting || !valid"
                    :loading="submitting"
                    @click="verify"
                    >Verify</v-btn
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
  name: "VerifyEmailPage",
  auth: "guest",
  head: {
    title: "Verify Email",
  },
  layout: "auth",
  data() {
    return {
      otp: "",
      valid: false,
      submitting: false,
    };
  },
  methods: {
    async verify() {
      if (this.valid) {
        try {
          this.submitting = true;
          const res = await this.$axios.$post("/auth/verify-email", {
            otp: this.otp,
            email: this.$store.state.signupEmail,
          });
          this.$toast.success(res.message);
          this.$store.commit("setSignupEmail", "");
          this.$router.push("/login");
        } catch (err) {
          this.$toast.error(err.response.data.message);
        } finally {
          this.submitting = false;
        }
      }
    },
    validate() {
      if (this.otp.length === 6) {
        this.valid = true;
      } else {
        this.valid = false;
      }
    },
  },
  created() {
    if (!this.$store.state.signupEmail) {
      this.$router.push("/login");
    }
  },
};
</script>
