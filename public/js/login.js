document.getElementById('formLogin').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const mensagemErro = document.getElementById('mensagemErro');

    if (email === '' || senha === '') {
        mensagemErro.textContent = 'Por favor, preencha todos os campos.';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const resultado = await response.json();

        if (response.ok){
            window.location.href = '../html/home_page.html';
        } else {
            mensagemErro.textContent = resultado.mensagem || 'Email ou senha inválidos.';
        }

    } catch (erro) {
        console.error('Erro ao tentar logar:', erro);
        mensagemErro.textContent = 'Erro ao conectar com o servidor.';
    }
});