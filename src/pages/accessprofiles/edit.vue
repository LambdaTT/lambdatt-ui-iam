<template>
  <Page Title="Editar Perfil de Acesso" :Breadcrumb="breadcrumb">
    <Widget Title="Dados do Perfil" Icon="fas fa-id-card" :Actions="formActions">
      <div class="row">
        <div class="col-12">
          <InputField Label="Título" Icon="fas fa-id-card" type="text" clearable v-model="input.ds_title"
            :Error="inputError.ds_title" @focus="inputError.ds_title = false" maxlength="40"></InputField>
        </div>
        <div class="col-12">
          <InputField Label="Descrição" Icon="fas fa-info-cricle" type="textarea" clearable
            v-model="input.tx_description">
          </InputField>
        </div>
      </div>
    </Widget>
  </Page>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ENDPOINTS from '../../ENDPOINTS';

defineOptions({ name: 'pages-iam-accessprofile-edit' })

const route = useRoute()
const router = useRouter()
// Submódulo acessa os serviços do app pelo $getService global (resolução por URI) — equivalente
// ao this.$getService do Options API.
const getService = getCurrentInstance().appContext.config.globalProperties.$getService

const permissions = {
  update: getService('iam/permissions').canExecute('profiles.manage'),
  delete: getService('iam/permissions').canExecute('profiles.manage'),
}
const input = ref({
  ds_title: null,
  tx_description: null,
  do_active: null
})
const inputError = ref({
  ds_title: false,
})

const breadcrumb = computed(() => [
  { label: 'Home', icon: "fas fa-home", to: "/" },
  { label: 'Perfis de Acesso', icon: "fas fa-id-card", to: "/iam/accessprofiles/list" },
  { label: 'Editar' },
])

function validateForm() {
  var isInvalid = false;
  for (let k in input.value) {
    let field = input.value[k];
    if ((!field || field == '') && k in inputError.value) {
      inputError.value[k] = true;
      isInvalid = true;
    }
  }

  if (isInvalid) {
    getService('toolcase/utils').notify({
      message: "Preencha o formulário corretamente",
      type: "negative",
      position: 'top-right'
    });
    return false;
  }

  return true;
}

function save() {
  if (!validateForm()) return false;

  getService('toolcase/loader').load('save-accessprofile');
  return getService('toolcase/http').put(`${ENDPOINTS.PROFILES.PROFILE}/${route.params.key}`, input.value)
    .then(() => {
      router.push('/iam/accessprofiles/list');
      getService('toolcase/utils').notify({
        message: "Os dados do perfil de acesso foram salvos com sucesso.",
        type: 'positive',
        position: 'top-right'
      });
    })
    .catch((error) => {
      getService('toolcase/utils').notifyError(error);
      console.error(error);
    })
    .finally(() => {
      getService('toolcase/loader').loaded('save-accessprofile');
    })
}

function remove() {
  if (!confirm('Deseja excluir as informações?')) return false;

  getService('toolcase/loader').load('accessprofile-remove');

  getService('toolcase/http').delete(`${ENDPOINTS.PROFILES.PROFILE}/${route.params.key}`)
    .then(() => {
      getService('toolcase/utils').notify({
        message: 'O perfil foi excluído com sucesso',
        type: 'positive',
        position: 'top-right'
      })
      router.push('/iam/accessprofiles/list');
    })
    .catch((error) => {
      getService('toolcase/utils').notifyError(error);
      console.error(error);
    })
    .finally(() => {
      getService('toolcase/loader').loaded('accessprofile-remove');
    })
}

function getProfileData() {
  // Get Access profile data:
  getService('toolcase/loader').load('profile-data');
  getService('toolcase/http').get(`${ENDPOINTS.PROFILES.PROFILE}/${route.params.key}`)
    .then((response) => {
      for (let k in input.value) {
        if (k in response.data)
          input.value[k] = response.data[k];
      }
    })
    .catch((error) => {
      if (error.response.status == 404) {
        getService('toolcase/utils').notify({
          message: 'Perfil de acesso não encontrado.',
          type: 'negative',
          position: 'top-right'
        })
        router.push('/iam/accessprofiles/list');
        return;
      }
      getService('toolcase/utils').notifyError(error);
      console.error("An error has occurred on the attempt to retrieve user's data.", error);
    })
    .finally(() => {
      getService('toolcase/loader').loaded('profile-data');
    });
}

const formActions = [
  { label: 'Voltar', icon: 'fas fa-undo', color: 'white', textColor: 'primary', outline: true, fn: () => router.go(-1) },
  { label: 'Salvar', icon: 'fas fa-save', color: 'positive', textColor: 'white', hide: !permissions.update, fn: save },
  { label: 'Excluir', icon: 'fas fa-trash-alt', color: 'negative', textColor: 'white', hide: !permissions.delete, fn: remove },
]

onMounted(async () => {
  await getService('iam/auth').authenticate();
  if (!getService('iam/permissions').canExecute('profiles.manage')) router.push('/forbidden');

  getProfileData()
})
</script>
