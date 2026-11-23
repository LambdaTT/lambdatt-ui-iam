<template>
  <div v-if="permissions.read">
    <DataTable Name="iam-user-list" :DataURL="endpoints.USERS.USER" ref="DataTableRef" :Columns="columns"
      :RowActions="props.RowActions" @datatable-fetchdata-before="emit('iam-user-list-fetch-before')"
      @datatable-fetchdata-after="emit('iam-user-list-fetch-after')"
      @datatable-fetchdata-error="emit('iam-user-list-fetch-error')">
      <template #cell-avatar="row">
        <div class="q-pa-sm text-center">
          <q-avatar>
            <q-img class="user-avatar-img" :src="row.data.ds_avatar_img_url
              ? row.data.ds_avatar_img_url
              : '/resources/img/unknown-user.jpg'
              "></q-img>
          </q-avatar>
        </div>
      </template>
    </DataTable>
    <Confirm ref="ConfirmRef" />
  </div>
</template>

<script setup>
// IMPORTS
import { ref, computed, getCurrentInstance } from 'vue'
import permissionService from '../services/permissions'
import ENDPOINTS from '../ENDPOINTS'


// INITIALIZATION
const getService = getCurrentInstance().appContext.config.globalProperties.$getService;
const props = defineProps({
  RowActions: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits([
  'iam-user-list-fetch-before',
  'iam-user-list-fetch-after',
  'iam-user-list-fetch-error',
  'iam-user-list-remove-before',
  'iam-user-list-remove-after',
  'iam-user-list-remove-error',
])


// VARS
const endpoints = ENDPOINTS
const DataTableRef = ref({})
const ConfirmRef = ref({})
const columns = [
  {
    name: "avatar",
    field: "avatar",
    label: "Avatar",
    sortable: false,
    searchable: false,
  },
  { label: "Nome", field: "fullName" },
  { label: "E-mail", field: "ds_email" },
  {
    label: "Último Acesso",
    field: "dtLastAccess",
    sorBy: "dt_last_access",
  },
]
const userPermissions = [
  'iam.users.read',
  'iam.users.manage',
]


// COMPUTED
const permissions = computed(() => ({
  read: permissionService.requireAny(userPermissions),
  manage: permissionService.requireAll(userPermissions[1])
}))


// FUNCTIONS
async function remove(row) {
  if (!ConfirmRef.value.ask("Deseja excluir as informações?", 'negative', 'O usuário será excluído permanentemente e não poderá ser recuperado.'))
    return false;

  const key = row.ds_key;

  emit('iam-user-list-remove-before', key)
  try {
    const response = await getService("toolcase/http").delete(`${ENDPOINTS.USERS.USER}/${key}`)
    emit('iam-user-list-remove-after', response)
  } catch (e) {
    console.error("An error has occurred on the attempt to remove user's data.", e)
    emit('iam-user-list-remove-error', e)
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