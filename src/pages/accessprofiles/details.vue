<template>
  <La1Page Title="Detalhes do Perfil de Acesso" :Breadcrumb="breadcrumb">
    <La1Card Title="Dados do Perfil" Icon="fas fa-id-card">
      <template #actions>
        <div class="row justify-end">
          <div class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn class="full-width" icon="fas fa-undo" color="grey-8" label="Voltar" @click="$router.go(-1)">
              <q-tooltip>Voltar à página anterior</q-tooltip>
            </q-btn>
          </div>
        </div>
      </template>

      <div class="row">
        <div class="col-12">
          <InputField Label="Título" Icon="fas fa-id-card" type="text" readonly v-model="userData.ds_title">
          </InputField>
        </div>
        <div class="col-12">
          <InputField Label="Descrição" Icon="fas fa-info-circle" type="textarea" readonly
            v-model="userData.tx_description">
          </InputField>
        </div>
        <div class="col-12 q-pa-sm">
          <q-toggle disable size="lg" trueValue="Y" falseValue="N" color="green" icon="fas fa-check"
            v-model="userData.do_active"
            :label="userData.do_active == 'Y' ? 'Perfil Ativo' : 'Perfil Inativo'"></q-toggle>
        </div>
      </div>

      <template #audit-info>
        <IamAuditInfo :input="userData"></IamAuditInfo>
      </template>

      <template #section-modules>
        <La1Card Title="Módulos do Perfil" Icon="fas fa-puzzle-piece">
          <q-option-group disable v-model="selectedModules" :options="modules" color="primary" type="checkbox" />
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
      userData: {},
      modules: [],
      selectedModules: [],
    }
  },

  computed: {
    breadcrumb() {
      return [
        { label: 'Home', icon: "fas fa-home", to: "/" },
        { label: 'Perfis de Acesso', icon: "fas fa-id-card", to: "/iam/accessprofiles" },
        { label: 'Ver Detalhes' },
      ]
    }
  },

  methods: {
    getModules() {
      return this.$getService('toolcase/http').get(`${ENDPOINTS.PROFILES.MODULE}/${this.$route.params.key}`)
        .then((response) => {
          this.modules = [];
          this.selectedModules = [];

          for (let i = 0; i < response.data.length; i++) {
            let mod = response.data[i];
            this.modules.push({
              'label': mod.ds_title,
              'value': mod.ds_key
            })
            if (mod.checked == 'Y')
              this.selectedModules.push(mod.ds_key);
          }
        })
    },

    getProfileData() {
      // Get Access profile data:
      this.$getService('toolcase/loader').load( 'profile-data');
      this.$getService('toolcase/http').get(`${ENDPOINTS.PROFILES.PROFILE}/${this.$route.params.key}`)
        .then((response) => {
          this.userData = response.data;
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

    this.getProfileData();
  },
}
</script>
