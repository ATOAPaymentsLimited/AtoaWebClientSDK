// Vite environment variables shim
interface ImportMeta {
  readonly env: {
    [key: string]: string | boolean | undefined;
    readonly VITE_BASE_URL: string;
    readonly MODE: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
  };
} 