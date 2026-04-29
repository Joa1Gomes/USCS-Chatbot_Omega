const fs = require("fs");
const path = require("path");

test("Arquivo login.html existe", () => {
  const caminho = path.join(__dirname, "../../public/html/login.html");
  const existe = fs.existsSync(caminho);

  expect(existe).toBe(true);
});