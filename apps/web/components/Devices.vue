<template>
  <div>
    <h1>Where you logged in</h1>
    <div class="text-center" v-if="$fetchState.pending">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <div style="text-align: right">
      <v-btn
        dark
        @click="dialog = true"
        color="red"
        v-if="!$fetchState.pending"
      >
        <v-icon dark left>mdi-logout</v-icon>
        Logout from all devices
      </v-btn>
    </div>
    <Device
      @refetch="$fetch"
      v-for="device in devices"
      :key="device._id"
      :device="device"
    />
    <v-dialog
      v-model="dialog"
      transition="dialog-top-transition"
      max-width="600"
      :persistent="submitting"
    >
      <v-card :loading="submitting">
        <v-toolbar color="primary" dark
          >Enter Password to Logout from all devices</v-toolbar
        >
        <v-card-text class="mt-6">
          <v-form v-model="valid">
            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              required
              outlined
              :rules="passwordRules"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-spacer></v-spacer>
          <v-btn
            color="red"
            :dark="!(submitting || !valid)"
            :loading="submitting"
            :disabled="submitting || !valid"
            @click="logout"
          >
            <v-icon left dark> mdi-logout </v-icon>
            Logout
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="dialog = false"
            :disabled="submitting"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  name: "Devices",
  data() {
    return {
      devices: [],
      dialog: false,
      password: "",
      valid: false,
      submitting: false,
      passwordRules: [(v) => !!v || "Password is required"],
    };
  },
  async fetch() {
    this.devices = (await this.$axios.get("/user/devices")).data.devices;
  },
  methods: {
    async logout() {
      if (
        confirm(
          "Are you sure you want to logout from all devices(including current device)?"
        )
      ) {
        try {
          this.submitting = true;
          const res = await this.$axios.post("/auth/revoke", {
            password: this.password,
          });

          this.$toast.success(res.data.message);
          await this.$auth.logout();
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
