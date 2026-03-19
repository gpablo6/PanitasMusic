import { RootApiException } from "@rootsdk/server-bot";

export function handleError(error: unknown, context: string): void {
  if (error instanceof RootApiException) {
    console.error(`[${context}] RootApiException:`, error.errorCode);
  } else if (error instanceof Error) {
    console.error(`[${context}] Error:`, error.message);
  } else {
    console.error(`[${context}] Unknown error:`, error);
  }
}
