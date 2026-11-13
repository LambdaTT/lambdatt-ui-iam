<template>
  <La1Page Title="Editar Usuário" :Breadcrumb="breadcrumb">
    <Widget Title="Dados do Usuário" Icon="fas fa-user-cog" :Actions="formActions">
      <UserForm v-model="User" editPass :UserKey="$route.params.key"></UserForm>

      <template #user-profiles>
        <Widget Title="Perfis de Acesso" Icon="fas fa-id-card">
          <q-option-group v-model="inputUser.selected_profiles" :options="profiles" color="primary" type="checkbox" />
        </Widget>
      </template>

    </Widget>
  </La1Page>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ENDPOINTS from '../../ENDPOINTS'

defineOptions({ name: 'pages-iam-user-edit' })

const route = useRoute()
const router = useRouter()
// Submódulo acessa os serviços do app pelo $getService global (resolução por URI) — equivalente
// ao this.$getService do Options API.
const getService = getCurrentInstance().appContext.config.globalProperties.$getService

// Permissions:
const permissions = {
  update: getService('iam/permissions').validatePermissions({ 'IAM_USER': 'U' }) && getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'CRUD' }),
  delete: getService('iam/permissions').validatePermissions({ 'IAM_USER': 'D' }) && getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'D' }),
}

// User component:
const User = ref({})

// Input
const inputUser = ref({
  selected_profiles: []
})
const profiles = ref([])

const breadcrumb = computed(() => [
  { label: 'Home', icon: "fas fa-home", to: "/" },
  { label: 'Usuários', icon: "fas fa-users", to: "/iam/users/list" },
  { label: 'Editar', icon: 'fas fa-pen-to-square' },
])

const input = computed(() => ({ ...inputUser.value, ...User.value.input }))

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
  // Senha é alterada pelo modal "Alterar Senha" (admin-change-pass), não neste save.
  data.delete('ds_password')

  getService('toolcase/loader').load('save-user');
  return getService('toolcase/http').put(`${ENDPOINTS.USERS.USER}/${route.params.key}`, data)
    .then(() => {
      router.push('/iam/users/list');
      getService('toolcase/utils').notify({
        message: "Os dados do usuário foram salvos com sucesso.",
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

function remove() {
  if (!confirm('Deseja excluir as informações?')) return false;

  getService('toolcase/loader').load('user-remove');

  getService('toolcase/http').delete(`${ENDPOINTS.USERS.USER}/${route.params.key}`)
    .then(() => {
      getService('toolcase/utils').notify({
        message: 'O usuário foi excluído com sucesso',
        type: 'positive',
        position: 'top-right'
      })
      router.push('/iam/users/list');
    })
    .catch((error) => {
      getService('toolcase/utils').notifyError(error);
      console.error(error);
    })
    .finally(() => {
      getService('toolcase/loader').loaded('user-remove');
    })
}

function getData() {
  getService('toolcase/loader').load('users-data');
  return getService('toolcase/http').get(`${ENDPOINTS.USERS.USER}/${route.params.key}`)
    .then((response) => {
      for (let k in inputUser.value)
        if (k in response.data)
          inputUser.value[k] = response.data[k]
      User.value.read(response.data);
    })
    .catch((error) => {
      if (error.response.status == 404) {
        getService('toolcase/utils').notify({
          message: 'Usuário não encontrado.',
          type: 'negative',
          position: 'top-right'
        })
        router.push('/iam/users/list');
        return;
      }

      getService('toolcase/utils').notifyError(error);
      console.error("An error has occurred on the attempt to retrieve user's data.", error);
    })
    .finally(() => {
      getService('toolcase/loader').loaded('users-data');
    });
}

function listProfiles() {
  getService('toolcase/loader').load('profiles-list');
  getService('toolcase/http').get(ENDPOINTS.PROFILES.PROFILE)
    .then((response) => {
      profiles.value = response.data.map(prf => ({
        label: prf.ds_title,
        value: prf.ds_key
      }));
    })
    .catch((error) => {
      getService('toolcase/utils').notifyError(error);
      console.error(error);
    })
    .finally(() => {
      getService('toolcase/loader').loaded('profiles-list');
    });
}

const formActions = [
  { label: 'Salvar', icon: 'fas fa-save', color: 'positive', textColor: 'white', hide: !permissions.update, fn: save },
  { label: 'Excluir', icon: 'fas fa-trash-alt', color: 'negative', textColor: 'white', hide: !permissions.delete, fn: remove },
]

onMounted(async () => {
  await getService('iam/auth').authenticate();
  if (!getService('iam/permissions').validatePermissions({ 'IAM_USER': 'R' }) ||
    !getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) ||
    !getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'R' })) router.push('/error/forbidden');

  getData()
  listProfiles()
})
</script>
