// ================================================== \\

// ~~ Importa recursos.
import { db, collection, getDocs } from '../firebase/firebase-config.js';

// ================================================== \\

// ~~ Classe que manipula as animações da página.
class PageController {

    // ================================================== \\

    // ~~ Lista de sessoes que irão ser monitoradas para reset de animação.
    sessoes = [
        {
            sessao: "#inicio",
            dados: [
                { classe: ".titulo-inicio", animacao: "animate-fade-in-1" },
                { classe: ".subtitulo-inicio", animacao: "animate-fade-in-2" },
            ]
        },
        {
            sessao: "#comunicados",
            dados: [
                { classe: ".titulo-comunicados", animacao: "animate-fade-in-1" },
                { classe: ".calendario-comunicados", animacao: "animate-fade-in-2" }
            ]
        },
        {
            sessao: "#postagens",
            dados: [
                { classe: ".titulo-postagens", animacao: "animate-fade-in-1" },
                { classe: ".postagens-lista", animacao: "animate-fade-in-2" }
            ]
        },
        {
            sessao: "#equipe",
            dados: [
                { classe: ".titulo-equipe", animacao: "animate-fade-in-1" },
                { classe: ".equipe-carrousel", animacao: "animate-fade-in-2" }
            ]
        },
        {
            sessao: "#contato",
            dados: [
                { classe: ".titulo-contato", animacao: "animate-fade-in-1" }
            ]
        },
        {
            sessao: "#historia",
            dados: [
                { classe: ".historia-titulo", animacao: "animate-fade-in-1" },
                { classe: ".historia-paragrafo", animacao: "animate-fade-in-2" },
                { classe: ".historia-carrousel", animacao: "animate-fade-in-3" },

            ]
        }
    ];

    // ~~ Lista com elementos para carrousel.
    carrousels = [
        { classe: ".historia-swiper", autoplay: true },
        { classe: ".equipe-swiper", autoplay: true },
    ];

    // ================================================== \\

