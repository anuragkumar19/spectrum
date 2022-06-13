<template>
  <main>
    <div class="cover">
      <div
        class="profile-image elevation-5"
        :style="`background: url(${$auth.user.avatar}) no-repeat center center/cover`"
      ></div>
    </div>
    <div class="header-cont">
      <div>
        <h1 class="name">{{ $auth.user.name }}</h1>
        <p class="username">@{{ $auth.user.username }}</p>
      </div>
      <div>
        <v-btn color="primary" to="/profile/edit" nuxt elevation="0">
          <v-icon left dark>mdi-pencil</v-icon>
          Edit Profile
        </v-btn>
      </div>
    </div>
    <template v-if="$auth.user.bio">
      <h1>Bio</h1>
      <v-divider></v-divider>
      <p>
        {{ $auth.user.bio }}
      </p>
    </template>
    <h1 class="mt-10 pl-2">Account Details</h1>
    <v-card>
      <v-card-text>
        <h3>Email : {{ $auth.user.email }}</h3>
        <h3>
          Account Created At :
          {{ new Date($auth.user.createdAt).toLocaleDateString() }}
        </h3>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" to="/settings" nuxt elevation="0">
          <v-icon left dark>mdi-cog</v-icon>
          Go to Settings
        </v-btn>
        <v-btn
          class="ml-4"
          color="red"
          @click="logout"
          elevation="0"
          :loading="loggingOut"
          dark
        >
          <v-icon left dark> mdi-logout </v-icon>
          Logout
        </v-btn>
      </v-card-actions>
    </v-card>
  </main>
</template>

<script>
export default {
  name: "ProfilePage",
  head: {
    title: "Your Profile",
  },
  data() {
    return {
      loggingOut: false,
    };
  },
  methods: {
    logout() {
      this.loggingOut = true;
      this.$auth.logout();
    },
  },
};
</script>
<style scoped>
.cover {
  background: url("/profile-cover.svg") no-repeat center center/cover;
  height: 50vh;
  max-height: 300px;
  width: 100%;
  border-radius: 50px;
  position: relative;
}

.profile-image {
  height: 200px;
  width: 200px;
  border-radius: 50%;
  position: absolute;
  bottom: -100px;
  left: 50px;
  border: #fff solid 2px;
}

.header-cont {
  margin-left: 260px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 30px;
}

.name {
  font-size: 3rem;
  margin-bottom: 0;
  line-height: 1.2;
}

.username {
  font-size: 1rem;
  color: rgb(133, 133, 133);
  padding-left: 5px;
}

.email {
  font-size: 1rem;
  color: #303030;
  text-align: center;
}

@media (max-width: 700px) {
  .profile-image {
    left: calc(50% - 100px);
  }

  .header-cont {
    text-align: center;
    margin-top: 120px;
    margin-left: 0;
    display: flex;
    align-items: center;
    padding-right: 0;
    flex-direction: column;
    justify-content: center;
  }
}
</style>
