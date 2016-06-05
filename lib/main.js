require('normalize.css');
require('../style/main.css');

import CPU from './cpu';
import DataElement from './debug/data-element';

const binds = [];

function updateBinds() {
  for (let i = 0; i < binds.length; ++i) {
    binds[i].update();
  }
}

document.addEventListener('DOMContentLoaded', _ => {
  let view = document.getElementById('screen');

  const cpu = window.cpu = new CPU();

  const cpuTable = document.getElementById('cpu');
  const keys = Object.keys(cpu._registers);
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    const value = cpu._registers[key];
    const row = document.createElement('tr');

    const name = document.createElement('td');
    name.textContent = key;
    row.appendChild(name);

    const text = document.createElement('td');
    text.textContent = value;
    row.appendChild(text);

    const data = new DataElement(text, cpu._registers, key);
    binds.push(data);

    cpuTable.appendChild(row);
  }

  window.requestAnimationFrame(function frame() {
    updateBinds();
    window.requestAnimationFrame(frame);
  });
});
