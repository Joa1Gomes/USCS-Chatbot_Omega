 document.addEventListener('DOMContentLoaded', carregarUsuarios);

 async function carregarUsuarios(){
   try {
     const response = await fetch ('http://localhost:3000/gerenciamento');
     const usuarios = await response.json();

     const idHtml = document.getElementById('tabelaUsuarios');
     idHtml.innerHTML = '';

     usuarios.forEach(usuario =>
       {
         const linha = document.createElement('tr');
         linha.innerHTML = `
         <td>${usuario.ID_USUARIO}</td>  
         <td>${usuario.NOME_USUARIO}</td>
         <td>${usuario.EMAIL_USUARIO}</td>
         <td>${usuario.PERMISSAO}</td>
         <td>
           <button class="btn btn-editar btn-sm" 
             data-bs-toggle="modal" 
             data-bs-target="#modalPermissao"
             onclick="reservarId(${usuario.ID_USUARIO})">
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

 function reservarId(idUsuario) {
   document.getElementById('modalPermissao').dataset.userId = idUsuario;
 }

 document.getElementById('formPermissao').addEventListener('submit', async (e) => {e.preventDefault();
  
  const userId = document.getElementById('modalPermissao').dataset.userId;
  const botaoClicado = e.submitter;

  if (botaoClicado.id === 'atualizarPermissao'){
    try {
      const novaPermissao = document.getElementById('selectPermissao').value.toUpperCase();
      const response = await fetch(`http://localhost:3000/gerenciamento/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify({ novaPermissao })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar permissão');
      }
      
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      alert('Falha ao atualizar permissão do usuário');    
    }
  }else if (botaoClicado.id === 'deletarUsuario') {
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
 
