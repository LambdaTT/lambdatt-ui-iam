<template>
  <Page Title="Gerenciar Usuários" :Breadcrumb="breadcrumb">
    <Card Title="Usuários Cadastrados" Icon="fas fa-user-cog">
      <template #actions>
        <div class="row justify-end">
          <div class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn v-if="permissions.create" class="full-width" icon="fas fa-plus" color="green" label="Adicionar"
              to="/iam/users/new">
              <q-tooltip>Adicionar novo usuário</q-tooltip>
            </q-btn>
          </div>
        </div>
      </template>

      <DataTable Name="user-list" DataURL="/api/iam/users/v1/user" v-model="Datatable" :Columns="columns"
        :RowActions="rowActions">
        <template #cell-avatar="row">
          <div class="q-pa-sm text-center">
            <q-avatar>
              <q-img class="user-avatar-img"
                :src="row.data.ds_avatar_img_url ? row.data.ds_avatar_img_url : '/resources/img/unknown-user.jpg'"></q-img>
            </q-avatar>
          </div>
        </template>
      </DataTable>

    </Card>
  </Page>
</template>

<script>
// Services:
import {auth, permissions} from '../../services.js'

export default {
  name: 'pages-iam-user-list',

  data() {
    return {
      // Permissions:
      permissions: {
        create: permissions.validatePermissions({ 'IAM_USER': 'C' }) && permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) && permissions.validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'CUD' }),
        update: permissions.validatePermissions({ 'IAM_USER': 'U' }) && permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) && permissions.validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'CRUD' }),
        delete: permissions.validatePermissions({ 'IAM_USER': 'D' }) && permissions.validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'D' }),
      },

      //  Datatable:
      Datatable: {},
    }
  },

  computed: {
    breadcrumb() {
      return [
        { label: 'Home', icon: "fas fa-home", to: "/" },
        { label: 'Usuários', icon: "fas fa-users" },
      ]
    },

    columns() {
      return [
        {
          name: 'avatar',
          field: 'avatar',
          label: 'Avatar',
          sort: false,
          searchable: false,
        },
        { label: 'Nome', field: 'fullName', sort: 6 },
        { label: 'E-mail', field: 'ds_email', sort: 3 },
        { label: 'Último Acesso', field: 'dtLastAccess', sort: 7 },
      ]
    },

    rowActions() {
      return [
        { icon: 'fas fa-eye', label: 'Visualizar', tooltip: 'Ver Detalhes', fn: (row) => { this.$router.push(`/iam/users/view/${row.ds_key}`) } },
        { icon: 'fas fa-edit', label: 'Editar', tooltip: 'Editar Informações', hide: !this.permissions.update, fn: (row) => { this.$router.push(`/iam/users/edit/${row.ds_key}`) } },
        { icon: 'fas fa-trash-alt', label: 'Excluir', tooltip: 'Excluir Registro', hide: !this.permissions.delete, fn: this.remove },
      ]
    }
  },

  methods: {
    remove(row) {
      if (!confirm('Deseja excluir as informações?')) return false;

      this.$emit('load', 'users-remove');

      var key = row.ds_key;
      this.$http.delete(`/api/iam/users/v1/user/${key}`)
        .then(() => {
          this.$utils.notify({
            message: 'O usuário foi excluído com sucesso',
            type: 'positive',
            position: 'top-right'
          })
        })
        .catch((error) => {
          this.$utils.notifyError(error);
          console.error("An error occurred on the attempt to delete users.", error);
        })
        .finally(() => {
          this.Datatable.reload();
          this.$emit('loaded', 'users-remove');
        });
    },
  },

  beforeCreate() {
    auth.authenticate(this);
    if (!permissions.validatePermissions({ 'IAM_USER': 'R' })) this.$router.push('/forbidden');
  }
}

</script>
