import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

if (!apiKey) {
  console.error("❌ Missing API key — make sure it's set in .env.local");
} else {
  const ai = new GoogleGenerativeAI(apiKey);

  // We'll try a lightweight call that lists and tests models
  async function checkModels() {
    try {
      console.log("🔍 Checking which Gemini models are available...");

      // Attempt to use 1.5-flash (always available)
      const flash = ai.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      await flash.generateContent({ contents: [{ role: "user", parts: [{ text: "test" }] }] });
      console.log("✅ gemini-1.5-flash works");

      // Attempt to use 2.5-flash (experimental, may fail)
      const exp = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
      await exp.generateContent({ contents: [{ role: "user", parts: [{ text: "test" }] }] });
      console.log("✅ gemini-2.5-flash works");
    } catch (err) {
      console.error("⚠️ Some models failed:", err);
    }
  }

  checkModels();
}
