<template>
  <div class="content-right">
    <div class="sdk-right-pane" :class="{ error: paymentRequestFetchError }">
      <div class="sdk-right-pane-header">
        <div v-if="!paymentRequestFetchError" class="sdk-right-pane-header-left">
          <div :class="showBackButton ? 'sdk-right-pane-header-actions' : null">
            <button v-if="showBackButton" class="sdk-action-button" @click="goToPreviousView">
              <img src="@/assets/images/icon_back.svg" alt="Back" />
            </button>
          </div>
          <div v-if="!isFetchingInitialData" :key="currentView" class="sdk-right-pane-header-text">
            <h2 v-if="currentView !== ViewType.PaymentStatusView">{{ viewTitleMap[currentView].title }}</h2>
            <p v-else class="payment-details-header">{{ viewTitleMap[currentView].title }}</p>
            <p v-if="viewTitleMap[currentView].showTimestamp" class="payment-timestamp">{{ formattedTimestamp }}</p>
          </div>
        </div>
        <div class="sdk-action-row">
          <button v-if="(currentView === ViewType.SelectBankView || currentView === ViewType.ChoosePaymentMethodView) && !paymentRequestFetchError && !isFetchingInitialData"
            class="sdk-action-button" @click="handleHelpAction">
            <img src="@/assets/images/icon_help.svg" alt="Help" />
          </button>
          <button class="sdk-action-button" :class="{ error: paymentRequestFetchError }" @click="handleClose">
            <img src="@/assets/images/icon_close.svg" alt="Close" />
          </button>
        </div>
      </div>

      <div class="view-content" :class="{ 'padding-right': currentView === ViewType.SelectBankView }">
        <Transition mode="out-in" name="fade-slide" @enter="enter" @leave="leave">
          <div v-if="isFetchingInitialData" class="shimmer-container">
            <Shimmer width="100px" height="40px" :image-url="atoaPrimaryLogo" background-color="var(--base-white )" />
          </div>
          <div v-else-if="paymentRequestFetchError" class="error-container">
            <img src="@/assets/images/icon_warning_black.svg" alt="Warning icon" class="warning-icon">
            <p class="error-title">Error processing payment</p>
            <p class="error-message">{{ paymentRequestFetchError.message }}</p>
          </div>
          <div v-else :key="currentView" class="view" :class="{ 'selectBankView': currentView === ViewType.SelectBankView }">
            <div v-if="currentView === ViewType.ExplainerView" class="view-container-flex">
              <ExplainerUI :is-loading="isFetchingInitialData" />
            </div>

            <div v-if="currentView === ViewType.ChoosePaymentMethodView" class="view-container-flex">
              <ChoosePaymentMethodView 
                :selected-bank="selectedBank"
                @select-bank="handleOnBankSelect" 
                @show-overlay="handleShowOverlay"
                @view-all-banks="handleViewAllBanks"
                :payment-details="paymentDetails"
                />
            </div>

            <div v-else-if="currentView === ViewType.SelectBankView" class="view-container-flex">
              <SelectBank v-on:select-bank="handleOnBankSelect" :selected-bank="selectedBank" :selected-bank-id="selectedBank?.id"
                @show-overlay="handleShowOverlay" />
            </div>

            <div v-else-if="currentView === ViewType.PaymentOptionsView" class="view-container-flex">
              <PaymentOptions v-if="paymentDetails && selectedBank" :selected-bank="selectedBank"
                :payment-details="paymentDetails" @bank-change="handleBankChange" @status-change="goToNextView" />
            </div>

            <div v-else-if="currentView === ViewType.PaymentInProgressView" class="view-container-flex">
              <PaymentVerification v-if="selectedBank" :selected-bank="selectedBank" @success="goToNextView" />
            </div>

            <div v-else-if="currentView === ViewType.PaymentStatusView" class="view-container-flex">
              <PaymentStatus @on-status-change="handleStatusChange"/>
            </div>
          </div>
        </Transition>
      </div>

      <div v-if="showDisabledBankOverlay" :class="['bank-overlay', { mobile: isMobileWidth }]">
        <div class="overlay-content">
          <div class="overlay-icon">
            <img src="@/assets/images/icon_warning.svg" alt="Warning" class="overlay-warning-image">
            <p>Downtime</p>
          </div>
          <div class="overlay-message">
            <p><strong>{{ disabledBank?.name }}</strong> bank is currently down for maintenance. Please select a
              different bank and try
              again.</p>
          </div>
          <button class="close-overlay-btn" @click.stop="closeOverlay">Select different bank</button>
        </div>
      </div>

      <CancellationDialog :show="showCancellationDialog" @dismiss="showCancellationDialog = false"
        @confirm="confirmClose" :is-pending="showPendingCancellationDialog" />

      <div class="sdk-right-pane-footer" v-if="currentView === ViewType.ExplainerView">
          <button class="continue-button" :style="{
            background: paymentDetails?.merchantThemeDetails?.colorCode,
            color: paymentDetails?.merchantThemeDetails?.foregroundColor,
            }" @click="goToNextView">
            I understand, continue
            <ArrowIconRight :color="paymentDetails?.merchantThemeDetails?.foregroundColor" />
          </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch, toRefs, type Ref, type ComputedRef, provide } from 'vue'
