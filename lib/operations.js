const operations = {};

// Helpers

// Retrieve the result of a pair of registers
function pairRegister(registers, r1, r2) {
  return registers[r1] << 8 + registers[r2];
}

function getZero(registers) {
  return (registers.f & 0b10000000) ? 1 : 0;
}

function getSubtraction(registers) {
  return (registers.f & 0b01000000) ? 1 : 0;
}

function getHalfCarry(registers) {
  return (registers.f & 0b00100000) ? 1 : 0;
}

function getCarry(registers) {
  return (registers.f & 0b00010000) ? 1 : 0;
}

// 8-bit loads

// Load value to r
function ldRn(r) {
  return function(registers, mmu) {
    registers[r] = mmu.readByte(registers.pc);
    registers.pc++;
    registers.m = 2;
  };
}

// Load r2 to r1
function ldR1R2(r1, r2) {
  return function(registers) {
    registers[r1] = registers[r2];
    registers.m = 1;
  };
}

// Load value at register pair address to r
function ldRmm(r, m1, m2) {
  return function(registers, mmu) {
    const address = pairRegister(registers, m1, m2);
    registers[r] = mmu.readByte(address);
    registers.m = 2;
  };
}

// load value of r to register pair address
function ldMMr(m1, m2, r) {
  return function(registers, mmu) {
    const address = pairRegister(registers, m1, m2);
    mmu.writeByte(address, r);
    registers.m = 2;
  };
}

// Load value to register pair address
function ldMMn(m1, m2) {
  return function(registers, mmu) {
    const address = pairRegister(registers, m1, m2);
    const value = mmu.readByte(registers.pc);
    registers.pc++;
    mmu.writeByte(address, value);
    registers.m = 3;
  };
}

// Load value at address to r
function ldRnn(r) {
  return function(registers, mmu) {
    const value = mmu.readWord(registers.pc);
    registers.pc += 2;
    registers[r] = value;
    registers.m = 4;
  };
}

// Load r to address
function ldNNr(r) {
  return function(registers, mmu) {
    const address = mmu.readWord(registers.pc);
    registers.pc += 2;
    mmu.writeByte(address, r);
    registers.m = 4;
  };
}

// Load lo r2 into r
function ldLoRr(r1, r2) {
  return function(registers, mmu) {
    const address = 0xFF00 + r2;
    registers[r1] = mmu.readByte(address);
    registers.m = 2;
  };
}

// Load r2 into lo r1
function ldRrLo(r1, r2) {
  return function(registers, mmu) {
    const address = 0xFF00 + r1;
    mmu.writeByte(address, r2);
    registers.m = 2;
  };
}

// Load r1 r2 pair into r and decrement
function ldRmmDec(r, r1, r2) {
  return function(registers, mmu) {
    let address = pairRegister(r1, r2);
    const value = mmu.readByte(address);
    registers[r] = value;
    address = (address - 1) & 0xFFFF;
    registers[r1] = address >> 8;
    registers[r2] = address & 0x00FF;
    registers.m = 2;
  };
}

// Load r into r1 r2 pair and decrement
function ldMMrDec(r1, r2, r) {
  return function(registers, mmu) {
    let address = pairRegister(r1, r2);
    mmu.writeByte(address, r);
    address = (address - 1) & 0xFFFF;
    registers[r1] = address >> 8;
    registers[r2] = address & 0x00FF;
    registers.m = 2;
  };
}

// Load r1 r2 pair into r and increment
function ldRmmInc(r, r1, r2) {
  return function(registers, mmu) {
    let address = pairRegister(r1, r2);
    const value = mmu.readByte(address);
    registers[r] = value;
    address = (address + 1) & 0xFFFF;
    registers[r1] = address >> 8;
    registers[r2] = address & 0x00FF;
    registers.m = 2;
  };
}

// Load r into r1 r2 pair and increment
function ldMMrInc(r1, r2, r) {
  return function(registers, mmu) {
    let address = pairRegister(r1, r2);
    mmu.writeByte(address, r);
    address = (address + 1) & 0xFFFF;
    registers[r1] = address >> 8;
    registers[r2] = address & 0x00FF;
    registers.m = 2;
  };
}

// Put memory address r into lo n
function ldLoNr(r) {
  return function(registers, mmu) {
    const address = 0xFF00 + mmu.readByte(registers.pc);
    registers.pc++;
    mmu.writeByte(address, r);
    registers.m = 3;
  };
}

// Put memory address n into r
function ldLoRn(r) {
  return function(registers, mmu) {
    const address = 0xFF00 + mmu.readByte(registers.pc);
    registers.pc++;
    const value = mmu.readByte(address);
    registers[r] = value;
    registers.m = 3;
  };
}

// 16-Bit loads

