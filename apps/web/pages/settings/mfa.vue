<template>
  <main>
    <v-card outlined elevation="0">
      <v-card-text class="py-8 px-5">
        <div style="text-align: center">
          <img src="/lock2.png" alt="" style="width: 100px" />
          <h2 class="my-3" v-if="$auth.user.mfaTypes.length === 0">
            Two factor authentication is not enabled yet.
          </h2>
          <h2 v-else>Two factor authentication is enabled.</h2>
          <p>
            Two-factor authentication adds an additional layer of security to
            your account by requiring more than just a password to sign in.
          </p>
        </div>
        <v-card elevation="1">
          <v-card-text>
            <h3>Email OTP based MFA</h3>
            <p>
              You can use email OTP based MFA to add an additional layer of
              security to your account. Every time you sign in, you will be
              prompted to enter a 6-digit code. Which you will receive via
              email.
            </p>
            <v-btn
              v-if="$auth.user.mfaTypes.includes('emailOtp')"
              color="red"
              @click="disableMfa('emailOtp')"
              dark
              >Disable</v-btn
            >

            <v-btn v-else color="primary" @click="enableMfa('emailOtp')"
              >Enable</v-btn
            >
          </v-card-text>
        </v-card>
        <v-card elevation="1" class="my-5">
          <v-card-text>
            <h3>Google authenticator based MFA</h3>
            <p>
              You can use Google authenticator based MFA to add an additional
              layer of security to your account. Every time you sign in, you
              will be prompted to enter a 6-digit code. Which you will generated
              via Google authenticator.
            </p>
            <v-btn
              v-if="$auth.user.mfaTypes.includes('authenticator')"
              color="red"
              @click="disableMfa('authenticator')"
              dark
            >
              Disable</v-btn
            >

            <v-btn v-else color="primary" @click="enableMfa('authenticator')"
              >Enable</v-btn
            >
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
    <v-dialog
      v-model="dialog"
      transition="dialog-top-transition"
      max-width="600"
      :persistent="submitting"
    >
      <v-card :loading="submitting">
        <v-toolbar color="primary" dark>Enable MFA</v-toolbar>
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
            @click="enableMfa"
          >
            <v-icon left dark> mdi-lock </v-icon>
            Enable
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
    <v-dialog
      v-model="dialog2"
      transition="dialog-top-transition"
      max-width="600"
      :persistent="submitting"
    >
      <v-card :loading="submitting">
        <v-toolbar color="primary" dark>Enable Google authentication</v-toolbar>
        <v-card-text class="mt-6">
          <div style="text-align: center">
            <h3>Scan the QR code with your Google Authenticator app</h3>
            <img :src="qrcode" alt="" style="width: 100%" class="my-2" />
            <p>Or</p>
            Manually enter the secret: <strong>{{ secret }}</strong>
          </div>

          <v-form v-model="valid2">
            <v-form>
              <v-container>
                <v-otp-input
                  length="6"
                  plain
                  type="number"
                  v-model="code"
                  @input="validate"
                ></v-otp-input>
              </v-container>
            </v-form>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            :loading="submitting"
            :disabled="submitting || !valid2"
            @click="verify"
          >
            <v-icon left dark> mdi-lock </v-icon>
            Verify & Enable
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
    <v-dialog
      v-model="dialog3"
      transition="dialog-top-transition"
      max-width="600"
      :persistent="submitting"
    >
      <v-card :loading="submitting">
        <v-toolbar color="primary" dark>Disable MFA</v-toolbar>
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
            :loading="submitting"
            :disabled="submitting || !valid"
            @click="disableMfa"
            :dark="!(submitting || !valid)"
          >
            Disable
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
  </main>
</template>
<script>
export default {
  name: "MFASettingsPage",
  head: {
    title: "MFA Settings",
  },
  data() {
    return {
      dialog: false,
      dialog2: false,
      dialog3: false,
      submitting: false,
      password: "",
      code: "",
      type: "",
      qrcode: "",
      secret: "",
      valid: false,
      valid2: false,
      passwordRules: [(v) => !!v || "Password is required"],
    };
  },
  methods: {
    validate() {
      if (this.code.length === 6) {
        this.valid2 = true;
      } else {
        this.valid2 = false;
      }
    },
    async enableMfa(type) {
      if (!this.type) {
        this.type = type;
        this.dialog = true;
      } else {
        try {
          this.submitting = true;

          const res = await this.$axios.post("/auth/mfa/enable", {
            password: this.password,
            type: this.type,
          });

          if (this.type === "emailOtp") {
            await this.$auth.fetchUser();
            this.$toast.success(res.data.message);
          } else {
            this.qrcode = res.data.qrCode;
            this.secret = res.data.secret;
            this.dialog2 = true;
          }

          this.dialog = false;
        } catch (err) {
          this.$toast.error(err.response.data.message);
        } finally {
          this.submitting = false;
          this.type = "";
          this.password = "";
        }
      }
    },
    async verify() {
      try {
        this.submitting = true;
        const res = await this.$axios.post("/auth/mfa/verify", {
          token: this.code,
        });

        this.$toast.success(res.data.message);
        this.dialog2 = false;
        await this.$auth.fetchUser();
      } catch (err) {
        this.$toast.error(err.response.data.message);
      } finally {
        this.submitting = false;
      }
    },
    async disableMfa(type) {
      if (!this.type) {
        this.type = type;
        this.dialog3 = true;
      } else {
        try {
          this.submitting = true;
          const res = await this.$axios.post("/auth/mfa/disable", {
            type: this.type,
            password: this.password,
          });

          this.$toast.success(res.data.message);
          await this.$auth.fetchUser();
          this.dialog3 = false;
        } catch (err) {
          this.$toast.error(err.response.data.message);
        } finally {
          this.submitting = false;
          this.type = "";
        }
      }
    },
  },
};
</script>
