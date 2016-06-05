class MMU {
  constructor() {
    this._inBIOS = true;

    this._bios = [];
    this._rom = [];
    this._wram = [];
    this._eram = [];
    this._zram = [];
    this._vram = [];
    this._oam = [];
  }

  load(file) {
    this._rom = file;
  }

  clearBIOS() {
    this._inBIOS = false;
  }

  readByte(address) {
    let addr = 0;
    switch (address & 0xF000) {
      // BIOS/ROM0
      case 0x000:
        if (this._inBIOS) {
          if (address < 0x100) return this._bios[address];
        }

        return this._rom[address];
      // ROM0
      case 0x1000:
      case 0x2000:
      case 0x3000:
        return this._rom[address];
      // ROM1
      case 0x4000:
      case 0x5000:
      case 0x6000:
      case 0x7000:
        return this._rom[address];
      // VRAM
      case 0x8000:
      case 0x9000:
        return this._vram[address & 0x1FFF];
      // ERAM
      case 0xA000:
      case 0xB000:
        return this._eram[address & 0x1FFF];
      // WRAM
      case 0xC000:
      case 0xD000:
        return this._wram[address & 0x1FFF];
      // WRAM Shadow
      case 0xE000:
        return this._wram[address & 0x1FFF];
      // WRAM Shadow, I/O, Zero
      case 0xF000:
        addr = address & 0x0F00;
        if (addr <= 0xD00) {
          return this._wram[address & 0x1FFF];
        }

        if (addr === 0xE00) {
          if (address < 0xFEA0) return this._oam[address & 0xFF];
          return 0;
        }

        if (addr >= 0xF00) {
          if (address >= 0xFF80) return this._zram[address & 0x7F];
          return 0;
        }
        break;
      default:
        throw new Error('Invalid memory');
    }
  }

  readWord(address) {
    return this.readByte(address) + (this.readByte(address + 1) << 8);
  }

  writeByte(address, value) {
    let addr = 0;
    switch (address & 0xF000) {
      // BIOS/ROM0
      case 0x000:
        if (this._inBIOS) {
          if (address < 0x100) this._bios[address] = value;
          break;
        }

        this._rom[address] = value;
        break;
      // ROM0
      case 0x1000:
      case 0x2000:
      case 0x3000:
        this._rom[address] = value;
        break;
      // ROM1
      case 0x4000:
      case 0x5000:
      case 0x6000:
      case 0x7000:
        this._rom[address] = value;
        break;
      // VRAM
      case 0x8000:
      case 0x9000:
        this._vram[address & 0x1FFF] = value;
        break;
      // ERAM
      case 0xA000:
      case 0xB000:
        this._eram[address & 0x1FFF] = value;
        break;
      // WRAM
      case 0xC000:
      case 0xD000:
        this._wram[address & 0x1FFF] = value;
        break;
      // WRAM Shadow
      case 0xE000:
        this._wram[address & 0x1FFF] = value;
        break;
      // WRAM Shadow, I/O, Zero
      case 0xF000:
        addr = address & 0x0F00;
        if (addr <= 0xD00) {
          this._wram[address & 0x1FFF] = value;
          break;
        }

        if (addr === 0xE00) {
          if (address < 0xFEA0) this._oam[address & 0xFF] = value;
          break;
        }

        if (addr >= 0xF00) {
          if (address >= 0xFF80) this._zram[address & 0x7F] = value;
          break;
        }
        break;
      default:
        throw new Error('Invalid memory');
    }
  }

  writeWord(address, value) {
    this.writeByte(address, value & 255);
    this.writeByte(address + 1, value >> 8);
  }
}

export default MMU;
