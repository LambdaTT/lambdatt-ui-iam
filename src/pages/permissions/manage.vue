<template>
  <Page Title="Gerenciar Permissões" :Breadcrumb="breadcrumb">
    <Widget Title="Permissões por Perfil" Icon="fas fa-key">
      <template #actions>
        <div class="row justify-end">
          <div class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <Btn class="full-width" icon="fas fa-save" color="green" label="Salvar" @click="save()"
              :disable="!checkForChanges()" />
          </div>
          <div class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <Btn class="full-width" icon="fas fa-undo" color="grey-8" label="Voltar" @click="$router.go(-1)" />
          </div>
        </div>
      </template>

      <div class="row items-center">
        <div class="col-12 col-md-6">
          <InputField Label="Perfil de Acesso" Icon="fas fa-id-card" type="select" clearable :Options="accessprofiles"
            v-model="profileKey" @update:model-value="getPermissions">
          </InputField>
        </div>
        <div class="col-12 col-md-6 q-pa-sm">
          <div class="row justify-end">
            <div class="col-12 col-md-4">
              <q-btn class="full-width" icon="fas fa-plus" color="green" label="Criar"
                @click="showPermissionModal = true">
                <q-tooltip>Criar permissão</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center q-pa-md" v-if="!profileKey">
        <div><q-icon size="lg" name="far fa-folder-open"></q-icon></div>
        <div class="text-h6">Selecione um perfil para gerenciar suas permissões.</div>
      </div>

      <div class="q-pa-md" v-else>
        <label class="text-bold">
          <q-icon name="fas fa-key"></q-icon>
          Permissões do Perfil:
        </label>

        <div class="text-center q-pa-md text-grey-7" v-if="permissions.length == 0">
          Não há permissões cadastradas.
        </div>

        <q-list class="q-mt-sm" bordered v-else>
          <q-item v-for="prm in permissions" :key="prm.ds_tag" tag="label">
            <q-item-section avatar>
              <q-checkbox true-value="Y" false-value="N" v-model="prm.attached" color="green"></q-checkbox>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ prm.ds_title }}</q-item-label>
              <q-item-label caption><small>{{ prm.ds_tag }}</small></q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </Widget>

    <!-- Modal: Create Permission -->
    <Modal Title="Criar Permissão" Icon="fas fa-key" v-model="showPermissionModal" :Actions="permissionModalActions"
      @hide="resetInput">
      <div>
        <div class="q-pa-xs">
          <p style="border: 1px solid; padding: 5px; background-color: #f0f0f0; font-weight: bold"
            class="text-warning text-justify">
            <i class="fas fa-exclamation-triangle"></i> Uma permissão é uma etiqueta (tag) de
            execução que controla ações específicas do usuário no sistema. Após criada, a permissão
            ficará disponível para ser atribuída a qualquer perfil de acesso.
          </p>
        </div>
        <div class="row">
          <div class="col-12">
            <InputField Label="Título da Permissão" Icon="fas fa-font" type="text" clearable dense
              v-model="input.ds_title" :error="inputError.ds_title" @focus="inputError.ds_title = false"
              maxlength="40"></InputField>
          </div>
          <div class="col-12">
            <InputField Label="Tag da Permissão" Icon="fas fa-key" type="text" clearable dense maxlength="40"
              v-model="input.ds_tag" :error="inputError.ds_tag" @focus="inputError.ds_tag = false"
              hint="Opcional. Se vazia, será gerada a partir do título.">
              <template #buttons>
                <q-btn dense round flat icon="fas fa-sync" color="primary" @click="generatePermissionTag">
                  <q-tooltip>Gerar tag a partir do título</q-tooltip>
                </q-btn>
              </template>
            </InputField>
          </div>
        </div>
      </div>
    </Modal>
  </Page>
</template>

