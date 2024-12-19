<template>
  <Page Title="Gerenciar Permissões" :Breadcrumb="breadcrumb">
    <Card Title="Permissões por Perfil" Icon="fas fa-key">
      <template #actions>
        <div class="row justify-end">
          <div class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn class="full-width" icon="fas fa-save" color="green" label="Salvar" @click="save()"
              :disable="!checkForChanges()">
              <q-tooltip>Salvar dados</q-tooltip>
            </q-btn>
          </div>
          <div class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn class="full-width" icon="fas fa-undo" color="grey-8" label="Voltar" @click="$router.go(-1)">
              <q-tooltip>Voltar à página anterior</q-tooltip>
            </q-btn>
          </div>
        </div>
      </template>

      <div class="row">
        <div class="col-12 col-md-6">
          <InputField Label="Perfil de Acesso" Icon="fas fa-id-card" type=select clearable :Options="accessprofiles"
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
          <div>
            <q-icon size="lg" name="far fa-folder-open"></q-icon> *
          </div>
          <div class="text-h6">
            Não há nada para mostrar.
          </div>
        </div>

        <div v-if="!!profileId">
          <div class="q-pa-md">
            <label class="text-bold">
              <q-icon name="fas fa-key"></q-icon>
              Permissões por Módulo do Sistema:
            </label>
            <q-list class="q-mt-sm" bordered>
              <div v-for="(mod, index) in permissions">
                <q-expansion-item header-class="q-pa-md bg-grey-8 text-white text-h6" expand-icon-class="text-white"
                  bordered group="system-modules" icon="fas fa-cube" :label="mod.ds_title" :default-opened="index == 0">
                  <q-card>
                    <q-card-section>
                      <table class="permissions-table full-width">
                        <thead>
                          <tr>
                            <th>ENTIDADE / AÇÃO</th>
                            <th><q-icon size="xs" name="fas fa-eye"></q-icon><small>&nbsp;(VER)</small></th>
                            <th><q-icon size="xs" name="fas fa-plus"></q-icon><small>&nbsp;(CRIAR)</small></th>
                            <th><q-icon size="xs" name="fas fa-edit"></q-icon><small>&nbsp;(EDITAR)</small></th>
                            <th><q-icon size="xs" name="fas fa-trash"></q-icon><small>&nbsp;(DELETAR)</small></th>
                            <th><q-icon size="xs" name="fas fa-play"></q-icon><small>&nbsp;(EXECUTAR)</small></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(prm, idx) in mod.permissions">
                            <td><span>
                                {{ prm.entity_label }}
                                <small v-if="prm.permission_type == 'C'">({{ prm.permission_key }})</small>
                              </span></td>
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
    </Card>

    <!-- Modal: Create Exec Permission -->
    <Modal Title="Adicionar Permissão de Execução" Icon="fas fa-key" Persistent v-model="showExecPermissionModal"
      :Actions="execPermissionModalActions" @hide="resetInput">
      <div>
        <div class=" q-pa-xs">
          <p style="border:1px solid; padding:5px; background-color:#f0f0f0; font-weight: bold;"
            class="text-warning text-justify">
            <i class="fas fa-exclamation-triangle"></i> A permissão de execução é um tipo
            especial de permissão que permite controlar ações específicas do usuário no sistema, como emitir relatórios,
            por
            exemplo. Quando criada, esta permissão ficará disponível para todos os perfis que possuírem acesso ao módulo
            selecionado e não poderá ser excluída posteriormente.
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

<script>
// Services:
import Auth from '../../../services/auth.js'
import Permissions from '../../../services/permissions.js'

