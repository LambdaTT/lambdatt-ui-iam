<template>
  <Page Title="Minha Conta" :Breadcrumb="breadcrumb">
    <Widget Title="Meus Dados Pessoais" Icon="fas fa-user"
      :Actions="[{ label: 'Salvar', icon: 'fas fa-save', color: 'positive', textColor: 'white', fn: save }]">
      <UserForm v-model="User" editPass accountOwner></UserForm>
    </Widget>
  </Page>
</template>

<script>
export const __PAGE_CONFIG = {
  route: 'iam/my-account'
};
</script>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import ENDPOINTS from '../../ENDPOINTS'

defineOptions({ name: 'pages-iam-users-myaccount' })

// Submódulo acessa os serviços do app pelo $getService global (resolução por URI) — equivalente
// ao this.$getService do Options API.
const getService = getCurrentInstance().appContext.config.globalProperties.$getService

const User = ref({})

const breadcrumb = computed(() => [
  { label: 'Home', icon: "fas fa-home", to: "/" },
  { label: 'Minha Conta', icon: "fas fa-user" },
])

const input = computed(() => User.value.input)

function save() {
  if (!User.value.validate()) return false;

  var data = new FormData()
  for (let k in input.value)
    if (k != 'avatar')
      data.set(k, input.value[k]);
  if (input.value.avatar.file) data.set('avatar', input.value.avatar.file)
  // Senha é alterada pelo modal "Alterar Senha" (my-account), não neste save.
  data.delete('ds_password')

  getService('toolcase/loader').load('save-user');
  return getService('toolcase/http').put(ENDPOINTS.USERS.MY_ACCOUNT, data)
    .then(() => {
      getService('toolcase/utils').notify({
        message: "Seus dados foram salvos com sucesso.",
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

function getData() {
  getService('toolcase/loader').load('users-data');
  return getService('toolcase/http').get(ENDPOINTS.USERS.MY_ACCOUNT)
    .then((response) => {
      User.value.read(response.data)
    })
    .catch((error) => {
      getService('toolcase/utils').notifyError(error);
      console.error("An error has occurred on the attempt to retrieve user's data.", error);
    })
    .finally(() => {
      getService('toolcase/loader').loaded('users-data');
    });
}

onMounted(async () => {
  await getService('iam/auth').authenticate();
  getData();
})
</script>
