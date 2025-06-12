<template>
  <div class="payment-options">
    <div v-if="isMobileWidth" class="bank-app-info">
      <img src="@/assets/images/icon_info.svg" height="16px" width="16px" />
      <p class="bank-app-confirmation">
        We'll send you to your bank's app or website to confirm this payment.
      </p>
    </div>

    <div v-if="isMobileWidth" class="mobile-merchant-details">
      <div class="payment-options-header">
        <div class="merchant-details-row">
          <div class="store-image">
            <img :src="!(paymentRequestDetails?.storeImg) ? storeImagePlaceholder : paymentRequestDetails?.storeImg"
              height="40px" width="40px" />
          </div>
          <div class="merchant-details-column">
            <div class="paying-to">
              Paying to
            </div>
            <div class="merchant-business-name">
              {{ paymentRequestDetails?.merchantBusinessName }}
            </div>
          </div>
        </div>
        <div class="payment-amount">
          £{{ paymentRequestDetails?.amount?.amount.toFixed(2) ?? 0.00 }}
        </div>
      </div>
    </div>

    <div class="payment-options-header">
      <div class="bank-info">
        <div class="bank-logo">
          <img :src="getBankLogo(selectedBank)" :alt="selectedBank?.name" />
        </div>
        <div class="bank-name">
          <div class="bank-name-label">Paying from</div>
          <div class="bank-name-value">{{ selectedBank?.fullName }}</div>
        </div>
      </div>
      <button class="change-button" @click="$emit('bankChange')">Change</button>
    </div>

    <div v-if="fetchAuthorisationError" class="authorisation-error-container">
      <div class="error-icon">
        <img src="@/assets/images/icon_warning.svg" alt="Warning" class="error-warning-image">
        <p>{{ fetchAuthorisationError?.name === "REQUEST_TIMEOUT" ? "Expired" : "Error Occured" }}</p>
      </div>
      <div class="error-message">
        <p>
          {{ fetchAuthorisationError?.message }}
        </p>
      </div>
      <button class="error-overlay-btn" v-show="fetchAuthorisationError?.name !== 'REQUEST_TIMEOUT'" @click="$emit('bankChange')">Select different bank</button>
    </div>
    <div v-else class="footer-section">
      <div v-if="isMobile()" class="mobile-footer-section">
        <div v-if="maxAttemptsReached" class="link-expired-container">
          <p class="link-expired-message">
            Link expired,
            <span class="refresh-text" @click="restartAuthUrlsTimer">Refresh</span>
            to try again
          </p>
        </div>
        <Shimmer v-if="isLoading || maxAttemptsReached" height="48px" />
        <button v-else class="go-to-bank-button" :style="{
          background: paymentDetails?.merchantThemeDetails?.colorCode,
          color: paymentDetails?.merchantThemeDetails?.foregroundColor
        }" @click="handleGoToBankButtonClick">
          Go to {{ selectedBank.name }}
          <ArrowIconRight :color="paymentDetails?.merchantThemeDetails?.foregroundColor" />
        </button>
        <div class="atoa-terms">
          By continuing, you agreed to Atoa’s <a href="https://paywithatoa.co.uk/terms/" class="footer-link" target="_blank">Terms</a> and <a href="https://paywithatoa.co.uk/atoa-business-privacy-policy/" class="footer-link" target="_blank">Privacy Policy</a>.
        </div>
      </div>
      <div v-else class="desktop-footer-section">
        <div key="qr-section" class="qr-section">
          <p class="qr-instructions-bold">Scan with your phone camera</p>
          <p class="qr-instructions">to confirm in your bank app.</p>
          <div class="qr-container">
            <transition name="fade" mode="out-in">
              <div v-if="isLoading" class="qr-code-placeholder">
                <div class="loading-spinner"></div>
              </div>
              <div v-else class="qrcode">
                <div :class="{ 'blur-qr': maxAttemptsReached }" class="qrcode-svg-container">
                  <vue-qrcode :value="paymentUrl" tag="svg" :options="{
                    errorCorrectionLevel: 'Q',
                    width: 206,
                    margin: 0,
                  }"></vue-qrcode>
                </div>
                <button v-if="maxAttemptsReached" class="refresh-qr-button" @click="restartAuthUrlsTimer">
                  Refresh QR
                </button>
                <img class="qrcode-mask-image" src="@/assets/images/atoa_logo_primary.svg" alt="Atoa Logo" />
              </div>
            </transition>
          </div>
        </div>
        <div class="divider">
          <span>Or</span>
        </div>
        <div class="bank-website-link-container">
          <Shimmer v-if="isLoading" width="100px" height="24px" />
          <a v-else class="bank-website-link">
            Continue with <span @click.prevent="handleGoToBankWebsiteClick" class="bank-website-link-text">Internet Banking</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import storeImagePlaceholder from "@/assets/images/store_image_placeholder.svg";
