<template>
  <UserForm ref="UserFormRef" v-model="input" editPass accountOwner
    @iam-user-fetchdata-before="emit('iam-user-fetchdata-before')"
    @iam-user-fetchdata-after="emit('iam-user-fetchdata-after')"
    @iam-user-fetchdata-error="emit('iam-user-fetchdata-error')" @iam-user-save-before="emit('iam-user-save-before')"
    @iam-user-save-after="emit('iam-user-save-after')" @iam-user-save-error="emit('iam-user-save-error')"
    @iam-password-save-before="emit('iam-password-save-before')"
    @iam-password-save-after="emit('iam-password-save-after')"
    @iam-password-save-error="emit('iam-password-save-error')"></UserForm>
</template>

<script setup>
// IMPORTS
import { ref, defineModel } from 'vue'


// INITIALIZATION
const emit = defineEmits([
  "iam-user-fetchdata-before",
  "iam-user-fetchdata-error",
  "iam-user-fetchdata-after",
  "iam-user-save-before",
  "iam-user-save-error",
  "iam-user-save-after",
  "iam-password-save-after",
  "iam-password-save-before",
  "iam-password-save-error",
])


// VARS
const input = defineModel()
const UserFormRef = ref(null)

defineExpose({
  getKey: () => UserFormRef.value?.getKey(),
  validateForm: (...args) => UserFormRef.value?.validateForm(...args),
  resetInput: (...args) => UserFormRef.value?.resetInput(...args),
  reload: (...args) => UserFormRef.value?.reload(...args),
  save: (...args) => UserFormRef.value?.save(...args),
  remove: (...args) => UserFormRef.value?.remove(...args),
})
</script>
