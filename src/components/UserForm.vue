<template>
  <div class="row">
    <div class="col-12 q-pa-xs" v-if="showTitle">
      <div class="q-pa-xs">
        <h1>Informações do Usuário</h1>
      </div>
    </div>

    <!-- Photo -->
    <div class="col-12">
      <PhotoPicker v-if="!shouldHide('avatar') && input.avatar"
        :DefaultImgPath="DefaultAvatarPath || '/resources/img/unknown-user.jpg'" v-model="input.avatar"
        :disable="readonly">
      </PhotoPicker>
    </div>

    <!-- Alterar Senha (modo edição) -->
    <div v-if="editPass" class="col-12 q-pa-xs" align="right">
      <Btn label="Alterar Senha" icon="fas fa-key" color="white" textColor="primary" outline size="md"
        @click="openPasswordModal" />
    </div>

    <!-- Data -->
    <div v-if="!shouldHide('ds_first_name')" class="col-12 col-md-6">
      <InputField type="text" Label="Nome*" Icon="fas fa-user-tie" clearable :readonly="readonly"
        v-model="input.ds_first_name" :Error="inputError.ds_first_name" @focus="inputError.ds_first_name = false">
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_last_name')" class="col-12 col-md-6">
      <InputField type="text" Label="Sobrenome*" Icon="fas fa-user-tie" clearable :readonly="readonly"
        v-model="input.ds_last_name" :Error="inputError.ds_last_name" @focus="inputError.ds_last_name = false">
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_phone1')" class="col-12 col-md-6">
      <InputField type="phone" Label="Telefone" clearable :readonly="readonly" v-model="input.ds_phone1"></InputField>
    </div>
    <div v-if="!shouldHide('ds_phone2')" class="col-12 col-md-6">
      <InputField type="phone" Label="Telefone Adicional" clearable :readonly="readonly" v-model="input.ds_phone2">
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_company')" class="col-12 col-md-6">
      <InputField type="text" Label="Empresa" Icon="fas fa-building" clearable :readonly="readonly"
        v-model="input.ds_company"></InputField>
    </div>
    <div v-if="HideFields.length == 0" class="col-12 col-md-6">&nbsp;</div>
    <div v-if="!shouldHide('ds_email')" class="col-12 col-md-6">
      <InputField type="text" Label="Email*" Icon="fas fa-at" clearable :readonly="readonly" v-model="input.ds_email"
        :Error="inputError.ds_email" @focus="inputError.ds_email = false">
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_username')" class="col-12 col-md-6">
      <InputField type="text" Label="Nome de Usuário*" Icon="fas fa-user" clearable :readonly="readonly"
        v-model="input.ds_username" :Error="inputError.ds_username" @focus="inputError.ds_username = false">
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_email_confirm') && confirmEmail" class="col-12 col-md-6">
      <InputField type="text" Label="Confirmar Email*" Icon="fas fa-check" clearable :readonly="readonly"
        v-model="control.ds_email_confirm" :disable="!input.ds_email" :Error="inputError.ds_email_confirm"
        @focus="delete inputError.ds_email_confirm">
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_password') && !readonly && !editPass" class="col-12 col-md-6">
      <InputField type="password" :Label="`${requiredPass ? '' : 'Nova'} Senha${requiredPass ? '*' : ''}`"
        Icon="fas fa-key" clearable :readonly="readonly" v-model="input.ds_password" :Error="inputError.ds_password"
        @focus="
          () => {
            if (requiredPass) inputError.ds_password = false;
            else delete inputError.ds_password;
          }
        ">
      </InputField>
    </div>
    <div v-if="
      !shouldHide('ds_password_confirm') &&
      !readonly &&
      !shouldHide('ds_password') &&
      !editPass
    " class="col-12 col-md-6">
      <InputField type="password" :Label="`Confirmar ${requiredPass ? '' : 'Nova'} Senha${requiredPass ? '*' : ''
        }`" Icon="fas fa-check" clearable :readonly="readonly" v-model="control.ds_password_confirm"
        :disable="!input.ds_password" :Error="inputError.ds_password_confirm"
        @focus="delete inputError.ds_password_confirm">
      </InputField>
    </div>

    <!-- Modal: Alterar Senha -->
    <Modal Title="Alterar Senha" Icon="fas fa-key" v-model="showPasswordModal" @hide="resetPasswordControl"
      :Actions="[{ label: 'Salvar', icon: 'fas fa-save', color: 'positive', textColor: 'white', fn: savePassword }]">
      <InputField Label="Nova Senha" Icon="fas fa-key" type="password" clearable v-model="control.ds_password"
        :Error="passwordError.ds_password" @focus="passwordError.ds_password = false">
      </InputField>
      <InputField Label="Confirmar Nova Senha" Icon="fas fa-key" type="password" clearable
        v-model="control.ds_password_confirm" :Error="passwordError.ds_password_confirm"
        @focus="passwordError.ds_password_confirm = false">
      </InputField>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, getCurrentInstance } from "vue";
import ENDPOINTS from "../ENDPOINTS";

defineOptions({ name: "component-userinfo" });

const props = defineProps({
  readonly: Boolean,
  showTitle: Boolean,
  confirmEmail: Boolean,
  requiredPass: Boolean,
  // Exibe o botão/modal "Alterar Senha" (edição), no lugar dos campos de senha inline.
  editPass: Boolean,
  // Quando true, a troca de senha usa o endpoint da própria conta (my-account);
  // caso contrário, usa admin-change-pass com a chave passada em UserKey.
  accountOwner: Boolean,
  UserKey: {
    type: String,
    default: null,
  },
  HideFields: {
    type: Array,
    default: () => [],
  },
  DefaultAvatarPath: {
    type: String,
    default: null,
  },
  modelValue: {
    type: Object,
  },
});

const emit = defineEmits(["update:model-value"]);

// Submódulo acessa os serviços do app pelo $getService global (resolução por URI) — equivalente
// ao this.$getService do Options API.
const getService = getCurrentInstance().appContext.config.globalProperties.$getService;

const input = reactive({
  ds_first_name: null,
  ds_last_name: null,
  ds_phone1: null,
  ds_phone2: null,
  ds_company: null,
  ds_email: null,
  ds_username: null,
  ds_password: null,
  avatar: {
    file: null,
    name: null,
    src: null,
    size: null,
  },
});
const inputError = reactive({
  ds_first_name: false,
  ds_last_name: false,
});
const control = reactive({
  ds_email_confirm: null,
  ds_password: null,
  ds_password_confirm: null,
});
const showPasswordModal = ref(false);
const passwordLoading = ref(false);
// Erros do modal de senha, separados do inputError do formulário principal
// (evita que validateForm passe a exigir ds_password no save principal).
const passwordError = reactive({
  ds_password: false,
  ds_password_confirm: false,
});

const factory = computed(() => ({
  input: { ...input },
  read,
  validate: validateFields,
}));

function validateFields() {
  // Validation
  let user = Object.assign({}, input);
  delete user.avatar;

  // -- Form (campos genéricos obrigatórios). ds_username/ds_email são
  // validados à parte como "ao menos um" (OR), fora do check genérico.
  let genericUser = Object.assign({}, user);
  delete genericUser.ds_email;
  delete genericUser.ds_username;
  if (
    !getService("toolcase/utils").validateForm(
      genericUser,
      inputError,
    )
  )
    return false;

  // -- Username OU Email: exige ao menos um dos dois (quando visíveis)
  const usernameVisible = !shouldHide("ds_username");
  const emailVisible = !shouldHide("ds_email");
  if (usernameVisible || emailVisible) {
    const usernameFilled = usernameVisible && !!user.ds_username;
    const emailFilled = emailVisible && !!user.ds_email;
    if (!usernameFilled && !emailFilled) {
      if (usernameVisible) inputError.ds_username = true;
      if (emailVisible) inputError.ds_email = true;
      getService("toolcase/utils").notify({
        message: "Informe ao menos um: nome de usuário ou email",
        type: "negative",
        position: "top-right",
      });
      return false;
    }
    // ao menos um preenchido: limpa eventuais marcações de erro
    if (usernameVisible) inputError.ds_username = false;
    if (emailVisible) inputError.ds_email = false;
  }

  // -- Email (confirmação, apenas quando um email foi informado)
  if (
    props.confirmEmail &&
    !!user.ds_email &&
    user.ds_email !== control.ds_email_confirm
  ) {
    inputError.ds_email = true;
    inputError.ds_email_confirm = true;
    getService("toolcase/utils").notify({
      message: "Os emails inseridos são diferentes",
      type: "negative",
      position: "top-right",
    });
    return false;
  }

  // -- Password
  if (user.ds_password !== "" && user.ds_password !== null) {
    if (user.ds_password !== control.ds_password_confirm) {
      console.log(
        `${user.ds_password} !== ${control.ds_password_confirm}`,
        user.ds_password !== control.ds_password_confirm,
      );

      inputError.ds_password = true;
      inputError.ds_password_confirm = true;
      getService("toolcase/utils").notify({
        message: "As senhas inseridas são diferentes",
        type: "negative",
        position: "top-right",
      });
      return false;
    }
  }

  return true;
}

function read(source) {
  if ("ds_avatar_img_url" in source && !!source.ds_avatar_img_url) {
    input.avatar.src = source.ds_avatar_img_url;
    delete source.ds_avatar_img_url;
  }
  // Reads User-related Data
  for (let key in input) {
    if (key in source) {
      input[key] = source[key];
    }
  }
}

function shouldHide(element) {
  return props.HideFields.includes(element);
}

function openPasswordModal() {
  resetPasswordControl();
  showPasswordModal.value = true;
}

function resetPasswordControl() {
  control.ds_password = null;
  control.ds_password_confirm = null;
  passwordError.ds_password = false;
  passwordError.ds_password_confirm = false;
}

function isValidNewPassword() {
  if (
    control.ds_password === "" ||
    control.ds_password === null
  ) {
    passwordError.ds_password = true;
    getService("toolcase/utils").notify({
      message: "Preencha os campos corretamente",
      type: "negative",
      position: "top-right",
    });
    return false;
  }

  if (
    control.ds_password_confirm === "" ||
    control.ds_password_confirm === null
  ) {
    passwordError.ds_password_confirm = true;
    getService("toolcase/utils").notify({
      message: "Preencha os campos corretamente",
      type: "negative",
      position: "top-right",
    });
    return false;
  }

  if (control.ds_password !== control.ds_password_confirm) {
    passwordError.ds_password = true;
    passwordError.ds_password_confirm = true;
    getService("toolcase/utils").notify({
      message: "As senhas inseridas são diferentes",
      type: "negative",
      position: "top-right",
    });
    return false;
  }

  return true;
}

function savePassword() {
  if (!isValidNewPassword()) return;

  const url = props.accountOwner
    ? ENDPOINTS.USERS.MY_ACCOUNT
    : `${ENDPOINTS.USERS.ADMIN_CHANGE_PASS}/${props.UserKey}`;

  passwordLoading.value = true;
  return getService("toolcase/http")
    .put(url, { ds_password: control.ds_password })
    .then(() => {
      getService("toolcase/utils").notify({
        message: "Senha atualizada com sucesso",
        type: "positive",
        position: "top-right",
      });
      showPasswordModal.value = false;
    })
    .catch((error) => {
      getService("toolcase/utils").notifyError(error);
      console.error(
        "An error occurred while attempting to save the password.",
        error,
      );
    })
    .finally(() => {
      passwordLoading.value = false;
    });
}

function syncConditionalErrors() {
  const conditionalFields = ["ds_email", "ds_username"];
  for (const field of conditionalFields) {
    if (!shouldHide(field)) {
      if (!(field in inputError)) {
        inputError[field] = false;
      }
    } else {
      delete inputError[field];
    }
  }
}

watch(
  input,
  () => {
    emit("update:model-value", factory.value);
  },
  { deep: true },
);

watch(
  () => props.HideFields,
  () => {
    syncConditionalErrors();
  },
  { deep: true },
);

watch(
  () => props.modelValue,
  (newValue) => {
    for (let key in input) {
      if (key in newValue) {
        input[key] = newValue[key];
      }
    }
  },
  { deep: true },
);

onMounted(() => {
  syncConditionalErrors();
  if (props.requiredPass) {
    inputError.ds_password = false;
  }
  emit("update:model-value", factory.value);
});
</script>

<style scoped>
h1 {
  font-size: 1.5rem;
  line-height: 15px;
}
</style>
