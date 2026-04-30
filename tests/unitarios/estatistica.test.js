const fs = require("fs");
const path = require("path");

test("Arquivo estatisticas.html existe", () => {
  const caminho = path.join(__dirname, "../../public/html/estatisticas.html");
  const existe = fs.existsSync(caminho);

  expect(existe).toBe(true);
});