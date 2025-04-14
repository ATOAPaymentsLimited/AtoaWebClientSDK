<template>
  <div class="bank-tabs">
    <button v-for="tab in tabs" :key="tab.id" class="tab-button" :class="{ active: modelValue === tab.id }"
      @click="$emit('update:modelValue', tab.id)">
      {{ tab.label }}
    </button>
    <div class="tab-indicator" :style="{ transform: `translateX(${modelValue === 'personal' ? '0' : '100%'})` }"></div>
  </div>
</template>

<script setup lang="ts">
const tabs = [
  { id: 'personal' as const, label: 'Personal Banks' },
  { id: 'business' as const, label: 'Business Banks' }
] as const;

defineProps<{
  modelValue: 'personal' | 'business'
}>();

defineEmits<{
  (e: 'update:modelValue', value: 'personal' | 'business'): void
}>();
</script>

<style scoped>
.bank-tabs {
  position: relative;
  display: flex;
  background: var(--grey-50);
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 12px;
}

.tab-button {
  flex: 1;
  padding: 8px 16px;
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--grey-600);
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
  font-family: inherit;
}

.tab-button.active {
  color: var(--base-black);
  font-weight: 700;
}

.tab-indicator {
  position: absolute;
  left: 4px;
  top: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: white;
  border-radius: 10px;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>