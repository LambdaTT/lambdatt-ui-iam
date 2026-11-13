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

<script setup>
import { ref, watch, onMounted } from 'vue'

defineOptions({ name: 'components-common-auditinfo' })

const props = defineProps({
  showTitle: Boolean,
  input: Object
})

const values = ref({
  dtCreated: null,
  dtUpdated: null,
  userCreated: null,
  userUpdated: null,
})

// Nota: o Options API original tinha `depp: true` (typo) no watcher — ou seja, nunca foi deep.
// Mantido o comportamento raso (dispara só quando a referência de `input` troca).
watch(
  () => props.input,
  () => {
    for (let k in props.input)
      if (k in values.value)
        values.value[k] = props.input[k];
  }
)

onMounted(() => {
  values.value = props.input;
})
</script>