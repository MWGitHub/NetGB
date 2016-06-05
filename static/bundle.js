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
	
	var _dataElement = __webpack_require__(3);
	
	var _dataElement2 = _interopRequireDefault(_dataElement);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	__webpack_require__(4);
	__webpack_require__(8);
	
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
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var CPU = function () {
	  function CPU(mmu) {
	    _classCallCheck(this, CPU);
	
	    this._mmu = mmu;
	
	    this._clock = {
	      m: 0,
	      t: 0
	    };
	
	    this._registers = {
	      // 8-bit         16-bit
	      // Hi    Lo
	      a: 0, f: 0, // Accumulator & Flags
	      b: 0, c: 0, // BC
	      d: 0, e: 0, // DE
	      h: 0, l: 0, // HL
	      // 16-bit
	      sp: 0, // Stack Pointer
	      pc: 0, // Program Counter
	      m: 0, // Clock last instruction
	      t: 0
	    };
	
	    // Map for the operations
	    this._map = [];
	  }
	
	  _createClass(CPU, [{
	    key: "step",
	    value: function step() {
	      var op = this._mmu.readByte(this._registers.pc);
	      this._registers.pc++;
	
	      if (this._map[op]) {
	        this._map[op]();
	      } else {
	        throw new Error("No map matching " + op);
	      }
	
	      this._registers.pc &= 65535;
	      this._clock.m += this._registers.m;
	      this._clock.t += this._registers.y;
	    }
	  }, {
	    key: "add",
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
	      this._registers.t = 4;
	    }
	  }, {
	    key: "compare",
	    value: function compare() {
	      var temp = this._registers.a;
	      temp -= this._registers.b;
	      this._registers.f |= 0x40;
	      if (!(temp & 255)) this._registers.f |= 0x80;
	      if (temp < 0) this._registers.f |= 0x10;
	      this._registers.m = 1;
	      this._registers.t = 4;
	    }
	  }, {
	    key: "nop",
	    value: function nop() {
	      this._registers.m = 1;
	      this._registers.t = 4;
	    }
	  }, {
	    key: "pushbc",
	    value: function pushbc() {
	      this._registers.sp--;
	      this._mmu.writeByte(this._registers.sp, this._registers.b);
	      this._registers.sp--;
	      this._mmu.writeByte(this._registers.sp, this._registers.c);
	      this._registers.m = 3;
	      this._registers.t = 12;
	    }
	  }, {
	    key: "pophl",
	    value: function pophl() {
	      this._registers.l = this._mmu.readByte(this._registers.sp);
	      this._registers.sp++;
	      this._registers.h = this._mmu.readByte(this._registers.sp);
	      this._registers.sp++;
	      this._registers.m = 3;
	      this._registers.t = 12;
	    }
	  }, {
	    key: "ldamm",
	    value: function ldamm() {
	      var address = this._mmu.readWord(this._registers.pc);
	      this._registers.pc += 2;
	      this._registers.a = this._mmu.readByte(address);
	      this._registers.m = 4;
	      this._registers.t = 16;
	    }
	  }, {
	    key: "reset",
	    value: function reset() {
	      for (var key in this._registers) {
	        if (!this._registers.hasOwnProperty(key)) continue;
	
	        this._registers[key] = 0;
	      }
	
	      this._clock.m = 0;
	      this._clock.t = 0;
	    }
	  }]);
	
	  return CPU;
	}();
	
	exports.default = CPU;

/***/ },
/* 3 */
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
/* 4 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map