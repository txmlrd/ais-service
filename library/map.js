// const geolib = require('geolib');

var targetElHome = document.getElementById("HomeModal");
var targetElWarning = document.getElementById("warningModal");
var targetElDanger = document.getElementById("dangerModal");
let targetElLegend = document.getElementById("legendModal");
let targetElTrackShip = document.getElementById("trackShipModal");

// options with default values
const options = {
  placement: "center",
  backdropClasses: "bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40",
  onHide: () => {
    console.log("modal is hidden");
  },
  onShow: () => {
    console.log("modal is shown");
  },
  onToggle: () => {
    console.log("modal has been toggled");
  },
};

const modalHome = new Modal(targetElHome, options);
const modalwarning = new Modal(targetElWarning, options);
const modaldanger = new Modal(targetElDanger, options);
const modallegend = new Modal(targetElLegend, options);
const modaltrackship = new Modal(targetElTrackShip, options);

// Inisialisasi peta
let map = L.map("map", {
  maxZoom: 14,
  minZoom: 9,
  zoomControl: false,
  dragging: true,
  scrollWheelZoom: "center",
}).setView([-6.604953643975304, 112.75182319267172], 12);

// Menambahkan tile layer untuk OpenStreetMap
var open_street_map = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Inisialisasi objek marker
var markers = {};

// WebSocket untuk menerima data secara real-time
const socket = new WebSocket("ws://localhost:8080");

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const message = data.message.data;

  // Fungsi untuk menampilkan '-' jika nilai kosong atau undefined
  const safeValue = (value) => (value ? value : "-");

  // Membuat konten popup dengan informasi kapal
  const popupContent = `
    <strong>Ship Name:</strong> ${safeValue(message.shipname)}<br>
    <strong>MMSI:</strong> ${safeValue(message.mmsi)}<br>
    <strong>Callsign:</strong> ${safeValue(message.callsign)}<br>
    <strong>IMO:</strong> ${safeValue(message.imo)}<br>
    <strong>Cargo:</strong> ${safeValue(message.cargo)}<br>
    <strong>Destination:</strong> ${safeValue(message.destination)}<br>
    <strong>ETA:</strong> ${safeValue(`${message.etaDay}-${message.etaMo} ${message.etaHr}:${message.etaMin}`)}<br>
    <strong>Draught:</strong> ${safeValue(message.draught)} m<br>
    <strong>Dimensions:</strong> ${safeValue(`${message.dimA}m x ${message.dimB}m`)}<br>
    <strong>Ship Length:</strong> ${safeValue(message.length)} m<br>
    <strong>Ship Width:</strong> ${safeValue(message.width)} m
  `;

  // Mengecek apakah marker dengan MMSI tertentu sudah ada
  if (!markers[message.mmsi]) {
    // Jika marker belum ada, buat marker baru dan tambahkan ke peta
    markers[message.mmsi] = L.marker([message.lat, message.lon], {
      icon: L.icon({
        iconUrl: "public/assets/svg/navigasi.svg",
        iconSize: [50, 100],
        iconAnchor: [25, 100],
      }),
    })
      .addTo(map)
      .bindPopup(popupContent); // Menambahkan konten popup
  } else {
    // Jika marker sudah ada, update posisi marker
    markers[message.mmsi].setLatLng([message.lat, message.lon]);
  }
};

// Fungsi untuk membuka modal (contoh, sesuai dengan kode yang sudah ada)
function openHomeModal() {
  modalHome.show();
}
function closeHomeModal() {
  modalHome.hide();
}
// (Lanjutkan dengan fungsi lainnya yang sudah ada)

function openAlertModal() {
  modalwarning.show();
}
function closeWarningModal() {
  modalwarning.hide();
}
function openDangerModal() {
  modaldanger.show();
}

function closeDangerModal() {
  modaldanger.hide();
}
function openLegendModal() {
  modallegend.show();
}
function closeLegendModal() {
  modallegend.hide();
}

function openTrackShipModal() {
  modaltrackship.show();
}
function closeTrackShipModal() {
  modaltrackship.hide();
}

function reloadAWSPage() {
  location.reload();
}

function openCursorInfoModal() {
  $("#toast-default2").show();
}

function closeCursorInfoModal() {
  $("#toast-default2").hide();
}
function openlocation(lat, long) {
  map.setView([lat, long], 13);
}

map.addEventListener("mousemove", (event) => {
  let lat = Math.round(event.latlng.lat * 100000) / 100000;
  let lng = Math.round(event.latlng.lng * 100000) / 100000;

  $("#cursorLat").html("DMS : " + geolib.decimalToSexagesimal(lat) + " | Decimal : " + lat);
  $("#cursorLon").html("DMS : " + geolib.decimalToSexagesimal(lng) + " | Decimal : " + lng);
});