    // ~~ Função que irá resetar as animações.
    resetarAnimacoes() {
        this.sessoes.forEach(sessao => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        sessao.dados.forEach(dado => {
                            let elemento = document.querySelector(dado.classe);
                            elemento.classList.remove(dado.animacao);
                            void elemento.offsetWidth;
                            elemento.classList.add(dado.animacao);
                        });
                    }
                });
            }, { threshold: 0.1 });
            const elementoSessao = document.querySelector(sessao.sessao);
            if (elementoSessao) observer.observe(elementoSessao);
        });
    }

    // ================================================== \\

    // ~~ Inicia carrossel.
    initCarrossel() {
        this.carrousels.forEach(carrousel => {
            const config = {
                loop: true,
                grabCursor: true,
                spaceBetween: 20,
                slidesPerView: 1,
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                },
            };
            if (carrousel.autoplay) {
                config.autoplay = {
                    delay: 4000,
                    disableOnInteraction: false
                };
            }
            new Swiper(carrousel.classe, config);
        });
    }

    // ================================================== \\

    // ~~ Método para coletar comunicados do Firebase.
    async carregarComunicados() {

        // ~~ Cria lista vazia para armazenar os eventos.
        const eventos = [];

        // ~~ Coleta os comunicados e armazena na variável "querySnapshot".
        const querySnapshot = await getDocs(collection(db, 'comunicados'));

        // ~~ Para cada comunicado...
        querySnapshot.forEach(doc => {

            // ~~ Coleta os dados do comunicado.
            const data = doc.data();

            // ~~ Se o comunicado possuir o campo data...
            if (data.data) {

                // ~~ Cria um dicionário para as informações e armazena dentro da lista de eventos criada acima.
                eventos.push({

                    // ~~ Adiciona o título do comunicado.
                    title: data.titulo,

                    // ~~ Adiciona a data do comunicado.
                    date: data.data,

                    // ~~ Adiciona a descrição e as imagens.
                    extendedProps: {
                        descricao: data.descricao,

                        // ~~ Se não possuir imagens, armazena um array vazio.
                        imagens: data.imagens || []
                    }
                });
            }
        });

        // ~~ A lista de eventos neste momento está com todos os comunicados dentro dela. Sendo cada um, um dicionário
        // ~~ contendo todos os seus campos.

        // ~~ Encontra o elemento "calendario" que está no HTML para alocar o calendário dentro dessa div.
        const calendarioEl = document.getElementById('calendario');

        // ~~ Cria uma instância do calendário usando o CDN do jsDelivr. Cria usando o elemento "calendarioEl".
        const calendar = new FullCalendar.Calendar(calendarioEl, {

            // ~~ Aqui define algumas opções do calendário.

            // ~~ Começa mostrando a grade de calendário.
            initialView: 'dayGridMonth',

            // ~~ Local Brasil.
            locale: 'pt-br',

            // ~~ Altura define para auto.
            height: 'auto',

            // ~~ Atribui ao calendário a lista de eventos (comunicados) que foi criada acima.
            // ~~ O próprio calendário identifica a chave "date" pra cada item na lista e exibe
            // ~~ os eventos na grade de dias do calendário, correspondendo a data da chave "date",
            // ~~ que deve estar no formato "yyyy-mm-dd" para funcionar.
            events: eventos,

            // ~~ Quando não há nenhum evento para exibir, mostra esse texto padrão.
            noEventsContent: 'Nenhum evento para exibir.',

            // ~~ Aqui configura o cabeçalho do calendário com as opções de mudar o mês, o título no meio,
            // ~~ e as opções de exibir no formato de grade ou lista.
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,listMonth'
            },

            // ~~ Aqui os textos padrão para os botões.
            buttonText: {
                today: 'Hoje',
                month: 'Mês',
                list: 'Lista'
            },

            // ~~ Ao clicar em um dia na grade de calendários, executa essa função.
            // ~~ O parâmetro "info" é passado automaticamente pelo calendário, contendo informações
            // ~~ do dia em que foi clicado.
            dateClick: function(info) {

                // ~~ Coleta a data do dia que foi clicado.
                const dataSelecionada = info.dateStr;

                // ~~ Filtra a lista de eventos, coletando apenas os que são da mesma data do dia
                // ~~ que foi selecionado.
                const eventosDoDia = eventos.filter(ev => ev.date === dataSelecionada);

                // ~~ Se não possuir nenhum evento no dia, não faz nada e retorna.
                if (eventosDoDia.length === 0) return;

                // ~~ Encontra o elemento "modalTitulo" no HTML.
                const modalTitulo = document.getElementById('modalTitulo');

                // ~~ Encontra o elemento "modalImagens" no HTML.
                const modalImagens = document.getElementById('modalImagens');

                // ~~ Injeta no "modalTitulo" a data dos comunicados, convertendo para o formato "dd/mm/yyyy".
                modalTitulo.textContent = `Comunicados para o dia ${new Date(dataSelecionada).toLocaleDateString('pt-BR')}`;

                // ~~ Alinha o título no meio do modal.
                modalTitulo.style.textAlign = "center";

                // ~~ Injeta no "modalImagens" um texto vazio para resetá-lo.
                modalImagens.innerHTML = '';

                // ~~ Para cada evento do dia, pega o evento e cria um index começando do 0 e então...
                eventosDoDia.forEach((ev, index) => {

                    // ~~ Cria uma div para abrigar os dados do evento.
                    const bloco = document.createElement('div');

                    // ~~ Define classes do TailWind para a div.
                    bloco.className = 'bg-gray-50 p-4 rounded-xl shadow border border-[rgb(155,182,255)]';

                    // ~~ Cria o título onde será injetado o título do evento.
                    const titulo = `<h3 class="text-xl font-bold mb-2">${ev.title}</h3>`;

                    // ~~ Cria a descrição onde seja injetado a descrição que está dentro da chave "extendedProps".
                    // ~~ Se não tiver descrição, injeta um texto vazio.
                    const descricao = `<p class="text-gray-600 mb-4">${ev.extendedProps.descricao || ''}</p>`;

                    // ~~ Limpa as imagens.
                    let imagensHTML = '';

                    // ~~ Verifica se há imagens no evento.
                    if ((ev.extendedProps.imagens || []).length > 0) {

                        // ~~ Se tiver imagem, cria uma div com o swiper para criar cards pras fotos.
                        // ~~ Cada comunicado recebe dinamicamente um "index". E pra cada imagem do evento,
                        // ~~ cria um card.
                        imagensHTML = `
                            <div class="swiper swiper-comunicado-${index} w-full">
                                <div class="swiper-wrapper">
                                    ${ev.extendedProps.imagens.map(img => `
                                        <div class="swiper-slide">
                                            <img src="${img}" class="w-full h-64 object-contain rounded border border-[rgb(155,182,255)] bg-white p-1" />
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="swiper-pagination mt-2"></div>
                            </div>
                        `;
                    }

                    // ~~ Injeta na div o título, descrição e as imagens que ficarão como cards.
                    bloco.innerHTML = titulo + descricao + imagensHTML;

                    // ~~ Pega a div usada para armazenar os dados do evento, e injeta dentro do modal.
                    modalImagens.appendChild(bloco);

                    // ~~ Aqui ocorre o reset do loop, até acabar a lista de eventos e todos estarem no modal.
                });

                // ~~ Usa "setTimeout" para esperar os elementos do DOM serem carregados.
                setTimeout(() => {

                    // ~~ Para cada evento do dia, ignora o evento e cria um index começando do 0 e então...
                    eventosDoDia.forEach((_, index) => {

                        // ~~ Inicia o swiper para o evento que foi adicionado no modal, com referência no index.
                        new Swiper(`.swiper-comunicado-${index}`, {

                            // ~~ Define configurações do swiper.
                            loop: true,
                            grabCursor: true,
                            slidesPerView: 1,
                            spaceBetween: 20,
                            pagination: {
                                el: `.swiper-comunicado-${index} .swiper-pagination`,
                                clickable: true,
                            },
                            autoplay: {
                                delay: 4000,
                                disableOnInteraction: false
                            }
                        });
                    });
                }, 0);

                // ~~ Por fim, depois de tudo criado e o swiper ligado, exibe o modal.
                document.getElementById('modalComunicado').classList.remove('hidden');
            },

            // ~~ Ao clicar em algum evento da lista, executa essa função.
            // ~~ O parâmetro "info" é passado automaticamente pelo calendário, contendo informações
            // ~~ do dia que foi clicado.
            eventClick: function(info) {

                // ~~ Coleta os dados do evento que foi clicado.
                const evento = info.event;

                // ~~ Coleta o título dele e os outros dados (descrição e imagens).
                const { title, extendedProps } = evento;

                // ~~ Para cada imagem, cria um card.
                const imagensHTML = (extendedProps.imagens || []).map(img => `
                    <div class="swiper-slide">
                        <img src="${img}" class="w-full h-64 object-contain rounded-xl border border-[rgb(155,182,255)] shadow" />
                    </div>
                `).join('');

                // ~~ Cria o carrosel se houver imagens. Se não houver, armazena um texto vazio.
                const carrosselHTML = imagensHTML ? `
                    <div class="swiper comunicados-swiper w-full mb-4">
                        <div class="swiper-wrapper">
                            ${imagensHTML}
                        </div>
                        <div class="swiper-pagination mt-2"></div>
                    </div>
                ` : '';

                // ~~ Coleta o modal que está no HTML que será usado para abrigar os dados.
                const modalContent = document.getElementById('comunicadoModalContent');

                // ~~ Injeta no modal os dados (título do evento, descrição e imagens se houverem).
                modalContent.innerHTML = `
                    <h2 class="text-xl font-bold mb-2">${title}</h2>
                    <p class="text-gray-600 mb-4">${extendedProps.descricao || ''}</p>
                    ${carrosselHTML}
                `;

                // ~~ Exibe o modal.
                document.getElementById('comunicadoModal').classList.remove('hidden');

                // ~~ Se houver carrosel, liga o swiper.
                if (imagensHTML) {
                    new Swiper('.comunicados-swiper', {
                        loop: true,
                        grabCursor: true,
                        spaceBetween: 20,
                        slidesPerView: 1,
                        pagination: {
                            el: '.swiper-pagination',
                            clickable: true,
                        },
                        autoplay: {
                            delay: 4000,
                            disableOnInteraction: false
                        }
                    });
                }
            }
        });

        // ~~ Por fim, renderiza o calendário.
        calendar.render();
    }

    // ================================================== \\

    // ~~ Método para coletar postagens do Firebase.
    async carregarPostagens() {
        const container = document.querySelector('.postagens-lista');
        container.innerHTML = '';
        window.postagensStore = [];
        try {
            const querySnapshot = await getDocs(collection(db, 'postagens'));
            const docs = querySnapshot.docs;
            docs.forEach((doc, index) => {
                const data = doc.data();
                const primeiraImagem = data.imagens?.[0] || null;
                const postHTML = `
                    <div class="cursor-pointer flex items-center gap-4 bg-white p-4 rounded-xl shadow border border-blue-300 hover:bg-blue-50 transition"
                        onclick="window.pageController.abrirModalPostagem(${index})">
                        ${primeiraImagem
                            ? `<img src="${primeiraImagem}" class="w-24 h-24 object-cover rounded-lg border border-blue-200" />`
                            : `<div class="w-24 h-24 flex items-center justify-center bg-blue-100 rounded-lg text-blue-600 font-semibold">Sem imagem</div>`
                        }
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800">${data.titulo}</h3>
                            <p class="text-sm text-gray-500">Postado em: ${data.data}</p>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', postHTML);
                window.postagensStore.push(data);
            });
        } catch (error) {
            console.error('Erro ao carregar postagens:', error);
            container.innerHTML = `<p class="text-red-500">Erro ao carregar postagens. Tente novamente mais tarde.</p>`;
        }
    }

    // ================================================== \\

    // ~~ Função para abrir o modal de postagem.
    abrirModalPostagem(index) {
        const data = window.postagensStore[index];
        document.getElementById('modalPostagemTitulo').textContent = data.titulo;
        document.getElementById('modalPostagemData').textContent = `Postado em: ${data.data}`;
        document.getElementById('modalPostagemDescricao').textContent = data.descricao || '';
        const swiperWrapper = document.querySelector('#modalPostagemSwiper .swiper-wrapper');
        swiperWrapper.innerHTML = (data.imagens || []).map(img => `
            <div class="swiper-slide">
                <img src="${img}" class="w-full h-64 object-contain rounded border border-blue-200 bg-white p-2" />
            </div>
        `).join('');
        window.modalPostagemSwiper = new Swiper('#modalPostagemSwiper', {
            loop: true,
            grabCursor: true,
            spaceBetween: 20,
            slidesPerView: 1,
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            autoplay: {
                delay: 4000,
                disableOnInteraction: false
            }
        });
        document.getElementById('modalPostagem').classList.remove('hidden');
    }

    // ================================================== \\

}

// ================================================== \\

// ~~ Cria instância.
const pageController = new PageController();

// ~~ Deixa disponível para o HTML chamar.
window.pageController = pageController;

// ~~ Inicia funções.
pageController.carregarComunicados();
pageController.carregarPostagens();
pageController.resetarAnimacoes();
pageController.initCarrossel();

// ================================================== \\