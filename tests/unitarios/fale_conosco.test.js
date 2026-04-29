const fs = require("fs");
const path = require("path");

test("Arquivo fale_conosco.html existe", () => {
  const caminho = path.join(__dirname, "../../public/html/fale_conosco.html");
  const existe = fs.existsSync(caminho);

  expect(existe).toBe(true);
});