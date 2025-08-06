<template>
  <div class="row">
    <div class="col-12 q-pa-xs" v-if="showTitle">
      <div class="q-pa-xs" style="font-size: 1.2rem;">Auditoria</div>
    </div>
    <div class="col-12 col-md-6">
      <InputField Label="Criado por:" Icon="fas fa-user-cog" type="text" readonly v-model="values.userCreated">
      </InputField>
    </div>
    <div class="col-12 col-sm-12 col-md-6">
      <InputField Label="Criado em:" Icon="fas fa-calendar" type="text" readonly v-model="values.dtCreated">
      </InputField>
    </div>
    <div class="col-12 col-sm-12 col-md-6">
      <InputField Label="Atualizado por:" Icon="fas fa-user-cog" type="text" readonly v-model="values.userUpdated">
      </InputField>
    </div>
    <div class="col-12 col-sm-12 col-md-6">
      <InputField Label="Atualizado em:" Icon="fas fa-calendar" type="text" readonly v-model="values.dtUpdated">
      </InputField>
    </div>
  </div>
</template>

<script>
export default {
  name: 'components-common-auditinfo',

  props: {
    showTitle: Boolean,
    input: Object
  },

  data() {
    return {
      values: {
        dtCreated: null,
        dtUpdated: null,
        userCreated: null,
        userUpdated: null,
      }
    }
  },

  watch: {
    input: {
      handler() {
        for (let k in this.input)
          if (k in this.values)
            this.values[k] = this.input[k];
      },

      depp: true
    }
  },

  mounted() {
    this.values = this.input;
  }
}
</script>