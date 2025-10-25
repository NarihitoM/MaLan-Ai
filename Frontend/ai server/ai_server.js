// ai_server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ⚠️ Never hardcode tokens in production
const token = "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";

// Create model client
const client = ModelClient(
  "https://models.github.ai/inference",
  new AzureKeyCredential(token)
);

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message || "";
  const timestamp = new Date().toISOString();

  console.log('\n=== Chat Request ===');
  console.log(`Time: ${timestamp}`);
  console.log('User:', userMessage);

  try {
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [{ role: "user", content: userMessage }],
        model: "mistral-ai/mistral-small-2503",
        max_tokens: 512,
      },
    });

    if (isUnexpected(response)) throw response.body.error;

    let aiReply = response.body.choices[0].message.content || "";
    aiReply = aiReply.replace(/<\/?think>/g, "").trim();

    console.log('AI:', aiReply);
    console.log('===================\n');
    
    res.json({ reply: aiReply });
  } catch (err) {
    console.error('\nError:', err);
    res.status(500).json({ error: "AI request failed" });
  }
});

// Start server
const PORT = 4200;
app.listen(PORT, () => console.log(`AI server running on port ${PORT}`));

