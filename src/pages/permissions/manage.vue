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

      <div class="row">
        <div class="col-12 col-md-6">
          <InputField Label="Perfil de Acesso" Icon="fas fa-id-card" type="select" clearable :Options="accessprofiles"
            v-model="profileId" @update:model-value="getPermissions">
          </InputField>
        </div>
        <div class="col-12 col-md-6 q-pa-sm">
          <div class="row justify-end">
            <div class="col-12 col-md-4">
              <q-btn class="full-width" icon="fas fa-plus" color="green" label="Criar"
                @click="showExecPermissionModal = true" :disable="!!profileId == false">
                <q-tooltip>Criar permissão de execução</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </div>

      <template #permissions-tree>
        <div class="text-center" v-if="!!profileId == false">
          <div><q-icon size="lg" name="far fa-folder-open"></q-icon> *</div>
          <div class="text-h6">Não há nada para mostrar.</div>
        </div>

        <div v-if="!!profileId">
          <div class="q-pa-md">
            <label class="text-bold">
              <q-icon name="fas fa-key"></q-icon>
              Permissões por Módulo do Sistema:
            </label>
            <q-list class="q-mt-sm" bordered>
              <div v-for="(mod, index) in permissions" :key="index">
                <q-expansion-item header-class="q-pa-md bg-grey-8 text-white text-h6" expand-icon-class="text-white"
                  bordered group="system-modules" icon="fas fa-cube" :label="mod.ds_title" :default-opened="index == 0">
                  <q-card style="overflow-x: scroll">
                    <q-card-section>
                      <table class="permissions-table full-width">
                        <thead>
                          <tr>
                            <th>ENTIDADE / AÇÃO</th>
                            <th>
                              <q-icon size="xs" name="fas fa-eye"></q-icon><small>&nbsp;(VER)</small>
                            </th>
                            <th>
                              <q-icon size="xs" name="fas fa-plus"></q-icon><small>&nbsp;(CRIAR)</small>
                            </th>
                            <th>
                              <q-icon size="xs" name="fas fa-edit"></q-icon><small>&nbsp;(EDITAR)</small>
                            </th>
                            <th>
                              <q-icon size="xs" name="fas fa-trash"></q-icon><small>&nbsp;(DELETAR)</small>
                            </th>
                            <th>
                              <q-icon size="xs" name="fas fa-play"></q-icon><small>&nbsp;(EXECUTAR)</small>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(prm, idx) in mod.permissions" :key="idx">
                            <td>
                              <span>
                                {{ prm.entity_label }}
                                <small v-if="prm.permission_type == 'C'">({{ prm.permission_key }})</small>
                              </span>
                            </td>
                            <td class="text-center">
                              <q-checkbox @update:model-value="changePermission(prm)" true-value="Y" false-value="N"
                                v-model="prm.do_read" v-if="prm.permission_type == 'E'"></q-checkbox>
                            </td>
                            <td class="text-center">
                              <q-checkbox @update:model-value="changePermission(prm)" true-value="Y" false-value="N"
                                v-model="prm.do_create" v-if="prm.permission_type == 'E'"></q-checkbox>
                            </td>
                            <td class="text-center">
                              <q-checkbox @update:model-value="changePermission(prm)" true-value="Y" false-value="N"
                                v-model="prm.do_update" v-if="prm.permission_type == 'E'"></q-checkbox>
                            </td>
                            <td class="text-center">
                              <q-checkbox @update:model-value="changePermission(prm)" true-value="Y" false-value="N"
                                v-model="prm.do_delete" v-if="prm.permission_type == 'E'"></q-checkbox>
                            </td>
                            <td class="text-center">
                              <q-checkbox @update:model-value="changePermission(prm)" true-value="Y" false-value="N"
                                v-model="prm.do_execute" v-if="prm.permission_type == 'C'"></q-checkbox>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>

                <q-separator></q-separator>
              </div>
            </q-list>
          </div>
        </div>
      </template>
    </Widget>

    <!-- Modal: Create Exec Permission -->
    <Modal Title="Adicionar Permissão de Execução" Icon="fas fa-key" v-model="showExecPermissionModal"
      :Actions="execPermissionModalActions" @hide="resetInput">
      <div>
        <div class="q-pa-xs">
          <p style="border: 1px solid; padding: 5px; background-color: #f0f0f0; font-weight: bold"
            class="text-warning text-justify">
            <i class="fas fa-exclamation-triangle"></i> A permissão de execução é um tipo especial
            de permissão que permite controlar ações específicas do usuário no sistema, como emitir
            relatórios, por exemplo. Quando criada, esta permissão ficará disponível para todos os
            perfis que possuírem acesso ao módulo selecionado e não poderá ser excluída
            posteriormente.
          </p>
        </div>
        <div class="row">
          <div class="col-12 col-md-6">
            <InputField Label="Módulo do Sistema" Icon="fas fa-puzzle-piece" type="select" clearable dense
              :Options="systemModules" :Error="inputError.id_apm_module" @focus="inputError.id_apm_module = false"
              v-model="input.id_apm_module">
            </InputField>
          </div>
          <div class="col-12 col-md-6">
            <InputField Label="Título da Permissão" Icon="fas fa-font" type="text" clearable dense
              v-model="input.ds_title" :error="inputError.ds_title" @focus="inputError.ds_title = false" maxlength="40"
              :disable="!!input.id_apm_module == false"></InputField>
          </div>
          <div class="col-12">
            <InputField Label="Chave da Permissão" Icon="fas fa-key" type="text" clearable dense
              :disable="!!input.id_apm_module == false" maxlength="40" v-model="input.ds_key" :error="inputError.ds_key"
              @focus="inputError.ds_key = false">
              <template #buttons>
                <q-btn dense round flat icon="fas fa-sync" color="primary" @click="generateExecPermissionKey">
                  <q-tooltip>Gerar chave aleatória</q-tooltip>
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

