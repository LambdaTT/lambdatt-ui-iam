<template>
  <Page Title="Gerenciar Perfis de Acesso" :Breadcrumb="breadcrumb">
    <Widget Title="Perfis Cadastrados" Icon="fas fa-id-card"
      :Actions="[{ label: 'Adicionar', icon: 'fas fa-plus', color: 'positive', textColor: 'white', fn: () => router.push('/iam/accessprofiles/create') }]">
      <DataTable Name="accessprofile-list" :DataURL="ENDPOINTS.PROFILES.PROFILE" v-model="Datatable" :Columns="columns"
        :RowActions="rowActions">
      </DataTable>

    </Widget>
  </Page>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import ENDPOINTS from '../../ENDPOINTS';

defineOptions({ name: 'pages-iam-accessprofile-list' })

const router = useRouter()
// Submódulo acessa os serviços do app pelo $getService global (resolução por URI) — equivalente
// ao this.$getService do Options API.
const getService = getCurrentInstance().appContext.config.globalProperties.$getService

// Permissions (flat tag-based model):
const permissions = {
  create: getService('iam/permissions').canExecute('profiles.manage'),
  update: getService('iam/permissions').canExecute('profiles.manage'),
  delete: getService('iam/permissions').canExecute('profiles.manage'),
}

// Datatable:
const Datatable = ref({})

const breadcrumb = computed(() => [
  { label: 'Home', icon: "fas fa-home", to: "/" },
  { label: 'Perfis de Acesso', icon: "fas fa-id-card" },
])

const columns = computed(() => [
  { label: 'Nome', field: 'ds_title' },
  { label: 'Ativo?', field: 'activeText', align: 'center' },
])

const rowActions = computed(() => [
  { icon: 'fas fa-eye', label: 'Visualizar', tooltip: 'Ver Detalhes', fn: (row) => { router.push(`/iam/accessprofiles/details/${row.ds_key}`) } },
  { icon: 'fas fa-edit', label: 'Editar', tooltip: 'Editar Informações', hide: !permissions.update, fn: (row) => { router.push(`/iam/accessprofiles/edit/${row.ds_key}`) } },
  { icon: 'fas fa-trash-alt', label: 'Excluir', tooltip: 'Excluir Perfil de Acesso', hide: !permissions.delete, fn: remove },
])

function remove(row) {
  if (!confirm('Deseja excluir as informações?')) return false;

  getService('toolcase/loader').load('accessprofile-remove');

  var key = row.ds_key;
  getService('toolcase/http').delete(`${ENDPOINTS.PROFILES.PROFILE}/${key}`)
    .then(() => {
      getService('toolcase/utils').notify({
        message: 'O perfil foi excluído com sucesso',
        type: 'positive',
        position: 'top-right'
      })
    })
    .catch((error) => {
      getService('toolcase/utils').notifyError(error);
      console.error("An error occurred on the attempt to delete accessprofile.", error);
    })
    .finally(() => {
      Datatable.value.reload();
      getService('toolcase/loader').loaded('accessprofile-remove');
    });

}

onMounted(() => {
  getService('iam/auth').authenticate();
  if (!getService('iam/permissions').canExecute('profiles.manage')) router.push('/forbidden');
})
</script>
