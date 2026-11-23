<template>
  <div>
    <q-intersection v-if="!done && !error" transition="jump-left">
      <q-card-section>
        <q-form @keyup.enter="handleEnterKey">
          <InputField type="password" Label="Nova Senha" Icon="fas fa-key" clearable v-model="input.ds_password"
            :Error="inputError.ds_password" @focus="inputError.ds_password = false;"></InputField>
          <InputField type="password" Label="Confirmar Nova Senha" Icon="fas fa-check" clearable
            v-model="input.confirm_pass" :Error="inputError.confirm_pass" @focus="inputError.confirm_pass = false;">
          </InputField>
        </q-form>
      </q-card-section>
      <q-card-section>
        <div class="q-px-sm">
          <q-btn icon="fas fa-save" color="positive" size="md" class="full-width" @click="save()" label="Salvar" />
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
  </div>
</template>

<script setup>
// IMPORTS
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import ENDPOINTS from '../ENDPOINTS';


// INITIALIZATION
const route = useRoute()
onMounted(() => {
  validateToken()
})


// VARS
const done = ref(false)
const error = ref(false)
const getService = getCurrentInstance().appContext.config.globalProperties.$getService
const input = ref({
  ds_password: null,
  confirm_pass: null
})
const inputError = ref({
  ds_password: false,
  confirm_pass: false
})


// COMPUTED
const token = computed(() => route.params.token)


// FUNCTIONS
function handleEnterKey(event) {
  if (event.key === 'Enter') {
    save();
  }
}
function checkPassConfirmation() {
  if (input.value.ds_password != input.value.confirm_pass) {
    getService('toolcase/utils').notify({
      message: "As senhas não coincidem",
      type: 'negative',
      position: 'top-right'
    })

    inputError.value.ds_password = true;
    inputError.value.confirm_pass = true;

    return false;
  }

  return true;
}
async function save() {
  if (!getService('toolcase/utils').validateForm(input.value, inputError.value)) return;
  if (!checkPassConfirmation()) return;

  const payload = {
    ds_password: input.value.ds_password
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
</script>