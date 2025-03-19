<template>
  <q-layout view="hHh Lpr lff" container-fluid style="height: 300px" class="shadow-2 rounded-borders">
    <q-page-container>
      <q-page :padding="false" class="flex flex-center bg-loginpage">
        <div class="row">
          <q-card square bordered class="shadow-1">
            <q-card-section>
              <div class="row">
                <h5 class="text-h5 text-center text-grey-8 q-my-md full-width">
                  <q-img class="main-logo vertical-middle" alt="Logo Sindi App"
                    src="/resources/img/logo-horizontal.png" />
                </h5>
                <p class="text-grey-7 text-center full-width">Alterar sua senha.</p>
              </div>
            </q-card-section>
            <q-intersection v-if="!done && !error" transition="jump-left">
              <q-card-section>
                <q-form @keyup.enter="handleEnterKey">
                  <InputField type="password" Label="Nova Senha" Icon="fas fa-key" clearable v-model="form.ds_password"
                    :Error="formError.ds_password" @focus="formError.ds_password = false;"></InputField>
                  <InputField type="password" Label="Confirmar Nova Senha" Icon="fas fa-check" clearable
                    v-model="form.confirm_pass" :Error="formError.confirm_pass"
                    @focus="formError.confirm_pass = false;"></InputField>
                </q-form>
              </q-card-section>
              <q-card-section>
                <div class="q-px-sm">
                  <q-btn icon="fas fa-save" color="positive" size="md" class="full-width" @click="save()"
                    label="Salvar" />
                </div>
              </q-card-section>
            </q-intersection>
            <q-intersection v-else-if="error" transition="jump-left">
              <q-card-section>
                <div class="row text-center">
                  <div class="col-12">
                    <p class="text-h5 text-grey-7"><q-icon name="fas fa-bomb" size="xl"></q-icon> Erro
                    </p>
                    <p class="text-caption text-grey-9">
                      Ocorreu um problema para carregar as informações.
                    </p>
                  </div>
                </div>
              </q-card-section>
            </q-intersection>
            <q-intersection v-else transition="jump-left">
              <q-card-section>
                <div class="row text-center">
                  <div class="col-12">
                    <q-icon name="fas fa-check-circle" size="xl" color="positive"></q-icon>
                    <p class="text-h5 text-grey-7">Senha alterada com sucesso!</p>
                    <p class="text-caption text-grey-9">
                      Agora você pode fechar esta página e usar sua nova senha para acessar sua conta.
                    </p>
                  </div>
                </div>
              </q-card-section>
            </q-intersection>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'pages-iam-user-resetpass',

  props: {
    LogoURL: String
  },

  data() {
    return {
      // Page State:
      done: false,
      error: false,

      // Form related vars:
      form: {
        ds_password: null,
        confirm_pass: null
      },

      formError: {
        ds_password: false,
        confirm_pass: false
      },
    }
  },

  computed: {
    token() {
      return this.$route.params.token;
    }
  },

  methods: {
    handleEnterKey(event) {
      if (event.key === 'Enter') {
        this.login();
      }
    },

    checkPassConfirmation() {
      if (this.form.ds_password != this.form.confirm_pass) {
        this.$utils.notify({
          message: "As senhas não coincidem",
          type: 'negative',
          position: 'top-right'
        })

        this.formError.ds_password = true;
        this.formError.confirm_pass = true;

        return false;
      }

      return true;
    },

    async save() {
      if (!this.$utils.validateForm(this.form, this.formError)) return;
      if (!this.checkPassConfirmation()) return;

      const payload = {
        ds_password: this.form.ds_password
      }

      try {
        await this.$http.put(`/api/iam/users/v1/change-pass/${this.token}`, payload)
        this.done = true;
      } catch (error) {
        this.error = true;
        this.$utils.notifyError(error);
        console.error(error);
      }
    },

    async validateToken() {
      try {
        await this.$http.get(`/api/iam/auth/v1/validate-token/${this.token}`)
      } catch (error) {
        this.error = true;
        if (error.response.status != 401) {
          this.$utils.notifyError(error);
          console.error(error);
        }
      }
    }
  },

  mounted() {
    this.validateToken()
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