<template>
  <q-layout view="hHh Lpr lff" container-fluid style="height: 300px" class="shadow-2 rounded-borders">
    <q-page-container>
      <q-page :padding="false" class="flex flex-center bg-loginpage">
        <div class="row">
          <q-card square bordered class="shadow-1">
            <q-card-section>
              <div class="row">
                <h5 class="text-h5 text-center text-grey-8 q-my-md full-width">
                  <q-img class="main-logo vertical-middle" src="/resources/img/logo-horizontal.png" />
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
                    <p class="text-h5 text-red-3"><q-icon name="fas fa-bomb" size="xl"></q-icon> Erro
                    </p>
                    <p class="text-caption text-red-3 text-bold">
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
export const __PAGE_CONFIG = {
  route: 'iam/resetpass/:token',
};
</script>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import ENDPOINTS from '../../ENDPOINTS';

defineOptions({ name: 'pages-iam-user-resetpass' })

defineProps({
  LogoURL: String
})

const route = useRoute()
// Submódulo acessa os serviços do app pelo $getService global (resolução por URI) — equivalente
// ao this.$getService do Options API.
const getService = getCurrentInstance().appContext.config.globalProperties.$getService

// Page State:
const done = ref(false)
const error = ref(false)

// Form related vars:
const form = ref({
  ds_password: null,
  confirm_pass: null
})

const formError = ref({
  ds_password: false,
  confirm_pass: false
})

const token = computed(() => route.params.token)

function handleEnterKey(event) {
  if (event.key === 'Enter') {
    save();
  }
}

function checkPassConfirmation() {
  if (form.value.ds_password != form.value.confirm_pass) {
    getService('toolcase/utils').notify({
      message: "As senhas não coincidem",
      type: 'negative',
      position: 'top-right'
    })

    formError.value.ds_password = true;
    formError.value.confirm_pass = true;

    return false;
  }

  return true;
}

async function save() {
  if (!getService('toolcase/utils').validateForm(form.value, formError.value)) return;
  if (!checkPassConfirmation()) return;

  const payload = {
    ds_password: form.value.ds_password
  }

  try {
    await getService('toolcase/http').put(`${ENDPOINTS.USERS.RESET_PASS.CHANGE}/${token.value}`, payload)
    done.value = true;
  } catch (err) {
    error.value = true;
    getService('toolcase/utils').notifyError(err);
    console.error(err);
  }
}

async function validateToken() {
  try {
    await getService('toolcase/http').get(`${ENDPOINTS.AUTH.VALIDATE_TOKEN}/${token.value}`)
  } catch (err) {
    error.value = true;
    if (err.response.status != 401) {
      getService('toolcase/utils').notifyError(err);
      console.error(err);
    }
  }
}

onMounted(() => {
  validateToken()
})
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