export interface Media {
  type: string;
  source: string;
}

export default interface BankData {
  id: string;
  name: string;
  fullName: string;
  media: Media[];
  features: string[];
  enabled: boolean;
  orderBy: number;
  popularBank: boolean;
  transactionAmountLimit: number;
  bankType: string;
  businessBank: boolean;
  bankCode?: string;
}

export function getBankLogo(bank: BankData): string {
  const logoMedia = bank.media?.find((m: Media) => m.type === "logo");
  return logoMedia ? logoMedia.source : "";
}
