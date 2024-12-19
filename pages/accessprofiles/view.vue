<template>
  <Page Title="Detalhes do Perfil de Acesso" :Breadcrumb="breadcrumb">
    <Card Title="Dados do Perfil" Icon="fas fa-id-card">
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
        <AuditInfoBlock :input="userData"></AuditInfoBlock>
      </template>

      <template #section-modules>
        <Card Title="Módulos do Perfil" Icon="fas fa-puzzle-piece">
          <q-option-group disable v-model="selectedModules" :options="modules" color="primary" type="checkbox" />
        </Card>
      </template>

    </Card>
  </Page>
</template>

<script>
// Services:
import {auth, permissions} from '../../services.js'

// Components:
import AuditInfoBlock from '../../components/auditinfo.vue'

export default {
  name: 'pages-iam-accessprofile-create',

  components: {
    AuditInfoBlock
  },

  data() {
    return {
      userData: {},
      modules: [],
      selectedModules: [],
    }
  },

  methods: {
    getModules() {
      return this.$http.get(`/api/accessprofiles/v1/module/${this.$route.params.key}`)
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
    }
  },

  created() {
    // Get Access profile data:
    this.$emit('load', 'profile-data');
    this.$http.get(`/api/accessprofiles/v1/accessprofile/${this.$route.params.key}`)
      .then((response) => {
        this.userData = response.data;
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
    auth.authenticate(this);
    if (!permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) ||
      !permissions.validatePermissions({ 'IAM_ACCESSPROFILE_MODULE': 'R' })) this.$router.push('/forbidden');
  },

  computed: {
    breadcrumb() {
      return [
        { label: 'Home', icon: "fas fa-home", to: "/" },
        { label: 'Perfis de Acesso', icon: "fas fa-id-card", to: "/iam/access-profiles" },
        { label: 'Ver Detalhes' },
      ]
    }
  }
}
</script>
