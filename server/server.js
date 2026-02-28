import fs from "fs";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
console.log("KEY:", process.env.GEMINI_API_KEY);
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// 🔑 Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

// Root route
app.get("/", (req, res) => {
  res.send("✅ Gemini RAG Backend is running");
});

// Load knowledge data
const knowledgeData = JSON.parse(
  fs.readFileSync("./server/data/Knowledge.json", "utf-8")
);

const knowledge = knowledgeData.collegeKnowledge
  .map(item => item.answer)
  .join("\n\n");

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const question = req.body.question;

    if (!question) {
      return res.status(400).json({
        answer: "Question is required"
      });
    }

    // prompt with your data
    const prompt = `
You are a helpful college assistant chatbot.

Use ONLY the knowledge below to answer.

Knowledge:
${knowledge}

Question:
${question}

Answer clearly:
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({
      answer: reply
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      answer: "Server error"
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Gemini server running on port ${PORT}`);
  console.log(`Open: http://localhost:${PORT}`);
});