import { init } from "@instantdb/react";

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;

export const db = init({
  appId: APP_ID,
});

