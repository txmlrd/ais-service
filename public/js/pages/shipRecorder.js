// shipRecorder.js

const shipDataRecords = []; // Ganti dari recordedData ke shipDataRecords
let targetMMSI = null;
let isRecording = false; // Flag untuk menandakan apakah rekaman sedang aktif

// Fungsi untuk mulai merekam data
document.getElementById("startBtn").addEventListener("click", () => {
  targetMMSI = document.getElementById("mmsiInput").value.trim();
  if (!targetMMSI) {
    alert("Masukkan MMSI yang valid!");
    return;
  }

  isRecording = true;
  document.getElementById("startBtn").disabled = true;
  document.getElementById("stopBtn").disabled = false;
  document.getElementById("downloadBtn").disabled = false;

  console.log(`MMSI yang dipilih: ${targetMMSI}`);
});

// Fungsi untuk berhenti merekam data
document.getElementById("stopBtn").addEventListener("click", () => {
  isRecording = false;
  document.getElementById("startBtn").disabled = false;
  document.getElementById("stopBtn").disabled = true;
});

// Fungsi untuk memulai WebSocket dan menerima data
const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => {
  console.log("WebSocket is connected");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data); // Pastikan data dikirim dalam format JSON
  const message = data.message.data;
  const timestamp = data.timestamp;

  // Cek apakah MMSI dari data WebSocket sesuai dengan targetMMSI
  if (isRecording && message.mmsi && message.mmsi.toString() === targetMMSI) {
    // Menambahkan data ke dalam array
    const record = {
      mmsi: message.mmsi,
      lat: message.lat,
      lon: message.lon,
      timestamp: timestamp,
    };
    shipDataRecords.push(record);

    // Menampilkan data yang baru direkam di tabel
    const table = document.getElementById("dataTable").getElementsByTagName("tbody")[0];
    const row = table.insertRow();
    row.insertCell(0).textContent = record.mmsi;
    row.insertCell(1).textContent = record.lat;
    row.insertCell(2).textContent = record.lon;
    row.insertCell(3).textContent = record.timestamp;
  }
};

// Fungsi untuk mengunduh data CSV
document.getElementById("downloadBtn").addEventListener("click", () => {
  const csv = convertToCSV(shipDataRecords);
  const hiddenElement = document.createElement("a");
  hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
  hiddenElement.target = "_blank";
  hiddenElement.download = "ship_data.csv";
  hiddenElement.click();
});

// Fungsi untuk mengonversi data ke format CSV
function convertToCSV(data) {
  const headers = ["MMSI", "Latitude", "Longitude", "Timestamp"];
  const rows = data.map((record) => [record.mmsi, record.lat, record.lon, record.timestamp]);

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}
