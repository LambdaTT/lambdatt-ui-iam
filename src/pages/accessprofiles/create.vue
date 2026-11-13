<template>
  <La1Page Title="Adicionar Perfil de Acesso" :Breadcrumb="breadcrumb">
    <Widget Title="Dados do Perfil" Icon="fas fa-id-card"
      :Actions="[{ label: 'Salvar', icon: 'fas fa-save', color: 'positive', textColor: 'white', fn: save }]">
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
  </La1Page>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import ENDPOINTS from '../../ENDPOINTS';

defineOptions({ name: 'pages-iam-accessprofile-create' })

const router = useRouter()
// Submódulo acessa os serviços do app pelo $getService global (resolução por URI) — equivalente
// ao this.$getService do Options API.
const getService = getCurrentInstance().appContext.config.globalProperties.$getService

const input = ref({
  ds_title: null,
  tx_description: null,
})
const inputError = ref({
  ds_title: false,
})

const breadcrumb = computed(() => [
  { label: 'Home', icon: "fas fa-home", to: "/" },
  { label: 'Perfis de Acesso', icon: "fas fa-id-card", to: "/iam/accessprofiles/list" },
  { label: 'Adicionar', icon: 'fas fa-plus' },
])

function validateForm() {
  var isInvalid = false;
  for (let k in inputError.value) {
    let field = input.value[k];
    if ((!field || field == '')) {
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
  return getService('toolcase/http').post(ENDPOINTS.PROFILES.PROFILE, input.value)
    .then((response) => {
      router.push(`/iam/accessprofiles/edit/${response.data.ds_key}`);
      getService('toolcase/utils').notify({
        message: "O novo perfil de acesso foi criado com sucesso.",
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

onMounted(async () => {
  await getService('iam/auth').authenticate();
  if (!getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE': 'C' })) router.push('/error/forbidden');
})
</script>
