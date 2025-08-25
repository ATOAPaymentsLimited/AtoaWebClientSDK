<template>
  <ChoosePaymentMethod 
    v-if="!showCardCheckout"
    :selected-bank="selectedBank"
    @select-bank="$emit('select-bank', $event)"
    @show-overlay="$emit('show-overlay', $event)"
    @view-all-banks="$emit('view-all-banks')" />
  <PayByCardButton v-if="paymentDetails?.options?.cardPaymentEnabled && !showCardCheckout" @cardPaymentSelected="initiateCardPayment" />
  <CardCheckoutView v-show="showCardCheckout" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import ChoosePaymentMethod from '@/components/rightPane/selectBank/ChoosePaymentMethod.vue';
import PayByCardButton from '@/components/rightPane/selectBank/PayByCardButton.vue';
import CardCheckoutView from '@/components/rightPane/selectBank/CardCheckoutView.vue';
import type BankData from '@/core/types/BankData';
import type PaymentDetails from '@/core/types/PaymentDetails';

defineProps<{
  selectedBank?: BankData,
  paymentDetails?: PaymentDetails,
}>();

defineEmits<{
  (e: 'select-bank', bank: BankData): void
  (e: 'show-overlay', bank: BankData): void
  (e: 'view-all-banks'): void
}>();

const showCardCheckout = ref(false);

const initiateCardPayment = async () => {
  showCardCheckout.value = true;
};
</script>