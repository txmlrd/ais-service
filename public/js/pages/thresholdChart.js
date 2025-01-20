// Data threshold untuk anotasi
const thresholds = [
  { label: "Superior Boundary", value: 15709.75574, color: "rgb(255, 99, 132)" },
  { label: "Lower Boundary", value: 19017.07274, color: "rgb(54, 162, 235)" },
  { label: "Required", value: 20670.73124, color: "rgb(75, 192, 192)" },
  { label: "Upper Boundary", value: 23564.63361, color: "rgb(153, 102, 255)" },
  { label: "Inferior Boundary", value: 26871.95061, color: "rgb(255, 206, 86)" },
];

// Ambil konteks canvas
var ctx = document.getElementById("myChart").getContext("2d");

// Buat chart
var myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    datasets: [
      {
        label: "",
        borderColor: "blue",
        borderWidth: 2,
        fill: false,
        data: [15000, 17000, 19000, 20000, 21000, 23000, 24000, 26000, 28000, 29000, 30000, 31000],
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      annotation: {
        annotations: thresholds.reduce((acc, threshold, index) => {
          acc[`line${index}`] = {
            type: "line",
            yMin: threshold.value,
            yMax: threshold.value,
            borderColor: threshold.color,
            borderWidth: 2,
            label: {
              enabled: true, // Aktifkan label
              content: threshold.label, // Gunakan label dari data threshold
              position: "start", // Posisi label (start, center, end)
              backgroundColor: "rgba(0,0,0,0.7)", // Warna latar label
              color: "#fff", // Warna teks label
              padding: 4, // Padding label
              font: {
                size: 10, // Ukuran font
                weight: "bold",
              },
            },
          };
          return acc;
        }, {}),
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  },
});

const legendContainer = document.getElementById("legend");
thresholds.forEach((threshold) => {
  const legendItem = document.createElement("div");
  legendItem.className = "legend-item";

  const legendColor = document.createElement("span");
  legendColor.className = "legend-color";
  legendColor.style.backgroundColor = threshold.color;

  const legendText = document.createElement("span");
  legendText.textContent = `${threshold.label}`;

  legendItem.appendChild(legendColor);
  legendItem.appendChild(legendText);
  legendContainer.appendChild(legendItem);
});
