import { AUTH_REQUEST, AUTH_INIT, AUTH_AUTHENTICATED, AUTH_TOKENAVAILABLE, AUTH_REFRESH_REQUEST, AUTH_LOGOUT } from "./AuthActions.js"
import axios from "axios";

const AuthPlugin = {
  install(Vue, options) {
    const store = options.store;
    const authNS = store.state.authModuleNamespace;
    //const apiBaseUrl = store.apiBaseUrl;

    axios.defaults.headers['Content-Type'] = 'application/json';

    function buildRequest(request) {
      return authNS + "/" + request;
    }

    // creates a instance method that can be used inside of a Vue component
    Vue.prototype.$libauth = {
      getAuthentificationState() {
        var authState = store.getters[authNS + "/authStatus"];
        return authState;
      },
      isAuthenticated() {
        var isAuthenticated = store.getters[authNS + "/isAuthenticated"];
        return isAuthenticated;
      },
      isAuthenticating() {
        var isAuthenticating = store.getters[authNS + "/isAuthenticating"];
        return isAuthenticating;
      },
      init() {
        return store.dispatch(buildRequest(AUTH_INIT));
      },
      login(username, password, group) {
        username;
        password;
        group;
        return store.dispatch(buildRequest(AUTH_REQUEST), { body: { username, password, group }, axios});
      },
      logout() {
        return store.dispatch(buildRequest(AUTH_LOGOUT), { axios })
      },
      info() {
        var url = store.getters.apiBaseUrl + "/info";
        return this.getFromUrl(url);
      },
      getCurrentUserProfile() {
        var url = store.getters.apiBaseUrl + "/token/profile";
        return this.getFromUrl(url)
      },
      async getFromUrl(url) {
        var result = await axios.get(url)
        .catch (err => {
          this.handleAuthError(err);
        });
        return result;
      },
      async postToUrl(url, body) {
        var result = await axios.post(url, body)
        .catch (err => {
          this.handleAuthError(err);
        });
        return result
      },
      async putToUrl(url, body) {
        var result = await axios.put(url, body)
        .catch (err => {
          this.handleAuthError(err);
        });
        return result
      },
      async deleteFromUrl(url) {
        var result = await axios.delete(url)
        .catch (err => {
          this.handleAuthError(err);
        });
        return result
      },
      async handleAuthError(err) {
        var authStatus = store.getters[authNS + "/authStatus"];
        if (err.response.status === 401 && err.config && !err.config.__isRetryRequest && 
          (authStatus === AUTH_AUTHENTICATED || authStatus === AUTH_TOKENAVAILABLE )) {
            let data = store.dispatch(buildRequest(AUTH_REFRESH_REQUEST), { errorConfig: err.config, axios });
            return data;
          }
        throw err;
      }
    }
  }
}

export default AuthPlugin;
