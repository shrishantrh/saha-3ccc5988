
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      auth2: {
        init: (params: { client_id: string }) => void;
        getAuthInstance: () => {
          signIn: (params: { scope: string }) => Promise<{
            getAuthResponse: () => { access_token: string };
          }>;
          signOut: () => Promise<void>;
        };
      };
    };
  }

  const gapi: Window['gapi'];
}

export {};
