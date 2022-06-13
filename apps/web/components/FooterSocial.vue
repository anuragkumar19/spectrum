<template>
  <v-footer dark padless>
    <v-card class="flex" flat tile>
      <v-card-title class="primary">
        <strong class="subheading"
          >Get connected with us on social networks!</strong
        >

        <v-spacer></v-spacer>

        <v-btn
          class="mx-4"
          dark
          icon
          href="https://facebook.com/anuragkumar.dhoni"
          target="_blank"
        >
          <v-icon size="24px"> mdi-facebook </v-icon>
        </v-btn>
        <v-btn
          class="mx-4"
          dark
          icon
          href="https://instagram.com/anurag.web.dev"
          target="_blank"
        >
          <v-icon size="24px"> mdi-instagram </v-icon>
        </v-btn>
        <v-btn
          class="mx-4"
          dark
          icon
          href="https://github.com/anuragkumar19"
          target="_blank"
        >
          <v-icon size="24px"> mdi-github </v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="py-2 white--text text-center">
        &copy;
        {{ new Date().getFullYear() }} — <strong>SPECTRUM</strong>
      </v-card-text>
    </v-card>
  </v-footer>
</template>
