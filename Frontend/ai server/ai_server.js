import express from "express";
import cors from "cors";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

const token = "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";

const client = ModelClient(
  "https://models.github.ai/inference",
  new AzureKeyCredential(token)
);

app.post("/api/chat", upload.array("file"), async (req, res) => {
  const userMessage = req.body?.message || "";
  const files = req.files;
  const timestamp = new Date().toISOString();

  console.log('\n=== Chat Request ===');
  console.log(`Time: ${timestamp}`);
  console.log('User:', userMessage);

  let aiPrompt = userMessage;

  const includeServerFile = req.body?.includeServerFile === 'true' || req.body?.includeServerFile === '1';
  if (includeServerFile) {
    try {
      const serverFileContent = fs.readFileSync(__filename, 'utf8');
      console.log(`Including server file: ${__filename}`);
      console.log('Server file content (first 200 chars):', serverFileContent.slice(0, 200));
      aiPrompt += `\n\n[Server file: ${__filename}]\n${serverFileContent}`;
    } catch (readErr) {
      console.error('Failed to read server file:', readErr);
    }
  }

  if (files && files.length > 0) {
    files.forEach(file => {
      console.log(`Received file: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);

      const fileContent = file.buffer.toString('utf8');
      console.log('File content (first 200 chars):', fileContent.slice(0, 200));

      aiPrompt += `\n\nFile uploaded: ${file.originalname} (type: ${file.mimetype})\nContent:\n${fileContent}`;
    });
  }
  try {
    const response = await client.path("/chat/completions").post({
      body: {
        messages: [{ role: "user", content: aiPrompt }],
        model: "mistral-ai/mistral-small-2503",
        max_tokens: 512,
        top_p: 0.1
      }
    });

    if (isUnexpected(response)) throw response.body.error;

    let aiReply = response.body.choices[0].message.content || "";

    // Optional: language detection
    const languageMap = [
      { regex: /(const|let|var|function|class|import|console\.log)/, label: "javascript" },
      { regex: /(<\!DOCTYPE html|<html|<head|<body)/, label: "html" },
      { regex: /(def |print\(|import |class )/, label: "python" },
      { regex: /(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)/i, label: "sql" },
    ];
    const isCodeLike = /[{}();=]|^\s{4,}/m.test(aiReply);
    if (!/```[\s\S]*?```/.test(aiReply) && isCodeLike) {
      let detected = false;
      for (let lang of languageMap) {
        if (lang.regex.test(aiReply)) {
          aiReply = lang.label + "\n" + aiReply + "\n";
          detected = true;
          break;
        }
      }
      if (!detected) aiReply = "\n" + aiReply + "\n";
    }

    aiReply = aiReply
      .split("\n")
      .map(line => line.length > 80 ? line.match(/.{1,80}(?:\s|$)/g).join("\n") : line)
      .join("\n");

    console.log('AI:', aiReply);
    res.json({ reply: aiReply });

  } catch (err) {
    console.error('\nError:', err);
    res.status(500).json({ error: "AI request failed" });
  }
});

const PORT = 4200;
app.listen(PORT, () => console.log(`AI server running on port ${PORT}`));
