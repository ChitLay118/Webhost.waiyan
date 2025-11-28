const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let body = "";

  req.on("data", chunk => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const data = JSON.parse(body);

      const sitename = data.sitename;
      const files = data.files;

      if (!sitename || !files) {
        return res.status(400).json({ error: "Missing sitename or files" });
      }

      const folder = path.join(process.cwd(), "sites", sitename);

      // Folder မရှိရင် create
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }

      // Filesတွေ loop ရေးပြီး write
      files.forEach(file => {
        const filePath = path.join(folder, file.name);
        fs.writeFileSync(filePath, Buffer.from(file.content, "base64"));
      });

      return res.status(200).json({
        message: "Hosted Successfully!",
        url: `/sites/${sitename}/`
      });

    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      return res.status(500).json({ error: "Server Error" });
    }
  });
};
