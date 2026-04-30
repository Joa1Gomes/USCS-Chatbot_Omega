const fs = require("fs");
const path = require("path");

test("Arquivo gerencia_senha.html existe", () => {
  const caminho = path.join(__dirname, "../../public/html/gerencia_senha.html");
  const existe = fs.existsSync(caminho);

  expect(existe).toBe(true);
});