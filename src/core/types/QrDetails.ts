export default interface QrDetails {
  id: string;
  nickName: string;
  referenceId?: string;
  integrationId?: string;
  integrationDetails?: {
    [key: string]: string;
  };
}
