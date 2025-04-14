<template>
  <div class="payment-dialog-container">
    <div class="payment-dialog" role="dialog" aria-modal="true">
      <div class="content-row">
        <LeftPane v-if="!isMobileWidth && !paymentRequestFetchError && !isFetchingInitialData"
          :is-loading="isFetchingInitialData" />
        <RightPane :is-fetching-initial-data="isFetchingInitialData" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, provide, computed, inject, onBeforeUnmount } from 'vue';
import LeftPane from '@/components/leftPane/LeftPane.vue';
import RightPane from "@/components/rightPane/RightPane.vue";
import type PaymentDetails from '@/core/types/PaymentDetails';
import type BankData from '@/core/types/BankData';
import { PaymentsService } from '@/core/services/PaymentsService';
import { EnvironmentTypeEnum } from '@/core/types/Environment';
import type { Failure } from '@/core/utils/http-utils';
import type { ErrorEventHandler } from '@/core/types/SdkOptions';
import { AtoaPayWebSDKError } from '@/core/types/Error';
import type LastPaymentBankDetails from '@/core/types/LastPaymentBankDetails';
import type CustomerDetails from '@/core/types/CustomerDetails';

const isFetchingInitialData = ref(true);
const paymentRequestDetails = ref<PaymentDetails>();
const paymentRequestFetchError = ref<Failure | null>();
const banksList = ref<BankData[]>([]);
const paymentAmount = ref(0);
const storeImageUrl = ref("");
const merchantBusinessName = ref("");
const lastPaymentBankDetails = ref<LastPaymentBankDetails>();
const environment = inject<EnvironmentTypeEnum>('environment');
const paymentRequestId = inject<string>('paymentRequestId');
const customerDetails = inject<CustomerDetails>('customerDetails');
const errorHandler = inject<ErrorEventHandler>('errorHandler');

const width = ref(window.innerWidth);
const isMobileWidth = computed(() => width.value < 1023);

provide("isMobileWidth", isMobileWidth);
provide('banksList', banksList);
provide('paymentRequestDetails', paymentRequestDetails);
provide('lastPaymentBankDetails', lastPaymentBankDetails);
provide('paymentRequestFetchError', paymentRequestFetchError);

onMounted(() => {
  fetchPaymentRequestDetails();
  fetchBanksList();
});

async function fetchPaymentRequestDetails() {
  isFetchingInitialData.value = true;

  try {
    const paymentsService = new PaymentsService();
    const paymentRequestResponseData: PaymentDetails = await paymentsService.fetchPaymentDetails(paymentRequestId ?? '',
      { env: environment || EnvironmentTypeEnum.PRODUCTION, customerDetails: customerDetails },
    );
    paymentRequestDetails.value = paymentRequestResponseData;
    paymentAmount.value = paymentRequestResponseData.amount.amount;
    storeImageUrl.value = paymentRequestResponseData.storeImg || "";
    merchantBusinessName.value =
      paymentRequestResponseData.merchantBusinessName;
    paymentAmount.value = paymentRequestResponseData.amount.amount;
    merchantBusinessName.value =
      paymentRequestResponseData.merchantBusinessName;
    lastPaymentBankDetails.value = paymentRequestResponseData.lastPaymentBankDetails;
  } catch (error) {
    if (errorHandler) {
      errorHandler(new AtoaPayWebSDKError(
        `Failed to fetch payment details`,
        {
          componentName: 'PaymentDialog',
          errorName: (error as Failure).name,
        },
      ));
      paymentRequestFetchError.value = error as Failure;
    }
  } finally {
    isFetchingInitialData.value = false;
  }
}

async function fetchBanksList() {
  try {
    const paymentsService = new PaymentsService();
    const banksResponseData: BankData[] = await paymentsService.fetchConsumerBankInstitutions({
      env: environment ?? EnvironmentTypeEnum.PRODUCTION,
    });
    banksList.value = banksResponseData;
  } catch (error) {
  }
}

const handleResize = () => {
  width.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.payment-dialog-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.payment-dialog {
  background: var(--base-white);
  border-radius: 16px;
  width: 60%;
  height: 70%;
  max-width: 1200px;
  max-height: 85vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.content-row {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
}

.left-pane {
  height: 100%;
}

/* iPad Pro */
@media (min-width: 1024px) and (max-width: 1366px) {
  .payment-dialog {
    width: 70%;
    max-height: 85vh;
  }

  .left-pane,
  .right-pane {
    flex: 1;
    min-width: 50%;
  }
}

/* iPad Pro in portrait mode */
@media (min-width: 1024px) and (max-width: 1366px) and (orientation: portrait) {
  .payment-dialog {
    width: 70%;
    max-height: 85vh;
    height: auto;
  }
}

/* iPad and smaller tablets */
@media (min-width: 768px) and (max-width: 1023px) {
  .payment-dialog {
    width: 70%;
    max-height: 85vh;
    height: auto;
  }

  .left-pane {
    flex: 1;
    min-width: 50%;
  }

  .right-pane {
    flex: 1;
    min-width: 50%;
  }
}

/* iPad in portrait mode */
@media (min-width: 768px) and (max-width: 1023px) and (orientation: portrait) {
  .payment-dialog {
    width: 100%;
    max-height: 85vh;
    height: auto;
  }

  .left-pane {
    display: none;
  }

  .payment-dialog-container {
    align-items: end;
  }

  .content-row {
    flex-direction: column;
  }
}

/* Mobile devices */
@media (max-width: 768px) {
  .payment-dialog {
    width: 100%;
    height: auto;
    max-height: 90vh;
    border-radius: 16px 16px 0 0;
  }

  .payment-dialog-container {
    align-items: end;
  }

  .content-row {
    flex-direction: column;
  }

  .left-pane {
    display: none;
  }
}

/* Small height screens */
@media (max-height: 668px) {
  .payment-dialog {
    width: 100%;
    height: auto;
    max-height: 90vh;
  }
}

@media (max-height: 668px) and (orientation: landscape) {
  .payment-dialog {
    width: 100%;
    max-height: 90vh;
    height: auto;
  }

  .left-pane {
    display: none;
  }

  .payment-dialog-container {
    align-items: end;
  }

  .content-row {
    flex-direction: column;
  }
}
</style>