export default {
  name: 'pages-iam-permissions-permissions',

  data() {
    return {
      showExecPermissionModal: false,
      accessprofiles: [],
      systemModules: [],
      permissions: [],
      entityPermissions: {},
      customPermissions: {},
      profileId: null,
      // Input for new exec permissions:
      input: {
        id_apm_module: null,
        ds_title: null,
        ds_key: null
      },
      inputError: {
        id_apm_module: false,
        ds_title: false,
        ds_key: false
      },
      execPermissionModalActions: [
        { label: 'Salvar', color: 'green', icon: 'save', fn: this.createExecPermission }
      ]
    }
  },

  methods: {
    async listProfiles() {
      this.$emit('load', 'list-acessprofiles');
      var response = await this.$http.get('/api/accessprofiles/v1/accessprofile?do_active=Y')
        .catch((error) => {
          this.$utils.notifyError(error.response);
          console.error(error);
        });

      for (let i = 0; i < response.data.length; i++) {
        let profileObj = response.data[i];

        this.accessprofiles.push({
          'label': profileObj.ds_title,
          'value': profileObj.ds_key
        });
      }
      this.$emit('loaded', 'list-acessprofiles');
    },

    async listSystemModules() {
      this.$emit('load', 'list-system-modules');
      var response = await this.$http.get('/api/applicationmodules/v1/module')
        .catch((error) => {
          this.$utils.notifyError(error.response);
          console.error(error);
        });

      for (let i = 0; i < response.data.length; i++) {
        let moduleObj = response.data[i];

        this.systemModules.push({
          'label': moduleObj.ds_title,
          'value': moduleObj.id_apm_module
        });
      }
      this.$emit('loaded', 'list-system-modules');
    },

    generateExecPermissionKey() {
      var moduleName;
      for (let i = 0; i < this.systemModules.length; i++) {
        if (this.systemModules[i].value == this.input.id_apm_module)
          moduleName = this.systemModules[i].label.toSlug();
      }
      this.input.ds_key = moduleName + '-' + (this.input.ds_title != null ? this.input.ds_title.toSlug() + "-" : "") + this.$utils.uniqid();
    },

    resetInput() {
      for (let k in this.input) {
        this.input[k] = null;
        this.inputError[k] = false;
      }
    },

    async getPermissions() {
      this.$emit('load', 'get-permissions');
      this.entityPermissions = {};
      this.customPermissions = {};

      if (!!this.profileId) {
        var response = await this.$http.get(`/api/accessprofiles/v1/permission/${this.profileId}`).catch(function (response) {
          console.error("An error has occurred on the attempt to get profile's permissions.", response);
          this.$utils.notifyError(response);
        });

        this.permissions = response.data;
      }

      this.$emit('loaded', 'get-permissions');
    },

    async createExecPermission() {
      if (this.$utils.validateForm(this.input, this.inputError) == false) return;

      this.$emit('load', 'create-execpermission');
      await this.$http.post('/api/accessprofiles/v1/permission', this.input)
        .catch((error) => {
          console.error(error);
          this.$utils.notifyError(error);
        });

      await this.getPermissions();

      this.$utils.notify({
        message: "A permissão de execução foi criada com sucesso.",
        type: 'positive',
        position: 'top-right'
      });
      this.showExecPermissionModal = false;
      this.$emit('loaded', 'create-execpermission');
    },

    changePermission(permission) {
      if (permission.permission_type == 'E')
        this.entityPermissions[permission.permission_key] = permission;
      else if (permission.permission_type == 'C') {
        if (this.customPermissions.hasOwnProperty(permission.permission_key))
          delete this.customPermissions[permission.permission_key];
        else
          this.customPermissions[permission.permission_key] = permission;
      }
    },

    checkForChanges() {
      return (this.$utils.objectSize(this.entityPermissions) > 0 || this.$utils.objectSize(this.customPermissions) > 0);
    },

    async save() {
      var input = {
        entityPermissions: this.entityPermissions,
        customPermissions: this.customPermissions,
      };

      if (this.$utils.objectSize(input) < 1) return;

      this.$emit('load', 'save-permissions');
      await this.$http.put(`/api/accessprofiles/v1/permission/${this.profileId}`, input)
        .then(() => {
          return this.$http.get('/api/permissions/v1/user-permissions');
        })
        .then((response) => {
          localStorage.removeItem('regularPermissions');
          this.$localData.insert('regularPermissions', response.data.regularPermissions);
          localStorage.removeItem('customPermissions');
          this.$localData.insert('customPermissions', response.data.customPermissions);
        })
        .catch(function (error) {
          console.error(error);
          this.$utils.notifyError(error);
        })

      await this.getPermissions();

      this.$persistentNotifications.add({
        message: "As permissões do perfil foram alteradas.",
        type: 'positive',
      });

      location.reload();
    }
  },

  computed: {
    breadcrumb() {
      return [
        { label: 'Home', icon: "fas fa-home", to: "/" },
        { label: 'Permissões', icon: "fas fa-key" },
      ]
    }
  },

  created() {
    this.listProfiles();
    this.listSystemModules();
    this.$persistentNotifications.showAll();
  },

  beforeCreate() {
    Auth.authenticate(this);
    if (!Permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) ||
      !Permissions.validatePermissions({ 'IAM_ACCESSPROFILE_MODULE': 'R' }) ||
      !Permissions.validatePermissions({ 'IAM_ACCESSPROFILE_PERMISSION': 'RU' }) ||
      !Permissions.validatePermissions({ 'IAM_CUSTOM_PERMISSION': 'CR' }) ||
      !Permissions.validatePermissions({ 'IAM_ACCESSPROFILE_CUSTOM_PERMISSION': 'CRUD' })) this.$router.push('/forbidden');
  }
}
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