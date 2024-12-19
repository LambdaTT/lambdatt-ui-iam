<template>
  <q-page :padding="false" class="flex flex-center bg-loginpage">
    <div class="row">
      <q-card square bordered class="shadow-1">
        <q-card-section>
          <div class="row">
            <h5 class="text-h5 text-center text-grey-8 q-my-md full-width"><img class="main-logo vertical-middle"
                alt="Logo ERP Agenciador" src="/resources/img/mqv-logo-horizontal.png" /></h5>
            <p class="text-grey-7 text-center full-width">Faça login para acessar o sistema.</p>
          </div>
        </q-card-section>

        <!-- Login Form -->
        <q-intersection v-show="showForgotPassForm == false" transition="jump-left">
          <q-card-section>
            <q-form>
              <InputField Label="E-mail" Icon="email" type="email" clearable v-model="input.ds_email"
                :Error="inputError.ds_email" @focus="inputError.ds_email = false"></InputField>
              <InputField Label="Senha" Icon="lock" type="password" clearable v-model="input.ds_password"
                :Error="inputError.ds_password" @focus="inputError.ds_password = false"></InputField>
            </q-form>
          </q-card-section>
          <q-card-section>
            <div class="q-px-sm">
              <q-btn icon="fas fa-sign-in-alt" color="primary" size="md" class="full-width" v-on:click="login()"
                label="Entrar" />
            </div>
          </q-card-section>
          <q-card-section class="text-center">
            <div class="row">
              <div class="col-6">
                <q-checkbox size="md" v-model="rememberMe" val="md" label="Manter Logado" />
              </div>
              <div class="col-6 q-pa-sm">
                <a href="javascript:void(0);" v-on:click="showForgotPassForm = true">
                  Esqueci a senha
                  <q-icon name="fas fa-chevron-right"></q-icon>
                </a>
              </div>
            </div>
          </q-card-section>
        </q-intersection>

        <!-- Forgot Pass Form -->
        <q-intersection v-show="showForgotPassForm == true" transition="jump-right">
          <q-card-section>
            <q-form>
              <InputField Label="Seu e-mail cadastrado" Icon="email" type="email" clearable v-model="recoveryEmail"
                :error="inputError.recoveryEmail" @focus="inputError.recoveryEmail = false"></InputField>
            </q-form>
          </q-card-section>
          <q-card-section>
            <div class="q-pa-sm">
              <q-btn icon="fas fa-paper-plane" color="primary" size="md" class="full-width" v-on:click="recoveryPass()"
                label="Recuperar Senha" />
            </div>
          </q-card-section>
          <q-card-section class="text-center">
            <div class="row">
              <div class="col-6 q-pa-sm">
                <a href="javascript:void(0);" v-on:click="showForgotPassForm = false">
                  <q-icon name="fas fa-chevron-left"></q-icon>
                  Voltar ao login
                </a>
              </div>
            </div>
          </q-card-section>
        </q-intersection>

      </q-card>
    </div>
  </q-page>
</template>

<script>
// Services:
import Permissions from '../../../services/permissions.js'

