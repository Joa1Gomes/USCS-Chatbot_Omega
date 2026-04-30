const fs = require("fs");
const path = require("path");

test("Arquivo gerenciamento_adm.html existe", () => {
  const caminho = path.join(__dirname, "../../public/html/gerenciamento_adm.html");
  const existe = fs.existsSync(caminho);

  expect(existe).toBe(true);
});