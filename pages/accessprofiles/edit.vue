<template>
  <Page Title="Editar Perfil de Acesso" :Breadcrumb="breadcrumb">
    <Card Title="Dados do Perfil" Icon="fas fa-id-card">
      <template #actions>
        <div class="row justify-end">
          <div class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn v-if="permissions.update" class="full-width" icon="fas fa-save" color="green" label="Salvar"
              @click="save()">
              <q-tooltip>Salvar dados</q-tooltip>
            </q-btn>
          </div>
          <div class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn v-if="permissions.delete" class="full-width" icon="fas fa-trash-alt" color="red" label="Excluir"
              @click="remove()">
              <q-tooltip>Excluir dados</q-tooltip>
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
        <div class="col-12">
          <InputField Label="Título" Icon="fas fa-id-card" type="text" clearable v-model="input.ds_title"
            :Error="inputError.ds_title" @focus="inputError.ds_title = false" maxlength="40"></InputField>
        </div>
        <div class="col-12">
          <InputField Label="Descrição" Icon="fas fa-info-cricle" type="textarea" clearable
            v-model="input.tx_description">
          </InputField>
        </div>
      </div>

      <template #section-modules>
        <Card Title="Módulos do Perfil" Icon="fas fa-puzzle-piece">
          <q-option-group v-model="selectedModules" :options="modules" color="primary" type="checkbox" />
        </Card>
      </template>
    </Card>
  </Page>
</template>

<script>
// Services:
import Auth from '../../../services/auth.js'
import Permissions from '../../../services/permissions.js'

export default {
  name: 'pages-iam-accessprofile-create',

  data() {
    return {
      permissions: {
        update: Permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'U' }) && Permissions.validatePermissions({ 'IAM_ACCESSPROFILE_MODULE': 'CRUD' }),
        delete: Permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'D' }) && Permissions.validatePermissions({ 'IAM_ACCESSPROFILE_MODULE': 'D' }),
      },
      modules: [],
      selectedModules: [],
      selectedModulesControl: [],
      input: {
        ds_title: null,
        tx_description: null,
        do_active: null
      },
      inputError: {
        ds_title: false,
      }
    }
  },

  watch: {
    async selectedModules() {
      var modKey = this.selectedModulesControl.diff(this.selectedModules)[0];
      // Add:
      if (this.selectedModules.length > this.selectedModulesControl.length) {
        this.selectedModulesControl.push(modKey);
        await this.$http.post(`/api/accessprofiles/v1/module/${this.$route.params.key}/${modKey}`);
      }
      // Remove:
      else if (this.selectedModules.length < this.selectedModulesControl.length) {
        let idx = this.selectedModulesControl.indexOf(modKey);
        this.selectedModulesControl.splice(idx, 1);
        await this.$http.delete(`/api/accessprofiles/v1/module/${this.$route.params.key}/${modKey}`);
      } else return;

      await Permissions.getUserPermissions();
      if (!Permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) ||
        !Permissions.validatePermissions({ 'IAM_ACCESSPROFILE_MODULE': 'R' })) this.$router.push('/forbidden');

      this.getModules();
    }
  },

  methods: {
    validateForm() {
      var isInvalid = false;
      for (let k in this.input) {
        let field = this.input[k];
        if ((!field || field == '') && k in this.inputError) {
          console.log[k];
          this.inputError[k] = true;
          isInvalid = true;
        }
      }

      if (isInvalid) {
        this.$utils.notify({
          message: "Preencha o formulário corretamente",
          type: "negative",
          position: 'top-right'
        });
        return false;
      }

      return true;
    },

    save() {
      if (!this.validateForm()) return false;

      this.$emit('load', 'save-accessprofile');
      return this.$http.put(`/api/accessprofiles/v1/accessprofile/${this.$route.params.key}`, this.input)
        .then(() => {
          this.$router.push('/iam/access-profiles');
          this.$utils.notify({
            message: "Os dados do perfil de acesso foram salvos com sucesso.",
            type: 'positive',
            position: 'top-right'
          });
        })
        .catch((error) => {
          this.$utils.notifyError(error.response);
          console.error(error);
        })
        .finally(() => {
          this.$emit('loaded', 'save-accessprofile');
        })
    },

    remove() {
      if (!confirm('Deseja excluir as informações?')) return false;

      this.$emit('load', 'accessprofile-remove');

      this.$http.delete(`/api/accessprofiles/v1/accessprofile/${this.$route.params.key}`)
        .then(() => {
          this.$utils.notify({
            message: 'O perfil foi excluído com sucesso',
            type: 'positive',
            position: 'top-right'
          })
          this.$router.push('/iam/access-profiles');
        })
        .catch((error) => {
          this.$utils.notifyError(error.response);
          console.error(error);
        })
        .finally(() => {
          this.$emit('loaded', 'accessprofile-remove');
        })
    },

    getModules() {
      return this.$http.get(`/api/accessprofiles/v1/module/${this.$route.params.key}`)
        .then((response) => {
          this.modules = [];
          this.selectedModules = [];
          this.selectedModulesControl = [];

          for (let i = 0; i < response.data.length; i++) {
            let mod = response.data[i];
            this.modules.push({
              'label': mod.ds_title,
              'value': mod.ds_key
            })
            if (mod.checked == 'Y') {
              this.selectedModules.push(mod.ds_key);
              this.selectedModulesControl.push(mod.ds_key);
            }
          }
        })
    },

  },

  created() {
    // Get Access profile data:
    this.$emit('load', 'profile-data');
    this.$http.get(`/api/accessprofiles/v1/accessprofile/${this.$route.params.key}`)
      .then((response) => {
        for (let k in this.input) {
          if (k in response.data)
            this.input[k] = response.data[k];
        }
      })
      .then(() => this.getModules())
      .catch((error) => {
        if (error.response.status == 404) {
          this.$utils.notify({
            message: 'Perfil de acesso não encontrado.',
            type: 'negative',
            position: 'top-right'
          })
          this.$router.push('/iam/access-profiles');
          return;
        }
        this.$utils.notifyError(error.response);
        console.error("An error has occurred on the attempt to retrieve user's data.", error);
      })
      .finally(() => {
        this.$emit('loaded', 'profile-data');
      });
  },

  beforeCreate() {
    Auth.authenticate(this);
    if (!Permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) ||
      !Permissions.validatePermissions({ 'IAM_ACCESSPROFILE_MODULE': 'R' })) this.$router.push('/forbidden');
  },

  computed: {
    breadcrumb() {
      return [
        { label: 'Home', icon: "fas fa-home", to: "/" },
        { label: 'Perfis de Acesso', icon: "fas fa-id-card", to: "/iam/access-profiles" },
        { label: 'Editar' },
      ]
    }
  }
}
</script>
