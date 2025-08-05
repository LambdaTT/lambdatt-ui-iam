<template>
  <Page Title="Editar Usuário" :Breadcrumb="breadcrumb">
    <Card Title="Dados do Usuário" Icon="fas fa-user-cog">
      <template #actions>
        <div class="row justify-end">
          <div v-if="permissions.update" class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn class="full-width" icon="fas fa-save" color="green" label="Salvar" @click="save()">
              <q-tooltip>Salvar dados</q-tooltip>
            </q-btn>
          </div>
          <div v-if="permissions.delete" class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn class="full-width" icon="fas fa-trash-alt" color="red" label="Excluir" @click="remove()">
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

      <UserInfo v-model="User"></UserInfo>

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
import { auth, permissions } from '../../services.js'

// Components:
import UserInfo from '../../components/userinfo.vue'

export default {
  name: 'pages-iam-user-edit',

  components: {
    UserInfo
  },

  data() {
    return {
      // Permissions:
      permissions: {
        update: permissions.validatePermissions({ 'IAM_USER': 'U' }) && permissions.validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'CRUD' }),
        delete: permissions.validatePermissions({ 'IAM_USER': 'D' }) && permissions.validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'D' }),
      },

      // User component:
      User: {},

      // Input
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
        { label: 'Editar', icon: 'fas fa-pen-to-square' },
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
      return this.$http.put(`/api/iam/users/v1/user/${this.$route.params.key}`, data)
        .then(() => {
          this.$router.push('/iam/users');
          this.$utils.notify({
            message: "Os dados do usuário foram salvos com sucesso.",
            type: 'positive',
            position: 'top-right'
          });
        })
        .catch((error) => {
          this.$utils.notifyError(error);
          console.error(error);
        })
        .finally(() => {
          this.$emit('loaded', 'save-user');
        })
    },

    remove() {
      if (!confirm('Deseja excluir as informações?')) return false;

      this.$emit('load', 'user-remove');

      this.$http.delete(`/api/iam/users/v1/user/${this.$route.params.key}`)
        .then(() => {
          this.$utils.notify({
            message: 'O usuário foi excluído com sucesso',
            type: 'positive',
            position: 'top-right'
          })
          this.$router.push('/iam/users');
        })
        .catch((error) => {
          this.$utils.notifyError(error);
          console.error(error);
        })
        .finally(() => {
          this.$emit('loaded', 'user-remove');
        })
    },

    getData() {
      this.$emit('load', 'users-data');
      return this.$http.get(`/api/iam/users/v1/user/${this.$route.params.key}`)
        .then((response) => {
          for (let k in this.inputUser)
            if (k in response.data)
              this.inputUser[k] = response.data[k]
          this.User.read(response.data);
        })
        .catch((error) => {
          if (error.response.status == 404) {
            this.$utils.notify({
              message: 'Usuário não encontrado.',
              type: 'negative',
              position: 'top-right'
            })
            this.$router.push('/iam/users');
            return;
          }

          this.$utils.notifyError(error);
          console.error("An error has occurred on the attempt to retrieve user's data.", error);
        })
        .finally(() => {
          this.$emit('loaded', 'users-data');
        });
    },

    listProfiles() {
      this.$emit('load', 'profiles-list');
      this.$http.get('/api/iam/accessprofiles/v1/accessprofile')
        .then((response) => {
          this.profiles = response.data.map(prf => ({
            label: prf.ds_title,
            value: prf.ds_key
          }));
        })
        .catch((error) => {
          this.$utils.notifyError(error);
          console.error(error);
        })
        .finally(() => {
          this.$emit('loaded', 'profiles-list');
        });
    }
  },

  async mounted() {
    await auth.authenticate(this);
    if (!permissions.validatePermissions({ 'IAM_USER': 'R' }) ||
      !permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) ||
      !permissions.validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'R' })) this.$router.push('/forbidden');

    this.getData()
    this.listProfiles()
  },
}
</script>
