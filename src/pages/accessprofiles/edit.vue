<template>
  <La1Page Title="Editar Perfil de Acesso" :Breadcrumb="breadcrumb">
    <La1Card Title="Dados do Perfil" Icon="fas fa-id-card">
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
        <La1Card Title="Módulos do Perfil" Icon="fas fa-puzzle-piece">
          <q-option-group v-model="selectedModules" :options="modules" color="primary" type="checkbox" />
        </La1Card>
      </template>
    </La1Card>
  </La1Page>
</template>

<script>
import ENDPOINTS from '../../ENDPOINTS';

export const __PAGE_CONFIG = {
  params: ['key']
}

export default {
  name: 'pages-iam-accessprofile-create',

  data() {
    return {
      permissions: {
        update: this.$getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE': 'U' }) && this.$getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE_MODULE': 'CRUD' }),
        delete: this.$getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE': 'D' }) && this.$getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE_MODULE': 'D' }),
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

  computed: {
    breadcrumb() {
      return [
        { label: 'Home', icon: "fas fa-home", to: "/" },
        { label: 'Perfis de Acesso', icon: "fas fa-id-card", to: "/iam/accessprofiles" },
        { label: 'Editar' },
      ]
    }
  },

  watch: {
    async selectedModules() {
      var modKey = this.selectedModulesControl.diff(this.selectedModules)[0];
      // Add:
      if (this.selectedModules.length > this.selectedModulesControl.length) {
        this.selectedModulesControl.push(modKey);
        await this.$getService('toolcase/http').post(`${ENDPOINTS.PROFILES.MODULE}/${this.$route.params.key}/${modKey}`);
      }
      // Remove:
      else if (this.selectedModules.length < this.selectedModulesControl.length) {
        let idx = this.selectedModulesControl.indexOf(modKey);
        this.selectedModulesControl.splice(idx, 1);
        await this.$getService('toolcase/http').delete(`${ENDPOINTS.PROFILES.MODULE}/${this.$route.params.key}/${modKey}`);
      } else return;

      await this.$getService('iam/permissions').getUserPermissions();
      if (!this.$getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) ||
        !this.$getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE_MODULE': 'R' })) this.$router.push('/error/forbidden');

      this.getModules();
    }
  },

  methods: {
    validateForm() {
      var isInvalid = false;
      for (let k in this.input) {
        let field = this.input[k];
        if ((!field || field == '') && k in this.inputError) {
          this.inputError[k] = true;
          isInvalid = true;
        }
      }

      if (isInvalid) {
        this.$getService('toolcase/utils').notify({
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

      this.$getService('toolcase/loader').load( 'save-accessprofile');
      return this.$getService('toolcase/http').put(`${ENDPOINTS.PROFILES.PROFILE}/${this.$route.params.key}`, this.input)
        .then(() => {
          this.$router.push('/iam/accessprofiles/list');
          this.$getService('toolcase/utils').notify({
            message: "Os dados do perfil de acesso foram salvos com sucesso.",
            type: 'positive',
            position: 'top-right'
          });
        })
        .catch((error) => {
          this.$getService('toolcase/utils').notifyError(error);
          console.error(error);
        })
        .finally(() => {
          this.$getService('toolcase/loader').loaded( 'save-accessprofile');
        })
    },

    remove() {
      if (!confirm('Deseja excluir as informações?')) return false;

      this.$getService('toolcase/loader').load( 'accessprofile-remove');

      this.$getService('toolcase/http').delete(`${ENDPOINTS.PROFILES.PROFILE}/${this.$route.params.key}`)
        .then(() => {
          this.$getService('toolcase/utils').notify({
            message: 'O perfil foi excluído com sucesso',
            type: 'positive',
            position: 'top-right'
          })
          this.$router.push('/iam/accessprofiles/list');
        })
        .catch((error) => {
          this.$getService('toolcase/utils').notifyError(error);
          console.error(error);
        })
        .finally(() => {
          this.$getService('toolcase/loader').loaded( 'accessprofile-remove');
        })
    },

    getModules() {
      return this.$getService('toolcase/http').get(`${ENDPOINTS.PROFILES.MODULE}/${this.$route.params.key}`)
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

    getProfileData() {
      // Get Access profile data:
      this.$getService('toolcase/loader').load( 'profile-data');
      this.$getService('toolcase/http').get(`${ENDPOINTS.PROFILES.PROFILE}/${this.$route.params.key}`)
        .then((response) => {
          for (let k in this.input) {
            if (k in response.data)
              this.input[k] = response.data[k];
          }
        })
        .then(() => this.getModules())
        .catch((error) => {
          if (error.response.status == 404) {
            this.$getService('toolcase/utils').notify({
              message: 'Perfil de acesso não encontrado.',
              type: 'negative',
              position: 'top-right'
            })
            this.$router.push('/iam/accessprofiles');
            return;
          }
          this.$getService('toolcase/utils').notifyError(error);
          console.error("An error has occurred on the attempt to retrieve user's data.", error);
        })
        .finally(() => {
          this.$getService('toolcase/loader').loaded( 'profile-data');
        });
    }

  },

  async mounted() {
    await this.$getService('iam/auth').authenticate();
    if (!this.$getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) ||
      !this.$getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE_MODULE': 'R' })) this.$router.push('/error/forbidden');

    this.getProfileData()
  },
}
</script>
