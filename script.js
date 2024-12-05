const openWeatherApiKey = '9661f12cba9fe4f556aaaf8bab565237';
const esp32Endpoint = 'http://10.172.181.110/arduino-data';

// Função para obter dados do Arduino (ESP32)
function getArduinoData() {
    fetch(esp32Endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na resposta do servidor ESP32');
            }
            return response.json();
        })
        .then(data => {
            console.log('Dados recebidos do ESP32:', data); // Log para depuração
            // Atualiza os campos HTML com os dados recebidos
            document.getElementById('umidade').value = data.umidade.toFixed(2); // Formata com 2 casas decimais
            document.getElementById('temperatura-solo').value = data.temperatura.toFixed(2); // Formata com 2 casas decimais
            atualizarStatus(); // Atualiza o status do ambiente com base nos novos dados
        })
        .catch(err => console.error('Erro ao obter dados da ESP32:', err));
}

// Função para obter dados climáticos usando OpenWeather API
function getWeatherData() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${openWeatherApiKey}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro na resposta da OpenWeather API');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Dados climáticos recebidos:', data); // Log para depuração
                    // Atualiza os campos HTML com os dados climáticos
                    document.getElementById('temperatura-ambiente').value = data.main.temp.toFixed(2); // Formata com 2 casas decimais
                    document.getElementById('probabilidade-chuva').value = data.clouds.all; // Percentual de nuvens
                    atualizarStatus(); // Atualiza o status do ambiente
                })
                .catch(err => console.error('Erro ao obter dados do clima:', err));
        });
    } else {
        alert("Geolocalização não suportada no navegador.");
    }
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

    // Atualiza o texto do status
    document.getElementById('status-text').textContent = status;
}

// Atualiza os dados periodicamente
setInterval(() => {
    getArduinoData(); // Obtém dados do Arduino
    getWeatherData(); // Obtém dados climáticos
}, 5000); // Atualiza a cada 5 segundos
