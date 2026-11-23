<template>
  <div>
    <!-- Login Form -->
    <q-intersection v-show="showForgotPassForm == false" transition="jump-left">
      <q-form @keyup.enter="handleEnterKey">
        <InputField Label="E-mail" Icon="email" type="email" clearable v-model="input.username"
          :Error="inputError.username" @focus="inputError.username = false"></InputField>
        <InputField Label="Senha" Icon="lock" type="password" clearable v-model="input.ds_password"
          :Error="inputError.ds_password" @focus="inputError.ds_password = false"></InputField>
      </q-form>
      <div class="q-px-sm">
        <Btn icon="fas fa-sign-in-alt" color="primary" size="md" class="full-width" @click="login"
          label="Entrar" />
      </div>
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
    </q-intersection>

    <!-- Forgot Pass Form -->
    <q-intersection v-show="showForgotPassForm == true" transition="jump-right">
      <q-form>
        <InputField Label="Seu e-mail cadastrado" Icon="email" type="email" clearable v-model="recoveryEmail"
          :error="inputError.recoveryEmail" @focus="inputError.recoveryEmail = false"></InputField>
      </q-form>
      <div class="q-pa-sm">
        <Btn icon="fas fa-paper-plane" color="primary" size="md" class="full-width" @click="recoveryPass"
          label="Recuperar Senha" />
      </div>
      <div class="row">
        <div class="col-12 q-pa-sm">
          <q-btn label="Voltar ao login" icon="fas fa-chevron-left" flat color="primary"
            @click="showForgotPassForm = false">
          </q-btn>
        </div>
      </div>
    </q-intersection>
  </div>
</template>

<script setup>
// IMPORTS
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import { useRoute } from 'vue-router';
import ENDPOINTS from '../ENDPOINTS'


// INITIALIZATION
const route = useRoute()
const emit = defineEmits([
  'iam-auth-login-before',
  'iam-auth-login-after',
  'iam-auth-login-error',
  'iam-resetpassword-request-before',
  'iam-resetpassword-request-after',
  'iam-resetpassword-request-error',
])
onMounted(async () => {
  getService('toolcase/loader').load('check-login')
  try {
    await getService("toolcase/http").get(ENDPOINTS.AUTH.LOGGED_USER);
    emit('iam-auth-login-after', goTo.value)
  } catch (error) {
    if (error.response?.status == 401 && localStorage.getItem("authtoken")) {
      await autoLogin();
    }
  } finally{
    getService('toolcase/loader').loaded('check-login')
  }
});


// VARS
const showForgotPassForm = ref(false);
const input = ref({
  username: null,
  ds_password: null,
})
const inputError = ref({
  username: false,
  ds_password: false,
})
const recoveryEmail = ref(null)
const rememberMe = ref(false);


// COMPUTED
const goTo = computed(() => route.query?.goTo ?? '/')


// FUNCTIONS
const getService = getCurrentInstance().appContext.config.globalProperties.$getService;
function handleEnterKey(event) {
  if (event.key === "Enter") {
    login();
  }
}
function validateForm() {
  var isInvalid = false;
  for (let k in input.value) {
    let field = input.value[k];
    if (!field || field == "") {
      inputError.value[k] = true;
      isInvalid = true;
    }
  }

  if (isInvalid) {
    getService("toolcase/utils").notify({
      message: "Preencha o formulário corretamente",
      type: "negative",
      position: "top-right",
    });

    return false;
  }

  return true;
}
async function login() {
  if (!validateForm()) return false;

  getService('toolcase/loader').load('logging-in')

  const deviceKey = await getService("iam/device").getDeviceKey();

  emit('iam-auth-login-before')
  try {
    const {data} = await getService("toolcase/http")
      .setHeader("Iam-Device-Key", deviceKey)
      .post(ENDPOINTS.AUTH.LOGIN, input.value);

    localStorage.setItem("iam_session_key", data.ds_key);
    localStorage.setItem("xsrf_token", data.xsrfToken);

    if (rememberMe.value) {
      const tknResponse = await getService("toolcase/http").get(
        ENDPOINTS.AUTH.RENEW_TOKEN,
      );
      localStorage.setItem("authtoken", tknResponse.data.ds_hash);
    }

    emit('iam-auth-login-after', goTo.value )
  } catch (error) {
    console.error(error);
    getService("toolcase/utils").notifyError(error);

    await getService("toolcase/http").delete(ENDPOINTS.AUTH.LOGOUT);
    localStorage.removeItem("authtoken");
    localStorage.removeItem("xsrf_token");
    localStorage.removeItem("iam_session_key");
    emit('iam-auth-login-error', error)
  } finally{
    getService('toolcase/loader').loaded('logging-in')
  }
}
async function autoLogin() {
  emit('iam-auth-login-before')
  getService('toolcase/loader').load('logging-in')
  try {
    const {data} = await getService("toolcase/http").post(
      `${ENDPOINTS.AUTH.LOGIN_TOKEN}/${localStorage.getItem("authtoken")}`,
    );

    localStorage.setItem(
      "iam_session_key",
      data.ds_key,
    );
    localStorage.setItem("xsrf_token", data.xsrfToken);

    const tknResponse = await getService("toolcase/http").get(
      ENDPOINTS.AUTH.RENEW_TOKEN,
    );
    localStorage.setItem("authtoken", tknResponse.data.ds_hash);

    emit('iam-auth-login-after', goTo.value)
  } catch (error) {
    if (error.response.status != 401) {
      getService("toolcase/utils").notifyError(error);
      console.error(
        "An error has occurred on the attempt to perform automatic login.",
        error,
      );
    }

    await getService("toolcase/http").delete(ENDPOINTS.AUTH.LOGOUT);
    localStorage.removeItem("authtoken");
    localStorage.removeItem("xsrf_token");
    localStorage.removeItem("iam_session_key");

    emit('iam-auth-login-error', error)
  } finally{
    getService('toolcase/loader').loaded('logging-in')
  }
}
async function recoveryPass() {
  if (!recoveryEmail.value || recoveryEmail.value == "") {
    inputError.value.recoveryEmail = true;
    return false;
  }

  emit('iam-resetpassword-request-before', recoveryEmail.value)
  getService('toolcase/loader').load('requesting-password-reset')
  try {
    await getService("toolcase/http").post(
      ENDPOINTS.USERS.RESET_PASS.REQUEST,
      { username: recoveryEmail.value },
    );
    getService("toolcase/utils").notify({
      message:
        "Um e-mail, contendo instruções de recuperação foi enviado ao endereço fornecido.",
      type: "positive",
      position: "top-right",
    });
    emit('iam-resetpassword-request-after')
  } catch (error) {
    getService("toolcase/utils").notifyError(error);
    console.error(
      "An error has occurred on the attempt to recovery password.",
      error,
    );
    emit('iam-resetpassword-request-error', error)
  } finally{
    getService('toolcase/loader').loaded('requesting-password-reset')
  }
}
</script>