<template>
  <ChoosePaymentMethod 
    :selected-bank="selectedBank"
    @select-bank="$emit('select-bank', $event)"
    @show-overlay="$emit('show-overlay', $event)"
    @view-all-banks="$emit('view-all-banks')" />
  <PayByCardButton v-if="paymentDetails?.options?.cardPaymentEnabled" @cardPaymentSelected="initiateCardPayment" />
</template>

<script setup lang="ts">
import ChoosePaymentMethod from '@/components/rightPane/selectBank/ChoosePaymentMethod.vue';
import PayByCardButton from '@/components/rightPane/selectBank/PayByCardButton.vue';
import type BankData from '@/core/types/BankData';
import type PaymentDetails from '@/core/types/PaymentDetails';

defineProps<{
  selectedBank?: BankData,
  paymentDetails?: PaymentDetails,
}>();

const emit = defineEmits<{
  (e: 'select-bank', bank: BankData): void
  (e: 'show-overlay', bank: BankData): void
  (e: 'view-all-banks'): void
  (e: 'pay-by-card'): void
}>();

const initiateCardPayment = async () => {
  emit('pay-by-card');
};
</script>