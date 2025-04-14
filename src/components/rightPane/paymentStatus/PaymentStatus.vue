<template>
  <div class="payment-status" :style="{ justifyContent: aligntoYAxisStart ? 'start' : 'center' }">
    <div v-show="showSuccessAnimation" class="success-content fade-out">
      <div class="success-animation">
        <img src="https://atoa-gifs.s3.eu-west-2.amazonaws.com/payment_success.gif" alt="Payment Success"
          class="success-gif" />
      </div>
      <div class="success-title">Payment successful</div>
    </div>

    <div v-if="isMobileWidth && !showSuccessAnimation">
      <PaymentMerchantDetails :amount="paymentDetails?.amount?.amount || 0"
        :merchant-business-name="paymentDetails?.merchantBusinessName || ''"
        :store-location-name="paymentDetails?.storeDetails?.locationName" :store-url="paymentDetails?.storeImg || ''" />
    </div>

    <div v-show="!showSuccessAnimation" class="next-content slide-up">
      <PaymentDetailsUI :transaction-details="transactionDetails" :show-pending-transaction-error="showPendingTransactionError"/>
      <div class="redirect-message">
        You will be redirected in <strong>{{ formattedCountdown }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, type Ref, type ComputedRef, onBeforeUnmount, computed } from 'vue';
import PaymentDetailsUI from '@/components/rightPane/paymentDetails/PaymentDetailsUI.vue';
import PaymentMerchantDetails from '@/components/rightPane/paymentDetails/PaymentMerchantDetails.vue';
import { EnvironmentTypeEnum } from '@/core/types/Environment';
import type PaymentDetails from '@/core/types/PaymentDetails';
import { PaymentsService } from '@/core/services/PaymentsService';
import type { DialogCloseEventData, DialogCloseEventHandler, PaymentStatusEventHandler } from '@/core/types/SdkOptions';
import type TransactionDetails from '@/core/types/TransactionDetails';

const showSuccessAnimation = ref(false);
const aligntoYAxisStart = ref(true);
const paymentService = new PaymentsService();
const transactionDetails = ref<TransactionDetails>();
const showPendingTransactionError = ref(false);
const isMobileWidth = inject<ComputedRef<boolean>>('isMobileWidth');
const paymentRequestId = inject<string>('paymentRequestId');
const paymentIdempotencyId = inject<Ref<string | null>>('paymentIdempotencyId');
const paymentDetails = inject<Ref<PaymentDetails>>('paymentRequestDetails');
const environment = inject<EnvironmentTypeEnum>('environment');
const closeHandler = inject<DialogCloseEventHandler>('closeHandler');
const paymentStatusChangeHandler = inject<PaymentStatusEventHandler>('paymentStatusChangeHandler');
let pollInterval : number | undefined = undefined;
const countdown = ref(10);
let previousStatus: string | null = null;

const emit = defineEmits<{
  (e: 'onStatusChange', data: DialogCloseEventData): void;
}>();

const formattedCountdown = computed(() => {
  if (countdown.value >= 60) {
    const minutes = Math.floor(countdown.value / 60);
    const seconds = countdown.value % 60;
    const minuteText = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    const secondText = seconds > 0 ? ` ${seconds} ${seconds === 1 ? 'second' : 'seconds'}` : '';
    return minuteText + secondText;
  }
  return `${countdown.value} ${countdown.value === 1 ? 'second' : 'seconds'}`;
});

const triggerSuccessView = () => {
  aligntoYAxisStart.value = false;
  showSuccessAnimation.value = true;
  setTimeout(() => {
    showSuccessAnimation.value = false;
    aligntoYAxisStart.value = true;
    startRedirectionCountdown(10);
  }, 3000);
};

const pollPaymentStatus = async () => {
  try {
    const result = await paymentService.getPaymentStatusByID(
      paymentIdempotencyId?.value || "",
      { env: environment || EnvironmentTypeEnum.SANDBOX }
    );

    transactionDetails.value = result;

    if (previousStatus !== transactionDetails.value?.status && paymentStatusChangeHandler) {
      paymentStatusChangeHandler({
        status: transactionDetails.value?.status ?? '',
        paymentIdempotencyId: paymentIdempotencyId?.value ?? '',
        paymentRequestId: paymentRequestId ?? '',
        callbackParams: transactionDetails.value?.redirectUrlParams,
        atoaSignature: transactionDetails.value?.signature,
        atoaSignatureHash: transactionDetails.value?.signatureHash,
      });
      previousStatus = transactionDetails.value?.status ?? '';
    }

    emit('onStatusChange', {
      paymentIdempotencyId: result?.paymentIdempotencyId ?? '',
      status: result.status ?? '',
      paymentRequestId: paymentRequestId ?? '',
      callbackParams: result?.redirectUrlParams,
      atoaSignature: result?.signature,
      atoaSignatureHash: result?.signatureHash,
    });
    if (transactionDetails?.value.status === "PENDING") {
      if (!redirectionTimer) {
        startRedirectionCountdown(180);
      }
      if (!pollInterval) {
        pollInterval = setInterval(pollPaymentStatus, 3000);
      }
      setTimeout(() => {
        showPendingTransactionError.value = true;
      }, 120000);
    } else {
      if (result.status === "COMPLETED") {
        showPendingTransactionError.value = false;
        triggerSuccessView();
      } else {
        startRedirectionCountdown(10);
      }
      if(pollInterval) {
        clearInterval(pollInterval);
      }
    }
  } catch (error) {
    // fail silently, since next call can fetch the updated status
  }
};

let redirectionTimer : number | undefined = undefined;
 
const startRedirectionCountdown = (initialValue: number) => {
  if(redirectionTimer) {
    clearInterval(redirectionTimer);
  } 

  countdown.value = initialValue;

  redirectionTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(redirectionTimer);
      if (closeHandler) {
        closeHandler({
          paymentIdempotencyId: transactionDetails.value?.paymentIdempotencyId ?? '',
          status: transactionDetails.value?.status ?? '',
          paymentRequestId: paymentRequestId ?? '',
          callbackParams: transactionDetails.value?.redirectUrlParams,
          atoaSignature: transactionDetails.value?.signature,
          atoaSignatureHash: transactionDetails.value?.signatureHash,
        });
      }
    }
  }, 1000);
};

onMounted(async () => {
  pollPaymentStatus();
});

onBeforeUnmount(() => {
  if (pollInterval) {
    clearInterval(pollInterval);
  }
  if (redirectionTimer) {
    clearInterval(redirectionTimer);
  }
});
</script>

<style scoped>
.payment-status {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 40vh;
  text-align: center;
}

.success-content {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.success-animation {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  animation-duration: 0.5s !important;
  animation-timing-function: linear !important;
}

.success-gif {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.success-title {
  font-size: 16px;
  font-weight: 700;
  height: 1.45;
  color: var(--base-black);
}

.fade-out {
  animation: fadeOutUp 0.5s ease-out 1.5s forwards;
}

.slide-up {
  animation: slideUp 0.5s ease-out forwards;
}

.next-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0;
  /* Start hidden */
}

@keyframes fadeOutUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(-100px);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.payment-amount-text {
  font-size: 28px;
  font-weight: 700;
  color: var(--base-black);
}

.redirect-message {
  font-size: 14px;
  height: 1.5;
  color: var(--base-black);
  margin-top: 20px;
  width: 100%;
}
</style>
