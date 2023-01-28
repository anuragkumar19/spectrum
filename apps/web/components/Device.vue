<template>
  <v-card class="my-4">
    <v-card-text>
      <h3 v-if="device.geo">
        <v-icon>mdi-map-marker</v-icon> {{ device.geo.city }}
        {{ device.geo.region }} {{ device.geo.country }}
      </h3>
      <h3>        
        <v-icon>mdi-map-marker</v-icon> Failed to Detected
      </h3>
      <div class="pl-7">
        <span style="color: green">
          {{ activeText }}
        </span>
        <h4>
          {{
            device.clientInfo.device &&
            `${device.clientInfo.device.type} ${device.clientInfo.device.vendor} ${device.clientInfo.device.model}`
          }}
          {{ device.clientInfo.browser.name }}, {{ device.clientInfo.os.name }}
          {{ device.clientInfo.os.version }}
        </h4>
        <p class="mb-1">
          Ip: {{ device.ip }}
          <br />
          Logged in at: {{ new Date(device.createdAt).toLocaleString() }}
        </p>
      </div>
      <div style="text-align: right">
        <v-btn color="red" dark @click="dialog = true" small>
          <v-icon left dark>mdi-logout</v-icon>
          Logout
        </v-btn>
      </div>
    </v-card-text>
    <v-dialog
      v-model="dialog"
      transition="dialog-top-transition"
      max-width="600"
      :persistent="submitting"
    >
      <v-card :loading="submitting">
        <v-toolbar color="primary" dark>Enter Password to Logout</v-toolbar>
        <v-card-text class="mt-6">
          <v-form v-model="valid">
            <v-text-field
              v-model="password"
              :rules="passwordRules"
              label="Password"
              type="password"
              required
              outlined
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
  </v-card>
</template>
<script>
export default {
  name: "Device",
  props: {
    device: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      dialog: false,
      activeText: "",
      valid: false,
      password: "",
      passwordRules: [(v) => !!v || "Password is required"],
      submitting: false,
    };
  },
  methods: {
    async delete() {
      this.loading = true;
      await this.$axios.delete(`/user/devices/${this.device._id}`);
      this.$emit("delete");
      this.loading = false;
    },
    jwtDecode(t) {
      let token = {};
      token.raw = t;
      token.header = JSON.parse(window.atob(t.split(".")[0]));
      token.payload = JSON.parse(window.atob(t.split(".")[1]));
      return token;
    },
    async logout() {
      try {
        this.submitting = true;

        const res = await this.$axios.post(`/auth/revoke/${this.device._id}`, {
          password: this.password,
        });

        this.$emit("refetch");
        this.$toast.success(res.data.message);
        this.dialog = false;

        if (this.activeText === "Active Now") {
          this.$auth.logout();
        }
      } catch (err) {
        this.$toast.error(err.response.data.message);
      } finally {
        this.submitting = false;
      }
    },
  },
  beforeMount() {
    this.activeText =
      this.jwtDecode(this.$auth.strategy.refreshToken.get()).payload
        .tokenVersion === this.device.token
        ? "Active Now"
        : "";
  },
};
</script>
