<template>
  <div>
    <section class="section">
      <h1 class="title">Authentification Test Page</h1>
      <p>{{authStateString}}</p>
      <p v-if="info">Server Version{{info}}</p>
    </section>
    <section class="section">
      <h1 class="title">Log In</h1>
      <div class="field">
        <label class="label">Username</label>
        <div class="control">
          <input class="input" type="text" v-model="username" />
        </div>
      </div>
      <div class="field">
        <label class="label">Password</label>
        <div class="control">
          <input class="input" type="password" v-model="password" />
        </div>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <button class="button is-primary" @click="onLoginClick">Log In</button>
        </div>
        <div class="control">
          <button class="button is-primary" @click="onInfoClicked">Info</button>
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
      info: null
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