<template>
  <div
    class="bank-grid-item"
    :class="{ selected: isSelected, disabled: !bank.enabled || isIneligible }"
    @click="handleClick"
  >
    <div class="bank-logo">
      <img :src="getBankLogo(bank)" :alt="bank.name" class="logo-image" />
      <div v-if="!bank.enabled || isIneligible" class="warning-icon">
        <img
          src="@/assets/images/icon_warning.svg"
          alt="Warning"
          class="warning-image"
        />
      </div>
      <img
        v-if="isSelected"
        src="@/assets/images/black_check.svg"
        alt="Selected"
        class="check-icon"
      />
    </div>
    <span class="bank-name">{{ bank.name }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from "vue";
import type BankData from "@/core/types/BankData";
import { getBankLogo } from "@/core/types/BankData";
import type PaymentDetails from "@/core/types/PaymentDetails";
import { DEFAULT_TRANSACTION_LIMIT } from "@/core/utils/constants";

const props = defineProps<{
  bank: BankData;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  (e: "select", bank: BankData): void;
  (e: "showOverlay", bank: BankData): void;
}>();

const paymentDetails = inject<Ref<PaymentDetails>>("paymentRequestDetails");
const paymentAmount = computed(
  () => paymentDetails?.value?.amount?.amount || 0,
);

const isIneligible = computed(() => {
  const limit = props.bank.transactionAmountLimit ?? DEFAULT_TRANSACTION_LIMIT;
  return limit < paymentAmount.value;
});

const handleClick = () => {
  if (!props.bank.enabled || isIneligible.value) {
    emit("showOverlay", props.bank);
  } else {
    emit("select", props.bank);
  }
};
</script>

<style scoped>
.bank-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.bank-grid-item.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.bank-logo {
  position: relative;
  padding: 0;
  height: 60px;
  min-width: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  background: var(--base-white);
  border: 1px solid var(--grey-200);
  border-radius: 12px;
  box-sizing: border-box;
  width: 100%;
}

.warning-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  padding: 2px 4px;
  background-color: var(--error-subtle);
  border-radius: 16px;
}

.warning-image {
  width: 16px;
  height: 16px;
}

.logo-image {
  max-width: 34px;
  max-height: 34px;
  object-fit: contain;
}

.bank-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--grey-500);
  text-align: center;
}

.bank-grid-item.selected .bank-logo {
  border: 2px solid var(--base-black);
}

.check-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
