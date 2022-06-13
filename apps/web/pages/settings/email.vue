<template>
  <v-row justify="center" align="center" class="py-10 px-5">
    <v-card width="90%" max-width="600px" elevation="0" outlined>
      <v-card-text class="py-10 px-5">
        <v-container>
          <h1 class="mb-7">Email Settings</h1>
          <h3>Primary Email : {{ $auth.user.email }}</h3>
          <v-divider class="my-3"></v-divider>
          <h3>
            Secondary Email
            {{ $auth.user.secondaryEmail && `: ${$auth.user.secondaryEmail}` }}
          </h3>
          <v-btn
            class="mt-3 mr-3"
            color="primary"
            elevation="0"
            v-if="!$auth.user.secondaryEmail"
            @click="dialog = true"
          >
            <v-icon left dark> mdi-email-plus </v-icon>
            Add Email
          </v-btn>
          <v-btn
            elevation="0"
            class="mt-3 mr-3"
            color="primary"
            v-if="
              $auth.user.secondaryEmail && !$auth.user.isSecondaryEmailVerified
            "
            @click="askOtp"
            :disabled="submitting"
            :loading="submitting"
          >
            <v-icon left dark> mdi-email-check </v-icon>
            Verify Email
          </v-btn>
          <v-btn
            elevation="0"
            class="mt-3 mr-3"
            color="primary"
            v-if="$auth.user.secondaryEmail"
            @click="dialog3 = true"
            :disabled="submitting"
            :loading="submitting"
          >
            <v-icon left dark> mdi-pencil </v-icon>
            Edit Email
          </v-btn>
          <v-btn
            elevation="0"
            class="mt-3 mr-3"
            color="red"
            :dark="!submitting"
            v-if="$auth.user.secondaryEmail"
            @click="removeSecondaryEmail"
            :disabled="submitting"
            :loading="submitting"
          >
            <v-icon left dark> mdi-email-remove </v-icon>
            Remove Email
          </v-btn>
          <v-btn
            elevation="0"
            class="mt-3 mr-3"
            color="success"
            :dark="!submitting"
            v-if="
              $auth.user.secondaryEmail && $auth.user.isSecondaryEmailVerified
            "
            @click="dialog4 = true"
            :disabled="submitting"
            :loading="submitting"
          >
            <v-icon left dark> mdi-email-outline </v-icon>
            Make Primary Email
          </v-btn>
        </v-container>
      </v-card-text>
    </v-card>

    <!-- Add Email Dialog -->
    <v-dialog
      v-model="dialog"
      transition="dialog-top-transition"
      max-width="600"
      :persistent="submitting"
    >
      <v-card :loading="submitting">
        <v-toolbar color="primary" dark>Add secondary Email</v-toolbar>
        <v-card-text class="mt-6">
          <v-form v-model="valid">
            <v-text-field
              v-model="email"
              :rules="emailRules"
              label="Email"
              required
              outlined
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            :loading="submitting"
            :disabled="submitting || !valid"
            @click="addEmail"
          >
            <v-icon left dark> mdi-email-plus </v-icon>
            Add Email
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
    <!-- Update Email Dialog -->
    <v-dialog
      v-model="dialog3"
      transition="dialog-top-transition"
      max-width="600"
      :persistent="submitting"
    >
      <v-card :loading="submitting">
        <v-toolbar color="primary" dark>Update secondary Email</v-toolbar>
        <v-card-text class="mt-6">
          <v-form v-model="valid">
            <v-text-field
              v-model="email2"
              :rules="emailRules"
              label="Email"
              required
              outlined
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            :loading="submitting"
            :disabled="
              submitting || !valid || email2 === $auth.user.secondaryEmail
            "
            @click="updateEmail"
          >
            <v-icon left dark> mdi-pencil </v-icon>
            Update Email
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="dialog3 = false"
            :disabled="submitting"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Verify Email Dialog -->
    <v-dialog
      v-model="dialog2"
      transition="dialog-top-transition"
      max-width="600"
      :persistent="submitting"
    >
      <v-card elevation="0" outlined class="w-100" :loading="submitting">
        <v-card-text class="text-center py-10 px-4">
          <h4 class="mb-6" style="color: #000; font-weight: 400">
            A OTP has been sent to your email
            <code>{{ $auth.user.secondaryEmail }}</code> to verify your email
          </h4>
          <v-form>
            <v-container>
              <v-otp-input
                length="6"
                plain
                type="number"
                v-model="otp"
                @input="validate"
              ></v-otp-input>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            :loading="submitting"
            :disabled="submitting || !valid2"
            @click="verifyEmail"
          >
            <v-icon left dark> mdi-email-check </v-icon>
            Verify Email
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="dialog2 = false"
            :disabled="submitting"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Make primary Email Dialog -->
    <v-dialog
      v-model="dialog4"
      transition="dialog-top-transition"
      max-width="600"
      :persistent="submitting"
    >
      <v-card :loading="submitting">
        <v-toolbar color="primary" dark>Make secondary email primary</v-toolbar>
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
            color="primary"
            :loading="submitting"
            :disabled="submitting || !valid"
            @click="makePrimary"
          >
            <v-icon left dark> mdi-email-outline </v-icon>
            Make Primary
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="dialog4 = false"
            :disabled="submitting"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  name: "EmailSettingPage",
  head: {
    title: "Email Settings",
  },
  data: ({ $auth }) => ({
    submitting: false,
    valid: false,
    dialog: false,
    email: "",
    dialog3: false,
    dialog4: false,
    password: "",
    email2: $auth.user.secondaryEmail,
    emailRules: [
      (v) => !!v || "Email is required",
      (v) => /.+@.+\..+/.test(v) || "Email must be valid",
    ],
    passwordRules: [
      (v) => !!v || "Password is required",
      (v) => (v && v.length >= 8) || "Password must be at least 8 characters",
    ],
    valid2: false,
    otp: "",
    dialog2: false,
  }),
  methods: {
    async addEmail() {
      try {
        this.submitting = true;

        const res = await this.$axios.post("/user/secondary-email", {
          email: this.email,
        });

        await this.$auth.fetchUser();
        this.$toast.success(res.data.message);
        this.dialog = false;
      } catch (err) {
        this.$toast.error(err.response.data.message);
      } finally {
        this.submitting = false;
      }
    },
    validate() {
      if (this.otp.length === 6) {
        this.valid2 = true;
      } else {
        this.valid2 = false;
      }
    },
    async askOtp() {
      this.dialog2 = true;

      try {
        await this.$axios.post("/user/secondary-email/otp");
      } catch (err) {
        this.$toast.error(err.response.data.message);
      }
    },
    async verifyEmail() {
      try {
        this.submitting = true;

        const res = await this.$axios.post("/user/secondary-email/verify", {
          otp: this.otp,
        });

        await this.$auth.fetchUser();
        this.dialog2 = false;
        this.$toast.success(res.data.message);
      } catch (err) {
        this.$toast.error(err.response.data.message);
      } finally {
        this.submitting = false;
      }
    },
    async removeSecondaryEmail() {
      try {
        this.submitting = true;

        const res = await this.$axios.delete("/user/secondary-email");

        await this.$auth.fetchUser();
        this.$toast.success(res.data.message);
      } catch (err) {
        this.$toast.error(err.response.data.message);
      } finally {
        this.submitting = false;
      }
    },
    async updateEmail() {
      try {
        this.submitting = true;

        const res = await this.$axios.put("/user/secondary-email", {
          email: this.email2,
        });

        await this.$auth.fetchUser();
        this.$toast.success(res.data.message);
        this.dialog3 = false;
      } catch (err) {
        this.$toast.error(err.response.data.message);
      } finally {
        this.submitting = false;
      }
    },
    async makePrimary() {
      try {
        this.submitting = true;

        const res = await this.$axios.put("/user/email", {
          password: this.password,
        });

        await this.$auth.fetchUser();
        this.$toast.success(res.data.message);
        this.dialog4 = false;
      } catch (err) {
        this.$toast.error(err.response.data.message);
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
