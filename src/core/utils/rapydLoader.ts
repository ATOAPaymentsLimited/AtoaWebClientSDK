declare global {
  interface Window {
    RapydCheckoutToolkit: any;
  }
}

const RAPYD_TOOLKIT_URL: string =
  (import.meta.env.VITE_RAPYD_TOOLKIT_URL as string | undefined) ??
  "https://checkouttoolkit.rapyd.net";

let loadPromise: Promise<void> | null = null;

export function loadRapydCheckoutToolkit(): Promise<void> {
  if (window.RapydCheckoutToolkit) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAPYD_TOOLKIT_URL;
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(
        new Error(
          "Failed to load Rapyd Checkout Toolkit. This may be blocked by Content Security Policy.",
        ),
      );
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
