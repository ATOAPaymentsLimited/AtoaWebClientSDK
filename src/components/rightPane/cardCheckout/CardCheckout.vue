<template>
  <div class="card-checkout" ref="cardCheckoutRef">
    <div v-if="isLoading || (!isIframeReady && !showCardError && !authError)" class="card-loading-container">
      <div v-if="!authError" class="loading-state">
        <img src="https://atoa-gifs.s3.eu-west-2.amazonaws.com/animated_grid.gif" alt="Loading" class="loading-animation">
        <p class="loading-text">Loading card payment</p>
      </div>
      <div v-else class="error-state">
        <img src="@/assets/images/icon_warning_black.svg" alt="Error" class="error-icon" />
        <p class="error-title">Something went wrong</p>
        <p class="error-message">Unable to load card payment. Please try again.</p>
        <button class="retry-button" @click="handleRetry">Retry</button>
      </div>
    </div>

    <div v-if="showCardError" class="error-state">
      <img src="@/assets/images/icon_warning_black.svg" alt="Error" class="error-icon" />
      <p class="error-title">Payment failed</p>
      <p class="error-message">Your card payment could not be processed. Please try again.</p>
      <button class="retry-button" @click="handleRetry">Try again</button>
    </div>

    <!-- Pay by bank upsell banner -->
    <div v-if="isIframeReady && !showCardError && !isIn3dsFlow && !isCardOnlyFlow" class="pay-by-bank-banner">
      <img :src="quickModeIcon" alt="" class="banner-icon" />
      <div class="banner-content">
        <div class="banner-text">
          <p class="banner-title">Pay by bank instead for quick payment?</p>
          <p class="banner-description">Pay with Bank App instead for a fast, secure checkout that helps {{ merchantName }} save on fees.</p>
        </div>
        <button class="banner-button" @click="emit('checkout-closed')">Switch to pay by bank</button>
      </div>
    </div>

    <!-- Placeholder: the actual Rapyd iframe renders in a div on document.body
         because the SDK uses Shadow DOM and Rapyd can't find elements inside it -->
    <div
      v-show="isIframeReady && !showCardError"
      ref="rapydPlaceholderRef"
      class="rapyd-checkout-container"
      :class="{ 'iframe-constrained': isIn3dsFlow }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onBeforeUnmount, watch, nextTick, type Ref } from "vue";
import { PaymentsService } from "@/core/services/PaymentsService";
import { loadRapydCheckoutToolkit } from "@/core/utils/rapydLoader";
import { EnvironmentTypeEnum } from "@/core/types/Environment";
import type PaymentDetails from "@/core/types/PaymentDetails";
import type PaymentAuthResponse from "@/core/types/PaymentAuthResponse";
import { Failure } from "@/core/utils/http-utils";
import { AtoaPayWebSDKError } from "@/core/types/Error";
import type { ErrorEventHandler } from "@/core/types/SdkOptions";
import quickModeIcon from "@/assets/images/icon_quick_mode.svg";

const POLLING_INTERVAL_MS = 2000;
const MAX_POLLING_ATTEMPTS = 450; // 15 minutes

const emit = defineEmits<{
  (e: "payment-success", data: { paymentIdempotencyId: string }): void;
  (e: "payment-failure", data: { paymentIdempotencyId?: string; error?: string }): void;
  (e: "checkout-closed"): void;
}>();

const paymentRequestId = inject<string>("paymentRequestId");
const paymentDetails = inject<Ref<PaymentDetails>>("paymentRequestDetails");
const environment = inject<EnvironmentTypeEnum>("environment") ?? EnvironmentTypeEnum.PRODUCTION;
const rapydToolkitReady = inject<Ref<boolean>>("rapydToolkitReady");
const errorHandler = inject<ErrorEventHandler>("errorHandler");

const merchantName = computed(() => paymentDetails?.value?.merchantBusinessName || "the merchant");
const isCardOnlyFlow = computed(() => paymentDetails?.value?.paymentMethod === "CARD");

const paymentsService = new PaymentsService();

const cardCheckoutRef = ref<HTMLElement | null>(null);
const rapydPlaceholderRef = ref<HTMLElement | null>(null);
const isLoading = ref(true);
const authError = ref(false);
const showCardError = ref(false);
const isUnsupportedCard = ref(false);
const isIn3dsFlow = ref(false);
const isIframeReady = ref(false);

