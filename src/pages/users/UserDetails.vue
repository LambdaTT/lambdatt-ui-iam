<template>
  <La1Page Title="Detalhes do Usuário" :Breadcrumb="breadcrumb">
    <La1Card Title="Informações do Usuário" Icon="fas fa-user-cog">
      <template #actions>
        <div class="row justify-end">
          <div class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn class="full-width" icon="fas fa-undo" color="grey-8" label="Voltar" @click="$router.go(-1)">
              <q-tooltip>Voltar à página anterior</q-tooltip>
            </q-btn>
          </div>
        </div>
      </template>

      <IamUserInfo v-model="User" readonly></IamUserInfo>

      <template #audit-info>
        <IamAuditInfo :input="inputUser"></IamAuditInfo>
      </template>

      <template #user-profiles>
        <La1Card Title="Perfis de Acesso" Icon="fas fa-id-card">
          <q-option-group :disable="true" v-model="inputUser.selected_profiles" :options="profiles" color="primary"
            type="checkbox" />
        </La1Card>
      </template>

    </La1Card>
  </La1Page>
</template>

<script>
export default {
  name: 'pages-iam-user-view',

  data() {
    return {
      User: {},

      inputUser: {
        dtCreated: null,
        dtUpdted: null,
        userCreated: null,
        userUpdted: null,
        selected_profiles: []
      },
      profiles: [],
    }
  },

  computed: {
    breadcrumb() {
      return [
        { label: 'Home', icon: "fas fa-home", to: "/" },
        { label: 'Usuários', icon: "fas fa-users", to: "/iam/users" },
        { label: 'Ver Detalhes', icon: 'fas fa-eye' },
      ]
    }
  },

  methods: {
    getData() {
      this.$emit('load', 'users-data');
      return this.$toolcase.services.http.get(`/api/iam/users/v1/user/${this.$route.params.key}`)
        .then((response) => {
          for (let k in this.inputUser)
            if (k in response.data)
              this.inputUser[k] = response.data[k]
          this.User.read(response.data);

        })
        .catch((error) => {
          if (error.response.status == 404) {
            this.$toolcase.services.utils.notify({
              message: 'Usuário não encontrado.',
              type: 'negative',
              position: 'top-right'
            })
            this.$router.push('/iam/users');
            return;
          }

          this.$toolcase.services.utils.notifyError(error);
          console.error("An error has occurred on the attempt to retrieve user's data.", error);
        })
        .finally(() => {
          this.$emit('loaded', 'users-data');
        });
    },

    listProfiles() {
      this.$emit('load', 'profiles-list');
      this.$toolcase.services.http.get('/api/iam/accessprofiles/v1/accessprofile')
        .then((response) => {
          this.profiles = response.data.map(prf => ({
            label: prf.ds_title,
            value: prf.ds_key
          }));
        })
        .catch((error) => {
          this.$toolcase.services.utils.notifyError(error);
          console.error(error);
        })
        .finally(() => {
          this.$emit('loaded', 'profiles-list');
        });
    }
  },

  async mounted() {
    await this.$iam.services.auth.authenticate(this);
    if (!this.$iam.services.permissions.validatePermissions({ 'IAM_USER': 'R' }) ||
      !this.$iam.services.permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) ||
      !this.$iam.services.permissions.validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'R' })) this.$router.push('/forbidden');

    this.getData()
    this.listProfiles()
  },
}
</script>