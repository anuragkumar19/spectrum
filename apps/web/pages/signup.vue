<template>
  <v-row justify="center" align="center" style="height: 100vh">
    <v-col sm="12" class="px-4 py-12" style="max-width: 500px">
      <v-card elevation="0" outlined class="w-100" :loading="submitting">
        <v-card-text class="text-center py-10 px-4">
          <img src="/logo.png" style="width: 150px" class="mb-3" alt="" />
          <h1 class="mb-6" style="color: #000; font-weight: 400">Sign Up</h1>
          <template>
            <v-form v-model="valid">
              <v-container>
                <v-text-field
                  v-model="name"
                  :rules="nameRules"
                  label="Name"
                  required
                  outlined
                ></v-text-field>
                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="Email"
                  required
                  outlined
                  autofocus
                ></v-text-field>
                <v-text-field
                  v-model="username"
                  :rules="usernameRules"
                  label="Username"
                  required
                  outlined
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
                    @click="signup"
                    >Sign up</v-btn
                  >
                </div>
                <v-divider class="my-3"></v-divider>
                <p class="pa-0 ma-0">
                  Already have an account?
                  <nuxt-link to="/login">Sign in</nuxt-link>
                </p>
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
  name: "SignUpPage",
  auth: "guest",
  head: {
    title: "Sign Up",
  },
  layout: "auth",
  data() {
    return {
      name: "",
      email: "",
      username: "",
      password: "",
      valid: false,
      submitting: false,
      nameRules: [(v) => !!v || "Name is required"],
      emailRules: [
        (v) => !!v || "Email is required",
        (v) => /.+@.+\..+/.test(v) || "Email must be valid",
      ],
      usernameRules: [
        (v) => !!v || "Username is required",
        (v) => v.length >= 3 || "Username must be at least 3 characters",
        (v) =>
          /^[a-zA-Z0-9._]+$/.test(v) ||
          "Username must contain only letters, numbers, periods(.) and underscores(_)",
      ],
      passwordRules: [
        (v) => !!v || "Password is required",
        (v) => (v && v.length >= 8) || "Password must be at least 8 characters",
      ],
    };
  },
  methods: {
    async signup() {
      try {
        this.submitting = true;
        const res = await this.$axios.$post("/auth/register", {
          email: this.email,
          password: this.password,
          username: this.username,
          name: this.name,
        });
        this.$store.commit("setSignupEmail", this.email);
        this.$router.push("/verify-email");
      } catch (err) {
        this.$toast.error(err.response.data.message);
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