// Load value at nn into rr pair
function ldRRnn(r1, r2) {
  return function(registers, mmu) {
    registers[r1] = mmu.readByte(registers.pc + 1);
    registers[r2] = mmu.readByte(registers.pc);
    registers.pc += 2;
    registers.m = 3;
  };
}

// Load value at nn into sp
function ldSPnn() {
  return function(registers, mmu) {
    registers.sp = mmu.readWord(registers.pc);
    registers.pc += 2;
    registers.m = 3;
  };
}

// Load value at mm into sp
function ldSPmm(r1, r2) {
  return function(registers) {
    registers.sp = pairRegister(registers, r1, r2);
    registers.m = 2;
  };
}

// Put SP + n address into HL
function ldRRspN(r1, r2) {
  return function(registers, mmu) {
    let value = mmu.readByte(registers.pc);
    if (value > 127) value = -((~value + 1) & 255);
    const address = (registers.sp + value) & 0xFFFF;
    registers.pc++;
    registers[r1] = address >> 8;
    registers[r2] = address & 0x00FF;
    // XOR inputs to detect overflow
    value = registers.sp ^ value ^ address;
    let flag = 0;
    if ((value & 0x100) === 0x100) flag |= 0b00010000;
    if ((value & 0x10) === 0x10) flag |= 0b00100000;
    registers.f = flag;
    registers.m = 3;
  };
}

// Put SP address into nn pair
function ldNNsp() {
  return function(registers, mmu) {
    const address = mmu.readWord(registers.pc);
    mmu.writeWord(address, registers.sp);
    registers.pc += 2;
    registers.m = 5;
  };
}

// Push register pair nn onto Stack
function pushRR(r1, r2) {
  return function(registers, mmu) {
    mmu.writeByte(registers.sp - 1, registers[r1]);
    mmu.writeByte(registers.sp - 2, registers[r2]);
    registers.sp -= 2;
    registers.m = 4;
  };
}

// Pop pair into rr pair
function popRR(r1, r2) {
  return function(registers, mmu) {
    registers[r1] = mmu.readByte(registers.sp + 1);
    registers[r2] = mmu.readByte(registers.sp);
    registers.sp += 2;
    registers.m = 3;
  };
}

// 8-Bit ALU

// Handle adding and setting flag to register
function add8r(registers, r, result) {
  registers[r] = result & 0xFF;
  let flags = 0;
  if ((result & 0b00001000) === 0b00001000) flags |= 0b00100000;
  if ((result & 0b10000000) === 0b10000000) flags |= 0b00010000;
  if (registers[r] === 0) flags |= 0b10000000;
  registers.f = flags;
}

// Add r2 to r1
function addRr(r1, r2) {
  return function(registers) {
    const result = registers[r1] + registers[r2];
    add8r(registers, r1, result);
    registers.m = 1;
  };
}

// Add value of pair to r
function addRmm(r, r1, r2) {
  return function(registers, mmu) {
    const value = mmu.readByte(pairRegister(registers, r1, r2));
    const result = value + registers[r];
    add8r(registers, r, result);
    registers.m = 2;
  };
}

// Add a value to r
function addRn(r) {
  return function(registers, mmu) {
    const value = mmu.readByte(registers.pc);
    registers.pc++;
    const result = value + registers[r];
    add8r(registers, r, result);
    registers.m = 2;
  };
}

// Add r2 with carry to r1
function addCrR(r1, r2) {
  return function(registers) {
    const result = (registers[r1] + registers[r2] + getCarry(registers));
    add8r(registers, r1, result);
    registers.m = 1;
  };
}

// Add value of pair to r
function addCrMM(r, r1, r2) {
  return function(registers, mmu) {
    const value = mmu.readByte(pairRegister(registers, r1, r2));
    const result = value + registers[r] + getCarry(registers);
    add8r(registers, r, result);
    registers.m = 2;
  };
}

// Add a value to r
function addCrN(r) {
  return function(registers, mmu) {
    const value = mmu.readByte(registers.pc);
    registers.pc++;
    const result = value + registers[r] + getCarry(registers);
    add8r(registers, r, result);
    registers.m = 2;
  };
}

// 8-Bit subtraction helper
function sub8r(registers, r, result) {
  const prev = registers[r];
  registers[r] = result & 0xFF;
  let flags = 0b01000000;
  // Check if first four bits are smaller than first four subtracted
  if ((prev & 0xF) < (result & 0xF)) flags |= 0b00100000;
  if (result < 0) flags |= 0b00010000;
  if (registers[r] === 0) flags |= 0b10000000;
  registers.f = flags;
}

// Subtract r2 from r1
function subRr(r1, r2) {
  return function(registers) {
    const result = r1 - r2;
    sub8r(registers, r1, result);
    registers.m = 1;
  };
}

