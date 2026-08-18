<template>
  <div class="mock-card-3ds">
    <p class="step-title">3DS challenge</p>

    <div class="hint-panel">
      <img src="@/assets/images/icon_info.svg" alt="" class="hint-icon" />
      <p>
        Enter <strong>{{ expectedCode }}</strong> to authenticate. Any other
        code declines this payment.
      </p>
    </div>

    <div class="code-field">
      <label for="mock-card-3ds-code">Code</label>
      <input
        id="mock-card-3ds-code"
        ref="codeInput"
        v-model="code"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        placeholder="Code"
        maxlength="6"
        @input="onCodeInput"
        @keyup.enter="submit"
      />
    </div>

    <div class="actions">
      <button type="button" class="secondary-button" @click="emit('cancel')">
        Cancel
      </button>
      <button
        type="button"
        class="primary-button"
        :disabled="code.length === 0"
        @click="submit"
      >
        Continue
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref } from "vue";
import { MOCK_CARD_3DS_CODE } from "@/core/utils/constants";

/**
 * The 3DS step of the Atoa Mock Card simulator.
 *
 * A 3DS test card stands for two outcomes: the correct code authenticates, anything else declines.
 * This screen does not decide which — it collects what the tester typed and hands it up, and the
 * backend compares it. `expectedCode` is shown as a hint only.
 */
withDefaults(
  defineProps<{
    /** The code that authenticates, shown to the tester as a hint. */
    expectedCode?: string;
  }>(),
  {
    expectedCode: MOCK_CARD_3DS_CODE,
  },
);

const emit = defineEmits<{
  /** The code the tester entered. The backend decides whether it authenticates. */
  resolve: [code: string];
  cancel: [];
}>();

const code = ref("");
const codeInput = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  await nextTick();
  codeInput.value?.focus();
});

const onCodeInput = () => {
  code.value = code.value.replace(/\D/g, "").slice(0, 6);
};

const submit = () => {
  if (code.value.length === 0) return;
  emit("resolve", code.value);
};
</script>

<style scoped>

.mock-card-3ds,
.mock-card-3ds * {
  box-sizing: border-box;
}

.mock-card-3ds {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-title {
  color: var(--base-black, #101010);
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

/* A neutral note, not a warning: nothing has gone wrong here, these are instructions. */
.hint-panel {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background-color: var(--grey-50, #f7f7f7);
  border-radius: 8px;
  padding: 12px 14px;
  color: var(--grey-600, #575757);
  font-size: 12px;
  line-height: 1.5;
}

.hint-panel p {
  margin: 0;
}

.hint-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}

.code-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.code-field label {
  color: var(--grey-600, #575757);
  font-size: 12px;
  font-weight: 500;
}

.code-field input {
  font-family: inherit;
  font-size: 14px;
  color: var(--base-black, #101010);
  padding: 12px;
  border: 1px solid var(--grey-200, #e6e6e6);
  border-radius: 8px;
  outline: none;
  background: white;
}

.code-field input:focus {
  border-color: var(--grey-400, #9d9d9d);
}

.actions {
  display: flex;
  gap: 12px;
}

.primary-button,
.secondary-button {
  font-family: inherit;
  flex: 1;
  height: 44px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
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
</style>
