const openWeatherApiKey = '9661f12cba9fe4f556aaaf8bab565237';
const esp32Endpoint = 'http://192.168.1.117/arduino-data'; 

// Função para obter localização e dados climáticos
function getWeatherData() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

             fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${openWeatherApiKey}`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('temperatura-ambiente').value = data.main.temp;
                    document.getElementById('probabilidade-chuva').value = data.clouds.all; // Percentual de nuvens como probabilidade de chuva
                    atualizarStatus();
                })
                .catch(err => console.error('Erro ao obter dados do clima:', err));
        });
    } else {
        alert("Geolocalização não suportada no navegador.");
    }
}

// Função para obter dados da ESP32
function getArduinoData() {
    fetch(esp32Endpoint)
        .then(response => response.json())
        .then(data => {
            document.getElementById('umidade').value = data.umidade;
            document.getElementById('temperatura-solo').value = data.temperatura;
            atualizarStatus();
        })
        .catch(err => console.error('Erro ao obter dados da ESP32:', err));
}

// Função para atualizar o status do ambiente
function atualizarStatus() {
    const umidade = parseFloat(document.getElementById('umidade').value || 0);
    const tempSolo = parseFloat(document.getElementById('temperatura-solo').value || 0);
    const tempAmbiente = parseFloat(document.getElementById('temperatura-ambiente').value || 0);
    const probChuva = parseFloat(document.getElementById('probabilidade-chuva').value || 0);

    let status = 'Ambiente favorável ao cultivo';
    if (umidade < 40 || tempSolo < 10 || tempAmbiente < 15 || probChuva > 80) {
        status = 'Ambiente desfavorável ao cultivo';
    }

    document.getElementById('status-text').textContent = status;
}

// Atualiza os dados periodicamente
setInterval(() => {
    getArduinoData();
    getWeatherData();
}, 5000); // Atualiza a cada 5 segundos