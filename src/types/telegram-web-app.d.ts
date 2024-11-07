// src/types/telegram-web-app.d.ts

declare global {
  interface Window {
    Telegram?: Telegram;
  }
}

interface Telegram {
  WebApp: {
    initData: string;
    initDataUnsafe: {
      user?: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code?: string;
      };
      query_id?: string;
      auth_date?: number;
      hash?: string;
      [key: string]: unknown;
    };
    MainButton: {
      setText: (text: string) => void;
      show: () => void;
      hide: () => void;
      onClick: (callback: () => void) => void;
    };
    themeParams: {
      bg_color?: string;
      text_color?: string;
      hint_color?: string;
      link_color?: string;
      button_color?: string;
      button_text_color?: string;
    };
    onEvent: (eventType: string, callback: () => void) => void;
    offEvent: (eventType: string, callback: () => void) => void;
    ready: () => void;
    close: () => void;
    version: string;
    showAlert: (message: string) => void;
  };
}

export {};
