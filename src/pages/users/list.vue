<template>
  <Page Title="Gerenciar Usuários" :Breadcrumb="breadcrumb">
    <Widget Title="Usuários Cadastrados" Icon="fas fa-user-cog"
      :Actions="[{ label: 'Adicionar', icon: 'fas fa-plus', color: 'positive', textColor: 'white', fn: () => router.push('/iam/users/create') }]">
      <DataTable Name="user-list" :DataURL="ENDPOINTS.USERS.USER" v-model="Datatable" :Columns="columns"
        :RowActions="rowActions">
        <template #cell-avatar="row">
          <div class="q-pa-sm text-center">
            <q-avatar>
              <q-img class="user-avatar-img" :src="row.data.ds_avatar_img_url
                ? row.data.ds_avatar_img_url
                : '/resources/img/unknown-user.jpg'
                "></q-img>
            </q-avatar>
          </div>
        </template>
      </DataTable>
    </Widget>
  </Page>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import ENDPOINTS from "../../ENDPOINTS";

defineOptions({ name: "pages-iam-user-list" });

const router = useRouter();
// Submódulo acessa os serviços do app pelo $getService global (resolução por URI) — equivalente
// ao this.$getService do Options API.
const getService = getCurrentInstance().appContext.config.globalProperties.$getService;

// Permissions (flat tag-based model):
const permissions = {
  create: getService("iam/permissions").canExecute("users.manage"),
  update: getService("iam/permissions").canExecute("users.manage"),
  delete: getService("iam/permissions").canExecute("users.manage"),
};

//  Datatable:
const Datatable = ref({});

const breadcrumb = computed(() => [
  { label: "Home", icon: "fas fa-home", to: "/" },
  { label: "Usuários", icon: "fas fa-users" },
]);

const columns = computed(() => [
  {
    name: "avatar",
    field: "avatar",
    label: "Avatar",
    sortable: false,
    searchable: false,
  },
  { label: "Nome", field: "fullName" },
  { label: "E-mail", field: "ds_email" },
  {
    label: "Último Acesso",
    field: "dtLastAccess",
    sorBy: "dt_last_access",
  },
]);

const rowActions = computed(() => [
  {
    icon: "fas fa-eye",
    label: "Visualizar",
    tooltip: "Ver Detalhes",
    fn: (row) => {
      router.push(`/iam/users/details/${row.ds_key}`);
    },
  },
  {
    icon: "fas fa-edit",
    label: "Editar",
    tooltip: "Editar Informações",
    hide: !permissions.update,
    fn: (row) => {
      router.push(`/iam/users/edit/${row.ds_key}`);
    },
  },
  {
    icon: "fas fa-trash-alt",
    label: "Excluir",
    tooltip: "Excluir Registro",
    hide: !permissions.delete,
    fn: remove,
  },
]);

function remove(row) {
  if (!confirm("Deseja excluir as informações?")) return false;

  getService("toolcase/loader").load("users-remove");

  var key = row.ds_key;
  getService("toolcase/http")
    .delete(`${ENDPOINTS.USERS.USER}/${key}`)
    .then(() => {
      getService("toolcase/utils").notify({
        message: "O usuário foi excluído com sucesso",
        type: "positive",
        position: "top-right",
      });
    })
    .catch((error) => {
      getService("toolcase/utils").notifyError(error);
      console.error(
        "An error occurred on the attempt to delete users.",
        error,
      );
    })
    .finally(() => {
      Datatable.value.reload();
      getService("toolcase/loader").loaded("users-remove");
    });
}

onMounted(() => {
  getService("iam/auth").authenticate();
  if (!getService("iam/permissions").canExecute("users.read"))
    router.push("/forbidden");
});
</script>
