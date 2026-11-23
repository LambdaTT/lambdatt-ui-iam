<template>
  <div class="row" v-if="permissions.read">
    <div class="col-12 q-pa-xs" v-if="props.showTitle">
      <div class="q-pa-xs">
        <h1>Informações do Perfil de Acesso</h1>
      </div>
    </div>
    <div class="col-12">
      <InputField :readonly="props.readonly || !permissions.manage" Label="Título" Icon="fas fa-id-card" type="text"
        clearable v-model="input.ds_title" :Error="inputError.ds_title" @focus="inputError.ds_title = false"
        maxlength="40">
      </InputField>
    </div>
    <div class="col-12">
      <InputField :readonly="props.readonly || !permissions.manage" Label="Descrição" Icon="fas fa-info-cricle"
        type="textarea" clearable v-model="input.tx_description">
      </InputField>
    </div>

    <Confirm ref="ConfirmRef" />
  </div>
</template>

<script setup>
// IMPORTS
import { ref, defineExpose, computed, defineModel, defineEmits, onMounted, getCurrentInstance } from 'vue'
import permissionService from '../services/permissions'
import ENDPOINTS from '../ENDPOINTS'


// INITIALIZATION
const props = defineProps({
  readonly: Boolean,
  showTitle: Boolean,
  ProfileKey: {
    type: String,
    default: null
  },
  ProfileTag: {
    type: String,
    default: null
  },
})
defineExpose({
  getKey: () => props.ProfileKey,
  getTag: () => props.ProfileTag,
  validateForm,
  resetInput,
  reload,
  save,
  remove
})
const emit = defineEmits([
  'iam-accessprofile-fetchdata-before',
  'iam-accessprofile-fetchdata-error',
  'iam-accessprofile-fetchdata-after',
  'iam-accessprofile-save-before',
  'iam-accessprofile-save-error',
  'iam-accessprofile-save-after',
  'iam-accessprofile-remove-before',
  'iam-accessprofile-remove-error',
  'iam-accessprofile-remove-after',
])
onMounted(async () => {
  if (props.ProfileKey && typeof props.ProfileKey == 'string')
    await fetchData()
})


// VARS
const ConfirmRef = ref({})
var input = defineModel({
  type: Object,
  default: () => ({
    ds_title: null,
    tx_description: null,
  })
})
var inputError = ref({
  ds_title: false,
})


// COMPUTED
const permissions = computed(() => ({
  read: permissionService.requireAny([
    'iam.accessprofiles.read',
    'iam.accessprofiles.manage',
  ]),
  manage: permissionService.requireAll('iam.accessprofiles.manage')
}))


// FUNCTIONS
const getService = getCurrentInstance().appContext.config.globalProperties.$getService;
const moduleExists = getCurrentInstance().appContext.config.globalProperties.$moduleExists;
function read(values) {
  const updatedInput = { ...input.value };
  for (let key in updatedInput)
    if (key in values)
      updatedInput[key] = values[key];

  input.value = updatedInput;
}
function validateForm() {
  for (let k in inputError.value)
    if (!input.value[k]) {
      inputError.value[k] = true
      toast("Preencha o formulário corretamente", 'negative')
      return false
    }

  return true
}
function resetInput() {
  const clearedInput = { ...input.value };
  for (let key in clearedInput) {
    if (key in inputError.value)
      inputError.value[key] = false;

    clearedInput[key] = null;
  }

  input.value = clearedInput;
}
async function fetchData() {
  if (!permissions.value.read) {
    toast("Você não tem permissão para executar esta ação.", 'negative')
    return
  }

  if (!moduleExists('toolcase')) {
    console.warn("Module 'Toolcase' not present, thus, it was not possible to fetch access profile's data automatically.")
    return
  }

  emit('iam-accessprofile-fetchdata-before')
  try {
    const { data } = await getService('toolcase/http').get(`${ENDPOINTS.PROFILES.PROFILE}/${props.ProfileKey}`)
    read(data)
    emit('iam-accessprofile-fetchdata-after', data)
  } catch (error) {
    console.error("An error has occurred on the attempt to fetch profle's data.", error)
    emit('iam-accessprofile-fetchdata-error', error)
  }

}
async function reload() {
  await fetchData()
}
async function save(validate) {
  if (!permissions.value.manage) {
    toast("Você não tem permissão para executar esta ação.", 'negative')
    return
  }

  if (validate)
    if (!validateForm()) return

  if (!moduleExists('toolcase')) {
    console.warn("Module 'Toolcase' not present, thus, it was not possible to save access profile's data automatically.")
    return
  }

  const method = props.ProfileKey ? 'put' : 'post'
  const url = `${ENDPOINTS.PROFILES.PROFILE}${props.ProfileKey ? `/${props.ProfileKey}` : ''}`

  emit('iam-accessprofile-save-before', input.value)
  try {
    const { data } = await getService('toolcase/http')[method](url, input.value)
    emit('iam-accessprofile-save-after', data)
  } catch (error) {
    console.error("An error has occurred on the attempt to save profile's data.", error)
    emit('iam-accessprofile-save-error', error)
    throw error
  }
}
async function remove() {
  if (!ConfirmRef.value.ask("Deseja excluir as informações?", 'negative', 'O perfil de acesso será excluído permanentemente e não poderá ser recuperado.'))
    return false;

  if (!permissions.value.manage) {
    toast("Você não tem permissão para executar esta ação.", 'negative')
    return
  }

  if (!moduleExists('toolcase')) {
    console.warn("Module 'Toolcase' not present, thus, it was not possible to remove access profile's data automatically.")
    return
  }

  if (!props.ProfileKey) {
    console.warn("No Profile Key was provided, thus, it was not possible to remove access profile's data automatically.")
    return
  }

  emit('iam-accessprofile-remove-before', props.ProfileKey)
  try {
    await getService('toolcase/http').delete(`${ENDPOINTS.PROFILES.PROFILE}/${props.ProfileKey}`)
    emit('iam-accessprofile-remove-after')
  } catch (error) {
    console.error("An error has occurred on the attempt to remove access profile's data.", error)
    emit('iam-accessprofile-remove-error', error)
    throw error
  }
}
function toast(message, type) {
  if (moduleExists('toolcase'))
    getService('toolcase/utils').notify({ message, type })
}
function toastError(error) {
  if (moduleExists('toolcase'))
    getService('toolcase/utils').notifyError(error)

}
</script>