const cardAuthResponse = ref<PaymentAuthResponse | null>(null);
const rapydCheckout = ref<any>(null);
const pollingTimer = ref<ReturnType<typeof setInterval> | null>(null);
const pollingAttempts = ref(0);
const cardCheckoutId = ref<string | null>(null);

// The Rapyd container lives outside Shadow DOM so the toolkit can find it
let externalRapydContainer: HTMLDivElement | null = null;

function createExternalRapydContainer() {
  if (externalRapydContainer) return;

  externalRapydContainer = document.createElement("div");
  externalRapydContainer.id = "rapyd-checkout";
  // Hidden staging area — Rapyd needs this in the light DOM to find it
  externalRapydContainer.style.cssText = "position: fixed; top: -9999px; left: -9999px; width: 400px;";
  document.body.appendChild(externalRapydContainer);
}

function removeExternalRapydContainer() {
  if (externalRapydContainer && externalRapydContainer.parentNode) {
    externalRapydContainer.parentNode.removeChild(externalRapydContainer);
    externalRapydContainer = null;
  }
}

/**
 * Watch the external staging div for Rapyd's iframe injection,
 * then move the iframe into our shadow DOM placeholder.
 */
function watchForRapydIframe() {
  if (!externalRapydContainer || !rapydPlaceholderRef.value) return;

  const observer = new MutationObserver(() => {
    const iframe = externalRapydContainer?.querySelector("iframe");
    if (iframe && rapydPlaceholderRef.value) {
      observer.disconnect();

      // Override Rapyd's default inline styles to fit within the right pane
      iframe.style.cssText = `
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        min-height: 700px !important;
        border: none !important;
        box-sizing: border-box !important;
      `;

      // Move iframe from external staging into shadow DOM placeholder
      rapydPlaceholderRef.value.appendChild(iframe);
      isIframeReady.value = true;
      console.log("[CardCheckout] Rapyd iframe moved into shadow DOM");

      // Clean up the now-empty staging div
      removeExternalRapydContainer();
    }
  });

  observer.observe(externalRapydContainer, { childList: true, subtree: true });

  // Safety timeout — if iframe never appears, clean up
  setTimeout(() => {
    observer.disconnect();
  }, 15000);
}

async function initialize() {
  isLoading.value = true;
  authError.value = false;
  showCardError.value = false;

  try {
    // Use preloaded toolkit if available, otherwise load it now
    if (!rapydToolkitReady?.value) {
      console.log("[CardCheckout] Loading Rapyd toolkit...", { url: import.meta.env.VITE_RAPYD_TOOLKIT_URL });
      await loadRapydCheckoutToolkit();
      if (rapydToolkitReady) rapydToolkitReady.value = true;
    }
    console.log("[CardCheckout] Rapyd toolkit ready");

    console.log("[CardCheckout] Fetching card checkout details...", {
      paymentRequestId,
      hasPaymentDetails: !!paymentDetails?.value,
      merchantId: paymentDetails?.value?.merchantId,
      cardPaymentEnabled: paymentDetails?.value?.options?.cardPaymentEnabled,
    });
    await fetchCardCheckoutDetails();
  } catch (error) {
    console.error("[CardCheckout] Initialize failed:", error);
    authError.value = true;
    isLoading.value = true;
  }
}

async function fetchCardCheckoutDetails() {
  if (!paymentDetails?.value) {
    console.error("[CardCheckout] No payment details available");
    authError.value = true;
    isLoading.value = true;
    return;
  }

  try {
    const response = await paymentsService.callCardAuthorisationUrl(
      paymentRequestId,
      paymentDetails.value
    );
    console.log("[CardCheckout] Card auth response:", {
      cardCheckoutId: response.cardCheckoutId,
      paymentIdempotencyId: response.paymentIdempotencyId,
      status: response.status,
    });

    if (response.cardCheckoutId) {
      cardAuthResponse.value = response;
      cardCheckoutId.value = response.cardCheckoutId;
      isLoading.value = false;
    } else {
      throw new Error("No cardCheckoutId in response — merchant may not have card payments enabled");
    }
  } catch (error) {
    console.error("[CardCheckout] fetchCardCheckoutDetails failed:", error);

    if (error instanceof Failure && error.name === "REQUEST_TIMEOUT") {
      if (errorHandler) {
        errorHandler(new AtoaPayWebSDKError(error.message, {
          errorName: error.name,
          statusCode: error.statusCode,
          redirectUrl: error.redirectUrl,
        }));
      }
    }

    authError.value = true;
    isLoading.value = true;
  }
}

