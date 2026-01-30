<template>
  <div class="row">
    <div class="col-12 q-pt-sm" :class="bordered? 'q-pb-sm':''">
      <div v-if="!shouldHide('avatar') && input.avatar" class="col-12 avatar">
        <PhotoPicker DefaultImgPath="/resources/img/unknown-user.jpg"
          v-model="input.avatar" :disable="readonly">
        </PhotoPicker>
      </div>
      <q-card flat :bordered="bordered" class="card" :class="bordered? 'q-pa-xs':''">
        <div class="row q-mt-md">
          <div class="col-12 row items-center q-pa-sm">
            <div class="col-auto">
              <!-- <q-icon name="fas fa-user" size="1.4em" class="q-mr-sm"  style="padding-bottom: 6px;"></q-icon> -->
              <span style="font-size: 1.4em;">Usuário</span>
              <div class="col-12 form-note">Campos marcados com <span class="required">*</span> são obrigatórios.</div>
            </div>
            <q-space></q-space>
            <div v-if="editPass && input.id_iam_user" class="col-auto col-md-auto">
              <q-btn label="Alterar Senha" icon="fas fa-key" color="grey-9" @click="showPasswordModal = true"></q-btn>
            </div>
          </div>
          <div v-if="!shouldHide('ds_first_name')" class="col-12 col-md-6">
            <InputField type="text" Label="Nome*" Icon="fas fa-user-tie" clearable :readonly="readonly"
              v-model="input.ds_first_name" :Error="inputError.ds_first_name" @focus="inputError.ds_first_name = false">
            </InputField>
          </div>
          <div v-if="!shouldHide('ds_last_name')" class="col-12 col-md-6">
            <InputField type="text" Label="Sobrenome*" Icon="fas fa-user-tie" clearable :readonly="readonly"
              v-model="input.ds_last_name" :Error="inputError.ds_last_name" @focus="inputError.ds_last_name = false">
            </InputField>
          </div>
          <div v-if="!shouldHide('ds_phone1')" class="col-12 col-md-6">
            <InputField type="phone" Label="Telefone" clearable :readonly="readonly"
              v-model="input.ds_phone1">
            </InputField>
          </div>
          <div v-if="!shouldHide('ds_phone2')" class="col-12 col-md-6">
            <InputField type="phone" Label="Telefone Adicional" clearable :readonly="readonly"
              v-model="input.ds_phone2">
            </InputField>
          </div>
          <div v-if="!shouldHide('ds_email')" class="col-12 col-md-6">
            <InputField type="text" :Label="`Email${requireEmail?'*':''}`" Icon="fas fa-at" clearable :readonly="readonly" v-model="input.ds_email"
              :Error="inputError.ds_email" @focus="delete inputError.ds_email">
            </InputField>
          </div>
          <div v-if="!shouldHide('ds_email') && confirmEmail" class="col-12 col-md-6">
            <InputField type="text" :Label="`Confirmar Email${requireEmail?'*':''}`" Icon="fas fa-at" clearable :readonly="readonly" 
              v-model="control.ds_email_confirm"
              :Error="inputError.ds_email" @focus="delete inputError.ds_email">
            </InputField>
          </div>
          <div v-if="createPass && !readonly" class="col-12 col-md-6">
            <InputField type="password" :Label="`Senha${requirePassword?'*':''}`" Icon="fas fa-key" clearable :readonly="readonly" v-model="input.ds_password"
              :Error="inputError.ds_password" @focus="delete inputError.ds_password">
            </InputField>
          </div>
          <div v-if="createPass && !readonly" class="col-12 col-md-6">
            <InputField type="password" :Label="`Confirmar Senha${requirePassword?'*':''}`" Icon="fas fa-check" clearable :readonly="readonly" 
              v-model="control.ds_password_confirm" :disable="!input.ds_password"
              :Error="inputError.ds_password_confirm" @focus="delete inputError.ds_password_confirm">
            </InputField>
          </div>
          <div v-if="!shouldHide('ds_company')" class="col-12 col-md-6">
            <InputField type="text" Label="Empresa" Icon="fas fa-building" clearable :readonly="readonly"
              v-model="input.ds_company">
            </InputField>
          </div>
        </div>
      </q-card>
    </div>

    <Modal Title="Alterar Senha" Icon="fas fa-key" v-model="showPasswordModal" :Actions="modalActions" @hide="resetControl">
      <div class="q-pa-sm q-pa-md-none">
        <InputField Label="Nova Senha" Icon="fas fa-key" type="password" v-model="control.ds_password"
          :Error="inputError.ds_password" @focus="delete inputError.ds_password">
        </InputField>
        <InputField Label="Confirmar Nova Senha" Icon="fas fa-key" type="password" v-model="control.ds_password_confirm"
          :Error="inputError.ds_password_confirm" @focus="delete inputError.ds_password_confirm">
        </InputField>
      </div>
    </Modal>
  </div>
