const fs = require("fs");
const path = require("path");

test("Arquivo home_page.html existe", () => {
  const caminho = path.join(__dirname, "../../public/html/home_page.html");
  const existe = fs.existsSync(caminho);

  expect(existe).toBe(true);
});