function setupRapydEventListeners() {
  window.addEventListener("onLoading", handleRapydLoading);
  window.addEventListener("onCheckoutPaymentSuccess", handlePaymentSuccess);
  window.addEventListener("onCheckoutFailure", handlePaymentFailure);
  window.addEventListener("onCheckoutPaymentFailure", handlePaymentFailureRedirect);
  window.addEventListener("onCheckoutPaymentPending", handlePaymentPending);
}

function removeRapydEventListeners() {
  window.removeEventListener("onLoading", handleRapydLoading);
  window.removeEventListener("onCheckoutPaymentSuccess", handlePaymentSuccess);
  window.removeEventListener("onCheckoutFailure", handlePaymentFailure);
  window.removeEventListener("onCheckoutPaymentFailure", handlePaymentFailureRedirect);
  window.removeEventListener("onCheckoutPaymentPending", handlePaymentPending);
}

function initializePayment() {
  console.log("[CardCheckout] initializePayment", {
    cardCheckoutId: cardCheckoutId.value,
    rapydToolkitLoaded: !!window.RapydCheckoutToolkit,
    amount: paymentDetails?.value?.amount?.amount,
  });
  if (!cardCheckoutId.value || !window.RapydCheckoutToolkit) return;

  try {
    // Create a temporary staging div in the light DOM for Rapyd to find
    createExternalRapydContainer();
    // Start watching for the iframe so we can move it into shadow DOM
    watchForRapydIframe();

    rapydCheckout.value = new window.RapydCheckoutToolkit({
      pay_button_text: "Pay Now",
      pay_button_color: "#e42444",
      id: cardCheckoutId.value,
      amount: paymentDetails?.value?.amount?.amount?.toFixed(2),
      currency: paymentDetails?.value?.amount?.currency ?? "GBP",
      wait_on_payment_redirect: true,
      style: {
        submit: { base: { color: "white", padding: 0 } },
        body: { boxShadow: "none", padding: 0 },
        container: { padding: 0, margin: 0 },
        div: { padding: 0, margin: 0 },
      },
    });
    rapydCheckout.value.displayCheckout();
    console.log("[CardCheckout] Rapyd checkout displayed, waiting for iframe...");
  } catch (error) {
    console.error("[CardCheckout] initializePayment failed:", error);
    removeExternalRapydContainer();
    authError.value = true;
    isLoading.value = true;
  }
}

// --- Rapyd event handlers ---

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleRapydLoading(_event: any) {
  // Rapyd toolkit reports its internal loading state — currently unused
  // since we manage our own loading state via isLoading ref
}

function handlePaymentSuccess(event: any) {
  stopPolling();
  removeExternalRapydContainer();
  const idempotencyId =
    event.detail?.metadata?.paymentIdempotencyId ??
    cardAuthResponse.value?.paymentIdempotencyId;

  emit("payment-success", { paymentIdempotencyId: idempotencyId });
}

function handlePaymentFailure(event: any) {
  stopPolling();
  removeExternalRapydContainer();
  console.error("[CardCheckout] onCheckoutFailure:", {
    detail: event.detail,
    isTrusted: event.isTrusted,
    error: event.detail?.error,
  });
  showCardError.value = true;
}

function handlePaymentFailureRedirect(event: any) {
  stopPolling();
  removeExternalRapydContainer();
  console.error("[CardCheckout] onCheckoutPaymentFailure:", {
    detail: event.detail,
    isTrusted: event.isTrusted,
    error: event.detail?.error,
  });
  const idempotencyId = cardAuthResponse.value?.paymentIdempotencyId;

  if (!idempotencyId) {
    showCardError.value = true;
    return;
  }

  emit("payment-failure", {
    paymentIdempotencyId: idempotencyId,
    error: event.detail?.error,
  });
}

function handlePaymentPending(event: any) {
  if (event.detail?.next_action === "3d_verification") {
    isIn3dsFlow.value = true;
    const idempotencyId =
      event.detail?.metadata?.paymentIdempotencyId ??
      cardAuthResponse.value?.paymentIdempotencyId;

    if (idempotencyId) {
      start3dsPolling(idempotencyId);
    }
  }
}

// --- 3DS polling ---

function start3dsPolling(paymentIdempotencyId: string) {
  pollingAttempts.value = 0;
  pollPaymentStatus(paymentIdempotencyId);
  pollingTimer.value = setInterval(() => {
    pollPaymentStatus(paymentIdempotencyId);
  }, POLLING_INTERVAL_MS);
}

