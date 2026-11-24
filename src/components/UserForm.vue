<template>
  <div class="row" v-if="permissions.read || props.accountOwner">
    <div class="col-12 q-pa-xs" v-if="showTitle">
      <div class="q-pa-xs">
        <h1>Informações do Usuário</h1>
      </div>
    </div>

    <!-- Photo -->
    <div class="col-12">
      <PhotoPicker v-if="!shouldHide('avatar') && input.avatar"
        :DefaultImgPath="DefaultAvatarPath || '/resources/img/unknown-user.jpg'" v-model="input.avatar"
        :disable="readonly || !canManage">
      </PhotoPicker>
    </div>

    <!-- Alterar Senha (modo edição) -->
    <div v-if="editPass" class="col-12 q-pa-xs" align="right">
      <Btn label="Alterar Senha" icon="fas fa-key" color="white" textColor="primary" outline size="md"
        @click="openPasswordModal" />
    </div>

    <div v-if="!shouldHide('ds_first_name')" class="col-12 col-md-6">
      <InputField type="text" Label="Nome*" Icon="fas fa-user-tie" clearable :readonly="readonly || !canManage"
        v-model="input.ds_first_name" :Error="inputError.ds_first_name" @focus="inputError.ds_first_name = false">
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_last_name')" class="col-12 col-md-6">
      <InputField type="text" Label="Sobrenome*" Icon="fas fa-user-tie" clearable :readonly="readonly || !canManage"
        v-model="input.ds_last_name" :Error="inputError.ds_last_name" @focus="inputError.ds_last_name = false">
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_phone1')" class="col-12 col-md-6">
      <InputField type="phone" Label="Telefone" clearable :readonly="readonly || !canManage" v-model="input.ds_phone1">
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_phone2')" class="col-12 col-md-6">
      <InputField type="phone" Label="Telefone Adicional" clearable :readonly="readonly || !canManage"
        v-model="input.ds_phone2">
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_company')" class="col-12 col-md-6">
      <InputField type="text" Label="Empresa" Icon="fas fa-building" clearable :readonly="readonly || !canManage"
        v-model="input.ds_company"></InputField>
    </div>
    <div v-if="HideFields.length == 0" class="col-12 col-md-6">&nbsp;</div>
    <div v-if="!shouldHide('ds_email')" class="col-12 col-md-6">
      <InputField type="text" Label="Email*" Icon="fas fa-at" clearable :readonly="readonly || !canManage"
        v-model="input.ds_email" :Error="inputError.ds_email" @focus="inputError.ds_email = false">
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_username')" class="col-12 col-md-6">
      <InputField type="text" Label="Nome de Usuário*" Icon="fas fa-user" clearable :readonly="readonly || !canManage"
        v-model="input.ds_username" :Error="inputError.ds_username" @focus="inputError.ds_username = false">
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_email_confirm') && confirmEmail" class="col-12 col-md-6">
      <InputField type="text" Label="Confirmar Email*" Icon="fas fa-check" clearable :readonly="readonly || !canManage"
        v-model="control.ds_email_confirm" :disable="!input.ds_email" :Error="inputError.ds_email_confirm"
        @focus="delete inputError.ds_email_confirm">
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_password') && !readonly && !editPass" class="col-12 col-md-6">
      <InputField type="password" :Label="`${requiredPass ? '' : 'Nova'} Senha${requiredPass ? '*' : ''}`"
        Icon="fas fa-key" clearable :readonly="readonly || !canManage" v-model="input.ds_password"
        :Error="inputError.ds_password" @focus="
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
        }`" Icon="fas fa-check" clearable :readonly="readonly || !canManage" v-model="control.ds_password_confirm"
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

    <Confirm ref="ConfirmRef" />
  </div>
</template>

<script setup>
// IMPORTS
import { ref, reactive, computed, watch, onMounted, getCurrentInstance, defineModel, defineExpose } from "vue";
import auth from '../services/auth'
import permissionService from '../services/permissions'
import ENDPOINTS from "../ENDPOINTS";


// INITIALIZATION
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
  }
});
const emit = defineEmits([
  "iam-user-fetchdata-before",
  "iam-user-fetchdata-error",
  "iam-user-fetchdata-after",
  "iam-user-save-before",
  "iam-user-save-error",
  "iam-user-save-after",
  "iam-user-remove-before",
  "iam-user-remove-error",
  "iam-user-remove-after",
  "iam-password-save-after",
  "iam-password-save-before",
  "iam-password-save-error",
]);
defineExpose({
  getKey: () => props.UserKey,
  validateForm,
  resetInput,
  reload,
  save,
  remove
})
onMounted(async () => {
  syncConditionalErrors();
  if (props.requiredPass) {
    inputError.ds_password = false;
  }

  if (userKey.value)
    await fetchData()
});


// VARS
const ConfirmRef = ref({})
const input = defineModel({
  type: Object,
  default: () => reactive({
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
  })
})
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
const passwordError = reactive({
  ds_password: false,
  ds_password_confirm: false,
});


// COMPUTED
const userKey = computed(() =>
  props.accountOwner ?
    auth.getLoggedUser()?.ds_key :
    (props.UserKey ?? null)
)
const permissions = computed(() => ({
  read: permissionService.requireAny([
    'iam.users.read',
    'iam.users.manage',
  ]),
  manage: permissionService.requireAll('iam.users.manage')
}))
const canManage = computed(() => permissions.value.manage || props.accountOwner)


// WATCHERS
watch(
  () => props.HideFields,
  () => {
    syncConditionalErrors();
  },
  { deep: true },
);


// FUNCTIONS
const getService = getCurrentInstance().appContext.config.globalProperties.$getService;
const moduleExists = getCurrentInstance().appContext.config.globalProperties.$moduleExists;
function validateForm() {
  // Validation
  let user = Object.assign({}, input.value);
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
  const updatedInput = { ...input.value };
  if ("ds_avatar_img_url" in source && !!source.ds_avatar_img_url) {
    updatedInput.avatar = {
      ...updatedInput.avatar,
      src: source.ds_avatar_img_url,
    };
  }
  // Reads User-related Data
  for (let key in updatedInput) {
    if (key in source) {
      updatedInput[key] = source[key];
    }
  }

  input.value = updatedInput;
}
function resetInput() {
  const clearedInput = {};
  for (let key in input.value) {
    if (key === "avatar") {
      clearedInput[key] = {
        file: null,
        name: null,
        src: null,
        size: null,
      }
    } else {
      clearedInput[key] = null;
    }

    if (key in inputError)
      inputError[key] = false;
  }

  input.value = clearedInput;
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
async function fetchData() {
  if (!permissions.value.read && !props.accountOwner) {
    toast("Você não tem permissão para executar esta ação", 'negative')
    return
  }

  if (!moduleExists('toolcase')) {
    console.warn("Module 'Toolcase' not present, thus, it was not possible to fetch user's data automatically.")
    return
  }

  const url = props.accountOwner ?
    ENDPOINTS.USERS.MY_ACCOUNT :
    `${ENDPOINTS.USERS.USER}/${userKey.value}`

  emit('iam-user-fetchdata-before')
  try {
    const { data } = await getService('toolcase/http').get(url)
    read(data)
    emit('iam-user-fetchdata-after', data)
  } catch (error) {
    console.error("An error has occurred on the attempt to fetch users's data.", error)
    emit('iam-user-fetchdata-error', error)
  }

}
async function reload() {
  await fetchData()
}
async function save(validate = true) {
  if (!canManage.value) {
    toast("Você não tem permissão para executar esta ação", 'negative')
    return
  }

  if (validate)
    if (!validateForm()) return

  if (!moduleExists('toolcase')) {
    console.warn("Module 'Toolcase' not present, thus, it was not possible to save user's data automatically.")
    return
  }

  const method = userKey.value ? 'put' : 'post'
  const url = props.accountOwner ?
    ENDPOINTS.USERS.MY_ACCOUNT :
    `${ENDPOINTS.USERS.USER}${userKey.value ? `/${userKey.value}` : ''}`

  const payload = preparePayload()

  emit('iam-user-save-before', input.value)
  try {
    const { data } = await getService('toolcase/http')[method](url, payload)
    emit('iam-user-save-after', data)
  } catch (error) {
    console.error("An error has occurred on the attempt to save user's data.", error)
    emit('iam-user-save-error', error)
    throw error
  }
}
async function remove() {
  if (!await ConfirmRef.value.ask("Deseja excluir as informações?", 'negative', 'O usuário será excluído permanentemente e não poderá ser recuperado.'))
    return false;

  if (!canManage.value) {
    toast("Você não tem permissão para executar esta ação", 'negative')
    return
  }

  if (!moduleExists('toolcase')) {
    console.warn("Module 'Toolcase' not present, thus, it was not possible to remove user's data automatically.")
    return
  }

  if (!props.UserKey) {
    console.warn("No User Key was provided, thus, it was not possible to remove user's data automatically.")
    return
  }

  emit('iam-user-remove-before', props.UserKey)
  try {
    await getService('toolcase/http').delete(`${ENDPOINTS.USERS.USER}/${props.UserKey}`)
    emit('iam-user-remove-after')
  } catch (error) {
    console.error("An error has occurred on the attempt to remove user's data.", error)
    emit('iam-user-remove-error', error)
    throw error
  }
}
async function savePassword() {
  if (!canManage.value) {
    toast("Você não tem permissão para executar esta ação", 'negative')
    return
  }

  if (!isValidNewPassword()) return;

  if (!props.UserKey) {
    console.warn("No User Key was provided, thus, it was not possible to save user's password automatically.")
    return
  }

  const url = props.accountOwner
    ? ENDPOINTS.USERS.MY_ACCOUNT
    : `${ENDPOINTS.USERS.ADMIN_CHANGE_PASS}/${props.UserKey}`;
  const payload = { ds_password: control.ds_password }

  emit('iam-password-save-before', payload)
  try {
    await getService("toolcase/http").put(url, payload)
    toast("A senha do usuário foi alterada com sucesso.", 'positive')
    emit('iam-password-save-after')
    showPasswordModal.value = false;
  } catch (error) {
    console.error("An error has occurred on the attempt to save user's password.", error)
    toastError(error)
    emit('iam-password-save-error', error)
    throw error
  }
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
function toast(message, type) {
  if (moduleExists('toolcase'))
    getService('toolcase/utils').notify({ message, type })
}
function toastError(error) {
  if (moduleExists('toolcase'))
    getService('toolcase/utils').notifyError(error)

}
function preparePayload() {
  const payload = new FormData()

  for (let key in input.value) {
    if (key == 'avatar') continue

    const val = input.value[key]

    payload.set(key, val)
  }

  if (input.value.avatar.file !== null)
    payload.set('avatar', input.value.avatar.file)

  return payload
}
</script>

<style scoped>
h1 {
  font-size: 1.5rem;
  line-height: 15px;
}
</style>
