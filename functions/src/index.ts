import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

admin.initializeApp();

// v1 way of getting secrets. This works on the free plan.
const genAI = new GoogleGenerativeAI(functions.config().gemini.key);

export const processAiQuery = functions.https.onCall(async (data, context) => {
  // Check for authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  // Get the query from the data object
  const userQuery = data.query;
  if (typeof userQuery !== "string" || !userQuery) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a non-empty 'query' string."
    );
  }

  functions.logger.info(`Processing query for UID: ${context.auth.uid}`, { query: userQuery });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(userQuery);
    const response = await result.response;
    const aiText = response.text();

    // Return the response
    return { response: aiText };

  } catch (error) {
    functions.logger.error("Error calling Gemini API:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while processing your request."
    );
  }
});