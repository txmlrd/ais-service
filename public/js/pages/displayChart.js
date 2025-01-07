// Variables for WebSocket and Chart.js
var currentFlowRate = 0; // Latest flow rate value
var previousFlowRateHistory = []; // Array for storing historical flow rate values
var timeLabels = []; // Array for storing time labels

// Initialize WebSocket connection
var flowRateWebSocket = new WebSocket("ws://146.190.111.176:1880/ws/flowrate");

flowRateWebSocket.onmessage = function (event) {
  try {
    var parsedData = JSON.parse(event.data);
    currentFlowRate = parseFloat(parsedData.flowRate.replace(/[^0-9.]/g, "")) || 0; // Extract valid flow rate

    // Add new data to arrays
    var currentTimestamp = new Date().toLocaleTimeString();
    previousFlowRateHistory.push(currentFlowRate);
    timeLabels.push(currentTimestamp);

    // Maintain data length (optional, adjust if needed)
    if (previousFlowRateHistory.length > 300) {
      // Example: Keep last 300 records
      previousFlowRateHistory.shift();
      timeLabels.shift();
    }

    // Update chart
    refreshFlowRateChart();
  } catch (error) {
    console.error("Error parsing WebSocket message:", error);
  }
};

// Initialize Chart.js chart
var canvasContext = document.getElementById("flowRateChartCanvas").getContext("2d");
var flowRateChartInstance = new Chart(canvasContext, {
  type: "line",
  data: {
    labels: timeLabels, // Time labels
    datasets: [
      {
        label: "Flow Rate (L/s)",
        data: previousFlowRateHistory,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
        tension: 0.4, // Smooth curve
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        title: {
          display: true,
          text: "Flow Rate (L/s)",
        },
        beginAtZero: true,
      },
    },
  },
});

// Function to update Chart.js chart
function refreshFlowRateChart() {
  flowRateChartInstance.data.labels = timeLabels;
  flowRateChartInstance.data.datasets[0].data = previousFlowRateHistory;
  flowRateChartInstance.update();
}
