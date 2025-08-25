export enum ViewType {
  ExplainerView = "ExplainerView",
  ChoosePaymentMethodView = "ChoosePaymentMethodView",
  SelectBankView = "SelectBankView",
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