import ExplainerUI from '@/components/rightPane/explainer/ExplainerUI.vue'
import SelectBank from '@/components/rightPane/selectBank/SelectBank.vue'
import Shimmer from "@/components/sharedComponents/Shimmer.vue";
import atoaPrimaryLogo from "@/assets/images/atoa_logo_primary.svg";
import type BankData from '@/core/types/BankData'
import PaymentOptions from '@/components/rightPane/paymentOptions/PaymentOptions.vue'
import PaymentVerification from '@/components/rightPane/paymentVerification/PaymentVerification.vue'
import PaymentStatus from '@/components/rightPane/paymentStatus/PaymentStatus.vue'
import type PaymentDetails from '@/core/types/PaymentDetails'
import CancellationDialog from '@/components/rightPane/CancellationDialog.vue'
import { ViewType } from '@/core/types/ViewTypeEnum'
import type { DialogCloseEventData, DialogCloseEventHandler, UserCancelPaymentEventHandler } from '@/core/types/SdkOptions'
import type { Failure } from '@/core/utils/http-utils'
import ArrowIconRight from '@/components/sharedComponents/ArrowIconRight.vue';
import ChoosePaymentMethodView from '@/components/rightPane/selectBank/ChoosePaymentMethodView.vue';
import { DEFAULT_TRANSACTION_LIMIT } from '@/core/utils/constants';

type ViewConfig = {
  title: string;
  showTimestamp?: boolean;
};

const props = defineProps({
  isFetchingInitialData: {
    type: Boolean,
    required: false,
  },
});

const viewTitleMap: Record<ViewType, ViewConfig> = {
  [ViewType.ExplainerView]: {
    title: 'How to pay with bank app?',
  },
  [ViewType.ChoosePaymentMethodView]: {
    title: 'Choose payment method',
  },
  [ViewType.SelectBankView]: {
    title: 'Select your bank to continue',
  },
  [ViewType.PaymentOptionsView]: {
    title: 'Scan to pay',
  },
  [ViewType.PaymentInProgressView]: {
    title: 'Payment in progress',
  },
  [ViewType.PaymentStatusView]: {
    title: 'Payment details',
    showTimestamp: true
  }
} as const;

const { isFetchingInitialData } = toRefs(props);
const paymentRequestId = inject<string>('paymentRequestId');
const paymentDetails = inject<Ref<PaymentDetails>>('paymentRequestDetails');
const cancelPaymentHandler = inject<UserCancelPaymentEventHandler>('cancelPaymentHandler');
const closeHandler = inject<DialogCloseEventHandler>('closeHandler');
const paymentRequestFetchError = inject<Ref<Failure | null>>('paymentRequestFetchError');
const isMobileWidth = inject<ComputedRef<boolean>>('isMobileWidth');
const banksList = inject<Ref<BankData[]>>('banksList');

const views = ViewType.values();
const currentView = ref<ViewType>(ViewType.PaymentOptionsView);
const selectedBank = ref<BankData | undefined>();
const showDisabledBankOverlay = ref(false);
const disabledBank = ref<BankData | null>(null);
const paymentIdempotencyId = ref<string | null>();
const showCancellationDialog = ref(false);

provide('banksList', banksList);

let finalStatusData: DialogCloseEventData | undefined;
let showPendingCancellationDialog = false;
const pageAnimationDirection = ref<'forward' | 'backward'>('forward');

provide('paymentIdempotencyId', paymentIdempotencyId);

const showBackButton = computed(
  () => currentView.value === ViewType.PaymentOptionsView || currentView.value === ViewType.PaymentInProgressView
);

const isPending = computed(() => {
  if (!finalStatusData) return true;
  return finalStatusData?.status === 'PENDING';
});

// Computed property to determine the initial view after ExplainerView
const getInitialViewAfterExplainer = computed(() => {
  return paymentDetails?.value?.options?.cardPaymentEnabled 
    ? ViewType.ChoosePaymentMethodView 
    : ViewType.SelectBankView;
});

