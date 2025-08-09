<template>
  <div class="text-grey-8">
    <q-layout view="hHh Lpr lff" container-fluid style="height: 300px" class="shadow-2 rounded-borders">
      <q-page-container>
        <q-page :padding="false" class="flex flex-center bg-loginpage">
          <div class="row">
            <q-card square bordered class="shadow-1">
              <q-card-section>
                <div class="row">
                  <h5 class="text-h5 text-center text-grey-8 q-my-md full-width">
                    <q-img class="main-logo vertical-middle" src="/resources/img/main-logo.png" />
                  </h5>
                  <p class="text-grey-7 text-center full-width">Faça login para acessar o sistema.</p>
                </div>
              </q-card-section>

              <!-- Login Form -->
              <q-intersection v-show="showForgotPassForm == false" transition="jump-left">
                <q-card-section>
                  <q-form @keyup.enter="handleEnterKey">
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
                    <!-- <div class="col-6">
                      <q-checkbox size="md" v-model="rememberMe" val="md" label="Manter Logado" />
                    </div> -->
                    <div class="col-12 q-pa-sm text-right">
                      <q-btn label="Esqueci a senha" icon-right="fas fa-chevron-right" flat color="primary"
                        @click="showForgotPassForm = true">
                      </q-btn>
                    </div>
                  </div>
                </q-card-section>
              </q-intersection>

              <!-- Forgot Pass Form -->
              <q-intersection v-show="showForgotPassForm == true" transition="jump-right">
                <q-card-section>
                  <q-form>
                    <InputField Label="Seu e-mail cadastrado" Icon="email" type="email" clearable
                      v-model="recoveryEmail" :error="inputError.recoveryEmail"
                      @focus="inputError.recoveryEmail = false"></InputField>
                  </q-form>
                </q-card-section>
                <q-card-section>
                  <div class="q-pa-sm">
                    <q-btn icon="fas fa-paper-plane" color="primary" size="md" class="full-width"
                      v-on:click="recoveryPass()" label="Recuperar Senha" />
                  </div>
                </q-card-section>
                <q-card-section>
                  <div class="row">
                    <div class="col-12 q-pa-sm">
                      <q-btn label="Voltar ao login" icon="fas fa-chevron-left" flat color="primary"
                        @click="showForgotPassForm = false">
                      </q-btn>
                    </div>
                  </div>
                </q-card-section>
              </q-intersection>

            </q-card>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script>
import { useQuasar } from 'quasar'
import ENDPOINTS from '../../ENDPOINTS';

export const __PAGE_CONFIG = {
  route: false
}

export default {
  name: 'pages-iam-auth-login',
  data() {
    return {
      $q: useQuasar(),
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

  methods: {
    handleEnterKey(event) {
      if (event.key === 'Enter') {
        this.login();
      }
    },

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
        this.$getService('toolcase/utils').notify({
          message: "Preencha o formulário corretamente",
          type: "negative",
          position: 'top-right'
        });

        return false;
      }

      return true;
    },

    async login() {
      if (!this.validateForm()) return false;

      this.$q.loading.show();

      try {
        const loginResponse = await this.$getService('toolcase/http').post(ENDPOINTS.AUTH.LOGIN, this.input)

        localStorage.setItem('iam_session_key', loginResponse.data.ds_key);
        localStorage.setItem('xsrf_token', loginResponse.data.xsrfToken);

        if (this.rememberMe) {
          const tknResponse = await this.$getService('toolcase/http').get(ENDPOINTS.AUTH.RENEW_TOKEN)
          localStorage.setItem('authtoken', tknResponse.data.ds_hash);
        }

        setTimeout(() => {
          if (!!this.$route.query.goTo)
            this.$router.push(this.$route.query.goTo);
          else
            this.$router.push('/');
        }, 100);
      } catch (error) {
        console.error(error);
        this.$getService('toolcase/utils').notifyError(error);

        await this.$getService('toolcase/http').delete(ENDPOINTS.AUTH.LOGOUT)
        localStorage.removeItem('authtoken');
        localStorage.removeItem('xsrf_token');
        localStorage.removeItem('iam_session_key');
        localStorage.removeItem('regularPermissions');
        localStorage.removeItem('customPermissions');
      } finally {
        this.$q.loading.hide();
      }
    },

    async autoLogin() {
      this.$q.loading.show();

      try {
        const response = await this.$getService('toolcase/http').post(`${ENDPOINTS.AUTH.LOGIN_TOKEN}/${localStorage.getItem('authtoken')}`)

        localStorage.setItem('iam_session_key', response.data.ds_key, cookieOptions);
        localStorage.setItem('xsrf_token', response.data.xsrfToken);

        const tknResponse = await this.$getService('toolcase/http').get(ENDPOINTS.AUTH.RENEW_TOKEN);
        localStorage.setItem('authtoken', tknResponse.data.ds_hash);

        // Set renewed token
        if (!!this.$route.query.goTo)
          this.$router.push(this.$route.query.goTo);
        else
          this.$router.push('/');

      } catch (error) {
        if (error.response.status != 401) {
          this.$getService('toolcase/utils').notifyError(error);
          console.error("An error has occurred on the attempt to perform automatic login.", error);
        }

        await this.$getService('toolcase/http').delete(ENDPOINTS.AUTH.LOGOUT)
        localStorage.removeItem('authtoken');
        localStorage.removeItem('xsrf_token');
        localStorage.removeItem('iam_session_key');
        localStorage.removeItem('regularPermissions');
        localStorage.removeItem('customPermissions');
      } finally {
        this.$q.loading.hide();
      }
    },

    async recoveryPass() {
      if (!this.recoveryEmail || this.recoveryEmail == '') {
        this.inputError.recoveryEmail = true;
        return false;
      }

      this.$q.loading.show();

      try {
        this.$getService('toolcase/http').post(ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET, { ds_email: this.recoveryEmail })
        this.$getService('toolcase/utils').notify({
          message: 'Um e-mail, contendo instruções de recuperação foi enviado ao endereço fornecido.',
          type: 'positive',
          position: 'top-right'
        })
      } catch (error) {
        this.$getService('toolcase/utils').notifyError(error);
        console.error("An error has occurred on the attempt to recovery password.", error);
      } finally {
        this.$q.loading.hide();
      }
    },
  },

  async mounted() {
    try {
      await this.$getService('toolcase/http').get(ENDPOINTS.AUTH.LOGGED_USER)
      this.$router.push('/');
    } catch (error) {
      if (error.response?.status == 401 && localStorage.getItem('authtoken')) {
        this.autoLogin();
      } else {
        this.$q.loading.hide();
      }
    }
  },
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
  /* Adjusts the width to fit the screen */
  background-size: cover;
  background-position-x: center;
  background-repeat: no-repeat;
  /* Ensures the image takes up the full viewport width */
  /* width: 100vw; */
  /* Ensures the image takes up the full viewport height */
  /* height: 100vh; */
}
</style>
