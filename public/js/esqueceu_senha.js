document.getElementById('formRecuperacao').addEventListener('submit', async function (e) {
    e.preventDefault();


    const email = document.getElementById('emailRecuperacao').value;

    try {
        const resposta = await fetch('/senha/esqueceu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const dados = await resposta.json()

        if (resposta.ok) {
            document.getElementById('formView').style.display = 'none';
            document.getElementById('successView').style.display = 'block';
        } else {
            alert(dados.mensagem || 'Erro ao solicitar recuperação');
        }

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor');
    }


});