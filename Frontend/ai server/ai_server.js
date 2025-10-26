import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const token = "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";

const client = ModelClient(
  "https://models.github.ai/inference",
  new AzureKeyCredential(token)
);

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

    const languageMap = [
      { regex: /(const|let|var|function|class|import|console\.log)/, label: "javascript" },
      { regex: /(<\!DOCTYPE html|<html|<head|<body)/, label: "html" },
      { regex: /(def |print\(|import |class )/, label: "python" },
      { regex: /(public|static|void|System\.out|class|package)/, label: "java" },
      { regex: /(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)/i, label: "sql" },
      { regex: /(#[^\n]*|puts |def )/, label: "ruby" },
      { regex: /(func |package |import )/, label: "go" },
      { regex: /(<?php|echo |function )/, label: "php" },
      { regex: /(using |namespace |class |static )/, label: "csharp" },
      { regex: /(int |float |double |printf|scanf)/, label: "c" },
      { regex: /(console\.write|System\.Console|using )/, label: "fsharp" },
      { regex: /(package |import |func )/, label: "kotlin" },
    ];

    if (!/```[\s\S]*?```/.test(aiReply)) {
      let detected = false;
      for (let lang of languageMap) {
        if (lang.regex.test(aiReply)) {
          aiReply = lang.label + "\n" + aiReply + "\n";
          detected = true;
          break;
        }
      }
      if (!detected) {
        aiReply = "\n" + aiReply + "\n";
      }
    }


    aiReply = aiReply
      .split("\n")
      .map((line) =>
        line.length > 80 ? line.match(/.{1,80}(?:\s|$)/g).join("\n") : line
      )
      .join("\n");
    console.log('AI:', aiReply);
    console.log('===================\n');

    res.json({ reply: aiReply });
  } catch (err) {
    console.error('\nError:', err);
    res.status(500).json({ error: "AI request failed" });
  }
});

const PORT = 4200;
app.listen(PORT, () => console.log(`AI server running on port ${PORT}`));

