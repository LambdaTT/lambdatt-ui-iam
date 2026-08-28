<template>
  <div class="row">
    <div class="col-12 q-pa-xs" v-if="showTitle">
      <div class="q-pa-xs">
        <h1>Informações do Usuário</h1>
      </div>
    </div>

    <!-- Photo -->
    <div class="col-12">
      <PhotoPicker
        v-if="!shouldHide('avatar') && input.avatar"
        :DefaultImgPath="DefaultAvatarPath || '/resources/img/unknown-user.jpg'"
        v-model="input.avatar"
        :disable="readonly"
      >
      </PhotoPicker>
    </div>

    <!-- Alterar Senha (modo edição) -->
    <div v-if="editPass" class="col-12 q-pa-xs" align="right">
      <q-btn
        label="Alterar Senha"
        icon="fas fa-key"
        color="grey-9"
        @click="openPasswordModal"
      />
    </div>

    <!-- Data -->
    <div v-if="!shouldHide('ds_first_name')" class="col-12 col-md-6">
      <InputField
        type="text"
        Label="Nome*"
        Icon="fas fa-user-tie"
        clearable
        :readonly="readonly"
        v-model="input.ds_first_name"
        :Error="inputError.ds_first_name"
        @focus="inputError.ds_first_name = false"
      >
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_last_name')" class="col-12 col-md-6">
      <InputField
        type="text"
        Label="Sobrenome*"
        Icon="fas fa-user-tie"
        clearable
        :readonly="readonly"
        v-model="input.ds_last_name"
        :Error="inputError.ds_last_name"
        @focus="inputError.ds_last_name = false"
      >
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_phone1')" class="col-12 col-md-6">
      <InputField
        type="phone"
        Label="Telefone"
        clearable
        :readonly="readonly"
        v-model="input.ds_phone1"
      ></InputField>
    </div>
    <div v-if="!shouldHide('ds_phone2')" class="col-12 col-md-6">
      <InputField
        type="phone"
        Label="Telefone Adicional"
        clearable
        :readonly="readonly"
        v-model="input.ds_phone2"
      >
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_company')" class="col-12 col-md-6">
      <InputField
        type="text"
        Label="Empresa"
        Icon="fas fa-building"
        clearable
        :readonly="readonly"
        v-model="input.ds_company"
      ></InputField>
    </div>
    <div v-if="HideFields.length == 0" class="col-12 col-md-6">&nbsp;</div>
    <div v-if="!shouldHide('ds_email')" class="col-12 col-md-6">
      <InputField
        type="text"
        Label="Email*"
        Icon="fas fa-at"
        clearable
        :readonly="readonly"
        v-model="input.ds_email"
        :Error="inputError.ds_email"
        @focus="inputError.ds_email = false"
      >
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_username')" class="col-12 col-md-6">
      <InputField
        type="text"
        Label="Nome de Usuário*"
        Icon="fas fa-user"
        clearable
        :readonly="readonly"
        v-model="input.ds_username"
        :Error="inputError.ds_username"
        @focus="inputError.ds_username = false"
      >
      </InputField>
    </div>
    <div
      v-if="!shouldHide('ds_email_confirm') && confirmEmail"
      class="col-12 col-md-6"
    >
      <InputField
        type="text"
        Label="Confirmar Email*"
        Icon="fas fa-check"
        clearable
        :readonly="readonly"
        v-model="control.ds_email_confirm"
        :disable="!input.ds_email"
        :Error="inputError.ds_email_confirm"
        @focus="delete inputError.ds_email_confirm"
      >
      </InputField>
    </div>
    <div
      v-if="!shouldHide('ds_password') && !readonly && !editPass"
      class="col-12 col-md-6"
    >
      <InputField
        type="password"
        :Label="`${requiredPass ? '' : 'Nova'} Senha${requiredPass ? '*' : ''}`"
        Icon="fas fa-key"
        clearable
        :readonly="readonly"
        v-model="input.ds_password"
        :Error="inputError.ds_password"
        @focus="
          () => {
            if (requiredPass) inputError.ds_password = false;
            else delete inputError.ds_password;
          }
        "
      >
      </InputField>
    </div>
    <div
      v-if="
        !shouldHide('ds_password_confirm') &&
        !readonly &&
        !shouldHide('ds_password') &&
        !editPass
      "
      class="col-12 col-md-6"
    >
      <InputField
        type="password"
        :Label="`Confirmar ${requiredPass ? '' : 'Nova'} Senha${
          requiredPass ? '*' : ''
        }`"
        Icon="fas fa-check"
        clearable
        :readonly="readonly"
        v-model="control.ds_password_confirm"
        :disable="!input.ds_password"
        :Error="inputError.ds_password_confirm"
        @focus="delete inputError.ds_password_confirm"
      >
      </InputField>
    </div>

    <!-- Modal: Alterar Senha -->
    <q-dialog
      v-model="showPasswordModal"
      persistent
      @hide="resetPasswordControl"
    >
      <q-card style="min-width: 360px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Alterar Senha</div>
          <q-space />
          <q-btn icon="fas fa-times" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <InputField
            Label="Nova Senha"
            Icon="fas fa-key"
            type="password"
            clearable
            v-model="control.ds_password"
            :Error="passwordError.ds_password"
            @focus="passwordError.ds_password = false"
          >
          </InputField>
          <InputField
            Label="Confirmar Nova Senha"
            Icon="fas fa-key"
            type="password"
            clearable
            v-model="control.ds_password_confirm"
            :Error="passwordError.ds_password_confirm"
            @focus="passwordError.ds_password_confirm = false"
          >
          </InputField>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat color="grey-8" label="Cancelar" v-close-popup />
          <q-btn
            color="positive"
            icon="fas fa-save"
            label="Salvar"
            :loading="passwordLoading"
            @click="savePassword"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import ENDPOINTS from "../ENDPOINTS";

export default {
  name: "component-userinfo",

  props: {
    readonly: Boolean,
    showTitle: Boolean,
    confirmEmail: Boolean,
    requiredPass: Boolean,
    // Exibe o botão/modal "Alterar Senha" (edição), no lugar dos campos de senha inline.
    editPass: Boolean,
    // Quando true, a troca de senha usa o endpoint da própria conta (my-account);
    // caso contrário, usa admin-change-pass com a chave passada em UserKey.
    accountOwner: Boolean,
    UserKey: {
      type: String,
      default: null,
    },
    HideFields: {
      type: Array,
      default: () => [],
    },
    DefaultAvatarPath: {
      type: String,
      default: null,
    },
    modelValue: {
      type: Object,
    },
  },

  data() {
    return {
      input: {
        ds_first_name: null,
        ds_last_name: null,
        ds_phone1: null,
        ds_phone2: null,
        ds_company: null,
        ds_email: null,
        ds_username: null,
        ds_password: null,
        avatar: {
          file: null,
          name: null,
          src: null,
          size: null,
        },
      },
      inputError: {
        ds_first_name: false,
        ds_last_name: false,
      },
      control: {
        ds_email_confirm: null,
        ds_password: null,
        ds_password_confirm: null,
      },
      formReadonly: !!this.readonly,
      showPasswordModal: false,
      passwordLoading: false,
      // Erros do modal de senha, separados do inputError do formulário principal
      // (evita que validateForm passe a exigir ds_password no save principal).
      passwordError: {
        ds_password: false,
        ds_password_confirm: false,
      },
    };
  },

  computed: {
    factory() {
      return {
        input: { ...this.input },
        read: this.read,
        validate: this.validateFields,
      };
    },
  },

  methods: {
    validateFields() {
      // Validation
      let user = Object.assign({}, this.input);
      delete user.avatar;

      // -- Form
      if (
        !this.$getService("toolcase/utils").validateForm(user, this.inputError)
      )
        return false;

      // -- Email
      if (
        this.confirmEmail &&
        user.ds_email !== this.control.ds_email_confirm
      ) {
        this.inputError.ds_email = true;
        this.inputError.ds_email_confirm = true;
        this.$getService("toolcase/utils").notify({
          message: "Os emails inseridos são diferentes",
          type: "negative",
          position: "top-right",
        });
        return false;
      }

      // -- Password
      if (user.ds_password !== "" && user.ds_password !== null) {
        if (user.ds_password !== this.control.ds_password_confirm) {
          console.log(
            `${user.ds_password} !== ${this.control.ds_password_confirm}`,
            user.ds_password !== this.control.ds_password_confirm,
          );

          this.inputError.ds_password = true;
          this.inputError.ds_password_confirm = true;
          this.$getService("toolcase/utils").notify({
            message: "As senhas inseridas são diferentes",
            type: "negative",
            position: "top-right",
          });
          return false;
        }
      }

      return true;
    },

    read(source) {
      if ("ds_avatar_img_url" in source && !!source.ds_avatar_img_url) {
        this.input.avatar.src = source.ds_avatar_img_url;
        delete source.ds_avatar_img_url;
      }
      // Reads User-related Data
      for (let key in this.input) {
        if (key in source) {
          this.input[key] = source[key];
        }
      }
    },

    shouldHide(element) {
      return this.HideFields.includes(element);
    },

    openPasswordModal() {
      this.resetPasswordControl();
      this.showPasswordModal = true;
    },

    resetPasswordControl() {
      this.control.ds_password = null;
      this.control.ds_password_confirm = null;
      this.passwordError.ds_password = false;
      this.passwordError.ds_password_confirm = false;
    },

    isValidNewPassword() {
      if (
        this.control.ds_password === "" ||
        this.control.ds_password === null
      ) {
        this.passwordError.ds_password = true;
        this.$getService("toolcase/utils").notify({
          message: "Preencha os campos corretamente",
          type: "negative",
          position: "top-right",
        });
        return false;
      }

      if (
        this.control.ds_password_confirm === "" ||
        this.control.ds_password_confirm === null
      ) {
        this.passwordError.ds_password_confirm = true;
        this.$getService("toolcase/utils").notify({
          message: "Preencha os campos corretamente",
          type: "negative",
          position: "top-right",
        });
        return false;
      }

      if (this.control.ds_password !== this.control.ds_password_confirm) {
        this.passwordError.ds_password = true;
        this.passwordError.ds_password_confirm = true;
        this.$getService("toolcase/utils").notify({
          message: "As senhas inseridas são diferentes",
          type: "negative",
          position: "top-right",
        });
        return false;
      }

      return true;
    },

    savePassword() {
      if (!this.isValidNewPassword()) return;

      const url = this.accountOwner
        ? ENDPOINTS.USERS.MY_ACCOUNT
        : `${ENDPOINTS.USERS.ADMIN_CHANGE_PASS}/${this.UserKey}`;

      this.passwordLoading = true;
      return this.$getService("toolcase/http")
        .put(url, { ds_password: this.control.ds_password })
        .then(() => {
          this.$getService("toolcase/utils").notify({
            message: "Senha atualizada com sucesso",
            type: "positive",
            position: "top-right",
          });
          this.showPasswordModal = false;
        })
        .catch((error) => {
          this.$getService("toolcase/utils").notifyError(error);
          console.error(
            "An error occurred while attempting to save the password.",
            error,
          );
        })
        .finally(() => {
          this.passwordLoading = false;
        });
    },

    syncConditionalErrors() {
      const conditionalFields = ["ds_email", "ds_username"];
      for (const field of conditionalFields) {
        if (!this.shouldHide(field)) {
          if (!(field in this.inputError)) {
            this.inputError[field] = false;
          }
        } else {
          delete this.inputError[field];
        }
      }
    },
  },

  watch: {
    input: {
      handler() {
        this.$emit("update:model-value", this.factory);
      },
      deep: true,
    },

    HideFields: {
      handler() {
        this.syncConditionalErrors();
      },
      deep: true,
    },

    modelValue: {
      handler(newValue) {
        for (let key in this.input) {
          if (key in newValue) {
            this.input[key] = newValue[key];
          }
        }
      },
      deep: true,
    },
  },

  mounted() {
    this.syncConditionalErrors();
    if (this.requiredPass) {
      this.inputError.ds_password = false;
    }
    this.$emit("update:model-value", this.factory);
  },
};
</script>

<style scoped>
h1 {
  font-size: 1.5rem;
  line-height: 15px;
}
</style>
