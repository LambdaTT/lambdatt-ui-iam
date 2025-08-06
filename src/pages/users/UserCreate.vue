<template>
  <La1Page Title="Adicionar Usuário" :Breadcrumb="breadcrumb">
    <La1Card Title="Dados do Usuário" Icon="fas fa-user-cog">
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

      <IamUserInfo v-model="User" confirmEmail requiredPass></IamUserInfo>

      <template #user-profiles>
        <La1Card Title="Perfis de Acesso" Icon="fas fa-id-card">
          <q-option-group v-model="inputUser.selected_profiles" :options="profiles" color="primary" type="checkbox" />
        </La1Card>
      </template>

    </La1Card>
  </La1Page>
</template>

<script>
export default {
  name: 'pages-iam-users-create',

  data() {
    return {
      User: {},
      inputUser: {
        selected_profiles: []
      },
      profiles: []
    }
  },

  computed: {
    breadcrumb() {
      return [
        { label: 'Home', icon: "fas fa-home", to: "/" },
        { label: 'Usuários', icon: "fas fa-users", to: "/iam/users" },
        { label: 'Adicionar', icon: 'fas fa-plus' },
      ]
    },

    input() {
      return { ...this.inputUser, ...this.User.input }
    },
  },

  methods: {
    validateForm() {
      if (this.inputUser.selected_profiles.length < 1) {
        this.$toolcase.services.utils.notify({
          message: "Selecione ao menos 1 perfil de acesso.",
          type: "negative",
          position: 'top-right'
        });
        return false;
      }

      return true;
    },

    save() {
      let hasError = !this.User.validate() |
        !this.validateForm();
      if (hasError) { return false; }

      for (let i = 0; i < this.inputUser.selected_profiles.length; i++) {
        this.inputUser.selected_profiles[i] = { 'ds_key': this.inputUser.selected_profiles[i] };
      }
      this.inputUser.selected_profiles = JSON.stringify(this.inputUser.selected_profiles);

      var data = new FormData()
      for (let k in this.input)
        if (k != 'avatar')
          data.set(k, this.input[k]);
      if (!!this.input.avatar.file) data.set('user_avatar', this.input.avatar.file)

      this.$emit('load', 'save-user');
      return this.$toolcase.services.http.post('/api/iam/users/v1/user', data)
        .then((response) => {
          this.$router.push(`/iam/users/edit/${response.data.ds_key}`);
          this.$toolcase.services.utils.notify({
            message: "O novo usuário foi criado com sucesso.",
            type: 'positive',
            position: 'top-right'
          });
        })
        .catch((error) => {
          this.$toolcase.services.utils.notifyError(error);
          console.error(error);
        })
        .finally(() => {
          this.$emit('loaded', 'save-user');
        })
    },

    listProfiles() {
      // Retrieve Access Profiles list:
      return this.$toolcase.services.http.get('/api/iam/accessprofiles/v1/accessprofile')
        .then((response) => {
          this.profiles = response.data.map(prf => ({
            label: prf.ds_title,
            value: prf.ds_key
          }))
        })
        .catch((error) => {
          this.$toolcase.services.utils.notifyError(error);
          console.error(error);
        })
    }
  },

  async mounted() {
    this.$emit('load', 'data');
    await this.$iam.services.auth.authenticate(this);
    if (!this.$iam.services.permissions.validatePermissions({ 'IAM_USER': 'C' }) ||
      !this.$iam.services.permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) ||
      !this.$iam.services.permissions.validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'CUD' })) this.$router.push('/forbidden');

    await this.listProfiles();
    this.$emit('loaded', 'data');
  },
}
</script>