// Add value of pair to r
function subRmm(r, r1, r2) {
  return function(registers, mmu) {
    const value = mmu.readByte(pairRegister(registers, r1, r2));
    const result = registers[r] - value;
    add8r(registers, r, result);
    registers.m = 2;
  };
}

// Add a value to r
function subRn(r) {
  return function(registers, mmu) {
    const value = mmu.readByte(registers.pc);
    registers.pc++;
    const result = registers[r] - value;
    sub8r(registers, r, result);
    registers.m = 2;
  };
}

// Add r2 with carry to r1
function subCrR(r1, r2) {
  return function(registers) {
    const result = (registers[r1] - (registers[r2] + getCarry(registers)));
    sub8r(registers, r1, result);
    registers.m = 1;
  };
}

// Add value of pair to r
function subCrMM(r, r1, r2) {
  return function(registers, mmu) {
    const value = mmu.readByte(pairRegister(registers, r1, r2));
    const result = registers[r] - (value + getCarry(registers));
    sub8r(registers, r, result);
    registers.m = 2;
  };
}

operations.codes = [];
// 8-Bit load operations
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
    // LD n,A
    operations[current] = ldR1R2(registers[i], 'a');
    current++;
    // LD n,(HL)
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
// LD A,(C)
operations[0xF2] = ldLoRr('a', 'c');
// LD (C),A
operations[0xE2] = ldRrLo('c', 'a');
// LD A,(HLD)
operations[0x3A] = ldRmmDec('a', 'h', 'l');
// LD (HLD),A
operations[0x32] = ldMMrDec('h', 'l', 'a');
// LD A,(HLI)
operations[0x2A] = ldRmmInc('a', 'h', 'l');
// LD (HLI),A
operations[0x22] = ldMMrInc('h', 'l', 'a');
// LDH (n),A
operations[0xE0] = ldLoNr('a');
// LDH A,(n)
operations[0xF0] = ldLoRn('a');

// 16-Bit load operations

// LD n,nn
operations[0x01] = ldRRnn('b', 'c');
operations[0x11] = ldRRnn('d', 'e');
operations[0x21] = ldRRnn('h', 'l');
operations[0x31] = ldSPnn();
// LD SP,HL
operations[0xF9] = ldSPmm('h', 'l');
// LDHL SP,n
operations[0xF8] = ldRRspN('h', 'l');
// LD (nn),SP
operations[0x08] = ldNNsp();

// PUSH nn
operations[0xF5] = pushRR('a', 'f');
operations[0xC5] = pushRR('b', 'c');
operations[0xD5] = pushRR('d', 'e');
operations[0xE5] = pushRR('h', 'l');

// POP nn
operations[0xF1] = popRR('a', 'f');
operations[0xC1] = popRR('b', 'c');
operations[0xD1] = popRR('d', 'e');
operations[0xE1] = popRR('h', 'l');

// 8-Bit ALU operations

// ADD A,n
operations[0x87] = addRr('a', 'a');
operations[0x80] = addRr('a', 'b');
operations[0x81] = addRr('a', 'c');
operations[0x82] = addRr('a', 'd');
operations[0x83] = addRr('a', 'e');
operations[0x84] = addRr('a', 'h');
operations[0x85] = addRr('a', 'l');
operations[0x86] = addRmm('a', 'h', 'l');
operations[0xC6] = addRn('a');

// ADC A,n
operations[0x8F] = addCrR('a', 'a');
operations[0x88] = addCrR('a', 'b');
operations[0x89] = addCrR('a', 'c');
operations[0x8A] = addCrR('a', 'd');
operations[0x8B] = addCrR('a', 'e');
operations[0x8C] = addCrR('a', 'h');
operations[0x8D] = addCrR('a', 'l');
operations[0x8E] = addCrMM('a', 'h', 'l');
operations[0xCE] = addCrN('a');

// SUB n
operations[0x97] = subRr('a', 'a');
operations[0x90] = subRr('a', 'b');
operations[0x91] = subRr('a', 'c');
operations[0x92] = subRr('a', 'd');
operations[0x93] = subRr('a', 'e');
operations[0x94] = subRr('a', 'h');
operations[0x95] = subRr('a', 'l');
operations[0x96] = subRmm('a', 'h', 'l');
operations[0xD6] = subRn('a');

// SBC A,n
operations[0x9F] = subCrR('a', 'a');
operations[0x98] = subCrR('a', 'b');
operations[0x99] = subCrR('a', 'c');
operations[0x9A] = subCrR('a', 'd');
operations[0x9B] = subCrR('a', 'e');
operations[0x9C] = subCrR('a', 'h');
operations[0x9D] = subCrR('a', 'l');
operations[0x9E] = subCrMM('a', 'h', 'l');

export default operations;
