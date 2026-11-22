<template>
  <div class="row">
    <div class="col-12 q-pa-xs" v-if="props.showTitle">
      <div class="q-pa-xs">
        <h1>Informações do Perfil de Acesso</h1>
      </div>
    </div>
    <div class="col-12">
      <InputField :readonly="props.readonly" Label="Título" Icon="fas fa-id-card" type="text" clearable
        v-model="input.ds_title" :Error="inputError.ds_title" @focus="inputError.ds_title = false" maxlength="40">
      </InputField>
    </div>
    <div class="col-12">
      <InputField :readonly="props.readonly" Label="Descrição" Icon="fas fa-info-cricle" type="textarea" clearable
        v-model="input.tx_description">
      </InputField>
    </div>
  </div>
</template>

<script setup>
// IMPORTS
import { ref, defineExpose, defineModel, defineEmits, onMounted, getCurrentInstance } from 'vue'
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
  'iam.accessprofile.fetchdata.before',
  'iam.accessprofile.fetchdata.error',
  'iam.accessprofile.fetchdata.after',
  'iam.accessprofile.save.before',
  'iam.accessprofile.save.error',
  'iam.accessprofile.save.after',
  'iam.accessprofile.remove.before',
  'iam.accessprofile.remove.error',
  'iam.accessprofile.remove.after',
])
onMounted(async () => {
  if (props.ProfileKey && typeof props.ProfileKey == 'string')
    await fetchData()
})


// VARS
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


// FUNCTIONS
const getService = getCurrentInstance().appContext.config.globalProperties.$getService;
const moduleExists = getCurrentInstance().appContext.config.globalProperties.$moduleExists;
function read(values) {
  for (let k in input.value)
    if (k in values)
      input.value[k] = values[k]
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
  for (let k in input.value) {
    if (k in inputError.value)
      inputError.value[k] = false

    input.value[k] = null
  }
}
async function fetchData() {
  if (!moduleExists('toolcase')) {
    console.warn("Module 'Toolcase' not present, thus, it was not possible to fetch access profile's data automatically.")
    return
  }

  emit('iam.accessprofile.fetchdata.before')
  try {
    const { data } = await getService('toolcase/http').get(`${ENDPOINTS.PROFILES.PROFILE}/${props.ProfileKey}`)
    read(data)
    emit('iam.accessprofile.fetchdata.after', data)
  } catch (error) {
    console.error("An error has occurred on the attempt to fetch profle's data.", error)
    toastError(error)
    emit('iam.accessprofile.fetchdata.error', error)
  }

}
async function reload() {
  await fetchData()
}
async function save() {
  if (!validateForm()) return

  if (!moduleExists('toolcase')) {
    console.warn("Module 'Toolcase' not present, thus, it was not possible to save access profile's data automatically.")
    return
  }

  const method = props.ProfileKey ? 'put' : 'post'
  const url = `${ENDPOINTS.PROFILES.PROFILE}${props.ProfileKey ? `/${props.ProfileKey}` : ''}`

  emit('iam.accessprofile.save.before', input.value)
  try {
    const { data } = await getService('toolcase/http')[method](url, input.value)
    toast("Os dados do perfil de acesso foram salvos com sucesso.", "positive")
    emit('iam.accessprofile.save.after', data)
  } catch (error) {
    console.error("An error has occurred on the attempt to save profile's data.", error)
    toastError(error)
    emit('iam.accessprofile.save.error', error)
  }
}
async function remove() {
  if (!moduleExists('toolcase')) {
    console.warn("Module 'Toolcase' not present, thus, it was not possible to remove access profile's data automatically.")
    return
  }

  if (!props.ProfileKey) {
    console.warn("No Profile Key was provided, thus, it was not possible to remove access profile's data automatically.")
    return
  }

  emit('iam.accessprofile.remove.before', props.ProfileKey)
  try {
    await getService('toolcase/http').delete(`${ENDPOINTS.PROFILES.PROFILE}/${props.ProfileKey}`)
    toast("O perfil de acesso foi excluído com sucesso.", 'positive')
    emit('iam.accessprofile.remove.after')
  } catch (error) {
    console.error("An error has occurred on the attempt to remove access profile's data.", error)
    toastError(error)
    emit('iam.accessprofile.remove.error', error)

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