<template>
  <Page Title="Adicionar Usuário" :Breadcrumb="breadcrumb">
    <Card Title="Dados do Usuário" Icon="fas fa-user-cog">
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

      <UserInfo v-model="User" confirmEmail requiredPass></UserInfo>

      <template #user-profiles>
        <Card Title="Perfis de Acesso" Icon="fas fa-id-card">
          <q-option-group v-model="inputUser.selected_profiles" :options="profiles" color="primary" type="checkbox" />
        </Card>
      </template>

    </Card>
  </Page>
</template>

<script>
// Services:
import Auth from '../../../services/auth.js'
import Permissions from '../../../services/permissions.js'

// Components:
import UserInfo from '../../../components/common/userinfo.vue'

export default {
  name: 'pages-iam-users-create',

  components: {
    UserInfo
  },

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
        { label: 'Adicionar' },
      ]
    },

    input() {
      return { ...this.inputUser, ...this.User.input }
    },
  },

  methods: {
    validateForm() {
      if (this.inputUser.selected_profiles.length < 1) {
        this.$utils.notify({
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
      return this.$http.post('/api/users/v2/user', data)
        .then((response) => {
          this.$router.push(`/iam/user/edit/${response.data.ds_key}`);
          this.$utils.notify({
            message: "O novo usuário foi criado com sucesso.",
            type: 'positive',
            position: 'top-right'
          });
        })
        .catch((error) => {
          this.$utils.notifyError(error.response);
          console.error(error);
        })
        .finally(() => {
          this.$emit('loaded', 'save-user');
        })
    },

    listProfiles() {
      // Retrieve Access Profiles list:
      return this.$http.get('/api/accessprofiles/v1/accessprofile')
        .then((response) => {
          this.profiles = response.data.map(prf => ({
            label: prf.ds_title,
            value: prf.ds_key
          }))
        })
        .catch((error) => {
          this.$utils.notifyError(error.response);
          console.error(error);
        })
    }
  },

  async mounted() {
    this.$emit('load', 'data');
    await this.listProfiles();
    this.$emit('loaded', 'data');
  },

  beforeCreate() {
    Auth.authenticate(this);
    if (!Permissions.validatePermissions({ 'IAM_USER': 'C' }) ||
      !Permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) ||
      !Permissions.validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'CUD' })) this.$router.push('/forbidden');
  },
}
</script>