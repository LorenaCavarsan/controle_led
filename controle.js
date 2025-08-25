if (!('serial' in navigator)) {
  alert("Seu navegador não suporta Web Serial. Use Chrome/Edge no computador.");
}

let port = null, writer = null;

async function connect() {
  try {
    // Filtros ajudam a mostrar placas comuns (opcional)
    const filters = [
      { usbVendorId: 0x2341 }, // Arduino
      { usbVendorId: 0x1A86 }, // CH340 (clones)
      { usbVendorId: 0x0403 }, // FTDI
      { usbVendorId: 0x10C4 }  // CP210x
    ];
    port = await navigator.serial.requestPort({ filters });
    await port.open({ baudRate: 9600 });

    writer = port.writable.getWriter();

    setUi(true);
    setStatus("Conectado ✅");
  } catch (e) {
    alert("Não foi possível conectar: " + e);
    await cleanup();
  }
}

async function disconnect() {
  await cleanup();
  setUi(false);
  setStatus("Desconectado");
}

async function cleanup() {
  try { if (writer) { writer.releaseLock(); } } catch {}
  writer = null;
  try { if (port) { await port.close(); } } catch {}
  port = null;
}

async function send(val) {
  if (!writer) { 
    alert("Clique em Conectar primeiro!"); 
    return; 
  }
  try {
    const data = new TextEncoder().encode(val); // '1' ou '0'
    await writer.write(data);
  } catch (e) {
    alert("Falha ao enviar: " + e);
    await disconnect();
  }
}

function setUi(connected) {
  document.getElementById('btnOn').disabled        = !connected;
  document.getElementById('btnOff').disabled       = !connected;
  document.getElementById('btnDisconnect').disabled= !connected;
  document.getElementById('btnConnect').disabled   = connected;
}

function setStatus(t) { 
  document.getElementById('status').innerText = "Status: " + t; 
}

// Eventos dos botões
document.getElementById('btnConnect').addEventListener('click', connect);
document.getElementById('btnDisconnect').addEventListener('click', disconnect);
document.getElementById('btnOn').addEventListener('click', () => send('1'));
document.getElementById('btnOff').addEventListener('click', () => send('0'));

// Libera a porta ao fechar a aba
window.addEventListener('beforeunload', async () => { await cleanup(); });
