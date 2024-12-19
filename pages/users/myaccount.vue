<template>
  <Page Title="Minha Conta" :Breadcrumb="breadcrumb">
    <Card Title="Meus Dados Pessoais" Icon="fas fa-user">
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

      <UserInfo v-model="User"></UserInfo>
    </Card>
  </Page>
</template>

<script>
// Services:
import { auth } from '../../services.js'

// Components:
import UserInfo from '../../components/userinfo.vue'

export default {
  name: 'pages-iam-users-myaccount',

  components: {
    UserInfo
  },

  data() {
    return {
      User: {}
    }
  },

  computed: {
    breadcrumb() {
      return [
        { label: 'Home', icon: "fas fa-home", to: "/" },
        { label: 'Minha Conta', icon: "fas fa-user" },
      ]
    },

    input() {
      return this.User.input
    }
  },

  methods: {
    save() {
      if (!this.User.validate()) return false;

      var data = new FormData()
      for (let k in this.input)
        if (k != 'avatar')
          data.set(k, this.input[k]);
      if (!!this.input.avatar.file) data.set('user_avatar', this.input.avatar.file)

      this.$emit('load', 'save-user');
      return this.$http.put(`/api/iam/users/v1/my-account`, data)
        .then(() => {
          this.$utils.notify({
            message: "Seus dados foram salvos com sucesso.",
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

    getData() {
      this.$emit('load', 'users-data');
      return this.$http.get(`/api/iam/users/v1/my-account`)
        .then((response) => {
          this.User.read(response.data)
        })
        .catch((error) => {
          this.$utils.notifyError(error.response);
          console.error("An error has occurred on the attempt to retrieve user's data.", error);
        })
        .finally(() => {
          this.$emit('loaded', 'users-data');
        });
    }
  },

  mounted() {
    this.getData();
  },

  beforeCreate() {
    auth.authenticate(this);
  },
}
</script>
