<template>
  <v-row justify="center" align="center" class="py-10 px-5">
    <v-card max-width="600px" elevation="0" outlined>
      <v-card-text class="py-10 px-5">
        <v-container>
          <h1 class="mb-7">Edit Profile</h1>
          <div
            class="profile-image elevation-5"
            :style="`background: url(${avatar}) no-repeat center center/cover`"
          >
            <div class="overlay" @click="selectImage">
              <v-icon class="camera-icon">mdi-camera</v-icon>
            </div>
          </div>
          <div
            v-if="avatar !== $auth.user.avatar"
            class="my-3"
            style="text-align: center"
          >
            <v-btn color="primary" elevation="0" @click="upload">
              <v-icon left dark>mdi-upload</v-icon>
              Upload
            </v-btn>
            <v-btn elevation="0" @click="() => (avatar = $auth.user.avatar)">
              <v-icon left dark>mdi-close</v-icon>
              Cancel
            </v-btn>
          </div>
          <v-form v-model="valid">
            <v-row>
              <input
                style="display: none"
                accept="image/*"
                type="file"
                @change="onFileChange"
                ref="fileInput"
              />
              <v-col cols="12">
                <v-text-field
                  label="Name"
                  required
                  v-model="name"
                  :rules="nameRules"
                  @input="isDataChanged"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Username"
                  required
                  v-model="username"
                  :rules="usernameRules"
                  @input="isDataChanged"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  label="Bio"
                  :rules="bioRules"
                  v-model="bio"
                  :counter="500"
                  @input="isDataChanged"
                  outlined
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text nuxt to="/profile">
          Back to Profile
        </v-btn>
        <v-btn
          color="blue darken-1"
          text
          :disabled="!(changed && valid)"
          :loading="submitting"
          @click="updateProfile"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog v-model="dialog" persistent width="300">
      <v-card>
        <v-card-text>
          Uploading...
          <v-progress-linear :value="progress"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  name: "EditProfilePage",
  head: {
    title: "Edit Profile",
  },
  data: ({ $auth }) => ({
    changed: false,
    avatar: $auth.user.avatar,
    username: $auth.user.username,
    name: $auth.user.name,
    bio: $auth.user.bio,
    valid: true,
    nameRules: [(v) => !!v || "Name is required"],
    usernameRules: [
      (v) => !!v || "Username is required",
      (v) => v.length >= 3 || "Username must be at least 3 characters",
      (v) =>
        /^[a-zA-Z0-9._]+$/.test(v) ||
        "Username must contain only letters, numbers, periods(.) and underscores(_)",
    ],
    bioRules: [
      (v) => v.length <= 500 || "Bio must be less than 500 characters",
    ],
    submitting: false,
    error: false,
    file: null,
    dialog: false,
    progress: 0,
  }),
  methods: {
    selectImage() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.click();
      }
    },
    onFileChange(e) {
      const file = e.target.files[0];

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image")) {
        this.$toast.error("File must be an image");
        return;
      }

      this.file = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    async upload() {
      if (this.file) {
        try {
          this.dialog = true;

          const formData = new FormData();
          formData.append("avatar", this.file);

          const res = await this.$axios.put("/user/avatar", formData, {
            headers: {
              "Content-Type": "form-data/multipart",
            },
            onUploadProgress: (progressEvent) => {
              const { loaded, total } = progressEvent;
              this.progress = Math.floor((loaded * 100) / total);
            },
          });

          await this.$auth.fetchUser();
          this.avatar = this.$auth.user.avatar;
          this.$toast.success("Avatar updated successfully!");
        } catch (err) {
          this.$toast.error(err.response.data.message);
        } finally {
          this.file = null;
          this.dialog = false;
        }
      }
    },
    isDataChanged() {
      this.changed =
        this.username !== this.$auth.user.username ||
        this.name !== this.$auth.user.name ||
        this.bio !== this.$auth.user.bio;
    },
    async updateProfile() {
      this.submitting = true;
      try {
        if (this.name !== this.$auth.user.name) {
          await this.$axios.$put("/user/name", { name: this.name });
        }
        if (this.username !== this.$auth.user.username) {
          await this.$axios.$put("/user/username", { username: this.username });
        }
        if (this.bio !== this.$auth.user.bio) {
          await this.$axios.$put("/user/bio", { bio: this.bio });
        }
      } catch (err) {
        this.$toast.error(err.response.data.message);
        this.error = true;
      } finally {
        await this.$auth.fetchUser();
        this.submitting = false;
        if (!this.error) {
          this.$toast.success("Profile updated successfully");
          this.$router.push("/profile");
        } else {
          this.error = false;
        }
      }
    },
  },
};
</script>
<style scoped>
.profile-image {
  height: 200px;
  width: 200px;
  border-radius: 50%;
  border: #fff solid 2px;
  position: relative;
  margin: auto;
  margin-bottom: 1rem;
}

.profile-image .overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0);
  transition: all 0.3s ease-in-out;
}

.camera-icon {
  font-size: 2rem;
  color: #fff;
  opacity: 0;
}

.profile-image .overlay:hover {
  background: rgba(0, 0, 0, 0.5);
  display: flex;
}

.profile-image .overlay:hover .camera-icon {
  opacity: 1;
}
</style>
