document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DEL DOM ---
    const airportSelect = document.getElementById('airport-select');
    const flightManagementSection = document.getElementById('flight-management-section');
    const airportNameTitle = document.getElementById('airport-name-title');
    const addFlightForm = document.getElementById('add-flight-form');
    const flightList = document.getElementById('flight-list');
    const noFlightsMessage = document.getElementById('no-flights-message');
    const purchaseModal = document.getElementById('purchase-modal');
    const infoPopup = document.getElementById('info-popup');
    const infoPopupClose = document.getElementById('info-popup-close');

    // --- FILTROS Y BOTONES ---
    const showFlightsBtn = document.getElementById('show-flights-btn');
    const filterFlightsBtn = document.getElementById('filter-flights-btn');
    const companyInput = document.getElementById('company-input');
    const filterDestination = document.getElementById('filter-destination');
    const filterArrivalTime = document.getElementById('filter-arrival-time');
    const filterCompany = document.getElementById('filter-company');

    // --- DATOS ---
    const airportsData = {
        "Asturias": "Aeropuerto de Asturias",
        "Barcelona": "Aeropuerto Josep Tarradellas Barcelona-El Prat",
        "Bilbao": "Aeropuerto de Bilbao",
        "Madrid": "Aeropuerto Adolfo Suárez Madrid-Barajas",
        "Málaga": "Aeropuerto de Málaga-Costa del Sol",
        "Santander": "Aeropuerto Seve Ballesteros"
    };

    const state = {
        flights: [],
        sampleFlights: [],
        userAddedFlights: [],
        selectedAirport: null,
        currentFlightForPurchase: null,
        showingSampleFlights: false
    };

    // --- INICIALIZACIÓN ---
    function init() {
        populateAirportSelector();
        setupEventListeners();
    }

    function populateAirportSelector() {
        airportSelect.innerHTML = '<option value="" disabled selected>-- Elija un aeropuerto --</option>';
        Object.keys(airportsData).forEach(airportKey => {
            const option = document.createElement('option');
            option.value = airportKey;
            option.textContent = airportKey;
            airportSelect.appendChild(option);
        });
    }

    function setupEventListeners() {
        airportSelect.addEventListener('change', handleAirportChange);
        addFlightForm.addEventListener('submit', handleAddFlightSubmit);
        infoPopupClose.addEventListener('click', () => infoPopup.classList.remove('visible'));
        showFlightsBtn.addEventListener('click', handleToggleSampleFlights);
        filterFlightsBtn.addEventListener('click', handleFilterFlights);
    }

    // --- CAMBIO DE AEROPUERTO ---
    function handleAirportChange() {
        state.selectedAirport = airportSelect.value;
        if (!state.selectedAirport) {
            flightManagementSection.classList.add('hidden');
            return;
        }

        airportNameTitle.innerHTML = `<i class="fas fa-plane-departure"></i> ${airportsData[state.selectedAirport]}`;
        flightManagementSection.classList.remove('hidden');
        flightManagementSection.classList.add('fade-in');

        loadSampleFlights();
        state.userAddedFlights = [];
        state.flights = [];
        state.showingSampleFlights = false;
        showFlightsBtn.innerHTML = '<i class="fas fa-list-ul"></i> Mostrar Todos';

        clearFilters();
        renderFlights([]);
        addFlightForm.reset();
        document.getElementById('flight-number').focus();
    }

    function clearFilters() {
        filterDestination.value = '';
        filterArrivalTime.value = '';
        filterCompany.value = '';
    }

    // --- TOGGLE: MOSTRAR/OCULTAR VUELOS ---
    function handleToggleSampleFlights() {
        clearFilters();
        state.showingSampleFlights = !state.showingSampleFlights;

        if (state.showingSampleFlights) {
            state.flights = [...state.sampleFlights, ...state.userAddedFlights];
            showFlightsBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Todos';
        } else {
            state.flights = [...state.userAddedFlights];
            showFlightsBtn.innerHTML = '<i class="fas fa-list-ul"></i> Mostrar Todos';
        }
        renderFlights(state.flights);
    }

    function loadSampleFlights() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const formatDate = (date) => date.toISOString().split('T')[0];

        state.sampleFlights = [
            { id: 1, number: 'IB501', company: 'Iberia', destination: 'Madrid', depDate: formatDate(tomorrow), depTime: '10:00', arrDate: formatDate(tomorrow), arrTime: '11:15', duration: '1h 15m', basePrice: 110.00 },
            { id: 2, number: 'IB505', company: 'Iberia', destination: 'Valencia', depDate: formatDate(tomorrow), depTime: '12:00', arrDate: formatDate(tomorrow), arrTime: '13:20', duration: '1h 20m', basePrice: 125.50 },
            { id: 3, number: 'VY210', company: 'Vueling', destination: 'Barcelona', depDate: formatDate(tomorrow), depTime: '11:30', arrDate: formatDate(tomorrow), arrTime: '12:45', duration: '1h 15m', basePrice: 95.00 },
            { id: 4, number: 'UX330', company: 'Air Europa', destination: 'Barcelona', depDate: formatDate(tomorrow), depTime: '14:00', arrDate: formatDate(tomorrow), arrTime: '15:10', duration: '1h 10m', basePrice: 105.00 },
            { id: 5, number: 'FR112', company: 'Ryanair', destination: 'Oporto', depDate: formatDate(tomorrow), depTime: '18:00', arrDate: formatDate(tomorrow), arrTime: '19:00', duration: '1h 00m', basePrice: 45.00 },
            { id: 6, number: 'EZ888', company: 'EasyJet', destination: 'Londres', depDate: formatDate(tomorrow), depTime: '18:00', arrDate: formatDate(tomorrow), arrTime: '19:30', duration: '2h 30m', basePrice: 180.00 },
            { id: 7, number: 'LH610', company: 'Lufthansa', destination: 'Frankfurt', depDate: formatDate(tomorrow), depTime: '07:00', arrDate: formatDate(tomorrow), arrTime: '09:30', duration: '2h 30m', basePrice: 210.00 },
            { id: 8, number: 'AE444', company: 'Air Europa', destination: 'París', depDate: formatDate(tomorrow), depTime: '07:15', arrDate: formatDate(tomorrow), arrTime: '09:30', duration: '2h 15m', basePrice: 190.75 },
        ];
    }

    // --- AÑADIR VUELO ---
    function handleAddFlightSubmit(e) {
        e.preventDefault();
        
        const basePrice = parseFloat(document.getElementById('precio-base').value);

        const newFlight = {
            id: Date.now(),
            number: document.getElementById('flight-number').value.trim(),
            company: companyInput.value.trim(),
            destination: document.getElementById('destination').value.trim(),
            depDate: document.getElementById('departure-date').value,
            depTime: document.getElementById('departure-time').value,
            arrDate: document.getElementById('arrival-date').value,
            arrTime: document.getElementById('arrival-time').value,
            basePrice: isNaN(basePrice) ? 0 : basePrice,
            duration: calculateFlightDuration(
                document.getElementById('departure-date').value,
                document.getElementById('departure-time').value,
                document.getElementById('arrival-date').value,
                document.getElementById('arrival-time').value
            ),
            isNew: true
        };
        
        if (!newFlight.number || !newFlight.company || !newFlight.destination || !newFlight.depDate || !newFlight.depTime || !newFlight.arrDate || !newFlight.arrTime || newFlight.basePrice <= 0) {
            return alert("Por favor, rellene todos los campos, incluido un precio base válido.");
        }

        if (newFlight.duration.includes("Error")) {
            return alert("La fecha de llegada no puede ser anterior a la de salida.");
        }

        state.userAddedFlights.push(newFlight);

        if (state.showingSampleFlights) {
            state.flights = [...state.sampleFlights, ...state.userAddedFlights];
        } else {
            state.flights = [...state.userAddedFlights];
        }

        clearFilters();
        renderFlights(state.flights);
        alert(`Vuelo ${newFlight.number.toUpperCase()} añadido correctamente.`);
        addFlightForm.reset();
        document.getElementById('flight-number').focus();
    }

    // --- FILTRAR VUELOS ---
    function handleFilterFlights() {
        const destination = filterDestination.value.trim().toLowerCase();
        const arrivalTime = filterArrivalTime.value;
        const company = filterCompany.value.trim().toLowerCase();

        let sourceFlights = state.showingSampleFlights ? [...state.sampleFlights, ...state.userAddedFlights] : [...state.userAddedFlights];

        let filteredFlights = sourceFlights;
        
        if (destination) {
            filteredFlights = filteredFlights.filter(flight => flight.destination.toLowerCase().includes(destination));
        }
        if (arrivalTime) {
            filteredFlights = filteredFlights.filter(flight => flight.arrTime === arrivalTime);
        }
        if (company) {
            filteredFlights = filteredFlights.filter(flight => flight.company.toLowerCase().includes(company));
        }
        
        state.flights = filteredFlights;
        renderFlights(state.flights);
    }

    // --- RENDERIZAR LISTA DE VUELOS ---
    function renderFlights(flightsToDisplay) {
        flightList.innerHTML = '';
        if (flightsToDisplay.length === 0) {
            let message = "Añada un vuelo o pulse 'Mostrar Todos'.";
            const filtersAreActive = filterDestination.value || filterArrivalTime.value || filterCompany.value;
            if (filtersAreActive) {
                message = "No se encontraron vuelos que coincidan con los filtros.";
            } else if (!state.showingSampleFlights) {
                message = "Pulse 'Mostrar Todos' para ver los vuelos de ejemplo.";
            }
            noFlightsMessage.textContent = message;
            noFlightsMessage.classList.remove('hidden');
            return;
        }
        
        noFlightsMessage.classList.add('hidden');
        flightsToDisplay.forEach(flight => {
            const li = document.createElement('li');
            li.className = 'flight-card';

            if (flight.isNew) {
                li.classList.add('new-item');
                setTimeout(() => { li.classList.remove('new-item'); delete flight.isNew; }, 500);
            }

            li.innerHTML = `
                <div class="flight-main-info">
                    <h4>Vuelo ${flight.number.toUpperCase()} <span style="font-weight:normal; color: #555;">(${flight.company})</span></h4>
                    <div class="flight-route">
                        <span>${state.selectedAirport}</span> <i class="fas fa-plane"></i> <span>${flight.destination}</span>
                    </div>
                    <div class="flight-details-grid">
                        <div class="detail-item"><i class="fas fa-plane-departure"></i> ${flight.depTime}</div>
                        <div class="detail-item"><i class="fas fa-plane-arrival"></i> ${flight.arrTime}</div>
                        <div class="detail-item"><i class="fas fa-hourglass-half"></i> ${flight.duration}</div>
                    </div>
                </div>
                <div class="flight-actions">
                    <button class="buy-button" data-flight-id="${flight.id}">
                        <i class="fas fa-ticket-alt"></i> Comprar Billete
                    </button>
                </div>
            `;
            li.querySelector('.buy-button').addEventListener('click', () => {
                state.currentFlightForPurchase = flight;
                openPurchaseModal();
            });
            flightList.appendChild(li);
        });
    }

    // --- CÁLCULO DE DURACIÓN ---
    function calculateFlightDuration(depDate, depTime, arrDate, arrTime) {
        const dep = new Date(`${depDate}T${depTime}`);
        const arr = new Date(`${arrDate}T${arrTime}`);
        if (isNaN(dep) || isNaN(arr)) return "N/A";
        const durationMs = arr - dep;
        if (durationMs < 0) return "Error";
        const hours = Math.floor(durationMs / 3600000);
        const minutes = Math.floor((durationMs % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    }

    // --- MODAL DE COMPRA ---
    function openPurchaseModal() {
        purchaseModal.innerHTML = createPurchaseFormHTML();
        purchaseModal.classList.add("visible");
        
        let infoPopupShown = false;
        const ticketForm = purchaseModal.querySelector("#ticket-form");
        const classSelect = purchaseModal.querySelector('#passenger-class');
        const priceDisplay = purchaseModal.querySelector('#final-price-display');
        const commentTextarea = purchaseModal.querySelector('#passenger-comment');
        const charCounter = purchaseModal.querySelector('#char-counter');
        const flight = state.currentFlightForPurchase;

        const classMultipliers = {
            turista: 1,
            turista_premium: 1.25,
            business: 1.75,
            primera: 2.5
        };
        
        function updateFinalPrice() {
            const selectedClass = classSelect.value;
            const multiplier = classMultipliers[selectedClass];
            const finalPrice = flight.basePrice * multiplier;
            priceDisplay.textContent = `${finalPrice.toFixed(2)} €`;
        }
        
        function updateCharCounter() {
            const remaining = commentTextarea.maxLength - commentTextarea.value.length;
            charCounter.textContent = `${remaining} caracteres restantes`;
        }

        classSelect.addEventListener('change', updateFinalPrice);
        commentTextarea.addEventListener('input', updateCharCounter);

        ticketForm.addEventListener("submit", handlePurchaseSubmit);
        purchaseModal.querySelector(".close-button").addEventListener("click", closePurchaseModal);
        ticketForm.querySelectorAll('input[name="payment-method"]').forEach(radio => {
            radio.addEventListener("change", () => {
                if (radio.checked && radio.value === "Efectivo" && !infoPopupShown) {
                    infoPopup.classList.add("visible");
                    infoPopupShown = true;
                }
            });
        });

        ["passenger-name", "passenger-email", "passenger-dni"].forEach(id => {
            const input = ticketForm.querySelector(`#${id}`);
            input.addEventListener("input", () => id === "passenger-dni" ? validateDNIField(input) : validateRequiredField(input, "Este campo es obligatorio."));
        });

        ticketForm.querySelector("#passenger-name").focus();
        updateFinalPrice();
        updateCharCounter();
    }

    function handlePurchaseSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const name = form.querySelector("#passenger-name").value.trim();
        const email = form.querySelector("#passenger-email").value.trim();
        const dni = form.querySelector("#passenger-dni").value.trim();
        const paymentMethod = form.querySelector('input[name="payment-method"]:checked');
        const passengerClass = form.querySelector("#passenger-class").value;
        const comment = form.querySelector("#passenger-comment").value.trim();
        const finalPrice = form.querySelector("#final-price-display").textContent;

        let isValid = true;
        if (!name) { setInvalid(form.querySelector("#passenger-name"), "El nombre es obligatorio."); isValid = false; }
        if (!email) { setInvalid(form.querySelector("#passenger-email"), "El email es obligatorio."); isValid = false; }
        if (!isValidDNI(dni)) { setInvalid(form.querySelector("#passenger-dni"), "Formato de DNI no válido."); isValid = false; }
        if (!paymentMethod) { alert("Seleccione un método de pago."); isValid = false; }

        if (isValid) {
            showPurchaseSuccessScreen({
                name, email, dni, paymentMethod: paymentMethod.value,
                passengerClass, comment, finalPrice
            });
        }
    }

    const closePurchaseModal = () => {
        purchaseModal.classList.remove("visible");
        purchaseModal.innerHTML = "";
    };
    
    // HTML del formulario de compra actualizado
    function createPurchaseFormHTML() {
        const flight = state.currentFlightForPurchase;
        return `
            <div class="modal-content">
                <button class="close-button" title="Cerrar">×</button>
                <h2 id="modal-title"><i class="fas fa-shopping-cart"></i>Confirmar Compra</h2>
                <p><strong>Vuelo:</strong> ${flight.number.toUpperCase()} a ${flight.destination}</p>
                <p><strong>Salida:</strong> <i class="fas fa-calendar-alt"></i> ${flight.depDate} <i class="fas fa-clock"></i> ${flight.depTime} | <strong>Precio Base:</strong> ${flight.basePrice.toFixed(2)} €</p>
                <form id="ticket-form" novalidate>
                    <div class="form-group">
                        <label for="passenger-name">Nombre Completo</label>
                        <input type="text" id="passenger-name" required><div class="error-message"></div>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="passenger-email">Correo Electrónico</label>
                            <input type="email" id="passenger-email" required><div class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="passenger-dni">DNI</label>
                            <input type="text" id="passenger-dni" required placeholder="12345678A"><div class="error-message"></div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="passenger-class">Clase</label>
                        <select id="passenger-class">
                            <option value="turista">Turista</option>
                            <option value="turista_premium">Turista Premium</option>
                            <option value="business">Business</option>
                            <option value="primera">Primera</option>
                        </select>
                    </div>
                    
                    <fieldset class="form-group">
                        <legend>Método de Pago</legend>
                        <label><input type="radio" name="payment-method" value="Efectivo" required> Efectivo</label>
                        <label><input type="radio" name="payment-method" value="Tarjeta"> Tarjeta</label>
                        <label><input type="radio" name="payment-method" value="PayPal"> PayPal</label>
                        <label><input type="radio" name="payment-method" value="Bizum"> Bizum</label>
                    </fieldset>

                    <!-- CAMPO DE COMENTARIO ACTUALIZADO -->
                    <div class="form-group">
                        <label for="passenger-comment">Comentario / pregunta 
                            <span id="char-counter" style="float: right; font-size: 0.8rem; color: #6c757d; font-weight: normal;">120 caracteres restantes</span>
                        </label>
                        <textarea id="passenger-comment" rows="4" maxlength="120" placeholder="Si tiene alguna petición especial, escríbala aquí..."></textarea>
                    </div>

                    <!-- PRECIO FINAL REUBICADO -->
                    <div style="text-align: right; margin-top: 1.5rem; padding: 1rem; background-color: #f8f9fa; border-radius: 8px;">
                        <span style="font-size: 1rem; color: #555; vertical-align: middle;">Precio Final:</span>
                        <span id="final-price-display" style="font-size: 2rem; font-weight: bold; color: var(--primary-color); vertical-align: middle; margin-left: 10px;">0.00 €</span>
                    </div>

                    <button type="submit" class="cta-button" style="margin-top: 1.5rem;"><i class="fas fa-check-circle"></i>Confirmar y Comprar</button>
                </form>
            </div>`;
    }

    // Pantalla de éxito y generación de recibo actualizados
    function showPurchaseSuccessScreen(purchaseData) {
        const isCash = purchaseData.paymentMethod === "Efectivo";
        const icon = isCash ? '<i class="fas fa-clock popup-icon" style="color:var(--info-color);"></i>' : '<i class="fas fa-check-circle popup-icon" style="color:var(--success-color);"></i>';
        const title = isCash ? "¡Reserva Confirmada!" : "¡Compra Realizada con Éxito!";
        const message = isCash ? `<p>Pague en nuestro mostrador antes de las <strong>${getPaymentDeadline(state.currentFlightForPurchase.depDate, state.currentFlightForPurchase.depTime)}</strong>.</p>` : `<p>Se ha enviado una confirmación a <strong>${purchaseData.email}</strong>.</p>`;
        const buttonText = isCash ? "Descargar Reserva" : "Descargar Compra";
        
        purchaseModal.innerHTML = `
            <div class="modal-content" style="text-align: center;">
                <button class="close-button" title="Cerrar">×</button>
                ${icon}<h2>${title}</h2>
                <p>Gracias, <strong>${purchaseData.name}</strong>.</p>
                ${message}
                <button id="download-receipt-btn" class="cta-button"><i class="fas fa-download"></i> ${buttonText}</button>
            </div>`;
        
        purchaseModal.querySelector(".close-button").addEventListener("click", closePurchaseModal);
        purchaseModal.querySelector("#download-receipt-btn").addEventListener("click", () => {
            generateAndDownloadReceipt(purchaseData, state.currentFlightForPurchase);
            closePurchaseModal();
        });
    }

    function generateAndDownloadReceipt(purchaseData, flightData) {
        const isCash = purchaseData.paymentMethod === "Efectivo";
        const title = `==== ${isCash ? "COMPROBANTE DE RESERVA" : "COMPROBANTE DE COMPRA"} ====`;
        const paymentStatus = isCash ? "Efectivo (Pendiente de pago en aeropuerto)" : `${purchaseData.paymentMethod} (Pagado)`;
        const commentSection = purchaseData.comment ? `\n--- Comentario ---\n${purchaseData.comment}\n` : '';

        const receiptText = `
${title}
Fecha de Emisión: ${new Date().toLocaleString("es-ES")}

--- Pasajero ---
Nombre: ${purchaseData.name}
DNI: ${purchaseData.dni}
Email: ${purchaseData.email}

--- Vuelo ---
Número: ${flightData.number.toUpperCase()}
Origen: ${airportsData[state.selectedAirport]}
Destino: ${flightData.destination}
Salida: ${flightData.depDate} ${flightData.depTime}
Llegada: ${flightData.arrDate} ${flightData.arrTime}
Duración: ${flightData.duration}

--- Compra ---
Clase: ${purchaseData.passengerClass.charAt(0).toUpperCase() + purchaseData.passengerClass.slice(1).replace('_', ' ')}
Precio Final: ${purchaseData.finalPrice}
Método de Pago: ${paymentStatus}
${commentSection}
Gracias por volar con nosotros.
        `.trim().replace(/\n\n\n/g, '\n\n');

        const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `comprobante_vuelo_${flightData.number}.txt`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
    
    // --- FUNCIONES DE UTILIDAD ---
    function getPaymentDeadline(date, time) {
        const d = new Date(`${date}T${time}`);
        if (isNaN(d)) return "N/A";
        d.setHours(d.getHours() - 2);
        return d.toLocaleString("es-ES", { timeStyle: "short" });
    }

    function setInvalid(input, message) {
        const formGroup = input.parentElement;
        formGroup.classList.add("invalid");
        formGroup.classList.remove("valid");
        formGroup.querySelector(".error-message").textContent = message;
    }

    function setValid(input) {
        const formGroup = input.parentElement;
        formGroup.classList.remove("invalid");
        formGroup.classList.add("valid");
    }

    function isValidDNI(dni) {
        return /^[0-9]{8}[A-Za-z]$/.test(dni.trim());
    }

    function validateDNIField(input) {
        isValidDNI(input.value) ? setValid(input) : setInvalid(input, "DNI no válido (ej: 12345678A).");
    }

    function validateRequiredField(input, message) {
        input.value.trim() !== "" ? setValid(input) : setInvalid(input, message);
    }

    // --- ATALHOS DE TECLADO Y CIERRE DE MODALES ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            infoPopup.classList.remove('visible');
            if (purchaseModal.classList.contains('visible')) {
                closePurchaseModal();
            }
        }
    });
    purchaseModal.addEventListener('click', (e) => {
        if (e.target === purchaseModal) {
            closePurchaseModal();
        }
    });

    // --- EJECUTAR INICIALIZACIÓN ---
    init();
});
