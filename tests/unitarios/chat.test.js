const fs = require("fs");
const path = require("path");

test("Arquivo chat.html existe", () => {
  const caminho = path.join(__dirname, "../../public/html/chat.html");
  const existe = fs.existsSync(caminho);

  expect(existe).toBe(true);
});