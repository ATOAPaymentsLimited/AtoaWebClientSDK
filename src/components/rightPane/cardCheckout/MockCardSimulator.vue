<template>
  <div class="mock-card-simulator">
    <div class="simulator-header">
      <span class="test-mode-badge">TEST MODE</span>
      <span v-if="selectedOption?.requires3ds" class="step-counter">
        {{ step === "details" ? 1 : 2 }} / 2
      </span>
    </div>

    <div class="simulator-body">
      <!-- Card details, with the outcome chosen from a dropdown -->
      <template v-if="step === 'details'">
        <p class="step-title">Card details</p>

        <p v-if="savesCard" class="save-card-note">
          This payment saves the card, which production only allows after a 3DS
          challenge. Authenticate with
          <strong>{{ MOCK_CARD_3DS_CODE }}</strong> to complete the payment and
          save the card. To simulate a failed payment, enter any other code at
          the challenge — it fails the payment and saves nothing.
        </p>

        <div class="form-field">
          <label id="test-card-label">Test card</label>
          <div
            class="card-picker"
            :class="{ open: isPickerOpen }"
            @keydown.esc="isPickerOpen = false"
          >
            <button
              type="button"
              class="picker-trigger"
              aria-haspopup="listbox"
              aria-labelledby="test-card-label"
              :aria-expanded="isPickerOpen"
              @click="isPickerOpen = !isPickerOpen"
            >
              <span class="picker-value">
                <img
                  v-if="selectedOption?.brandIcon"
                  :src="selectedOption.brandIcon"
                  alt=""
                  class="brand-mark"
                />
                <span class="picker-pan">
                  {{ selectedOption?.panDisplay ?? "Select card" }}
                </span>
                <span v-if="selectedOption" class="picker-tag">
                  {{ selectedOption.tag }}
                </span>
              </span>
              <img
                src="@/assets/images/icon_drop_down.svg"
                alt=""
                class="picker-chevron"
              />
            </button>

            <!-- Expands in flow rather than floating: the card clips its overflow, and pushing
                 the form down is how the live card checkout's picker behaves. -->
            <div v-if="isPickerOpen" class="picker-list" role="listbox">
              <button
                v-for="option in pickerOptions"
                :key="option.key"
                type="button"
                class="picker-option"
                :class="{ selected: option.key === selectedKey }"
                @click="selectOption(option.key)"
              >
                <span class="option-pan">{{ option.panDisplay }}</span>
                <span class="option-meta">
                  <span class="option-tag">{{ option.tag }}</span>
                  <img
                    v-if="option.brandIcon"
                    :src="option.brandIcon"
                    alt=""
                    class="brand-mark"
                  />
                </span>
              </button>
            </div>
          </div>
        </div>

        <div class="form-field">
          <label for="mock-card-number">Card number</label>
          <input
            id="mock-card-number"
            :value="selectedOption?.panDisplay ?? ''"
            type="text"
            autocomplete="off"
            placeholder="No card"
            readonly
          />
        </div>

        <div class="form-row">
          <div class="form-field" :class="{ invalid: shownErrors.expiry }">
            <label for="mock-card-expiry">MM / YY</label>
            <input
              id="mock-card-expiry"
              ref="expiryInput"
              v-model="expiry"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              placeholder="MM / YY"
              maxlength="7"
              :aria-invalid="shownErrors.expiry != null"
              @input="onExpiryInput"
            />
            <span v-if="shownErrors.expiry" class="field-error">
              {{ shownErrors.expiry }}
            </span>
          </div>
          <div class="form-field" :class="{ invalid: shownErrors.cvv }">
            <label for="mock-card-cvv">CVV</label>
            <input
              id="mock-card-cvv"
              ref="cvvInput"
              v-model="cvv"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              placeholder="CVV"
              maxlength="4"
              :aria-invalid="shownErrors.cvv != null"
              @input="onCvvInput"
            />
            <span v-if="shownErrors.cvv" class="field-error">
              {{ shownErrors.cvv }}
            </span>
          </div>
        </div>

        <div class="form-field" :class="{ invalid: shownErrors.name }">
          <label for="mock-card-name">Cardholder name</label>
          <input
            id="mock-card-name"
            ref="nameInput"
            v-model.trim="cardholderName"
            type="text"
            autocomplete="off"
            placeholder="Cardholder Name"
            :aria-invalid="shownErrors.name != null"
          />
          <span v-if="shownErrors.name" class="field-error">
            {{ shownErrors.name }}
          </span>
        </div>

        <div class="summary">
          <p class="summary-title">Summary</p>
          <div class="summary-row">
            <span>Total</span>
            <span class="summary-total">{{ totalDisplay }}</span>
          </div>
        </div>

        <span v-if="submitError" class="field-error submit-error">
          {{ submitError }}
        </span>

        <div class="actions stacked">
          <button
            type="button"
            class="primary-button"
            :disabled="selectedOption === null || isSubmitting"
            @click="payNow"
          >
            {{ isSubmitting ? "Processing…" : "Pay Now" }}
          </button>
          <button type="button" class="secondary-button" @click="cancel">
            Cancel
          </button>
        </div>
      </template>

      <!-- 3DS challenge, only for a card whose scenario requires it -->
      <MockCardThreeDs
        v-else
        @resolve="onThreeDsResolved"
        @cancel="step = 'details'"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref, watch, type Ref } from "vue";