import { ref, onMounted, inject, type Ref, type ComputedRef, onBeforeUnmount, computed } from 'vue';
import type BankData from '@/core/types/BankData';
import type PaymentDetails from '@/core/types/PaymentDetails';
import { PaymentsService } from '@/core/services/PaymentsService';
import type PaymentAuthResponse from '@/core/types/PaymentAuthResponse';
import { EnvironmentTypeEnum } from '@/core/types/Environment';
import VueQrcode from '@chenfengyuan/vue-qrcode';
import { goToBank, isMobile } from '@/core/utils/common';
import Shimmer from "@/components/sharedComponents/Shimmer.vue";
import type { Failure } from "@/core/utils/http-utils";
import type TransactionDetails from "@/core/types/TransactionDetails";
import ArrowIconRight from '@/components/sharedComponents/ArrowIconRight.vue';

const props = defineProps<{
  selectedBank: BankData;
  paymentDetails: PaymentDetails,
}>();

const emit = defineEmits<{
  (e: 'bankChange'): void;
  (e: 'statusChange', transactionDetails?: TransactionDetails): void;
}>();


const bankWebsiteUrl = ref('');
const isMobileWidth = inject<ComputedRef<boolean>>('isMobileWidth');
const paymentRequestId = inject<string>('paymentRequestId');
const paymentRequestDetails = inject<Ref<PaymentDetails>>('paymentRequestDetails');
const environment = inject<EnvironmentTypeEnum>('environment');
const apiBaseUrl = import.meta.env.VITE_QR_BASE_URL;
const paymentUrl = computed(() => {
  return `${apiBaseUrl}/pay?paymentRequestId=${paymentRequestId}&source=EXTERNAL_MERCHANT&deviceOrigin=SDK_DESKTOP_QR&selectedBank=${props.selectedBank.id}`;
});
const paymentAuthResponse = ref<PaymentAuthResponse | null>(null);
const paymentIdempotencyId = inject<Ref<string | null>>('paymentIdempotencyId');
const isLoading = ref(true);
const statusPollInterval = ref<number | null>(null);
const paymentRequestStatusPollInterval = ref<number | null>(null);
const authUrlPollInterval = ref<number | null>(null);
const fetchAuthorisationError = ref<Failure | null>(null);
const paymentsService = new PaymentsService();
const maxAttempts = 6;
let attemptCount = 0;
const maxAttemptsReached = ref(false);

const getBankLogo = (bank: BankData | undefined) => {
  if (!bank) return '';
  const logoMedia = bank.media.find(m => m.type === 'logo');
  return logoMedia ? logoMedia.source : '';
};

const handleGoToBankButtonClick = () => {
  goToBank(
    {
      authorisationUrl: paymentAuthResponse.value?.authorisationUrl ?? '',
      deepLinkAuthorisationUrlIOS: paymentAuthResponse.value?.deepLinkAuthorisationUrlIOS,
      businessAppDeepLinkAuthorisationUrl:
        paymentAuthResponse.value?.businessAppDeepLinkAuthorisationUrl,
      businessAppDeepLinkAndroidAuthorisationUrl:
        paymentAuthResponse.value?.businessAppDeepLinkAndroidAuthorisationUrl,
      deepLinkAuthorisationUrl: paymentAuthResponse.value?.deepLinkAuthorisationUrl,
      businessAppDeepLinkAuthorisationUrlIOS:
        paymentAuthResponse.value?.businessAppDeepLinkAuthorisationUrlIOS,
    },
    props.selectedBank.businessBank,
  );

  if (!statusPollInterval.value) {
    statusPollInterval.value = setInterval(checkPaymentStatus, 3000);
  }
}

const handleGoToBankWebsiteClick = async () => {
  if (maxAttemptsReached) {
    await fetchAuthorisationData();
  }

  if (isLoading.value || bankWebsiteUrl.value.length < 1) {
    return;
  }

  let atoaBankWebsiteUrlAnchorTag = document.createElement('a');
  atoaBankWebsiteUrlAnchorTag.target= '_blank';
  atoaBankWebsiteUrlAnchorTag.href= bankWebsiteUrl.value;
  atoaBankWebsiteUrlAnchorTag.click();

  if (!statusPollInterval.value) {
    statusPollInterval.value = setInterval(checkPaymentStatus, 3000);
  }
}

