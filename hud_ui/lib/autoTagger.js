import Groq from "groq-sdk";

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq(process.env.GROQ_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


export async function autoTagger(title, content) {
  
    const prompt = `
      Generate 3-5 short, relevant tags for this Hacker News story.
      Title: "${title}"
      Content (first 100 chars): "${content || ""}"
      Return only a comma-separated list of tags.
    `;

    try {
      console.log("I am using Gemini");
      const result = await model.generateContent(prompt);
      const raw = result.response.text();

      return raw
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);
    } catch(err) {
      console.error("AutoTagger (Gemini) error:", err.message);
      try {
        console.log("I am using Groq");
        const chatCompletion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        });
    
        const raw = chatCompletion.choices[0]?.message?.content || "";
    
        return raw
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean);
      } catch (err) {
        console.error("AutoTagger (Groq) error:", err.message);
        return ["untagged", "error"];
      }
    
    }
  
}