import MockCardThreeDs from "./MockCardThreeDs.vue";
import visaMark from "@/assets/images/card_visa.webp";
import mastercardMark from "@/assets/images/card_mastercard.svg";
import {
  SANDBOX_TEST_CARDS,
  SAVED_CARD_TAGS,
  type MockCardTestCard,
} from "@/core/types/MockCardSimulator";
import { MockCardSimulatorService } from "@/core/services/MockCardSimulatorService";
import { MOCK_CARD_3DS_CODE } from "@/core/utils/constants";
import type PaymentDetails from "@/core/types/PaymentDetails";

/**
 * Atoa Mock Card simulator — the sandbox stand-in for the Rapyd hosted checkout.
 *
 * One card form, with the test card picked from a dropdown, plus a 3DS step for the card whose
 * scenario requires it. Submitting POSTs the chosen number to the sandbox simulate endpoint, which
 * resolves the outcome and drives the payment down the same execution path a live card takes — so
 * this screen proposes an outcome and the backend decides it.
 *
 * Ported from the consumer web's simulator so a sandbox card payment looks and behaves the same
 * wherever it is taken.
 */
const props = defineProps<{
  paymentIdempotencyId: string;
}>();

const emit = defineEmits<{
  /** The payment reached a status; the checkout view takes over from here. */
  resolved: [status: string];
  cancel: [];
}>();

type Step = "details" | "threeDs";

const paymentDetails = inject<Ref<PaymentDetails>>("paymentRequestDetails");

/** What the tester is paying, in the format the live card checkout shows it. */
const totalDisplay = computed(() => {
  const currency = paymentDetails?.value?.amount?.currency ?? "GBP";
  const amount = paymentDetails?.value?.amount?.amount ?? 0;

  return `${currency} ${amount.toFixed(2)}`;
});

/**
 * One row in the picker.
 *
 * A 3DS card occupies a single row but carries two outcomes: the entered code decides which.
 * Every other outcome is one row, one outcome.
 */
interface PickerOption {
  key: string;
  /** The number submitted for this outcome. Never displayed in full. */
  pan: string;
  /** Masked card, `XXXX` + last four — the format the rest of the platform displays. */
  panDisplay: string;
  tag: string;
  /** Scheme mark shown on the row. */
  brandIcon: string | null;
  requires3ds: boolean;
}

const step = ref<Step>("details");
const expiry = ref("12 / 34");
const cvv = ref("");
const cardholderName = ref("");
const expiryInput = ref<HTMLInputElement | null>(null);
const cvvInput = ref<HTMLInputElement | null>(null);
const nameInput = ref<HTMLInputElement | null>(null);

/** `MM / YY` against the current month — the check a real card form runs before submitting. */
const expiryMessage = (): string | null => {
  const digits = expiry.value.replace(/\D/g, "");
  if (digits.length === 0) return "Required";
  if (digits.length < 4) return "Invalid date";

  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2, 4));
  if (month < 1 || month > 12) return "Invalid date";

  const now = new Date();
  const isPast =
    year < now.getFullYear() ||
    (year === now.getFullYear() && month < now.getMonth() + 1);

  return isPast ? "Card expired" : null;
};

const errors = computed(() => ({
  expiry: expiryMessage(),
  cvv: cvv.value === "" ? "Required" : null,
  name: cardholderName.value === "" ? "Required" : null,
}));

/** Errors surface on submit, not while typing, so an untouched form is not scolded. */
const submitted = ref(false);
const shownErrors = computed(() =>
  submitted.value ? errors.value : { expiry: null, cvv: null, name: null },
);

/** `4242 4242 4242 4242` -> `XXXX4242`, matching `maskCardDetails` on the backend. */
const maskPan = (pan: string): string => {
  const digits = pan.replace(/\D/g, "");
  return `XXXX${digits.slice(-4)}`;
};

/** Scheme mark from the leading digit, the way a real card form detects it. */
const brandMarkForPan = (pan: string): string | null => {
  if (pan.startsWith("4")) return visaMark;
  if (pan.startsWith("5")) return mastercardMark;
  return null;
};

