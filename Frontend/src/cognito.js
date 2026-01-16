import { Amplify } from "aws-amplify";

export function configureCognito() {
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

  if (!userPoolId || !userPoolClientId) {
    console.warn("[PutraServe] Cognito env vars missing");
    return;
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
      },
    },
  });

  console.log("[PutraServe] Cognito configured:", { userPoolId });
}