const fetchAuthorisationData = async () => {
  try {
    fetchAuthorisationError.value = null;
    isLoading.value = true;
    const authResponseData = await paymentsService.callBankAuthorisationUrl(paymentRequestId, props.paymentDetails, props.selectedBank);
    paymentAuthResponse.value = authResponseData;
    if (paymentIdempotencyId) {
      paymentIdempotencyId.value = paymentAuthResponse.value?.paymentIdempotencyId;
    }
    bankWebsiteUrl.value = authResponseData?.authorisationUrl;
  } catch (error: unknown) {
    fetchAuthorisationError.value = (error as Failure);
  } finally {
    isLoading.value = false;
  }
}

const checkPaymentStatus = async () => {
  try {
    const transactionDetails = await paymentsService.getPaymentStatusByID(
      paymentAuthResponse?.value?.paymentIdempotencyId || "",
      { env: environment || EnvironmentTypeEnum.PRODUCTION }
    );

    if (!['PAYMENT_NOT_INITIATED', 'AWAITING_AUTHORIZATION'].includes(transactionDetails.status ?? 'PAYMENT_NOT_INITIATED')) {
      clearInterval(statusPollInterval.value!);
      emit('statusChange', transactionDetails);
    }
  } catch (error) {
    // fail silently, since next call can fetch the updated status
  }
};

const checkPaymentRequestStatus = async () => {
  try {
    const paymentRequestStatusDetails = await paymentsService.getPaymentStatusByRequestId(
      paymentRequestId ?? "",
      { env: environment || EnvironmentTypeEnum.PRODUCTION }
    );

    if (!['PAYMENT_NOT_INITIATED', 'AWAITING_AUTHORIZATION'].includes(paymentRequestStatusDetails.status ?? 'PAYMENT_NOT_INITIATED')) {
      if (paymentRequestStatusPollInterval.value) clearInterval(paymentRequestStatusPollInterval.value);
      if (paymentIdempotencyId && paymentRequestStatusDetails.transactionDetails?.[0].paymentIdempotencyId) {
        paymentIdempotencyId.value = paymentRequestStatusDetails.transactionDetails?.[0].paymentIdempotencyId;
      }
      emit('statusChange');
    }
  } catch (error) {
    // fail silently, since next call can fetch the updated status
  }
};

function restartAuthUrlsTimer() {
  attemptCount = 0;
  maxAttemptsReached.value = false;
  refetchAuthUrls();
  restartPaymentPolling();
  authUrlPollInterval.value = setInterval(refetchAuthUrls, 280000); // 4 minutes and 40 seconds
}

const refetchAuthUrls = async () => {
  attemptCount++;

  if (attemptCount >= maxAttempts) {
    maxAttemptsReached.value = true;
    if (authUrlPollInterval.value) {
      clearInterval(authUrlPollInterval.value);
      authUrlPollInterval.value = null;
    }
    resetPaymentPolling();
  } else {
    fetchAuthorisationData();
  }
}

const restartPaymentPolling = () => {
  if(!statusPollInterval.value) {
    statusPollInterval.value = setInterval(checkPaymentStatus, 3000);
  }
  if(!isMobile() && !paymentRequestStatusPollInterval.value) {
    paymentRequestStatusPollInterval.value = setInterval(checkPaymentRequestStatus, 3000);
  }
}

const resetPaymentPolling = () => {
  if(statusPollInterval.value) {
    clearInterval(statusPollInterval.value);
    statusPollInterval.value = null;
  }
  if(paymentRequestStatusPollInterval.value) {
    clearInterval(paymentRequestStatusPollInterval.value);
    paymentRequestStatusPollInterval.value = null;
  }
}

onMounted(() => {
  restartAuthUrlsTimer();
});

onBeforeUnmount(() => {
  if (statusPollInterval.value) {
    clearInterval(statusPollInterval.value);
  }
  if (paymentRequestStatusPollInterval.value) {
    clearInterval(paymentRequestStatusPollInterval.value);
  }
  if (authUrlPollInterval.value) {
    clearInterval(authUrlPollInterval.value);
  }
});
</script>

<style scoped>
.payment-options {
  height: 100%;
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.payment-options-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--grey-50);
  border-radius: 12px;
  margin-bottom: 24px;
  box-sizing: border-box;
}

.bank-info {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 80%;
}

.bank-app-info {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
  background: var(--info-subtle);
  border-radius: 8px;
  margin-bottom: 16px;
  color: var(--info-darker);
  box-sizing: border-box;
}

.bank-app-confirmation {
  margin: 0;
  font-size: 12px;
}

.bank-logo {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid var(--grey-200);
  border-radius: 8px;
  padding: 8px;
  flex-shrink: 0;
}

