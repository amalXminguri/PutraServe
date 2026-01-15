import { Amplify } from "aws-amplify";

export function configureCognito() {
  const region = import.meta.env.VITE_COGNITO_REGION;
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

  if (!region || !userPoolId || !userPoolClientId) {
    console.warn("[PutraServe] Cognito env vars missing");
    return;
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: { email: true },
      },
    },
  });

  console.log("[PutraServe] Cognito configured:", { region, userPoolId });
}
