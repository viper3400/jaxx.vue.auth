<template>
  <div>
    <section class="section">
      <h1 class="title">Authentification Test Page</h1>
      <p data-test="auth-state">{{authStateString}}</p>
      <p date-test="auth-sever-version" v-if="info">Server Version{{info}}</p>
    </section>
    <section class="section" v-if="authStateString != 'AUTH_AUTHENTICATED'">
      <h1 class="title">Log In</h1>
      <div class="field">
        <label class="label">Username</label>
        <div class="control">
          <input class="input" type="text" v-model="username" data-test="auth-username"/>
        </div>
      </div>
      <div class="field">
        <label class="label">Password</label>
        <div class="control">
          <input class="input" type="password" v-model="password" data-test="auth-password"/>
        </div>
      </div>
    </section>
    <section class="section" v-if="authStateString == 'AUTH_AUTHENTICATED'">
      <h1 class="title">Post Request</h1>
      <div class="field">
        <label class="label">Url</label>
        <div class="control">
          <input class="input" type="text" v-model="url" data-test="auth-request-url"/>
        </div>
      </div>
      <div class="field">
        <label class="label">Body</label>
        <div class="control">
          <input class="input" type="text" v-model="body" data-test="auth-request-body"/>
        </div>
      </div>
      <div class="field is-grouped">
        <div class="control">
            <button class="button is-secondary" @click="onPostClick" data-test="auth-button-post">Post</button>
        </div>
        <div class="control">
            <button class="button is-secondary" @click="onGetClick" data-test="auth-button-get">Get</button>
        </div>
        <div class="control">
            <button class="button is-secondary" @click="onPutClick" data-test="auth-button-put">Put</button>
        </div>
        <div class="control">
            <button class="button is-secondary" @click="onDeleteClick" data-test="auth-button-delete">Delete</button>
        </div>
        <div class="control">
            <button class="button is-secondary" @click="onCancelClick" data-test="auth-button-cancel">Cancel</button>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="field is-grouped">
        <div class="control"  v-if="authStateString != 'AUTH_AUTHENTICATED'">
          <button class="button is-primary" @click="onLoginClick" data-test="auth-button-login">Log In</button>
        </div>
        <div class="control" v-if="authStateString == 'AUTH_AUTHENTICATED'">
          <button class="button is-primary" @click="onLogoutClick" data-test="auth-button-logout">Log Out</button>
        </div>
        <div class="control" v-if="authStateString == 'AUTH_AUTHENTICATED'">
          <button class="button is-primary" @click="onInfoClicked" data-test="auth-button-info">Info</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
//import axios from "../utils/axios-instance";

export default {
  name: "MainPage",
  data() {
    return {
      username: null,
      password: null,
      info: null,
      url: null,
      body: null,
      ctSource: null
    };
  },
  methods: {
    onLoginClick() {
      var group = "VG_Default";
      var username = this.username;
      var password = this.password;
      this.$libauth.login(username, password, group);
    },
    onInfoClicked() {
      this.$libauth.info().then(response => {
        this.info = response.data.ApiServerVersion;
      });
    },
    onLogoutClick() {
      this.$libauth.logout();
    },
    onPostClick() {
      this.ctSource = this.$libauth.getCancelToken().source();
      this.$libauth.postToUrl(this.url, this.body, this.ctSource.token);
    },
    onGetClick() {
      this.ctSource = this.$libauth.getCancelToken().source();
      this.$libauth.getFromUrl(this.url, this.ctSource.token);
    },
    onPutClick() {
      this.ctSource = this.$libauth.getCancelToken().source();
      this.$libauth.putToUrl(this.url, this.body, this.ctSource.token);
    },
    onDeleteClick() {
      this.ctSource = this.$libauth.getCancelToken().source();
      this.$libauth.deleteFromUrl(this.url, this.body, this.ctSource.token);
    },
    onCancelClick() {
      console.log(this.ctSource);
      this.ctSource.cancel('message is here');
    }
  },
  computed: {
    authStateString() {
      //return 'xx';
      //return this.$store.state.auth.status;
      return this.$libauth.getAuthentificationState();
    }
  },
  mounted () {
    this.$libauth.init()
    .then( () => this.$libauth.info().then(response => {
        this.info = response.data.ApiServerVersion;
      }));
  }
};
</script>