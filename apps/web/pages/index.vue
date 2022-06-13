<template>
  <div>
    Hello!
    <v-switch
      v-model="$vuetify.theme.dark"
      hint="This toggles the global state of the Vuetify theme"
      inset
      label="Vuetify Theme Dark"
      persistent-hint
    ></v-switch>
  </div>
</template>

<script>
export default {
  name: "IndexPage",
  head: {
    title: "Home",
  },
};
</script>
