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
        flights: [], // La lista de vuelos que se está mostrando actualmente
        sampleFlights: [], // Una copia de solo los vuelos de ejemplo
        userAddedFlights: [], // Una lista separada para los vuelos del usuario
        selectedAirport: null,
        currentFlightForPurchase: null,
        showingSampleFlights: false // Controla si los vuelos de ejemplo están visibles
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
        state.userAddedFlights = []; // Resetea vuelos de usuario
        state.flights = []; // La lista de vuelos visibles comienza vacía
        state.showingSampleFlights = false;
        showFlightsBtn.innerHTML = '<i class="fas fa-list-ul"></i> Mostrar Todos';

        clearFilters();
        renderFlights([]); // Renderiza la lista vacía para mostrar el mensaje inicial
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
            // Al mostrar, combina los de ejemplo con los del usuario
            state.flights = [...state.sampleFlights, ...state.userAddedFlights];
            showFlightsBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Todos';
        } else {
            // Al ocultar, muestra solo los del usuario
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
            { id: 1, number: 'IB501', company: 'Iberia', destination: 'Madrid', depDate: formatDate(tomorrow), depTime: '10:00', arrDate: formatDate(tomorrow), arrTime: '11:15', duration: '1h 15m' },
            { id: 2, number: 'IB505', company: 'Iberia', destination: 'Valencia', depDate: formatDate(tomorrow), depTime: '12:00', arrDate: formatDate(tomorrow), arrTime: '13:20', duration: '1h 20m' },
            { id: 3, number: 'VY210', company: 'Vueling', destination: 'Barcelona', depDate: formatDate(tomorrow), depTime: '11:30', arrDate: formatDate(tomorrow), arrTime: '12:45', duration: '1h 15m' },
            { id: 4, number: 'UX330', company: 'Air Europa', destination: 'Barcelona', depDate: formatDate(tomorrow), depTime: '14:00', arrDate: formatDate(tomorrow), arrTime: '15:10', duration: '1h 10m' },
            { id: 5, number: 'FR112', company: 'Ryanair', destination: 'Oporto', depDate: formatDate(tomorrow), depTime: '18:00', arrDate: formatDate(tomorrow), arrTime: '19:00', duration: '1h 00m' },
            { id: 6, number: 'EZ888', company: 'EasyJet', destination: 'Londres', depDate: formatDate(tomorrow), depTime: '18:00', arrDate: formatDate(tomorrow), arrTime: '19:30', duration: '2h 30m' },
            { id: 7, number: 'LH610', company: 'Lufthansa', destination: 'Frankfurt', depDate: formatDate(tomorrow), depTime: '07:00', arrDate: formatDate(tomorrow), arrTime: '09:30', duration: '2h 30m' },
            { id: 8, number: 'AE444', company: 'Air Europa', destination: 'París', depDate: formatDate(tomorrow), depTime: '07:15', arrDate: formatDate(tomorrow), arrTime: '09:30', duration: '2h 15m' },
        ];
    }

    // --- AÑADIR VUELO ---
    function handleAddFlightSubmit(e) {
        e.preventDefault();

        const newFlight = {
            id: Date.now(),
            number: document.getElementById('flight-number').value.trim(),
            company: companyInput.value.trim(),
            destination: document.getElementById('destination').value.trim(),
            depDate: document.getElementById('departure-date').value,
            depTime: document.getElementById('departure-time').value,
            arrDate: document.getElementById('arrival-date').value,
            arrTime: document.getElementById('arrival-time').value,
            duration: calculateFlightDuration(
                document.getElementById('departure-date').value,
                document.getElementById('departure-time').value,
                document.getElementById('arrival-date').value,
                document.getElementById('arrival-time').value
            ),
            isNew: true
        };

        if (!newFlight.number || !newFlight.company || !newFlight.destination || !newFlight.depDate || !newFlight.depTime || !newFlight.arrDate || !newFlight.arrTime) {
            return alert("Por favor, rellene todos los campos.");
        }

        if (newFlight.duration.includes("Error")) {
            return alert("La fecha de llegada no puede ser anterior a la de salida.");
        }

        state.userAddedFlights.push(newFlight); // Añade el vuelo a la lista persistente de usuario
        
        // Actualiza la lista visible para que el nuevo vuelo aparezca
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

        // Determina la lista base sobre la que se va a filtrar
        let sourceFlights;
        if (state.showingSampleFlights) {
             sourceFlights = [...state.sampleFlights, ...state.userAddedFlights];
        } else {
             sourceFlights = [...state.userAddedFlights];
        }

        let filteredFlights = sourceFlights;
        
        // Aplica cada filtro de forma consecutiva
        if (destination) {
            filteredFlights = filteredFlights.filter(flight =>
                flight.destination.toLowerCase().includes(destination)
            );
        }

        if (arrivalTime) {
            filteredFlights = filteredFlights.filter(flight =>
                flight.arrTime === arrivalTime
            );
        }

        if (company) {
            filteredFlights = filteredFlights.filter(flight =>
                flight.company.toLowerCase().includes(company)
            );
        }
        
        // Actualiza la lista visible con los resultados del filtro
        state.flights = filteredFlights;
        renderFlights(state.flights);
    }

    // --- RENDERIZAR LISTA DE VUELOS ---
    function renderFlights(flightsToDisplay) {
        flightList.innerHTML = '';

        if (flightsToDisplay.length === 0) {
            let message = "Añada un vuelo o pulse 'Mostrar Todos'.";
            // Lógica de mensaje mejorada
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
                setTimeout(() => {
                    li.classList.remove('new-item');
                    delete flight.isNew;
                }, 500);
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

    // --- CÁLCULO DE DURACIÓN DEL VUELO ---
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

    // --- MODAL DE COMPRA Y FUNCIONES ASOCIADAS (sin cambios) ---
    function openPurchaseModal(){purchaseModal.innerHTML=createPurchaseFormHTML();purchaseModal.classList.add("visible");let e=!1;const t=purchaseModal.querySelector("#ticket-form");t.addEventListener("submit",handlePurchaseSubmit),purchaseModal.querySelector(".close-button").addEventListener("click",closePurchaseModal),t.querySelectorAll('input[name="payment-method"]').forEach(t=>{t.addEventListener("change",()=>{t.checked&&"Efectivo"===t.value&&!e&&(infoPopup.classList.add("visible"),e=!0)})}),["passenger-name","passenger-email","passenger-dni"].forEach(e=>{const o=t.querySelector(`#${e}`);o.addEventListener("input",()=>"passenger-dni"===e?validateDNIField(o):validateRequiredField(o,"Este campo es obligatorio."))}),t.querySelector("#passenger-name").focus()}
    function handlePurchaseSubmit(e){e.preventDefault();const t=e.target,o=t.querySelector("#passenger-name").value.trim(),a=t.querySelector("#passenger-email").value.trim(),r=t.querySelector("#passenger-dni").value.trim(),n=t.querySelector('input[name="payment-method"]:checked');let i=!0;o||(setInvalid(t.querySelector("#passenger-name"),"El nombre es obligatorio."),i=!1),a||(setInvalid(t.querySelector("#passenger-email"),"El email es obligatorio."),i=!1),isValidDNI(r)||(setInvalid(t.querySelector("#passenger-dni"),"Formato de DNI no válido."),i=!1),n||(alert("Seleccione un método de pago."),i=!1),i&&showPurchaseSuccessScreen({name:o,email:a,dni:r,paymentMethod:n.value})}
    const closePurchaseModal=()=>{purchaseModal.classList.remove("visible"),purchaseModal.innerHTML=""};
    function createPurchaseFormHTML(){const e=state.currentFlightForPurchase;return`
            <div class="modal-content">
                <button class="close-button" title="Cerrar">×</button>
                <h2 id="modal-title"><i class="fas fa-shopping-cart"></i>Confirmar Compra</h2>
                <p><strong>Vuelo:</strong> ${e.number.toUpperCase()} a ${e.destination}</p>
                <p><strong>Salida:</strong> <i class="fas fa-calendar-alt"></i>${e.depDate} <i class="fas fa-clock"></i>${e.depTime} | <strong>Duración:</strong> <i class="fas fa-hourglass-half"></i>${e.duration}</p>
                <form id="ticket-form" novalidate>
                    <div class="form-group"><label for="passenger-name">Nombre Completo</label><input type="text" id="passenger-name" required><div class="error-message"></div></div>
                    <div class="form-group"><label for="passenger-email">Correo Electrónico</label><input type="email" id="passenger-email" required><div class="error-message"></div></div>
                    <div class="form-group"><label for="passenger-dni">DNI</label><input type="text" id="passenger-dni" required placeholder="12345678A"><div class="error-message"></div></div>
                    <fieldset class="form-group">
                        <legend>Método de Pago</legend>
                        <label><input type="radio" name="payment-method" value="Efectivo" required> Efectivo</label>
                        <label><input type="radio" name="payment-method" value="Tarjeta"> Tarjeta</label>
                        <label><input type="radio" name="payment-method" value="PayPal"> PayPal</label>
                        <label><input type="radio" name="payment-method" value="Bizum"> Bizum</label>
                    </fieldset>
                    <button type="submit" class="cta-button" style="margin-top: 1rem;"><i class="fas fa-check-circle"></i>Confirmar y Comprar</button>
                </form>
            </div>`}
    function showPurchaseSuccessScreen(e){const t="Efectivo"===e.paymentMethod,o=t?'<i class="fas fa-clock popup-icon" style="color:var(--info-color);"></i>':'<i class="fas fa-check-circle popup-icon" style="color:var(--success-color);"></i>',a=t?"¡Reserva Confirmada!":"¡Compra Realizada con Éxito!",r=t?`<p>Pague en nuestro mostrador antes de las <strong>${getPaymentDeadline(state.currentFlightForPurchase.depDate,state.currentFlightForPurchase.depTime)}</strong>.</p>`:`<p>Se ha enviado una confirmación a <strong>${e.email}</strong>.</p>`,n=t?"Descargar Reserva":"Descargar Compra";purchaseModal.innerHTML=`<div class="modal-content" style="text-align: center;"><button class="close-button" title="Cerrar">×</button>${o}<h2>${a}</h2><p>Gracias, <strong>${e.name}</strong>.</p>${r}<button id="download-receipt-btn" class="cta-button"><i class="fas fa-download"></i>${n}</button></div>`,purchaseModal.querySelector(".close-button").addEventListener("click",closePurchaseModal),purchaseModal.querySelector("#download-receipt-btn").addEventListener("click",()=>{generateAndDownloadReceipt(e,state.currentFlightForPurchase),closePurchaseModal()})}
    function generateAndDownloadReceipt(e,t){const o="Efectivo"===e.paymentMethod,a=`==== ${o?"COMPROBANTE DE RESERVA":"COMPROBANTE DE COMPRA"} ====`,r=o?"Efectivo (Pendiente de pago en aeropuerto)":`${e.paymentMethod} (Pagado)`,n=`${a}\nFecha de Emisión: ${new Date().toLocaleString("es-ES")}\n\n--- Pasajero ---\nNombre: ${e.name}\nDNI: ${e.dni}\nEmail: ${e.email}\n\n--- Vuelo ---\nNúmero: ${t.number.toUpperCase()}\nOrigen: ${airportsData[state.selectedAirport]}\nDestino: ${t.destination}\nSalida: ${t.depDate} ${t.depTime}\nLlegada: ${t.arrDate} ${t.arrTime}\nDuración: ${t.duration}\n\n--- Pago ---\nMétodo: ${r}\n\nGracias por volar con nosotros.`,i=new Blob([n.trim()],{type:"text/plain;charset=utf-8"}),l=document.createElement("a");l.href=URL.createObjectURL(i),l.download=`comprobante_vuelo_${t.number}.txt`,l.click(),URL.revokeObjectURL(l.href)}
    function getPaymentDeadline(e,t){const o=new Date(`${e}T${t}`);return isNaN(o)?"N/A":(o.setHours(o.getHours()-2),o.toLocaleString("es-ES",{timeStyle:"short"}))}
    function setInvalid(e,t){const o=e.parentElement;o.classList.add("invalid"),o.classList.remove("valid"),o.querySelector(".error-message").textContent=t}
    function setValid(e){const t=e.parentElement;t.classList.remove("invalid"),t.classList.add("valid")}
    function isValidDNI(e){return/^[0-9]{8}[A-Za-z]$/.test(e.trim())}
    function validateDNIField(e){isValidDNI(e.value)?setValid(e):setInvalid(e,"DNI no válido (ej: 12345678A).")}
    function validateRequiredField(e,t){""!==e.value.trim()?setValid(e):setInvalid(e,t)}

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
