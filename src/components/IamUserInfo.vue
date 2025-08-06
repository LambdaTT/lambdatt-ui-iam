<template>
  <div class="row">
    <div class="col-12 q-pa-xs" v-if="showTitle">
      <div class="q-pa-xs">
        <h1>Informações do Usuário</h1>
      </div>
    </div>

    <!-- Photo -->
    <div class="col-12">
      <PhotoPicker v-if="!shouldHide('avatar') && input.avatar" DefaultImgPath="/resources/img/unknown-user.jpg"
        v-model="input.avatar" :disable="readonly">
      </PhotoPicker>
    </div>

    <!-- Data -->
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
      <InputField type="text" Label="Telefone" Icon="fas fa-phone" clearable :readonly="readonly"
        v-model="input.ds_phone1" Mask="(##) #####-####"></InputField>
    </div>
    <div v-if="!shouldHide('ds_phone2')" class="col-12 col-md-6">
      <InputField type="text" Label="Telefone Adicional" Icon="fas fa-phone" clearable :readonly="readonly"
        v-model="input.ds_phone2" Mask="(##) #####-####"></InputField>
    </div>
    <div v-if="!shouldHide('ds_company')" class="col-12 col-md-6">
      <InputField type="text" Label="Empresa" Icon="fas fa-building" clearable :readonly="readonly"
        v-model="input.ds_company"></InputField>
    </div>
    <div v-if="HideFields.length == 0" class="col-12 col-md-6">
      &nbsp;
    </div>
    <div v-if="!shouldHide('ds_email')" :class="`col-12 ${confirmEmail ? 'col-md-6' : ''}`">
      <InputField type="text" Label="Email*" Icon="fas fa-at" clearable :readonly="readonly" v-model="input.ds_email"
        :Error="inputError.ds_email" @focus="inputError.ds_email = false">
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_email_confirm') && confirmEmail" class="col-12 col-md-6">
      <InputField type="text" Label="Confirmar Email*" Icon="fas fa-check" clearable :readonly="readonly"
        v-model="control.ds_email_confirm" :disable="!input.ds_email" :Error="inputError.ds_email_confirm"
        @focus="delete inputError.ds_email_confirm">
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_password') && !readonly" class="col-12 col-md-6">
      <InputField type="password" :Label="`${requiredPass ? '' : 'Nova'} Senha${requiredPass ? '*' : ''}`"
        Icon="fas fa-key" clearable :readonly="readonly" v-model="input.ds_password" :Error="inputError.ds_password"
        @focus="() => { if (requiredPass) inputError.ds_password = false; else delete inputError.ds_password }">
      </InputField>
    </div>
    <div v-if="!shouldHide('ds_password_confirm') && !readonly" class="col-12 col-md-6">
      <InputField type="password" :Label="`Confirmar ${requiredPass ? '' : 'Nova'} Senha${requiredPass ? '*' : ''}`"
        Icon="fas fa-check" clearable :readonly="readonly" v-model="control.ds_password_confirm"
        :disable="!input.ds_password" :Error="inputError.ds_password_confirm"
        @focus="delete inputError.ds_password_confirm">
      </InputField>
    </div>
  </div>
</template>

<script>
export default {
  name: 'component-userinfo',

  props: {
    readonly: Boolean,
    showTitle: Boolean,
    confirmEmail: Boolean,
    requiredPass: Boolean,
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
        ds_email: false,
      },
      control: {
        ds_email_confirm: null,
        ds_password_confirm: null,
      },
      formReadonly: !!this.readonly,
    }
  },

  computed: {
    factory() {
      return {
        input: { ...this.input },
        read: this.read,
        validate: this.validateFields
      }
    }
  },

  methods: {
    validateFields() {
      // Validation
      let user = Object.assign({}, this.input);
      delete user.avatar;

      // -- Form
      if (!this.$toolcase.services.utils.validateForm(user, this.inputError)) return false;

      // -- Email
      if (this.confirmEmail && (user.ds_email !== this.control.ds_email_confirm)) {
        this.inputError.ds_email = true;
        this.inputError.ds_email_confirm = true;
        this.$toolcase.services.utils.notify({
          message: 'Os emails inseridos são diferentes',
          type: 'negative',
          position: 'top-right'
        })
        return false;
      }

      // -- Password
      if (user.ds_password !== '' && user.ds_password !== null) {
        if (user.ds_password !== this.control.ds_password_confirm) {
          this.inputError.ds_password = true;
          this.inputError.ds_password_confirm = true;
          this.$toolcase.services.utils.notify({
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
    if (this.requiredPass) {
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
</style>