export default {
  name: 'pages-iam-auth-login',
  data() {
    return {
      showForgotPassForm: false,
      rememberMe: false,
      input: {
        'ds_email': null,
        'ds_password': null
      },
      inputError: {
        'ds_email': false,
        'ds_password': false
      },
      recoveryEmail: null
    }
  },

  created() {
    this.$emit('load', 'auth')

    this.$http.get('/api/auth/v1/logged-user')
      .then(() => {
        this.$router.push('/');
      })
      .catch(() => {
        if (localStorage.getItem('authtoken')) {
          return this.$http.post(`/api/auth/v1/login-token/${localStorage.getItem('authtoken')}`)
            .then((response) => {
              var cookieOptions = {
                expires: '30m',
                path: '/'
              };
              localStorage.setItem('iam_session_key', response.data.ds_key, cookieOptions);
              localStorage.setItem('xsrf_token', response.data.xsrfToken);
            })
            .then(() => {
              return Permissions.getUserPermissions();
            })
            .then(() => {
              return this.$http.get('/api/auth/v1/renew-token');
            })
            .then((response) => {
              // Set renewed token
              localStorage.setItem('authtoken', response.data.ds_hash);
              if (!!this.$route.query.goTo)
                this.$router.push(this.$route.query.goTo);
              else
                this.$router.push('/');
            })
            .catch((error) => {
              if (error.response.status != 401) {
                this.$utils.notifyError(error);
                console.error("An error has occurred on the attempt to perform automatic login.", error);
              }

              this.$http.delete('/api/auth/v1/logout')
                .then(() => {
                  localStorage.removeItem('authtoken');
                  localStorage.removeItem('xsrf_token');
                  localStorage.removeItem('iam_session_key');
                  localStorage.removeItem('regularPermissions');
                  localStorage.removeItem('customPermissions');
                })
            })
            .finally(() => {
              this.$emit('loaded', 'auth');
            })
        } else {
          this.$emit('loaded', 'auth');
        }
      });
  },

  methods: {
    validateForm() {
      var isInvalid = false;
      for (let k in this.input) {
        let field = this.input[k];
        if (!field || field == '') {
          this.inputError[k] = true;
          isInvalid = true;
        }
      }

      if (isInvalid) {
        this.$utils.notify({
          message: "Preencha o formulário corretamente",
          type: "negative",
          position: 'top-right'
        });

        return false;
      }

      return true;
    },

    login() {
      if (!this.validateForm()) return false;

      this.$emit('load', 'login');
      return this.$http.post('/api/auth/v1/login', this.input)
        .then((response) => {
          var cookieOptions = {
            expires: '30m',
            path: '/'
          };
          localStorage.setItem('iam_session_key', response.data.ds_key, cookieOptions);
          localStorage.setItem('xsrf_token', response.data.xsrfToken);

          if (this.rememberMe) {
            return this.$http.get('/api/auth/v1/renew-token')
              .then((response) => {
                localStorage.setItem('authtoken', response.data.ds_hash);
              });
          }

        })
        .then(() => {
          return Permissions.getUserPermissions();
        })
        .then(() => {
          setTimeout(() => {
            if (!!this.$route.query.goTo)
              this.$router.push(this.$route.query.goTo);
            else
              this.$router.push('/');
          }, 100);
        })
        .catch((error) => {
          console.error(error);
          this.$utils.notifyError(error);

          this.$http.delete('/api/auth/v1/logout')
            .then(() => {
              localStorage.removeItem('authtoken');
              localStorage.removeItem('xsrf_token');
              localStorage.removeItem('iam_session_key');
              localStorage.removeItem('regularPermissions');
              localStorage.removeItem('customPermissions');
            })
        })
        .finally(() => {
          this.$emit('loaded', 'login');
        })
    },

    recoveryPass() {
      if (!this.recoveryEmail || this.recoveryEmail == '') {
        this.inputError.recoveryEmail = true;
        return false;
      }

      this.$emit('load', 'request-pass-recovery');
      return this.$http.post('/api/users/v1/request-password-reset', { ds_email: this.recoveryEmail })
        .catch((error) => {
          this.$utils.notifyError(error);
          console.error("An error has occurred on the attempt to recovery password.", error);
        })
        .finally(() => {
          this.$emit('loaded', 'request-pass-recovery');
        });
    }
  }

}
</script>

<style scoped>
.q-card {
  width: 360px;
}

.main-logo {
  max-width: 220px;
}

.bg-loginpage {
  position: relative;
  overflow: hidden;
}

.bg-loginpage::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  background-image: url('/resources/img/bg-login.jpg');
  background-size: cover;
  /* Adjusts the width to fit the screen */
  background-position-x: center;
  background-repeat: no-repeat;
  /* width: 100vw; */
  /* Ensures the image takes up the full viewport width */
  /* height: 100vh; */
  /* Ensures the image takes up the full viewport height */
}
</style>