<script setup>
import { ref, reactive, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import ENDPOINTS from '../../ENDPOINTS'

defineOptions({ name: 'pages-iam-permissions-permissions' })

const router = useRouter()
// Submódulo acessa os serviços/propriedades globais do app pelo globalProperties — equivalente ao
// this.$getService / this.$persistentNotifications do Options API.
const globalProperties = getCurrentInstance().appContext.config.globalProperties
const getService = globalProperties.$getService
const persistentNotifications = globalProperties.$persistentNotifications

const showPermissionModal = ref(false)
const accessprofiles = ref([])
// Flat list of permission records for the selected profile, each carrying an `attached` (Y/N) flag.
const permissions = ref([])
// Baseline attached state per tag, used to diff pending changes before saving.
const original = ref({})
const profileKey = ref(null)

const input = reactive({
  ds_title: null,
  ds_tag: null,
})
const inputError = reactive({
  ds_title: false,
  ds_tag: false,
})

const breadcrumb = computed(() => [
  { label: 'Home', icon: 'fas fa-home', to: '/' },
  { label: 'Permissões', icon: 'fas fa-key' },
])

async function listProfiles() {
  getService('toolcase/loader').load('list-acessprofiles')
  var response = await getService('toolcase/http')
    .get(ENDPOINTS.PROFILES.PROFILE)
    .catch((error) => {
      getService('toolcase/utils').notifyError(error)
      console.error(error)
    })

  accessprofiles.value = []
  for (let i = 0; i < response.data.length; i++) {
    let profileObj = response.data[i]
    accessprofiles.value.push({
      label: profileObj.ds_title,
      value: profileObj.ds_key,
    })
  }
  getService('toolcase/loader').loaded('list-acessprofiles')
}

async function getPermissions() {
  permissions.value = []
  original.value = {}
  if (!profileKey.value) return

  getService('toolcase/loader').load('get-permissions')
  try {
    const response = await getService('toolcase/http').get(
      `${ENDPOINTS.PROFILES.PERMISSION}/${profileKey.value}`,
    )
    permissions.value = (response.data || []).map((p) => ({
      ...p,
      attached: p.attached ?? 'Y',
    }))
    permissions.value.forEach((p) => {
      original.value[p.ds_tag] = p.attached
    })
  } catch (err) {
    console.error("An error has occurred on the attempt to get profile's permissions.", err)
    getService('toolcase/utils').notifyError(err)
  }
  getService('toolcase/loader').loaded('get-permissions')
}

function checkForChanges() {
  return permissions.value.some((p) => p.attached !== original.value[p.ds_tag])
}

async function save() {
  if (!profileKey.value || !checkForChanges()) return

  getService('toolcase/loader').load('save-permissions')
  try {
    const ops = []
    for (const prm of permissions.value) {
      if (prm.attached === original.value[prm.ds_tag]) continue

      const url = `${ENDPOINTS.PROFILES.PERMISSION}/${profileKey.value}/${encodeURIComponent(prm.ds_tag)}`
      if (prm.attached === 'Y') ops.push(getService('toolcase/http').post(url))
      else ops.push(getService('toolcase/http').delete(url))
    }
    await Promise.all(ops)

    // Refresh the logged user's own permissions in case they edited their own profile.
    await getService('iam/permissions').getUserPermissions()
    await getPermissions()

    persistentNotifications.add({
      message: 'As permissões do perfil foram alteradas.',
      type: 'positive',
    })
  } catch (error) {
    console.error(error)
    getService('toolcase/utils').notifyError(error)
  }
  getService('toolcase/loader').loaded('save-permissions')
}

function generatePermissionTag() {
  if (!input.ds_title) return
  input.ds_tag = input.ds_title.toSlug().replace(/-/g, '.')
}

function resetInput() {
  input.ds_title = null
  input.ds_tag = null
  inputError.ds_title = false
  inputError.ds_tag = false
}

async function createPermission() {
  if (!input.ds_title || input.ds_title.trim() === '') {
    inputError.ds_title = true
    return
  }

  getService('toolcase/loader').load('create-permission')
  try {
    let url = `${ENDPOINTS.PERMISSIONS.CREATE}/${encodeURIComponent(input.ds_title.trim())}`
    if (input.ds_tag && input.ds_tag.trim() !== '')
      url += `/${encodeURIComponent(input.ds_tag.trim())}`

    await getService('toolcase/http').post(url)

    await getPermissions()

    getService('toolcase/utils').notify({
      message: 'A permissão foi criada com sucesso.',
      type: 'positive',
      position: 'top-right',
    })
    showPermissionModal.value = false
  } catch (error) {
    console.error(error)
    getService('toolcase/utils').notifyError(error)
  }
  getService('toolcase/loader').loaded('create-permission')
}

const permissionModalActions = [
  {
    label: 'Salvar',
    color: 'green',
    icon: 'save',
    fn: createPermission,
  },
]

onMounted(async () => {
  await getService('iam/auth').authenticate()
  if (!getService('iam/permissions').canExecute('profiles.manage'))
    router.push('/forbidden')

  listProfiles()
  persistentNotifications.showAll()
})
</script>
