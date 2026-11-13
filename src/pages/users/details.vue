<template>
  <La1Page Title="Detalhes do Usuário" :Breadcrumb="breadcrumb">
    <Widget Title="Informações do Usuário" Icon="fas fa-user-cog">
      <UserForm v-model="User" readonly></UserForm>

      <template #audit-info>
        <AuditBlock :input="inputUser"></AuditBlock>
      </template>

      <template #user-profiles>
        <Widget Title="Perfis de Acesso" Icon="fas fa-id-card">
          <q-option-group :disable="true" v-model="inputUser.selected_profiles" :options="profiles" color="primary"
            type="checkbox" />
        </Widget>
      </template>

    </Widget>
  </La1Page>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ENDPOINTS from '../../ENDPOINTS'

defineOptions({ name: 'pages-iam-user-details' })

const route = useRoute()
const router = useRouter()
// Submódulo acessa os serviços do app pelo $getService global (resolução por URI) — equivalente
// ao this.$getService do Options API.
const getService = getCurrentInstance().appContext.config.globalProperties.$getService

const User = ref({})
const inputUser = ref({
  dtCreated: null,
  dtUpdted: null,
  userCreated: null,
  userUpdted: null,
  selected_profiles: []
})
const profiles = ref([])

const breadcrumb = computed(() => [
  { label: 'Home', icon: "fas fa-home", to: "/" },
  { label: 'Usuários', icon: "fas fa-users", to: "/iam/users/list" },
  { label: 'Ver Detalhes', icon: 'fas fa-eye' },
])

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

onMounted(async () => {
  await getService('iam/auth').authenticate();
  if (!getService('iam/permissions').validatePermissions({ 'IAM_USER': 'R' }) ||
    !getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) ||
    !getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'R' })) router.push('/error/forbidden');

  getData()
  listProfiles()
})
</script>