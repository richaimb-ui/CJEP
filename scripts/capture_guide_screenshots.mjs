import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const screenshotsDir = path.resolve('public', 'guide_screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function run() {
  console.log("Starting Chrome Headless for Mobile Screenshots...");
  const chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-port=9222',
    '--headless=new',
    '--user-data-dir=' + path.join(process.env.TEMP, 'chrome_guide_profile_v3')
  ]);

  await new Promise(r => setTimeout(r, 2000));

  function getJson(url) {
    return new Promise((resolve, reject) => {
      http.get(url, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  const list = await getJson('http://127.0.0.1:9222/json/list');
  const tab = list.find(t => t.type === 'page') || list[0];
  console.log("Connected to Chrome tab:", tab.webSocketDebuggerUrl);

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      pending.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);

  await send('Page.enable');
  await send('DOM.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  async function takeScreenshot(filename) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(screenshotsDir, filename);
    fs.writeFileSync(fullPath, Buffer.from(shot.result.data, 'base64'));
    console.log(`Saved screenshot: ${filename}`);
  }

  // 1. Capture Login Page
  console.log("Navigating to Login...");
  await send('Page.navigate', { url: 'http://localhost:3005/login' });
  await new Promise(r => setTimeout(r, 2500));
  await takeScreenshot('step1_login.png');

  // Fill credentials and submit
  console.log("Filling login credentials...");
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        function setReactInput(input, value) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeSetter.call(input, value);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const emailInput = document.querySelector('input[type="email"]');
        const passInput = document.querySelector('input[type="password"]');
        const submitBtn = document.querySelector('button[type="submit"]');

        if (emailInput && passInput && submitBtn) {
          setReactInput(emailInput, 'richaimb@gmail.com');
          setReactInput(passInput, 'SuperPassword123!');
          setTimeout(() => submitBtn.click(), 300);
        }
      })()
    `
  });

  await new Promise(r => setTimeout(r, 5000));

  // 2. Capture Dashboard
  console.log("Capturing Dashboard...");
  await takeScreenshot('step2_dashboard.png');

  // 3. Navigate to Contributeurs using client-side navigation
  console.log("Navigating to Contributeurs...");
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const link = document.querySelector('a[href="/contributeurs"]');
        if (link) { link.click(); return 'clicked link'; }
        window.location.href = '/contributeurs';
        return 'navigated via href';
      })()
    `
  });
  await new Promise(r => setTimeout(r, 3000));
  await takeScreenshot('step3_contributeurs.png');

  // 4. Open "Nouveau Contributeur" modal
  console.log("Opening Contributeur modal...");
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const buttons = Array.from(document.querySelectorAll('button'));
        const newBtn = buttons.find(b => b.textContent.includes('Nouveau'));
        if (newBtn) newBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  // Fill sample data in modal
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        function setInput(input, val) {
          if (!input) return;
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeSetter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        setInput(document.querySelector('input[name="firstName"]'), 'Jean-Marc');
        setInput(document.querySelector('input[name="lastName"]'), 'KOUADIO');
        setInput(document.querySelector('input[name="email"]'), 'jm.kouadio@email.com');
        setInput(document.querySelector('input[name="phone"]'), '+225 07 12 34 56 78');
        setInput(document.querySelector('input[name="engagement"]'), '10000');
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  await takeScreenshot('step4_modal_contributeur.png');

  // 5. Navigate to Entrées
  console.log("Navigating to Entrées...");
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const link = document.querySelector('a[href="/entrees"]');
        if (link) { link.click(); return 'clicked'; }
        window.location.href = '/entrees';
      })()
    `
  });
  await new Promise(r => setTimeout(r, 3000));
  await takeScreenshot('step5_entrees.png');

  // 6. Open "Nouvelle Entrée" modal
  console.log("Opening Entrée modal...");
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const buttons = Array.from(document.querySelectorAll('button'));
        const newBtn = buttons.find(b => b.textContent.includes('Nouvelle') || b.textContent.includes('Nouveau'));
        if (newBtn) newBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  // Fill in payment details
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const typeSelect = document.querySelector('select[name="type"]');
        if (typeSelect) {
          typeSelect.value = 'Cotisation';
          typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const contribSelect = document.querySelector('select[name="contributorId"]');
        if (contribSelect && contribSelect.options.length > 1) {
          contribSelect.selectedIndex = 1;
          contribSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const amountInput = document.querySelector('input[name="amount"]');
        if (amountInput) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeSetter.call(amountInput, '30000');
          amountInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        const monthsInput = document.querySelector('input[name="monthsCount"]');
        if (monthsInput) {
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeSetter.call(monthsInput, '3');
          monthsInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  await takeScreenshot('step6_modal_paiement.png');

  // 7. Navigate to Cotisations matrix
  console.log("Navigating to Cotisations...");
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        window.location.href = '/cotisations';
      })()
    `
  });
  await new Promise(r => setTimeout(r, 3500));
  await takeScreenshot('step7_cotisations.png');

  console.log("All manual screenshots captured successfully!");
  ws.close();
  chromeProc.kill();
  process.exit(0);
}

run().catch(err => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