const showExecPermissionModal = ref(false)
const accessprofiles = ref([])
const systemModules = ref([])
const permissions = ref([])
const entityPermissions = ref({})
const customPermissions = ref({})
const profileId = ref(null)
// Input for new exec permissions:
const input = reactive({
  id_apm_module: null,
  ds_title: null,
  ds_key: null,
})
const inputError = reactive({
  id_apm_module: false,
  ds_title: false,
  ds_key: false,
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

  for (let i = 0; i < response.data.length; i++) {
    let profileObj = response.data[i]

    accessprofiles.value.push({
      label: profileObj.ds_title,
      value: profileObj.ds_key,
    })
  }
  getService('toolcase/loader').loaded('list-acessprofiles')
}

async function listSystemModules() {
  getService('toolcase/loader').load('list-system-modules')
  var response = await getService('toolcase/http')
    .get(ENDPOINTS.MOD_CONTROL)
    .catch((error) => {
      getService('toolcase/utils').notifyError(error)
      console.error(error)
    })

  for (let i = 0; i < response.data.length; i++) {
    let moduleObj = response.data[i]

    systemModules.value.push({
      label: moduleObj.ds_title,
      value: moduleObj.id_apm_module,
    })
  }
  getService('toolcase/loader').loaded('list-system-modules')
}

function generateExecPermissionKey() {
  var moduleName
  for (let i = 0; i < systemModules.value.length; i++) {
    if (systemModules.value[i].value == input.id_apm_module)
      moduleName = systemModules.value[i].label.toSlug()
  }
  input.ds_key =
    moduleName +
    '-' +
    (input.ds_title != null ? input.ds_title.toSlug() + '-' : '') +
    getService('toolcase/utils').uniqid()
}

function resetInput() {
  for (let k in input) {
    input[k] = null
    inputError[k] = false
  }
}

async function getPermissions() {
  getService('toolcase/loader').load('get-permissions')
  entityPermissions.value = {}
  customPermissions.value = {}

  if (profileId.value) {
    try {
      const response = await getService('toolcase/http').get(
        `${ENDPOINTS.PROFILES.PERMISSION}/${profileId.value}`,
      )
      permissions.value = response.data
    } catch (err) {
      console.error("An error has occurred on the attempt to get profile's permissions.", err)
      getService('toolcase/utils').notifyError(err)
    }
  }

  getService('toolcase/loader').loaded('get-permissions')
}

async function createExecPermission() {
  if (getService('toolcase/utils').validateForm(input, inputError) == false)
    return

  getService('toolcase/loader').load('create-execpermission')
  await getService('toolcase/http')
    .post(ENDPOINTS.PROFILES.PERMISSION, input)
    .catch((error) => {
      console.error(error)
      getService('toolcase/utils').notifyError(error)
    })

  await getPermissions()

  getService('toolcase/utils').notify({
    message: 'A permissão de execução foi criada com sucesso.',
    type: 'positive',
    position: 'top-right',
  })
  showExecPermissionModal.value = false
  getService('toolcase/loader').loaded('create-execpermission')
}

function changePermission(permission) {
  if (permission.permission_type == 'E')
    entityPermissions.value[permission.permission_key] = permission
  else if (permission.permission_type == 'C') {
    if (Object.prototype.hasOwnProperty.call(customPermissions.value, permission.permission_key))
      delete customPermissions.value[permission.permission_key]
    else customPermissions.value[permission.permission_key] = permission
  }
}

function checkForChanges() {
  return (
    getService('toolcase/utils').objectSize(entityPermissions.value) > 0 ||
    getService('toolcase/utils').objectSize(customPermissions.value) > 0
  )
}

async function save() {
  var payload = {
    entityPermissions: entityPermissions.value,
    customPermissions: customPermissions.value,
  }

  if (getService('toolcase/utils').objectSize(payload) < 1) return

  getService('toolcase/loader').load('save-permissions')
  await getService('toolcase/http')
    .put(`${ENDPOINTS.PROFILES.PERMISSION}/${profileId.value}`, payload)
    .then(() => {
      return getService('iam/permissions').getUserPermissions()
    })
    .catch((error) => {
      console.error(error)
      getService('toolcase/utils').notifyError(error)
    })

  await getPermissions()

  persistentNotifications.add({
    message: 'As permissões do perfil foram alteradas.',
    type: 'positive',
  })

  location.reload()
}

const execPermissionModalActions = [
  {
    label: 'Salvar',
    color: 'green',
    icon: 'save',
    fn: createExecPermission,
  },
]

onMounted(async () => {
  await getService('iam/auth').authenticate()
  if (
    !getService('iam/permissions').validatePermissions({
      IAM_ACCESSPROFILE: 'R',
    }) ||
    !getService('iam/permissions').validatePermissions({
      IAM_ACCESSPROFILE_MODULE: 'R',
    }) ||
    !getService('iam/permissions').validatePermissions({
      IAM_ACCESSPROFILE_PERMISSION: 'RU',
    }) ||
    !getService('iam/permissions').validatePermissions({
      IAM_CUSTOM_PERMISSION: 'CR',
    }) ||
    !getService('iam/permissions').validatePermissions({
      IAM_ACCESSPROFILE_CUSTOM_PERMISSION: 'CRUD',
    })
  )
    router.push('/error/forbidden')

  listProfiles()
  listSystemModules()
  persistentNotifications.showAll()
})
</script>

<style scoped>
.permissions-table,
.permissions-table th,
.permissions-table td {
  padding: 10px;
  border: 1px solid lightgray;
  border-collapse: collapse;
}
</style>