const goToPreviousView = () => {
  const currentIndex = views.indexOf(currentView.value);
  if (currentIndex > 0) {
    pageAnimationDirection.value = 'backward';
    let previousView = views[currentIndex - 1];
    
    // If we're going back from SelectBankView and card payment is enabled, 
    // we should go back to ChoosePaymentMethodView instead of the previous view in the array
    if (currentView.value === ViewType.SelectBankView && paymentDetails?.value?.options?.cardPaymentEnabled) {
      previousView = ViewType.ChoosePaymentMethodView;
    }
    
    setCurrentView(previousView);
  }
};

const goToNextView = () => {
  const currentIndex = views.indexOf(currentView.value);
  if (currentIndex < views.length - 1) {
    pageAnimationDirection.value = 'forward';
    let nextView = views[currentIndex + 1];
    
    // If we're transitioning from ExplainerView, use the computed property to determine the next view
    if (currentView.value === ViewType.ExplainerView) {
      nextView = getInitialViewAfterExplainer.value;
    }
    // If card payment is disabled and we're going to ChoosePaymentMethodView, skip to SelectBankView
    else if (nextView === ViewType.ChoosePaymentMethodView && !paymentDetails?.value?.options?.cardPaymentEnabled) {
      nextView = ViewType.SelectBankView;
    }
    
    if ([ViewType.PaymentInProgressView, ViewType.PaymentStatusView].includes(nextView)) {
      showPendingCancellationDialog = true;
    }
    setCurrentView(nextView);
  }
};

const setCurrentView = (view: ViewType) => {
  currentView.value = view;
};

const enter = (el: Element, done: () => void) => {
  const translateX = pageAnimationDirection.value === 'forward' ? '50px' : '-50px';
  const animation = (el as HTMLElement).animate(
    [
      { opacity: 0, transform: `translateX(${translateX})` },
      { opacity: 1, transform: 'translateX(0)' }
    ],
    {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  )
  animation.onfinish = done
}

const leave = (el: Element, done: () => void) => {
  const translateX = pageAnimationDirection.value === 'forward' ? '-50px' : '50px';
  const animation = (el as HTMLElement).animate(
    [
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: `translateX(${translateX})` }
    ],
    {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  )
  animation.onfinish = done
}

const handleOnBankSelect = (bank: BankData) => {
  selectedBank.value = bank;
  pageAnimationDirection.value = 'forward';
  setCurrentView(ViewType.PaymentOptionsView);
};

const handleBankChange = () => {
  pageAnimationDirection.value = 'backward';
  // If card payment is enabled, go back to ChoosePaymentMethodView, otherwise go to SelectBankView
  if (paymentDetails?.value?.options?.cardPaymentEnabled) {
    setCurrentView(ViewType.ChoosePaymentMethodView);
  } else {
    setCurrentView(ViewType.SelectBankView);
  }
};

const handleStatusChange = (data: DialogCloseEventData) => {
  finalStatusData = data;
};

const handleClose = () => {
  if (paymentRequestFetchError?.value || !isPending.value) {
    closeHandler?.(finalStatusData);
  }
  if (currentView.value === ViewType.ExplainerView) {
    goToNextView();
  } else {
    showCancellationDialog.value = true;
  }
};

const handleHelpAction = () => {
  setCurrentView(ViewType.ExplainerView);
}

const confirmClose = () => {
  showCancellationDialog.value = false;
  if (finalStatusData) {
    if (closeHandler) {
      closeHandler(finalStatusData);
    }
  } else if (cancelPaymentHandler) {
    cancelPaymentHandler(paymentRequestId ?? '');
  }
};

const timestamp = ref(new Date());

const formattedTimestamp = computed(() => {
  const date = timestamp.value;

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  const time = date.toLocaleTimeString('en-GB', timeOptions);

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };
  const dateStr = date.toLocaleDateString('en-GB', dateOptions);

  return `${time.toUpperCase()} on ${dateStr}`;
});

const handleShowOverlay = (bank: BankData) => {
  disabledBank.value = bank;
  showDisabledBankOverlay.value = true;
};

const closeOverlay = () => {
  showDisabledBankOverlay.value = false;
  disabledBank.value = null;
};

// Watch for changes in lastPaymentBankDetails
watch(() => paymentDetails?.value?.lastPaymentBankDetails, (newValue) => {
  if (newValue && banksList?.value && banksList.value.length > 0) {
    handlePreselectedBank();
  }
}, { immediate: true });

// Also watch banksList to handle the case when it gets populated after lastPaymentBankDetails
watch(() => banksList?.value, (newBanksList) => {
  if (newBanksList && newBanksList.length > 0 && paymentDetails?.value?.lastPaymentBankDetails) {
    handlePreselectedBank();
  }
}, { immediate: true });