function stopPolling() {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value);
    pollingTimer.value = null;
  }
  pollingAttempts.value = 0;
}

async function pollPaymentStatus(paymentIdempotencyId: string) {
  if (pollingAttempts.value >= MAX_POLLING_ATTEMPTS) {
    stopPolling();
    emit("payment-failure", {
      paymentIdempotencyId,
      error: "Payment verification timeout",
    });
    return;
  }

  try {
    pollingAttempts.value++;
    const response = await paymentsService.getPaymentStatusByID(
      paymentIdempotencyId,
      { env: environment }
    );

    const finalStatuses = ["FAILED", "REJECTED", "COMPLETED", "CANCELLED"];
    const status = response.status ?? "";
    if (finalStatuses.includes(status)) {
      stopPolling();
      if (status === "COMPLETED") {
        emit("payment-success", { paymentIdempotencyId });
      } else {
        emit("payment-failure", {
          paymentIdempotencyId,
          error: status,
        });
      }
    }
  } catch {
    if (pollingAttempts.value >= MAX_POLLING_ATTEMPTS) {
      stopPolling();
      emit("payment-failure", {
        paymentIdempotencyId,
        error: "Payment verification timeout",
      });
    }
  }
}

// --- Retry ---

async function handleRetry() {
  stopPolling();
  showCardError.value = false;
  isUnsupportedCard.value = false;
  isIn3dsFlow.value = false;
  isIframeReady.value = false;

  if (rapydCheckout.value) {
    try {
      rapydCheckout.value.closeCheckout();
    } catch {
      // silent cleanup
    }
    rapydCheckout.value = null;
  }
  removeExternalRapydContainer();

  await initialize();
}

// --- Lifecycle ---

watch(cardCheckoutId, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    isIn3dsFlow.value = false;
    isIframeReady.value = false;
    stopPolling();

    if (rapydCheckout.value) {
      try {
        rapydCheckout.value.closeCheckout();
      } catch {
        // silent cleanup
      }
      rapydCheckout.value = null;
    }
    removeExternalRapydContainer();

    nextTick(() => initializePayment());
  }
});

onMounted(() => {
  setupRapydEventListeners();
  initialize();
});

onBeforeUnmount(() => {
  stopPolling();
  removeRapydEventListeners();
  removeExternalRapydContainer();

  if (rapydCheckout.value) {
    try {
      rapydCheckout.value.closeCheckout();
    } catch {
      // silent cleanup
    }
  }
});
</script>

<style scoped>
.card-checkout {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  -webkit-overflow-scrolling: touch;
}

/* Scrollbar styling to match the SDK's existing pattern */
.card-checkout::-webkit-scrollbar {
  width: 4px;
}

.card-checkout::-webkit-scrollbar-thumb {
  background-color: var(--grey-300);
  border-radius: 48px;
}

.card-checkout::-webkit-scrollbar-track {
  background-color: var(--grey-200);
}

.card-loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 300px;
  padding: 40px 20px;
  gap: 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.loading-animation {
  width: 150px;
  height: 100px;
  transform: scale(2);
  aspect-ratio: 1/1;
  object-fit: contain;
}

.loading-text {
  color: var(--grey-600);
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.pay-by-bank-banner {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 16px 12px;
  background: #f1f6ff;
  border-radius: 8px;
  margin-top: 16px;
  margin-bottom: 16px;
}

.banner-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

.banner-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.banner-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: #2b53b6;
}

.banner-title {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
  margin: 0;
}

.banner-description {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
}

.banner-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 16px;
  background: #2b53b6;
  color: white;
  border: none;
  border-radius: 4px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.6;
  cursor: pointer;
  width: fit-content;
}

.banner-button:hover {
  background: #243f8f;
}

.rapyd-checkout-container {
  width: 100%;
  min-height: 0;
  padding-bottom: 24px;
}

.rapyd-checkout-container.iframe-constrained {
  min-height: 0;
  overflow: hidden;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 300px;
  padding: 40px 20px;
  text-align: center;
}

.error-icon {
  width: 42px;
  height: 42px;
  margin-bottom: 12px;
}

.error-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--base-black);
  margin: 12px 0 8px;
}

.error-message {
  font-size: 14px;
  color: var(--grey-500);
  max-width: 300px;
  margin: 0 0 24px;
}

.retry-button {
  font-family: inherit;
  background: none;
  border: none;
  color: var(--primary-500, #e42444);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 8px 16px;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 8px;
}

.retry-button:hover {
  opacity: 0.8;
}
</style>
