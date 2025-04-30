<template>
  <span class="animated-bank-type">
    <transition name="fade-slide">
      <span :key="currentType" class="type-text">{{ currentType }}</span>
    </transition>
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const currentType = ref<'personal bank' | 'business bank'>('personal bank');
const animationInterval = ref<number | null>(null);

const startAnimation = () => {
  if (animationInterval.value === null) {
    animationInterval.value = window.setInterval(() => {
      currentType.value = currentType.value === 'personal bank' ? 'business bank' : 'personal bank';
    }, 2000);
  }
};

onMounted(() => {
  startAnimation();
});

onBeforeUnmount(() => {
  if (animationInterval.value !== null) {
    clearInterval(animationInterval.value);
    animationInterval.value = null;
  }
});
</script>

<style scoped>
.animated-bank-type {
  display: inline-block;
  position: relative;
  text-align: left;
  color: var(--grey-400);
  font-size: 13px;
  font-family: inherit;
  pointer-events: none;
  white-space: nowrap;
  height: 14px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), 
              transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: absolute;
  left: 0;
  will-change: transform, opacity;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
</style> 