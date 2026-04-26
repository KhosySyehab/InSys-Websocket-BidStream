const WS_URL = 'ws://localhost:8080';

const dom = {
  connPill: document.getElementById('conn-pill'),
  auctionId: document.getElementById('auction-id'),
  auctionState: document.getElementById('auction-state'),
  remainingSeconds: document.getElementById('remaining-seconds'),
  highestBidder: document.getElementById('highest-bidder'),
  highestAmount: document.getElementById('highest-amount'),
  eventLog: document.getElementById('event-log'),
  chart: document.getElementById('bid-chart'),
  username: document.getElementById('username'),
  password: document.getElementById('password'),
  itemId: document.getElementById('item-id'),
  duration: document.getElementById('duration'),
  joinAuctionId: document.getElementById('join-auction-id'),
  bidAmount: document.getElementById('bid-amount'),
  btnRegister: document.getElementById('btn-register'),
  btnLogin: document.getElementById('btn-login'),
  btnItems: document.getElementById('btn-items'),
  btnOpen: document.getElementById('btn-open'),
  btnFeedStart: document.getElementById('btn-feed-start'),
  btnFeedStop: document.getElementById('btn-feed-stop'),
  btnJoin: document.getElementById('btn-join'),
  btnBid: document.getElementById('btn-bid'),
  btnRoleAdmin: document.getElementById('btn-role-admin'),
  btnRoleBidder: document.getElementById('btn-role-bidder'),
  btnDemoAdmin: document.getElementById('btn-demo-admin'),
  btnDemoBidder: document.getElementById('btn-demo-bidder'),
};

let ws;
let token = '';
let bidSeries = [];
let latestAuctionId = '';

function now() {
  return new Date().toLocaleTimeString();
}

function requestId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logEvent(type, payload) {
  const li = document.createElement('li');
  li.textContent = `[${now()}] ${type} ${JSON.stringify(payload)}`;
  dom.eventLog.prepend(li);
  while (dom.eventLog.children.length > 80) {
    dom.eventLog.removeChild(dom.eventLog.lastChild);
  }
}

function formatRupiah(amount) {
  return `Rp${Number(amount || 0).toLocaleString('id-ID')}`;
}

function setState(rawState) {
  const state = String(rawState || 'PENDING').toUpperCase();
  dom.auctionState.textContent = state;
  dom.auctionState.className = `value state ${state.toLowerCase()}`;
}

