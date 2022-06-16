<template>
  <v-row justify="center" align="center" class="py-10 px-5">
    <v-card width="90%" max-width="600px" elevation="0" outlined>
      <v-card-text class="py-10 px-5">
        <v-container>
          <h1 class="mb-7">Change Password</h1>
          <v-form v-model="valid">
            <v-text-field
              label="Old Password"
              required
              v-model="oldPassword"
              :rules="oldPasswordRules"
              type="password"
              outlined
            ></v-text-field>

            <v-text-field
              label="New Password"
              required
              v-model="newPassword"
              :rules="newPasswordRules"
              type="password"
              outlined
            ></v-text-field>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text nuxt to="/settings">
          Back to Setting
        </v-btn>
        <v-btn
          color="blue darken-1"
          text
          :disabled="!valid || submitting"
          :loading="submitting"
          @click="updatePassword"
        >
          Update
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-row>
</template>

<script>
export default {
  name: "PasswordSettingPage",
  head: {
    title: "Change Password",
  },
  data: () => ({
    oldPassword: "",
    newPassword: "",
    submitting: false,
    valid: false,
    oldPasswordRules: [(v) => !!v || "Old Password is required"],
    newPasswordRules: [
      (v) => !!v || "New Password is required",
      (v) => v.length >= 8 || "Password must be at least 8 characters",
    ],
  }),
  methods: {
    async updatePassword() {
      try {
        this.submitting = true;

        await this.$axios.put("/user/password", {
          oldPassword: this.oldPassword,
          newPassword: this.newPassword,
        });

        this.$toast.success("Password updated successfully");

        this.$router.push("/settings");
      } catch (err) {
        this.$toast.error(err.response.data.message);
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
