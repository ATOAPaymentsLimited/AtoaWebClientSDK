<template>
  <div v-if="transactionDetails?.status === 'COMPLETED'" class="status-section completed">
    <div class="status-icon">
      <img src="@/assets/images/icon_success.svg" alt="Payment Success" />
    </div>
    <div class="status-info">
      <div class="status-title">Paid</div>
      <div class="status-message">Payment successful.</div>
    </div>
  </div>

  <div v-else-if="transactionDetails?.status === 'FAILED' || transactionDetails?.status === 'EXPIRED' || transactionDetails?.status === 'CANCELLED'"
    class="status-section failed">
    <div class="status-icon">
      <img src="@/assets/images/icon_failed.svg" alt="Payment Failed" />
    </div>
    <div class="status-info">
      <div class="status-title">Failed</div>
      <div class="status-message"> 
        {{ transactionDetails?.errorDescription ?? "Atoa is working fine but your bank's network is experiencing issues. Please try the payment using a different bank app." }}
      </div>
    </div>
  </div>

  <div v-else-if="transactionDetails?.status === 'PENDING'" class="status-section processing">
    <div class="status-icon">
      <img src="https://atoa-gifs.s3.eu-west-2.amazonaws.com/icon_processing.gif" alt="Payment Pending"
        class="processing-icon" />
    </div>
    <div class="status-info">
      <div class="status-title">Pending</div>
      <div class="status-message" 
        v-html="showPendingTransactionError && transactionDetails?.pendingTrasactionError ? statusText : 'Payment processing is taking longer than usual but your money is safe with your bank. Please wait for this transaction to complete before making another payment.'">
      </div>
    </div>
  </div>

  <div v-else class="status-section full-height">
    <img src="https://atoa-gifs.s3.eu-west-2.amazonaws.com/default_loader.gif" alt="Loading"
      class="default-loader" />
  </div>

  <PaymentDetailsInfo v-if="transactionDetails" :transaction-details="transactionDetails" />
</template>

<script setup lang="ts">
import PaymentDetailsInfo from '@/components/rightPane/paymentDetails/PaymentDetailsInfo.vue';
import type TransactionDetails from '@/core/types/TransactionDetails';
import { computed, type PropType } from 'vue';

const props = defineProps({
  transactionDetails: {
    type: Object as PropType<TransactionDetails>,
    required: false,
  },
  showPendingTransactionError: {
    type: Boolean,
    required: false,
  },
});

const statusText = computed(() => {
  let text = props.transactionDetails?.pendingTrasactionError;
  const phoneNumberRegex = /\b(\d{10,11})\b/;
  const phoneNumber = props.transactionDetails?.pendingTrasactionError?.match(phoneNumberRegex);

  if (phoneNumber) {
    text = text?.replace(
      phoneNumber[0].toString(),
      phoneNumberLink(phoneNumber[0].toString())
    );
    text =
      text + callBankLink(phoneNumber[0].toString());
  }

  return text;
});

const phoneNumberLink = (phoneNumber: string | number) => {
  return `<a href="tel:${phoneNumber}" class="bank-phone-number-link">📞 ${phoneNumber}</a>`;
};

const callBankLink = (phoneNumber: string | number) => {
  return `<br/><a href="tel:${phoneNumber}" class="call-bank-link">Call bank →</a>`;
};
</script>

<style scoped>
.status-section {
  display: flex;
  width: 100%;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  margin: 16px 0px;
  margin-top: 28px;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
}

.full-height {
  height: 100%;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.completed {
  background-color: var(--positive-subtle);
}

.failed {
  background-color: var(--negative-subtle);
}

.expired {
  background-color: var(--grey-100);
}

.processing {
  background-color: var(--notice-subtle);
}

.status-icon {
  width: 40px;
  height: 40px;
}

.status-info {
  flex: 1;
  justify-items: start;
}

.status-title {
  font-size: 14px;
  font-weight: 700;
  width: 100%;
  display: flex;
  align-items: left;
  justify-content: flex-start;
  margin: 0;
  color: var(--base-black);
}

.status-message {
  font-size: 12px;
  color: var(--base-black);
  margin-top: 4px;
  text-align: left;
  white-space: pre-wrap;
}

.processing-icon {
  width: 100%;
  border-radius: 50%;
  background-color: var(--notice-default);
  color: var(--base-white);
  object-fit: contain;
  box-sizing: border-box;
  padding: 4px;
}

.default-loader {
  width: 60px;
  height: 60px;
  display: block;
  margin: 0 auto;
}

.status-message :deep(.bank-phone-number-link) {
  color: var(--base-black);
  font-weight: 700;
}

.status-message :deep(.call-bank-link) {
  color: var(--base-black);
}
</style>
