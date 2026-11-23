<template>
  <div>
    <DataTable v-if="permissions.read" Name="iam-accessprofile-list" :DataURL="endpoints.PROFILES.PROFILE"
      ref="DataTableRef" :Columns="columns" :RowActions="props.RowActions"
      @datatable-fetchdata-before="emit('iam-accessprofile-list-fetch-before')"
      @datatable-fetchdata-after="emit('iam-accessprofile-list-fetch-after')"
      @datatable-fetchdata-error="emit('iam-accessprofile-list-fetch-error')">
    </DataTable>

    <Confirm ref="ConfirmRef" />
  </div>
</template>

<script setup>
// IMPORTS
import { ref, computed, defineExpose } from 'vue'
import permissionService from '../services/permissions'
import ENDPOINTS from '../ENDPOINTS'

// INITIALIZATION
const props = defineProps({
  RowActions: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits([
  'iam-accessprofile-list-fetch-before',
  'iam-accessprofile-list-fetch-after',
  'iam-accessprofile-list-fetch-error',
  'iam-accessprofile-list-remove-before',
  'iam-accessprofile-list-remove-after',
  'iam-accessprofile-list-remove-error',
])


// VARS
const ConfirmRef = ref({})
const endpoints = ENDPOINTS
const DataTableRef = ref({})
const columns = [
  { label: 'Nome', field: 'ds_title' },
  { label: 'Ativo?', field: 'activeText', align: 'center' },
]


// COMPUTED
const permissions = computed(() => ({
  read: permissionService.requireAny([
    'iam.accessprofiles.read',
    'iam.accessprofiles.manage',
  ]),
  manage: permissionService.requireAll('iam.accessprofiles.manage')
}))


// FUNCTIONS
async function remove(row) {
  if (!ConfirmRef.value.ask("Deseja excluir as informações?", 'negative', 'O perfil de acesso será excluído permanentemente e não poderá ser recuperado.')) return false;

  const key = row.ds_key;

  emit('iam-accessprofile-list-remove-before', key)
  try {
    const response = await getService("toolcase/http").delete(`${ENDPOINTS.USERS.USER}/${key}`)
    emit('iam-accessprofile-list-remove-after', response)
  } catch (e) {
    console.error("An error has occurred on the attempt to remove user's data.", e)
    emit('iam-accessprofile-list-remove-error', e)
    throw e
  } finally {
    DataTableRef.value.reload()
  }
}

defineExpose({
  ...DataTableRef.value,
  remove
})
</script>