const handlePreselectedBank = () => {
  if (!banksList?.value || banksList.value.length === 0 || !paymentDetails?.value?.lastPaymentBankDetails) {
    return;
  }
  
  const bank = banksList.value.find((bank: BankData) => bank.id === paymentDetails?.value.lastPaymentBankDetails?.institutionId);
  if (bank && bank.enabled && (bank.transactionAmountLimit ?? DEFAULT_TRANSACTION_LIMIT) >= (paymentDetails?.value.amount.amount ?? 0)) {
    selectedBank.value = bank;
  } else {
    selectedBank.value = undefined;
  }
};

const handleViewAllBanks = () => {
  setCurrentView(ViewType.SelectBankView);
};
</script>

<style scoped>
.content-right {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.sdk-right-pane {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px 0 16px 16px;
  overflow: hidden;
  height: 100%;
  position: relative;

  &.error {
    padding: 16px;
  }
}

.sdk-right-pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
  flex-shrink: 0;
  position: relative;
}

.sdk-right-pane-header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.sdk-right-pane-header-actions {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.sdk-action-button {
  border: none;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--grey-50);
  transition: background-color 0.2s ease;

  &.error {
    position: absolute;
    top: 0px;
    right: 0px;
  }
}

.sdk-action-button:hover {
  background-color: var(--grey-200);
}

.sdk-right-pane-header-text h2 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  color: var(--base-black);
}

.view-content {
  position: relative;
  overflow: visible;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding-right: 16px;

  &.padding-right {
    padding-right: 0;
  }
}

.view {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 16px;
}

/* Default hidden scrollbar for SelectBankView */
.view.selectBankView {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.view.selectBankView::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.view:not(.selectBankView)::-webkit-scrollbar {
  display: block;
  width: 4px;
}

.view:not(.selectBankView)::-webkit-scrollbar-thumb {
  background-color: var(--grey-300);
  border-radius: 48px;
}

.view:not(.selectBankView)::-webkit-scrollbar-track {
  background-color: var(--grey-200);
}

/* Show scrollbar in Firefox when not in SelectBankView */
.view:not(.selectBankView) {
  scrollbar-width: thin;
}

.view-container-flex {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  max-height: 100%;
  overflow: visible;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
}

.fade-slide-leave-to {
  opacity: 0;
}

.payment-details-header {
  margin: 0px;
  font-size: 14px;
  font-weight: 500;
  color: var(--grey-500);
  margin-bottom: 2px;
}

.payment-timestamp {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  color: var(--base-black);
}

.sdk-action-row {
  display: flex;
  gap: 16px;
  margin-right: 16px;
  z-index: 1;
}

.spacer {
  display: flex;
  flex: 1;
}

.bank-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.bank-overlay.mobile {
  position: fixed;
}

.overlay-content {
  background-color: var(--base-white);
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  margin: 0 48px;
  text-align: center;
}

.overlay-icon {
  background-color: var(--error-subtle);
  border-radius: 100px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  padding: 8px 12px;
  gap: 6px;
  width: fit-content;
}

.overlay-icon p {
  margin: 0px;
  padding: 0px;
  font-size: 11px;
  font-weight: 700;
  color: var(--error-default);
}

.overlay-warning-image {
  width: 24px;
  height: 24px;
}

.overlay-message p {
  margin: 0px;
  font-size: 16px;
  color: var(--base-black);
  margin-bottom: 24px;
}

.close-overlay-btn {
  width: 100%;
  background-color: var(--grey-50);
  color: var(--base-black);
  border: none;
  border-radius: 10px;
  padding: 14px 0px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.close-overlay-btn:hover {
  background-color: var(--grey-100);
}

.error-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.warning-icon {
  width: 42px;
  height: 42px;
  margin-bottom: 12px;
}

.error-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--base-black);
  margin: 12px 0px;
}

.error-message {
  font-size: 14px;
  color: var(--grey-600);
  max-width: 350px;
  margin: 0px;
}

.shimmer-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sdk-right-pane-footer {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 95%;
  flex-shrink: 0;
  z-index: 99;
  box-shadow: 0 -10px 10px -10px rgba(0, 0, 0, 0.2);
}

.payment-details-footer {
  font-weight: 700;
  color: var(--base-black);
}

.continue-button {
  width: 100%;
  background: #1A1A1A;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  font-family: inherit;
}

.arrow-right-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

@media (max-width: 1024px) {
  .view {
    padding-right: 0px;
  }

  .sdk-right-pane {
    padding: 16px;
  }

  .sdk-right-pane .explainer-ui {
    padding: 0px;
  }

  .sdk-right-pane-header-text p {
    text-align: center;
  }

  .view-content {
    padding: 0;
  }

  .sdk-action-row {
    margin-right: 0px;
  }

  .sdk-right-pane-header-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
  }

  .shimmer-container {
    width: 100%;
    height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sdk-right-pane-footer {
    width: 100%;
  }
}
</style>
