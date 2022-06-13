<template>
  <v-app
    style="
      background: url('/blob.svg') no-repeat center center/cover;
      overflow: auto;
    "
  >
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>
<script>
export default {
  name: "AuthLayout",
};
</script>
<style>
html,
body {
  overflow: hidden !important;
}

::-webkit-scrollbar {
  width: 12px;
  height: 100%;
}

::-webkit-scrollbar-track {
  background: #303070;
  border-radius: 100vw;
  margin-block: 2px;
}

::-webkit-scrollbar-thumb {
  background: #6ccbed;
  border: 0.25em solid #1855cf;
  border-radius: 100vw;
}

::-webkit-scrollbar-thumb:hover {
  background: #6ccbed;
  border: 0.25em solid #303070;
  border-radius: 100vw;
}
</style>
