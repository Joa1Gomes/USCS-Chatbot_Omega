async function enviarMensagem() {
    const mensagem = document.getElementById("mensagem").value;
    const respostaDiv = document.getElementById("resposta");
  
    const resposta = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mensagem })
    });
  
    const dados = await resposta.json();
    respostaDiv.textContent = dados.resposta;
  }