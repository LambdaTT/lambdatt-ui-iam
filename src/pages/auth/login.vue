<template>
  <div class="text-grey-8">
    <q-layout
      view="hHh Lpr lff"
      container-fluid
      style="height: 300px"
      class="shadow-2 rounded-borders"
    >
      <q-page-container>
        <q-page :padding="false" class="flex flex-center bg-loginpage">
          <div class="row">
            <q-card square bordered class="shadow-1">
              <q-card-section>
                <div class="row q-pa-md">
                  <q-img
                    class="main-logo full-width vertical-middle"
                    :src="logoSrc"
                  />
                  <p class="text-grey-7 text-center full-width q-mt-md">
                    Entre com suas credenciais de acesso.
                  </p>
                </div>
              </q-card-section>

              <!-- Login Form -->
              <q-intersection
                v-show="showForgotPassForm == false"
                transition="jump-left"
              >
                <q-card-section>
                  <q-form @keyup.enter="handleEnterKey">
                    <InputField
                      Label="E-mail"
                      Icon="email"
                      type="email"
                      clearable
                      v-model="input.username"
                      :Error="inputError.username"
                      @focus="inputError.username = false"
                    ></InputField>
                    <InputField
                      Label="Senha"
                      Icon="lock"
                      type="password"
                      clearable
                      v-model="input.ds_password"
                      :Error="inputError.ds_password"
                      @focus="inputError.ds_password = false"
                    ></InputField>
                  </q-form>
                </q-card-section>
                <q-card-section>
                  <div class="q-px-sm">
                    <q-btn
                      icon="fas fa-sign-in-alt"
                      color="primary"
                      size="md"
                      class="full-width"
                      v-on:click="login()"
                      label="Entrar"
                    />
                  </div>
                </q-card-section>
                <q-card-section class="text-center">
                  <div class="row">
                    <!-- <div class="col-6">
                      <q-checkbox size="md" v-model="rememberMe" val="md" label="Manter Logado" />
                    </div> -->
                    <div class="col-12 q-pa-sm text-right">
                      <q-btn
                        label="Esqueci a senha"
                        icon-right="fas fa-chevron-right"
                        flat
                        color="primary"
                        @click="showForgotPassForm = true"
                      >
                      </q-btn>
                    </div>
                  </div>
                </q-card-section>
              </q-intersection>

              <!-- Forgot Pass Form -->
              <q-intersection
                v-show="showForgotPassForm == true"
                transition="jump-right"
              >
                <q-card-section>
                  <q-form>
                    <InputField
                      Label="Seu e-mail cadastrado"
                      Icon="email"
                      type="email"
                      clearable
                      v-model="recoveryEmail"
                      :error="inputError.recoveryEmail"
                      @focus="inputError.recoveryEmail = false"
                    ></InputField>
                  </q-form>
                </q-card-section>
                <q-card-section>
                  <div class="q-pa-sm">
                    <q-btn
                      icon="fas fa-paper-plane"
                      color="primary"
                      size="md"
                      class="full-width"
                      v-on:click="recoveryPass()"
                      label="Recuperar Senha"
                    />
                  </div>
                </q-card-section>
                <q-card-section>
                  <div class="row">
                    <div class="col-12 q-pa-sm">
                      <q-btn
                        label="Voltar ao login"
                        icon="fas fa-chevron-left"
                        flat
                        color="primary"
                        @click="showForgotPassForm = false"
                      >
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
export const __PAGE_CONFIG = {
  route: false,
};
</script>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import ENDPOINTS from "../../ENDPOINTS";

defineOptions({ name: "pages-iam-auth-login" });

defineProps({
  logoSrc: {
    type: String,
    default: "/resources/img/main-logo.png",
  },
});

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
// Submódulo acessa os serviços do app pelo $getService global (resolução por URI) — equivalente
// ao this.$getService do Options API.
const getService = getCurrentInstance().appContext.config.globalProperties.$getService;

const showForgotPassForm = ref(false);
const rememberMe = ref(false);
const input = reactive({
  username: null,
  ds_password: null,
});
const inputError = reactive({
  username: false,
  ds_password: false,
});
const recoveryEmail = ref(null);

function handleEnterKey(event) {
  if (event.key === "Enter") {
    login();
  }
}

function validateForm() {
  var isInvalid = false;
  for (let k in input) {
    let field = input[k];
    if (!field || field == "") {
      inputError[k] = true;
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

  $q.loading.show();

  const deviceKey = await getService("iam/device").getDeviceKey();

  try {
    const loginResponse = await getService("toolcase/http")
      .setHeader("Iam-Device-Key", deviceKey)
      .post(ENDPOINTS.AUTH.LOGIN, input);

    localStorage.setItem("iam_session_key", loginResponse.data.ds_key);
    localStorage.setItem("xsrf_token", loginResponse.data.xsrfToken);

    if (rememberMe.value) {
      const tknResponse = await getService("toolcase/http").get(
        ENDPOINTS.AUTH.RENEW_TOKEN,
      );
      localStorage.setItem("authtoken", tknResponse.data.ds_hash);
    }

    setTimeout(() => {
      if (route.query.goTo)
        router.push(route.query.goTo);
      else router.push("/");
    }, 100);
  } catch (error) {
    console.error(error);
    getService("toolcase/utils").notifyError(error);

    await getService("toolcase/http").delete(ENDPOINTS.AUTH.LOGOUT);
    localStorage.removeItem("authtoken");
    localStorage.removeItem("xsrf_token");
    localStorage.removeItem("iam_session_key");
  } finally {
    $q.loading.hide();
  }
}

async function autoLogin() {
  $q.loading.show();

  try {
    const response = await getService("toolcase/http").post(
      `${ENDPOINTS.AUTH.LOGIN_TOKEN}/${localStorage.getItem("authtoken")}`,
    );

    localStorage.setItem(
      "iam_session_key",
      response.data.ds_key,
    );
    localStorage.setItem("xsrf_token", response.data.xsrfToken);

    const tknResponse = await getService("toolcase/http").get(
      ENDPOINTS.AUTH.RENEW_TOKEN,
    );
    localStorage.setItem("authtoken", tknResponse.data.ds_hash);

    // Set renewed token
    if (route.query.goTo) router.push(route.query.goTo);
    else router.push("/");
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
  } finally {
    $q.loading.hide();
  }
}

async function recoveryPass() {
  if (!recoveryEmail.value || recoveryEmail.value == "") {
    inputError.recoveryEmail = true;
    return false;
  }

  $q.loading.show();

  try {
    getService("toolcase/http").post(
      ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET,
      { username: recoveryEmail.value },
    );
    getService("toolcase/utils").notify({
      message:
        "Um e-mail, contendo instruções de recuperação foi enviado ao endereço fornecido.",
      type: "positive",
      position: "top-right",
    });
  } catch (error) {
    getService("toolcase/utils").notifyError(error);
    console.error(
      "An error has occurred on the attempt to recovery password.",
      error,
    );
  } finally {
    $q.loading.hide();
  }
}

onMounted(async () => {
  try {
    await getService("toolcase/http").get(ENDPOINTS.AUTH.LOGGED_USER);
    router.push("/");
  } catch (error) {
    if (error.response?.status == 401 && localStorage.getItem("authtoken")) {
      autoLogin();
    } else {
      $q.loading.hide();
    }
  }
});
</script>

<style scoped>
.q-card {
  width: 360px;
}

.bg-loginpage {
  position: relative;
  overflow: hidden;
}

.bg-loginpage::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  background-image: url("/resources/img/bg-login.jpg");
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
