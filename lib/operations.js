const operations = {};

// Heplers
function pairRegister(registers, r1, r2) {
  return registers[r1] << 8 + registers[r2];
}

// 8-bit loads
function ldRn(r) {
  return function(registers, mmu) {
    registers[r] = mmu.readByte(registers.pc);
    registers.pc++;
    registers.m = 2;
  };
}

function ldR1R2(r1, r2) {
  return function(registers) {
    registers[r1] = registers[r2];
    registers.m = 1;
  };
}

function ldRmm(r, m1, m2) {
  return function(registers, mmu) {
    const address = pairRegister(registers, m1, m2);
    registers[r] = mmu.readByte(address);
    registers.m = 2;
  };
}

function ldMMr(m1, m2, r) {
  return function(registers, mmu) {
    const address = pairRegister(registers, m1, m2);
    mmu.writeByte(address, r);
    registers.m = 2;
  };
}

function ldMMn(m1, m2) {
  return function(registers, mmu) {
    const address = pairRegister(registers, m1, m2);
    const value = mmu.readByte(registers.pc);
    registers.pc++;
    mmu.writeByte(address, value);
    registers.m = 3;
  };
}

function ldRnn(r) {
  return function(registers, mmu) {
    const value = mmu.readWord(registers.pc);
    registers.pc += 2;
    registers[r] = value;
    registers.m = 4;
  };
}

function ldNNr(r) {
  return function(registers, mmu) {
    const address = mmu.readWord(registers.pc);
    registers.pc += 2;
    mmu.writeByte(address, r);
    registers.m = 4;
  };
}

operations.codes = [];
// 8-Bit operations
// LD nn,n
operations[0x06] = ldRn('b');
operations[0x0E] = ldRn('c');
operations[0x16] = ldRn('d');
operations[0x1E] = ldRn('e');
operations[0x26] = ldRn('h');
operations[0x2E] = ldRn('l');

// LD r1,r2
operations[0x7F] = ldR1R2('a', 'a');
operations[0x78] = ldR1R2('a', 'b');
operations[0x79] = ldR1R2('a', 'c');
operations[0x7A] = ldR1R2('a', 'd');
operations[0x7B] = ldR1R2('a', 'e');
operations[0x7C] = ldR1R2('a', 'h');
operations[0x7D] = ldR1R2('a', 'l');
operations[0x0A] = ldRmm('a', 'b', 'c');
operations[0x1A] = ldRmm('a', 'd', 'e');
operations[0x7E] = ldRmm('a', 'h', 'l');
operations[0xFA] = ldRnn('a');
operations[0x3E] = ldRn('a');
(function() {
  // Generate b to l
  const registers = ['b', 'c', 'd', 'e', 'h', 'l'];
  let current = 0x40;
  for (let i = 0; i < registers.length; ++i) {
    for (let j = 0; j < registers.length; ++j) {
      operations[current] = ldR1R2(registers[i], registers[j]);
      current++;
    }
    operations[current] = ldR1R2(registers[i], 'a');
    current++;
    operations[current] = ldRmm(registers[i], 'h', 'l');
    current++;
  }

  // Generate (hl)
  for (let i = 0; i < registers.length; ++i) {
    operations[current] = ldMMr('h', 'l', registers[i]);
    current++;
  }
  operations[0x36] = ldMMn('h', 'l');
})();
// LD n,A
operations[0x02] = ldMMr('b', 'c', 'a');
operations[0x12] = ldMMr('d', 'e', 'a');
operations[0x77] = ldMMr('h', 'l', 'a');
operations[0xEA] = ldNNr('a');

export default operations;
