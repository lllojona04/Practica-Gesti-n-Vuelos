document.addEventListener('DOMContentLoaded', () => {

    // --- REFERENCIAS AL DOM ---
    const airportSelect = document.getElementById('airport-select');
    const flightManagementSection = document.getElementById('flight-management-section');
    const airportNameTitle = document.getElementById('airport-name-title');
    const addFlightForm = document.getElementById('add-flight-form');
    const flightList = document.getElementById('flight-list');
    const noFlightsMessage = document.getElementById('no-flights-message');
    const purchaseModal = document.getElementById('purchase-modal');
    const infoPopup = document.getElementById('info-popup');
    const infoPopupClose = document.getElementById('info-popup-close');
    const showFlightsBtn = document.getElementById('show-flights-btn');

     // --- DATOS Y ESTADO ---
    const airportsData = {
        "Asturias": "Aeropuerto de Asturias", "Barcelona": "Aeropuerto Josep Tarradellas Barcelona-El Prat",
        "Bilbao": "Aeropuerto de Bilbao", "Madrid": "Aeropuerto Adolfo Suárez Madrid-Barajas",
        "Málaga": "Aeropuerto de Málaga-Costa del Sol", "Santander": "Aeropuerto Seve Ballesteros"
    };
    let state = { flights: [], selectedAirport: null, currentFlightForPurchase: null };
    
    // --- INICIALIZACIÓN ---
    function init() {
        populateAirportSelector();
        setupEventListeners();
    }

    function populateAirportSelector() {
        airportSelect.innerHTML = '<option value="" disabled selected>-- Elija un aeropuerto --</option>';
        Object.keys(airportsData).forEach(key => {
            const option = document.createElement("option");
            option.value = key; option.textContent = key;
            airportSelect.appendChild(option);
        });
    }
    
    function setupEventListeners() {
        airportSelect.addEventListener('change', handleAirportChange);
        addFlightForm.addEventListener('submit', handleAddFlightSubmit);
        infoPopupClose.addEventListener('click', () => infoPopup.classList.remove('visible'));
        showFlightsBtn.addEventListener('click', renderFlights);
    }

    // --- MANEJADORES DE EVENTOS ---
    function handleAirportChange() {
        state.selectedAirport = airportSelect.value;
        if (state.selectedAirport) {
            airportNameTitle.innerHTML = `<i class="fas fa-plane-departure"></i> ${airportsData[state.selectedAirport]}`;
            flightManagementSection.classList.remove('hidden');
            flightManagementSection.classList.add('fade-in');
            state.flights = [];
            flightList.innerHTML = '';
            noFlightsMessage.textContent = 'No hay vuelos para mostrar. Añada un vuelo y luego pulse "Mostrar Vuelos".';
            noFlightsMessage.classList.remove('hidden');
            addFlightForm.reset();
            addFlightForm.querySelector('input').focus();
        } else {
             flightManagementSection.classList.add('hidden');
        }
    }

    function handleAddFlightSubmit(e) {
        e.preventDefault();
        const depDate = document.getElementById('departure-date').value, depTime = document.getElementById('departure-time').value,
              arrDate = document.getElementById('arrival-date').value, arrTime = document.getElementById('arrival-time').value;
        const newFlight = {
            id: Date.now(), number: document.getElementById('flight-number').value.trim(), destination: document.getElementById('destination').value.trim(),
            depDate, depTime, arrDate, arrTime, duration: calculateFlightDuration(depDate, depTime, arrDate, arrTime), isNew: true
        };
        if (Object.values(newFlight).some(v => v === "" || v === null)) return alert("Por favor, rellene todos los campos.");
        if (newFlight.duration.includes("Error")) return alert("La fecha de llegada no puede ser anterior a la de salida.");
        
        state.flights.push(newFlight);
        alert(`Vuelo ${newFlight.number.toUpperCase()} añadido correctamente.\nPulse "Mostrar Vuelos" para actualizar la lista.`);
        addFlightForm.reset();
        document.getElementById('flight-number').focus();
    }

    // --- RENDERIZADO DEL DOM ---
    function renderFlights() {
        flightList.innerHTML = '';
        const flightsToDisplay = state.flights;

        if (flightsToDisplay.length === 0) {
            noFlightsMessage.textContent = "No hay vuelos programados. Añada uno para empezar.";
            noFlightsMessage.classList.remove('hidden');
        } else {
            noFlightsMessage.classList.add('hidden');
        }
        
        flightsToDisplay.forEach(flight => {
            const li = document.createElement('li');
            li.className = 'flight-card';
            if (flight.isNew) {
                li.classList.add('new-item');
                delete flight.isNew;
            }
            li.innerHTML = `
                <div class="flight-main-info">
                    <h4>Vuelo ${flight.number.toUpperCase()}</h4>
                    <div class="flight-route">
                        <span>${state.selectedAirport}</span> <i class="fas fa-plane"></i> <span>${flight.destination}</span>
                    </div>
                    <div class="flight-details-grid">
                        <div class="detail-item"><i class="fas fa-calendar-alt"></i> ${flight.depDate}</div>
                        <div class="detail-item"><i class="fas fa-clock"></i> ${flight.depTime}</div>
                        <div class="detail-item"><i class="fas fa-hourglass-half"></i> ${flight.duration}</div>
                    </div>
                </div>
                <div class="flight-actions">
                    <button class="buy-button" data-flight-id="${flight.id}"><i class="fas fa-ticket-alt"></i>Comprar Billete</button>
                </div>
            `;
            li.querySelector('.buy-button').addEventListener('click', () => {
                state.currentFlightForPurchase = flight;
                openPurchaseModal();
            });
            flightList.appendChild(li);
        });
    }

    // --- LÓGICA DEL MODAL DE COMPRA Y FUNCIONES DE UTILIDAD ---
    function handlePurchaseSubmit(e){e.preventDefault();const t=e.target,o=t.querySelector("#passenger-name").value.trim(),a=t.querySelector("#passenger-email").value.trim(),r=t.querySelector("#passenger-dni").value.trim(),n=t.querySelector('input[name="payment-method"]:checked');let i=!0;o||(setInvalid(t.querySelector("#passenger-name"),"El nombre es obligatorio."),i=!1),a||(setInvalid(t.querySelector("#passenger-email"),"El email es obligatorio."),i=!1),isValidDNI(r)||(setInvalid(t.querySelector("#passenger-dni"),"Formato de DNI no válido."),i=!1),n||(alert("Seleccione un método de pago."),i=!1),i&&showPurchaseSuccessScreen({name:o,email:a,dni:r,paymentMethod:n.value})}
    function openPurchaseModal(){purchaseModal.innerHTML=createPurchaseFormHTML(),purchaseModal.classList.add("visible");let e=!1;const t=purchaseModal.querySelector("#ticket-form");t.addEventListener("submit",handlePurchaseSubmit),purchaseModal.querySelector(".close-button").addEventListener("click",closePurchaseModal),t.querySelectorAll('input[name="payment-method"]').forEach(t=>{t.addEventListener("change",()=>{t.checked&&"Efectivo"===t.value&&!e&&(infoPopup.classList.add("visible"),e=!0)})}),["passenger-name","passenger-email","passenger-dni"].forEach(e=>{const o=t.querySelector(`#${e}`);o.addEventListener("input",()=>"passenger-dni"===e?validateDNIField(o):validateRequiredField(o,"Este campo es obligatorio."))}),t.querySelector("#passenger-name").focus()}
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
    function generateAndDownloadReceipt(e,t){const o="Efectivo"===e.paymentMethod,a=`==== ${o?"COMPROBANTE DE RESERVA":"COMPROBANTE DE COMPRA"} ====`,r=o?"Efectivo (Pendiente de pago en aeropuerto)":`${e.paymentMethod} (Pagado)`,n=`${a}\nFecha de Emisión: ${new Date().toLocaleString("es-ES")}\n\n--- Pasajero ---\nNombre: ${e.name}\nDNI: ${e.dni}\nEmail: ${e.email}\n\n--- Vuelo ---\nNúmero: ${t.number.toUpperCase()}\nOrigen: ${airportsData[state.selectedAirport]}\nDestino: ${t.destination}\nSalida: ${t.depDate} ${t.depTime}\nLlegada: ${t.arrDate} ${t.arrTime}\nDuración: ${t.duration}\n\n--- Pago ---\nMétodo: ${r}\n\nGracias por volar con nosotros.`,i=new Blob([n.trim()],{type:"text/plain;charset=utf-8"}),l=document.createElement("a");l.href=URL.createObjectURL(i),l.download=`comprobante_vuelo_${t.number}.txt`,l.click(),URL.revokeObjectURL(l.href)}const calculateFlightDuration=(e,t,o,a)=>{const r=new Date(`${e}T${t}`),n=new Date(`${o}T${a}`);if(isNaN(r)||isNaN(n))return"N/A";let i=n-r;if(i<0)return"Error";const l=Math.floor(i/36e5),s=Math.floor(i%36e5/6e4);return`${l}h ${s}m`},getPaymentDeadline=(e,t)=>{const o=new Date(`${e}T${t}`);return isNaN(o)?"N/A":(o.setHours(o.getHours()-2),o.toLocaleString("es-ES",{timeStyle:"short"}))},isValidDNI=e=>/^[0-9]{8}[A-Za-z]$/.test(e.trim()),setInvalid=(e,t)=>{const o=e.parentElement;o.classList.add("invalid"),o.classList.remove("valid"),o.querySelector(".error-message").textContent=t},setValid=e=>{const t=e.parentElement;t.classList.remove("invalid"),t.classList.add("valid")},validateDNIField=e=>isValidDNI(e.value)?setValid(e):setInvalid(e,"DNI no válido (ej: 12345678A)."),validateRequiredField=(e,t)=>""!==e.value.trim()?setValid(e):setInvalid(e,t);document.addEventListener("keydown",e=>{"Escape"===e.key&&(infoPopup.classList.remove("visible"),purchaseModal.classList.contains("visible")&&closePurchaseModal())}),purchaseModal.addEventListener("click",e=>{e.target===purchaseModal&&closePurchaseModal()});

    init();
});