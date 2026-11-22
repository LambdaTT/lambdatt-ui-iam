<template>
  <div>
    <!-- Login Form -->
    <q-intersection v-show="showForgotPassForm == false" transition="jump-left">
      <q-card-section>
        <q-form @keyup.enter="handleEnterKey">
          <InputField Label="E-mail" Icon="email" type="email" clearable v-model="input.username"
            :Error="inputError.username" @focus="inputError.username = false"></InputField>
          <InputField Label="Senha" Icon="lock" type="password" clearable v-model="input.ds_password"
            :Error="inputError.ds_password" @focus="inputError.ds_password = false"></InputField>
        </q-form>
      </q-card-section>
      <q-card-section>
        <div class="q-px-sm">
          <q-btn icon="fas fa-sign-in-alt" color="primary" size="md" class="full-width" v-on:click="login()"
            label="Entrar" />
        </div>
      </q-card-section>
      <q-card-section class="text-center">
        <div class="row">
          <!-- <div class="col-6">
                      <q-checkbox size="md" v-model="rememberMe" val="md" label="Manter Logado" />
                    </div> -->
          <div class="col-12 q-pa-sm text-right">
            <q-btn label="Esqueci a senha" icon-right="fas fa-chevron-right" flat color="primary"
              @click="showForgotPassForm = true">
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-intersection>

    <!-- Forgot Pass Form -->
    <q-intersection v-show="showForgotPassForm == true" transition="jump-right">
      <q-card-section>
        <q-form>
          <InputField Label="Seu e-mail cadastrado" Icon="email" type="email" clearable v-model="recoveryEmail"
            :error="inputError.recoveryEmail" @focus="inputError.recoveryEmail = false"></InputField>
        </q-form>
      </q-card-section>
      <q-card-section>
        <div class="q-pa-sm">
          <q-btn icon="fas fa-paper-plane" color="primary" size="md" class="full-width" v-on:click="recoveryPass()"
            label="Recuperar Senha" />
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12 q-pa-sm">
            <q-btn label="Voltar ao login" icon="fas fa-chevron-left" flat color="primary"
              @click="showForgotPassForm = false">
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-intersection>
  </div>
</template>

<script setup>
// IMPORTS

</script>