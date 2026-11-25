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
      <div class="text-h6">Nenhum Perfil de Acesso disponível.</div>
    </div>

    <!-- LOADING STATE -->
    <div v-else-if="state == 'loading'" class="q-pa-lg text-center text-grey-8">
      <div><q-spinner-gears size="lg" /></div>
      <div class="text-caption">Carregando...</div>
    </div>

    <!-- READY STATE -->
    <div v-else-if="state == 'ready'" class="row">
      <div v-for="(column, index) in optionColumns" :key="index" class="col-12 col-md-4">
        <q-option-group :disable="props.readonly || !permissions.manage" v-model="selectedProfiles" :options="column"
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
const getService = getCurrentInstance().appContext.config.globalProperties.$getService;
const moduleExists = getCurrentInstance().appContext.config.globalProperties.$moduleExists;
const emit = defineEmits([
  'iam-accessprofile-selector-fetchlist-before',
  'iam-accessprofile-selector-fetchlist-after',
  'iam-accessprofile-selector-fetchlist-error',
  'iam-accessprofile-selector-save-before',
  'iam-accessprofile-selector-save-after',
  'iam-accessprofile-selector-save-error',
])
const props = defineProps({
  readonly: Boolean,
  color: {
    type: String,
    default: 'primary'
  },
  UserKey: {
    type: String,
    required: true
  }
})
defineExpose({
  getUserKey: () => props.UserKey,
  reload,
  save
})
onMounted(async () => {
  await fetchUserProfiles()
})


// MODEL
const selectedProfiles = defineModel({
  type: Array,
  default: () => []
})


// VARS
const profiles = ref([])
const isLoading = ref(true)
const error = ref(null)
const requiredPermissions = [
  'iam.users.read',
  'iam.users.manage',
]


// COMPUTED
const options = computed(() => profiles.value.map(p => ({
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
async function fetchUserProfiles() {
  isLoading.value = true
  emit('iam-accessprofile-selector-fetchlist-before', props.UserKey)

  try {
    // Fetch profiles
    const { data } = await getService('toolcase/http').get(`${ENDPOINTS.USERS.PROFILES}/${props.UserKey}`)
    profiles.value = data

    // Auto selects pre-selected user's profiles
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      if (p.attached == 'Y')
        selectedProfiles.value.push(p.ds_tag)
    }

    // emits list fetching ending event
    emit('iam-accessprofile-selector-fetchlist-after', data)
  } catch (e) {
    error.value = e
    console.error("An error has occurred on the attempt to retrieve user's profiles.", e)
    toastError(e)
    emit('iam-accessprofile-selector-fetchlist-error', e)
  } finally {
    isLoading.value = false
  }
}
async function reload(){
  await fetchUserProfiles()
}
async function save() {
  isLoading.value = true
  emit('iam-accessprofile-selector-save-before', selectedProfiles.value)
  
  try {
    const payload = { profile_tags: selectedProfiles.value }
    const response = await getService('toolcase/http').put(`${ENDPOINTS.USERS.PROFILES}/${props.UserKey}`, payload)
    emit('iam-accessprofile-selector-save-after', response)
  } catch(e){
    console.error("An error has occurred on the attempt to save user's profiles.", e)
    emit('iam-accessprofile-selector-save-error', e)
    throw e
  } finally{
    isLoading.value = false
  }
}
function toastError(error) {
  if (moduleExists('toolcase'))
    getService('toolcase/utils').notifyError(error)

}
</script>