<template>
  <v-app-bar flat>
    <v-toolbar-title> SPECTRUM </v-toolbar-title>

    <v-spacer></v-spacer>

    <v-btn nuxt text to="/" elevation="0"
      ><v-icon left dark> mdi-home </v-icon> Home
    </v-btn>
    <template v-if="!$auth.loggedIn">
      <v-btn color="success" nuxt text to="/login" elevation="0">
        Log in
      </v-btn>
      <v-btn color="primary" nuxt text to="/signup" elevation="0">
        Sign Up
      </v-btn>
    </template>
    <template v-else>
      <v-btn icon nuxt to="/profile">
        <v-avatar size="36">
          <img :src="$auth.user.avatar" :alt="$auth.user.name" />
        </v-avatar>
      </v-btn>
    </template>
  </v-app-bar>
</template>

<script>
export default {
  name: "Navbar",
};
</script>

<style scoped></style>
