// Train Schedule Data
const trainsDatabase = [
  { number: "12004", name: "Lucknow Shatabdi", from: "New Delhi (NDLS)", to: "Lucknow Charbagh (LKO)", dep: "06:10 AM", arr: "12:55 PM", duration: "6h 45m" },
  { number: "12420", name: "Gomti Express", from: "New Delhi (NDLS)", to: "Lucknow Charbagh (LKO)", dep: "12:20 PM", arr: "09:30 PM", duration: "9h 10m" },
  { number: "12952", name: "Mumbai Rajdhani", from: "New Delhi (NDLS)", to: "Mumbai Central (MMCT)", dep: "04:55 PM", arr: "08:35 AM", duration: "15h 40m" },
  { number: "12138", name: "Punjab Mail", from: "Mumbai Central (MMCT)", to: "New Delhi (NDLS)", dep: "07:35 PM", arr: "05:15 AM", duration: "21h 40m" },
  { number: "12628", name: "Karnataka Express", from: "New Delhi (NDLS)", to: "Bengaluru City (SBC)", dep: "08:20 PM", arr: "12:00 PM", duration: "39h 40m" },
  { number: "12302", name: "Howrah Rajdhani", from: "New Delhi (NDLS)", to: "Kolkata Howrah (HWH)", dep: "04:50 PM", arr: "09:55 AM", duration: "17h 05m" }
];

// Set today's date as minimum date cleanly
const dateInput = document.getElementById("journeyDate");
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
const formattedToday = `${yyyy}-${mm}-${dd}`;
dateInput.min = formattedToday;
dateInput.value = formattedToday;

// App State
let activeTrain = null;
let activeDate = formattedToday;
let bookings = JSON.parse(localStorage.getItem("railEaseBookings")) || [];

// DOM Elements
const fromSelect = document.getElementById("fromStation");
const toSelect = document.getElementById("toStation");
const swapBtn = document.getElementById("swapBtn");
const searchForm = document.getElementById("searchForm");
const errorBanner = document.getElementById("errorBanner");
const trainResultsSection = document.getElementById("trainResultsSection");
const trainList = document.getElementById("trainList");
const routeBadge = document.getElementById("routeBadge");
const bookingSection = document.getElementById("bookingSection");
const selectedTrainBanner = document.getElementById("selectedTrainBanner");
const bookingForm = document.getElementById("bookingForm");
const travelClassSelect = document.getElementById("travelClass");
const seatCountInput = document.getElementById("seatCount");
const liveTotalFare = document.getElementById("liveTotalFare");
const bookedTicketsList = document.getElementById("bookedTicketsList");
const ticketCountBadge = document.getElementById("ticketCountBadge");

// Initial Render
renderTickets();

// Swap Stations
swapBtn.addEventListener("click", () => {
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
});

// Search Trains
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  errorBanner.classList.add("hidden");

  const from = fromSelect.value;
  const to = toSelect.value;
  activeDate = dateInput.value;

  if (from === to) {
    errorBanner.textContent = "Origin and destination stations cannot be the same.";
    errorBanner.classList.remove("hidden");
    return;
  }

  let results = trainsDatabase.filter(t => t.from === from && t.to === to);

  // Generate realistic trains for any station combination
  if (results.length === 0) {
    const shortFrom = from.split(" (")[0];
    const shortTo = to.split(" (")[0];
    results = [
      { number: "12801", name: `${shortFrom} Superfast`, from, to, dep: "07:30 AM", arr: "05:45 PM", duration: "10h 15m" },
      { number: "14502", name: `${shortTo} Duronto Express`, from, to, dep: "09:15 PM", arr: "07:00 AM", duration: "09h 45m" }
    ];
  }

  routeBadge.textContent = `${from} → ${to} • ${activeDate}`;
  renderTrainList(results);
});

function renderTrainList(trains) {
  trainList.innerHTML = "";
  trainResultsSection.classList.remove("hidden");
  bookingSection.classList.add("hidden");

  trains.forEach(train => {
    const card = document.createElement("div");
    card.className = "train-item";
    card.innerHTML = `
      <div>
        <div class="train-title">
          <span class="train-num">#${train.number}</span>
          <h3>${train.name}</h3>
        </div>
        <div class="train-time">
          <span>Departs: <strong>${train.dep}</strong></span>
          <span>• ${train.duration} •</span>
          <span>Arrives: <strong>${train.arr}</strong></span>
        </div>
      </div>
      <button class="btn btn-primary">Select Train</button>
    `;

    card.querySelector("button").addEventListener("click", () => openBooking(train));
    trainList.appendChild(card);
  });

  trainResultsSection.scrollIntoView({ behavior: "smooth" });
}