.bank-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.bank-name {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.bank-name-label {
  font-size: 11px;
  color: var(--grey-500);
  font-weight: 500;
}

.bank-name-value {
  font-size: 14px;
  color: var(--base-black);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.change-button {
  color: var(--primary-500);
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  line-height: 150%;
  text-decoration-line: underline;
  text-decoration-style: dotted;
  text-decoration-skip-ink: none;
  text-decoration-thickness: 10%;
  text-underline-offset: 25%;
  text-underline-position: from-font;
}

.qr-section {
  text-align: center;
}

.qr-instructions-bold {
  font-size: 14px;
  color: var(--grey-600);
  margin: 0;
  margin-bottom: 8px;
  font-weight: 700;
}

.qr-instructions {
  font-size: 14px;
  color: var(--grey-600);
  margin: 0;
  margin-bottom: 8px;
  font-weight: 400;
}

.qr-container {
  background: var(--base-white);
  margin: 24px 0;
  border-radius: 14px;
  border: 1px solid var(--grey-200, #EAEEF0);
  background: var(--grey-50, #F6F8F9);
}

.qrcode {
  padding: 12px;
  display: inline-block;
  font-size: 0;
  margin-bottom: 0;
  position: relative;
}

.qrcode-svg-container {
  position: relative;
}

.qrcode-mask-image {
  background-color: var(--base-white);
  border-radius: 6px;
  overflow: hidden;
  position: absolute;
  padding: 14px 6px;
  top: 41%;
  left: 41%;
  margin: auto;
  z-index: 5;
}

.blur-qr {
  filter: blur(3px);
}

.qr-code :deep(svg) {
  width: 100%;
  height: 100%;
}

.qr-code-placeholder {
  width: 225px;
  height: 225px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--grey-50);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--grey-200);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.divider {
  width: 60%;
  text-align: center;
  border-bottom: 1px dashed var(--grey-200);
  line-height: 0.1em;
}

.divider span {
  background: var(--base-white);
  padding: 0 16px;
  color: var(--grey-400);
  font-size: 14px;
}

.bank-website-link-container {
  margin: 24px 0;
  display: flex;
  justify-content: center;
}

.bank-website-link {
  color: var(--grey-700);
  text-decoration: none;
  font-size: 14px;
  font-weight: 400;
}

.bank-website-link-text {
  font-weight: 700;
  border-bottom: 1px dotted var(--base-black);
  padding-bottom: 2px;
  cursor: pointer;
}

.bank-website-link-text:hover {
  opacity: 0.8;
}

.qr-error {
  color: var(--primary-500);
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
}

.footer-section {
  width: 100%;
}

.desktop-footer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mobile-merchant-details {
  width: 100%;
}

.mobile-footer-section {
  width: 100%;
}

.merchant-details-row {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 60%;
}

.merchant-details-column {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.paying-to {
  font-size: 12px;
  color: var(--grey-500);
  font-weight: 600;
}

.merchant-business-name {
  font-size: 14px;
  color: var(--base-black);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.store-image {
  border: 1px solid var(--grey-100);
  border-radius: 6px;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.payment-amount {
  font-size: 16px;
  color: var(--base-black);
  font-weight: 700;
}

.store-image img {
  border-radius: 6px;
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.go-to-bank-button {
  width: 100%;
  background: var(--base-black);
  color: var(--base-white);
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
  font-family: inherit;
  box-sizing: border-box;
}

.link-expired-container {
  text-align: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 12px;
  box-sizing: border-box;
}

.link-expired-message {
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--error-default);
  margin-bottom: 8px;

  .refresh-text {
    text-decoration: underline dotted;
    cursor: pointer;
    font-weight: 700;
  }
}

.atoa-terms {
  color: var(--grey-500);
  font-size: 11px;
  margin-top: 24px;
  text-align: center;
  line-height: 160%;
  padding: 0 16px;
}

.footer-link {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
  font-size: 11px;
  display: inline;
}

.authorisation-error-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}

.error-icon {
  background-color: var(--error-subtle);
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  padding: 8px 12px;
  gap: 6px;
  width: fit-content;
}

.error-icon p {
  margin: 0px;
  padding: 0px;
  font-size: 11px;
  font-weight: 700;
  color: var(--error-default);
}

.error-warning-image {
  width: 24px;
  height: 24px;
}

.error-message p {
  margin: 0px;
  font-size: 16px;
  color: var(--base-black);
  margin-bottom: 24px;
  line-height: 1.45;
  text-align: center;
}

.error-overlay-btn {
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

.error-overlay-btn:hover {
  background-color: var(--grey-100);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.instruction-gif-container {
  width: 100%;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.instruction-gif {
  max-height: 250px;
  max-width: 100%;
  object-fit: contain;
}

.arrow-right-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.go-to-bank-button-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-qr-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--base-black);
  color: var(--base-white);
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-sizing: border-box;
  z-index: 10;
}
</style>