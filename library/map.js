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

// WebSocket untuk menerima data secara real-time
const socket = new WebSocket("ws://167.71.197.48:8080");
// const socket = new WebSocket("ws://localhost:8080");

// Menyimpan data kapal dari file JSON
let shipData = {}; // Tempat untuk menyimpan data kapal

// Fungsi untuk memuat data kapal dari JSON
function loadShipData() {
  fetch("public/test.ship.json") // Ganti dengan path file JSON Anda
    .then((response) => response.json())
    .then((data) => {
      // Simpan data kapal berdasarkan MMSI
      shipData = data.reduce((acc, item) => {
        acc[item.MMSI] = item; // Menyimpan data berdasarkan MMSI
        return acc;
      }, {});
      console.log("Data kapal berhasil dimuat");
    })
    .catch((error) => console.error("Error memuat data kapal:", error));
}

// Panggil fungsi untuk memuat data kapal
loadShipData();

// Inisialisasi objek marker
var markers = {};

// Fungsi untuk mendapatkan ikon kapal berdasarkan kategori
function getShipIcon(category) {
  // Memperbaiki kategori dengan pencocokan substring yang lebih fleksibel
  if (category.match(/Tanker|Barge|Crude|LNG|LPG/)) {
    return "assets/kapalsvg/cargo.svg";
  } else if (category.match(/Cruise|Passenger|Troop|Crew/)) {
    return "assets/kapalsvg/cruise.svg";
  } else if (category.match(/Support|Utility|Tug|Pilot|Tow/)) {
    return "assets/kapalsvg/support.svg";
  } else if (category.match(/Cargo|Bulk Carrier|Container/)) {
    return "assets/kapalsvg/tanker.svg";
  } else if (category.match(/Special/)) {
    return "assets/kapalsvg/special.svg";
  }
  return "assets/kapalsvg/unknown.svg"; // Default ikon
}

// Fungsi untuk menampilkan popup dengan data kapal
function createPopupContent(message, ship, formattedDate) {
  return `
    <strong>Ship Name:</strong> ${ship.NAME || "-"}<br>
    <strong>Negara :</strong> ${ship.FLAGNAME || "-"}<br>
    <strong>MMSI:</strong> ${message.mmsi || "-"}<br>
    <strong>Type:</strong> ${ship.TYPENAME || "-"}<br>
    <strong>Speed (SOG):</strong> ${message.sog || "0"} knots<br>
    <strong>Course (COG):</strong> ${message.cog || "0"}°<br>
    <strong>Latitude:</strong> ${message.lat || "-"}<br>
    <strong>Longitude:</strong> ${message.lon || "-"}<br>
    <strong>Timestamp :</strong> ${formattedDate || "-"}<br>
    <strong>CII :</strong> ${message.cii || "-"}<br>
  `;
}

// WebSocket untuk menangani data kapal real-time
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const message = data.message.data;
  const timestamp = data.timestamp;
  const date = new Date(timestamp);

  // Extract components
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Format into desired string
  const formattedDate = `${day}:${month}:${year}, ${hours}:${minutes}:${seconds}`;
  const ship = shipData[message.mmsi];

  if (ship) {
    const shipCategory = ship.TYPENAME || "Unknown";
    const iconUrl = getShipIcon(shipCategory);

    if (!markers[message.mmsi]) {
      // Marker baru
      markers[message.mmsi] = L.marker([message.lat, message.lon], {
        icon: L.icon({
          iconUrl: iconUrl,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        }),
        rotationAngle: message.cog,
        rotationOrigin: "center center",
      })
        .addTo(map)
        .bindPopup(createPopupContent(message, ship, formattedDate))
        .on("popupopen", () => {
          openPopupMarker = markers[message.mmsi];
        })
        .on("popupclose", () => {
          if (openPopupMarker === markers[message.mmsi]) {
            openPopupMarker = null;
          }
        });
    } else {
      // Update marker posisi dan rotasi
      markers[message.mmsi].setLatLng([message.lat, message.lon]);
      if (message.cog) {
        markers[message.mmsi].setRotationAngle(message.cog);
      }

      // Update konten popup jika popup terbuka untuk marker ini
      if (openPopupMarker === markers[message.mmsi]) {
        const newPopupContent = createPopupContent(message, ship, formattedDate);
        openPopupMarker.getPopup().setContent(newPopupContent);
      }
    }
  } else {
    console.warn(`Data kapal dengan MMSI ${message.mmsi} tidak ditemukan`);
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

// Menampilkan koordinat saat mouse bergerak di peta
map.addEventListener("mousemove", (event) => {
  let lat = Math.round(event.latlng.lat * 100000) / 100000;
  let lng = Math.round(event.latlng.lng * 100000) / 100000;

  $("#cursorLat").html("DMS : " + geolib.decimalToSexagesimal(lat) + " | Decimal : " + lat);
  $("#cursorLon").html("DMS : " + geolib.decimalToSexagesimal(lng) + " | Decimal : " + lng);
});
