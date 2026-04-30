const fs = require("fs");
const path = require("path");

test("Arquivo cadastro.html existe", () => {
  const caminho = path.join(__dirname, "../../public/html/cadastro.html");
  const existe = fs.existsSync(caminho);

  expect(existe).toBe(true);
});