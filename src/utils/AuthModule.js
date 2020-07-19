//import axios from '../../utils/axios-instance';
import {
  AUTH_REQUEST, AUTH_REFRESH_REQUEST, AUTH_ERROR, AUTH_SUCCESS, AUTH_LOGOUT,
  AUTH_AUTHENTICATED, AUTH_REFRESHING, AUTH_AUTHENTICATING, AUTH_NOTAUTHENTICATED,
  AUTH_TOKENAVAILABLE,
  AUTH_INIT
} from './AuthActions';

const state = {
  token: null,
  status: AUTH_NOTAUTHENTICATED,
  hasLoadedOnce: false
}

const getters = {
  isAuthenticated: state => state.status != AUTH_NOTAUTHENTICATED,
  isAuthenticating: state => state.status === AUTH_AUTHENTICATING || state.status === AUTH_TOKENAVAILABLE,
  authStatus: state => state.status
}

function saveToLocalStorage(token, refreshTuple, apiBaseUrl) {
  var cookie = { 'userToken': token, 'refreshToken': refreshTuple.item2, 'refreshSessionIdentifier': refreshTuple.item1, 'tokenExpires': (Date.now() + 1000 * 20) }
  localStorage.setItem(apiBaseUrl + '_session', JSON.stringify(cookie))
  return
}

function loadFromLocalStorage(apiBaseUrl) {
  let sessionCookie = localStorage.getItem(apiBaseUrl + '_session')
  if (sessionCookie != null) {
    return JSON.parse(sessionCookie)
  } else return null
}

function removeFromLocalStorage(apiBaseUrl) {
  localStorage.removeItem(apiBaseUrl + '_session')
}

function getInitalStatus(apiBaseUrl) {
  if (loadFromLocalStorage(apiBaseUrl) != null) {
    return AUTH_TOKENAVAILABLE
  }
  else return AUTH_NOTAUTHENTICATED
}

function getInitalToken(apiBaseUrl) {
  let cookie = loadFromLocalStorage(apiBaseUrl)
  if (cookie != null) {
    return cookie.userToken
  }
  else return ''
}

const actions = {
  [AUTH_INIT]: ({ commit, rootGetters }) => {
    commit(AUTH_INIT);
    var initialStatus = getInitalStatus(rootGetters.apiBaseUrl);
    var initialToken = getInitalToken(rootGetters.apiBaseUrl);
    state.token = initialToken;
    commit(initialStatus);
    //if (initialStatus === AUTH_TOKENAVAILABLE) dispatch(AUTH_REFRESH_REQUEST, null)
  },
  [AUTH_REQUEST]: ({ commit, rootGetters }, payload) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_REQUEST)
      var url = rootGetters.apiBaseUrl + "/token";

      payload.axios.post(url, payload.body)
        .then(resp => {
          saveToLocalStorage(resp.data.token, resp.data.refreshTuple, rootGetters.apiBaseUrl)
          // Here set the header of your ajax library to the token value.
          // example with axios
          payload.axios.defaults.headers.common = {
            'Authorization': 'Bearer ' + resp.data.token
          };
          commit(AUTH_SUCCESS, resp)
          resolve(resp)
        })
        .catch(err => {
          commit(AUTH_ERROR, err)
          removeFromLocalStorage(rootGetters.apiBaseUrl)
          reject(err)
        })
    })
  },
  [AUTH_REFRESH_REQUEST]: ({ commit, rootGetters }, payload) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_REFRESH_REQUEST)
      var url = rootGetters.apiBaseUrl + "/token/refresh"
      let cookie = loadFromLocalStorage(rootGetters.apiBaseUrl)
      var currentToken = cookie.userToken
      var currentRefreshToken = cookie.refreshToken
      var currentRefreshSessionIdentifier = cookie.refreshSessionIdentifier
      var body = { token: currentToken, refreshToken: currentRefreshToken, refreshSessionIdentifier: currentRefreshSessionIdentifier }
      payload.axios.post(url, JSON.stringify(body))
        .then(resp => {
          saveToLocalStorage(resp.data.token, resp.data.refreshTuple, rootGetters.apiBaseUrl)
          // Here set the header of your ajax library to the token value.
          // example with axios
          payload.axios.defaults.headers.common = {
            'Authorization': 'Bearer ' + resp.data.token
          };
          commit(AUTH_SUCCESS, resp)
          let config = payload.errorConfig
          config.__isRetryRequest = true;
          config.headers.Authorization = 'Bearer ' + resp.data.token;
          payload.axios(config)
            .then(response => {
              resolve(response)
            })
        })
        .catch(err => {
          commit(AUTH_ERROR, err)
          console.error([AUTH_REFRESH_REQUEST] + ' Error on refresh.')
          console.log(err);
          removeFromLocalStorage(rootGetters.apiBaseUrl)
          reject(err)
        })
    })
  },
  [AUTH_LOGOUT]: ({ commit, rootGetters }, payload) => {
    return new Promise((resolve) => {
      commit(AUTH_LOGOUT)
      removeFromLocalStorage(rootGetters.apiBaseUrl)
      var url = rootGetters.apiBaseUrl + "/token/signout"
      payload.axios.post(url)
      resolve()
    })
  }
}

const mutations = {
  [AUTH_INIT]: (state) => {
    state.status = AUTH_AUTHENTICATING
  },
  [AUTH_REFRESHING]: (state) => {
    state.status = AUTH_AUTHENTICATING
  },
  [AUTH_REQUEST]: (state) => {
    state.status = AUTH_AUTHENTICATING
  },
  [AUTH_REFRESH_REQUEST]: (state) => {
    state.status = AUTH_AUTHENTICATING
  },
  [AUTH_SUCCESS]: (state, resp) => {
    state.status = AUTH_AUTHENTICATED
    state.token = resp.data.token
    state.hasLoadedOnce = true
  },
  [AUTH_ERROR]: (state) => {
    state.status = AUTH_NOTAUTHENTICATED
    state.hasLoadedOnce = true

  },
  [AUTH_LOGOUT]: (state) => {
    state.token = ''
    state.status = AUTH_NOTAUTHENTICATED
  },
  [AUTH_TOKENAVAILABLE]: (state) => {
    state.status = AUTH_TOKENAVAILABLE
  },
  [AUTH_NOTAUTHENTICATED]: (state) => {
    state.status = AUTH_NOTAUTHENTICATED
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  namespaced: true
}
