document.getElementById('formRecuperacao').addEventListener('submit', function (e) {
    e.preventDefault();

    // Oculta o formulário e mostra a mensagem
    document.getElementById('formView').style.display = 'none';
    document.getElementById('successView').style.display = 'block';


});