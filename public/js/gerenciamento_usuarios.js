document.addEventListener('DOMContentLoaded', carregarUsuarios);


document.addEventListener('DOMContentLoaded', function () {

  const isAdmin = sessionStorage.getItem('is_admin');

  if (isAdmin === 'true') {
    document.getElementById('menuLista').insertAdjacentHTML('afterbegin', `
            <li><a href="gerenciamento_adm.html">🧑‍💼 Gerenciamento de Usuários</a></li>
            <li><a href="gerenciamento_loja.html">🏬 Gerenciamento de Lojas</a></li>
        `);
  }

});



async function carregarUsuarios() {
  try {
    const idEmpresa = sessionStorage.getItem('id_empresa');
    const response = await fetch(`http://localhost:3000/gerenciamento?id_empresa=${idEmpresa}`);
    const usuarios = await response.json();

    console.log(usuarios);

    const idHtml = document.getElementById('tabelaUsuarios');
    idHtml.innerHTML = '';

    usuarios.forEach(usuario => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
         <td>${usuario.id_usuario}</td>  
         <td>${usuario.nome_completo}</td>
         <td>${usuario.email_usuario}</td>
         <td>${usuario.permissao}</td>
         <td>
           <button class="btn btn-editar btn-sm" 
             data-bs-toggle="modal" 
             data-bs-target="#modalPermissao"
             onclick="reservarId(${usuario.id_usuario})">
             Editar
           </button>
         </td>
         `;
      idHtml.appendChild(linha);
    });
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
  }
}

// Variável global para guardar o id em edição
let usuarioEmEdicao = null;

async function reservarId(idUsuario) {
  usuarioEmEdicao = idUsuario;
  document.getElementById('modalPermissao').dataset.userId = idUsuario;

  // Busca a empresa do admin logado
  const idEmpresa = sessionStorage.getItem('id_empresa');

  // Busca todas as lojas da empresa
  const [resLojasDaEmpresa, resLojasDoUsuario] = await Promise.all([
    fetch(`http://localhost:3000/gerenciamento/lojas-empresa?id_empresa=${idEmpresa}`),
    fetch(`http://localhost:3000/gerenciamento/${idUsuario}/lojas`)
  ]);

  const todasLojas = await resLojasDaEmpresa.json();
  const lojasDoUsuario = new Set(await resLojasDoUsuario.json());

  // Renderiza os checkboxes
  const container = document.getElementById('listaLojasModal');
  if (!todasLojas.length) {
    container.innerHTML = '<span class="text-muted">Nenhuma loja encontrada.</span>';
    return;
  }

  container.innerHTML = todasLojas.map(loja => `
    <div class="form-check">
      <input class="form-check-input loja-check" type="checkbox"
             id="loja_${loja.id_loja}" value="${loja.id_loja}"
             ${lojasDoUsuario.has(loja.id_loja) ? 'checked' : ''}>
      <label class="form-check-label" for="loja_${loja.id_loja}">
        ${loja.nome_loja}
      </label>
    </div>
  `).join('');
}


document.getElementById('formPermissao').addEventListener('submit', async (e) => {
  e.preventDefault();

  const userId = document.getElementById('modalPermissao').dataset.userId;
  const botaoClicado = e.submitter;

  if (botaoClicado.id === 'atualizarPermissao') {
    try {
      const novaPermissao = document.getElementById('selectPermissao').value.toUpperCase();

      const idsLojasSelecionadas = [...document.querySelectorAll('.loja-check:checked')]
        .map(cb => parseInt(cb.value));

      const response = await fetch(`http://localhost:3000/gerenciamento/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify({ novaPermissao })
      });

      await fetch(`http://localhost:3000/gerenciamento/${userId}/lojas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idsLojas: idsLojasSelecionadas })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar permissão');
      }

    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      alert('Falha ao atualizar permissão do usuário');
    }
  } else if (botaoClicado.id === 'deletarUsuario') {
    try {
      const response = await fetch(`http://localhost:3000/gerenciamento/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type':
            'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar usuario');
      }

    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      alert('Falha ao atualizar permissão do usuário');
    }
  }

  await carregarUsuarios();

  const modal = bootstrap.Modal.getInstance(document.getElementById('modalPermissao'));
  modal.hide();
})

