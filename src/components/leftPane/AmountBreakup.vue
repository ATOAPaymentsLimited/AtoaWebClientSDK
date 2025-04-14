<template>
  <Transition name="slide">
    <div class="amount-breakup-content" v-show="isExpanded">
      <div class="amount-row">
        <span>Amount</span>
        <span>£{{ finalAmount.toFixed(2) }}</span>
      </div>
      <div class="amount-row">
        <span>Service charge</span>
        <span>£{{ calculateServiceCharge.toFixed(2) }}</span>
      </div>
      <div class="amount-row">
        <span>VAT</span>
        <span>£{{ calculateTax.toFixed(2) }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type PaymentDetails from '@/core/types/PaymentDetails';
import { computed, type PropType } from 'vue';

const props = defineProps({
  isExpanded: {
    type: Boolean,
    required: true,
  },
  paymentDetails: {
    type: Object as PropType<PaymentDetails>,
    required: false,
  },
});

const finalAmount = computed(() => {
  const originalAmount = props.paymentDetails?.amount?.amount ?? 0;
  return Number(originalAmount - calculateServiceCharge.value - calculateTax.value);
});

const calculateServiceCharge = computed(() => {
  const amount = props.paymentDetails?.amount?.amount ?? 0;
  const percentage = props.paymentDetails?.servicePercentage ?? 0;
  return Number((amount * percentage) / 100);
});

const calculateTax = computed(() => {
  const amount = props.paymentDetails?.amount?.amount ?? 0;
  const percentage = props.paymentDetails?.taxPercentage ?? 0;
  return Number((amount * percentage) / 100);
});
</script>

<style>
.amount-breakup-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px dashed var(--grey-300);
  overflow: hidden;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--grey-600);
  height: 1.5;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  border-top-width: 0px;
  margin: 0;
  padding-top: 0;
  transition: all 0.3s ease-out;
}
</style>