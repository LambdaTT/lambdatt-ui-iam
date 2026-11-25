<template>
  <div v-if="permissions.read">
    <!-- ERROR STATE -->
    <div v-if="state == 'error'" class="q-pa-lg text-center text-red-3">
      <div><q-icon size="lg" name="fas fa-bomb"></q-icon></div>
      <div class="text-h6">ERRO!</div>
      <div class="text-caption">
        <b>{{ error.response?.status ?? '' }}</b>
        {{ error.response?.statusText ?? '' }}
      </div>
      <small>Favor entrar em contato com o administrador do sistema.</small>
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="state == 'empty'" class="q-pa-lg text-center text-grey-8">
      <div><q-icon size="lg" name="far fa-folder-open"></q-icon> *</div>
      <div class="text-h6">Nenhuma Permissão disponível.</div>
    </div>

    <!-- LOADING STATE -->
    <div v-else-if="state == 'loading'" class="q-pa-lg text-center text-grey-8">
      <div><q-spinner-gears size="lg" /></div>
      <div class="text-caption">Carregando...</div>
    </div>

    <!-- READY STATE -->
    <div v-else-if="state == 'ready'" class="row">
      <div v-for="(column, index) in optionColumns" :key="index" class="col-12 col-md-4">
        <q-option-group :disable="props.readonly || !permissions.manage" v-model="selectedPermissions" :options="column"
          :color="props.color" type="checkbox" />
      </div>
    </div>
  </div>
</template>

<script setup>
// IMPORTS
import { ref, onMounted, computed, getCurrentInstance } from 'vue'
import ENDPOINTS from '../ENDPOINTS'


// INITIALIZATION
const emit = defineEmits([
  'iam-permission-selector-fetchlist-before',
  'iam-permission-selector-fetchlist-after',
  'iam-permission-selector-fetchlist-error',
  'iam-permission-selector-save-before',
  'iam-permission-selector-save-after',
  'iam-permission-selector-save-error',
])
const props = defineProps({
  readonly: Boolean,
  color: {
    type: String,
    default: 'primary'
  },
  ProfileKey: {
    type: String,
    required: true
  }
})
defineExpose({
  getProfileKey: () => props.ProfileKey,
  reload,
  save
})
onMounted(async () => {
  await fetchProfilePermissions()
})


// MODEL
const selectedPermissions = defineModel({
  type: Array,
  default: () => []
})


// VARS
const profilePermissions = ref([])
const isLoading = ref(true)
const error = ref(null)
const requiredPermissions = [
  'iam.users.read',
  'iam.users.manage',
]


// COMPUTED
const options = computed(() => profilePermissions.value.map(p => ({
  label: p.ds_title,
  value: p.ds_tag
})))
const COLUMN_COUNT = 3
const optionColumns = computed(() => {
  const perColumn = Math.ceil(options.value.length / COLUMN_COUNT)
  const columns = []
  for (let i = 0; i < COLUMN_COUNT; i++)
    columns.push(options.value.slice(i * perColumn, (i + 1) * perColumn))
  return columns
})
const state = computed(() => {
  switch (true) {
    case isLoading.value:
      return 'loading';
    case error.value:
      return 'error';
    case options.value.length < 1:
      return 'empty';
    default:
      return 'ready';
  }
})
const permissions = computed(() => ({
  read: getService('iam/permissions').requireAny(requiredPermissions),
  manage: getService('iam/permissions').requireAll(requiredPermissions[1])
}))


// FUNCTIONS
const getService = getCurrentInstance().appContext.config.globalProperties.$getService;
const moduleExists = getCurrentInstance().appContext.config.globalProperties.$moduleExists;
async function fetchProfilePermissions() {
  isLoading.value = true
  emit('iam-permission-selector-fetchlist-before', props.ProfileKey)

  try {
    // Fetch profilePermissions
    const { data } = await getService('toolcase/http').get(`${ENDPOINTS.PROFILES.PERMISSION}/${props.ProfileKey}`)
    profilePermissions.value = data

    // Auto selects pre-selected profile's permissions
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      if (p.attached == 'Y')
        selectedPermissions.value.push(p.ds_tag)
    }

    // emits list fetching ending event
    emit('iam-permission-selector-fetchlist-after', data)
  } catch (e) {
    error.value = e
    console.error("An error has occurred on the attempt to retrieve profile's permissions.", e)
    toastError(e)
    emit('iam-permission-selector-fetchlist-error', e)
  } finally {
    isLoading.value = false
  }
}
async function reload(){
  await fetchProfilePermissions()
}
async function save() {
  isLoading.value = true
  emit('iam-permission-selector-save-before', selectedPermissions.value)
  
  try {
    const payload = { permission_tags: selectedPermissions.value }
    const response = await getService('toolcase/http').put(`${ENDPOINTS.PROFILES.PERMISSION}/${props.ProfileKey}`, payload)
    emit('iam-permission-selector-save-after', response)
  } catch(e){
    console.error("An error has occurred on the attempt to save profile's permissions.", e)
    emit('iam-permission-selector-save-error', e)
    throw e
  } finally{
    isLoading.value = false
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