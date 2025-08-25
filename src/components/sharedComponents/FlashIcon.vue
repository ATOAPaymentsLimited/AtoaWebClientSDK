<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 12 12"
    fill="none"
    :class="classes"
    :style="[styles, { display: 'block' }]"
    :width="width"
    :height="height"
  >
    <path
      d="M3.3751 11C3.3126 11 3.25141 10.9844 3.19411 10.9531C3.04568 10.8711 2.97016 10.6992 3.01182 10.5339L3.89463 7H2.6251C2.50792 7 2.39724 6.94531 2.32562 6.85026C2.25531 6.75651 2.23187 6.63542 2.26443 6.52214L3.76443 1.27214C3.81 1.11068 3.95713 1 4.1251 1H7.6251C7.7462 1 7.85948 1.05859 7.92979 1.15625C8.0001 1.25391 8.01964 1.37891 7.98057 1.49349L7.14594 4H9.3751C9.52484 4 9.66156 4.08984 9.72016 4.22786C9.77875 4.36589 9.7501 4.52604 9.64594 4.63411L3.64594 10.8841C3.57302 10.9596 3.47406 11 3.3751 11Z"
      :fill="color"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  name: "FlashIcon",
});

const props = defineProps({
  color: {
    type: String,
    default: "#2B53B6",
  },
  height: {
    type: [Number, String],
    default: null,
  },
  width: {
    type: [Number, String],
    default: null,
  },
  className: {
    type: String,
    default: "",
  },
});

const classes = computed(() => props.className || "");

const styles = computed(() => {
  const stylesObj: Record<string, string> = {};

  if (props.height) {
    stylesObj.height =
      typeof props.height === "number" ? `${props.height}px` : props.height;
  }

  if (props.width) {
    stylesObj.width =
      typeof props.width === "number" ? `${props.width}px` : props.width;
  }

  return stylesObj;
});
</script>