function drawChart() {
  const ctx = dom.chart.getContext('2d');
  const w = dom.chart.width;
  const h = dom.chart.height;
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = '#0f1621';
  ctx.fillRect(0, 0, w, h);

  if (bidSeries.length < 2) return;

  const min = Math.min(...bidSeries);
  const max = Math.max(...bidSeries);
  const span = max - min || 1;

  ctx.beginPath();
  ctx.strokeStyle = '#2aa8ff';
  ctx.lineWidth = 2;

  bidSeries.forEach((v, i) => {
    const x = (i / (bidSeries.length - 1)) * (w - 20) + 10;
    const y = h - 10 - ((v - min) / span) * (h - 20);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

function send(type, payload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    logEvent('client.error', { message: 'WebSocket not connected' });
    return;
  }

  ws.send(
    JSON.stringify({
      type,
      requestId: requestId(type),
      payload,
    })
  );
}

function connect() {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    dom.connPill.textContent = 'Connected';
    dom.connPill.className = 'pill connected';
    logEvent('system.local', { message: `Connected to ${WS_URL}` });
  };

  ws.onclose = () => {
    dom.connPill.textContent = 'Disconnected';
    dom.connPill.className = 'pill disconnected';
    logEvent('system.local', { message: 'Socket closed, reconnect in 2s' });
    setTimeout(connect, 2000);
  };

  ws.onerror = () => {
    logEvent('system.local', { message: 'Socket error' });
  };

  ws.onmessage = (evt) => {
    let msg;
    try {
      msg = JSON.parse(evt.data);
    } catch {
      return;
    }

    const type = msg.type;
    const payload = msg.payload || {};
    logEvent(type, payload);

    if (type === 'auth.login.result' && payload.ok && payload.data?.token) {
      token = payload.data.token;
    }

    if (type === 'catalog.open_auction.result' && payload.ok && payload.data?.auction_id) {
      const auctionId = payload.data.auction_id;
      latestAuctionId = auctionId;
      dom.joinAuctionId.value = auctionId;
      dom.auctionId.textContent = auctionId;
      setState('OPEN');
    }

    if (type === 'catalog.get_items.result' && payload.ok && Array.isArray(payload.data?.items)) {
      const firstItem = payload.data.items[0];
      if (firstItem?.id && !dom.itemId.value.trim()) {
        dom.itemId.value = firstItem.id;
      }
    }

    if (type === 'catalog.event') {
      dom.auctionId.textContent = payload.auction_id || '-';
      const eventType = String(payload.event_type || '').toUpperCase();
      if (eventType.includes('OPENED')) setState('OPEN');
      if (eventType.includes('CLOSING')) setState('CLOSING');
      if (eventType.includes('CLOSED')) setState('CLOSED');
    }

    if (type === 'auction.update') {
      dom.auctionId.textContent = payload.auction_id || dom.auctionId.textContent;
      dom.highestBidder.textContent = payload.highest_bidder || '-';
      dom.highestAmount.textContent = formatRupiah(payload.highest_amount);
      dom.remainingSeconds.textContent = `${payload.remaining_seconds ?? '-'}s`;

      const eventType = String(payload.event_type || '').toUpperCase();
      if (eventType.includes('CLOSING')) setState('CLOSING');
      else if (eventType.includes('CLOSED')) setState('CLOSED');
      else setState('OPEN');

      const amount = Number(payload.highest_amount || 0);
      if (amount > 0) {
        bidSeries.push(amount);
        if (bidSeries.length > 40) bidSeries = bidSeries.slice(-40);
        drawChart();
      }
    }

    if (type === 'command.error') {
      logEvent('ui.alert', { level: 'error', message: payload.message });
    }
  };
}

function applyRole(role) {
  if (role === 'admin') {
    dom.username.value = `admin_${Date.now().toString().slice(-4)}`;
    dom.password.value = 'pass123';
    dom.duration.value = '20';
    logEvent('ui.role', { role: 'admin', hint: 'Buka lelang dan share auction_id ke bidder' });
    return;
  }

  dom.username.value = `bidder_${Date.now().toString().slice(-4)}`;
  dom.password.value = 'pass123';
  dom.bidAmount.value = '100000000';
  logEvent('ui.role', { role: 'bidder', hint: 'Join auction lalu kirim bid' });
}

async function runQuickDemoAdmin() {
  applyRole('admin');
  send('auth.register', {
    username: dom.username.value.trim(),
    password: dom.password.value,
  });
  await sleep(300);

  send('auth.login', {
    username: dom.username.value.trim(),
    password: dom.password.value,
  });
  await sleep(300);

  send('stream.catalog.start', {});
  await sleep(200);

  send('catalog.get_items', {});
  await sleep(500);

  if (!dom.itemId.value.trim()) {
    logEvent('ui.demo', { message: 'item_id belum tersedia, klik Get Items sekali lagi' });
    return;
  }

  send('catalog.open_auction', {
    item_id: dom.itemId.value.trim(),
    duration_seconds: Number(dom.duration.value || 20),
  });
}

async function runQuickDemoBidder() {
  applyRole('bidder');
  send('auth.register', {
    username: dom.username.value.trim(),
    password: dom.password.value,
  });
  await sleep(300);

  send('auth.login', {
    username: dom.username.value.trim(),
    password: dom.password.value,
  });
  await sleep(300);

  if (!dom.joinAuctionId.value.trim() && latestAuctionId) {
    dom.joinAuctionId.value = latestAuctionId;
  }

  if (!dom.joinAuctionId.value.trim()) {
    logEvent('ui.demo', { message: 'Masukkan auction_id dulu atau jalankan Quick Demo Admin' });
    return;
  }

  send('auction.join', {
    auction_id: dom.joinAuctionId.value.trim(),
    token,
  });
}

function wireControls() {
  dom.btnRegister.onclick = () => {
    send('auth.register', {
      username: dom.username.value.trim(),
      password: dom.password.value,
    });
  };

  dom.btnLogin.onclick = () => {
    send('auth.login', {
      username: dom.username.value.trim(),
      password: dom.password.value,
    });
  };

  dom.btnItems.onclick = () => {
    send('catalog.get_items', {});
  };

  dom.btnOpen.onclick = () => {
    send('catalog.open_auction', {
      item_id: dom.itemId.value.trim(),
      duration_seconds: Number(dom.duration.value || 20),
    });
  };

  dom.btnFeedStart.onclick = () => {
    send('stream.catalog.start', {});
  };

  dom.btnFeedStop.onclick = () => {
    send('stream.catalog.stop', {});
  };

  dom.btnJoin.onclick = () => {
    send('auction.join', {
      auction_id: dom.joinAuctionId.value.trim(),
      token,
    });
  };

  dom.btnBid.onclick = () => {
    send('auction.place_bid', {
      auction_id: dom.joinAuctionId.value.trim(),
      bidder_name: dom.username.value.trim(),
      amount: Number(dom.bidAmount.value || 0),
      token,
    });
  };

  dom.btnRoleAdmin.onclick = () => applyRole('admin');
  dom.btnRoleBidder.onclick = () => applyRole('bidder');
  dom.btnDemoAdmin.onclick = () => {
    runQuickDemoAdmin().catch((err) => logEvent('ui.demo.error', { message: String(err) }));
  };
  dom.btnDemoBidder.onclick = () => {
    runQuickDemoBidder().catch((err) => logEvent('ui.demo.error', { message: String(err) }));
  };
}

wireControls();
connect();
