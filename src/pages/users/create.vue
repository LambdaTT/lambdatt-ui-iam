<template>
  <La1Page Title="Adicionar Usuário" :Breadcrumb="breadcrumb">
    <Widget Title="Dados do Usuário" Icon="fas fa-user-cog" :Actions="formActions">
      <UserForm v-model="User" confirmEmail requiredPass></UserForm>

      <template #user-profiles>
        <Widget Title="Perfis de Acesso" Icon="fas fa-id-card">
          <q-option-group v-model="inputUser.selected_profiles" :options="profiles" color="primary" type="checkbox" />
        </Widget>
      </template>

    </Widget>
  </La1Page>
</template>

<script setup>
// IMPORTS
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import ENDPOINTS from '../../ENDPOINTS'


// INITIALIZATION
defineOptions({ name: 'pages-iam-users-create' })
const router = useRouter()
onMounted(async () => {
  getService('toolcase/loader').load('data');
  await getService('iam/auth').authenticate();
  if (!getService('iam/permissions').validatePermissions({ 'IAM_USER': 'C' }) ||
    !getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) ||
    !getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'CUD' })) router.push('/error/forbidden');

  await listProfiles();
  getService('toolcase/loader').loaded('data');
})


// VARS
const getService = getCurrentInstance().appContext.config.globalProperties.$getService
const User = ref({})
const inputUser = ref({
  selected_profiles: []
})
const profiles = ref([])
const breadcrumb = computed(() => [
  { label: 'Home', icon: "fas fa-home", to: "/" },
  { label: 'Usuários', icon: "fas fa-users", to: "/iam/users/list" },
  { label: 'Adicionar', icon: 'fas fa-plus' },
])
const input = computed(() => ({ ...inputUser.value, ...User.value.input }))
const formActions = [
  { label: 'Voltar', icon: 'fas fa-undo', color: 'white', textColor: 'primary', outline: true, fn: () => router.go(-1) },
  { label: 'Salvar', icon: 'fas fa-save', color: 'positive', textColor: 'white', fn: save }
]


// FUNCTIONS
function validateForm() {
  if (inputUser.value.selected_profiles.length < 1) {
    getService('toolcase/utils').notify({
      message: "Selecione ao menos 1 perfil de acesso.",
      type: "negative",
      position: 'top-right'
    });
    return false;
  }

  return true;
}
function save() {
  let hasError = !User.value.validate() |
    !validateForm();
  if (hasError) { return false; }

  for (let i = 0; i < inputUser.value.selected_profiles.length; i++) {
    inputUser.value.selected_profiles[i] = { 'ds_key': inputUser.value.selected_profiles[i] };
  }
  inputUser.value.selected_profiles = JSON.stringify(inputUser.value.selected_profiles);

  var data = new FormData()
  for (let k in input.value)
    if (k != 'avatar')
      data.set(k, input.value[k]);
  if (input.value.avatar.file) data.set('avatar', input.value.avatar.file)

  getService('toolcase/loader').load('save-user');
  return getService('toolcase/http').post(ENDPOINTS.USERS.USER, data)
    .then((response) => {
      router.push(`/iam/users/edit/${response.data.ds_key}`);
      getService('toolcase/utils').notify({
        message: "O novo usuário foi criado com sucesso.",
        type: 'positive',
        position: 'top-right'
      });
    })
    .catch((error) => {
      getService('toolcase/utils').notifyError(error);
      console.error(error);
    })
    .finally(() => {
      getService('toolcase/loader').loaded('save-user');
    })
}
function listProfiles() {
  // Retrieve Access Profiles list:
  return getService('toolcase/http').get(ENDPOINTS.PROFILES.PROFILE)
    .then((response) => {
      profiles.value = response.data.map(prf => ({
        label: prf.ds_title,
        value: prf.ds_key
      }))
    })
    .catch((error) => {
      getService('toolcase/utils').notifyError(error);
      console.error(error);
    })
}
</script>