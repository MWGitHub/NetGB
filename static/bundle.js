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
	
	var _operations = __webpack_require__(11);
	
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
	      m: 0 // Clock last instruction
	
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
/* 3 */,
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

/***/ },
/* 10 */,
/* 11 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var operations = {};
	
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
	function ldRRspN(r1, r2) {
	  return function (registers, mmu) {
	    var value = mmu.readByte(registers.pc);
	    if (value > 127) value = -(~value + 1 & 255);
	    var address = registers.sp + value & 0xFFFF;
	    registers.pc++;
	    registers[r1] = address >> 8;
	    registers[r2] = address & 0x00FF;
	    // XOR inputs to detect overflow
	    value = registers.sp ^ value ^ address;
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
	(function () {
	  // Generate b to l
	  var registers = ['b', 'c', 'd', 'e', 'h', 'l'];
	  var current = 0x40;
	  for (var i = 0; i < registers.length; ++i) {
	    for (var j = 0; j < registers.length; ++j) {
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
	  for (var _i = 0; _i < registers.length; ++_i) {
	    operations[current] = ldMMr('h', 'l', registers[_i]);
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
	
	exports.default = operations;

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map