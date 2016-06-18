import operations from './operations';

class CPU {
  constructor(mmu) {
    this._mmu = mmu;

    this._clock = {
      m: 0,
      c: 0
    };

    this._registers = {
      // 8-bit
      // Hi    Lo
      a: 0, f: 0,   // Accumulator & Flags
      b: 0, c: 0,   // BC
      d: 0, e: 0,   // DE
      h: 0, l: 0,   // HL
      // 16-bit
      sp: 0xFFFE,   // Stack Pointer
      pc: 0x100,    // Program Counter
      m: 0          // Clock last instruction

      // Flag
      // Z N H C 0 0 0 0
      // Z (Zero), N (Subtract), H (Half Carry), C (Carry)
    };
  }

  step() {
    const code = this._mmu.readByte(this._registers.pc);
    const operation = operations.codes[code];
    this._registers.pc++;
    if (operation) {
      operation(this._registers, this._mmu);
    } else {
      throw new Error(`No instruction matching ${code}`);
    }

    this._registers.pc &= 0xFFFF;
    this._registers.sp &= 0xFFFF;
    this._clock.m += this._registers.m;
    this._clock.c += this._registers.m * 4;
  }

  add() {
    // Add
    this._registers.a += this._registers.e;
    // Clear flags
    this._registers.f = 0;

    // Check zero
    if (!(this._registers.a & 255)) this._registers.f |= 0x80;
    // Check carry
    if (this._registers.a > 255) this._registers.f |= 0x10;
    // Mask to 8 bits
    this._registers.a &= 255;

    this._registers.m = 1;
  }

  compare() {
    let temp = this._registers.a;
    temp -= this._registers.b;
    this._registers.f |= 0x40;
    if (!(temp & 255)) this._registers.f |= 0x80;
    if (temp < 0) this._registers.f |= 0x10;
    this._registers.m = 1;
  }

  nop() {
    this._registers.m = 1;
  }

  pushbc() {
    this._registers.sp--;
    this._mmu.writeByte(this._registers.sp, this._registers.b);
    this._registers.sp--;
    this._mmu.writeByte(this._registers.sp, this._registers.c);
    this._registers.m = 3;
  }

  pophl() {
    this._registers.l = this._mmu.readByte(this._registers.sp);
    this._registers.sp++;
    this._registers.h = this._mmu.readByte(this._registers.sp);
    this._registers.sp++;
    this._registers.m = 3;
  }

  ldamm() {
    const address = this._mmu.readWord(this._registers.pc);
    this._registers.pc += 2;
    this._registers.a = this._mmu.readByte(address);
    this._registers.m = 4;
  }

  reset() {
    for (let key in this._registers) {
      if (!this._registers.hasOwnProperty(key)) continue;

      this._registers[key] = 0;
    }
    this._registers.sp = 0xFFFE;
    this._registers.pc = 0x100;

    this._clock.mt = 0;
    this._clock.cl = 0;
  }
}

export default CPU;
