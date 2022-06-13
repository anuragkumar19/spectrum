export const state = () => ({
  signupEmail: "",
  resetEmail: "",
});

export const mutations = {
  setSignupEmail(state, email) {
    state.signupEmail = email;
  },
  setResetEmail(state, email) {
    state.resetEmail = email;
  },
};