// Open Booking Section
function openBooking(train) {
  activeTrain = train;
  selectedTrainBanner.innerHTML = `
    <strong>${train.name} (#${train.number})</strong> &nbsp;|&nbsp; ${train.from} → ${train.to} &nbsp;|&nbsp; Date: <strong>${activeDate}</strong>
  `;
  updateFare();
  bookingSection.classList.remove("hidden");
  bookingSection.scrollIntoView({ behavior: "smooth" });
}

document.getElementById("closeBookingBtn").addEventListener("click", () => {
  bookingSection.classList.add("hidden");
});

// Live Fare Calculation
function updateFare() {
  const pricePerSeat = parseInt(travelClassSelect.value.split("|")[1], 10);
  const seats = parseInt(seatCountInput.value, 10) || 1;
  liveTotalFare.textContent = `₹${(pricePerSeat * seats).toLocaleString("en-IN")}`;
}

travelClassSelect.addEventListener("change", updateFare);
seatCountInput.addEventListener("input", updateFare);

// Confirm Booking
bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const passengerName = document.getElementById("passengerName").value.trim();
  const passengerAge = document.getElementById("passengerAge").value;
  const [coachClass, unitPrice] = travelClassSelect.value.split("|");
  const seats = parseInt(seatCountInput.value, 10);
  const totalAmount = parseInt(unitPrice, 10) * seats;

  const ticket = {
    pnr: "PNR" + Math.floor(1000000 + Math.random() * 9000000),
    train: `${activeTrain.name} (#${activeTrain.number})`,
    route: `${activeTrain.from} → ${activeTrain.to}`,
    timing: `${activeTrain.dep} - ${activeTrain.arr}`,
    date: activeDate,
    passenger: `${passengerName} (${passengerAge} yrs)`,
    coach: coachClass,
    seats: seats,
    amount: totalAmount.toLocaleString("en-IN")
  };

  bookings.unshift(ticket);
  localStorage.setItem("railEaseBookings", JSON.stringify(bookings));

  bookingForm.reset();
  seatCountInput.value = 1;
  bookingSection.classList.add("hidden");
  trainResultsSection.classList.add("hidden");

  renderTickets();
  showToast(`Ticket Confirmed! PNR: ${ticket.pnr}`);
});

// Render Booked Tickets
function renderTickets() {
  ticketCountBadge.textContent = `${bookings.length} ${bookings.length === 1 ? "Ticket" : "Tickets"}`;

  if (bookings.length === 0) {
    bookedTicketsList.innerHTML = `
      <div class="empty-state">
        <p>No tickets booked yet. Search for a train above to get started!</p>
      </div>
    `;
    return;
  }

  bookedTicketsList.innerHTML = "";
  bookings.forEach((ticket, index) => {
    const card = document.createElement("div");
    card.className = "ticket-card";
    card.innerHTML = `
      <div class="ticket-main">
        <div>
          <span class="pnr-tag">${ticket.pnr}</span>
          <span class="status-confirmed">● CONFIRMED</span>
        </div>
        <div class="ticket-route">${ticket.route}</div>
        <p class="ticket-meta"><strong>Train:</strong> ${ticket.train} &nbsp;|&nbsp; <strong>Date:</strong> ${ticket.date} (${ticket.timing})</p>
        <p class="ticket-meta"><strong>Passenger:</strong> ${ticket.passenger} &nbsp;|&nbsp; <strong>Class:</strong> ${ticket.coach} (${ticket.seats} Seat${ticket.seats > 1 ? "s" : ""})</p>
      </div>
      <div class="ticket-side">
        <div>
          <span style="font-size:0.8rem; color:#64748b;">TOTAL PAID</span>
          <div style="font-size:1.3rem; font-weight:700; color:#0f172a;">₹${ticket.amount}</div>
        </div>
        <button class="btn-cancel" data-index="${index}">Cancel Ticket</button>
      </div>
    `;

    card.querySelector(".btn-cancel").addEventListener("click", () => cancelTicket(index));
    bookedTicketsList.appendChild(card);
  });
}

// Cancel Ticket
function cancelTicket(index) {
  if (confirm("Cancel this reservation?")) {
    bookings.splice(index, 1);
    localStorage.setItem("railEaseBookings", JSON.stringify(bookings));
    renderTickets();
    showToast("Ticket cancelled.");
  }
}

// Toast Alert
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3200);
}
