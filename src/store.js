import Vue from 'vue'
import Vuex from 'vuex'
import AuthModule from './utils/AuthModule'
import { AUTH_NOTAUTHENTICATED } from "./utils/AuthActions"

Vue.use(Vuex)

// get configuration from index.html
const configElement = document.getElementById('config');
const config = JSON.parse(configElement.innerHTML);

export default new Vuex.Store({
  modules: {
    AuthModule
  },
  state: {
    count: 0,
    apiBaseUrl: config.VUE_APP_API_BASE_URL,
    authStatus: AUTH_NOTAUTHENTICATED,
    authToken: null,
    authModuleNamespace: 'AuthModule',
    axiosInstance: null
  },
  mutations: {
    increment(state) {
      state.count++;
    },
    authStatus(state, authStatus) {
      state.authStatus = authStatus;
    },
    authToken(state, authToken) {
      state.authToken = authToken;
    },
    axiosInstance(state, axiosInstance) {
      state.axiosInstance = axiosInstance;
    }
  },
  getters: {
    apiBaseUrl: state => {
      return state.apiBaseUrl;
    },
    axiosInstance: state => {
      return state.axiosInstance;
    },
    authModuleNamespace: state => {
      return state.authModuleNamespace;
    }
  }
})