<template>
  <div class="payment-details">
    <div class="payment-details-header">
      <img src="@/assets/images/icon_bill.svg" class="receipt-icon" />
      <div>Payment details</div>
    </div>

    <div class="reference-section">
      <div class="reference-row">
        <div class="value-container">
          <div class="label-text">Reference ID</div>
          <div class="value-text">{{ transactionDetails?.paymentIdempotencyId }}</div>
        </div>
        <button class="copy-button" @click="copyToClipboard(transactionDetails?.paymentIdempotencyId ?? '')">
          <img src="@/assets/images/icon_copy.svg" alt="Copy" />
        </button>
      </div>

      <div class="reference-row">
        <div class="value-container">
          <div class="label-text">Order ID</div>
          <div class="value-text">{{ transactionDetails?.orderId }}</div>
        </div>
        <button class="copy-button" @click="copyToClipboard(transactionDetails?.orderId ?? '')">
          <img src="@/assets/images/icon_copy.svg" alt="Copy" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AtoaPayWebSDKError } from '@/core/types/Error';
import type { ErrorEventHandler } from '@/core/types/SdkOptions';
import type TransactionDetails from '@/core/types/TransactionDetails';
import type { Failure } from '@/core/utils/http-utils';
import { inject, type PropType } from 'vue';

defineProps({
  transactionDetails: {
    type: Object as PropType<TransactionDetails>,
    required: false,
  },
});

const errorHandler = inject<ErrorEventHandler>('errorHandler');

const copyToClipboard = async (text?: string) => {
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    if (errorHandler) {
      errorHandler(new AtoaPayWebSDKError(
        `Failed to copy text`,
        {
          componentName: 'PaymentDetailsInfo',
          errorName: (error as Failure).name,
          errorMessage: (error as Failure).message,
        },
      ));
    }
  }
};
</script>

<style scoped>
.payment-details {
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(--grey-200);
  width: 100%;
  box-sizing: border-box;
}

.payment-details-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  font-size: 14px;
  font-weight: 700;
  color: var(--base-black);
}

.receipt-icon {
  width: 20px;
  height: 20px;
}

.bank-details {
  display: flex;
  align-items: center;
  padding: 12px 0;
  gap: 12px;
}

.bank-logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  border: 1px solid var(--grey-200);
  border-radius: 8px;
  object-fit: contain;
  overflow: hidden;
}

.bank-info {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 2px;
}

.bank-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--base-black);
}

.reference-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: none;
  padding-top: 20px;
  background-image: linear-gradient(to right, var(--grey-200) 2px, transparent 2px);
  background-size: 6px 2px;
  background-repeat: repeat-x;
}

.reference-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label-text {
  font-size: 12px;
  color: var(--grey-700);
}

.value-container {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 8px;
  max-width: 90%;
}

.value-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--base-black);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-button {
  background: none;
  border: none;
  cursor: pointer;
}

.copy-button img {
  width: 24px;
  height: 24px;
  opacity: 0.8;
}

.copy-button:hover img {
  opacity: 1;
}
</style>