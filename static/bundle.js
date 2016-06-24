/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _cpu = __webpack_require__(2);
	
	var _cpu2 = _interopRequireDefault(_cpu);
	
	var _dataElement = __webpack_require__(4);
	
	var _dataElement2 = _interopRequireDefault(_dataElement);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	__webpack_require__(5);
	__webpack_require__(9);
	
	var binds = [];
	
	function updateBinds() {
	  for (var i = 0; i < binds.length; ++i) {
	    binds[i].update();
	  }
	}
	
	document.addEventListener('DOMContentLoaded', function (_) {
	  var view = document.getElementById('screen');
	
	  var cpu = window.cpu = new _cpu2.default();
	
	  var cpuTable = document.getElementById('cpu');
	  var keys = Object.keys(cpu._registers);
	  for (var i = 0; i < keys.length; ++i) {
	    var key = keys[i];
	    var value = cpu._registers[key];
	    var row = document.createElement('tr');
	
	    var name = document.createElement('td');
	    name.textContent = key;
	    row.appendChild(name);
	
	    var text = document.createElement('td');
	    text.textContent = value;
	    row.appendChild(text);
	
	    var data = new _dataElement2.default(text, cpu._registers, key);
	    binds.push(data);
	
	    cpuTable.appendChild(row);
	  }
	
	  window.requestAnimationFrame(function frame() {
	    updateBinds();
	    window.requestAnimationFrame(frame);
	  });
	});

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _operations = __webpack_require__(3);
	
	var _operations2 = _interopRequireDefault(_operations);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var CPU = function () {
	  function CPU(mmu) {
	    _classCallCheck(this, CPU);
	
	    this._mmu = mmu;
	
	    this._clock = {
	      m: 0,
	      c: 0
	    };
	
	    this._registers = {
	      // 8-bit
	      // Hi    Lo
	      a: 0, f: 0, // Accumulator & Flags
	      b: 0, c: 0, // BC
	      d: 0, e: 0, // DE
	      h: 0, l: 0, // HL
	      // 16-bit
	      sp: 0xFFFE, // Stack Pointer
	      pc: 0x100, // Program Counter
	      m: 0, // Clock last instruction,
	
	      // Misc
	      halt: 0, // Halt status
	      stop: 0, // Stop status
	      interrupt: 0 // Interrupt enable status
	
	      // Flag
	      // Z N H C 0 0 0 0
	      // Z (Zero), N (Subtract), H (Half Carry), C (Carry)
	    };
	  }
	
	  _createClass(CPU, [{
	    key: 'step',
	    value: function step() {
	      var code = this._mmu.readByte(this._registers.pc);
	      var operation = _operations2.default.codes[code];
	      this._registers.pc++;
	      if (operation) {
	        operation(this._registers, this._mmu);
	      } else {
	        throw new Error('No instruction matching ' + code);
	      }
	
	      this._registers.pc &= 0xFFFF;
	      this._registers.sp &= 0xFFFF;
	      this._clock.m += this._registers.m;
	      this._clock.c += this._registers.m * 4;
	    }
	  }, {
	    key: 'add',
	    value: function add() {
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
	  }, {
	    key: 'compare',
	    value: function compare() {
	      var temp = this._registers.a;
	      temp -= this._registers.b;
	      this._registers.f |= 0x40;
	      if (!(temp & 255)) this._registers.f |= 0x80;
	      if (temp < 0) this._registers.f |= 0x10;
	      this._registers.m = 1;
	    }
	  }, {
	    key: 'nop',
	    value: function nop() {
	      this._registers.m = 1;
	    }
	  }, {
	    key: 'pushbc',
	    value: function pushbc() {
	      this._registers.sp--;
	      this._mmu.writeByte(this._registers.sp, this._registers.b);
	      this._registers.sp--;
	      this._mmu.writeByte(this._registers.sp, this._registers.c);
	      this._registers.m = 3;
	    }
	  }, {
	    key: 'pophl',
	    value: function pophl() {
	      this._registers.l = this._mmu.readByte(this._registers.sp);
	      this._registers.sp++;
	      this._registers.h = this._mmu.readByte(this._registers.sp);
	      this._registers.sp++;
	      this._registers.m = 3;
	    }
	  }, {
	    key: 'ldamm',
	    value: function ldamm() {
	      var address = this._mmu.readWord(this._registers.pc);
	      this._registers.pc += 2;
	      this._registers.a = this._mmu.readByte(address);
	      this._registers.m = 4;
	    }
	  }, {
	    key: 'reset',
	    value: function reset() {
	      for (var key in this._registers) {
	        if (!this._registers.hasOwnProperty(key)) continue;
	
	        this._registers[key] = 0;
	      }
	      this._registers.sp = 0xFFFE;
	      this._registers.pc = 0x100;
	
	      this._clock.mt = 0;
	      this._clock.cl = 0;
	    }
	  }]);
	
	  return CPU;
	}();
	
	exports.default = CPU;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var operations = {
	  codes: [],
	  cb: []
	};
	var codes = operations.codes;
	var cbOperations = operations.cb;
	
	// Helpers
	
	// Retrieve the result of a pair of registers
	function pairRegister(registers, r1, r2) {
	  return registers[r1] << 8 + registers[r2];
	}
	
	function getZero(registers) {
	  return registers.f & 128 ? 1 : 0;
	}
	
	function getSubtraction(registers) {
	  return registers.f & 64 ? 1 : 0;
	}
	
	function getHalfCarry(registers) {
	  return registers.f & 32 ? 1 : 0;
	}
	
	function getCarry(registers) {
	  return registers.f & 16 ? 1 : 0;
	}
	
	// 8-bit loads
	
	// Load value to r
	function ldRn(r) {
	  return function (registers, mmu) {
	    registers[r] = mmu.readByte(registers.pc);
	    registers.pc++;
	    registers.m = 2;
	  };
	}
	
	// Load r2 to r1
	function ldR1R2(r1, r2) {
	  return function (registers) {
	    registers[r1] = registers[r2];
	    registers.m = 1;
	  };
	}
	
	// Load value at register pair address to r
	function ldRmm(r, m1, m2) {
	  return function (registers, mmu) {
	    var address = pairRegister(registers, m1, m2);
	    registers[r] = mmu.readByte(address);
	    registers.m = 2;
	  };
	}
	
	// load value of r to register pair address
	function ldMMr(m1, m2, r) {
	  return function (registers, mmu) {
	    var address = pairRegister(registers, m1, m2);
	    mmu.writeByte(address, r);
	    registers.m = 2;
	  };
	}
	
	// Load value to register pair address
	function ldMMn(m1, m2) {
	  return function (registers, mmu) {
	    var address = pairRegister(registers, m1, m2);
	    var value = mmu.readByte(registers.pc);
	    registers.pc++;
	    mmu.writeByte(address, value);
	    registers.m = 3;
	  };
	}
	
	// Load value at address to r
	function ldRnn(r) {
	  return function (registers, mmu) {
	    var value = mmu.readWord(registers.pc);
	    registers.pc += 2;
	    registers[r] = value;
	    registers.m = 4;
	  };
	}
	
	// Load r to address
	function ldNNr(r) {
	  return function (registers, mmu) {
	    var address = mmu.readWord(registers.pc);
	    registers.pc += 2;
	    mmu.writeByte(address, r);
	    registers.m = 4;
	  };
	}
	
	// Load lo r2 into r
	function ldLoRr(r1, r2) {
	  return function (registers, mmu) {
	    var address = 0xFF00 + r2;
	    registers[r1] = mmu.readByte(address);
	    registers.m = 2;
	  };
	}
	
	// Load r2 into lo r1
	function ldRrLo(r1, r2) {
	  return function (registers, mmu) {
	    var address = 0xFF00 + r1;
	    mmu.writeByte(address, r2);
	    registers.m = 2;
	  };
	}
	
	// Load r1 r2 pair into r and decrement
	function ldRmmDec(r, r1, r2) {
	  return function (registers, mmu) {
	    var address = pairRegister(r1, r2);
	    var value = mmu.readByte(address);
	    registers[r] = value;
	    address = address - 1 & 0xFFFF;
	    registers[r1] = address >> 8;
	    registers[r2] = address & 0x00FF;
	    registers.m = 2;
	  };
	}
	
	// Load r into r1 r2 pair and decrement
	function ldMMrDec(r1, r2, r) {
	  return function (registers, mmu) {
	    var address = pairRegister(r1, r2);
	    mmu.writeByte(address, r);
	    address = address - 1 & 0xFFFF;
	    registers[r1] = address >> 8;
	    registers[r2] = address & 0x00FF;
	    registers.m = 2;
	  };
	}
	
	// Load r1 r2 pair into r and increment
	function ldRmmInc(r, r1, r2) {
	  return function (registers, mmu) {
	    var address = pairRegister(r1, r2);
	    var value = mmu.readByte(address);
	    registers[r] = value;
	    address = address + 1 & 0xFFFF;
	    registers[r1] = address >> 8;
	    registers[r2] = address & 0x00FF;
	    registers.m = 2;
	  };
	}
	
	// Load r into r1 r2 pair and increment
	function ldMMrInc(r1, r2, r) {
	  return function (registers, mmu) {
	    var address = pairRegister(r1, r2);
	    mmu.writeByte(address, r);
	    address = address + 1 & 0xFFFF;
	    registers[r1] = address >> 8;
	    registers[r2] = address & 0x00FF;
	    registers.m = 2;
	  };
	}
	
	// Put memory address r into lo n
	function ldLoNr(r) {
	  return function (registers, mmu) {
	    var address = 0xFF00 + mmu.readByte(registers.pc);
	    registers.pc++;
	    mmu.writeByte(address, r);
	    registers.m = 3;
	  };
	}
	
	// Put memory address n into r
	function ldLoRn(r) {
	  return function (registers, mmu) {
	    var address = 0xFF00 + mmu.readByte(registers.pc);
	    registers.pc++;
	    var value = mmu.readByte(address);
	    registers[r] = value;
	    registers.m = 3;
	  };
	}
	
	// 16-Bit loads
	
	// Load value at nn into rr pair
	function ldRRnn(r1, r2) {
	  return function (registers, mmu) {
	    registers[r1] = mmu.readByte(registers.pc + 1);
	    registers[r2] = mmu.readByte(registers.pc);
	    registers.pc += 2;
	    registers.m = 3;
	  };
	}
	
	// Load value at nn into sp
	function ldSPnn() {
	  return function (registers, mmu) {
	    registers.sp = mmu.readWord(registers.pc);
	    registers.pc += 2;
	    registers.m = 3;
	  };
	}
	
	// Load value at mm into sp
	function ldSPmm(r1, r2) {
	  return function (registers) {
	    registers.sp = pairRegister(registers, r1, r2);
	    registers.m = 2;
	  };
	}
	
	// Put SP + n address into HL
	// (May be wrong due to negative)
	function ldRRspN(r1, r2) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(registers.pc);
	    registers.pc++;
	    if (value >= 128) value = -(~value + 1 & 0xFF);
	    var sum = registers.sp + value & 0xFFFF;
	    registers[r1] = sum >> 8;
	    registers[r2] = sum & 0x00FF;
	    // XOR inputs to check flags
	    value = registers.sp ^ value ^ sum;
	    var flag = 0;
	    if ((value & 0x100) === 0x100) flag |= 16;
	    if ((value & 0x10) === 0x10) flag |= 32;
	    registers.f = flag;
	    registers.m = 3;
	  };
	}
	
	// Put SP address into nn pair
	function ldNNsp() {
	  return function (registers, mmu) {
	    var address = mmu.readWord(registers.pc);
	    mmu.writeWord(address, registers.sp);
	    registers.pc += 2;
	    registers.m = 5;
	  };
	}
	
	// Push register pair nn onto Stack
	function pushRR(r1, r2) {
	  return function (registers, mmu) {
	    mmu.writeByte(registers.sp - 1, registers[r1]);
	    mmu.writeByte(registers.sp - 2, registers[r2]);
	    registers.sp -= 2;
	    registers.m = 4;
	  };
	}
	
	// Pop pair into rr pair
	function popRR(r1, r2) {
	  return function (registers, mmu) {
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
	  var flags = 0;
	  if ((result & 8) === 8) flags |= 32;
	  if ((result & 128) === 128) flags |= 16;
	  if (registers[r] === 0) flags |= 128;
	  registers.f = flags;
	}
	
	// Add r2 to r1
	function addRr(r1, r2) {
	  return function (registers) {
	    var result = registers[r1] + registers[r2];
	    add8r(registers, r1, result);
	    registers.m = 1;
	  };
	}
	
	// Add value of pair to r
	function addRmm(r, r1, r2) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(pairRegister(registers, r1, r2));
	    var result = value + registers[r];
	    add8r(registers, r, result);
	    registers.m = 2;
	  };
	}
	
	// Add a value to r
	function addRn(r) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(registers.pc);
	    registers.pc++;
	    var result = value + registers[r];
	    add8r(registers, r, result);
	    registers.m = 2;
	  };
	}
	
	// Add r2 with carry to r1
	function addCrR(r1, r2) {
	  return function (registers) {
	    var result = registers[r1] + registers[r2] + getCarry(registers);
	    add8r(registers, r1, result);
	    registers.m = 1;
	  };
	}
	
	// Add value of pair to r
	function addCrMM(r, r1, r2) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(pairRegister(registers, r1, r2));
	    var result = value + registers[r] + getCarry(registers);
	    add8r(registers, r, result);
	    registers.m = 2;
	  };
	}
	
	// Add a value to r
	function addCrN(r) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(registers.pc);
	    registers.pc++;
	    var result = value + registers[r] + getCarry(registers);
	    add8r(registers, r, result);
	    registers.m = 2;
	  };
	}
	
	// 8-Bit subtraction helper
	function sub8r(registers, r, result) {
	  var prev = registers[r];
	  registers[r] = result & 0xFF;
	  var flags = 64;
	  // Check if first four bits are smaller than first four subtracted
	  if ((prev & 0xF) < (result & 0xF)) flags |= 32;
	  if (result < 0) flags |= 16;
	  if (registers[r] === 0) flags |= 128;
	  registers.f = flags;
	}
	
	// Subtract r2 from r1
	function subRr(r1, r2) {
	  return function (registers) {
	    var result = r1 - r2;
	    sub8r(registers, r1, result);
	    registers.m = 1;
	  };
	}
	
	// Add value of pair to r
	function subRmm(r, r1, r2) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(pairRegister(registers, r1, r2));
	    var result = registers[r] - value;
	    add8r(registers, r, result);
	    registers.m = 2;
	  };
	}
	
	// Add a value to r
	function subRn(r) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(registers.pc);
	    registers.pc++;
	    var result = registers[r] - value;
	    sub8r(registers, r, result);
	    registers.m = 2;
	  };
	}
	
	// Add r2 with carry to r1
	function subCrR(r1, r2) {
	  return function (registers) {
	    var result = registers[r1] - (registers[r2] + getCarry(registers));
	    sub8r(registers, r1, result);
	    registers.m = 1;
	  };
	}
	
	// Add value of pair to r
	function subCrMM(r, r1, r2) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(pairRegister(registers, r1, r2));
	    var result = registers[r] - (value + getCarry(registers));
	    sub8r(registers, r, result);
	    registers.m = 2;
	  };
	}
	
	// 8-Bit AND Helper
	function and8(registers, r, result) {
	  registers[r] = result;
	  var flags = 32;
	  if (result === 0) flags |= 128;
	  registers.f = flags;
	}
	
	// r1 AND r2 into r1
	function andRr(r1, r2) {
	  return function (registers) {
	    var result = registers[r1] & registers[r2];
	    and8(registers, r1, result);
	    registers.m = 1;
	  };
	}
	
	// r AND pair to r
	function andRmm(r, r1, r2) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(pairRegister(registers, r1, r2));
	    var result = registers[r1] & value;
	    and8(registers, r, result);
	    registers.m = 2;
	  };
	}
	
	// r AND n to r
	function andRn(r) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(registers.pc);
	    registers.pc++;
	    var result = registers[r] & value;
	    and8(registers, r, result);
	    registers.m = 2;
	  };
	}
	
	// 8-Bit OR helper
	function or8(registers, r, result) {
	  registers[r] = result;
	  var flags = 0;
	  if (result === 0) flags |= 128;
	  registers.f = flags;
	}
	
	// r1 OR r2 to r1
	function orRr(r1, r2) {
	  return function (registers) {
	    var result = registers[r1] | registers[r2];
	    or8(registers, r1, result);
	    registers.m = 1;
	  };
	}
	
	// r OR pair to r
	function orRmm(r, r1, r2) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(pairRegister(registers, r1, r2));
	    var result = registers[r] | value;
	    or8(registers, r, result);
	    registers.m = 2;
	  };
	}
	
	// r OR n to r
	function orRn(r) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(registers.pc);
	    registers.pc++;
	    var result = registers[r] | value;
	    or8(registers, r, result);
	    registers.m = 2;
	  };
	}
	
	// XOR 8-Bit helper
	function xor8(registers, r, result) {
	  registers[r] = result;
	  var flags = 0;
	  if (result === 0) flags |= 128;
	  registers.f = flags;
	}
	
	// r1 XOR r2 to r1
	function xorRr(r1, r2) {
	  return function (registers) {
	    var result = registers[r1] ^ registers[r2];
	    xor8(registers, r1, result);
	    registers.m = 1;
	  };
	}
	
	// r XOR pair to r
	function xorRmm(r, r1, r2) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(pairRegister(registers, r1, r2));
	    var result = registers[r] ^ value;
	    xor8(registers, r, result);
	    registers.m = 2;
	  };
	}
	
	// r XOR n to r
	function xorRn(r) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(registers.pc);
	    registers.pc++;
	    var result = registers[r] ^ value;
	    xor8(registers, r, result);
	    registers.m = 2;
	  };
	}
	
	// CP 8-Bit helper
	function cp8(registers, r, result) {
	  var value = registers[r];
	  var flags = 64;
	  // Check if first four bits are smaller than first four subtracted
	  if ((value & 0xF) < (result & 0xF)) flags |= 32;
	  if (result < 0) flags |= 16;
	  if (registers[r] === 0) flags |= 128;
	  registers.f = flags;
	}
	
	// Compare r1 with r2 (r1 - r2)
	function cpRr(r1, r2) {
	  return function (registers) {
	    var result = registers[r1] - registers[r2];
	    cp8(registers, r1, result);
	    registers.m = 1;
	  };
	}
	
	// Compare r1 with pair (r1 - pair)
	function cpRmm(r, r1, r2) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(pairRegister(registers, r1, r2));
	    var result = registers[r] - value;
	    cp8(registers, r, result);
	    registers.m = 2;
	  };
	}
	
	// Compare r with n (r - n)
	function cpRn(r) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(registers.pc);
	    registers.pc++;
	    var result = registers[r] - value;
	    cp8(result);
	    registers.m = 2;
	  };
	}
	
	// Increment register r
	function incR(r) {
	  return function (registers) {
	    var result = registers[r] + 1;
	    registers[r] = result & 0xFF;
	    var flags = registers.f & 16;
	    if (registers[r] === 0) flags |= 128;
	    if ((result & 8) === 8) flags |= 32;
	    registers.f = flags;
	    registers.m = 1;
	  };
	}
	
	// Increment value at pair
	function incMM(r1, r2) {
	  return function (registers, mmu) {
	    var address = pairRegister(registers, r1, r2);
	    var result = mmu.readByte(address) + 1;
	    mmu.writeByte(address, result & 0xFF);
	    var flags = registers.f & 16;
	    if ((result & 0xFF) === 0) flags |= 128;
	    if ((result & 8) === 8) flags |= 32;
	    registers.f = flags;
	    registers.m = 3;
	  };
	}
	
	// Decrement register r
	function decR(r) {
	  return function (registers) {
	    var prev = registers[r];
	    var result = registers[r] - 1;
	    registers[r] = result & 0xFF;
	    var flags = registers.f & 16;
	    flags |= 64;
	    if ((result & 0xFF) === 0) flags |= 128;
	    if ((prev & 0xF) < (result & 0xF)) flags |= 32;
	    registers.f = flags;
	    registers.m = 1;
	  };
	}
	
	// Decrement value at pair
	function decMM(r1, r2) {
	  return function (registers, mmu) {
	    var address = pairRegister(registers, r1, r2);
	    var prev = mmu.readByte(address);
	    var result = prev - 1;
	    mmu.writeByte(address, result & 0xFF);
	    var flags = registers.f & 16;
	    flags |= 64;
	    if ((result & 0xFF) === 0) flags |= 128;
	    if ((prev & 0xF) < (result & 0xF)) flags |= 32;
	    registers.f = flags;
	    registers.m = 3;
	  };
	}
	
	// 16-Bit ALU
	
	// Add r3r4 pair to r1r2
	function addRRrr(r1, r2, r3, r4) {
	  return function (registers) {
	    var p1 = pairRegister(registers, r1, r2);
	    var p2 = pairRegister(registers, r3, r4);
	    var result = p1 + p2;
	    var final = result & 0xFFFF;
	    registers[r1] = final >> 8;
	    registers[r2] = final & 0xFF;
	    var flags = registers.f & 128;
	    if ((result & 2048) === 2048) {
	      flags |= 32;
	    }
	    if ((result & 32768) === 32768) {
	      flags |= 16;
	    }
	    registers.f = flags;
	    registers.m = 2;
	  };
	}
	
	// App sp to pair
	function addRRsp(r1, r2) {
	  return function (registers) {
	    var value = pairRegister(registers, r1, r2);
	    var result = value + registers.sp;
	    var final = result & 0xFFFF;
	    registers[r1] = final >> 8;
	    registers[r2] = final & 0xFF;
	    var flags = registers.f & 128;
	    if ((result & 2048) === 2048) {
	      flags |= 32;
	    }
	    if ((result & 32768) === 32768) {
	      flags |= 16;
	    }
	    registers.f = flags;
	    registers.m = 2;
	  };
	}
	
	// add n to SP
	// (May be wrong due to negative)
	function addSPn() {
	  return function (registers, mmu) {
	    var value = mmu.readByte(registers.pc);
	    registers.pc++;
	    if (value >= 128) value = -(~value + 1 & 0xFF);
	    var sum = registers.sp + value & 0xFFFF;
	    registers.sp = sum;
	    var result = registers.sp ^ value ^ sum;
	    var flags = 0;
	    if ((result & 0x10) === 0x10) flags |= 32;
	    if ((result & 0x100) === 0x100) flags |= 16;
	    registers.f = flags;
	    registers.m = 4;
	  };
	}
	
	// Increment RR
	function incRR(r1, r2) {
	  return function (registers) {
	    var value = pairRegister(r1, r2) + 1 & 0xFFFF;
	    registers[r1] = value >> 8;
	    registers[r2] = value & 0xFF;
	    registers.m = 2;
	  };
	}
	
	function incSP() {
	  return function (registers) {
	    registers.sp = registers.sp + 1 & 0xFFFF;
	    registers.m = 2;
	  };
	}
	
	// Decrement RR
	function decRR(r1, r2) {
	  return function (registers) {
	    var value = pairRegister(r1, r2) - 1 & 0xFFFF;
	    registers[r1] = value >> 8;
	    registers[r2] = value & 0xFF;
	    registers.m = 2;
	  };
	}
	
	function decSP() {
	  return function (registers) {
	    registers.sp = registers.sp - 1 & 0xFFFF;
	    registers.m = 2;
	  };
	}
	
	// Misc
	
	// Swap upper and lower nibles of n
	function swapR(r) {
	  return function (registers) {
	    var result = registers[r] >> 4 + (registers[r] & 0xF) << 4;
	    registers[r] = result;
	    var flags = 0;
	    if (result === 0) flags |= 128;
	    registers.f = flags;
	    registers.m = 2;
	  };
	}
	
	// Swap value at address
	function swapMM(r1, r2) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(pairRegister(registers, r1, r2));
	    var result = value >> 4 + (value & 0xF) << 4;
	    var flags = 0;
	    if (result === 0) flags |= 128;
	    registers.f = flags;
	    registers.m = 4;
	  };
	}
	
	// Decimal adjust register r
	function daR(r) {
	  return function (registers) {
	    var flags = 0;
	    if (!getSubtraction(registers)) {
	      if (getCarry(registers) || registers[r] > 0x99) {
	        registers[r] = registers[r] + 0x60 & 0xFF;
	        flags |= 16;
	      }
	      if (getHalfCarry(registers) || (registers[r] & 0xF) > 0x9) {
	        registers[r] = registers[r] + 0x06 & 0xFF;
	        flags |= 32;
	      }
	    } else if (getCarry(registers) && getHalfCarry(registers)) {
	      registers[r] = registers[r] + 0x9A & 0xFF;
	      flags |= 32;
	    } else if (getCarry(registers)) {
	      registers[r] = registers[r] + 0xA0 & 0xFF;
	    } else if (getHalfCarry(registers)) {
	      registers[r] = registers[r] + 0xFA & 0xFF;
	    }
	    if (registers[r] === 0) flags |= 128;
	    registers.f = flags;
	    registers.m = 1;
	  };
	}
	
	// Complement r
	function cplR(r) {
	  return function (registers) {
	    registers[r] ^= 0xFF;
	    registers.f |= 96;
	    registers.m = 1;
	  };
	}
	
	// Complement carry flag
	function ccf() {
	  return function (registers) {
	    var flags = registers.f & 128;
	    if (!getCarry(registers)) {
	      flags |= 16;
	    }
	    registers.f = flags;
	    registers.m = 1;
	  };
	}
	
	// Set carry flag
	function scf() {
	  return function (registers) {
	    registers.f &= 144;
	    registers.m = 1;
	  };
	}
	
	// No operation
	function nop() {
	  return function (registers) {
	    registers.m = 1;
	  };
	}
	
	function halt() {
	  return function (registers) {
	    registers.halt = 1;
	    registers.m = 1;
	  };
	}
	
	function stop() {
	  return function (registers) {
	    registers.stop = 1;
	    registers.m = 1;
	  };
	}
	
	function di() {
	  return function (registers) {
	    registers.interrupt = 0;
	    registers.m = 1;
	  };
	}
	
	function ei() {
	  return function (registers) {
	    registers.interrupt = 1;
	    registers.m = 1;
	  };
	}
	
	// Rotate r left with new carry and sig dig being carry
	function rlcR(r, isCB) {
	  return function (registers) {
	    var result = registers[r];
	    var flags = (result & 128) >> 3;
	    var carry = flags === 16 ? 1 : 0;
	    result = result << 1 & 0xFF | carry;
	    if (result === 0) flags |= 128;
	    registers[r] = result;
	    registers.f = flags;
	    registers.m = isCB ? 2 : 1;
	  };
	}
	
	// Rotate r  pair left with new carry and sig dig being carry
	function rlcMM(r1, r2) {
	  return function (registers, mmu) {
	    var pair = pairRegister(registers, r1, r2);
	    var result = mmu.readByte(pair);
	    var flags = (result & 128) >> 3;
	    var carry = flags === 16 ? 1 : 0;
	    result = result << 1 & 0xFF | carry;
	    if (result === 0) flags |= 128;
	    mmu.writeByte(pair, result);
	    registers.f = flags;
	    registers.m = 4;
	  };
	}
	
	// Rotate through current carry flag
	function rlR(r, isCB) {
	  return function (registers) {
	    var result = registers[r];
	    var flags = (result & 128) >> 3;
	    var carry = getCarry(registers) ? 1 : 0;
	    result = result << 1 & 0xFF | carry;
	    if (result === 0) flags |= 128;
	    registers[r] = result;
	    registers.f = flags;
	    registers.m = isCB ? 2 : 1;
	  };
	}
	
	// Rotate pair through current carry flag
	function rlMM(r1, r2) {
	  return function (registers, mmu) {
	    var pair = pairRegister(registers, r1, r2);
	    var result = mmu.readByte(pair);
	    var flags = (result & 128) >> 3;
	    var carry = getCarry(registers) ? 1 : 0;
	    result = result << 1 & 0xFF | carry;
	    if (result === 0) flags |= 128;
	    mmu.writeByte(pair, result);
	    registers.f = flags;
	    registers.m = 4;
	  };
	}
	
	// Rotate r right with new carry and 0 bit being carry
	function rrcR(r, isCB) {
	  return function (registers) {
	    var result = registers[r];
	    var flags = (result & 1) << 4;
	    var carry = flags === 16 ? 128 : 0;
	    result = result >> 1 | carry;
	    if (result === 0) flags |= 128;
	    registers[r] = result;
	    registers.f = flags;
	    registers.m = isCB ? 2 : 1;
	  };
	}
	
	// Rotate through current carry flag
	function rrR(r, isCB) {
	  return function (registers) {
	    var result = registers[r];
	    var flags = (result & 1) << 4;
	    var carry = getCarry(registers) ? 128 : 0;
	    result = result >> 1 | carry;
	    if (result === 0) flags |= 128;
	    registers[r] = result;
	    registers.f = flags;
	    registers.m = isCB ? 2 : 1;
	  };
	}
	
	// Rotate pair right with new carry and 0 bit being carry
	function rrcMM(r1, r2) {
	  return function (registers, mmu) {
	    var pair = pairRegister(r1, r2);
	    var result = mmu.readByte(pair);
	    var flags = (result & 1) << 4;
	    var carry = flags === 16 ? 128 : 0;
	    result = result >> 1 | carry;
	    if (result === 0) flags |= 128;
	    mmu.writeByte(pair, result);
	    registers.f = flags;
	    registers.m = 4;
	  };
	}
	
	// Rotate pair through current carry flag
	function rrMM(r1, r2) {
	  return function (registers, mmu) {
	    var pair = pairRegister(r1, r2);
	    var result = mmu.readByte(pair);
	    var flags = (result & 1) << 4;
	    var carry = getCarry(registers) ? 128 : 0;
	    result = result >> 1 | carry;
	    if (result === 0) flags |= 128;
	    mmu.writeByte(pair, result);
	    registers.f = flags;
	    registers.m = 4;
	  };
	}
	
	// Shift r left into carry
	function slaR(r) {
	  return function (registers) {
	    var result = registers[r];
	    var flags = (result & 128) >> 3;
	    result = result << 1 & 0xFF;
	    if (result === 0) flags |= 128;
	    registers[r] = result;
	    registers.f = flags;
	    registers.m = 2;
	  };
	}
	
	// Shift pair left into carry
	function slaMM(r1, r2) {
	  return function (registers, mmu) {
	    var pair = pairRegister(registers, r1, r2);
	    var result = mmu.readByte(pair);
	    var flags = (result & 128) >> 3;
	    result = result << 1 & 0xFF;
	    if (result === 0) flags |= 128;
	    mmu.writeByte(pair, result);
	    registers.f = flags;
	    registers.m = 4;
	  };
	}
	
	// Shift r right into carry, MSB unchanged
	function sraR(r) {
	  return function (registers) {
	    var result = registers[r];
	    var flags = (result & 1) << 4;
	    result = result >> 1 | result & 128;
	    if (result === 0) flags |= 128;
	    registers[r] = result;
	    registers.f = flags;
	    registers.m = 2;
	  };
	}
	
	// Shift pair right into carry, MSB unchanged
	function sraMM(r1, r2) {
	  return function (registers, mmu) {
	    var pair = pairRegister(r1, r2);
	    var result = mmu.readByte(pair);
	    var flags = (result & 1) << 4;
	    result = result >> 1 | result * 128;
	    if (result === 0) flags |= 128;
	    mmu.writeByte(pair, result);
	    registers.f = flags;
	    registers.m = 4;
	  };
	}
	
	// Shift r right into carry, MSB 0
	function srlR(r) {
	  return function (registers) {
	    var result = registers[r];
	    var flags = (result & 1) << 4;
	    result >>= 1;
	    if (result === 0) flags |= 128;
	    registers[r] = result;
	    registers.f = flags;
	    registers.m = 2;
	  };
	}
	
	// Shift pair right into carry, MSB 0
	function srlMM(r1, r2) {
	  return function (registers, mmu) {
	    var pair = pairRegister(r1, r2);
	    var result = mmu.readByte(pair);
	    var flags = (result & 1) << 4;
	    result >>= 1;
	    if (result === 0) flags |= 128;
	    mmu.writeByte(pair, result);
	    registers.f = flags;
	    registers.m = 4;
	  };
	}
	
	// Get bit at value.
	function getBit(bit, value) {
	  return value >> bit & 1;
	}
	
	// Return number with set or reset.
	function setBit(bit, value, isSet) {
	  if (isSet) {
	    return value | 1 << bit;
	  }
	
	  var mask = 0xFF - (1 << bit);
	  return value & mask;
	}
	
	// Test bit b in register r
	function bitBr(b, r) {
	  return function (registers) {
	    var result = getBit(b, r);
	    var flags = registers.f & 63;
	    if (result === 0) flags |= 128;
	    registers.f = flags;
	    registers.m = 2;
	  };
	}
	
	// Test bit b in register pair
	function bitBmm(b, r1, r2) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(pairRegister(registers, r1, r2));
	    var result = getBit(b, value);
	    var flags = registers.f & 63;
	    if (result === 0) flags |= 128;
	    registers.f = flags;
	    registers.m = 4;
	  };
	}
	
	// Set a bit at b in register r
	function setBr(b, r) {
	  return function (registers) {
	    registers[r] = setBit(b, r, true);
	    registers.m = 2;
	  };
	}
	
	// Set a bit at b in register pair
	function setBmm(b, r1, r2) {
	  return function (registers, mmu) {
	    var pair = pairRegister(registers, r1, r2);
	    var value = setBit(b, mmu.readByte(pair), true);
	    mmu.writeByte(pair, value);
	    registers.m = 4;
	  };
	}
	
	// Reset a bit at b in register r
	function resBr(b, r) {
	  return function (registers) {
	    registers[r] = setBit(b, r, false);
	    registers.m = 2;
	  };
	}
	
	// Reset a bit at b in register pair
	function resBmm(b, r1, r2) {
	  return function (registers, mmu) {
	    var pair = pairRegister(registers, r1, r2);
	    var value = setBit(b, mmu.readByte(pair), false);
	    mmu.writeByte(pair, value);
	    registers.m = 4;
	  };
	}
	
	function jumpNN() {
	  return function (registers, mmu) {
	    registers.pc = mmu.readWord(registers.pc);
	    registers.m = 3;
	  };
	}
	
	function shouldJump(registers, type) {
	  if (type === 'NZ') return getZero(registers) === 0;
	  if (type === 'Z') return getZero(registers) === 1;
	  if (type === 'NC') return getCarry(registers) === 0;
	  if (type === 'C') return getCarry(registers) === 1;
	  return false;
	}
	
	function jumpCCnn(type) {
	  return function (registers, mmu) {
	    if (shouldJump(registers, type)) {
	      registers.pc = mmu.readWord(registers.pc);
	    } else {
	      registers.pc += 2;
	    }
	    registers.m = 3;
	  };
	}
	
	function jumpMM(r1, r2) {
	  return function (registers) {
	    registers.pc = pairRegister(registers, r1, r2);
	    registers.m = 1;
	  };
	}
	
	function jumpCurrentN() {
	  return function (registers, mmu) {
	    registers.pc += mmu.readByte(registers.pc) << 24 >> 24 + 1;
	    registers.m = 2;
	  };
	}
	
	function jumpCurrentCCn(type) {
	  return function (registers, mmu) {
	    if (shouldJump(registers, type)) {
	      registers.pc += mmu.readByte(registers.pc) << 24 >> 24 + 1;
	    } else {
	      registers.pc++;
	    }
	    registers.m = 2;
	  };
	}
	
	function callNN() {
	  return function (registers, mmu) {
	    registers.sp -= 2;
	    mmu.writeWord(registers.sp, registers.pc + 2);
	    registers.pc = mmu.readWord(registers.pc);
	    registers.m = 3;
	  };
	}
	
	function callCCnn(type) {
	  return function (registers, mmu) {
	    if (shouldJump(registers, type)) {
	      registers.sp -= 2;
	      mmu.writeWord(registers.sp, registers.pc + 2);
	      registers.pc = mmu.readWord(registers.pc);
	    } else {
	      registers.pc += 2;
	    }
	    registers.m = 3;
	  };
	}
	
	// 8-Bit load operations
	// LD nn,n
	codes[0x06] = ldRn('b');
	codes[0x0E] = ldRn('c');
	codes[0x16] = ldRn('d');
	codes[0x1E] = ldRn('e');
	codes[0x26] = ldRn('h');
	codes[0x2E] = ldRn('l');
	
	// LD r1,r2
	codes[0x7F] = ldR1R2('a', 'a');
	codes[0x78] = ldR1R2('a', 'b');
	codes[0x79] = ldR1R2('a', 'c');
	codes[0x7A] = ldR1R2('a', 'd');
	codes[0x7B] = ldR1R2('a', 'e');
	codes[0x7C] = ldR1R2('a', 'h');
	codes[0x7D] = ldR1R2('a', 'l');
	codes[0x0A] = ldRmm('a', 'b', 'c');
	codes[0x1A] = ldRmm('a', 'd', 'e');
	codes[0x7E] = ldRmm('a', 'h', 'l');
	codes[0xFA] = ldRnn('a');
	codes[0x3E] = ldRn('a');
	(function () {
	  // Generate b to l
	  var registers = ['b', 'c', 'd', 'e', 'h', 'l'];
	  var current = 0x40;
	  for (var i = 0; i < registers.length; ++i) {
	    for (var j = 0; j < registers.length; ++j) {
	      codes[current] = ldR1R2(registers[i], registers[j]);
	      current++;
	    }
	    // LD n,A
	    codes[current] = ldR1R2(registers[i], 'a');
	    current++;
	    // LD n,(HL)
	    codes[current] = ldRmm(registers[i], 'h', 'l');
	    current++;
	  }
	
	  // Generate (hl)
	  for (var _i = 0; _i < registers.length; ++_i) {
	    codes[current] = ldMMr('h', 'l', registers[_i]);
	    current++;
	  }
	  codes[0x36] = ldMMn('h', 'l');
	})();
	// LD n,A
	codes[0x02] = ldMMr('b', 'c', 'a');
	codes[0x12] = ldMMr('d', 'e', 'a');
	codes[0x77] = ldMMr('h', 'l', 'a');
	codes[0xEA] = ldNNr('a');
	// LD A,(C)
	codes[0xF2] = ldLoRr('a', 'c');
	// LD (C),A
	codes[0xE2] = ldRrLo('c', 'a');
	// LD A,(HLD)
	codes[0x3A] = ldRmmDec('a', 'h', 'l');
	// LD (HLD),A
	codes[0x32] = ldMMrDec('h', 'l', 'a');
	// LD A,(HLI)
	codes[0x2A] = ldRmmInc('a', 'h', 'l');
	// LD (HLI),A
	codes[0x22] = ldMMrInc('h', 'l', 'a');
	// LDH (n),A
	codes[0xE0] = ldLoNr('a');
	// LDH A,(n)
	codes[0xF0] = ldLoRn('a');
	
	// 16-Bit load operations
	
	// LD n,nn
	codes[0x01] = ldRRnn('b', 'c');
	codes[0x11] = ldRRnn('d', 'e');
	codes[0x21] = ldRRnn('h', 'l');
	codes[0x31] = ldSPnn();
	// LD SP,HL
	codes[0xF9] = ldSPmm('h', 'l');
	// LDHL SP,n
	codes[0xF8] = ldRRspN('h', 'l');
	// LD (nn),SP
	codes[0x08] = ldNNsp();
	
	// PUSH nn
	codes[0xF5] = pushRR('a', 'f');
	codes[0xC5] = pushRR('b', 'c');
	codes[0xD5] = pushRR('d', 'e');
	codes[0xE5] = pushRR('h', 'l');
	
	// POP nn
	codes[0xF1] = popRR('a', 'f');
	codes[0xC1] = popRR('b', 'c');
	codes[0xD1] = popRR('d', 'e');
	codes[0xE1] = popRR('h', 'l');
	
	// 8-Bit ALU operations
	
	// ADD A,n
	codes[0x87] = addRr('a', 'a');
	codes[0x80] = addRr('a', 'b');
	codes[0x81] = addRr('a', 'c');
	codes[0x82] = addRr('a', 'd');
	codes[0x83] = addRr('a', 'e');
	codes[0x84] = addRr('a', 'h');
	codes[0x85] = addRr('a', 'l');
	codes[0x86] = addRmm('a', 'h', 'l');
	codes[0xC6] = addRn('a');
	
	// ADC A,n
	codes[0x8F] = addCrR('a', 'a');
	codes[0x88] = addCrR('a', 'b');
	codes[0x89] = addCrR('a', 'c');
	codes[0x8A] = addCrR('a', 'd');
	codes[0x8B] = addCrR('a', 'e');
	codes[0x8C] = addCrR('a', 'h');
	codes[0x8D] = addCrR('a', 'l');
	codes[0x8E] = addCrMM('a', 'h', 'l');
	codes[0xCE] = addCrN('a');
	
	// SUB n
	codes[0x97] = subRr('a', 'a');
	codes[0x90] = subRr('a', 'b');
	codes[0x91] = subRr('a', 'c');
	codes[0x92] = subRr('a', 'd');
	codes[0x93] = subRr('a', 'e');
	codes[0x94] = subRr('a', 'h');
	codes[0x95] = subRr('a', 'l');
	codes[0x96] = subRmm('a', 'h', 'l');
	codes[0xD6] = subRn('a');
	
	// SBC A,n
	codes[0x9F] = subCrR('a', 'a');
	codes[0x98] = subCrR('a', 'b');
	codes[0x99] = subCrR('a', 'c');
	codes[0x9A] = subCrR('a', 'd');
	codes[0x9B] = subCrR('a', 'e');
	codes[0x9C] = subCrR('a', 'h');
	codes[0x9D] = subCrR('a', 'l');
	codes[0x9E] = subCrMM('a', 'h', 'l');
	
	// AND n
	codes[0xA7] = andRr('a', 'a');
	codes[0xA0] = andRr('a', 'b');
	codes[0xA1] = andRr('a', 'c');
	codes[0xA2] = andRr('a', 'd');
	codes[0xA3] = andRr('a', 'e');
	codes[0xA4] = andRr('a', 'h');
	codes[0xA5] = andRr('a', 'l');
	codes[0xA6] = andRmm('a', 'h', 'l');
	codes[0xE6] = andRn('a');
	
	// OR n
	codes[0xB7] = orRr('a', 'a');
	codes[0xB0] = orRr('a', 'b');
	codes[0xB1] = orRr('a', 'c');
	codes[0xB2] = orRr('a', 'd');
	codes[0xB3] = orRr('a', 'e');
	codes[0xB4] = orRr('a', 'h');
	codes[0xB5] = orRr('a', 'l');
	codes[0xB6] = orRmm('a', 'h', 'l');
	codes[0xF6] = orRn('a');
	
	// XOR n
	codes[0xAF] = xorRr('a', 'a');
	codes[0xA8] = xorRr('a', 'b');
	codes[0xA9] = xorRr('a', 'c');
	codes[0xAA] = xorRr('a', 'd');
	codes[0xAB] = xorRr('a', 'e');
	codes[0xAC] = xorRr('a', 'h');
	codes[0xAD] = xorRr('a', 'l');
	codes[0xAE] = xorRmm('a', 'h', 'l');
	codes[0xEE] = xorRn('a');
	
	// CP n
	codes[0xBF] = cpRr('a', 'a');
	codes[0xB8] = cpRr('a', 'b');
	codes[0xB9] = cpRr('a', 'c');
	codes[0xBA] = cpRr('a', 'd');
	codes[0xBB] = cpRr('a', 'e');
	codes[0xBC] = cpRr('a', 'h');
	codes[0xBD] = cpRr('a', 'l');
	codes[0xBE] = cpRmm('a', 'h', 'l');
	codes[0xFE] = cpRn('a');
	
	// INC n
	codes[0x3C] = incR('a');
	codes[0x04] = incR('b');
	codes[0x0C] = incR('c');
	codes[0x14] = incR('d');
	codes[0x1C] = incR('e');
	codes[0x24] = incR('h');
	codes[0x2C] = incR('l');
	codes[0x34] = incMM('h', 'l');
	
	// DEC n
	codes[0x3D] = decR('a');
	codes[0x05] = decR('b');
	codes[0x0D] = decR('c');
	codes[0x15] = decR('d');
	codes[0x1D] = decR('e');
	codes[0x25] = decR('h');
	codes[0x2D] = decR('l');
	codes[0x35] = decMM('h', 'l');
	
	// 16-Bit ALU
	
	// ADD HL,n
	codes[0x09] = addRRrr('h', 'l', 'b', 'c');
	codes[0x19] = addRRrr('h', 'l', 'd', 'e');
	codes[0x29] = addRRrr('h', 'l', 'h', 'l');
	codes[0x39] = addRRsp('h', 'l');
	
	// ADD SP,n
	codes[0xE8] = addSPn();
	
	// INC nn
	codes[0x03] = incRR('b', 'c');
	codes[0x13] = incRR('d', 'e');
	codes[0x23] = incRR('h', 'l');
	codes[0x33] = incSP();
	
	// DEC nn
	codes[0x0B] = decRR('b', 'c');
	codes[0x1B] = decRR('d', 'e');
	codes[0x2B] = decRR('h', 'l');
	codes[0x3B] = decSP();
	
	// Misc
	
	// SWAP n
	cbOperations[0x37] = swapR('a');
	cbOperations[0x30] = swapR('b');
	cbOperations[0x31] = swapR('c');
	cbOperations[0x32] = swapR('d');
	cbOperations[0x33] = swapR('e');
	cbOperations[0x34] = swapR('h');
	cbOperations[0x35] = swapR('l');
	cbOperations[0x36] = swapMM('h', 'l');
	
	// DAA
	codes[0x27] = daR('a');
	
	// CPL
	codes[0x2F] = cplR('a');
	// CCF
	codes[0x3F] = ccf();
	// SCF
	codes[0x37] = scf();
	// NOP
	codes[0x00] = nop();
	// HALT
	codes[0x76] = halt();
	// STOP
	codes[0x1000] = stop();
	// DI
	codes[0xF3] = di();
	// EI
	codes[0xFB] = ei();
	
	// RLCA
	codes[0x07] = rlcR('a');
	// RLA
	codes[0x17] = rlR('a');
	// RRCA
	codes[0x0F] = rrcR('a');
	// RRA
	codes[0x1F] = rrR('a');
	
	// RLC n
	cbOperations[0x07] = rlcR('a', true);
	cbOperations[0x00] = rlcR('b', true);
	cbOperations[0x01] = rlcR('c', true);
	cbOperations[0x02] = rlcR('d', true);
	cbOperations[0x03] = rlcR('e', true);
	cbOperations[0x04] = rlcR('h', true);
	cbOperations[0x05] = rlcR('l', true);
	cbOperations[0x06] = rlcMM('h', 'l');
	
	// RL n
	cbOperations[0x17] = rlR('a', true);
	cbOperations[0x10] = rlR('b', true);
	cbOperations[0x11] = rlR('c', true);
	cbOperations[0x12] = rlR('d', true);
	cbOperations[0x13] = rlR('e', true);
	cbOperations[0x14] = rlR('h', true);
	cbOperations[0x15] = rlR('l', true);
	cbOperations[0x16] = rlMM('h', 'l');
	
	// RRC n
	cbOperations[0x0F] = rrcR('a', true);
	cbOperations[0x08] = rrcR('b', true);
	cbOperations[0x09] = rrcR('c', true);
	cbOperations[0x0A] = rrcR('d', true);
	cbOperations[0x0B] = rrcR('e', true);
	cbOperations[0x0C] = rrcR('h', true);
	cbOperations[0x0D] = rrcR('l', true);
	cbOperations[0x0E] = rrcMM('h', 'l');
	
	// RR n
	cbOperations[0x1F] = rrR('a', true);
	cbOperations[0x18] = rrR('b', true);
	cbOperations[0x19] = rrR('c', true);
	cbOperations[0x1A] = rrR('d', true);
	cbOperations[0x1B] = rrR('e', true);
	cbOperations[0x1C] = rrR('h', true);
	cbOperations[0x1D] = rrR('l', true);
	cbOperations[0x1E] = rrMM('h', 'l');
	
	// SLA n
	cbOperations[0x27] = slaR('a');
	cbOperations[0x20] = slaR('b');
	cbOperations[0x21] = slaR('c');
	cbOperations[0x22] = slaR('d');
	cbOperations[0x23] = slaR('e');
	cbOperations[0x24] = slaR('h');
	cbOperations[0x25] = slaR('l');
	cbOperations[0x26] = slaMM('h', 'l');
	
	// SRA n
	cbOperations[0x2F] = sraR('a');
	cbOperations[0x28] = sraR('b');
	cbOperations[0x29] = sraR('c');
	cbOperations[0x2A] = sraR('d');
	cbOperations[0x2B] = sraR('e');
	cbOperations[0x2C] = sraR('h');
	cbOperations[0x2D] = sraR('l');
	cbOperations[0x2E] = sraMM('h', 'l');
	
	// SRL n
	cbOperations[0x3F] = srlR('a');
	cbOperations[0x38] = srlR('b');
	cbOperations[0x39] = srlR('c');
	cbOperations[0x3A] = srlR('d');
	cbOperations[0x3B] = srlR('e');
	cbOperations[0x3C] = srlR('h');
	cbOperations[0x3D] = srlR('l');
	cbOperations[0x3E] = srlMM('h', 'l');
	
	(function () {
	  function bitop(start, fnR, fnMM) {
	    var registers = ['b', 'c', 'd', 'e', 'h', 'l', 'hl', 'a'];
	    var bits = 8;
	    var code = 0x40;
	    for (var i = 0; i < bits; ++i) {
	      for (var j = 0; j < registers.length; ++j) {
	        var char = registers[j];
	        if (char === 'hl') {
	          cbOperations[code] = fnMM(i, 'h', 'l');
	        } else {
	          cbOperations[code] = fnR(i, char);
	        }
	        code++;
	      }
	    }
	  }
	
	  // BIT b,r
	  bitop(0x40, bitBr, bitBmm);
	  // SET b,r
	  bitop(0xC0, setBr, setBmm);
	  // RES b,r
	  bitop(0x80, resBr, resBmm);
	})();
	
	// JP nn
	codes[0xC3] = jumpNN();
	// JP cc,nn
	codes[0xC2] = jumpCCnn('NZ');
	codes[0xCA] = jumpCCnn('Z');
	codes[0xD2] = jumpCCnn('NC');
	codes[0xDA] = jumpCCnn('C');
	// JP (HL)
	codes[0xE9] = jumpMM('h', 'l');
	// JR n
	codes[0x18] = jumpCurrentN();
	// JR cc,n
	codes[0x20] = jumpCurrentCCn('NZ');
	codes[0x28] = jumpCurrentCCn('Z');
	codes[0x30] = jumpCurrentCCn('NC');
	codes[0x38] = jumpCurrentCCn('C');
	
	// CALL nn
	codes[0xCD] = callNN();
	// CALL cc,nn
	codes[0xC4] = callCCnn('NZ');
	codes[0xCC] = callCCnn('Z');
	codes[0xD4] = callCCnn('NC');
	codes[0xDC] = callCCnn('C');
	
	exports.default = operations;

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * Binds itself to an element and updates based on the value in the object.
	 */
	
	var DataElement = function () {
	  function DataElement(element, object, key) {
	    _classCallCheck(this, DataElement);
	
	    this._element = element;
	    this._object = object;
	    this._key = key;
	    this._prev = null;
	  }
	
	  _createClass(DataElement, [{
	    key: "update",
	    value: function update() {
	      var value = this._object[this._key];
	      if (this._prev !== value) {
	        this._element.textContent = value;
	        this._prev = value;
	      }
	    }
	  }]);
	
	  return DataElement;
	}();
	
	exports.default = DataElement;

/***/ },
/* 5 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map