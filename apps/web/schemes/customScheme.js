import { RefreshScheme } from "@nuxtjs/auth-next/dist/runtime";

export default class CustomScheme extends RefreshScheme {
  async login(endpoint) {
    if (!this.options.endpoints.login) {
      return;
    }

    // Ditch any leftover local tokens before attempting to log in
    this.$auth.reset({ resetInterceptor: false });

    // Add client id to payload if defined
    if (this.options.clientId) {
      endpoint.data.client_id = this.options.clientId;
    }

    // Add grant type to payload if defined
    if (this.options.grantType) {
      endpoint.data.grant_type = this.options.grantType;
    }

    // Add scope to payload if defined
    if (this.options.scope) {
      endpoint.data.scope = this.options.scope;
    }

    let response;

    if (endpoint.type === "mfa") {
      response = await this.$auth.request(
        { data: endpoint.data },
        this.options.endpoints.mfaLogin
      );
    } else {
      const res = await this.$auth.request(
        { data: endpoint.data },
        this.options.endpoints.login
      );

      if (res.data.mfaEnabled) {
        const err = new Error("MFA is enabled");
        err.response = res;

        throw err;
      }

      response = res;
    }

    // Update tokens
    this.updateTokens(response);

    // Initialize request interceptor if not initialized
    if (!this.requestHandler.interceptor) {
      this.initializeRequestInterceptor();
    }

    // Fetch user if `autoFetch` is enabled
    if (this.options.user.autoFetch) {
      await this.fetchUser();
    }

    return response;
  }
}
