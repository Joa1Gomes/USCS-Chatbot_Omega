const fs = require("fs");
const path = require("path");

test("Arquivo configuracao.html existe", () => {
  const caminho = path.join(__dirname, "../../public/html/configuracao.html");
  const existe = fs.existsSync(caminho);

  expect(existe).toBe(true);
});