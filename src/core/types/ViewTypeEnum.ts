export enum ViewType {
  ExplainerView = "ExplainerView",
  SelectBankView = "SelectBankView",
  CardCheckoutView = "CardCheckoutView",
  PaymentOptionsView = "PaymentOptionsView",
  PaymentInProgressView = "PaymentInProgressView",
  PaymentStatusView = "PaymentStatusView",
}

export namespace ViewType {
  export const values = (): ViewType[] => {
    return Object.values(ViewType).filter(
      (value) => typeof value === "string"
    ) as ViewType[];
  };
}
