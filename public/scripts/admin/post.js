import { db } from '../../firebase/firebase-config.js';
import {  collection, addDoc, serverTimestamp, setDoc, doc   } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const form = document.querySelector('form');
const tituloInput = document.getElementById('titulo');
const descricaoInput = document.getElementById('descricao');
const tipoSelect = document.getElementById('tipoPostagem');

// 👉 Coloque aqui sua API key do ImgBB
const imgbbApiKey = '1c831eb1cc58b3068fbda9cea52ac2e2';

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const titulo = tituloInput.value;
  const descricao = descricaoInput.value;
  const tipo = tipoSelect.value;

  let imagens = [];
  if (tipo === 'unica') {
    imagens = document.getElementById('imagemUnica').files;
  } else if (tipo === 'carrossel') {
    imagens = document.getElementById('imagensCarrossel').files;
  } else if (tipo === 'album') {
    imagens = document.getElementById('imagensAlbum').files;
  }

  if (tipo === 'carrossel' && imagens.length > 3) {
    mostrarToast('Selecione no máximo 3 imagens para o carrossel.', false);
    return;
  }
  if (!imagens || imagens.length === 0) {
    mostrarToast('Nenhuma imagem selecionada.', false);
    return;
  }

  const botao = form.querySelector('button[type="submit"]');
  botao.disabled = true;
  botao.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';

  try {
    const urls = await uploadParaImgBB(imagens);

    const agora = new Date();
    const nomeDocumento = `postagem-${agora.toLocaleDateString('pt-BR').replace(/\//g, '-')}-${agora.toLocaleTimeString('pt-BR').replace(/:/g, '-')}`;

    await setDoc(doc(db, 'postagens', nomeDocumento), {
      titulo,
      descricao,
      tipo,
      imagens: urls,
      criadoEm: serverTimestamp()
    });

    mostrarToast('Postagem criada com sucesso!', true);
    form.reset();
  } catch (error) {
    console.error('Erro ao criar postagem:', error);
    mostrarToast('Erro ao criar postagem. Veja o console.', false);
  } finally {
    botao.disabled = false;
    botao.innerHTML = 'Postar';
  }
});

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

function mostrarToast(mensagem, sucesso = true) {
  const toastElement = document.getElementById('toastFeedback');
  const toastMensagem = document.getElementById('toastMensagem');
  toastMensagem.textContent = mensagem;

  toastElement.classList.remove('bg-success', 'bg-danger');
  toastElement.classList.add(sucesso ? 'bg-success' : 'bg-danger');

  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}
