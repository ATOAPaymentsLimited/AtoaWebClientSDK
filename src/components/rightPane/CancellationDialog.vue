<template>
  <Transition name="fade">
    <div v-if="show" :class="['cancellation-overlay', { mobile: isMobileWidth }]">
      <div class="cancellation-dialog">
        <h2 class="dialog-title">{{isPending ? "Are you sure you want to leave?" : "Cancel the payment?"}}</h2>
        <p class="dialog-warning">{{isPending ? 'Clicking continue will close this and take you back.' : 'Are you sure you want to cancel this payment?'}}<template v-if="!isPending"><br />This action cannot be undone.</template></p>
        <div class="dialog-actions">
          <button class="dialog-button dismiss" @click="$emit('dismiss')">
            {{isPending ? "Dismiss" : "No, dismiss" }}
          </button>
          <button class="dialog-button confirm" @click="$emit('confirm')">
            {{ isPending ?  "Continue" : "Yes, cancel payment" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { inject, type ComputedRef } from 'vue';

defineProps<{
  show: boolean,
  isPending: boolean,
}>();

defineEmits<{
  dismiss: [],
  confirm: []
}>();

const isMobileWidth = inject<ComputedRef<boolean>>('isMobileWidth');

</script>

<style scoped>
.cancellation-overlay {
  border-top-right-radius: 16px;
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.cancellation-overlay.mobile {
  position: fixed;
}

.cancellation-dialog {
  background-color: var(--base-white);
  border-radius: 16px 16px 0 0;
  padding: 24px;
  width: 100%;
  pointer-events: auto;
}

.dialog-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: var(--base-black);
}

.dialog-warning {
  font-size: 14px;
  color: var(--grey-500);
}

.dialog-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.dialog-button {
  flex: 1;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dialog-button.dismiss {
  background-color: var(--grey-50);
  border: none;
  color: var(--base-black);
}

.dialog-button.dismiss:hover {
  background-color: var(--grey-100);
}

.dialog-button.confirm {
  background-color: var(--base-black);
  border: none;
  color: white;
}

.dialog-button.confirm:hover {
  background-color: var(--grey-900);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>