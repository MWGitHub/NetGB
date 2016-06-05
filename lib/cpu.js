class CPU {
  constructor() {
    this._clock = {
      m: 0,
      t: 0
    };

    this._registers = {
      // 8-bit         16-bit
      // Hi    Lo
      a: 0, f: 0,   // Accumulator & Flags
      b: 0, c: 0,   // BC
      d: 0, e: 0,   // DE
      h: 0, l: 0,   // HL
      // 16-bit
      sp: 0,        // Stack Pointer
      pc: 0,        // Program Counter
      m: 0,  // Clock last instruction
      t: 0
    };
  }

  step() {

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
    this._registers.t = 4;
  }

  compare() {
    let temp = this._registers.a;
    temp -= this._registers.b;
    this._registers.f |= 0x40;
    if (!(temp & 255)) this._registers.f |= 0x80;
    if (temp < 0) this._registers.f |= 0x10;
    this._registers.m = 1;
    this._registers.t = 4;
  }

  nop() {
    this._registers.m = 1;
    this._registers.t = 4;
  }
}

export default CPU;
