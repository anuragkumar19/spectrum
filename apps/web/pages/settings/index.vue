<template>
  <main>
    <h1 style="text-align: center">Settings</h1>
    <div class="card-cont">
      <nuxt-link to="/profile/edit">
        <v-card class="link-card">
          <v-card-text class="py-5 px-8" style="text-align: center">
            <img class="link-card-img" src="/resume.png" />
            <h3>Edit Profile</h3>
          </v-card-text>
        </v-card>
      </nuxt-link>
      <nuxt-link to="/settings/email">
        <v-card class="link-card">
          <v-card-text class="py-5 px-8" style="text-align: center">
            <img class="link-card-img" src="/email.png" />
            <h3>Email(s)</h3>
          </v-card-text>
        </v-card>
      </nuxt-link>
      <nuxt-link to="/settings/password">
        <v-card class="link-card">
          <v-card-text class="py-5 px-8" style="text-align: center">
            <img class="link-card-img" src="/key.png" />
            <h3>Password</h3>
          </v-card-text>
        </v-card>
      </nuxt-link>
      <nuxt-link to="/settings/login-activity">
        <v-card class="link-card">
          <v-card-text class="py-5 px-8" style="text-align: center">
            <img class="link-card-img" src="/lock.png" />
            <h3>Login Activity</h3>
          </v-card-text>
        </v-card>
      </nuxt-link>
      <nuxt-link to="/settings/mfa">
        <v-card class="link-card">
          <v-card-text class="py-5 px-8" style="text-align: center">
            <img class="link-card-img" src="/shield.png" />
            <h3>MFA</h3>
          </v-card-text>
        </v-card>
      </nuxt-link>
      <v-card class="link-card" @click="$auth.logout()">
        <v-card-text class="py-5 px-8" style="text-align: center">
          <img class="link-card-img" src="/logout.png" />
          <h3>Logout</h3>
        </v-card-text>
      </v-card>
    </div>
  </main>
</template>
<script>
export default {
  name: "SettingsPage",
  head: {
    title: "Settings",
  },
};
</script>

<style scoped>
.card-cont {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
.link-card {
  margin: 0 auto;
  width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0;
  margin-right: 20px;
  margin-bottom: 20px;
}

.link-card img {
  width: 100%;
}
</style>
