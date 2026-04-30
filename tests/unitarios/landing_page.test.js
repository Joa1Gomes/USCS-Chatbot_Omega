const fs = require("fs");
const path = require("path");

test("Arquivo landing_page.html existe", () => {
  const caminho = path.join(__dirname, "../../public/html/landing_page.html");
  const existe = fs.existsSync(caminho);

  expect(existe).toBe(true);
});