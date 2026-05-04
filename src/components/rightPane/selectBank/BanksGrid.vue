<template>
  <div class="banks-grid">
    <BankGridItem
      v-for="bank in banksToDisplay"
      :key="bank.id"
      :bank="bank"
      :is-selected="selectedBank?.id === bank.id"
      @select="$emit('select', $event)"
      @show-overlay="$emit('showOverlay', $event)"
    />
    <ViewAllButton
      v-if="showViewAllButton"
      :preview-banks="nextFourBanks"
      @click="showAllBanks = true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from "vue";
import type BankData from "@/core/types/BankData";
import type PaymentDetails from "@/core/types/PaymentDetails";
import BankGridItem from "@/components/rightPane/selectBank/BankGridItem.vue";
import ViewAllButton from "@/components/rightPane/selectBank/ViewAllButton.vue";

const props = withDefaults(
  defineProps<{
    banks: BankData[];
    selectedType: "personal" | "business";
    selectedBank?: BankData;
    maxRows?: number;
  }>(),
  {
    maxRows: 3,
  },
);

const totalSlots = computed(() => props.maxRows * 4);

defineEmits<{
  (e: "select", bank: BankData): void;
  (e: "showOverlay", bank: BankData): void;
}>();

const paymentDetails = inject<Ref<PaymentDetails>>("paymentRequestDetails");
const cardPaymentEnabled = computed(
  () => !!paymentDetails?.value?.options?.cardPaymentEnabled,
);

const showAllBanks = ref(false);

const banksByType = computed(() =>
  props.banks
    .filter((bank) =>
      props.selectedType === "business" ? bank.businessBank : !bank.businessBank,
    )
    .sort((a, b) => a.fullName.localeCompare(b.fullName)),
);

const popularBanksByType = computed(() =>
  banksByType.value
    .filter((bank) => bank.popularBank)
    .sort((a, b) => a.orderBy - b.orderBy),
);

// Popular banks first, then the rest of the banks in the selected type.
const sortedBanksByType = computed(() => {
  const popular = popularBanksByType.value;
  const popularIds = new Set(popular.map((bank) => bank.id));
  return [
    ...popular,
    ...banksByType.value.filter((bank) => !popularIds.has(bank.id)),
  ];
});

// When card payments are enabled and we have more banks than fit the grid,
// reserve the last slot for the "View all" tile and show banks up to that slot.
const banksToDisplay = computed(() => {
  if (
    !showAllBanks.value &&
    cardPaymentEnabled.value &&
    sortedBanksByType.value.length > totalSlots.value
  ) {
    return sortedBanksByType.value.slice(0, totalSlots.value - 1);
  }
  return sortedBanksByType.value;
});

const nextFourBanks = computed(() =>
  sortedBanksByType.value.slice(totalSlots.value - 1, totalSlots.value + 3),
);

const showViewAllButton = computed(() => {
  if (showAllBanks.value || !cardPaymentEnabled.value) return false;
  return (
    sortedBanksByType.value.length > totalSlots.value &&
    nextFourBanks.value.length > 0
  );
});
</script>

<style scoped>
.banks-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 16px;
  row-gap: 20px;
}
</style>
