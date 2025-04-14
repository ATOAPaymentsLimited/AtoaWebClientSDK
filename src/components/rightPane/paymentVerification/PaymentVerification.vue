<template>
  <div class="payment-verification">
    <div class="logos">
      <img class="atoa-logo" src="@/assets/images/atoa_brand_logo.svg" alt="Atoa Logo" />
      <img src="https://atoa-gifs.s3.eu-west-2.amazonaws.com/loading_dots.gif" class="loading-dots">
      <img v-if="bankLogo" :src="bankLogo" alt="Bank Logo" class="bank-logo" />
    </div>

    <div class="content">
      <p class="content-header">Verifying payment status<br />with your bank.</p>

      <p class="content-note">
        Note: Do not press back or close this screen
        until the transaction is complete.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type BankData from '@/core/types/BankData';
import { getBankLogo } from '@/core/types/BankData';

const props = defineProps<{
  selectedBank: BankData
}>();

const emit = defineEmits<{
  (e: 'success'): void
}>();

const bankLogo = computed(() => getBankLogo(props.selectedBank));

onMounted(() => {
  setTimeout(() => {
    emit('success');
  }, 3000);
});
</script>

<style scoped>
.payment-verification {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 48px 24px;
  height: 100%;
  text-align: center;
}

.logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 48px;
}

.atoa-logo {
  width: 40px;
  height: 40px;
  border: 1px solid var(--grey-200);
  border-radius: 10px;
}

.bank-logo {
  width: 25px;
  height: 25px;
  object-fit: contain;
  padding: 10px;
  border: 1.25px solid var(--grey-200);
  border-radius: 10px;
}

.loading-dots {
  width: 42px;
  transform: scale(4);
  transform-origin: center;
  object-fit: cover;
  padding: 0 12px;
}

.content {
  width: 100%;
}

.content-header {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.45;
  margin: 0;
  color: var(--base-black);
}

.content-note {
  font-size: 14px;
  line-height: 1.5;
  color: var(--grey-500);
}
</style>