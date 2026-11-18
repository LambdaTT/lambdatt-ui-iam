<template>
  <Page Title="Detalhes do Perfil de Acesso" :Breadcrumb="breadcrumb">
    <Widget Title="Dados do Perfil" Icon="fas fa-id-card"
      :Actions="[{ label: 'Voltar', icon: 'fas fa-undo', color: 'white', textColor: 'primary', outline: true, fn: () => router.go(-1) }]">
      <div class="row">
        <div class="col-12">
          <InputField Label="Título" Icon="fas fa-id-card" type="text" readonly v-model="userData.ds_title">
          </InputField>
        </div>
        <div class="col-12">
          <InputField Label="Descrição" Icon="fas fa-info-circle" type="textarea" readonly
            v-model="userData.tx_description">
          </InputField>
        </div>
        <div class="col-12 q-pa-sm">
          <q-toggle disable size="lg" trueValue="Y" falseValue="N" color="green" icon="fas fa-check"
            v-model="userData.do_active"
            :label="userData.do_active == 'Y' ? 'Perfil Ativo' : 'Perfil Inativo'"></q-toggle>
        </div>
      </div>

      <template #audit-info>
        <AuditBlock :input="userData"></AuditBlock>
      </template>
    </Widget>
  </Page>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ENDPOINTS from '../../ENDPOINTS';

defineOptions({ name: 'pages-iam-accessprofile-details' })

const route = useRoute()
const router = useRouter()
// Submódulo acessa os serviços do app pelo $getService global (resolução por URI) — equivalente
// ao this.$getService do Options API.
const getService = getCurrentInstance().appContext.config.globalProperties.$getService

const userData = ref({})

const breadcrumb = computed(() => [
  { label: 'Home', icon: "fas fa-home", to: "/" },
  { label: 'Perfis de Acesso', icon: "fas fa-id-card", to: "/iam/accessprofiles/list" },
  { label: 'Ver Detalhes' },
])

function getProfileData() {
  // Get Access profile data:
  getService('toolcase/loader').load('profile-data');
  getService('toolcase/http').get(`${ENDPOINTS.PROFILES.PROFILE}/${route.params.key}`)
    .then((response) => {
      userData.value = response.data;
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

onMounted(async () => {
  await getService('iam/auth').authenticate();
  if (!getService('iam/permissions').canExecute('profiles.manage')) router.push('/forbidden');

  getProfileData();
})
</script>
