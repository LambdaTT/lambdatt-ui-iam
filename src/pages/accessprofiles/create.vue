<template>
  <La1Page Title="Adicionar Perfil de Acesso" :Breadcrumb="breadcrumb">
    <La1Card Title="Dados do Perfil" Icon="fas fa-id-card">
      <template #actions>
        <div class="row justify-end">
          <div class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn class="full-width" icon="fas fa-save" color="green" label="Salvar" @click="save()">
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

    </La1Card>
  </La1Page>
</template>

<script>
import ENDPOINTS from '../../ENDPOINTS';

export default {
  name: 'pages-iam-accessprofile-create',

  data() {
    return {
      input: {
        ds_title: null,
        tx_description: null,
      },
      inputError: {
        ds_title: false,
      }
    }
  },

  methods: {
    validateForm() {
      var isInvalid = false;
      for (let k in this.inputError) {
        let field = this.input[k];
        if ((!field || field == '')) {
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
      return this.$getService('toolcase/http').post(ENDPOINTS.PROFILES.PROFILE, this.input)
        .then((response) => {
          this.$router.push(`/iam/accessprofiles/edit/${response.data.ds_key}`);
          this.$getService('toolcase/utils').notify({
            message: "O novo perfil de acesso foi criado com sucesso.",
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
  },

  async mounted() {
    await this.$getService('iam/auth').authenticate();
    if (!this.$getService('iam/permissions').validatePermissions({ 'IAM_ACCESSPROFILE': 'C' })) this.$router.push('/error/forbidden');
  },

  computed: {
    breadcrumb() {
      return [
        { label: 'Home', icon: "fas fa-home", to: "/" },
        { label: 'Perfis de Acesso', icon: "fas fa-id-card", to: "/iam/accessprofiles/list" },
        { label: 'Adicionar', icon: 'fas fa-plus' },
      ]
    }
  }
}
</script>
