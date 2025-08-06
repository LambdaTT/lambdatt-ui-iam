<template>
  <La1Page Title="Gerenciar Usuários" :Breadcrumb="breadcrumb">
    <La1Card Title="Usuários Cadastrados" Icon="fas fa-user-cog">
      <template #actions>
        <div class="row justify-end">
          <div v-if="permissions.create" class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn class="full-width" icon="fas fa-plus" color="green" label="Adicionar" to="/iam/users/new">
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

    </La1Card>
  </La1Page>
</template>

<script>
export default {
  name: 'pages-iam-user-list',

  data() {
    return {
      // Permissions:
      permissions: {
        create: this.$iam.services.permissions.validatePermissions({ 'IAM_USER': 'C' }) && this.$iam.services.permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) && this.$iam.services.permissions.validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'CUD' }),
        update: this.$iam.services.permissions.validatePermissions({ 'IAM_USER': 'U' }) && this.$iam.services.permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'R' }) && this.$iam.services.permissions.validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'CRUD' }),
        delete: this.$iam.services.permissions.validatePermissions({ 'IAM_USER': 'D' }) && this.$iam.services.permissions.validatePermissions({ 'IAM_ACCESSPROFILE_USER': 'D' }),
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
          sortable: false,
          searchable: false,
        },
        { label: 'Nome', field: 'fullName' },
        { label: 'E-mail', field: 'ds_email' },
        { label: 'Último Acesso', field: 'dtLastAccess', sorBy: 'dt_last_access' },
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
      this.$toolcase.services.http.delete(`/api/iam/users/v1/user/${key}`)
        .then(() => {
          this.$toolcase.services.utils.notify({
            message: 'O usuário foi excluído com sucesso',
            type: 'positive',
            position: 'top-right'
          })
        })
        .catch((error) => {
          this.$toolcase.services.utils.notifyError(error);
          console.error("An error occurred on the attempt to delete users.", error);
        })
        .finally(() => {
          this.Datatable.reload();
          this.$emit('loaded', 'users-remove');
        });
    },
  },

  mounted() {
    this.$iam.services.auth.authenticate(this);
    if (!this.$iam.services.permissions.validatePermissions({ 'IAM_USER': 'R' })) this.$router.push('/forbidden');
  }
}

</script>
