document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DEL CARRUSEL ---
    const sliderContainer = document.querySelector('.slider-container');
    const slider = document.querySelector('.slider');
    const cardLinks = document.querySelectorAll('.card-link');
    
    // IMPORTANTE: Seleccionamos los botones que ahora existen en el HTML
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    // Salir si no hay elementos para evitar errores
    if (!slider || !prevBtn || !nextBtn || cardLinks.length === 0) {
        console.error("No se encontraron los elementos necesarios para el carrusel.");
        return;
    }

    let currentIndex = 0;
    const cardCount = cardLinks.length;

    function getCardWidth() {
        // Devuelve el ancho de la primera tarjeta, incluyendo su margen
        return cardLinks[0].offsetWidth;
    }

    function getGap() {
        // Devuelve el espacio (gap) entre tarjetas
        return parseInt(window.getComputedStyle(slider).gap) || 0;
    }

    function updateSliderPosition() {
        const offset = -currentIndex * (getCardWidth() + getGap());
        slider.style.transform = `translateX(${offset}px)`;
    }

    function updateButtonState() {
        const cardWidth = getCardWidth();
        const gap = getGap();
        // Calcula cuántas tarjetas son visibles (aproximadamente)
        const visibleCards = Math.floor(sliderContainer.offsetWidth / (cardWidth + gap));
        
        prevBtn.disabled = currentIndex === 0;
        // La condición para deshabilitar "siguiente" es cuando ya no se pueden mover más tarjetas a la izquierda
        nextBtn.disabled = currentIndex >= cardCount - visibleCards;
        
        prevBtn.classList.toggle('disabled', prevBtn.disabled);
        nextBtn.classList.toggle('disabled', nextBtn.disabled);
    }

    nextBtn.addEventListener('click', () => {
        if (!nextBtn.disabled) {
            currentIndex++;
            updateSliderPosition();
            updateButtonState();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (!prevBtn.disabled) {
            currentIndex--;
            updateSliderPosition();
            updateButtonState();
        }
    });

    // Re-calcular en caso de que cambie el tamaño de la ventana
    window.addEventListener('resize', () => {
        // Se asegura de que el índice no se quede fuera de los límites visibles
        const visibleCards = Math.floor(sliderContainer.offsetWidth / (getCardWidth() + getGap()));
        if (currentIndex > cardCount - visibleCards) {
            currentIndex = Math.max(0, cardCount - visibleCards);
        }
        
        updateSliderPosition();
        updateButtonState();
    });

    // Llamada inicial para establecer el estado correcto de los botones
    updateButtonState();
});