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
                { classe: ".postagens-carrousel", animacao: "animate-fade-in-2" }
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
        { classe: ".postagens-swiper", autoplay: false }
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
        const eventos = [];
        const querySnapshot = await getDocs(collection(db, 'comunicados'));
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.data) {
                eventos.push({
                    title: data.titulo,
                    date: data.data,
                    extendedProps: {
                        descricao: data.descricao,
                        imagens: data.imagens || []
                    }
                });
            }
        });
        const calendarioEl = document.getElementById('calendario');
        const calendar = new FullCalendar.Calendar(calendarioEl, {
            initialView: 'dayGridMonth',
            locale: 'pt-br',
            height: 'auto',
            events: eventos,
            noEventsContent: 'Nenhum evento para exibir.',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,listMonth'
            },
            buttonText: {
                today: 'Hoje',
                month: 'Mês',
                list: 'Lista'
            },
            dateClick: function(info) {
                const dataSelecionada = info.dateStr;
                const eventosDoDia = eventos.filter(ev => ev.date === dataSelecionada);
                if (eventosDoDia.length === 0) return;
                const modalTitulo = document.getElementById('modalTitulo');
                const modalImagens = document.getElementById('modalImagens');
                modalTitulo.textContent = `Comunicados do dia ${new Date(dataSelecionada).toLocaleDateString('pt-BR')}`;
                modalTitulo.style.textAlign = "center";
                modalImagens.innerHTML = '';
                eventosDoDia.forEach((ev, index) => {
                    const bloco = document.createElement('div');
                    bloco.className = 'bg-gray-50 p-4 rounded-xl shadow border border-[rgb(155,182,255)]';
                    const titulo = `<h3 class="text-xl font-bold mb-2">${ev.title}</h3>`;
                    const descricao = `<p class="text-gray-600 mb-4">${ev.extendedProps.descricao || ''}</p>`;
                    let imagensHTML = '';
                    if ((ev.extendedProps.imagens || []).length > 0) {
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
                    bloco.innerHTML = titulo + descricao + imagensHTML;
                    modalImagens.appendChild(bloco);
                });
                setTimeout(() => {
                    eventosDoDia.forEach((_, index) => {
                        new Swiper(`.swiper-comunicado-${index}`, {
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
                document.getElementById('modalComunicado').classList.remove('hidden');
            },
            eventClick: function(info) {
                const evento = info.event;
                const { title, extendedProps } = evento;
                const imagensHTML = (extendedProps.imagens || []).map(img => `
                    <div class="swiper-slide">
                        <img src="${img}" class="w-full h-64 object-contain rounded-xl border border-[rgb(155,182,255)] shadow" />
                    </div>
                `).join('');
                const carrosselHTML = imagensHTML ? `
                    <div class="swiper comunicados-swiper w-full mb-4">
                        <div class="swiper-wrapper">
                            ${imagensHTML}
                        </div>
                        <div class="swiper-pagination mt-2"></div>
                    </div>
                ` : '';
                const modalContent = document.getElementById('comunicadoModalContent');
                modalContent.innerHTML = `
                    <h2 class="text-xl font-bold mb-2">${title}</h2>
                    <p class="text-gray-600 mb-4">${extendedProps.descricao || ''}</p>
                    ${carrosselHTML}
                `;
                document.getElementById('comunicadoModal').classList.remove('hidden');
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
        calendar.render();
    }

    // ================================================== \\

    // ~~ Método para coletar postagens do Firebase.
    async carregarPostagens() {
        const container = document.querySelector('.postagens-swiper .swiper-wrapper');
        const querySnapshot = await getDocs(collection(db, 'postagens'));
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const imagensHTML = (data.imagens || []).map(imagem => `
                <div class="swiper-slide">
                    <img src="${imagem}" class="w-full h-64 object-cover border-4 border-[rgb(155,182,255)] shadow" />
                </div>
            `).join('');
            const comunicadoHTML = `
                <div class="swiper-slide flex justify-center">
                    <div class="bg-white rounded-2xl p-8 w-72 sm:w-80 md:w-[28rem] lg:w-[36rem] xl:w-[30rem] flex flex-col items-center text-center">
                        <div class="swiper postagens-imagens-swiper w-full mb-6 overflow-hidden">
                            <div class="swiper-wrapper">
                                ${imagensHTML}
                            </div>
                            <div class="swiper-pagination mt-2"></div>
                        </div>
                        <h3 class="font-semibold text-xl">${data.titulo}</h3>
                        <p class="text-base text-gray-600 mt-2">${data.data}</p>
                        <p class="text-base text-gray-600 mt-2">${data.descricao}</p>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', comunicadoHTML);
        });
        document.querySelectorAll('.postagens-imagens-swiper').forEach(swiperEl => {
            new Swiper(swiperEl, {
                loop: true,
                grabCursor: true,
                spaceBetween: 20,
                slidesPerView: 1,
                pagination: {
                    el: swiperEl.querySelector('.swiper-pagination'),
                    clickable: true,
                },
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false
                }
            });
        });
    }

    // ================================================== \\

}

// ================================================== \\

// ~~ Cria instância.
const pageController = new PageController();

// ~~ Inicia funções.
pageController.carregarComunicados();
pageController.carregarPostagens();
pageController.resetarAnimacoes();
pageController.initCarrossel();

// ================================================== \\