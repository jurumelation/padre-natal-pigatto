import { db } from '../../firebase/firebase-config.js';
import {
  collection, doc, setDoc, getDoc, getDocs, deleteDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const form = document.querySelector('form');
const tituloInput = document.getElementById('titulo');
const descricaoInput = document.getElementById('descricao');
const tipoSelect = document.getElementById('tipoPostagem');
const botao = form.querySelector('button[type="submit"]');


let imagensEditando = []; // Lista temporária de imagens durante a edição




// ImgBB Key
const imgbbApiKey = '1c831eb1cc58b3068fbda9cea52ac2e2';
let idPostagemEditando = null;

// CRIAR NOVA POSTAGEM
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const titulo = tituloInput.value;
  const descricao = descricaoInput.value;
  const tipo = tipoSelect.value;



  const dataComunicadoInput = document.getElementById('dataComunicado');
  const dataComunicado = dataComunicadoInput?.value || '';
  const data_rabudo = new Date(dataComunicado);
  const data = !isNaN(data_rabudo) ? data_rabudo.toISOString().split('T')[0] : '';

  console.log("Data formatada:", data_rabudo);

  let imagens = [];
  if (tipo === 'unica') {
    imagens = document.getElementById('imagemUnica').files;
  } else if (tipo === 'carrossel') {
    imagens = document.getElementById('imagensCarrossel').files;
  } else if (tipo === 'album') {
    imagens = document.getElementById('imagensAlbum').files;
  }

  if (tipo === 'carrossel' && imagens.length > 3) {
    mostrarToast('Selecione no máximo 3 imagens.', false);
    return;
  }


  botao.disabled = true;
  botao.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enviando...';

  try {
    const urls = await uploadParaImgBB(imagens);
    const agora = new Date();
    const nomeDocumento = `comunicado-${agora.toLocaleDateString('pt-BR').replace(/\//g, '-')}-${agora.toLocaleTimeString('pt-BR').replace(/:/g, '-')}`;

  await setDoc(doc(db, 'comunicados', nomeDocumento), {
    titulo,
    descricao,
    tipo,
    imagens: urls,
    criadoEm: serverTimestamp(),
    data // aqui está a data em yyyy-mm-dd
  });

    mostrarToast('Comunicados criado com sucesso!');
    form.reset();
    carregarPostagens();
  } catch (error) {
    console.error('Erro ao criar comunicados:', error);
    mostrarToast('Erro ao criar comunicados.', false);
  } finally {
    botao.disabled = false;
    botao.innerHTML = 'Postar';
  }
});

// FAZ UPLOAD PARA IMGBB
async function uploadParaImgBB(files) {
  const urls = [];

  for (const file of files) {
    const base64 = await converterParaBase64(file);
    const formData = new FormData();
    formData.append('image', base64.split(',')[1]);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      urls.push(data.data.url);
    } else {
      console.warn('Falha no upload:', data);
    }
  }

  return urls;
}

function converterParaBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// MOSTRAR MENSAGEM TOAST
function mostrarToast(mensagem, sucesso = true) {
  const toastElement = document.getElementById('toastFeedback');
  const toastMensagem = document.getElementById('toastMensagem');
  toastMensagem.textContent = mensagem;

  toastElement.classList.remove('bg-success', 'bg-danger');
  toastElement.classList.add(sucesso ? 'bg-success' : 'bg-danger');

  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

// CARREGAR LISTA DE POSTAGENS
async function carregarPostagens() {
  const container = document.getElementById('container_postagens_comunicados');
  container.innerHTML = '';

  const querySnapshot = await getDocs(collection(db, 'comunicados'));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;

    const card = document.createElement('div');
    card.className = 'card mb-3 p-3 shadow-sm';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <h5 class="mb-1">${data.titulo || 'Sem título'}</h5>
      <p class="mb-2 text-muted">${data.descricao || ''}</p>
      <div class="d-flex flex-wrap gap-2">
        ${(Array.isArray(data.imagens) ? data.imagens : []).map(url => `<img src="${url}" style="max-width: 100px;">`).join('')}
      </div>
    `;

    card.addEventListener('click', () => abrirModalEdicao(id, data));
    container.appendChild(card);
  });
}

// ABRIR MODAL DE EDIÇÃO
function abrirModalEdicao(id, data) {
  document.getElementById('editTitulo').value = data.titulo || '';
  document.getElementById('editDescricao').value = data.descricao || '';
  idPostagemEditando = id;
  imagensEditando = [...(data.imagens || [])];

  renderizarImagensEditando();

  const modal = new bootstrap.Modal(document.getElementById('modalEdicao'));
  modal.show();
}

function renderizarImagensEditando() {
  const container = document.getElementById('editImagensContainer');
  container.innerHTML = '';

  imagensEditando.forEach((url, index) => {
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'position-relative';

    const img = document.createElement('img');
    img.src = url;
    img.style.maxWidth = '100px';
    img.style.borderRadius = '5px';
    img.style.marginRight = '8px';

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'x';
    btnExcluir.type = 'button';
    btnExcluir.className = 'btn btn-sm btn-danger position-absolute top-0 end-0';
    btnExcluir.style.transform = 'translate(50%,-50%)';
    btnExcluir.addEventListener('click', () => {
      imagensEditando.splice(index, 1);
      renderizarImagensEditando();
    });

    imgWrapper.appendChild(img);
    imgWrapper.appendChild(btnExcluir);
    container.appendChild(imgWrapper);
  });
}



// SALVAR ALTERAÇÃO
document.getElementById('formEdicao').addEventListener('submit', async (e) => {
  e.preventDefault();
  const titulo = document.getElementById('editTitulo').value;
  const descricao = document.getElementById('editDescricao').value;

  if (!idPostagemEditando) return;

  try {
    const ref = doc(db, 'comunicados', idPostagemEditando);
    const snapshot = await getDoc(ref);
    const dados = snapshot.exists() ? snapshot.data() : {};

    await setDoc(ref, {
      ...dados,
      titulo,
      descricao,
      imagens: imagensEditando
    });

    mostrarToast('Comunicado editado com sucesso!');
    bootstrap.Modal.getInstance(document.getElementById('modalEdicao')).hide();
    carregarPostagens();
    idPostagemEditando = null;

  } catch (error) {
    console.error('Erro ao editar:', error);
    mostrarToast('Erro ao editar comunicados.', false);
  }
});

document.getElementById('btnExcluirPostagem').addEventListener('click', async () => {
  if (!idPostagemEditando) return;

  if (!confirm('Tem certeza que deseja excluir esta postagem?')) return;

  try {
    await deleteDoc(doc(db, 'comunicados', idPostagemEditando));
    mostrarToast('Postagem excluída com sucesso!');
    bootstrap.Modal.getInstance(document.getElementById('modalEdicao')).hide();
    carregarPostagens();
    idPostagemEditando = null;
  } catch (error) {
    console.error('Erro ao excluir:', error);
    mostrarToast('Erro ao excluir postagem.', false);
  }
});

carregarPostagens();