/**
 * Does this payment save its card?
 *
 * Read off the payment request, which is where the merchant set it. Production forces a 3DS challenge
 * for save-card (Rapyd's `3d_required`), so only the cards that present one can save.
 */
const savesCard = computed(
  () => paymentDetails?.value?.savePaymentMethod === true,
);

/**
 * What this card is called in the picker.
 *
 * A save-card payment names the outcome by what happens to the SAVED card, because that is the only
 * thing that separates the cards on offer — all of them take the payment and present the same 3DS
 * challenge. Any other payment names the outcome by what the payment itself does.
 *
 * @param card - The catalogue entry
 * @returns The label to show
 */
const tagFor = (card: MockCardTestCard): string =>
  savesCard.value && card.savedBehavior !== undefined
    ? SAVED_CARD_TAGS[card.savedBehavior]
    : card.tag;

/**
 * The cards this payment may use.
 *
 * A save-card payment gets only the savable ones — keyed on `savedBehavior`, the same fact the
 * endpoint's guard keys on, rather than on `requires3ds`, which coincides with it today but answers a
 * different question. Every other payment gets the full list.
 */
const pickerOptions = computed<PickerOption[]>(() =>
  SANDBOX_TEST_CARDS.filter(
    (card: MockCardTestCard) =>
      !savesCard.value || card.savedBehavior !== undefined,
  ).map((card: MockCardTestCard) => ({
    key: card.testCardId,
    pan: card.pan,
    panDisplay: maskPan(card.pan),
    tag: tagFor(card),
    brandIcon: brandMarkForPan(card.pan),
    requires3ds: card.requires3ds,
  })),
);

// Defaults to the first catalogue entry so the form is usable without a selection step.
const selectedKey = ref<string | null>(null);

const selectedOption = computed<PickerOption | null>(
  () => pickerOptions.value.find((row) => row.key === selectedKey.value) ?? null,
);

watch(
  pickerOptions,
  (options) => {
    if (selectedKey.value === null && options.length > 0) {
      selectedKey.value = options[0].key;
    }
  },
  { immediate: true },
);

const isPickerOpen = ref(false);

const selectOption = (key: string) => {
  selectedKey.value = key;
  isPickerOpen.value = false;
};

const onExpiryInput = () => {
  const digits = expiry.value.replace(/\D/g, "").slice(0, 4);
  expiry.value =
    digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
};

/**
 * Split the entered "MM / YY" into the month and four-digit year the API takes.
 *
 * Only reached once the field has validated, so the digits are there.
 */
const expiryParts = (): [number, number] => {
  const digits = expiry.value.replace(/\D/g, "");

  return [Number(digits.slice(0, 2)), 2000 + Number(digits.slice(2, 4))];
};

const onCvvInput = () => {
  cvv.value = cvv.value.replace(/\D/g, "").slice(0, 4);
};

const simulatorService = new MockCardSimulatorService();
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);

/**
 * Submit the chosen test card and let the backend decide the outcome.
 *
 * Nothing here interprets the result beyond handing the status up: the endpoint runs the same
 * execution, status write and merchant webhook a live card payment does.
 */
const submitCard = async (threeDsCode?: string) => {
  const option = selectedOption.value;
  if (option == null || isSubmitting.value) return;

  isSubmitting.value = true;
  submitError.value = null;

  try {
    const [expiryMonth, expiryYear] = expiryParts();
    const result = await simulatorService.simulatePayment(
      props.paymentIdempotencyId,
      {
        cardNumber: option.pan,
        threeDsCode,
        expiryMonth,
        expiryYear,
        cardholderName: cardholderName.value,
      },
    );
    emit("resolved", result.status);
  } catch (error) {
    // Back to the form with the reason — a refused card number or a payment that can no longer be
    // simulated is a real error, not an outcome to render as a decline.
    step.value = "details";
    submitError.value =
      error instanceof Error ? error.message : "Could not simulate the payment";
  } finally {
    isSubmitting.value = false;
  }
};

const payNow = () => {
  const option = selectedOption.value;
  if (option == null) return;

  // The fields the tester fills in are validated like a real card form would, even though the
  // outcome comes from the card number — an expired date or a blank CVV never reaches the backend.
  submitted.value = true;
  const invalid = errors.value;
  if (invalid.expiry != null) {
    expiryInput.value?.focus();
    return;
  }
  if (invalid.cvv != null) {
    cvvInput.value?.focus();
    return;
  }
  if (invalid.name != null) {
    nameInput.value?.focus();
    return;
  }

  if (option.requires3ds) {
    step.value = "threeDs";
    return;
  }

  void submitCard();
};

