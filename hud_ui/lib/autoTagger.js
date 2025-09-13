const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function autoTagger(title, content) {
  
    const prompt = `
      Generate 3-5 short, relevant tags for this Hacker News story.
      Title: "${title}"
      Content (first 100 chars): "${content || ""}"
      Return only a comma-separated list of tags.
    `;

    try {
      const result = await model.generateContent(prompt);
      const raw = result.response.text();

      return raw
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);
    } catch (err) {
      console.error("AutoTagger error:", err.message);

      // fallback tags if Gemini fails
      return ["untagged", "error"];
    }
  
}
