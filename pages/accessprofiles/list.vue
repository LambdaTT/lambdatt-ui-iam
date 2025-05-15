<template>
  <Page Title="Gerenciar Perfis de Acesso" :Breadcrumb="breadcrumb">
    <Card Title="Perfis Cadastrados" Icon="fas fa-id-card">
      <template #actions>
        <div class="row justify-end">
          <div class="col-12 col-md-4 q-py-xs-xs q-px-md-xs">
            <q-btn v-if="permissions.create" class="full-width" icon="fas fa-plus" color="green" label="Adicionar"
              to="/iam/access-profiles/new">
              <q-tooltip>Adicionar novo perfil de acesso</q-tooltip>
            </q-btn>
          </div>
        </div>
      </template>

      <DataTable Name="accessprofile-list" DataURL="/api/iam/accessprofiles/v1/accessprofile" v-model="Datatable"
        :Columns="columns" :RowActions="rowActions">
      </DataTable>

    </Card>
  </Page>
</template>

<script>
// Services:
import {auth, permissions} from '../../services.js'

export default {
  name: 'pages-iam-accessprofile-list',

  data() {
    return {
      // Permissions:
      permissions: {
        create: permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'C' }),
        update: permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'U' }) && permissions.validatePermissions({ 'IAM_ACCESSPROFILE_MODULE': 'CRUD' }),
        delete: permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'D' }) && permissions.validatePermissions({ 'IAM_ACCESSPROFILE_MODULE': 'D' }),
      },

      // Datatable:
      Datatable: {},
    }
  },

  computed: {
    breadcrumb() {
      return [
        { label: 'Home', icon: "fas fa-home", to: "/" },
        { label: 'Perfis de Acesso', icon: "fas fa-id-card" },
      ]
    },

    columns() {
      return [
        { label: 'Nome', field: 'ds_title' },
        { label: 'Ativo?', field: 'activeText', align: 'center' },
      ]
    },

    rowActions() {
      return [
        { icon: 'fas fa-eye', label: 'Visualizar', tooltip: 'Ver Detalhes', fn: (row) => { this.$router.push(`/iam/access-profiles/view/${row.ds_key}`) } },
        { icon: 'fas fa-edit', label: 'Editar', tooltip: 'Editar Informações', hide: !this.permissions.update, fn: (row) => { this.$router.push(`/iam/access-profiles/edit/${row.ds_key}`) } },
        { icon: 'fas fa-trash-alt', label: 'Excluir', tooltip: 'Excluir Perfil de Acesso', hide: !this.permissions.delete, fn: this.remove },
      ]
    }
  },

  methods: {
    remove(row) {
      if (!confirm('Deseja excluir as informações?')) return false;

      this.$emit('load', 'accessprofile-remove');

      var key = row.ds_key;
      this.$http.delete(`/api/iam/accessprofiles/v1/accessprofile/${key}`)
        .then(() => {
          this.$utils.notify({
            message: 'O perfil foi excluído com sucesso',
            type: 'positive',
            position: 'top-right'
          })
        })
        .catch((error) => {
          this.$utils.notifyError(error);
          console.error("An error occurred on the attempt to delete accessprofile.", error);
        })
        .finally(() => {
          this.Datatable.reload();
          this.$emit('loaded', 'accessprofile-remove');
        });

    },
  },

  mounted() {
    auth.authenticate(this);
    if (!permissions.validatePermissions({ 'IAM_ACCESSPROFILE': 'R' })) this.$router.push('/forbidden');
  }
}

</script>