/** The tester entered a code; the backend compares it, not this screen. */
const onThreeDsResolved = (code: string) => {
  void submitCard(code);
};

const cancel = () => {
  emit("cancel");
};
</script>

<style scoped>

.mock-card-simulator,
.mock-card-simulator * {
  box-sizing: border-box;
}

.mock-card-simulator {
  width: 100%;
  max-width: 420px;
  /* Bottom margin so the last button never sits flush against the dialog edge. */
  margin: 16px auto 24px;
  border: 1px solid var(--grey-200, #e6e6e6);
  border-radius: 12px;
  overflow: hidden;
  background: white;
  /* The checkout is a flex column, so without this the card is SHRUNK to the available height and
     `overflow: hidden` clips the summary and the Pay Now button instead of letting the checkout
     scroll to them. Keep its natural height and let the parent scroll. */
  flex-shrink: 0;
}

.simulator-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 16px;
  background: var(--grey-50, #f7f7f7);
  border-bottom: 1px solid var(--grey-200, #e6e6e6);
}

.test-mode-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--primary-500, #e42444);
}

.step-counter {
  font-size: 11px;
  font-weight: 500;
  color: var(--grey-500, #757575);
}

.simulator-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.step-title {
  color: var(--base-black, #101010);
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.save-card-note {
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background-color: var(--grey-50, #f7f7f7);
  color: var(--grey-600, #5c5c5c);
  font-size: 12px;
  line-height: 1.5;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-field {
  flex: 1;
  min-width: 0;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  color: var(--grey-600, #575757);
  font-size: 12px;
  font-weight: 500;
}

.form-field input {
  font-family: inherit;
  font-size: 14px;
  color: var(--base-black, #101010);
  padding: 12px;
  border: 1px solid var(--grey-200, #e6e6e6);
  border-radius: 8px;
  outline: none;
  background: white;
  width: 100%;
  box-sizing: border-box;
}

.form-field input:focus {
  border-color: var(--grey-400, #9d9d9d);
}

.form-field input[readonly] {
  background: var(--grey-50, #f7f7f7);
  color: var(--grey-600, #575757);
}

.form-field.invalid input {
  border-color: var(--primary-500, #e42444);
}

.field-error {
  color: var(--primary-500, #e42444);
  font-size: 11px;
}

.submit-error {
  display: block;
}

.card-picker {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.picker-trigger {
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid var(--grey-200, #e6e6e6);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
}

.card-picker.open .picker-trigger {
  border-color: var(--grey-400, #9d9d9d);
}

.picker-value {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.picker-pan {
  font-size: 14px;
  color: var(--base-black, #101010);
}

.picker-tag,
.option-tag {
  font-size: 11px;
  color: var(--grey-500, #757575);
}

.picker-chevron {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.card-picker.open .picker-chevron {
  transform: rotate(180deg);
}

.picker-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--grey-200, #e6e6e6);
  border-radius: 8px;
  overflow: hidden;
}

.picker-option {
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  background: white;
  border: none;
  border-bottom: 1px solid var(--grey-100, #f0f0f0);
  cursor: pointer;
  text-align: left;
}

.picker-option:last-child {
  border-bottom: none;
}

.picker-option:hover,
.picker-option.selected {
  background: var(--grey-50, #f7f7f7);
}

.option-pan {
  font-size: 13px;
  color: var(--base-black, #101010);
}

.option-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-mark {
  height: 16px;
  width: auto;
  object-fit: contain;
}

.summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--grey-100, #f0f0f0);
}

.summary-title {
  color: var(--grey-600, #575757);
  font-size: 12px;
  font-weight: 500;
  margin: 0;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: var(--base-black, #101010);
}

.summary-total {
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 12px;
}

.actions.stacked {
  flex-direction: column;
}

.primary-button,
.secondary-button {
  font-family: inherit;
  height: 44px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
}

.primary-button {
  background: var(--primary-500, #e42444);
  color: white;
  border: none;
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secondary-button {
  background: white;
  color: var(--grey-600, #575757);
  border: 1px solid var(--grey-200, #e6e6e6);
}

/* Narrow dialog (mobile, or a desktop window small enough that the panes stack): the card takes
   the full width, and MM/YY + CVV stop competing for a half each. */
@media only screen and (max-width: 520px) {
  .mock-card-simulator {
    max-width: none;
    margin: 12px 0 20px;
  }

  .simulator-body {
    padding: 14px;
    gap: 14px;
  }

  .form-row {
    flex-direction: column;
    gap: 14px;
  }

  .picker-option {
    gap: 8px;
  }

  .option-pan,
  .picker-pan {
    font-size: 12px;
  }
}
</style>
