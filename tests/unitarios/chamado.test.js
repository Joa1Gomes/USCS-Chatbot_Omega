const fs = require("fs");
const path = require("path");

test("Arquivo chamado.html existe", () => {
  const caminho = path.join(__dirname, "../../public/html/chamado.html");
  const existe = fs.existsSync(caminho);

  expect(existe).toBe(true);
});