<template>
  <Page Title="Detalhes do Usuário" :Breadcrumb="breadcrumb">
    <Card Title="Informações do Usuário" Icon="fas fa-user-cog">
      <template #actions>
        <div class="row justify-end">
          <div class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn class="full-width" icon="fas fa-undo" color="grey-8" label="Voltar" @click="$router.go(-1)">
              <q-tooltip>Voltar à página anterior</q-tooltip>
            </q-btn>
          </div>
        </div>
      </template>

      <UserInfo v-model="User" readonly></UserInfo>

      <template #audit-info>
        <AuditInfoBlock :input="inputUser"></AuditInfoBlock>
      </template>

      <template #user-profiles>
        <Card Title="Perfis de Acesso" Icon="fas fa-id-card">
          <q-option-group :disable="true" v-model="inputUser.selected_profiles" :options="profiles" color="primary"
            type="checkbox" />
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
import AuditInfoBlock from '../../components/auditinfo.vue'

export default {
  name: 'pages-iam-user-view',

  components: {
    AuditInfoBlock,
    UserInfo,
  },

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
        { label: 'Ver Detalhes' },
      ]
    }
  },

  methods: {
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

          this.$utils.notifyError(error.response);
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
          this.$utils.notifyError(error.response);
          console.error(error);
        })
        .finally(() => {
          this.$emit('loaded', 'profiles-list');
        });
    }
  },

  mounted() {
    this.getData()
    this.listProfiles()
  },

  beforeCreate() {
    auth.authenticate(this);
    if (!permissions.validatePermissions({ 'IAM_USER': 'R' }) ||
      !permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) ||
      !permissions.validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'R' })) this.$router.push('/forbidden');
  }
}
</script>