</template>

<script>
import { ENDPOINTS } from 'src/services/endpoints';

export default {
  name: 'component-userinfo',

  props: {
    readonly: Boolean,
    showTitle: Boolean,
    confirmEmail: Boolean,
    createPass: Boolean,
    editPass: Boolean,
    onlySecurity: Boolean,
    bordered: Boolean,
    requireEmail: Boolean,
    requirePassword: Boolean,
    HideFields: {
      type: Array,
      default: () => [],
    },
    modelValue: {
      type: Object,
    },
  },

  data() {
    return {
      input: {
        id_iam_user: null,
        ds_first_name: null,
        ds_last_name: null,
        ds_phone1: null,
        ds_phone2: null,
        ds_company: null,
        ds_email: null,
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
    }
  },

  computed: {
    factory() {
      return {
        input: { ...this.input },
        read: this.read,
        validate: this.validateFields
      }
    },

    modalActions() {
      return [
        { label: 'Salvar', icon: 'save', color: 'positive', fn: this.savePassword }
      ]
    }
  },

  methods: {
    validateFields() {
      let user = Object.assign({}, this.input);
      delete user.avatar;

      if(this.requireEmail) { this.inputError.ds_email = false; }
      if(this.requirePassword) { this.inputError.ds_password = false; }

      // Form
      if (!this.$utils.validateForm(user, this.inputError)) return false;

      // Email Confirm
      if (this.confirmEmail && (user.ds_email !== this.control.ds_email_confirm)) {
        this.inputError.ds_email = true;
        this.inputError.ds_email_confirm = true;
        this.$utils.notify({
          message: 'Os emails inseridos são diferentes',
          type: 'negative',
          position: 'top-right'
        })
        return false;
      }

      // Password Confirm
      if (user.ds_password !== '' && user.ds_password !== null) {
        if (user.ds_password !== this.control.ds_password_confirm) {
          this.inputError.ds_password = true;
          this.inputError.ds_password_confirm = true;
          this.$utils.notify({
            message: 'As senhas inseridas são diferentes',
            type: 'negative',
            position: 'top-right'
          });
          return false;
        }
      }

      return true;
    },

    read(source) {
      if ('ds_avatar_img_url' in source && !!source.ds_avatar_img_url) {
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

    isValidNewPassword() {
      if(this.control.ds_password === '' || this.control.ds_password === null) {
        this.inputError.ds_password = true;
        this.$utils.notify({
          message: 'Preencha os campos corretamente',
          type: 'negative',
          position: 'top-right'
        })
        return false;
      }

      if(this.control.ds_password_confirm === '' || this.control.ds_password_confirm === null) {
        this.inputError.ds_password = true;
        this.$utils.notify({
          message: 'Preencha os campos corretamente',
          type: 'negative',
          position: 'top-right'
        })
        return false;
      }

      if (this.control.ds_password !== this.control.ds_password_confirm) {
        this.inputError.ds_password = true;
        this.inputError.ds_password_confirm = true;
        this.$utils.notify({
          message: 'As senhas inseridas são diferentes',
          type: 'negative',
          position: 'top-right'
        });
        return false;
      }

      return true;
    },

    resetControl() {
      Object.keys(this.control).forEach(key => this.control[key] = null);
    },

    savePassword() {
      if(!this.isValidNewPassword()) return;

      const data = {
        id_iam_user: this.input.id_iam_user,
        ds_password: this.control.ds_password
      }

      return this.$http.put('/api/iam/users/v1/admin-change-pass', data)
        .then(() => {
          this.$utils.notify({
            message: 'Senha atualizada com sucesso',
            type: 'positive',
            position: 'top-right'
          });
        })
        .catch((error) => {
          this.$utils.notifyError(error);
          console.error('An error occurred while attempting to save the password.', error);
        })
        .finally(() => { this.showPasswordModal = false; this.resetControl() })
    }
  },

  watch: {
    input: {
      handler() {
        this.$emit("update:model-value", this.factory);
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
    if (this.createPass) {
      this.inputError.ds_password = false;
    }
    this.$emit("update:model-value", this.factory);
  }
}
</script>

<style scoped>
h1 {
  font-size: 1.5rem;
  line-height: 15px;
}

.card {
  position: relative;
  top: -50px;
  z-index: 1;
  border-radius: 15px;
  padding-top: 20px;
  margin-bottom: -50px;
}

@media (max-width: 768px) {
  .card {
    padding-top: 50px;
  }
}

.avatar {
  position: relative;
  z-index: 2;
}

.section {
  border-radius: 12px;
}

.section .q-btn{
  border-radius: 8px;
}
</style>