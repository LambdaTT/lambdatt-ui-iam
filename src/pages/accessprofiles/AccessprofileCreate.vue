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
        this.$toolcase.services.utils.notify({
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
      return this.$toolcase.services.http.post('/api/iam/accessprofiles/v1/accessprofile', this.input)
        .then((response) => {
          this.$router.push(`/iam/access-profiles/edit/${response.data.ds_key}`);
          this.$toolcase.services.utils.notify({
            message: "O novo perfil de acesso foi criado com sucesso.",
            type: 'positive',
            position: 'top-right'
          });
        })
        .catch((error) => {
          this.$toolcase.services.utils.notifyError(error);
          console.error(error);
        })
        .finally(() => {
          this.$emit('loaded', 'save-accessprofile');
        })
    },
  },

  mounted() {
    this.$iam.services.auth.authenticate(this);
    if (!this.$iam.services.permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'C' })) this.$router.push('/forbidden');
  },

  computed: {
    breadcrumb() {
      return [
        { label: 'Home', icon: "fas fa-home", to: "/" },
        { label: 'Perfis de Acesso', icon: "fas fa-id-card", to: "/iam/access-profiles" },
        { label: 'Adicionar', icon: 'fas fa-plus' },
      ]
    }
  }
}
</script>
