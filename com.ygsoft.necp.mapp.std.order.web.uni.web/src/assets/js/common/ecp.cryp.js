function _ecpSecurityCryptoApi() {
	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	/**
	 * CryptoJS core components.
	 */
	var CryptoJS = CryptoJS || (function(Math, undefined) {
		/**
		 * CryptoJS namespace.
		 */
		var C = {};

		/**
		 * Library namespace.
		 */
		var C_lib = C.lib = {};

		/**
		 * Base object for prototypal inheritance.
		 */
		var Base = C_lib.Base = (function() {
			function F() {}

			return {
				/**
				 * Creates a new object that inherits from this object.
				 *
				 * @param {Object} overrides Properties to copy into the new object.
				 *
				 * @return {Object} The new object.
				 *
				 * @static
				 *
				 * @example
				 *
				 *     var MyType = CryptoJS.lib.Base.extend({
				 *         field: 'value',
				 *
				 *         method: function () {
				 *         }
				 *     });
				 */
				extend: function(overrides) {
					// Spawn
					F.prototype = this;
					var subtype = new F();

					// Augment
					if (overrides) {
						subtype.mixIn(overrides);
					}

					// Create default initializer
					if (!subtype.hasOwnProperty('init')) {
						subtype.init = function() {
							subtype.$super.init.apply(this, arguments);
						};
					}

					// Initializer's prototype is the subtype object
					subtype.init.prototype = subtype;

					// Reference supertype
					subtype.$super = this;

					return subtype;
				},

				/**
				 * Extends this object and runs the init method.
				 * Arguments to create() will be passed to init().
				 *
				 * @return {Object} The new object.
				 *
				 * @static
				 *
				 * @example
				 *
				 *     var instance = MyType.create();
				 */
				create: function() {
					var instance = this.extend();
					instance.init.apply(instance, arguments);

					return instance;
				},

				/**
				 * Initializes a newly created object.
				 * Override this method to add some logic when your objects are created.
				 *
				 * @example
				 *
				 *     var MyType = CryptoJS.lib.Base.extend({
				 *         init: function () {
				 *             // ...
				 *         }
				 *     });
				 */
				init: function() {},

				/**
				 * Copies properties into this object.
				 *
				 * @param {Object} properties The properties to mix in.
				 *
				 * @example
				 *
				 *     MyType.mixIn({
				 *         field: 'value'
				 *     });
				 */
				mixIn: function(properties) {
					for (var propertyName in properties) {
						if (properties.hasOwnProperty(propertyName)) {
							this[propertyName] = properties[propertyName];
						}
					}

					// IE won't copy toString using the loop above
					if (properties.hasOwnProperty('toString')) {
						this.toString = properties.toString;
					}
				},

				/**
				 * Creates a copy of this object.
				 *
				 * @return {Object} The clone.
				 *
				 * @example
				 *
				 *     var clone = instance.clone();
				 */
				clone: function() {
					return this.init.prototype.extend(this);
				}
			};
		}());

		/**
		 * An array of 32-bit words.
		 *
		 * @property {Array} words The array of 32-bit words.
		 * @property {number} sigBytes The number of significant bytes in this word array.
		 */
		var WordArray = C_lib.WordArray = Base.extend({
			/**
			 * Initializes a newly created word array.
			 *
			 * @param {Array} words (Optional) An array of 32-bit words.
			 * @param {number} sigBytes (Optional) The number of significant bytes in the words.
			 *
			 * @example
			 *
			 *     var wordArray = CryptoJS.lib.WordArray.create();
			 *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
			 *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
			 */
			init: function(words, sigBytes) {
				words = this.words = words || [];

				if (sigBytes != undefined) {
					this.sigBytes = sigBytes;
				} else {
					this.sigBytes = words.length * 4;
				}
			},

			/**
			 * Converts this word array to a string.
			 *
			 * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
			 *
			 * @return {string} The stringified word array.
			 *
			 * @example
			 *
			 *     var string = wordArray + '';
			 *     var string = wordArray.toString();
			 *     var string = wordArray.toString(CryptoJS.enc.Utf8);
			 */
			toString: function(encoder) {
				return (encoder || Hex).stringify(this);
			},

			/**
			 * Concatenates a word array to this word array.
			 *
			 * @param {WordArray} wordArray The word array to append.
			 *
			 * @return {WordArray} This word array.
			 *
			 * @example
			 *
			 *     wordArray1.concat(wordArray2);
			 */
			concat: function(wordArray) {
				// Shortcuts
				var thisWords = this.words;
				var thatWords = wordArray.words;
				var thisSigBytes = this.sigBytes;
				var thatSigBytes = wordArray.sigBytes;

				// Clamp excess bits
				this.clamp();

				// Concat
				if (thisSigBytes % 4) {
					// Copy one byte at a time
					for (var i = 0; i < thatSigBytes; i++) {
						var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
						thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
					}
				} else if (thatWords.length > 0xffff) {
					// Copy one word at a time
					for (var i = 0; i < thatSigBytes; i += 4) {
						thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
					}
				} else {
					// Copy all words at once
					thisWords.push.apply(thisWords, thatWords);
				}
				this.sigBytes += thatSigBytes;

				// Chainable
				return this;
			},

			/**
			 * Removes insignificant bits.
			 *
			 * @example
			 *
			 *     wordArray.clamp();
			 */
			clamp: function() {
				// Shortcuts
				var words = this.words;
				var sigBytes = this.sigBytes;

				// Clamp
				words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
				words.length = Math.ceil(sigBytes / 4);
			},

			/**
			 * Creates a copy of this word array.
			 *
			 * @return {WordArray} The clone.
			 *
			 * @example
			 *
			 *     var clone = wordArray.clone();
			 */
			clone: function() {
				var clone = Base.clone.call(this);
				clone.words = this.words.slice(0);

				return clone;
			},

			/**
			 * Creates a word array filled with random bytes.
			 *
			 * @param {number} nBytes The number of random bytes to generate.
			 *
			 * @return {WordArray} The random word array.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var wordArray = CryptoJS.lib.WordArray.random(16);
			 */
			random: function(nBytes) {
				var words = [];
				for (var i = 0; i < nBytes; i += 4) {
					words.push((Math.random() * 0x100000000) | 0);
				}

				return new WordArray.init(words, nBytes);
			}
		});

		/**
		 * Encoder namespace.
		 */
		var C_enc = C.enc = {};

		/**
		 * Hex encoding strategy.
		 */
		var Hex = C_enc.Hex = {
			/**
			 * Converts a word array to a hex string.
			 *
			 * @param {WordArray} wordArray The word array.
			 *
			 * @return {string} The hex string.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
			 */
			stringify: function(wordArray) {
				// Shortcuts
				var words = wordArray.words;
				var sigBytes = wordArray.sigBytes;

				// Convert
				var hexChars = [];
				for (var i = 0; i < sigBytes; i++) {
					var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
					hexChars.push((bite >>> 4).toString(16));
					hexChars.push((bite & 0x0f).toString(16));
				}

				return hexChars.join('');
			},

			/**
			 * Converts a hex string to a word array.
			 *
			 * @param {string} hexStr The hex string.
			 *
			 * @return {WordArray} The word array.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
			 */
			parse: function(hexStr) {
				// Shortcut
				var hexStrLength = hexStr.length;

				// Convert
				var words = [];
				for (var i = 0; i < hexStrLength; i += 2) {
					words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
				}

				return new WordArray.init(words, hexStrLength / 2);
			}
		};

		/**
		 * Latin1 encoding strategy.
		 */
		var Latin1 = C_enc.Latin1 = {
			/**
			 * Converts a word array to a Latin1 string.
			 *
			 * @param {WordArray} wordArray The word array.
			 *
			 * @return {string} The Latin1 string.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
			 */
			stringify: function(wordArray) {
				// Shortcuts
				var words = wordArray.words;
				var sigBytes = wordArray.sigBytes;

				// Convert
				var latin1Chars = [];
				for (var i = 0; i < sigBytes; i++) {
					var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
					latin1Chars.push(String.fromCharCode(bite));
				}

				return latin1Chars.join('');
			},

			/**
			 * Converts a Latin1 string to a word array.
			 *
			 * @param {string} latin1Str The Latin1 string.
			 *
			 * @return {WordArray} The word array.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
			 */
			parse: function(latin1Str) {
				// Shortcut
				var latin1StrLength = latin1Str.length;

				// Convert
				var words = [];
				for (var i = 0; i < latin1StrLength; i++) {
					words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
				}

				return new WordArray.init(words, latin1StrLength);
			}
		};

		/**
		 * UTF-8 encoding strategy.
		 */
		var Utf8 = C_enc.Utf8 = {
			/**
			 * Converts a word array to a UTF-8 string.
			 *
			 * @param {WordArray} wordArray The word array.
			 *
			 * @return {string} The UTF-8 string.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
			 */
			stringify: function(wordArray) {
				try {
					return decodeURIComponent(escape(Latin1.stringify(wordArray)));
				} catch (e) {
					throw new Error('Malformed UTF-8 data');
				}
			},

			/**
			 * Converts a UTF-8 string to a word array.
			 *
			 * @param {string} utf8Str The UTF-8 string.
			 *
			 * @return {WordArray} The word array.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
			 */
			parse: function(utf8Str) {
				return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
			}
		};

		/**
		 * Abstract buffered block algorithm template.
		 *
		 * The property blockSize must be implemented in a concrete subtype.
		 *
		 * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
		 */
		var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
			/**
			 * Resets this block algorithm's data buffer to its initial state.
			 *
			 * @example
			 *
			 *     bufferedBlockAlgorithm.reset();
			 */
			reset: function() {
				// Initial values
				this._data = new WordArray.init();
				this._nDataBytes = 0;
			},

			/**
			 * Adds new data to this block algorithm's buffer.
			 *
			 * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
			 *
			 * @example
			 *
			 *     bufferedBlockAlgorithm._append('data');
			 *     bufferedBlockAlgorithm._append(wordArray);
			 */
			_append: function(data) {
				// Convert string to WordArray, else assume WordArray already
				if (typeof data == 'string') {
					data = Utf8.parse(data);
				}

				// Append
				this._data.concat(data);
				this._nDataBytes += data.sigBytes;
			},

			/**
			 * Processes available data blocks.
			 *
			 * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
			 *
			 * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
			 *
			 * @return {WordArray} The processed data.
			 *
			 * @example
			 *
			 *     var processedData = bufferedBlockAlgorithm._process();
			 *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
			 */
			_process: function(doFlush) {
				// Shortcuts
				var data = this._data;
				var dataWords = data.words;
				var dataSigBytes = data.sigBytes;
				var blockSize = this.blockSize;
				var blockSizeBytes = blockSize * 4;

				// Count blocks ready
				var nBlocksReady = dataSigBytes / blockSizeBytes;
				if (doFlush) {
					// Round up to include partial blocks
					nBlocksReady = Math.ceil(nBlocksReady);
				} else {
					// Round down to include only full blocks,
					// less the number of blocks that must remain in the buffer
					nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
				}

				// Count words ready
				var nWordsReady = nBlocksReady * blockSize;

				// Count bytes ready
				var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

				// Process blocks
				if (nWordsReady) {
					for (var offset = 0; offset < nWordsReady; offset += blockSize) {
						// Perform concrete-algorithm logic
						this._doProcessBlock(dataWords, offset);
					}

					// Remove processed words
					var processedWords = dataWords.splice(0, nWordsReady);
					data.sigBytes -= nBytesReady;
				}

				// Return processed words
				return new WordArray.init(processedWords, nBytesReady);
			},

			/**
			 * Creates a copy of this object.
			 *
			 * @return {Object} The clone.
			 *
			 * @example
			 *
			 *     var clone = bufferedBlockAlgorithm.clone();
			 */
			clone: function() {
				var clone = Base.clone.call(this);
				clone._data = this._data.clone();

				return clone;
			},

			_minBufferSize: 0
		});

		/**
		 * Abstract hasher template.
		 *
		 * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
		 */
		var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
			/**
			 * Configuration options.
			 */
			cfg: Base.extend(),

			/**
			 * Initializes a newly created hasher.
			 *
			 * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
			 *
			 * @example
			 *
			 *     var hasher = CryptoJS.algo.SHA256.create();
			 */
			init: function(cfg) {
				// Apply config defaults
				this.cfg = this.cfg.extend(cfg);

				// Set initial values
				this.reset();
			},

			/**
			 * Resets this hasher to its initial state.
			 *
			 * @example
			 *
			 *     hasher.reset();
			 */
			reset: function() {
				// Reset data buffer
				BufferedBlockAlgorithm.reset.call(this);

				// Perform concrete-hasher logic
				this._doReset();
			},

			/**
			 * Updates this hasher with a message.
			 *
			 * @param {WordArray|string} messageUpdate The message to append.
			 *
			 * @return {Hasher} This hasher.
			 *
			 * @example
			 *
			 *     hasher.update('message');
			 *     hasher.update(wordArray);
			 */
			update: function(messageUpdate) {
				// Append
				this._append(messageUpdate);

				// Update the hash
				this._process();

				// Chainable
				return this;
			},

			/**
			 * Finalizes the hash computation.
			 * Note that the finalize operation is effectively a destructive, read-once operation.
			 *
			 * @param {WordArray|string} messageUpdate (Optional) A final message update.
			 *
			 * @return {WordArray} The hash.
			 *
			 * @example
			 *
			 *     var hash = hasher.finalize();
			 *     var hash = hasher.finalize('message');
			 *     var hash = hasher.finalize(wordArray);
			 */
			finalize: function(messageUpdate) {
				// Final message update
				if (messageUpdate) {
					this._append(messageUpdate);
				}

				// Perform concrete-hasher logic
				var hash = this._doFinalize();

				return hash;
			},

			blockSize: 512 / 32,

			/**
			 * Creates a shortcut function to a hasher's object interface.
			 *
			 * @param {Hasher} hasher The hasher to create a helper for.
			 *
			 * @return {Function} The shortcut function.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
			 */
			_createHelper: function(hasher) {
				return function(message, cfg) {
					return new hasher.init(cfg).finalize(message);
				};
			},

			/**
			 * Creates a shortcut function to the HMAC's object interface.
			 *
			 * @param {Hasher} hasher The hasher to use in this HMAC helper.
			 *
			 * @return {Function} The shortcut function.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
			 */
			_createHmacHelper: function(hasher) {
				return function(message, key) {
					return new C_algo.HMAC.init(hasher, key).finalize(message);
				};
			}
		});

		/**
		 * Algorithm namespace.
		 */
		var C_algo = C.algo = {};

		return C;
	}(Math));

	/*
	  org.bouncycastle.asn1.x500
	  AttributeTypeAndValue
	  DirectoryString
	  RDN
	  X500Name
	  X500NameBuilder

	  org.bouncycastleasn1.x509
	  TBSCertificate
	*/

	/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
	 */
	var b64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var b64pad = "=";

	function hex2b64(h) {
		var i;
		var c;
		var ret = "";
		for (i = 0; i + 3 <= h.length; i += 3) {
			c = parseInt(h.substring(i, i + 3), 16);
			ret += b64map.charAt(c >> 6) + b64map.charAt(c & 63);
		}
		if (i + 1 == h.length) {
			c = parseInt(h.substring(i, i + 1), 16);
			ret += b64map.charAt(c << 2);
		} else if (i + 2 == h.length) {
			c = parseInt(h.substring(i, i + 2), 16);
			ret += b64map.charAt(c >> 2) + b64map.charAt((c & 3) << 4);
		}
		if (b64pad)
			while ((ret.length & 3) > 0) ret += b64pad;
		return ret;
	}

	// convert a base64 string to hex
	function b64tohex(s) {
		var ret = ""
		var i;
		var k = 0; // b64 state, 0-3
		var slop;
		var v;
		for (i = 0; i < s.length; ++i) {
			if (s.charAt(i) == b64pad) break;
			v = b64map.indexOf(s.charAt(i));
			if (v < 0) continue;
			if (k == 0) {
				ret += int2char(v >> 2);
				slop = v & 3;
				k = 1;
			} else if (k == 1) {
				ret += int2char((slop << 2) | (v >> 4));
				slop = v & 0xf;
				k = 2;
			} else if (k == 2) {
				ret += int2char(slop);
				ret += int2char(v >> 2);
				slop = v & 3;
				k = 3;
			} else {
				ret += int2char((slop << 2) | (v >> 4));
				ret += int2char(v & 0xf);
				k = 0;
			}
		}
		if (k == 1)
			ret += int2char(slop << 2);
		return ret;
	}

	// convert a base64 string to a byte/number array
	function b64toBA(s) {
		//piggyback on b64tohex for now, optimize later
		var h = b64tohex(s);
		var i;
		var a = new Array();
		for (i = 0; 2 * i < h.length; ++i) {
			a[i] = parseInt(h.substring(2 * i, 2 * i + 2), 16);
		}
		return a;
	}

	/*! base64x-1.1.8 (c) 2012-2016 Kenji Urushima | kjur.github.com/jsrsasign/license
	 */
	/*
	 * base64x.js - Base64url and supplementary functions for Tom Wu's base64.js library
	 *
	 * version: 1.1.8 (2016-Oct-16)
	 *
	 * Copyright (c) 2012-2016 Kenji Urushima (kenji.urushima@gmail.com)
	 *
	 * This software is licensed under the terms of the MIT License.
	 * http://kjur.github.com/jsjws/license/
	 *
	 * The above copyright and license notice shall be 
	 * included in all copies or substantial portions of the Software.
	 *
	 * DEPENDS ON:
	 *   - base64.js - Tom Wu's Base64 library
	 */

	/**
	 * @fileOverview
	 * @name base64x-1.1.js
	 * @author Kenji Urushima kenji.urushima@gmail.com
	 * @version asn1 1.1.8 (2016-Oct-16)
	 * @since jsrsasign 2.1
	 * @license <a href="http://kjur.github.io/jsrsasign/license/">MIT License</a>
	 */

	var KJUR;
	if (typeof KJUR == "undefined" || !KJUR) KJUR = {};
	if (typeof KJUR.lang == "undefined" || !KJUR.lang) KJUR.lang = {};

	/**
	 * String and its utility class <br/>
	 * This class provides some static utility methods for string.
	 * @class String and its utility class
	 * @author Kenji Urushima
	 * @version 1.0 (2016-Aug-05)
	 * @since base64x 1.1.7 jsrsasign 5.0.13
	 * @description
	 * <br/>
	 * This class provides static methods for string utility.
	 * <dl>
	 * <dt><b>STRING TYPE CHECKERS</b>
	 * <dd>
	 * <ul>
	 * <li>{@link KJUR.lang.String.isInteger} - check whether argument is an integer</li>
	 * <li>{@link KJUR.lang.String.isHex} - check whether argument is a hexadecimal string</li>
	 * <li>{@link KJUR.lang.String.isBase64} - check whether argument is a Base64 encoded string</li>
	 * <li>{@link KJUR.lang.String.isBase64URL} - check whether argument is a Base64URL encoded string</li>
	 * <li>{@link KJUR.lang.String.isIntegerArray} - check whether argument is an array of integers</li>
	 * </ul>
	 * </dl>
	 */
	KJUR.lang.String = function() {};

	/**
	 * Base64URL and supplementary functions for Tom Wu's base64.js library.<br/>
	 * This class is just provide information about global functions
	 * defined in 'base64x.js'. The 'base64x.js' script file provides
	 * global functions for converting following data each other.
	 * <ul>
	 * <li>(ASCII) String</li>
	 * <li>UTF8 String including CJK, Latin and other characters</li>
	 * <li>byte array</li>
	 * <li>hexadecimal encoded String</li>
	 * <li>Full URIComponent encoded String (such like "%69%94")</li>
	 * <li>Base64 encoded String</li>
	 * <li>Base64URL encoded String</li>
	 * </ul>
	 * All functions in 'base64x.js' are defined in {@link _global_} and not
	 * in this class.
	 * 
	 * @class Base64URL and supplementary functions for Tom Wu's base64.js library
	 * @author Kenji Urushima
	 * @version 1.1 (07 May 2012)
	 * @requires base64.js
	 * @see <a href="http://kjur.github.com/jsjws/">'jwjws'(JWS JavaScript Library) home page http://kjur.github.com/jsjws/</a>
	 * @see <a href="http://kjur.github.com/jsrsasigns/">'jwrsasign'(RSA Sign JavaScript Library) home page http://kjur.github.com/jsrsasign/</a>
	 */
	function Base64x() {}

	// ==== string / byte array ================================
	/**
	 * convert a string to an array of character codes
	 * @param {String} s
	 * @return {Array of Numbers} 
	 */
	function stoBA(s) {
		var a = new Array();
		for (var i = 0; i < s.length; i++) {
			a[i] = s.charCodeAt(i);
		}
		return a;
	}

	/**
	 * convert an array of character codes to a string
	 * @param {Array of Numbers} a array of character codes
	 * @return {String} s
	 */
	function BAtos(a) {
		var s = "";
		for (var i = 0; i < a.length; i++) {
			s = s + String.fromCharCode(a[i]);
		}
		return s;
	}

	// ==== byte array / hex ================================
	/**
	 * convert an array of bytes(Number) to hexadecimal string.<br/>
	 * @param {Array of Numbers} a array of bytes
	 * @return {String} hexadecimal string
	 */
	function BAtohex(a) {
		var s = "";
		for (var i = 0; i < a.length; i++) {
			var hex1 = a[i].toString(16);
			if (hex1.length == 1) hex1 = "0" + hex1;
			s = s + hex1;
		}
		return s;
	}

	// ==== string / hex ================================
	/**
	 * convert a ASCII string to a hexadecimal string of ASCII codes.<br/>
	 * NOTE: This can't be used for non ASCII characters.
	 * @param {s} s ASCII string
	 * @return {String} hexadecimal string
	 */
	function stohex(s) {
		return BAtohex(stoBA(s));
	}

	// ==== string / base64 ================================
	/**
	 * convert a ASCII string to a Base64 encoded string.<br/>
	 * NOTE: This can't be used for non ASCII characters.
	 * @param {s} s ASCII string
	 * @return {String} Base64 encoded string
	 */
	function stob64(s) {
		return hex2b64(stohex(s));
	}

	// ==== string / base64url ================================
	/**
	 * convert a ASCII string to a Base64URL encoded string.<br/>
	 * NOTE: This can't be used for non ASCII characters.
	 * @param {s} s ASCII string
	 * @return {String} Base64URL encoded string
	 */
	function stob64u(s) {
		return b64tob64u(hex2b64(stohex(s)));
	}

	/**
	 * convert a Base64URL encoded string to a ASCII string.<br/>
	 * NOTE: This can't be used for Base64URL encoded non ASCII characters.
	 * @param {s} s Base64URL encoded string
	 * @return {String} ASCII string
	 */
	function b64utos(s) {
		return BAtos(b64toBA(b64utob64(s)));
	}

	// ==== base64 / base64url ================================
	/**
	 * convert a Base64 encoded string to a Base64URL encoded string.<br/>
	 * @param {String} s Base64 encoded string
	 * @return {String} Base64URL encoded string
	 * @example
	 * b64tob64u("ab+c3f/==") &rarr; "ab-c3f_"
	 */
	function b64tob64u(s) {
		s = s.replace(/\=/g, "");
		s = s.replace(/\+/g, "-");
		s = s.replace(/\//g, "_");
		return s;
	}

	/**
	 * convert a Base64URL encoded string to a Base64 encoded string.<br/>
	 * @param {String} s Base64URL encoded string
	 * @return {String} Base64 encoded string
	 * @example
	 * b64utob64("ab-c3f_") &rarr; "ab+c3f/=="
	 */
	function b64utob64(s) {
		if (s.length % 4 == 2) s = s + "==";
		else if (s.length % 4 == 3) s = s + "=";
		s = s.replace(/-/g, "+");
		s = s.replace(/_/g, "/");
		return s;
	}

	// ==== hex / base64url ================================
	/**
	 * convert a hexadecimal string to a Base64URL encoded string.<br/>
	 * @param {String} s hexadecimal string
	 * @return {String} Base64URL encoded string
	 * @description
	 * convert a hexadecimal string to a Base64URL encoded string.
	 * NOTE: If leading "0" is omitted and odd number length for
	 * hexadecimal leading "0" is automatically added.
	 */
	function hextob64u(s) {
		if (s.length % 2 == 1) s = "0" + s;
		return b64tob64u(hex2b64(s));
	}

	/**
	 * convert a Base64URL encoded string to a hexadecimal string.<br/>
	 * @param {String} s Base64URL encoded string
	 * @return {String} hexadecimal string
	 */
	function b64utohex(s) {
		return b64tohex(b64utob64(s));
	}

	// ==== utf8 / base64url ================================

	/**
	 * convert a UTF-8 encoded string including CJK or Latin to a Base64URL encoded string.<br/>
	 * @param {String} s UTF-8 encoded string
	 * @return {String} Base64URL encoded string
	 * @since 1.1
	 */

	/**
	 * convert a Base64URL encoded string to a UTF-8 encoded string including CJK or Latin.<br/>
	 * @param {String} s Base64URL encoded string
	 * @return {String} UTF-8 encoded string
	 * @since 1.1
	 */

	var utf8tob64u, b64utoutf8;

	if (typeof Buffer === 'function') {
		utf8tob64u = function(s) {
			return b64tob64u(new Buffer(s, 'utf8').toString('base64'));
		};

		b64utoutf8 = function(s) {
			return new Buffer(b64utob64(s), 'base64').toString('utf8');
		};
	} else {
		utf8tob64u = function(s) {
			return hextob64u(uricmptohex(encodeURIComponentAll(s)));
		};

		b64utoutf8 = function(s) {
			return decodeURIComponent(hextouricmp(b64utohex(s)));
		};
	}

	// ==== utf8 / base64url ================================
	/**
	 * convert a UTF-8 encoded string including CJK or Latin to a Base64 encoded string.<br/>
	 * @param {String} s UTF-8 encoded string
	 * @return {String} Base64 encoded string
	 * @since 1.1.1
	 */
	function utf8tob64(s) {
		return hex2b64(uricmptohex(encodeURIComponentAll(s)));
	}

	/**
	 * convert a Base64 encoded string to a UTF-8 encoded string including CJK or Latin.<br/>
	 * @param {String} s Base64 encoded string
	 * @return {String} UTF-8 encoded string
	 * @since 1.1.1
	 */
	function b64toutf8(s) {
		return decodeURIComponent(hextouricmp(b64tohex(s)));
	}

	// ==== utf8 / hex ================================
	/**
	 * convert a UTF-8 encoded string including CJK or Latin to a hexadecimal encoded string.<br/>
	 * @param {String} s UTF-8 encoded string
	 * @return {String} hexadecimal encoded string
	 * @since 1.1.1
	 */
	function utf8tohex(s) {
		return uricmptohex(encodeURIComponentAll(s));
	}

	/**
	 * convert a hexadecimal encoded string to a UTF-8 encoded string including CJK or Latin.<br/>
	 * Note that when input is improper hexadecimal string as UTF-8 string, this function returns
	 * 'null'.
	 * @param {String} s hexadecimal encoded string
	 * @return {String} UTF-8 encoded string or null
	 * @since 1.1.1
	 */
	function hextoutf8(s) {
		return decodeURIComponent(hextouricmp(s));
	}

	/**
	 * convert a hexadecimal encoded string to raw string including non printable characters.<br/>
	 * @param {String} s hexadecimal encoded string
	 * @return {String} raw string
	 * @since 1.1.2
	 * @example
	 * hextorstr("610061") &rarr; "a\x00a"
	 */
	function hextorstr(sHex) {
		var s = "";
		for (var i = 0; i < sHex.length - 1; i += 2) {
			s += String.fromCharCode(parseInt(sHex.substr(i, 2), 16));
		}
		return s;
	}

	/**
	 * convert a raw string including non printable characters to hexadecimal encoded string.<br/>
	 * @param {String} s raw string
	 * @return {String} hexadecimal encoded string
	 * @since 1.1.2
	 * @example
	 * rstrtohex("a\x00a") &rarr; "610061"
	 */
	function rstrtohex(s) {
		var result = "";
		for (var i = 0; i < s.length; i++) {
			result += ("0" + s.charCodeAt(i).toString(16)).slice(-2);
		}
		return result;
	}

	// ==== hex / b64nl =======================================

	/**
	 * convert a hexadecimal string to Base64 encoded string<br/>
	 * @param {String} s hexadecimal string
	 * @return {String} resulted Base64 encoded string
	 * @since base64x 1.1.3
	 * @description
	 * This function converts from a hexadecimal string to Base64 encoded
	 * string without new lines.
	 * @example
	 * hextob64("616161") &rarr; "YWFh"
	 */
	function hextob64(s) {
		return hex2b64(s);
	}

	/**
	 * convert a hexadecimal string to Base64 encoded string with new lines<br/>
	 * @param {String} s hexadecimal string
	 * @return {String} resulted Base64 encoded string with new lines
	 * @since base64x 1.1.3
	 * @description
	 * This function converts from a hexadecimal string to Base64 encoded
	 * string with new lines for each 64 characters. This is useful for
	 * PEM encoded file.
	 * @example
	 * hextob64nl("123456789012345678901234567890123456789012345678901234567890")
	 * &rarr;
	 * MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4 // new line
	 * OTAxMjM0NTY3ODkwCg==
	 */
	function hextob64nl(s) {
		var b64 = hextob64(s);
		var b64nl = b64.replace(/(.{64})/g, "$1\r\n");
		b64nl = b64nl.replace(/\r\n$/, '');
		return b64nl;
	}

	/**
	 * convert a Base64 encoded string with new lines to a hexadecimal string<br/>
	 * @param {String} s Base64 encoded string with new lines
	 * @return {String} hexadecimal string
	 * @since base64x 1.1.3
	 * @description
	 * This function converts from a Base64 encoded
	 * string with new lines to a hexadecimal string.
	 * This is useful to handle PEM encoded file.
	 * This function removes any non-Base64 characters (i.e. not 0-9,A-Z,a-z,\,+,=)
	 * including new line.
	 * @example
	 * hextob64nl(
	 * "MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4\r\n" +
	 * "OTAxMjM0NTY3ODkwCg==\r\n")
	 * &rarr;
	 * "123456789012345678901234567890123456789012345678901234567890"
	 */
	function b64nltohex(s) {
		var b64 = s.replace(/[^0-9A-Za-z\/+=]*/g, '');
		var hex = b64tohex(b64);
		return hex;
	}

	// ==== hex / ArrayBuffer =================================

	/**
	 * convert a ArrayBuffer to a hexadecimal string<br/>
	 * @param {String} hex hexadecimal string
	 * @return {ArrayBuffer} ArrayBuffer
	 * @since jsrsasign 6.1.4 base64x 1.1.8
	 * @description
	 * This function converts from a ArrayBuffer to a hexadecimal string.
	 * @example
	 * var buffer = new ArrayBuffer(3);
	 * var view = new DataView(buffer);
	 * view.setUint8(0, 0xfa);
	 * view.setUint8(1, 0xfb);
	 * view.setUint8(2, 0x01);
	 * ArrayBuffertohex(buffer) &rarr; "fafb01"
	 */
	function hextoArrayBuffer(hex) {
		if (hex.length % 2 != 0) throw "input is not even length";
		if (hex.match(/^[0-9A-Fa-f]+$/) == null) throw "input is not hexadecimal";

		var buffer = new ArrayBuffer(hex.length / 2);
		var view = new DataView(buffer);

		for (var i = 0; i < hex.length / 2; i++) {
			view.setUint8(i, parseInt(hex.substr(i * 2, 2), 16));
		}

		return buffer;
	}

	// ==== ArrayBuffer / hex =================================

	/**
	 * convert a ArrayBuffer to a hexadecimal string<br/>
	 * @param {ArrayBuffer} buffer ArrayBuffer
	 * @return {String} hexadecimal string
	 * @since jsrsasign 6.1.4 base64x 1.1.8
	 * @description
	 * This function converts from a ArrayBuffer to a hexadecimal string.
	 * @example
	 * hextoArrayBuffer("fffa01") &rarr; ArrayBuffer of [255, 250, 1]
	 */
	function ArrayBuffertohex(buffer) {
		var hex = "";
		var view = new DataView(buffer);

		for (var i = 0; i < buffer.byteLength; i++) {
			hex += ("00" + view.getUint8(i).toString(16)).slice(-2);
		}

		return hex;
	}

	// ==== URIComponent / hex ================================
	/**
	 * convert a URLComponent string such like "%67%68" to a hexadecimal string.<br/>
	 * @param {String} s URIComponent string such like "%67%68"
	 * @return {String} hexadecimal string
	 * @since 1.1
	 */
	function uricmptohex(s) {
		return s.replace(/%/g, "");
	}

	/**
	 * convert a hexadecimal string to a URLComponent string such like "%67%68".<br/>
	 * @param {String} s hexadecimal string
	 * @return {String} URIComponent string such like "%67%68"
	 * @since 1.1
	 */
	function hextouricmp(s) {
		return s.replace(/(..)/g, "%$1");
	}

	// ==== URIComponent ================================
	/**
	 * convert UTFa hexadecimal string to a URLComponent string such like "%67%68".<br/>
	 * Note that these "<code>0-9A-Za-z!'()*-._~</code>" characters will not
	 * converted to "%xx" format by builtin 'encodeURIComponent()' function.
	 * However this 'encodeURIComponentAll()' function will convert 
	 * all of characters into "%xx" format.
	 * @param {String} s hexadecimal string
	 * @return {String} URIComponent string such like "%67%68"
	 * @since 1.1
	 */
	function encodeURIComponentAll(u8) {
		var s = encodeURIComponent(u8);
		var s2 = "";
		for (var i = 0; i < s.length; i++) {
			if (s[i] == "%") {
				s2 = s2 + s.substr(i, 3);
				i = i + 2;
			} else {
				s2 = s2 + "%" + stohex(s[i]);
			}
		}
		return s2;
	}

	// ==== new lines ================================
	/**
	 * convert all DOS new line("\r\n") to UNIX new line("\n") in 
	 * a String "s".
	 * @param {String} s string 
	 * @return {String} converted string
	 */
	function newline_toUnix(s) {
		s = s.replace(/\r\n/mg, "\n");
		return s;
	}

	/**
	 * convert all UNIX new line("\r\n") to DOS new line("\n") in 
	 * a String "s".
	 * @param {String} s string 
	 * @return {String} converted string
	 */
	function newline_toDos(s) {
		s = s.replace(/\r\n/mg, "\n");
		s = s.replace(/\n/mg, "\r\n");
		return s;
	}

	// ==== string type checker ===================

	/**
	 * check whether a string is an integer string or not<br/>
	 * @name isInteger
	 * @memberOf KJUR.lang.String
	 * @function
	 * @static
	 * @param {String} s input string
	 * @return {Boolean} true if a string "s" is an integer string otherwise false
	 * @since base64x 1.1.7 jsrsasign 5.0.13
	 * @example
	 * KJUR.lang.String.isInteger("12345") &rarr; true
	 * KJUR.lang.String.isInteger("123ab") &rarr; false
	 */
	KJUR.lang.String.isInteger = function(s) {
		if (s.match(/^[0-9]+$/)) {
			return true;
		} else if (s.match(/^-[0-9]+$/)) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * check whether a string is an hexadecimal string or not<br/>
	 * @name isHex
	 * @memberOf KJUR.lang.String
	 * @function
	 * @static
	 * @param {String} s input string
	 * @return {Boolean} true if a string "s" is an hexadecimal string otherwise false
	 * @since base64x 1.1.7 jsrsasign 5.0.13
	 * @example
	 * KJUR.lang.String.isHex("1234") &rarr; true
	 * KJUR.lang.String.isHex("12ab") &rarr; true
	 * KJUR.lang.String.isHex("12AB") &rarr; true
	 * KJUR.lang.String.isHex("12ZY") &rarr; false
	 * KJUR.lang.String.isHex("121") &rarr; false -- odd length
	 */
	KJUR.lang.String.isHex = function(s) {
		if (s.length % 2 == 0 &&
			(s.match(/^[0-9a-f]+$/) || s.match(/^[0-9A-F]+$/))) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * check whether a string is a base64 encoded string or not<br/>
	 * Input string can conclude new lines or space characters.
	 * @name isBase64
	 * @memberOf KJUR.lang.String
	 * @function
	 * @static
	 * @param {String} s input string
	 * @return {Boolean} true if a string "s" is a base64 encoded string otherwise false
	 * @since base64x 1.1.7 jsrsasign 5.0.13
	 * @example
	 * KJUR.lang.String.isBase64("YWE=") &rarr; true
	 * KJUR.lang.String.isBase64("YW_=") &rarr; false
	 * KJUR.lang.String.isBase64("YWE") &rarr; false -- length shall be multiples of 4
	 */
	KJUR.lang.String.isBase64 = function(s) {
		s = s.replace(/\s+/g, "");
		if (s.match(/^[0-9A-Za-z+\/]+={0,3}$/) && s.length % 4 == 0) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * check whether a string is a base64url encoded string or not<br/>
	 * Input string can conclude new lines or space characters.
	 * @name isBase64URL
	 * @memberOf KJUR.lang.String
	 * @function
	 * @static
	 * @param {String} s input string
	 * @return {Boolean} true if a string "s" is a base64url encoded string otherwise false
	 * @since base64x 1.1.7 jsrsasign 5.0.13
	 * @example
	 * KJUR.lang.String.isBase64URL("YWE") &rarr; true
	 * KJUR.lang.String.isBase64URL("YW-") &rarr; true
	 * KJUR.lang.String.isBase64URL("YW+") &rarr; false
	 */
	KJUR.lang.String.isBase64URL = function(s) {
		if (s.match(/[+/=]/)) return false;
		s = b64utob64(s);
		return KJUR.lang.String.isBase64(s);
	};

	/**
	 * check whether a string is a string of integer array or not<br/>
	 * Input string can conclude new lines or space characters.
	 * @name isIntegerArray
	 * @memberOf KJUR.lang.String
	 * @function
	 * @static
	 * @param {String} s input string
	 * @return {Boolean} true if a string "s" is a string of integer array otherwise false
	 * @since base64x 1.1.7 jsrsasign 5.0.13
	 * @example
	 * KJUR.lang.String.isIntegerArray("[1,2,3]") &rarr; true
	 * KJUR.lang.String.isIntegerArray("  [1, 2, 3  ] ") &rarr; true
	 * KJUR.lang.String.isIntegerArray("[a,2]") &rarr; false
	 */
	KJUR.lang.String.isIntegerArray = function(s) {
		s = s.replace(/\s+/g, "");
		if (s.match(/^\[[0-9,]+\]$/)) {
			return true;
		} else {
			return false;
		}
	};

	// ==== others ================================

	/**
	 * convert string of integer array to hexadecimal string.<br/>
	 * @param {String} s string of integer array
	 * @return {String} hexadecimal string
	 * @since base64x 1.1.6 jsrsasign 5.0.2
	 * @throws "malformed integer array string: *" for wrong input
	 * @description
	 * This function converts a string of JavaScript integer array to
	 * a hexadecimal string. Each integer value shall be in a range 
	 * from 0 to 255 otherwise it raise exception. Input string can
	 * have extra space or newline string so that they will be ignored.
	 * 
	 * @example
	 * intarystrtohex(" [123, 34, 101, 34, 58] ")
	 * &rarr; 7b2265223a (i.e. '{"e":' as string)
	 */
	function intarystrtohex(s) {
		s = s.replace(/^\s*\[\s*/, '');
		s = s.replace(/\s*\]\s*$/, '');
		s = s.replace(/\s*/g, '');
		try {
			var hex = s.split(/,/).map(function(element, index, array) {
				var i = parseInt(element);
				if (i < 0 || 255 < i) throw "integer not in range 0-255";
				var hI = ("00" + i.toString(16)).slice(-2);
				return hI;
			}).join('');
			return hex;
		} catch (ex) {
			throw "malformed integer array string: " + ex;
		}
	}

	/**
	 * find index of string where two string differs
	 * @param {String} s1 string to compare
	 * @param {String} s2 string to compare
	 * @return {Number} string index of where character differs. Return -1 if same.
	 * @since jsrsasign 4.9.0 base64x 1.1.5
	 * @example
	 * strdiffidx("abcdefg", "abcd4fg") -> 4
	 * strdiffidx("abcdefg", "abcdefg") -> -1
	 * strdiffidx("abcdefg", "abcdef") -> 6
	 * strdiffidx("abcdefgh", "abcdef") -> 6
	 */
	var strdiffidx = function(s1, s2) {
		var n = s1.length;
		if (s1.length > s2.length) n = s2.length;
		for (var i = 0; i < n; i++) {
			if (s1.charCodeAt(i) != s2.charCodeAt(i)) return i;
		}
		if (s1.length != s2.length) return n;
		return -1; // same
	};



	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	(function(undefined) {
		// Shortcuts
		var C = CryptoJS;
		var C_lib = C.lib;
		var Base = C_lib.Base;
		var X32WordArray = C_lib.WordArray;

		/**
		 * x64 namespace.
		 */
		var C_x64 = C.x64 = {};

		/**
		 * A 64-bit word.
		 */
		var X64Word = C_x64.Word = Base.extend({
			/**
			 * Initializes a newly created 64-bit word.
			 *
			 * @param {number} high The high 32 bits.
			 * @param {number} low The low 32 bits.
			 *
			 * @example
			 *
			 *     var x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
			 */
			init: function(high, low) {
				this.high = high;
				this.low = low;
			}

			/**
			 * Bitwise NOTs this word.
			 *
			 * @return {X64Word} A new x64-Word object after negating.
			 *
			 * @example
			 *
			 *     var negated = x64Word.not();
			 */
			// not: function () {
			// var high = ~this.high;
			// var low = ~this.low;

			// return X64Word.create(high, low);
			// },

			/**
			 * Bitwise ANDs this word with the passed word.
			 *
			 * @param {X64Word} word The x64-Word to AND with this word.
			 *
			 * @return {X64Word} A new x64-Word object after ANDing.
			 *
			 * @example
			 *
			 *     var anded = x64Word.and(anotherX64Word);
			 */
			// and: function (word) {
			// var high = this.high & word.high;
			// var low = this.low & word.low;

			// return X64Word.create(high, low);
			// },

			/**
			 * Bitwise ORs this word with the passed word.
			 *
			 * @param {X64Word} word The x64-Word to OR with this word.
			 *
			 * @return {X64Word} A new x64-Word object after ORing.
			 *
			 * @example
			 *
			 *     var ored = x64Word.or(anotherX64Word);
			 */
			// or: function (word) {
			// var high = this.high | word.high;
			// var low = this.low | word.low;

			// return X64Word.create(high, low);
			// },

			/**
			 * Bitwise XORs this word with the passed word.
			 *
			 * @param {X64Word} word The x64-Word to XOR with this word.
			 *
			 * @return {X64Word} A new x64-Word object after XORing.
			 *
			 * @example
			 *
			 *     var xored = x64Word.xor(anotherX64Word);
			 */
			// xor: function (word) {
			// var high = this.high ^ word.high;
			// var low = this.low ^ word.low;

			// return X64Word.create(high, low);
			// },

			/**
			 * Shifts this word n bits to the left.
			 *
			 * @param {number} n The number of bits to shift.
			 *
			 * @return {X64Word} A new x64-Word object after shifting.
			 *
			 * @example
			 *
			 *     var shifted = x64Word.shiftL(25);
			 */
			// shiftL: function (n) {
			// if (n < 32) {
			// var high = (this.high << n) | (this.low >>> (32 - n));
			// var low = this.low << n;
			// } else {
			// var high = this.low << (n - 32);
			// var low = 0;
			// }

			// return X64Word.create(high, low);
			// },

			/**
			 * Shifts this word n bits to the right.
			 *
			 * @param {number} n The number of bits to shift.
			 *
			 * @return {X64Word} A new x64-Word object after shifting.
			 *
			 * @example
			 *
			 *     var shifted = x64Word.shiftR(7);
			 */
			// shiftR: function (n) {
			// if (n < 32) {
			// var low = (this.low >>> n) | (this.high << (32 - n));
			// var high = this.high >>> n;
			// } else {
			// var low = this.high >>> (n - 32);
			// var high = 0;
			// }

			// return X64Word.create(high, low);
			// },

			/**
			 * Rotates this word n bits to the left.
			 *
			 * @param {number} n The number of bits to rotate.
			 *
			 * @return {X64Word} A new x64-Word object after rotating.
			 *
			 * @example
			 *
			 *     var rotated = x64Word.rotL(25);
			 */
			// rotL: function (n) {
			// return this.shiftL(n).or(this.shiftR(64 - n));
			// },

			/**
			 * Rotates this word n bits to the right.
			 *
			 * @param {number} n The number of bits to rotate.
			 *
			 * @return {X64Word} A new x64-Word object after rotating.
			 *
			 * @example
			 *
			 *     var rotated = x64Word.rotR(7);
			 */
			// rotR: function (n) {
			// return this.shiftR(n).or(this.shiftL(64 - n));
			// },

			/**
			 * Adds this word with the passed word.
			 *
			 * @param {X64Word} word The x64-Word to add with this word.
			 *
			 * @return {X64Word} A new x64-Word object after adding.
			 *
			 * @example
			 *
			 *     var added = x64Word.add(anotherX64Word);
			 */
			// add: function (word) {
			// var low = (this.low + word.low) | 0;
			// var carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
			// var high = (this.high + word.high + carry) | 0;

			// return X64Word.create(high, low);
			// }
		});

		/**
		 * An array of 64-bit words.
		 *
		 * @property {Array} words The array of CryptoJS.x64.Word objects.
		 * @property {number} sigBytes The number of significant bytes in this word array.
		 */
		var X64WordArray = C_x64.WordArray = Base.extend({
			/**
			 * Initializes a newly created word array.
			 *
			 * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
			 * @param {number} sigBytes (Optional) The number of significant bytes in the words.
			 *
			 * @example
			 *
			 *     var wordArray = CryptoJS.x64.WordArray.create();
			 *
			 *     var wordArray = CryptoJS.x64.WordArray.create([
			 *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
			 *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
			 *     ]);
			 *
			 *     var wordArray = CryptoJS.x64.WordArray.create([
			 *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
			 *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
			 *     ], 10);
			 */
			init: function(words, sigBytes) {
				words = this.words = words || [];

				if (sigBytes != undefined) {
					this.sigBytes = sigBytes;
				} else {
					this.sigBytes = words.length * 8;
				}
			},

			/**
			 * Converts this 64-bit word array to a 32-bit word array.
			 *
			 * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
			 *
			 * @example
			 *
			 *     var x32WordArray = x64WordArray.toX32();
			 */
			toX32: function() {
				// Shortcuts
				var x64Words = this.words;
				var x64WordsLength = x64Words.length;

				// Convert
				var x32Words = [];
				for (var i = 0; i < x64WordsLength; i++) {
					var x64Word = x64Words[i];
					x32Words.push(x64Word.high);
					x32Words.push(x64Word.low);
				}

				return X32WordArray.create(x32Words, this.sigBytes);
			},

			/**
			 * Creates a copy of this word array.
			 *
			 * @return {X64WordArray} The clone.
			 *
			 * @example
			 *
			 *     var clone = x64WordArray.clone();
			 */
			clone: function() {
				var clone = Base.clone.call(this);

				// Clone "words" array
				var words = clone.words = this.words.slice(0);

				// Clone each X64Word object
				var wordsLength = words.length;
				for (var i = 0; i < wordsLength; i++) {
					words[i] = words[i].clone();
				}

				return clone;
			}
		});
	}());

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	(function() {
		// Shortcuts
		var C = CryptoJS;
		var C_lib = C.lib;
		var WordArray = C_lib.WordArray;
		var C_enc = C.enc;

		/**
		 * Base64 encoding strategy.
		 */
		var Base64 = C_enc.Base64 = {
			/**
			 * Converts a word array to a Base64 string.
			 *
			 * @param {WordArray} wordArray The word array.
			 *
			 * @return {string} The Base64 string.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
			 */
			stringify: function(wordArray) {
				// Shortcuts
				var words = wordArray.words;
				var sigBytes = wordArray.sigBytes;
				var map = this._map;

				// Clamp excess bits
				wordArray.clamp();

				// Convert
				var base64Chars = [];
				for (var i = 0; i < sigBytes; i += 3) {
					var byte1 = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
					var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
					var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

					var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

					for (var j = 0;
						(j < 4) && (i + j * 0.75 < sigBytes); j++) {
						base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
					}
				}

				// Add padding
				var paddingChar = map.charAt(64);
				if (paddingChar) {
					while (base64Chars.length % 4) {
						base64Chars.push(paddingChar);
					}
				}

				return base64Chars.join('');
			},

			/**
			 * Converts a Base64 string to a word array.
			 *
			 * @param {string} base64Str The Base64 string.
			 *
			 * @return {WordArray} The word array.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
			 */
			parse: function(base64Str) {
				// Shortcuts
				var base64StrLength = base64Str.length;
				var map = this._map;

				// Ignore padding
				var paddingChar = map.charAt(64);
				if (paddingChar) {
					var paddingIndex = base64Str.indexOf(paddingChar);
					if (paddingIndex != -1) {
						base64StrLength = paddingIndex;
					}
				}

				// Convert
				var words = [];
				var nBytes = 0;
				for (var i = 0; i < base64StrLength; i++) {
					if (i % 4) {
						var bits1 = map.indexOf(base64Str.charAt(i - 1)) << ((i % 4) * 2);
						var bits2 = map.indexOf(base64Str.charAt(i)) >>> (6 - (i % 4) * 2);
						words[nBytes >>> 2] |= (bits1 | bits2) << (24 - (nBytes % 4) * 8);
						nBytes++;
					}
				}

				return WordArray.create(words, nBytes);
			},

			_map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
		};
	}());

	(function() {
		// Shortcuts
		var C = CryptoJS;
		var C_lib = C.lib;
		var Base = C_lib.Base;
		var WordArray = C_lib.WordArray;
		var C_algo = C.algo;
		var MD5 = C_algo.MD5;

		/**
		 * This key derivation function is meant to conform with EVP_BytesToKey.
		 * www.openssl.org/docs/crypto/EVP_BytesToKey.html
		 */
		var EvpKDF = C_algo.EvpKDF = Base.extend({
			/**
			 * Configuration options.
			 *
			 * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
			 * @property {Hasher} hasher The hash algorithm to use. Default: MD5
			 * @property {number} iterations The number of iterations to perform. Default: 1
			 */
			cfg: Base.extend({
				keySize: 128 / 32,
				hasher: MD5,
				iterations: 1
			}),

			/**
			 * Initializes a newly created key derivation function.
			 *
			 * @param {Object} cfg (Optional) The configuration options to use for the derivation.
			 *
			 * @example
			 *
			 *     var kdf = CryptoJS.algo.EvpKDF.create();
			 *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8 });
			 *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8, iterations: 1000 });
			 */
			init: function(cfg) {
				this.cfg = this.cfg.extend(cfg);
			},

			/**
			 * Derives a key from a password.
			 *
			 * @param {WordArray|string} password The password.
			 * @param {WordArray|string} salt A salt.
			 *
			 * @return {WordArray} The derived key.
			 *
			 * @example
			 *
			 *     var key = kdf.compute(password, salt);
			 */
			compute: function(password, salt) {
				// Shortcut
				var cfg = this.cfg;

				// Init hasher
				var hasher = cfg.hasher.create();

				// Initial values
				var derivedKey = WordArray.create();

				// Shortcuts
				var derivedKeyWords = derivedKey.words;
				var keySize = cfg.keySize;
				var iterations = cfg.iterations;

				// Generate key
				while (derivedKeyWords.length < keySize) {
					if (block) {
						hasher.update(block);
					}
					var block = hasher.update(password).finalize(salt);
					hasher.reset();

					// Iterations
					for (var i = 1; i < iterations; i++) {
						block = hasher.finalize(block);
						hasher.reset();
					}

					derivedKey.concat(block);
				}
				derivedKey.sigBytes = keySize * 4;

				return derivedKey;
			}
		});

		/**
		 * Derives a key from a password.
		 *
		 * @param {WordArray|string} password The password.
		 * @param {WordArray|string} salt A salt.
		 * @param {Object} cfg (Optional) The configuration options to use for this computation.
		 *
		 * @return {WordArray} The derived key.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     var key = CryptoJS.EvpKDF(password, salt);
		 *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8 });
		 *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8, iterations: 1000 });
		 */
		C.EvpKDF = function(password, salt, cfg) {
			return EvpKDF.create(cfg).compute(password, salt);
		};
	}());
	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	/**
	 * Cipher core components.
	 */
	CryptoJS.lib.Cipher || (function(undefined) {
		// Shortcuts
		var C = CryptoJS;
		var C_lib = C.lib;
		var Base = C_lib.Base;
		var WordArray = C_lib.WordArray;
		var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
		var C_enc = C.enc;
		var Utf8 = C_enc.Utf8;
		var Base64 = C_enc.Base64;
		var C_algo = C.algo;
		var EvpKDF = C_algo.EvpKDF;

		/**
		 * Abstract base cipher template.
		 *
		 * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
		 * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
		 * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
		 * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
		 */
		var Cipher = C_lib.Cipher = BufferedBlockAlgorithm.extend({
			/**
			 * Configuration options.
			 *
			 * @property {WordArray} iv The IV to use for this operation.
			 */
			cfg: Base.extend(),

			/**
			 * Creates this cipher in encryption mode.
			 *
			 * @param {WordArray} key The key.
			 * @param {Object} cfg (Optional) The configuration options to use for this operation.
			 *
			 * @return {Cipher} A cipher instance.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
			 */
			createEncryptor: function(key, cfg) {
				return this.create(this._ENC_XFORM_MODE, key, cfg);
			},

			/**
			 * Creates this cipher in decryption mode.
			 *
			 * @param {WordArray} key The key.
			 * @param {Object} cfg (Optional) The configuration options to use for this operation.
			 *
			 * @return {Cipher} A cipher instance.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
			 */
			createDecryptor: function(key, cfg) {
				return this.create(this._DEC_XFORM_MODE, key, cfg);
			},

			/**
			 * Initializes a newly created cipher.
			 *
			 * @param {number} xformMode Either the encryption or decryption transormation mode constant.
			 * @param {WordArray} key The key.
			 * @param {Object} cfg (Optional) The configuration options to use for this operation.
			 *
			 * @example
			 *
			 *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
			 */
			init: function(xformMode, key, cfg) {
				// Apply config defaults
				this.cfg = this.cfg.extend(cfg);

				// Store transform mode and key
				this._xformMode = xformMode;
				this._key = key;

				// Set initial values
				this.reset();
			},

			/**
			 * Resets this cipher to its initial state.
			 *
			 * @example
			 *
			 *     cipher.reset();
			 */
			reset: function() {
				// Reset data buffer
				BufferedBlockAlgorithm.reset.call(this);

				// Perform concrete-cipher logic
				this._doReset();
			},

			/**
			 * Adds data to be encrypted or decrypted.
			 *
			 * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
			 *
			 * @return {WordArray} The data after processing.
			 *
			 * @example
			 *
			 *     var encrypted = cipher.process('data');
			 *     var encrypted = cipher.process(wordArray);
			 */
			process: function(dataUpdate) {
				// Append
				this._append(dataUpdate);

				// Process available blocks
				return this._process();
			},

			/**
			 * Finalizes the encryption or decryption process.
			 * Note that the finalize operation is effectively a destructive, read-once operation.
			 *
			 * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
			 *
			 * @return {WordArray} The data after final processing.
			 *
			 * @example
			 *
			 *     var encrypted = cipher.finalize();
			 *     var encrypted = cipher.finalize('data');
			 *     var encrypted = cipher.finalize(wordArray);
			 */
			finalize: function(dataUpdate) {
				// Final data update
				if (dataUpdate) {
					this._append(dataUpdate);
				}

				// Perform concrete-cipher logic
				var finalProcessedData = this._doFinalize();

				return finalProcessedData;
			},

			keySize: 128 / 32,

			ivSize: 128 / 32,

			_ENC_XFORM_MODE: 1,

			_DEC_XFORM_MODE: 2,

			/**
			 * Creates shortcut functions to a cipher's object interface.
			 *
			 * @param {Cipher} cipher The cipher to create a helper for.
			 *
			 * @return {Object} An object with encrypt and decrypt shortcut functions.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
			 */
			_createHelper: (function() {
				function selectCipherStrategy(key) {
					if (typeof key == 'string') {
						return PasswordBasedCipher;
					} else {
						return SerializableCipher;
					}
				}

				return function(cipher) {
					return {
						encrypt: function(message, key, cfg) {
							return selectCipherStrategy(key).encrypt(cipher, message, key, cfg);
						},

						decrypt: function(ciphertext, key, cfg) {
							return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg);
						}
					};
				};
			}())
		});

		/**
		 * Abstract base stream cipher template.
		 *
		 * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 1 (32 bits)
		 */
		var StreamCipher = C_lib.StreamCipher = Cipher.extend({
			_doFinalize: function() {
				// Process partial blocks
				var finalProcessedBlocks = this._process(!!'flush');

				return finalProcessedBlocks;
			},

			blockSize: 1
		});

		/**
		 * Mode namespace.
		 */
		var C_mode = C.mode = {};

		/**
		 * Abstract base block cipher mode template.
		 */
		var BlockCipherMode = C_lib.BlockCipherMode = Base.extend({
			/**
			 * Creates this mode for encryption.
			 *
			 * @param {Cipher} cipher A block cipher instance.
			 * @param {Array} iv The IV words.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
			 */
			createEncryptor: function(cipher, iv) {
				return this.Encryptor.create(cipher, iv);
			},

			/**
			 * Creates this mode for decryption.
			 *
			 * @param {Cipher} cipher A block cipher instance.
			 * @param {Array} iv The IV words.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
			 */
			createDecryptor: function(cipher, iv) {
				return this.Decryptor.create(cipher, iv);
			},

			/**
			 * Initializes a newly created mode.
			 *
			 * @param {Cipher} cipher A block cipher instance.
			 * @param {Array} iv The IV words.
			 *
			 * @example
			 *
			 *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
			 */
			init: function(cipher, iv) {
				this._cipher = cipher;
				this._iv = iv;
			}
		});

		/**
		 * Cipher Block Chaining mode.
		 */
		var CBC = C_mode.CBC = (function() {
			/**
			 * Abstract base CBC mode.
			 */
			var CBC = BlockCipherMode.extend();

			/**
			 * CBC encryptor.
			 */
			CBC.Encryptor = CBC.extend({
				/**
				 * Processes the data block at offset.
				 *
				 * @param {Array} words The data words to operate on.
				 * @param {number} offset The offset where the block starts.
				 *
				 * @example
				 *
				 *     mode.processBlock(data.words, offset);
				 */
				processBlock: function(words, offset) {
					// Shortcuts
					var cipher = this._cipher;
					var blockSize = cipher.blockSize;

					// XOR and encrypt
					xorBlock.call(this, words, offset, blockSize);
					cipher.encryptBlock(words, offset);

					// Remember this block to use with next block
					this._prevBlock = words.slice(offset, offset + blockSize);
				}
			});

			/**
			 * CBC decryptor.
			 */
			CBC.Decryptor = CBC.extend({
				/**
				 * Processes the data block at offset.
				 *
				 * @param {Array} words The data words to operate on.
				 * @param {number} offset The offset where the block starts.
				 *
				 * @example
				 *
				 *     mode.processBlock(data.words, offset);
				 */
				processBlock: function(words, offset) {
					// Shortcuts
					var cipher = this._cipher;
					var blockSize = cipher.blockSize;

					// Remember this block to use with next block
					var thisBlock = words.slice(offset, offset + blockSize);

					// Decrypt and XOR
					cipher.decryptBlock(words, offset);
					xorBlock.call(this, words, offset, blockSize);

					// This block becomes the previous block
					this._prevBlock = thisBlock;
				}
			});

			function xorBlock(words, offset, blockSize) {
				// Shortcut
				var iv = this._iv;

				// Choose mixing block
				if (iv) {
					var block = iv;

					// Remove IV for subsequent blocks
					this._iv = undefined;
				} else {
					var block = this._prevBlock;
				}

				// XOR blocks
				for (var i = 0; i < blockSize; i++) {
					words[offset + i] ^= block[i];
				}
			}

			return CBC;
		}());

		/**
		 * Padding namespace.
		 */
		var C_pad = C.pad = {};

		/**
		 * PKCS #5/7 padding strategy.
		 */
		var Pkcs7 = C_pad.Pkcs7 = {
			/**
			 * Pads data using the algorithm defined in PKCS #5/7.
			 *
			 * @param {WordArray} data The data to pad.
			 * @param {number} blockSize The multiple that the data should be padded to.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
			 */
			pad: function(data, blockSize) {
				// Shortcut
				var blockSizeBytes = blockSize * 4;

				// Count padding bytes
				var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;

				// Create padding word
				var paddingWord = (nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes;

				// Create padding
				var paddingWords = [];
				for (var i = 0; i < nPaddingBytes; i += 4) {
					paddingWords.push(paddingWord);
				}
				var padding = WordArray.create(paddingWords, nPaddingBytes);

				// Add padding
				data.concat(padding);
			},

			/**
			 * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
			 *
			 * @param {WordArray} data The data to unpad.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     CryptoJS.pad.Pkcs7.unpad(wordArray);
			 */
			unpad: function(data) {
				// Get number of padding bytes from last byte
				var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

				// Remove padding
				data.sigBytes -= nPaddingBytes;
			}
		};

		/**
		 * Abstract base block cipher template.
		 *
		 * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
		 */
		var BlockCipher = C_lib.BlockCipher = Cipher.extend({
			/**
			 * Configuration options.
			 *
			 * @property {Mode} mode The block mode to use. Default: CBC
			 * @property {Padding} padding The padding strategy to use. Default: Pkcs7
			 */
			cfg: Cipher.cfg.extend({
				mode: CBC,
				padding: Pkcs7
			}),

			reset: function() {
				// Reset cipher
				Cipher.reset.call(this);

				// Shortcuts
				var cfg = this.cfg;
				var iv = cfg.iv;
				var mode = cfg.mode;

				// Reset block mode
				if (this._xformMode == this._ENC_XFORM_MODE) {
					var modeCreator = mode.createEncryptor;
				} else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
					var modeCreator = mode.createDecryptor;

					// Keep at least one block in the buffer for unpadding
					this._minBufferSize = 1;
				}
				this._mode = modeCreator.call(mode, this, iv && iv.words);
			},

			_doProcessBlock: function(words, offset) {
				this._mode.processBlock(words, offset);
			},

			_doFinalize: function() {
				// Shortcut
				var padding = this.cfg.padding;

				// Finalize
				if (this._xformMode == this._ENC_XFORM_MODE) {
					// Pad data
					padding.pad(this._data, this.blockSize);

					// Process final blocks
					var finalProcessedBlocks = this._process(!!'flush');
				} else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
					// Process final blocks
					var finalProcessedBlocks = this._process(!!'flush');

					// Unpad data
					padding.unpad(finalProcessedBlocks);
				}

				return finalProcessedBlocks;
			},

			blockSize: 128 / 32
		});

		/**
		 * A collection of cipher parameters.
		 *
		 * @property {WordArray} ciphertext The raw ciphertext.
		 * @property {WordArray} key The key to this ciphertext.
		 * @property {WordArray} iv The IV used in the ciphering operation.
		 * @property {WordArray} salt The salt used with a key derivation function.
		 * @property {Cipher} algorithm The cipher algorithm.
		 * @property {Mode} mode The block mode used in the ciphering operation.
		 * @property {Padding} padding The padding scheme used in the ciphering operation.
		 * @property {number} blockSize The block size of the cipher.
		 * @property {Format} formatter The default formatting strategy to convert this cipher params object to a string.
		 */
		var CipherParams = C_lib.CipherParams = Base.extend({
			/**
			 * Initializes a newly created cipher params object.
			 *
			 * @param {Object} cipherParams An object with any of the possible cipher parameters.
			 *
			 * @example
			 *
			 *     var cipherParams = CryptoJS.lib.CipherParams.create({
			 *         ciphertext: ciphertextWordArray,
			 *         key: keyWordArray,
			 *         iv: ivWordArray,
			 *         salt: saltWordArray,
			 *         algorithm: CryptoJS.algo.AES,
			 *         mode: CryptoJS.mode.CBC,
			 *         padding: CryptoJS.pad.PKCS7,
			 *         blockSize: 4,
			 *         formatter: CryptoJS.format.OpenSSL
			 *     });
			 */
			init: function(cipherParams) {
				this.mixIn(cipherParams);
			},

			/**
			 * Converts this cipher params object to a string.
			 *
			 * @param {Format} formatter (Optional) The formatting strategy to use.
			 *
			 * @return {string} The stringified cipher params.
			 *
			 * @throws Error If neither the formatter nor the default formatter is set.
			 *
			 * @example
			 *
			 *     var string = cipherParams + '';
			 *     var string = cipherParams.toString();
			 *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
			 */
			toString: function(formatter) {
				return (formatter || this.formatter).stringify(this);
			}
		});

		/**
		 * Format namespace.
		 */
		var C_format = C.format = {};

		/**
		 * OpenSSL formatting strategy.
		 */
		var OpenSSLFormatter = C_format.OpenSSL = {
			/**
			 * Converts a cipher params object to an OpenSSL-compatible string.
			 *
			 * @param {CipherParams} cipherParams The cipher params object.
			 *
			 * @return {string} The OpenSSL-compatible string.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
			 */
			stringify: function(cipherParams) {
				// Shortcuts
				var ciphertext = cipherParams.ciphertext;
				var salt = cipherParams.salt;

				// Format
				if (salt) {
					var wordArray = WordArray.create([0x53616c74, 0x65645f5f]).concat(salt).concat(ciphertext);
				} else {
					var wordArray = ciphertext;
				}

				return wordArray.toString(Base64);
			},

			/**
			 * Converts an OpenSSL-compatible string to a cipher params object.
			 *
			 * @param {string} openSSLStr The OpenSSL-compatible string.
			 *
			 * @return {CipherParams} The cipher params object.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
			 */
			parse: function(openSSLStr) {
				// Parse base64
				var ciphertext = Base64.parse(openSSLStr);

				// Shortcut
				var ciphertextWords = ciphertext.words;

				// Test for salt
				if (ciphertextWords[0] == 0x53616c74 && ciphertextWords[1] == 0x65645f5f) {
					// Extract salt
					var salt = WordArray.create(ciphertextWords.slice(2, 4));

					// Remove salt from ciphertext
					ciphertextWords.splice(0, 4);
					ciphertext.sigBytes -= 16;
				}

				return CipherParams.create({
					ciphertext: ciphertext,
					salt: salt
				});
			}
		};

		/**
		 * A cipher wrapper that returns ciphertext as a serializable cipher params object.
		 */
		var SerializableCipher = C_lib.SerializableCipher = Base.extend({
			/**
			 * Configuration options.
			 *
			 * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
			 */
			cfg: Base.extend({
				format: OpenSSLFormatter
			}),

			/**
			 * Encrypts a message.
			 *
			 * @param {Cipher} cipher The cipher algorithm to use.
			 * @param {WordArray|string} message The message to encrypt.
			 * @param {WordArray} key The key.
			 * @param {Object} cfg (Optional) The configuration options to use for this operation.
			 *
			 * @return {CipherParams} A cipher params object.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
			 *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
			 *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
			 */
			encrypt: function(cipher, message, key, cfg) {
				// Apply config defaults
				cfg = this.cfg.extend(cfg);

				// Encrypt
				var encryptor = cipher.createEncryptor(key, cfg);
				var ciphertext = encryptor.finalize(message);

				// Shortcut
				var cipherCfg = encryptor.cfg;

				// Create and return serializable cipher params
				return CipherParams.create({
					ciphertext: ciphertext,
					key: key,
					iv: cipherCfg.iv,
					algorithm: cipher,
					mode: cipherCfg.mode,
					padding: cipherCfg.padding,
					blockSize: cipher.blockSize,
					formatter: cfg.format
				});
			},

			/**
			 * Decrypts serialized ciphertext.
			 *
			 * @param {Cipher} cipher The cipher algorithm to use.
			 * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
			 * @param {WordArray} key The key.
			 * @param {Object} cfg (Optional) The configuration options to use for this operation.
			 *
			 * @return {WordArray} The plaintext.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
			 *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
			 */
			decrypt: function(cipher, ciphertext, key, cfg) {
				// Apply config defaults
				cfg = this.cfg.extend(cfg);

				// Convert string to CipherParams
				ciphertext = this._parse(ciphertext, cfg.format);

				// Decrypt
				var plaintext = cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext || ciphertext);

				return plaintext;
			},

			/**
			 * Converts serialized ciphertext to CipherParams,
			 * else assumed CipherParams already and returns ciphertext unchanged.
			 *
			 * @param {CipherParams|string} ciphertext The ciphertext.
			 * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
			 *
			 * @return {CipherParams} The unserialized ciphertext.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
			 */
			_parse: function(ciphertext, format) {
				if (typeof ciphertext == 'string') {
					return format.parse(ciphertext, this);
				} else {
					return ciphertext;
				}
			}
		});

		/**
		 * Key derivation function namespace.
		 */
		var C_kdf = C.kdf = {};

		/**
		 * OpenSSL key derivation function.
		 */
		var OpenSSLKdf = C_kdf.OpenSSL = {
			/**
			 * Derives a key and IV from a password.
			 *
			 * @param {string} password The password to derive from.
			 * @param {number} keySize The size in words of the key to generate.
			 * @param {number} ivSize The size in words of the IV to generate.
			 * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
			 *
			 * @return {CipherParams} A cipher params object with the key, IV, and salt.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
			 *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
			 */
			execute: function(password, keySize, ivSize, salt) {
				// Generate random salt
				if (!salt) {
					salt = WordArray.random(64 / 8);
				}

				// Derive key and IV
				var key = EvpKDF.create({
					keySize: keySize + ivSize
				}).compute(password, salt);

				// Separate key and IV
				var iv = WordArray.create(key.words.slice(keySize), ivSize * 4);
				key.sigBytes = keySize * 4;

				// Return params
				return CipherParams.create({
					key: key,
					iv: iv,
					salt: salt
				});
			}
		};

		/**
		 * A serializable cipher wrapper that derives the key from a password,
		 * and returns ciphertext as a serializable cipher params object.
		 */
		var PasswordBasedCipher = C_lib.PasswordBasedCipher = SerializableCipher.extend({
			/**
			 * Configuration options.
			 *
			 * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
			 */
			cfg: SerializableCipher.cfg.extend({
				kdf: OpenSSLKdf
			}),

			/**
			 * Encrypts a message using a password.
			 *
			 * @param {Cipher} cipher The cipher algorithm to use.
			 * @param {WordArray|string} message The message to encrypt.
			 * @param {string} password The password.
			 * @param {Object} cfg (Optional) The configuration options to use for this operation.
			 *
			 * @return {CipherParams} A cipher params object.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
			 *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
			 */
			encrypt: function(cipher, message, password, cfg) {
				// Apply config defaults
				cfg = this.cfg.extend(cfg);

				// Derive key and other params
				var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize);

				// Add IV to config
				cfg.iv = derivedParams.iv;

				// Encrypt
				var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg);

				// Mix in derived params
				ciphertext.mixIn(derivedParams);

				return ciphertext;
			},

			/**
			 * Decrypts serialized ciphertext using a password.
			 *
			 * @param {Cipher} cipher The cipher algorithm to use.
			 * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
			 * @param {string} password The password.
			 * @param {Object} cfg (Optional) The configuration options to use for this operation.
			 *
			 * @return {WordArray} The plaintext.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
			 *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
			 */
			decrypt: function(cipher, ciphertext, password, cfg) {
				// Apply config defaults
				cfg = this.cfg.extend(cfg);

				// Convert string to CipherParams
				ciphertext = this._parse(ciphertext, cfg.format);

				// Derive key and other params
				var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, ciphertext.salt);

				// Add IV to config
				cfg.iv = derivedParams.iv;

				// Decrypt
				var plaintext = SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg);

				return plaintext;
			}
		});
	}());
	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	(function(Math) {
		// Shortcuts
		var C = CryptoJS;
		var C_lib = C.lib;
		var WordArray = C_lib.WordArray;
		var Hasher = C_lib.Hasher;
		var C_algo = C.algo;

		// Constants table
		var T = [];

		// Compute constants
		(function() {
			for (var i = 0; i < 64; i++) {
				T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
			}
		}());

		/**
		 * MD5 hash algorithm.
		 */
		var MD5 = C_algo.MD5 = Hasher.extend({
			_doReset: function() {
				this._hash = new WordArray.init([
					0x67452301, 0xefcdab89,
					0x98badcfe, 0x10325476
				]);
			},

			_doProcessBlock: function(M, offset) {
				// Swap endian
				for (var i = 0; i < 16; i++) {
					// Shortcuts
					var offset_i = offset + i;
					var M_offset_i = M[offset_i];

					M[offset_i] = (
						(((M_offset_i << 8) | (M_offset_i >>> 24)) & 0x00ff00ff) |
						(((M_offset_i << 24) | (M_offset_i >>> 8)) & 0xff00ff00)
					);
				}

				// Shortcuts
				var H = this._hash.words;

				var M_offset_0 = M[offset + 0];
				var M_offset_1 = M[offset + 1];
				var M_offset_2 = M[offset + 2];
				var M_offset_3 = M[offset + 3];
				var M_offset_4 = M[offset + 4];
				var M_offset_5 = M[offset + 5];
				var M_offset_6 = M[offset + 6];
				var M_offset_7 = M[offset + 7];
				var M_offset_8 = M[offset + 8];
				var M_offset_9 = M[offset + 9];
				var M_offset_10 = M[offset + 10];
				var M_offset_11 = M[offset + 11];
				var M_offset_12 = M[offset + 12];
				var M_offset_13 = M[offset + 13];
				var M_offset_14 = M[offset + 14];
				var M_offset_15 = M[offset + 15];

				// Working varialbes
				var a = H[0];
				var b = H[1];
				var c = H[2];
				var d = H[3];

				// Computation
				a = FF(a, b, c, d, M_offset_0, 7, T[0]);
				d = FF(d, a, b, c, M_offset_1, 12, T[1]);
				c = FF(c, d, a, b, M_offset_2, 17, T[2]);
				b = FF(b, c, d, a, M_offset_3, 22, T[3]);
				a = FF(a, b, c, d, M_offset_4, 7, T[4]);
				d = FF(d, a, b, c, M_offset_5, 12, T[5]);
				c = FF(c, d, a, b, M_offset_6, 17, T[6]);
				b = FF(b, c, d, a, M_offset_7, 22, T[7]);
				a = FF(a, b, c, d, M_offset_8, 7, T[8]);
				d = FF(d, a, b, c, M_offset_9, 12, T[9]);
				c = FF(c, d, a, b, M_offset_10, 17, T[10]);
				b = FF(b, c, d, a, M_offset_11, 22, T[11]);
				a = FF(a, b, c, d, M_offset_12, 7, T[12]);
				d = FF(d, a, b, c, M_offset_13, 12, T[13]);
				c = FF(c, d, a, b, M_offset_14, 17, T[14]);
				b = FF(b, c, d, a, M_offset_15, 22, T[15]);

				a = GG(a, b, c, d, M_offset_1, 5, T[16]);
				d = GG(d, a, b, c, M_offset_6, 9, T[17]);
				c = GG(c, d, a, b, M_offset_11, 14, T[18]);
				b = GG(b, c, d, a, M_offset_0, 20, T[19]);
				a = GG(a, b, c, d, M_offset_5, 5, T[20]);
				d = GG(d, a, b, c, M_offset_10, 9, T[21]);
				c = GG(c, d, a, b, M_offset_15, 14, T[22]);
				b = GG(b, c, d, a, M_offset_4, 20, T[23]);
				a = GG(a, b, c, d, M_offset_9, 5, T[24]);
				d = GG(d, a, b, c, M_offset_14, 9, T[25]);
				c = GG(c, d, a, b, M_offset_3, 14, T[26]);
				b = GG(b, c, d, a, M_offset_8, 20, T[27]);
				a = GG(a, b, c, d, M_offset_13, 5, T[28]);
				d = GG(d, a, b, c, M_offset_2, 9, T[29]);
				c = GG(c, d, a, b, M_offset_7, 14, T[30]);
				b = GG(b, c, d, a, M_offset_12, 20, T[31]);

				a = HH(a, b, c, d, M_offset_5, 4, T[32]);
				d = HH(d, a, b, c, M_offset_8, 11, T[33]);
				c = HH(c, d, a, b, M_offset_11, 16, T[34]);
				b = HH(b, c, d, a, M_offset_14, 23, T[35]);
				a = HH(a, b, c, d, M_offset_1, 4, T[36]);
				d = HH(d, a, b, c, M_offset_4, 11, T[37]);
				c = HH(c, d, a, b, M_offset_7, 16, T[38]);
				b = HH(b, c, d, a, M_offset_10, 23, T[39]);
				a = HH(a, b, c, d, M_offset_13, 4, T[40]);
				d = HH(d, a, b, c, M_offset_0, 11, T[41]);
				c = HH(c, d, a, b, M_offset_3, 16, T[42]);
				b = HH(b, c, d, a, M_offset_6, 23, T[43]);
				a = HH(a, b, c, d, M_offset_9, 4, T[44]);
				d = HH(d, a, b, c, M_offset_12, 11, T[45]);
				c = HH(c, d, a, b, M_offset_15, 16, T[46]);
				b = HH(b, c, d, a, M_offset_2, 23, T[47]);

				a = II(a, b, c, d, M_offset_0, 6, T[48]);
				d = II(d, a, b, c, M_offset_7, 10, T[49]);
				c = II(c, d, a, b, M_offset_14, 15, T[50]);
				b = II(b, c, d, a, M_offset_5, 21, T[51]);
				a = II(a, b, c, d, M_offset_12, 6, T[52]);
				d = II(d, a, b, c, M_offset_3, 10, T[53]);
				c = II(c, d, a, b, M_offset_10, 15, T[54]);
				b = II(b, c, d, a, M_offset_1, 21, T[55]);
				a = II(a, b, c, d, M_offset_8, 6, T[56]);
				d = II(d, a, b, c, M_offset_15, 10, T[57]);
				c = II(c, d, a, b, M_offset_6, 15, T[58]);
				b = II(b, c, d, a, M_offset_13, 21, T[59]);
				a = II(a, b, c, d, M_offset_4, 6, T[60]);
				d = II(d, a, b, c, M_offset_11, 10, T[61]);
				c = II(c, d, a, b, M_offset_2, 15, T[62]);
				b = II(b, c, d, a, M_offset_9, 21, T[63]);

				// Intermediate hash value
				H[0] = (H[0] + a) | 0;
				H[1] = (H[1] + b) | 0;
				H[2] = (H[2] + c) | 0;
				H[3] = (H[3] + d) | 0;
			},

			_doFinalize: function() {
				// Shortcuts
				var data = this._data;
				var dataWords = data.words;

				var nBitsTotal = this._nDataBytes * 8;
				var nBitsLeft = data.sigBytes * 8;

				// Add padding
				dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);

				var nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
				var nBitsTotalL = nBitsTotal;
				dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (
					(((nBitsTotalH << 8) | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
					(((nBitsTotalH << 24) | (nBitsTotalH >>> 8)) & 0xff00ff00)
				);
				dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
					(((nBitsTotalL << 8) | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
					(((nBitsTotalL << 24) | (nBitsTotalL >>> 8)) & 0xff00ff00)
				);

				data.sigBytes = (dataWords.length + 1) * 4;

				// Hash final blocks
				this._process();

				// Shortcuts
				var hash = this._hash;
				var H = hash.words;

				// Swap endian
				for (var i = 0; i < 4; i++) {
					// Shortcut
					var H_i = H[i];

					H[i] = (((H_i << 8) | (H_i >>> 24)) & 0x00ff00ff) |
						(((H_i << 24) | (H_i >>> 8)) & 0xff00ff00);
				}

				// Return final computed hash
				return hash;
			},

			clone: function() {
				var clone = Hasher.clone.call(this);
				clone._hash = this._hash.clone();

				return clone;
			}
		});

		function FF(a, b, c, d, x, s, t) {
			var n = a + ((b & c) | (~b & d)) + x + t;
			return ((n << s) | (n >>> (32 - s))) + b;
		}

		function GG(a, b, c, d, x, s, t) {
			var n = a + ((b & d) | (c & ~d)) + x + t;
			return ((n << s) | (n >>> (32 - s))) + b;
		}

		function HH(a, b, c, d, x, s, t) {
			var n = a + (b ^ c ^ d) + x + t;
			return ((n << s) | (n >>> (32 - s))) + b;
		}

		function II(a, b, c, d, x, s, t) {
			var n = a + (c ^ (b | ~d)) + x + t;
			return ((n << s) | (n >>> (32 - s))) + b;
		}

		/**
		 * Shortcut function to the hasher's object interface.
		 *
		 * @param {WordArray|string} message The message to hash.
		 *
		 * @return {WordArray} The hash.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     var hash = CryptoJS.MD5('message');
		 *     var hash = CryptoJS.MD5(wordArray);
		 */
		C.MD5 = Hasher._createHelper(MD5);

		/**
		 * Shortcut function to the HMAC's object interface.
		 *
		 * @param {WordArray|string} message The message to hash.
		 * @param {WordArray|string} key The secret key.
		 *
		 * @return {WordArray} The HMAC.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     var hmac = CryptoJS.HmacMD5(message, key);
		 */
		C.HmacMD5 = Hasher._createHmacHelper(MD5);
	}(Math));

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	(function() {
		// Shortcuts
		var C = CryptoJS;
		var C_lib = C.lib;
		var Base = C_lib.Base;
		var WordArray = C_lib.WordArray;
		var C_algo = C.algo;
		var SHA1 = C_algo.SHA1;
		var HMAC = C_algo.HMAC;

		/**
		 * Password-Based Key Derivation Function 2 algorithm.
		 */
		var PBKDF2 = C_algo.PBKDF2 = Base.extend({
			/**
			 * Configuration options.
			 *
			 * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
			 * @property {Hasher} hasher The hasher to use. Default: SHA1
			 * @property {number} iterations The number of iterations to perform. Default: 1
			 */
			cfg: Base.extend({
				keySize: 128 / 32,
				hasher: SHA1,
				iterations: 1
			}),

			/**
			 * Initializes a newly created key derivation function.
			 *
			 * @param {Object} cfg (Optional) The configuration options to use for the derivation.
			 *
			 * @example
			 *
			 *     var kdf = CryptoJS.algo.PBKDF2.create();
			 *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
			 *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
			 */
			init: function(cfg) {
				this.cfg = this.cfg.extend(cfg);
			},

			/**
			 * Computes the Password-Based Key Derivation Function 2.
			 *
			 * @param {WordArray|string} password The password.
			 * @param {WordArray|string} salt A salt.
			 *
			 * @return {WordArray} The derived key.
			 *
			 * @example
			 *
			 *     var key = kdf.compute(password, salt);
			 */
			compute: function(password, salt) {
				// Shortcut
				var cfg = this.cfg;

				// Init HMAC
				var hmac = HMAC.create(cfg.hasher, password);

				// Initial values
				var derivedKey = WordArray.create();
				var blockIndex = WordArray.create([0x00000001]);

				// Shortcuts
				var derivedKeyWords = derivedKey.words;
				var blockIndexWords = blockIndex.words;
				var keySize = cfg.keySize;
				var iterations = cfg.iterations;

				// Generate key
				while (derivedKeyWords.length < keySize) {
					var block = hmac.update(salt).finalize(blockIndex);
					hmac.reset();

					// Shortcuts
					var blockWords = block.words;
					var blockWordsLength = blockWords.length;

					// Iterations
					var intermediate = block;
					for (var i = 1; i < iterations; i++) {
						intermediate = hmac.finalize(intermediate);
						hmac.reset();

						// Shortcut
						var intermediateWords = intermediate.words;

						// XOR intermediate with block
						for (var j = 0; j < blockWordsLength; j++) {
							blockWords[j] ^= intermediateWords[j];
						}
					}

					derivedKey.concat(block);
					blockIndexWords[0]++;
				}
				derivedKey.sigBytes = keySize * 4;

				return derivedKey;
			}
		});

		/**
		 * Computes the Password-Based Key Derivation Function 2.
		 *
		 * @param {WordArray|string} password The password.
		 * @param {WordArray|string} salt A salt.
		 * @param {Object} cfg (Optional) The configuration options to use for this computation.
		 *
		 * @return {WordArray} The derived key.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     var key = CryptoJS.PBKDF2(password, salt);
		 *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8 });
		 *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8, iterations: 1000 });
		 */
		C.PBKDF2 = function(password, salt, cfg) {
			return PBKDF2.create(cfg).compute(password, salt);
		};
	}());

	/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
	 */
	// prng4.js - uses Arcfour as a PRNG

	function Arcfour() {
		this.i = 0;
		this.j = 0;
		this.S = new Array();
	}

	// Initialize arcfour context from key, an array of ints, each from [0..255]
	function ARC4init(key) {
		var i, j, t;
		for (i = 0; i < 256; ++i)
			this.S[i] = i;
		j = 0;
		for (i = 0; i < 256; ++i) {
			j = (j + this.S[i] + key[i % key.length]) & 255;
			t = this.S[i];
			this.S[i] = this.S[j];
			this.S[j] = t;
		}
		this.i = 0;
		this.j = 0;
	}

	function ARC4next() {
		var t;
		this.i = (this.i + 1) & 255;
		this.j = (this.j + this.S[this.i]) & 255;
		t = this.S[this.i];
		this.S[this.i] = this.S[this.j];
		this.S[this.j] = t;
		return this.S[(t + this.S[this.i]) & 255];
	}

	Arcfour.prototype.init = ARC4init;
	Arcfour.prototype.next = ARC4next;

	// Plug in your RNG constructor here
	function prng_newstate() {
		return new Arcfour();
	}

	// Pool size must be a multiple of 4 and greater than 32.
	// An array of bytes the size of the pool will be passed to init()
	var rng_psize = 256;

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	/** @preserve
	(c) 2012 by Cédric Mesnil. All rights reserved.

	Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

	    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
	    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/

	(function(Math) {
		// Shortcuts
		var C = CryptoJS;
		var C_lib = C.lib;
		var WordArray = C_lib.WordArray;
		var Hasher = C_lib.Hasher;
		var C_algo = C.algo;

		// Constants table
		var _zl = WordArray.create([
			0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
			7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
			3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
			1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
			4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
		]);
		var _zr = WordArray.create([
			5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
			6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
			15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
			8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
			12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
		]);
		var _sl = WordArray.create([
			11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
			7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
			11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
			11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
			9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
		]);
		var _sr = WordArray.create([
			8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
			9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
			9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
			15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
			8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
		]);

		var _hl = WordArray.create([0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E]);
		var _hr = WordArray.create([0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000]);

		/**
		 * RIPEMD160 hash algorithm.
		 */
		var RIPEMD160 = C_algo.RIPEMD160 = Hasher.extend({
			_doReset: function() {
				this._hash = WordArray.create([0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0]);
			},

			_doProcessBlock: function(M, offset) {

				// Swap endian
				for (var i = 0; i < 16; i++) {
					// Shortcuts
					var offset_i = offset + i;
					var M_offset_i = M[offset_i];

					// Swap
					M[offset_i] = (
						(((M_offset_i << 8) | (M_offset_i >>> 24)) & 0x00ff00ff) |
						(((M_offset_i << 24) | (M_offset_i >>> 8)) & 0xff00ff00)
					);
				}
				// Shortcut
				var H = this._hash.words;
				var hl = _hl.words;
				var hr = _hr.words;
				var zl = _zl.words;
				var zr = _zr.words;
				var sl = _sl.words;
				var sr = _sr.words;

				// Working variables
				var al, bl, cl, dl, el;
				var ar, br, cr, dr, er;

				ar = al = H[0];
				br = bl = H[1];
				cr = cl = H[2];
				dr = dl = H[3];
				er = el = H[4];
				// Computation
				var t;
				for (var i = 0; i < 80; i += 1) {
					t = (al + M[offset + zl[i]]) | 0;
					if (i < 16) {
						t += f1(bl, cl, dl) + hl[0];
					} else if (i < 32) {
						t += f2(bl, cl, dl) + hl[1];
					} else if (i < 48) {
						t += f3(bl, cl, dl) + hl[2];
					} else if (i < 64) {
						t += f4(bl, cl, dl) + hl[3];
					} else { // if (i<80) {
						t += f5(bl, cl, dl) + hl[4];
					}
					t = t | 0;
					t = rotl(t, sl[i]);
					t = (t + el) | 0;
					al = el;
					el = dl;
					dl = rotl(cl, 10);
					cl = bl;
					bl = t;

					t = (ar + M[offset + zr[i]]) | 0;
					if (i < 16) {
						t += f5(br, cr, dr) + hr[0];
					} else if (i < 32) {
						t += f4(br, cr, dr) + hr[1];
					} else if (i < 48) {
						t += f3(br, cr, dr) + hr[2];
					} else if (i < 64) {
						t += f2(br, cr, dr) + hr[3];
					} else { // if (i<80) {
						t += f1(br, cr, dr) + hr[4];
					}
					t = t | 0;
					t = rotl(t, sr[i]);
					t = (t + er) | 0;
					ar = er;
					er = dr;
					dr = rotl(cr, 10);
					cr = br;
					br = t;
				}
				// Intermediate hash value
				t = (H[1] + cl + dr) | 0;
				H[1] = (H[2] + dl + er) | 0;
				H[2] = (H[3] + el + ar) | 0;
				H[3] = (H[4] + al + br) | 0;
				H[4] = (H[0] + bl + cr) | 0;
				H[0] = t;
			},

			_doFinalize: function() {
				// Shortcuts
				var data = this._data;
				var dataWords = data.words;

				var nBitsTotal = this._nDataBytes * 8;
				var nBitsLeft = data.sigBytes * 8;

				// Add padding
				dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
				dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
					(((nBitsTotal << 8) | (nBitsTotal >>> 24)) & 0x00ff00ff) |
					(((nBitsTotal << 24) | (nBitsTotal >>> 8)) & 0xff00ff00)
				);
				data.sigBytes = (dataWords.length + 1) * 4;

				// Hash final blocks
				this._process();

				// Shortcuts
				var hash = this._hash;
				var H = hash.words;

				// Swap endian
				for (var i = 0; i < 5; i++) {
					// Shortcut
					var H_i = H[i];

					// Swap
					H[i] = (((H_i << 8) | (H_i >>> 24)) & 0x00ff00ff) |
						(((H_i << 24) | (H_i >>> 8)) & 0xff00ff00);
				}

				// Return final computed hash
				return hash;
			},

			clone: function() {
				var clone = Hasher.clone.call(this);
				clone._hash = this._hash.clone();

				return clone;
			}
		});


		function f1(x, y, z) {
			return ((x) ^ (y) ^ (z));

		}

		function f2(x, y, z) {
			return (((x) & (y)) | ((~x) & (z)));
		}

		function f3(x, y, z) {
			return (((x) | (~(y))) ^ (z));
		}

		function f4(x, y, z) {
			return (((x) & (z)) | ((y) & (~(z))));
		}

		function f5(x, y, z) {
			return ((x) ^ ((y) | (~(z))));

		}

		function rotl(x, n) {
			return (x << n) | (x >>> (32 - n));
		}


		/**
		 * Shortcut function to the hasher's object interface.
		 *
		 * @param {WordArray|string} message The message to hash.
		 *
		 * @return {WordArray} The hash.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     var hash = CryptoJS.RIPEMD160('message');
		 *     var hash = CryptoJS.RIPEMD160(wordArray);
		 */
		C.RIPEMD160 = Hasher._createHelper(RIPEMD160);

		/**
		 * Shortcut function to the HMAC's object interface.
		 *
		 * @param {WordArray|string} message The message to hash.
		 * @param {WordArray|string} key The secret key.
		 *
		 * @return {WordArray} The HMAC.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     var hmac = CryptoJS.HmacRIPEMD160(message, key);
		 */
		C.HmacRIPEMD160 = Hasher._createHmacHelper(RIPEMD160);
	}(Math));

	/*! CryptoJS v3.1.2 core-fix.js
	 * code.google.com/p/crypto-js
	 * (c) 2009-2013 by Jeff Mott. All rights reserved.
	 * code.google.com/p/crypto-js/wiki/License
	 * THIS IS FIX of 'core.js' to fix Hmac issue.
	 * https://code.google.com/p/crypto-js/issues/detail?id=84
	 * https://crypto-js.googlecode.com/svn-history/r667/branches/3.x/src/core.js
	 */
	/**
	 * CryptoJS core components.
	 */
	var CryptoJS = CryptoJS || (function(Math, undefined) {
		/**
		 * CryptoJS namespace.
		 */
		var C = {};

		/**
		 * Library namespace.
		 */
		var C_lib = C.lib = {};

		/**
		 * Base object for prototypal inheritance.
		 */
		var Base = C_lib.Base = (function() {
			function F() {}

			return {
				/**
				 * Creates a new object that inherits from this object.
				 *
				 * @param {Object} overrides Properties to copy into the new object.
				 *
				 * @return {Object} The new object.
				 *
				 * @static
				 *
				 * @example
				 *
				 *     var MyType = CryptoJS.lib.Base.extend({
				 *         field: 'value',
				 *
				 *         method: function () {
				 *         }
				 *     });
				 */
				extend: function(overrides) {
					// Spawn
					F.prototype = this;
					var subtype = new F();

					// Augment
					if (overrides) {
						subtype.mixIn(overrides);
					}

					// Create default initializer
					if (!subtype.hasOwnProperty('init')) {
						subtype.init = function() {
							subtype.$super.init.apply(this, arguments);
						};
					}

					// Initializer's prototype is the subtype object
					subtype.init.prototype = subtype;

					// Reference supertype
					subtype.$super = this;

					return subtype;
				},

				/**
				 * Extends this object and runs the init method.
				 * Arguments to create() will be passed to init().
				 *
				 * @return {Object} The new object.
				 *
				 * @static
				 *
				 * @example
				 *
				 *     var instance = MyType.create();
				 */
				create: function() {
					var instance = this.extend();
					instance.init.apply(instance, arguments);

					return instance;
				},

				/**
				 * Initializes a newly created object.
				 * Override this method to add some logic when your objects are created.
				 *
				 * @example
				 *
				 *     var MyType = CryptoJS.lib.Base.extend({
				 *         init: function () {
				 *             // ...
				 *         }
				 *     });
				 */
				init: function() {},

				/**
				 * Copies properties into this object.
				 *
				 * @param {Object} properties The properties to mix in.
				 *
				 * @example
				 *
				 *     MyType.mixIn({
				 *         field: 'value'
				 *     });
				 */
				mixIn: function(properties) {
					for (var propertyName in properties) {
						if (properties.hasOwnProperty(propertyName)) {
							this[propertyName] = properties[propertyName];
						}
					}

					// IE won't copy toString using the loop above
					if (properties.hasOwnProperty('toString')) {
						this.toString = properties.toString;
					}
				},

				/**
				 * Creates a copy of this object.
				 *
				 * @return {Object} The clone.
				 *
				 * @example
				 *
				 *     var clone = instance.clone();
				 */
				clone: function() {
					return this.init.prototype.extend(this);
				}
			};
		}());

		/**
		 * An array of 32-bit words.
		 *
		 * @property {Array} words The array of 32-bit words.
		 * @property {number} sigBytes The number of significant bytes in this word array.
		 */
		var WordArray = C_lib.WordArray = Base.extend({
			/**
			 * Initializes a newly created word array.
			 *
			 * @param {Array} words (Optional) An array of 32-bit words.
			 * @param {number} sigBytes (Optional) The number of significant bytes in the words.
			 *
			 * @example
			 *
			 *     var wordArray = CryptoJS.lib.WordArray.create();
			 *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
			 *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
			 */
			init: function(words, sigBytes) {
				words = this.words = words || [];

				if (sigBytes != undefined) {
					this.sigBytes = sigBytes;
				} else {
					this.sigBytes = words.length * 4;
				}
			},

			/**
			 * Converts this word array to a string.
			 *
			 * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
			 *
			 * @return {string} The stringified word array.
			 *
			 * @example
			 *
			 *     var string = wordArray + '';
			 *     var string = wordArray.toString();
			 *     var string = wordArray.toString(CryptoJS.enc.Utf8);
			 */
			toString: function(encoder) {
				return (encoder || Hex).stringify(this);
			},

			/**
			 * Concatenates a word array to this word array.
			 *
			 * @param {WordArray} wordArray The word array to append.
			 *
			 * @return {WordArray} This word array.
			 *
			 * @example
			 *
			 *     wordArray1.concat(wordArray2);
			 */
			concat: function(wordArray) {
				// Shortcuts
				var thisWords = this.words;
				var thatWords = wordArray.words;
				var thisSigBytes = this.sigBytes;
				var thatSigBytes = wordArray.sigBytes;

				// Clamp excess bits
				this.clamp();

				// Concat
				if (thisSigBytes % 4) {
					// Copy one byte at a time
					for (var i = 0; i < thatSigBytes; i++) {
						var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
						thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
					}
				} else {
					// Copy one word at a time
					for (var i = 0; i < thatSigBytes; i += 4) {
						thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
					}
				}
				this.sigBytes += thatSigBytes;

				// Chainable
				return this;
			},

			/**
			 * Removes insignificant bits.
			 *
			 * @example
			 *
			 *     wordArray.clamp();
			 */
			clamp: function() {
				// Shortcuts
				var words = this.words;
				var sigBytes = this.sigBytes;

				// Clamp
				words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
				words.length = Math.ceil(sigBytes / 4);
			},

			/**
			 * Creates a copy of this word array.
			 *
			 * @return {WordArray} The clone.
			 *
			 * @example
			 *
			 *     var clone = wordArray.clone();
			 */
			clone: function() {
				var clone = Base.clone.call(this);
				clone.words = this.words.slice(0);

				return clone;
			},

			/**
			 * Creates a word array filled with random bytes.
			 *
			 * @param {number} nBytes The number of random bytes to generate.
			 *
			 * @return {WordArray} The random word array.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var wordArray = CryptoJS.lib.WordArray.random(16);
			 */
			random: function(nBytes) {
				var words = [];
				for (var i = 0; i < nBytes; i += 4) {
					words.push((Math.random() * 0x100000000) | 0);
				}

				return new WordArray.init(words, nBytes);
			}
		});

		/**
		 * Encoder namespace.
		 */
		var C_enc = C.enc = {};

		/**
		 * Hex encoding strategy.
		 */
		var Hex = C_enc.Hex = {
			/**
			 * Converts a word array to a hex string.
			 *
			 * @param {WordArray} wordArray The word array.
			 *
			 * @return {string} The hex string.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
			 */
			stringify: function(wordArray) {
				// Shortcuts
				var words = wordArray.words;
				var sigBytes = wordArray.sigBytes;

				// Convert
				var hexChars = [];
				for (var i = 0; i < sigBytes; i++) {
					var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
					hexChars.push((bite >>> 4).toString(16));
					hexChars.push((bite & 0x0f).toString(16));
				}

				return hexChars.join('');
			},

			/**
			 * Converts a hex string to a word array.
			 *
			 * @param {string} hexStr The hex string.
			 *
			 * @return {WordArray} The word array.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
			 */
			parse: function(hexStr) {
				// Shortcut
				var hexStrLength = hexStr.length;

				// Convert
				var words = [];
				for (var i = 0; i < hexStrLength; i += 2) {
					words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
				}

				return new WordArray.init(words, hexStrLength / 2);
			}
		};

		/**
		 * Latin1 encoding strategy.
		 */
		var Latin1 = C_enc.Latin1 = {
			/**
			 * Converts a word array to a Latin1 string.
			 *
			 * @param {WordArray} wordArray The word array.
			 *
			 * @return {string} The Latin1 string.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
			 */
			stringify: function(wordArray) {
				// Shortcuts
				var words = wordArray.words;
				var sigBytes = wordArray.sigBytes;

				// Convert
				var latin1Chars = [];
				for (var i = 0; i < sigBytes; i++) {
					var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
					latin1Chars.push(String.fromCharCode(bite));
				}

				return latin1Chars.join('');
			},

			/**
			 * Converts a Latin1 string to a word array.
			 *
			 * @param {string} latin1Str The Latin1 string.
			 *
			 * @return {WordArray} The word array.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
			 */
			parse: function(latin1Str) {
				// Shortcut
				var latin1StrLength = latin1Str.length;

				// Convert
				var words = [];
				for (var i = 0; i < latin1StrLength; i++) {
					words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
				}

				return new WordArray.init(words, latin1StrLength);
			}
		};

		/**
		 * UTF-8 encoding strategy.
		 */
		var Utf8 = C_enc.Utf8 = {
			/**
			 * Converts a word array to a UTF-8 string.
			 *
			 * @param {WordArray} wordArray The word array.
			 *
			 * @return {string} The UTF-8 string.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
			 */
			stringify: function(wordArray) {
				try {
					return decodeURIComponent(escape(Latin1.stringify(wordArray)));
				} catch (e) {
					throw new Error('Malformed UTF-8 data');
				}
			},

			/**
			 * Converts a UTF-8 string to a word array.
			 *
			 * @param {string} utf8Str The UTF-8 string.
			 *
			 * @return {WordArray} The word array.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
			 */
			parse: function(utf8Str) {
				return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
			}
		};

		/**
		 * Abstract buffered block algorithm template.
		 *
		 * The property blockSize must be implemented in a concrete subtype.
		 *
		 * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
		 */
		var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
			/**
			 * Resets this block algorithm's data buffer to its initial state.
			 *
			 * @example
			 *
			 *     bufferedBlockAlgorithm.reset();
			 */
			reset: function() {
				// Initial values
				this._data = new WordArray.init();
				this._nDataBytes = 0;
			},

			/**
			 * Adds new data to this block algorithm's buffer.
			 *
			 * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
			 *
			 * @example
			 *
			 *     bufferedBlockAlgorithm._append('data');
			 *     bufferedBlockAlgorithm._append(wordArray);
			 */
			_append: function(data) {
				// Convert string to WordArray, else assume WordArray already
				if (typeof data == 'string') {
					data = Utf8.parse(data);
				}

				// Append
				this._data.concat(data);
				this._nDataBytes += data.sigBytes;
			},

			/**
			 * Processes available data blocks.
			 *
			 * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
			 *
			 * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
			 *
			 * @return {WordArray} The processed data.
			 *
			 * @example
			 *
			 *     var processedData = bufferedBlockAlgorithm._process();
			 *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
			 */
			_process: function(doFlush) {
				// Shortcuts
				var data = this._data;
				var dataWords = data.words;
				var dataSigBytes = data.sigBytes;
				var blockSize = this.blockSize;
				var blockSizeBytes = blockSize * 4;

				// Count blocks ready
				var nBlocksReady = dataSigBytes / blockSizeBytes;
				if (doFlush) {
					// Round up to include partial blocks
					nBlocksReady = Math.ceil(nBlocksReady);
				} else {
					// Round down to include only full blocks,
					// less the number of blocks that must remain in the buffer
					nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
				}

				// Count words ready
				var nWordsReady = nBlocksReady * blockSize;

				// Count bytes ready
				var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

				// Process blocks
				if (nWordsReady) {
					for (var offset = 0; offset < nWordsReady; offset += blockSize) {
						// Perform concrete-algorithm logic
						this._doProcessBlock(dataWords, offset);
					}

					// Remove processed words
					var processedWords = dataWords.splice(0, nWordsReady);
					data.sigBytes -= nBytesReady;
				}

				// Return processed words
				return new WordArray.init(processedWords, nBytesReady);
			},

			/**
			 * Creates a copy of this object.
			 *
			 * @return {Object} The clone.
			 *
			 * @example
			 *
			 *     var clone = bufferedBlockAlgorithm.clone();
			 */
			clone: function() {
				var clone = Base.clone.call(this);
				clone._data = this._data.clone();

				return clone;
			},

			_minBufferSize: 0
		});

		/**
		 * Abstract hasher template.
		 *
		 * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
		 */
		var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
			/**
			 * Configuration options.
			 */
			cfg: Base.extend(),

			/**
			 * Initializes a newly created hasher.
			 *
			 * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
			 *
			 * @example
			 *
			 *     var hasher = CryptoJS.algo.SHA256.create();
			 */
			init: function(cfg) {
				// Apply config defaults
				this.cfg = this.cfg.extend(cfg);

				// Set initial values
				this.reset();
			},

			/**
			 * Resets this hasher to its initial state.
			 *
			 * @example
			 *
			 *     hasher.reset();
			 */
			reset: function() {
				// Reset data buffer
				BufferedBlockAlgorithm.reset.call(this);

				// Perform concrete-hasher logic
				this._doReset();
			},

			/**
			 * Updates this hasher with a message.
			 *
			 * @param {WordArray|string} messageUpdate The message to append.
			 *
			 * @return {Hasher} This hasher.
			 *
			 * @example
			 *
			 *     hasher.update('message');
			 *     hasher.update(wordArray);
			 */
			update: function(messageUpdate) {
				// Append
				this._append(messageUpdate);

				// Update the hash
				this._process();

				// Chainable
				return this;
			},

			/**
			 * Finalizes the hash computation.
			 * Note that the finalize operation is effectively a destructive, read-once operation.
			 *
			 * @param {WordArray|string} messageUpdate (Optional) A final message update.
			 *
			 * @return {WordArray} The hash.
			 *
			 * @example
			 *
			 *     var hash = hasher.finalize();
			 *     var hash = hasher.finalize('message');
			 *     var hash = hasher.finalize(wordArray);
			 */
			finalize: function(messageUpdate) {
				// Final message update
				if (messageUpdate) {
					this._append(messageUpdate);
				}

				// Perform concrete-hasher logic
				var hash = this._doFinalize();

				return hash;
			},

			blockSize: 512 / 32,

			/**
			 * Creates a shortcut function to a hasher's object interface.
			 *
			 * @param {Hasher} hasher The hasher to create a helper for.
			 *
			 * @return {Function} The shortcut function.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
			 */
			_createHelper: function(hasher) {
				return function(message, cfg) {
					return new hasher.init(cfg).finalize(message);
				};
			},

			/**
			 * Creates a shortcut function to the HMAC's object interface.
			 *
			 * @param {Hasher} hasher The hasher to use in this HMAC helper.
			 *
			 * @return {Function} The shortcut function.
			 *
			 * @static
			 *
			 * @example
			 *
			 *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
			 */
			_createHmacHelper: function(hasher) {
				return function(message, key) {
					return new C_algo.HMAC.init(hasher, key).finalize(message);
				};
			}
		});

		/**
		 * Algorithm namespace.
		 */
		var C_algo = C.algo = {};

		return C;
	}(Math));

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	(function() {
		// Shortcuts
		var C = CryptoJS;
		var C_lib = C.lib;
		var WordArray = C_lib.WordArray;
		var BlockCipher = C_lib.BlockCipher;
		var C_algo = C.algo;

		// Permuted Choice 1 constants
		var PC1 = [
			57, 49, 41, 33, 25, 17, 9, 1,
			58, 50, 42, 34, 26, 18, 10, 2,
			59, 51, 43, 35, 27, 19, 11, 3,
			60, 52, 44, 36, 63, 55, 47, 39,
			31, 23, 15, 7, 62, 54, 46, 38,
			30, 22, 14, 6, 61, 53, 45, 37,
			29, 21, 13, 5, 28, 20, 12, 4
		];

		// Permuted Choice 2 constants
		var PC2 = [
			14, 17, 11, 24, 1, 5,
			3, 28, 15, 6, 21, 10,
			23, 19, 12, 4, 26, 8,
			16, 7, 27, 20, 13, 2,
			41, 52, 31, 37, 47, 55,
			30, 40, 51, 45, 33, 48,
			44, 49, 39, 56, 34, 53,
			46, 42, 50, 36, 29, 32
		];

		// Cumulative bit shift constants
		var BIT_SHIFTS = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28];

		// SBOXes and round permutation constants
		var SBOX_P = [{
				0x0: 0x808200,
				0x10000000: 0x8000,
				0x20000000: 0x808002,
				0x30000000: 0x2,
				0x40000000: 0x200,
				0x50000000: 0x808202,
				0x60000000: 0x800202,
				0x70000000: 0x800000,
				0x80000000: 0x202,
				0x90000000: 0x800200,
				0xa0000000: 0x8200,
				0xb0000000: 0x808000,
				0xc0000000: 0x8002,
				0xd0000000: 0x800002,
				0xe0000000: 0x0,
				0xf0000000: 0x8202,
				0x8000000: 0x0,
				0x18000000: 0x808202,
				0x28000000: 0x8202,
				0x38000000: 0x8000,
				0x48000000: 0x808200,
				0x58000000: 0x200,
				0x68000000: 0x808002,
				0x78000000: 0x2,
				0x88000000: 0x800200,
				0x98000000: 0x8200,
				0xa8000000: 0x808000,
				0xb8000000: 0x800202,
				0xc8000000: 0x800002,
				0xd8000000: 0x8002,
				0xe8000000: 0x202,
				0xf8000000: 0x800000,
				0x1: 0x8000,
				0x10000001: 0x2,
				0x20000001: 0x808200,
				0x30000001: 0x800000,
				0x40000001: 0x808002,
				0x50000001: 0x8200,
				0x60000001: 0x200,
				0x70000001: 0x800202,
				0x80000001: 0x808202,
				0x90000001: 0x808000,
				0xa0000001: 0x800002,
				0xb0000001: 0x8202,
				0xc0000001: 0x202,
				0xd0000001: 0x800200,
				0xe0000001: 0x8002,
				0xf0000001: 0x0,
				0x8000001: 0x808202,
				0x18000001: 0x808000,
				0x28000001: 0x800000,
				0x38000001: 0x200,
				0x48000001: 0x8000,
				0x58000001: 0x800002,
				0x68000001: 0x2,
				0x78000001: 0x8202,
				0x88000001: 0x8002,
				0x98000001: 0x800202,
				0xa8000001: 0x202,
				0xb8000001: 0x808200,
				0xc8000001: 0x800200,
				0xd8000001: 0x0,
				0xe8000001: 0x8200,
				0xf8000001: 0x808002
			},
			{
				0x0: 0x40084010,
				0x1000000: 0x4000,
				0x2000000: 0x80000,
				0x3000000: 0x40080010,
				0x4000000: 0x40000010,
				0x5000000: 0x40084000,
				0x6000000: 0x40004000,
				0x7000000: 0x10,
				0x8000000: 0x84000,
				0x9000000: 0x40004010,
				0xa000000: 0x40000000,
				0xb000000: 0x84010,
				0xc000000: 0x80010,
				0xd000000: 0x0,
				0xe000000: 0x4010,
				0xf000000: 0x40080000,
				0x800000: 0x40004000,
				0x1800000: 0x84010,
				0x2800000: 0x10,
				0x3800000: 0x40004010,
				0x4800000: 0x40084010,
				0x5800000: 0x40000000,
				0x6800000: 0x80000,
				0x7800000: 0x40080010,
				0x8800000: 0x80010,
				0x9800000: 0x0,
				0xa800000: 0x4000,
				0xb800000: 0x40080000,
				0xc800000: 0x40000010,
				0xd800000: 0x84000,
				0xe800000: 0x40084000,
				0xf800000: 0x4010,
				0x10000000: 0x0,
				0x11000000: 0x40080010,
				0x12000000: 0x40004010,
				0x13000000: 0x40084000,
				0x14000000: 0x40080000,
				0x15000000: 0x10,
				0x16000000: 0x84010,
				0x17000000: 0x4000,
				0x18000000: 0x4010,
				0x19000000: 0x80000,
				0x1a000000: 0x80010,
				0x1b000000: 0x40000010,
				0x1c000000: 0x84000,
				0x1d000000: 0x40004000,
				0x1e000000: 0x40000000,
				0x1f000000: 0x40084010,
				0x10800000: 0x84010,
				0x11800000: 0x80000,
				0x12800000: 0x40080000,
				0x13800000: 0x4000,
				0x14800000: 0x40004000,
				0x15800000: 0x40084010,
				0x16800000: 0x10,
				0x17800000: 0x40000000,
				0x18800000: 0x40084000,
				0x19800000: 0x40000010,
				0x1a800000: 0x40004010,
				0x1b800000: 0x80010,
				0x1c800000: 0x0,
				0x1d800000: 0x4010,
				0x1e800000: 0x40080010,
				0x1f800000: 0x84000
			},
			{
				0x0: 0x104,
				0x100000: 0x0,
				0x200000: 0x4000100,
				0x300000: 0x10104,
				0x400000: 0x10004,
				0x500000: 0x4000004,
				0x600000: 0x4010104,
				0x700000: 0x4010000,
				0x800000: 0x4000000,
				0x900000: 0x4010100,
				0xa00000: 0x10100,
				0xb00000: 0x4010004,
				0xc00000: 0x4000104,
				0xd00000: 0x10000,
				0xe00000: 0x4,
				0xf00000: 0x100,
				0x80000: 0x4010100,
				0x180000: 0x4010004,
				0x280000: 0x0,
				0x380000: 0x4000100,
				0x480000: 0x4000004,
				0x580000: 0x10000,
				0x680000: 0x10004,
				0x780000: 0x104,
				0x880000: 0x4,
				0x980000: 0x100,
				0xa80000: 0x4010000,
				0xb80000: 0x10104,
				0xc80000: 0x10100,
				0xd80000: 0x4000104,
				0xe80000: 0x4010104,
				0xf80000: 0x4000000,
				0x1000000: 0x4010100,
				0x1100000: 0x10004,
				0x1200000: 0x10000,
				0x1300000: 0x4000100,
				0x1400000: 0x100,
				0x1500000: 0x4010104,
				0x1600000: 0x4000004,
				0x1700000: 0x0,
				0x1800000: 0x4000104,
				0x1900000: 0x4000000,
				0x1a00000: 0x4,
				0x1b00000: 0x10100,
				0x1c00000: 0x4010000,
				0x1d00000: 0x104,
				0x1e00000: 0x10104,
				0x1f00000: 0x4010004,
				0x1080000: 0x4000000,
				0x1180000: 0x104,
				0x1280000: 0x4010100,
				0x1380000: 0x0,
				0x1480000: 0x10004,
				0x1580000: 0x4000100,
				0x1680000: 0x100,
				0x1780000: 0x4010004,
				0x1880000: 0x10000,
				0x1980000: 0x4010104,
				0x1a80000: 0x10104,
				0x1b80000: 0x4000004,
				0x1c80000: 0x4000104,
				0x1d80000: 0x4010000,
				0x1e80000: 0x4,
				0x1f80000: 0x10100
			},
			{
				0x0: 0x80401000,
				0x10000: 0x80001040,
				0x20000: 0x401040,
				0x30000: 0x80400000,
				0x40000: 0x0,
				0x50000: 0x401000,
				0x60000: 0x80000040,
				0x70000: 0x400040,
				0x80000: 0x80000000,
				0x90000: 0x400000,
				0xa0000: 0x40,
				0xb0000: 0x80001000,
				0xc0000: 0x80400040,
				0xd0000: 0x1040,
				0xe0000: 0x1000,
				0xf0000: 0x80401040,
				0x8000: 0x80001040,
				0x18000: 0x40,
				0x28000: 0x80400040,
				0x38000: 0x80001000,
				0x48000: 0x401000,
				0x58000: 0x80401040,
				0x68000: 0x0,
				0x78000: 0x80400000,
				0x88000: 0x1000,
				0x98000: 0x80401000,
				0xa8000: 0x400000,
				0xb8000: 0x1040,
				0xc8000: 0x80000000,
				0xd8000: 0x400040,
				0xe8000: 0x401040,
				0xf8000: 0x80000040,
				0x100000: 0x400040,
				0x110000: 0x401000,
				0x120000: 0x80000040,
				0x130000: 0x0,
				0x140000: 0x1040,
				0x150000: 0x80400040,
				0x160000: 0x80401000,
				0x170000: 0x80001040,
				0x180000: 0x80401040,
				0x190000: 0x80000000,
				0x1a0000: 0x80400000,
				0x1b0000: 0x401040,
				0x1c0000: 0x80001000,
				0x1d0000: 0x400000,
				0x1e0000: 0x40,
				0x1f0000: 0x1000,
				0x108000: 0x80400000,
				0x118000: 0x80401040,
				0x128000: 0x0,
				0x138000: 0x401000,
				0x148000: 0x400040,
				0x158000: 0x80000000,
				0x168000: 0x80001040,
				0x178000: 0x40,
				0x188000: 0x80000040,
				0x198000: 0x1000,
				0x1a8000: 0x80001000,
				0x1b8000: 0x80400040,
				0x1c8000: 0x1040,
				0x1d8000: 0x80401000,
				0x1e8000: 0x400000,
				0x1f8000: 0x401040
			},
			{
				0x0: 0x80,
				0x1000: 0x1040000,
				0x2000: 0x40000,
				0x3000: 0x20000000,
				0x4000: 0x20040080,
				0x5000: 0x1000080,
				0x6000: 0x21000080,
				0x7000: 0x40080,
				0x8000: 0x1000000,
				0x9000: 0x20040000,
				0xa000: 0x20000080,
				0xb000: 0x21040080,
				0xc000: 0x21040000,
				0xd000: 0x0,
				0xe000: 0x1040080,
				0xf000: 0x21000000,
				0x800: 0x1040080,
				0x1800: 0x21000080,
				0x2800: 0x80,
				0x3800: 0x1040000,
				0x4800: 0x40000,
				0x5800: 0x20040080,
				0x6800: 0x21040000,
				0x7800: 0x20000000,
				0x8800: 0x20040000,
				0x9800: 0x0,
				0xa800: 0x21040080,
				0xb800: 0x1000080,
				0xc800: 0x20000080,
				0xd800: 0x21000000,
				0xe800: 0x1000000,
				0xf800: 0x40080,
				0x10000: 0x40000,
				0x11000: 0x80,
				0x12000: 0x20000000,
				0x13000: 0x21000080,
				0x14000: 0x1000080,
				0x15000: 0x21040000,
				0x16000: 0x20040080,
				0x17000: 0x1000000,
				0x18000: 0x21040080,
				0x19000: 0x21000000,
				0x1a000: 0x1040000,
				0x1b000: 0x20040000,
				0x1c000: 0x40080,
				0x1d000: 0x20000080,
				0x1e000: 0x0,
				0x1f000: 0x1040080,
				0x10800: 0x21000080,
				0x11800: 0x1000000,
				0x12800: 0x1040000,
				0x13800: 0x20040080,
				0x14800: 0x20000000,
				0x15800: 0x1040080,
				0x16800: 0x80,
				0x17800: 0x21040000,
				0x18800: 0x40080,
				0x19800: 0x21040080,
				0x1a800: 0x0,
				0x1b800: 0x21000000,
				0x1c800: 0x1000080,
				0x1d800: 0x40000,
				0x1e800: 0x20040000,
				0x1f800: 0x20000080
			},
			{
				0x0: 0x10000008,
				0x100: 0x2000,
				0x200: 0x10200000,
				0x300: 0x10202008,
				0x400: 0x10002000,
				0x500: 0x200000,
				0x600: 0x200008,
				0x700: 0x10000000,
				0x800: 0x0,
				0x900: 0x10002008,
				0xa00: 0x202000,
				0xb00: 0x8,
				0xc00: 0x10200008,
				0xd00: 0x202008,
				0xe00: 0x2008,
				0xf00: 0x10202000,
				0x80: 0x10200000,
				0x180: 0x10202008,
				0x280: 0x8,
				0x380: 0x200000,
				0x480: 0x202008,
				0x580: 0x10000008,
				0x680: 0x10002000,
				0x780: 0x2008,
				0x880: 0x200008,
				0x980: 0x2000,
				0xa80: 0x10002008,
				0xb80: 0x10200008,
				0xc80: 0x0,
				0xd80: 0x10202000,
				0xe80: 0x202000,
				0xf80: 0x10000000,
				0x1000: 0x10002000,
				0x1100: 0x10200008,
				0x1200: 0x10202008,
				0x1300: 0x2008,
				0x1400: 0x200000,
				0x1500: 0x10000000,
				0x1600: 0x10000008,
				0x1700: 0x202000,
				0x1800: 0x202008,
				0x1900: 0x0,
				0x1a00: 0x8,
				0x1b00: 0x10200000,
				0x1c00: 0x2000,
				0x1d00: 0x10002008,
				0x1e00: 0x10202000,
				0x1f00: 0x200008,
				0x1080: 0x8,
				0x1180: 0x202000,
				0x1280: 0x200000,
				0x1380: 0x10000008,
				0x1480: 0x10002000,
				0x1580: 0x2008,
				0x1680: 0x10202008,
				0x1780: 0x10200000,
				0x1880: 0x10202000,
				0x1980: 0x10200008,
				0x1a80: 0x2000,
				0x1b80: 0x202008,
				0x1c80: 0x200008,
				0x1d80: 0x0,
				0x1e80: 0x10000000,
				0x1f80: 0x10002008
			},
			{
				0x0: 0x100000,
				0x10: 0x2000401,
				0x20: 0x400,
				0x30: 0x100401,
				0x40: 0x2100401,
				0x50: 0x0,
				0x60: 0x1,
				0x70: 0x2100001,
				0x80: 0x2000400,
				0x90: 0x100001,
				0xa0: 0x2000001,
				0xb0: 0x2100400,
				0xc0: 0x2100000,
				0xd0: 0x401,
				0xe0: 0x100400,
				0xf0: 0x2000000,
				0x8: 0x2100001,
				0x18: 0x0,
				0x28: 0x2000401,
				0x38: 0x2100400,
				0x48: 0x100000,
				0x58: 0x2000001,
				0x68: 0x2000000,
				0x78: 0x401,
				0x88: 0x100401,
				0x98: 0x2000400,
				0xa8: 0x2100000,
				0xb8: 0x100001,
				0xc8: 0x400,
				0xd8: 0x2100401,
				0xe8: 0x1,
				0xf8: 0x100400,
				0x100: 0x2000000,
				0x110: 0x100000,
				0x120: 0x2000401,
				0x130: 0x2100001,
				0x140: 0x100001,
				0x150: 0x2000400,
				0x160: 0x2100400,
				0x170: 0x100401,
				0x180: 0x401,
				0x190: 0x2100401,
				0x1a0: 0x100400,
				0x1b0: 0x1,
				0x1c0: 0x0,
				0x1d0: 0x2100000,
				0x1e0: 0x2000001,
				0x1f0: 0x400,
				0x108: 0x100400,
				0x118: 0x2000401,
				0x128: 0x2100001,
				0x138: 0x1,
				0x148: 0x2000000,
				0x158: 0x100000,
				0x168: 0x401,
				0x178: 0x2100400,
				0x188: 0x2000001,
				0x198: 0x2100000,
				0x1a8: 0x0,
				0x1b8: 0x2100401,
				0x1c8: 0x100401,
				0x1d8: 0x400,
				0x1e8: 0x2000400,
				0x1f8: 0x100001
			},
			{
				0x0: 0x8000820,
				0x1: 0x20000,
				0x2: 0x8000000,
				0x3: 0x20,
				0x4: 0x20020,
				0x5: 0x8020820,
				0x6: 0x8020800,
				0x7: 0x800,
				0x8: 0x8020000,
				0x9: 0x8000800,
				0xa: 0x20800,
				0xb: 0x8020020,
				0xc: 0x820,
				0xd: 0x0,
				0xe: 0x8000020,
				0xf: 0x20820,
				0x80000000: 0x800,
				0x80000001: 0x8020820,
				0x80000002: 0x8000820,
				0x80000003: 0x8000000,
				0x80000004: 0x8020000,
				0x80000005: 0x20800,
				0x80000006: 0x20820,
				0x80000007: 0x20,
				0x80000008: 0x8000020,
				0x80000009: 0x820,
				0x8000000a: 0x20020,
				0x8000000b: 0x8020800,
				0x8000000c: 0x0,
				0x8000000d: 0x8020020,
				0x8000000e: 0x8000800,
				0x8000000f: 0x20000,
				0x10: 0x20820,
				0x11: 0x8020800,
				0x12: 0x20,
				0x13: 0x800,
				0x14: 0x8000800,
				0x15: 0x8000020,
				0x16: 0x8020020,
				0x17: 0x20000,
				0x18: 0x0,
				0x19: 0x20020,
				0x1a: 0x8020000,
				0x1b: 0x8000820,
				0x1c: 0x8020820,
				0x1d: 0x20800,
				0x1e: 0x820,
				0x1f: 0x8000000,
				0x80000010: 0x20000,
				0x80000011: 0x800,
				0x80000012: 0x8020020,
				0x80000013: 0x20820,
				0x80000014: 0x20,
				0x80000015: 0x8020000,
				0x80000016: 0x8000000,
				0x80000017: 0x8000820,
				0x80000018: 0x8020820,
				0x80000019: 0x8000020,
				0x8000001a: 0x8000800,
				0x8000001b: 0x0,
				0x8000001c: 0x20800,
				0x8000001d: 0x820,
				0x8000001e: 0x20020,
				0x8000001f: 0x8020800
			}
		];

		// Masks that select the SBOX input
		var SBOX_MASK = [
			0xf8000001, 0x1f800000, 0x01f80000, 0x001f8000,
			0x0001f800, 0x00001f80, 0x000001f8, 0x8000001f
		];

		/**
		 * DES block cipher algorithm.
		 */
		var DES = C_algo.DES = BlockCipher.extend({
			_doReset: function() {
				// Shortcuts
				var key = this._key;
				var keyWords = key.words;

				// Select 56 bits according to PC1
				var keyBits = [];
				for (var i = 0; i < 56; i++) {
					var keyBitPos = PC1[i] - 1;
					keyBits[i] = (keyWords[keyBitPos >>> 5] >>> (31 - keyBitPos % 32)) & 1;
				}

				// Assemble 16 subkeys
				var subKeys = this._subKeys = [];
				for (var nSubKey = 0; nSubKey < 16; nSubKey++) {
					// Create subkey
					var subKey = subKeys[nSubKey] = [];

					// Shortcut
					var bitShift = BIT_SHIFTS[nSubKey];

					// Select 48 bits according to PC2
					for (var i = 0; i < 24; i++) {
						// Select from the left 28 key bits
						subKey[(i / 6) | 0] |= keyBits[((PC2[i] - 1) + bitShift) % 28] << (31 - i % 6);

						// Select from the right 28 key bits
						subKey[4 + ((i / 6) | 0)] |= keyBits[28 + (((PC2[i + 24] - 1) + bitShift) % 28)] << (31 - i % 6);
					}

					// Since each subkey is applied to an expanded 32-bit input,
					// the subkey can be broken into 8 values scaled to 32-bits,
					// which allows the key to be used without expansion
					subKey[0] = (subKey[0] << 1) | (subKey[0] >>> 31);
					for (var i = 1; i < 7; i++) {
						subKey[i] = subKey[i] >>> ((i - 1) * 4 + 3);
					}
					subKey[7] = (subKey[7] << 5) | (subKey[7] >>> 27);
				}

				// Compute inverse subkeys
				var invSubKeys = this._invSubKeys = [];
				for (var i = 0; i < 16; i++) {
					invSubKeys[i] = subKeys[15 - i];
				}
			},

			encryptBlock: function(M, offset) {
				this._doCryptBlock(M, offset, this._subKeys);
			},

			decryptBlock: function(M, offset) {
				this._doCryptBlock(M, offset, this._invSubKeys);
			},

			_doCryptBlock: function(M, offset, subKeys) {
				// Get input
				this._lBlock = M[offset];
				this._rBlock = M[offset + 1];

				// Initial permutation
				exchangeLR.call(this, 4, 0x0f0f0f0f);
				exchangeLR.call(this, 16, 0x0000ffff);
				exchangeRL.call(this, 2, 0x33333333);
				exchangeRL.call(this, 8, 0x00ff00ff);
				exchangeLR.call(this, 1, 0x55555555);

				// Rounds
				for (var round = 0; round < 16; round++) {
					// Shortcuts
					var subKey = subKeys[round];
					var lBlock = this._lBlock;
					var rBlock = this._rBlock;

					// Feistel function
					var f = 0;
					for (var i = 0; i < 8; i++) {
						f |= SBOX_P[i][((rBlock ^ subKey[i]) & SBOX_MASK[i]) >>> 0];
					}
					this._lBlock = rBlock;
					this._rBlock = lBlock ^ f;
				}

				// Undo swap from last round
				var t = this._lBlock;
				this._lBlock = this._rBlock;
				this._rBlock = t;

				// Final permutation
				exchangeLR.call(this, 1, 0x55555555);
				exchangeRL.call(this, 8, 0x00ff00ff);
				exchangeRL.call(this, 2, 0x33333333);
				exchangeLR.call(this, 16, 0x0000ffff);
				exchangeLR.call(this, 4, 0x0f0f0f0f);

				// Set output
				M[offset] = this._lBlock;
				M[offset + 1] = this._rBlock;
			},

			keySize: 64 / 32,

			ivSize: 64 / 32,

			blockSize: 64 / 32
		});

		// Swap bits across the left and right words
		function exchangeLR(offset, mask) {
			var t = ((this._lBlock >>> offset) ^ this._rBlock) & mask;
			this._rBlock ^= t;
			this._lBlock ^= t << offset;
		}

		function exchangeRL(offset, mask) {
			var t = ((this._rBlock >>> offset) ^ this._lBlock) & mask;
			this._lBlock ^= t;
			this._rBlock ^= t << offset;
		}

		/**
		 * Shortcut functions to the cipher's object interface.
		 *
		 * @example
		 *
		 *     var ciphertext = CryptoJS.DES.encrypt(message, key, cfg);
		 *     var plaintext  = CryptoJS.DES.decrypt(ciphertext, key, cfg);
		 */
		C.DES = BlockCipher._createHelper(DES);

		/**
		 * Triple-DES block cipher algorithm.
		 */
		var TripleDES = C_algo.TripleDES = BlockCipher.extend({
			_doReset: function() {
				// Shortcuts
				var key = this._key;
				var keyWords = key.words;

				// Create DES instances
				this._des1 = DES.createEncryptor(WordArray.create(keyWords.slice(0, 2)));
				this._des2 = DES.createEncryptor(WordArray.create(keyWords.slice(2, 4)));
				this._des3 = DES.createEncryptor(WordArray.create(keyWords.slice(4, 6)));
			},

			encryptBlock: function(M, offset) {
				this._des1.encryptBlock(M, offset);
				this._des2.decryptBlock(M, offset);
				this._des3.encryptBlock(M, offset);
			},

			decryptBlock: function(M, offset) {
				this._des3.decryptBlock(M, offset);
				this._des2.encryptBlock(M, offset);
				this._des1.decryptBlock(M, offset);
			},

			keySize: 192 / 32,

			ivSize: 64 / 32,

			blockSize: 64 / 32
		});

		/**
		 * Shortcut functions to the cipher's object interface.
		 *
		 * @example
		 *
		 *     var ciphertext = CryptoJS.TripleDES.encrypt(message, key, cfg);
		 *     var plaintext  = CryptoJS.TripleDES.decrypt(ciphertext, key, cfg);
		 */
		C.TripleDES = BlockCipher._createHelper(TripleDES);
	}());

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	(function() {
		// Shortcuts
		var C = CryptoJS;
		var C_lib = C.lib;
		var WordArray = C_lib.WordArray;
		var Hasher = C_lib.Hasher;
		var C_algo = C.algo;

		// Reusable object
		var W = [];

		/**
		 * SHA-1 hash algorithm.
		 */
		var SHA1 = C_algo.SHA1 = Hasher.extend({
			_doReset: function() {
				this._hash = new WordArray.init([
					0x67452301, 0xefcdab89,
					0x98badcfe, 0x10325476,
					0xc3d2e1f0
				]);
			},

			_doProcessBlock: function(M, offset) {
				// Shortcut
				var H = this._hash.words;

				// Working variables
				var a = H[0];
				var b = H[1];
				var c = H[2];
				var d = H[3];
				var e = H[4];

				// Computation
				for (var i = 0; i < 80; i++) {
					if (i < 16) {
						W[i] = M[offset + i] | 0;
					} else {
						var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
						W[i] = (n << 1) | (n >>> 31);
					}

					var t = ((a << 5) | (a >>> 27)) + e + W[i];
					if (i < 20) {
						t += ((b & c) | (~b & d)) + 0x5a827999;
					} else if (i < 40) {
						t += (b ^ c ^ d) + 0x6ed9eba1;
					} else if (i < 60) {
						t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
					} else /* if (i < 80) */ {
						t += (b ^ c ^ d) - 0x359d3e2a;
					}

					e = d;
					d = c;
					c = (b << 30) | (b >>> 2);
					b = a;
					a = t;
				}

				// Intermediate hash value
				H[0] = (H[0] + a) | 0;
				H[1] = (H[1] + b) | 0;
				H[2] = (H[2] + c) | 0;
				H[3] = (H[3] + d) | 0;
				H[4] = (H[4] + e) | 0;
			},

			_doFinalize: function() {
				// Shortcuts
				var data = this._data;
				var dataWords = data.words;

				var nBitsTotal = this._nDataBytes * 8;
				var nBitsLeft = data.sigBytes * 8;

				// Add padding
				dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
				dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
				dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
				data.sigBytes = dataWords.length * 4;

				// Hash final blocks
				this._process();

				// Return final computed hash
				return this._hash;
			},

			clone: function() {
				var clone = Hasher.clone.call(this);
				clone._hash = this._hash.clone();

				return clone;
			}
		});

		/**
		 * Shortcut function to the hasher's object interface.
		 *
		 * @param {WordArray|string} message The message to hash.
		 *
		 * @return {WordArray} The hash.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     var hash = CryptoJS.SHA1('message');
		 *     var hash = CryptoJS.SHA1(wordArray);
		 */
		C.SHA1 = Hasher._createHelper(SHA1);

		/**
		 * Shortcut function to the HMAC's object interface.
		 *
		 * @param {WordArray|string} message The message to hash.
		 * @param {WordArray|string} key The secret key.
		 *
		 * @return {WordArray} The HMAC.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     var hmac = CryptoJS.HmacSHA1(message, key);
		 */
		C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
	}());

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	(function(Math) {
		// Shortcuts
		var C = CryptoJS;
		var C_lib = C.lib;
		var WordArray = C_lib.WordArray;
		var Hasher = C_lib.Hasher;
		var C_algo = C.algo;

		// Initialization and round constants tables
		var H = [];
		var K = [];

		// Compute constants
		(function() {
			function isPrime(n) {
				var sqrtN = Math.sqrt(n);
				for (var factor = 2; factor <= sqrtN; factor++) {
					if (!(n % factor)) {
						return false;
					}
				}

				return true;
			}

			function getFractionalBits(n) {
				return ((n - (n | 0)) * 0x100000000) | 0;
			}

			var n = 2;
			var nPrime = 0;
			while (nPrime < 64) {
				if (isPrime(n)) {
					if (nPrime < 8) {
						H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
					}
					K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

					nPrime++;
				}

				n++;
			}
		}());

		// Reusable object
		var W = [];

		/**
		 * SHA-256 hash algorithm.
		 */
		var SHA256 = C_algo.SHA256 = Hasher.extend({
			_doReset: function() {
				this._hash = new WordArray.init(H.slice(0));
			},

			_doProcessBlock: function(M, offset) {
				// Shortcut
				var H = this._hash.words;

				// Working variables
				var a = H[0];
				var b = H[1];
				var c = H[2];
				var d = H[3];
				var e = H[4];
				var f = H[5];
				var g = H[6];
				var h = H[7];

				// Computation
				for (var i = 0; i < 64; i++) {
					if (i < 16) {
						W[i] = M[offset + i] | 0;
					} else {
						var gamma0x = W[i - 15];
						var gamma0 = ((gamma0x << 25) | (gamma0x >>> 7)) ^
							((gamma0x << 14) | (gamma0x >>> 18)) ^
							(gamma0x >>> 3);

						var gamma1x = W[i - 2];
						var gamma1 = ((gamma1x << 15) | (gamma1x >>> 17)) ^
							((gamma1x << 13) | (gamma1x >>> 19)) ^
							(gamma1x >>> 10);

						W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
					}

					var ch = (e & f) ^ (~e & g);
					var maj = (a & b) ^ (a & c) ^ (b & c);

					var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
					var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7) | (e >>> 25));

					var t1 = h + sigma1 + ch + K[i] + W[i];
					var t2 = sigma0 + maj;

					h = g;
					g = f;
					f = e;
					e = (d + t1) | 0;
					d = c;
					c = b;
					b = a;
					a = (t1 + t2) | 0;
				}

				// Intermediate hash value
				H[0] = (H[0] + a) | 0;
				H[1] = (H[1] + b) | 0;
				H[2] = (H[2] + c) | 0;
				H[3] = (H[3] + d) | 0;
				H[4] = (H[4] + e) | 0;
				H[5] = (H[5] + f) | 0;
				H[6] = (H[6] + g) | 0;
				H[7] = (H[7] + h) | 0;
			},

			_doFinalize: function() {
				// Shortcuts
				var data = this._data;
				var dataWords = data.words;

				var nBitsTotal = this._nDataBytes * 8;
				var nBitsLeft = data.sigBytes * 8;

				// Add padding
				dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
				dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
				dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
				data.sigBytes = dataWords.length * 4;

				// Hash final blocks
				this._process();

				// Return final computed hash
				return this._hash;
			},

			clone: function() {
				var clone = Hasher.clone.call(this);
				clone._hash = this._hash.clone();

				return clone;
			}
		});

		/**
		 * Shortcut function to the hasher's object interface.
		 *
		 * @param {WordArray|string} message The message to hash.
		 *
		 * @return {WordArray} The hash.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     var hash = CryptoJS.SHA256('message');
		 *     var hash = CryptoJS.SHA256(wordArray);
		 */
		C.SHA256 = Hasher._createHelper(SHA256);

		/**
		 * Shortcut function to the HMAC's object interface.
		 *
		 * @param {WordArray|string} message The message to hash.
		 * @param {WordArray|string} key The secret key.
		 *
		 * @return {WordArray} The HMAC.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     var hmac = CryptoJS.HmacSHA256(message, key);
		 */
		C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
	}(Math));

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	(function() {
		// Shortcuts
		var C = CryptoJS;
		var C_lib = C.lib;
		var WordArray = C_lib.WordArray;
		var C_algo = C.algo;
		var SHA256 = C_algo.SHA256;

		/**
		 * SHA-224 hash algorithm.
		 */
		var SHA224 = C_algo.SHA224 = SHA256.extend({
			_doReset: function() {
				this._hash = new WordArray.init([
					0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
					0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
				]);
			},

			_doFinalize: function() {
				var hash = SHA256._doFinalize.call(this);

				hash.sigBytes -= 4;

				return hash;
			}
		});

		/**
		 * Shortcut function to the hasher's object interface.
		 *
		 * @param {WordArray|string} message The message to hash.
		 *
		 * @return {WordArray} The hash.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     var hash = CryptoJS.SHA224('message');
		 *     var hash = CryptoJS.SHA224(wordArray);
		 */
		C.SHA224 = SHA256._createHelper(SHA224);

		/**
		 * Shortcut function to the HMAC's object interface.
		 *
		 * @param {WordArray|string} message The message to hash.
		 * @param {WordArray|string} key The secret key.
		 *
		 * @return {WordArray} The HMAC.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     var hmac = CryptoJS.HmacSHA224(message, key);
		 */
		C.HmacSHA224 = SHA256._createHmacHelper(SHA224);
	}());

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	(function() {
		// Shortcuts
		var C = CryptoJS;
		var C_lib = C.lib;
		var Hasher = C_lib.Hasher;
		var C_x64 = C.x64;
		var X64Word = C_x64.Word;
		var X64WordArray = C_x64.WordArray;
		var C_algo = C.algo;

		function X64Word_create() {
			return X64Word.create.apply(X64Word, arguments);
		}

		// Constants
		var K = [
			X64Word_create(0x428a2f98, 0xd728ae22), X64Word_create(0x71374491, 0x23ef65cd),
			X64Word_create(0xb5c0fbcf, 0xec4d3b2f), X64Word_create(0xe9b5dba5, 0x8189dbbc),
			X64Word_create(0x3956c25b, 0xf348b538), X64Word_create(0x59f111f1, 0xb605d019),
			X64Word_create(0x923f82a4, 0xaf194f9b), X64Word_create(0xab1c5ed5, 0xda6d8118),
			X64Word_create(0xd807aa98, 0xa3030242), X64Word_create(0x12835b01, 0x45706fbe),
			X64Word_create(0x243185be, 0x4ee4b28c), X64Word_create(0x550c7dc3, 0xd5ffb4e2),
			X64Word_create(0x72be5d74, 0xf27b896f), X64Word_create(0x80deb1fe, 0x3b1696b1),
			X64Word_create(0x9bdc06a7, 0x25c71235), X64Word_create(0xc19bf174, 0xcf692694),
			X64Word_create(0xe49b69c1, 0x9ef14ad2), X64Word_create(0xefbe4786, 0x384f25e3),
			X64Word_create(0x0fc19dc6, 0x8b8cd5b5), X64Word_create(0x240ca1cc, 0x77ac9c65),
			X64Word_create(0x2de92c6f, 0x592b0275), X64Word_create(0x4a7484aa, 0x6ea6e483),
			X64Word_create(0x5cb0a9dc, 0xbd41fbd4), X64Word_create(0x76f988da, 0x831153b5),
			X64Word_create(0x983e5152, 0xee66dfab), X64Word_create(0xa831c66d, 0x2db43210),
			X64Word_create(0xb00327c8, 0x98fb213f), X64Word_create(0xbf597fc7, 0xbeef0ee4),
			X64Word_create(0xc6e00bf3, 0x3da88fc2), X64Word_create(0xd5a79147, 0x930aa725),
			X64Word_create(0x06ca6351, 0xe003826f), X64Word_create(0x14292967, 0x0a0e6e70),
			X64Word_create(0x27b70a85, 0x46d22ffc), X64Word_create(0x2e1b2138, 0x5c26c926),
			X64Word_create(0x4d2c6dfc, 0x5ac42aed), X64Word_create(0x53380d13, 0x9d95b3df),
			X64Word_create(0x650a7354, 0x8baf63de), X64Word_create(0x766a0abb, 0x3c77b2a8),
			X64Word_create(0x81c2c92e, 0x47edaee6), X64Word_create(0x92722c85, 0x1482353b),
			X64Word_create(0xa2bfe8a1, 0x4cf10364), X64Word_create(0xa81a664b, 0xbc423001),
			X64Word_create(0xc24b8b70, 0xd0f89791), X64Word_create(0xc76c51a3, 0x0654be30),
			X64Word_create(0xd192e819, 0xd6ef5218), X64Word_create(0xd6990624, 0x5565a910),
			X64Word_create(0xf40e3585, 0x5771202a), X64Word_create(0x106aa070, 0x32bbd1b8),
			X64Word_create(0x19a4c116, 0xb8d2d0c8), X64Word_create(0x1e376c08, 0x5141ab53),
			X64Word_create(0x2748774c, 0xdf8eeb99), X64Word_create(0x34b0bcb5, 0xe19b48a8),
			X64Word_create(0x391c0cb3, 0xc5c95a63), X64Word_create(0x4ed8aa4a, 0xe3418acb),
			X64Word_create(0x5b9cca4f, 0x7763e373), X64Word_create(0x682e6ff3, 0xd6b2b8a3),
			X64Word_create(0x748f82ee, 0x5defb2fc), X64Word_create(0x78a5636f, 0x43172f60),
			X64Word_create(0x84c87814, 0xa1f0ab72), X64Word_create(0x8cc70208, 0x1a6439ec),
			X64Word_create(0x90befffa, 0x23631e28), X64Word_create(0xa4506ceb, 0xde82bde9),
			X64Word_create(0xbef9a3f7, 0xb2c67915), X64Word_create(0xc67178f2, 0xe372532b),
			X64Word_create(0xca273ece, 0xea26619c), X64Word_create(0xd186b8c7, 0x21c0c207),
			X64Word_create(0xeada7dd6, 0xcde0eb1e), X64Word_create(0xf57d4f7f, 0xee6ed178),
			X64Word_create(0x06f067aa, 0x72176fba), X64Word_create(0x0a637dc5, 0xa2c898a6),
			X64Word_create(0x113f9804, 0xbef90dae), X64Word_create(0x1b710b35, 0x131c471b),
			X64Word_create(0x28db77f5, 0x23047d84), X64Word_create(0x32caab7b, 0x40c72493),
			X64Word_create(0x3c9ebe0a, 0x15c9bebc), X64Word_create(0x431d67c4, 0x9c100d4c),
			X64Word_create(0x4cc5d4be, 0xcb3e42b6), X64Word_create(0x597f299c, 0xfc657e2a),
			X64Word_create(0x5fcb6fab, 0x3ad6faec), X64Word_create(0x6c44198c, 0x4a475817)
		];

		// Reusable objects
		var W = [];
		(function() {
			for (var i = 0; i < 80; i++) {
				W[i] = X64Word_create();
			}
		}());

		/**
		 * SHA-512 hash algorithm.
		 */
		var SHA512 = C_algo.SHA512 = Hasher.extend({
			_doReset: function() {
				this._hash = new X64WordArray.init([
					new X64Word.init(0x6a09e667, 0xf3bcc908), new X64Word.init(0xbb67ae85, 0x84caa73b),
					new X64Word.init(0x3c6ef372, 0xfe94f82b), new X64Word.init(0xa54ff53a, 0x5f1d36f1),
					new X64Word.init(0x510e527f, 0xade682d1), new X64Word.init(0x9b05688c, 0x2b3e6c1f),
					new X64Word.init(0x1f83d9ab, 0xfb41bd6b), new X64Word.init(0x5be0cd19, 0x137e2179)
				]);
			},

			_doProcessBlock: function(M, offset) {
				// Shortcuts
				var H = this._hash.words;

				var H0 = H[0];
				var H1 = H[1];
				var H2 = H[2];
				var H3 = H[3];
				var H4 = H[4];
				var H5 = H[5];
				var H6 = H[6];
				var H7 = H[7];

				var H0h = H0.high;
				var H0l = H0.low;
				var H1h = H1.high;
				var H1l = H1.low;
				var H2h = H2.high;
				var H2l = H2.low;
				var H3h = H3.high;
				var H3l = H3.low;
				var H4h = H4.high;
				var H4l = H4.low;
				var H5h = H5.high;
				var H5l = H5.low;
				var H6h = H6.high;
				var H6l = H6.low;
				var H7h = H7.high;
				var H7l = H7.low;

				// Working variables
				var ah = H0h;
				var al = H0l;
				var bh = H1h;
				var bl = H1l;
				var ch = H2h;
				var cl = H2l;
				var dh = H3h;
				var dl = H3l;
				var eh = H4h;
				var el = H4l;
				var fh = H5h;
				var fl = H5l;
				var gh = H6h;
				var gl = H6l;
				var hh = H7h;
				var hl = H7l;

				// Rounds
				for (var i = 0; i < 80; i++) {
					// Shortcut
					var Wi = W[i];

					// Extend message
					if (i < 16) {
						var Wih = Wi.high = M[offset + i * 2] | 0;
						var Wil = Wi.low = M[offset + i * 2 + 1] | 0;
					} else {
						// Gamma0
						var gamma0x = W[i - 15];
						var gamma0xh = gamma0x.high;
						var gamma0xl = gamma0x.low;
						var gamma0h = ((gamma0xh >>> 1) | (gamma0xl << 31)) ^ ((gamma0xh >>> 8) | (gamma0xl << 24)) ^ (gamma0xh >>>
							7);
						var gamma0l = ((gamma0xl >>> 1) | (gamma0xh << 31)) ^ ((gamma0xl >>> 8) | (gamma0xh << 24)) ^ ((gamma0xl >>>
							7) | (gamma0xh << 25));

						// Gamma1
						var gamma1x = W[i - 2];
						var gamma1xh = gamma1x.high;
						var gamma1xl = gamma1x.low;
						var gamma1h = ((gamma1xh >>> 19) | (gamma1xl << 13)) ^ ((gamma1xh << 3) | (gamma1xl >>> 29)) ^ (gamma1xh >>>
							6);
						var gamma1l = ((gamma1xl >>> 19) | (gamma1xh << 13)) ^ ((gamma1xl << 3) | (gamma1xh >>> 29)) ^ ((gamma1xl >>>
							6) | (gamma1xh << 26));

						// W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
						var Wi7 = W[i - 7];
						var Wi7h = Wi7.high;
						var Wi7l = Wi7.low;

						var Wi16 = W[i - 16];
						var Wi16h = Wi16.high;
						var Wi16l = Wi16.low;

						var Wil = gamma0l + Wi7l;
						var Wih = gamma0h + Wi7h + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0);
						var Wil = Wil + gamma1l;
						var Wih = Wih + gamma1h + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0);
						var Wil = Wil + Wi16l;
						var Wih = Wih + Wi16h + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0);

						Wi.high = Wih;
						Wi.low = Wil;
					}

					var chh = (eh & fh) ^ (~eh & gh);
					var chl = (el & fl) ^ (~el & gl);
					var majh = (ah & bh) ^ (ah & ch) ^ (bh & ch);
					var majl = (al & bl) ^ (al & cl) ^ (bl & cl);

					var sigma0h = ((ah >>> 28) | (al << 4)) ^ ((ah << 30) | (al >>> 2)) ^ ((ah << 25) | (al >>> 7));
					var sigma0l = ((al >>> 28) | (ah << 4)) ^ ((al << 30) | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7));
					var sigma1h = ((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9));
					var sigma1l = ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9));

					// t1 = h + sigma1 + ch + K[i] + W[i]
					var Ki = K[i];
					var Kih = Ki.high;
					var Kil = Ki.low;

					var t1l = hl + sigma1l;
					var t1h = hh + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0);
					var t1l = t1l + chl;
					var t1h = t1h + chh + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0);
					var t1l = t1l + Kil;
					var t1h = t1h + Kih + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0);
					var t1l = t1l + Wil;
					var t1h = t1h + Wih + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0);

					// t2 = sigma0 + maj
					var t2l = sigma0l + majl;
					var t2h = sigma0h + majh + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0);

					// Update working variables
					hh = gh;
					hl = gl;
					gh = fh;
					gl = fl;
					fh = eh;
					fl = el;
					el = (dl + t1l) | 0;
					eh = (dh + t1h + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0;
					dh = ch;
					dl = cl;
					ch = bh;
					cl = bl;
					bh = ah;
					bl = al;
					al = (t1l + t2l) | 0;
					ah = (t1h + t2h + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0;
				}

				// Intermediate hash value
				H0l = H0.low = (H0l + al);
				H0.high = (H0h + ah + ((H0l >>> 0) < (al >>> 0) ? 1 : 0));
				H1l = H1.low = (H1l + bl);
				H1.high = (H1h + bh + ((H1l >>> 0) < (bl >>> 0) ? 1 : 0));
				H2l = H2.low = (H2l + cl);
				H2.high = (H2h + ch + ((H2l >>> 0) < (cl >>> 0) ? 1 : 0));
				H3l = H3.low = (H3l + dl);
				H3.high = (H3h + dh + ((H3l >>> 0) < (dl >>> 0) ? 1 : 0));
				H4l = H4.low = (H4l + el);
				H4.high = (H4h + eh + ((H4l >>> 0) < (el >>> 0) ? 1 : 0));
				H5l = H5.low = (H5l + fl);
				H5.high = (H5h + fh + ((H5l >>> 0) < (fl >>> 0) ? 1 : 0));
				H6l = H6.low = (H6l + gl);
				H6.high = (H6h + gh + ((H6l >>> 0) < (gl >>> 0) ? 1 : 0));
				H7l = H7.low = (H7l + hl);
				H7.high = (H7h + hh + ((H7l >>> 0) < (hl >>> 0) ? 1 : 0));
			},

			_doFinalize: function() {
				// Shortcuts
				var data = this._data;
				var dataWords = data.words;

				var nBitsTotal = this._nDataBytes * 8;
				var nBitsLeft = data.sigBytes * 8;

				// Add padding
				dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
				dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 30] = Math.floor(nBitsTotal / 0x100000000);
				dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 31] = nBitsTotal;
				data.sigBytes = dataWords.length * 4;

				// Hash final blocks
				this._process();

				// Convert hash to 32-bit word array before returning
				var hash = this._hash.toX32();

				// Return final computed hash
				return hash;
			},

			clone: function() {
				var clone = Hasher.clone.call(this);
				clone._hash = this._hash.clone();

				return clone;
			},

			blockSize: 1024 / 32
		});

		/**
		 * Shortcut function to the hasher's object interface.
		 *
		 * @param {WordArray|string} message The message to hash.
		 *
		 * @return {WordArray} The hash.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     var hash = CryptoJS.SHA512('message');
		 *     var hash = CryptoJS.SHA512(wordArray);
		 */
		C.SHA512 = Hasher._createHelper(SHA512);

		/**
		 * Shortcut function to the HMAC's object interface.
		 *
		 * @param {WordArray|string} message The message to hash.
		 * @param {WordArray|string} key The secret key.
		 *
		 * @return {WordArray} The HMAC.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     var hmac = CryptoJS.HmacSHA512(message, key);
		 */
		C.HmacSHA512 = Hasher._createHmacHelper(SHA512);
	}());

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	(function() {
		// Shortcuts
		var C = CryptoJS;
		var C_x64 = C.x64;
		var X64Word = C_x64.Word;
		var X64WordArray = C_x64.WordArray;
		var C_algo = C.algo;
		var SHA512 = C_algo.SHA512;

		/**
		 * SHA-384 hash algorithm.
		 */
		var SHA384 = C_algo.SHA384 = SHA512.extend({
			_doReset: function() {
				this._hash = new X64WordArray.init([
					new X64Word.init(0xcbbb9d5d, 0xc1059ed8), new X64Word.init(0x629a292a, 0x367cd507),
					new X64Word.init(0x9159015a, 0x3070dd17), new X64Word.init(0x152fecd8, 0xf70e5939),
					new X64Word.init(0x67332667, 0xffc00b31), new X64Word.init(0x8eb44a87, 0x68581511),
					new X64Word.init(0xdb0c2e0d, 0x64f98fa7), new X64Word.init(0x47b5481d, 0xbefa4fa4)
				]);
			},

			_doFinalize: function() {
				var hash = SHA512._doFinalize.call(this);

				hash.sigBytes -= 16;

				return hash;
			}
		});

		/**
		 * Shortcut function to the hasher's object interface.
		 *
		 * @param {WordArray|string} message The message to hash.
		 *
		 * @return {WordArray} The hash.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     var hash = CryptoJS.SHA384('message');
		 *     var hash = CryptoJS.SHA384(wordArray);
		 */
		C.SHA384 = SHA512._createHelper(SHA384);

		/**
		 * Shortcut function to the HMAC's object interface.
		 *
		 * @param {WordArray|string} message The message to hash.
		 * @param {WordArray|string} key The secret key.
		 *
		 * @return {WordArray} The HMAC.
		 *
		 * @static
		 *
		 * @example
		 *
		 *     var hmac = CryptoJS.HmacSHA384(message, key);
		 */
		C.HmacSHA384 = SHA512._createHmacHelper(SHA384);
	}());

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	(function() {
		// Shortcuts
		var C = CryptoJS;
		var C_lib = C.lib;
		var BlockCipher = C_lib.BlockCipher;
		var C_algo = C.algo;

		// Lookup tables
		var SBOX = [];
		var INV_SBOX = [];
		var SUB_MIX_0 = [];
		var SUB_MIX_1 = [];
		var SUB_MIX_2 = [];
		var SUB_MIX_3 = [];
		var INV_SUB_MIX_0 = [];
		var INV_SUB_MIX_1 = [];
		var INV_SUB_MIX_2 = [];
		var INV_SUB_MIX_3 = [];

		// Compute lookup tables
		(function() {
			// Compute double table
			var d = [];
			for (var i = 0; i < 256; i++) {
				if (i < 128) {
					d[i] = i << 1;
				} else {
					d[i] = (i << 1) ^ 0x11b;
				}
			}

			// Walk GF(2^8)
			var x = 0;
			var xi = 0;
			for (var i = 0; i < 256; i++) {
				// Compute sbox
				var sx = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4);
				sx = (sx >>> 8) ^ (sx & 0xff) ^ 0x63;
				SBOX[x] = sx;
				INV_SBOX[sx] = x;

				// Compute multiplication
				var x2 = d[x];
				var x4 = d[x2];
				var x8 = d[x4];

				// Compute sub bytes, mix columns tables
				var t = (d[sx] * 0x101) ^ (sx * 0x1010100);
				SUB_MIX_0[x] = (t << 24) | (t >>> 8);
				SUB_MIX_1[x] = (t << 16) | (t >>> 16);
				SUB_MIX_2[x] = (t << 8) | (t >>> 24);
				SUB_MIX_3[x] = t;

				// Compute inv sub bytes, inv mix columns tables
				var t = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100);
				INV_SUB_MIX_0[sx] = (t << 24) | (t >>> 8);
				INV_SUB_MIX_1[sx] = (t << 16) | (t >>> 16);
				INV_SUB_MIX_2[sx] = (t << 8) | (t >>> 24);
				INV_SUB_MIX_3[sx] = t;

				// Compute next counter
				if (!x) {
					x = xi = 1;
				} else {
					x = x2 ^ d[d[d[x8 ^ x2]]];
					xi ^= d[d[xi]];
				}
			}
		}());

		// Precomputed Rcon lookup
		var RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

		/**
		 * AES block cipher algorithm.
		 */
		var AES = C_algo.AES = BlockCipher.extend({
			_doReset: function() {
				// Shortcuts
				var key = this._key;
				var keyWords = key.words;
				var keySize = key.sigBytes / 4;

				// Compute number of rounds
				var nRounds = this._nRounds = keySize + 6

				// Compute number of key schedule rows
				var ksRows = (nRounds + 1) * 4;

				// Compute key schedule
				var keySchedule = this._keySchedule = [];
				for (var ksRow = 0; ksRow < ksRows; ksRow++) {
					if (ksRow < keySize) {
						keySchedule[ksRow] = keyWords[ksRow];
					} else {
						var t = keySchedule[ksRow - 1];

						if (!(ksRow % keySize)) {
							// Rot word
							t = (t << 8) | (t >>> 24);

							// Sub word
							t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];

							// Mix Rcon
							t ^= RCON[(ksRow / keySize) | 0] << 24;
						} else if (keySize > 6 && ksRow % keySize == 4) {
							// Sub word
							t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];
						}

						keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
					}
				}

				// Compute inv key schedule
				var invKeySchedule = this._invKeySchedule = [];
				for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
					var ksRow = ksRows - invKsRow;

					if (invKsRow % 4) {
						var t = keySchedule[ksRow];
					} else {
						var t = keySchedule[ksRow - 4];
					}

					if (invKsRow < 4 || ksRow <= 4) {
						invKeySchedule[invKsRow] = t;
					} else {
						invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[(t >>> 16) & 0xff]] ^
							INV_SUB_MIX_2[SBOX[(t >>> 8) & 0xff]] ^ INV_SUB_MIX_3[SBOX[t & 0xff]];
					}
				}
			},

			encryptBlock: function(M, offset) {
				this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
			},

			decryptBlock: function(M, offset) {
				// Swap 2nd and 4th rows
				var t = M[offset + 1];
				M[offset + 1] = M[offset + 3];
				M[offset + 3] = t;

				this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3,
					INV_SBOX);

				// Inv swap 2nd and 4th rows
				var t = M[offset + 1];
				M[offset + 1] = M[offset + 3];
				M[offset + 3] = t;
			},

			_doCryptBlock: function(M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
				// Shortcut
				var nRounds = this._nRounds;

				// Get input, add round key
				var s0 = M[offset] ^ keySchedule[0];
				var s1 = M[offset + 1] ^ keySchedule[1];
				var s2 = M[offset + 2] ^ keySchedule[2];
				var s3 = M[offset + 3] ^ keySchedule[3];

				// Key schedule row counter
				var ksRow = 4;

				// Rounds
				for (var round = 1; round < nRounds; round++) {
					// Shift rows, sub bytes, mix columns, add round key
					var t0 = SUB_MIX_0[s0 >>> 24] ^ SUB_MIX_1[(s1 >>> 16) & 0xff] ^ SUB_MIX_2[(s2 >>> 8) & 0xff] ^ SUB_MIX_3[s3 &
						0xff] ^ keySchedule[ksRow++];
					var t1 = SUB_MIX_0[s1 >>> 24] ^ SUB_MIX_1[(s2 >>> 16) & 0xff] ^ SUB_MIX_2[(s3 >>> 8) & 0xff] ^ SUB_MIX_3[s0 &
						0xff] ^ keySchedule[ksRow++];
					var t2 = SUB_MIX_0[s2 >>> 24] ^ SUB_MIX_1[(s3 >>> 16) & 0xff] ^ SUB_MIX_2[(s0 >>> 8) & 0xff] ^ SUB_MIX_3[s1 &
						0xff] ^ keySchedule[ksRow++];
					var t3 = SUB_MIX_0[s3 >>> 24] ^ SUB_MIX_1[(s0 >>> 16) & 0xff] ^ SUB_MIX_2[(s1 >>> 8) & 0xff] ^ SUB_MIX_3[s2 &
						0xff] ^ keySchedule[ksRow++];

					// Update state
					s0 = t0;
					s1 = t1;
					s2 = t2;
					s3 = t3;
				}

				// Shift rows, sub bytes, add round key
				var t0 = ((SBOX[s0 >>> 24] << 24) | (SBOX[(s1 >>> 16) & 0xff] << 16) | (SBOX[(s2 >>> 8) & 0xff] << 8) | SBOX[s3 &
					0xff]) ^ keySchedule[ksRow++];
				var t1 = ((SBOX[s1 >>> 24] << 24) | (SBOX[(s2 >>> 16) & 0xff] << 16) | (SBOX[(s3 >>> 8) & 0xff] << 8) | SBOX[s0 &
					0xff]) ^ keySchedule[ksRow++];
				var t2 = ((SBOX[s2 >>> 24] << 24) | (SBOX[(s3 >>> 16) & 0xff] << 16) | (SBOX[(s0 >>> 8) & 0xff] << 8) | SBOX[s1 &
					0xff]) ^ keySchedule[ksRow++];
				var t3 = ((SBOX[s3 >>> 24] << 24) | (SBOX[(s0 >>> 16) & 0xff] << 16) | (SBOX[(s1 >>> 8) & 0xff] << 8) | SBOX[s2 &
					0xff]) ^ keySchedule[ksRow++];

				// Set output
				M[offset] = t0;
				M[offset + 1] = t1;
				M[offset + 2] = t2;
				M[offset + 3] = t3;
			},

			keySize: 256 / 32
		});

		/**
		 * Shortcut functions to the cipher's object interface.
		 *
		 * @example
		 *
		 *     var ciphertext = CryptoJS.AES.encrypt(message, key, cfg);
		 *     var plaintext  = CryptoJS.AES.decrypt(ciphertext, key, cfg);
		 */
		C.AES = BlockCipher._createHelper(AES);
	}());

	/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
	 */
	// Random number generator - requires a PRNG backend, e.g. prng4.js

	// For best results, put code like
	// <body onClick='rng_seed_time();' onKeyPress='rng_seed_time();'>
	// in your main HTML document.

	var rng_state;
	var rng_pool;
	var rng_pptr;

	// Mix in a 32-bit integer into the pool
	function rng_seed_int(x) {
		rng_pool[rng_pptr++] ^= x & 255;
		rng_pool[rng_pptr++] ^= (x >> 8) & 255;
		rng_pool[rng_pptr++] ^= (x >> 16) & 255;
		rng_pool[rng_pptr++] ^= (x >> 24) & 255;
		if (rng_pptr >= rng_psize) rng_pptr -= rng_psize;
	}

	// Mix in the current time (w/milliseconds) into the pool
	function rng_seed_time() {
		rng_seed_int(new Date().getTime());
	}

	// Initialize the pool with junk if needed.
	if (rng_pool == null) {
		rng_pool = new Array();
		rng_pptr = 0;
		var t;
		var crypto;
		if (crypto && crypto.getRandomValues) {
			// Use webcrypto if available
			var ua = new Uint8Array(32);
			crypto.getRandomValues(ua);
			for (t = 0; t < 32; ++t)
				rng_pool[rng_pptr++] = ua[t];
		}
		if (navigator && navigator.appName == "Netscape" && navigator.appVersion < "5" && crypto) {
			// Extract entropy (256 bits) from NS4 RNG if available
			var z = crypto.random(32);
			for (t = 0; t < z.length; ++t)
				rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
		}
		while (rng_pptr < rng_psize) { // extract some randomness from Math.random()
			t = Math.floor(65536 * Math.random());
			rng_pool[rng_pptr++] = t >>> 8;
			rng_pool[rng_pptr++] = t & 255;
		}
		rng_pptr = 0;
		rng_seed_time();
		//rng_seed_int(screenX);
		//rng_seed_int(screenY);
	}

	function rng_get_byte() {
		if (rng_state == null) {
			rng_seed_time();
			rng_state = prng_newstate();
			rng_state.init(rng_pool);
			for (rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr)
				rng_pool[rng_pptr] = 0;
			rng_pptr = 0;
			//rng_pool = null;
		}
		// TODO: allow reseeding after first request
		return rng_state.next();
	}

	function rng_get_bytes(ba) {
		var i;
		for (i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
	}

	function SecureRandom() {}

	SecureRandom.prototype.nextBytes = rng_get_bytes;

	/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
	 */
	// Depends on jsbn.js and rng.js

	// Version 1.1: support utf-8 encoding in pkcs1pad2

	// convert a (hex) string to a bignum object
	function parseBigInt(str, r) {
		return new BigInteger(str, r);
	}

	function linebrk(s, n) {
		var ret = "";
		var i = 0;
		while (i + n < s.length) {
			ret += s.substring(i, i + n) + "\n";
			i += n;
		}
		return ret + s.substring(i, s.length);
	}

	function byte2Hex(b) {
		if (b < 0x10)
			return "0" + b.toString(16);
		else
			return b.toString(16);
	}

	// PKCS#1 (type 2, random) pad input string s to n bytes, and return a bigint
	function pkcs1pad2(s, n) {
		if (n < s.length + 11) { // TODO: fix for utf-8
			alert("Message too long for RSA");
			return null;
		}
		var ba = new Array();
		var i = s.length - 1;
		while (i >= 0 && n > 0) {
			var c = s.charCodeAt(i--);
			if (c < 128) { // encode using utf-8
				ba[--n] = c;
			} else if ((c > 127) && (c < 2048)) {
				ba[--n] = (c & 63) | 128;
				ba[--n] = (c >> 6) | 192;
			} else {
				ba[--n] = (c & 63) | 128;
				ba[--n] = ((c >> 6) & 63) | 128;
				ba[--n] = (c >> 12) | 224;
			}
		}
		ba[--n] = 0;
		var rng = new SecureRandom();
		var x = new Array();
		while (n > 2) { // random non-zero pad
			x[0] = 0;
			while (x[0] == 0) rng.nextBytes(x);
			ba[--n] = x[0];
		}
		ba[--n] = 2;
		ba[--n] = 0;
		return new BigInteger(ba);
	}

	// PKCS#1 (OAEP) mask generation function
	function oaep_mgf1_arr(seed, len, hash) {
		var mask = '',
			i = 0;

		while (mask.length < len) {
			mask += hash(String.fromCharCode.apply(String, seed.concat([
				(i & 0xff000000) >> 24,
				(i & 0x00ff0000) >> 16,
				(i & 0x0000ff00) >> 8,
				i & 0x000000ff
			])));
			i += 1;
		}

		return mask;
	}

	/**
	 * PKCS#1 (OAEP) pad input string s to n bytes, and return a bigint
	 * @name oaep_pad
	 * @param s raw string of message
	 * @param n key length of RSA key
	 * @param hash JavaScript function to calculate raw hash value from raw string or algorithm name (ex. "SHA1") 
	 * @param hashLen byte length of resulted hash value (ex. 20 for SHA1)
	 * @return {BigInteger} BigInteger object of resulted PKCS#1 OAEP padded message
	 * @description
	 * This function calculates OAEP padded message from original message.<br/>
	 * NOTE: Since jsrsasign 6.2.0, 'hash' argument can accept an algorithm name such as "sha1".
	 * @example
	 * oaep_pad("aaa", 128) &rarr; big integer object // SHA-1 by default
	 * oaep_pad("aaa", 128, function(s) {...}, 20);
	 * oaep_pad("aaa", 128, "sha1");
	 */
	function oaep_pad(s, n, hash, hashLen) {
		var MD = KJUR.crypto.MessageDigest;
		var Util = KJUR.crypto.Util;
		var algName = null;

		if (!hash) hash = "sha1";

		if (typeof hash === "string") {
			algName = MD.getCanonicalAlgName(hash);
			hashLen = MD.getHashLength(algName);
			hash = function(s) {
				return hextorstr(Util.hashString(s, algName));
			};
		}

		if (s.length + 2 * hashLen + 2 > n) {
			throw "Message too long for RSA";
		}

		var PS = '',
			i;

		for (i = 0; i < n - s.length - 2 * hashLen - 2; i += 1) {
			PS += '\x00';
		}

		var DB = hash('') + PS + '\x01' + s;
		var seed = new Array(hashLen);
		new SecureRandom().nextBytes(seed);

		var dbMask = oaep_mgf1_arr(seed, DB.length, hash);
		var maskedDB = [];

		for (i = 0; i < DB.length; i += 1) {
			maskedDB[i] = DB.charCodeAt(i) ^ dbMask.charCodeAt(i);
		}

		var seedMask = oaep_mgf1_arr(maskedDB, seed.length, hash);
		var maskedSeed = [0];

		for (i = 0; i < seed.length; i += 1) {
			maskedSeed[i + 1] = seed[i] ^ seedMask.charCodeAt(i);
		}

		return new BigInteger(maskedSeed.concat(maskedDB));
	}

	// "empty" RSA key constructor
	function RSAKey() {
		this.n = null;
		this.e = 0;
		this.d = null;
		this.p = null;
		this.q = null;
		this.dmp1 = null;
		this.dmq1 = null;
		this.coeff = null;
	}

	// Set the public key fields N and e from hex strings
	function RSASetPublic(N, E) {
		this.isPublic = true;
		if (typeof N !== "string") {
			this.n = N;
			this.e = E;
		} else if (N != null && E != null && N.length > 0 && E.length > 0) {
			this.n = parseBigInt(N, 16);
			this.e = parseInt(E, 16);
		} else
			alert("Invalid RSA public key");
	}

	// Perform raw public operation on "x": return x^e (mod n)
	function RSADoPublic(x) {
		return x.modPowInt(this.e, this.n);
	}

	// Return the PKCS#1 RSA encryption of "text" as an even-length hex string
	function RSAEncrypt(text) {
		var m = pkcs1pad2(text, (this.n.bitLength() + 7) >> 3);
		if (m == null) return null;
		var c = this.doPublic(m);
		if (c == null) return null;
		var h = c.toString(16);
		if ((h.length & 1) == 0) return h;
		else return "0" + h;
	}

	// Return the PKCS#1 OAEP RSA encryption of "text" as an even-length hex string
	function RSAEncryptOAEP(text, hash, hashLen) {
		var m = oaep_pad(text, (this.n.bitLength() + 7) >> 3, hash, hashLen);
		if (m == null) return null;
		var c = this.doPublic(m);
		if (c == null) return null;
		var h = c.toString(16);
		if ((h.length & 1) == 0) return h;
		else return "0" + h;
	}

	// Return the PKCS#1 RSA encryption of "text" as a Base64-encoded string
	//function RSAEncryptB64(text) {
	//  var h = this.encrypt(text);
	//  if(h) return hex2b64(h); else return null;
	//}

	// protected
	RSAKey.prototype.doPublic = RSADoPublic;

	// public
	RSAKey.prototype.setPublic = RSASetPublic;
	RSAKey.prototype.encrypt = RSAEncrypt;
	RSAKey.prototype.encryptOAEP = RSAEncryptOAEP;
	//RSAKey.prototype.encrypt_b64 = RSAEncryptB64;

	RSAKey.prototype.type = "RSA";

	/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
	 */
	// Depends on rsa.js and jsbn2.js

	// Version 1.1: support utf-8 decoding in pkcs1unpad2

	// Undo PKCS#1 (type 2, random) padding and, if valid, return the plaintext
	function pkcs1unpad2(d, n) {
		var b = d.toByteArray();
		var i = 0;
		while (i < b.length && b[i] == 0) ++i;
		if (b.length - i != n - 1 || b[i] != 2)
			return null;
		++i;
		while (b[i] != 0)
			if (++i >= b.length) return null;
		var ret = "";
		while (++i < b.length) {
			var c = b[i] & 255;
			if (c < 128) { // utf-8 decode
				ret += String.fromCharCode(c);
			} else if ((c > 191) && (c < 224)) {
				ret += String.fromCharCode(((c & 31) << 6) | (b[i + 1] & 63));
				++i;
			} else {
				ret += String.fromCharCode(((c & 15) << 12) | ((b[i + 1] & 63) << 6) | (b[i + 2] & 63));
				i += 2;
			}
		}
		return ret;
	}

	// PKCS#1 (OAEP) mask generation function
	function oaep_mgf1_str(seed, len, hash) {
		var mask = '',
			i = 0;

		while (mask.length < len) {
			mask += hash(seed + String.fromCharCode.apply(String, [
				(i & 0xff000000) >> 24,
				(i & 0x00ff0000) >> 16,
				(i & 0x0000ff00) >> 8,
				i & 0x000000ff
			]));
			i += 1;
		}

		return mask;
	}

	/**
	 * Undo PKCS#1 (OAEP) padding and, if valid, return the plaintext
	 * @name oaep_unpad
	 * @param {BigInteger} d BigInteger object of OAEP padded message
	 * @param n byte length of RSA key (i.e. 128 when RSA 1024bit)
	 * @param hash JavaScript function to calculate raw hash value from raw string or algorithm name (ex. "SHA1") 
	 * @param hashLen byte length of resulted hash value (i.e. 20 for SHA1)
	 * @return {String} raw string of OAEP unpadded message
	 * @description
	 * This function do unpadding OAEP padded message then returns an original message.<br/>
	 * NOTE: Since jsrsasign 6.2.0, 'hash' argument can accept an algorithm name such as "sha1".
	 * @example
	 * // DEFAULT(SHA1)
	 * bi1 = oaep_pad("aaa", 128);
	 * oaep_unpad(bi1, 128) &rarr; "aaa" // SHA-1 by default
	 */
	function oaep_unpad(d, n, hash, hashLen) {
		var MD = KJUR.crypto.MessageDigest;
		var Util = KJUR.crypto.Util;
		var algName = null;

		if (!hash) hash = "sha1";

		if (typeof hash === "string") {
			algName = MD.getCanonicalAlgName(hash);
			hashLen = MD.getHashLength(algName);
			hash = function(s) {
				return hextorstr(Util.hashString(s, algName));
			};
		}

		d = d.toByteArray();

		var i;

		for (i = 0; i < d.length; i += 1) {
			d[i] &= 0xff;
		}

		while (d.length < n) {
			d.unshift(0);
		}

		d = String.fromCharCode.apply(String, d);

		if (d.length < 2 * hashLen + 2) {
			throw "Cipher too short";
		}

		var maskedSeed = d.substr(1, hashLen)
		var maskedDB = d.substr(hashLen + 1);

		var seedMask = oaep_mgf1_str(maskedDB, hashLen, hash);
		var seed = [],
			i;

		for (i = 0; i < maskedSeed.length; i += 1) {
			seed[i] = maskedSeed.charCodeAt(i) ^ seedMask.charCodeAt(i);
		}

		var dbMask = oaep_mgf1_str(String.fromCharCode.apply(String, seed),
			d.length - hashLen, hash);

		var DB = [];

		for (i = 0; i < maskedDB.length; i += 1) {
			DB[i] = maskedDB.charCodeAt(i) ^ dbMask.charCodeAt(i);
		}

		DB = String.fromCharCode.apply(String, DB);

		if (DB.substr(0, hashLen) !== hash('')) {
			throw "Hash mismatch";
		}

		DB = DB.substr(hashLen);

		var first_one = DB.indexOf('\x01');
		var last_zero = (first_one != -1) ? DB.substr(0, first_one).lastIndexOf('\x00') : -1;

		if (last_zero + 1 != first_one) {
			throw "Malformed data";
		}

		return DB.substr(first_one + 1);
	}

	// Set the private key fields N, e, and d from hex strings
	function RSASetPrivate(N, E, D) {
		this.isPrivate = true;
		if (typeof N !== "string") {
			this.n = N;
			this.e = E;
			this.d = D;
		} else if (N != null && E != null && N.length > 0 && E.length > 0) {
			this.n = parseBigInt(N, 16);
			this.e = parseInt(E, 16);
			this.d = parseBigInt(D, 16);
		} else
			alert("Invalid RSA private key");
	}

	// Set the private key fields N, e, d and CRT params from hex strings
	function RSASetPrivateEx(N, E, D, P, Q, DP, DQ, C) {
		this.isPrivate = true;
		if (N == null) throw "RSASetPrivateEx N == null";
		if (E == null) throw "RSASetPrivateEx E == null";
		if (N.length == 0) throw "RSASetPrivateEx N.length == 0";
		if (E.length == 0) throw "RSASetPrivateEx E.length == 0";

		if (N != null && E != null && N.length > 0 && E.length > 0) {
			this.n = parseBigInt(N, 16);
			this.e = parseInt(E, 16);
			this.d = parseBigInt(D, 16);
			this.p = parseBigInt(P, 16);
			this.q = parseBigInt(Q, 16);
			this.dmp1 = parseBigInt(DP, 16);
			this.dmq1 = parseBigInt(DQ, 16);
			this.coeff = parseBigInt(C, 16);
		} else {
			alert("Invalid RSA private key in RSASetPrivateEx");
		}
	}

	// Generate a new random private key B bits long, using public expt E
	function RSAGenerate(B, E) {
		var rng = new SecureRandom();
		var qs = B >> 1;
		this.e = parseInt(E, 16);
		var ee = new BigInteger(E, 16);
		for (;;) {
			for (;;) {
				this.p = new BigInteger(B - qs, 1, rng);
				if (this.p.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) == 0 && this.p.isProbablePrime(10)) break;
			}
			for (;;) {
				this.q = new BigInteger(qs, 1, rng);
				if (this.q.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) == 0 && this.q.isProbablePrime(10)) break;
			}
			if (this.p.compareTo(this.q) <= 0) {
				var t = this.p;
				this.p = this.q;
				this.q = t;
			}
			var p1 = this.p.subtract(BigInteger.ONE); // p1 = p - 1
			var q1 = this.q.subtract(BigInteger.ONE); // q1 = q - 1
			var phi = p1.multiply(q1);
			if (phi.gcd(ee).compareTo(BigInteger.ONE) == 0) {
				this.n = this.p.multiply(this.q); // this.n = p * q
				this.d = ee.modInverse(phi); // this.d = 
				this.dmp1 = this.d.mod(p1); // this.dmp1 = d mod (p - 1)
				this.dmq1 = this.d.mod(q1); // this.dmq1 = d mod (q - 1)
				this.coeff = this.q.modInverse(this.p); // this.coeff = (q ^ -1) mod p
				break;
			}
		}
		this.isPrivate = true;
	}

	// Perform raw private operation on "x": return x^d (mod n)
	function RSADoPrivate(x) {
		if (this.p == null || this.q == null)
			return x.modPow(this.d, this.n);

		// TODO: re-calculate any missing CRT params
		var xp = x.mod(this.p).modPow(this.dmp1, this.p); // xp=cp?
		var xq = x.mod(this.q).modPow(this.dmq1, this.q); // xq=cq?

		while (xp.compareTo(xq) < 0)
			xp = xp.add(this.p);
		// NOTE:
		// xp.subtract(xq) => cp -cq
		// xp.subtract(xq).multiply(this.coeff).mod(this.p) => (cp - cq) * u mod p = h
		// xp.subtract(xq).multiply(this.coeff).mod(this.p).multiply(this.q).add(xq) => cq + (h * q) = M
		return xp.subtract(xq).multiply(this.coeff).mod(this.p).multiply(this.q).add(xq);
	}

	// Return the PKCS#1 RSA decryption of "ctext".
	// "ctext" is an even-length hex string and the output is a plain string.
	function RSADecrypt(ctext) {
		var c = parseBigInt(ctext, 16);
		var m = this.doPrivate(c);
		if (m == null) return null;
		return pkcs1unpad2(m, (this.n.bitLength() + 7) >> 3);
	}

	// Return the PKCS#1 OAEP RSA decryption of "ctext".
	// "ctext" is an even-length hex string and the output is a plain string.
	function RSADecryptOAEP(ctext, hash, hashLen) {
		var c = parseBigInt(ctext, 16);
		var m = this.doPrivate(c);
		if (m == null) return null;
		return oaep_unpad(m, (this.n.bitLength() + 7) >> 3, hash, hashLen);
	}

	// Return the PKCS#1 RSA decryption of "ctext".
	// "ctext" is a Base64-encoded string and the output is a plain string.
	//function RSAB64Decrypt(ctext) {
	//  var h = b64tohex(ctext);
	//  if(h) return this.decrypt(h); else return null;
	//}

	// protected
	RSAKey.prototype.doPrivate = RSADoPrivate;

	// public
	RSAKey.prototype.setPrivate = RSASetPrivate;
	RSAKey.prototype.setPrivateEx = RSASetPrivateEx;
	RSAKey.prototype.generate = RSAGenerate;
	RSAKey.prototype.decrypt = RSADecrypt;
	RSAKey.prototype.decryptOAEP = RSADecryptOAEP;
	//RSAKey.prototype.b64_decrypt = RSAB64Decrypt;

	/*! dsa-modified-1.0.1.js (c) Recurity Labs GmbH, Kenji Urushimma | github.com/openpgpjs/openpgpjs/blob/master/LICENSE
	 */
	/*
	 * dsa-modified.js - modified DSA class of OpenPGP-JS
	 * 
	 * Copyright (c) 2011-2013 Recurity Labs GmbH (github.com/openpgpjs)
	 *                         Kenji Urushima (kenji.urushima@gmail.com)
	 * LICENSE
	 *   https://github.com/openpgpjs/openpgpjs/blob/master/LICENSE
	 */

	/**
	 * @fileOverview
	 * @name dsa-modified-1.0.js
	 * @author Recurity Labs GmbH (github.com/openpgpjs) and Kenji Urushima (kenji.urushima@gmail.com)
	 * @version 1.0.1 (2013-Oct-06)
	 * @since jsrsasign 4.1.6
	 * @license <a href="https://github.com/openpgpjs/openpgpjs/blob/master/LICENSE">LGPL License</a>
	 */

	if (typeof KJUR == "undefined" || !KJUR) KJUR = {};
	if (typeof KJUR.crypto == "undefined" || !KJUR.crypto) KJUR.crypto = {};

	/**
	 * class for DSA signing and verification
	 * @name KJUR.crypto.DSA
	 * @class class for DSA signing and verifcation
	 * @description
	 * <p>
	 * CAUTION: Most of the case, you don't need to use this class.
	 * Please use {@link KJUR.crypto.Signature} class instead.
	 * </p>
	 * <p>
	 * This class was originally developped by Recurity Labs GmbH for OpenPGP JavaScript library.
	 * (See {@link https://github.com/openpgpjs/openpgpjs/blob/master/src/ciphers/asymmetric/dsa.js})
	 * </p>
	 */
	/* https://github.com/openpgpjs/openpgpjs/blob/master/src/ciphers/asymmetric/dsa.js */
	KJUR.crypto.DSA = function() {
		this.p = null;
		this.q = null;
		this.g = null;
		this.y = null;
		this.x = null;
		this.type = "DSA";

		//===========================
		// PUBLIC METHODS
		//===========================

		/**
		 * set DSA private key by key specs
		 * @name setPrivate
		 * @memberOf KJUR.crypto.DSA
		 * @function
		 * @param {BigInteger} p prime P
		 * @param {BigInteger} q sub prime Q
		 * @param {BigInteger} g base G
		 * @param {BigInteger} y public key Y
		 * @param {BigInteger} x private key X
		 * @since dsa-modified 1.0.0
		 */
		this.setPrivate = function(p, q, g, y, x) {
			this.isPrivate = true;
			this.p = p;
			this.q = q;
			this.g = g;
			this.y = y;
			this.x = x;
		};

		/**
		 * set DSA public key by key specs
		 * @name setPublic
		 * @memberOf KJUR.crypto.DSA
		 * @function
		 * @param {BigInteger} p prime P
		 * @param {BigInteger} q sub prime Q
		 * @param {BigInteger} g base G
		 * @param {BigInteger} y public key Y
		 * @since dsa-modified 1.0.0
		 */
		this.setPublic = function(p, q, g, y) {
			this.isPublic = true;
			this.p = p;
			this.q = q;
			this.g = g;
			this.y = y;
			this.x = null;
		};

		/**
		 * sign to hashed message by this DSA private key object
		 * @name signWithMessageHash
		 * @memberOf KJUR.crypto.DSA
		 * @function
		 * @param {String} sHashHex hexadecimal string of hashed message
		 * @return {String} hexadecimal string of ASN.1 encoded DSA signature value
		 * @since dsa-modified 1.0.0
		 */
		this.signWithMessageHash = function(sHashHex) {
			var p = this.p;
			var q = this.q;
			var g = this.g;
			var y = this.y;
			var x = this.x;

			// 1. trim message hash
			var hashHex = sHashHex.substr(0, q.bitLength() / 4);
			var hash = new BigInteger(sHashHex, 16);

			var k = getRandomBigIntegerInRange(BigInteger.ONE.add(BigInteger.ONE),
				q.subtract(BigInteger.ONE));
			var s1 = (g.modPow(k, p)).mod(q);
			var s2 = (k.modInverse(q).multiply(hash.add(x.multiply(s1)))).mod(q);

			var result = KJUR.asn1.ASN1Util.jsonToASN1HEX({
				'seq': [{
					'int': {
						'bigint': s1
					}
				}, {
					'int': {
						'bigint': s2
					}
				}]
			});
			return result;
		};

		/**
		 * verify signature by this DSA public key object
		 * @name verifyWithMessageHash
		 * @memberOf KJUR.crypto.DSA
		 * @function
		 * @param {String} sHashHex hexadecimal string of hashed message
		 * @param {String} hSigVal hexadecimal string of ASN.1 encoded DSA signature value
		 * @return {Boolean} true if the signature is valid otherwise false.
		 * @since dsa-modified 1.0.0
		 */
		this.verifyWithMessageHash = function(sHashHex, hSigVal) {
			var p = this.p;
			var q = this.q;
			var g = this.g;
			var y = this.y;

			// 1. parse ASN.1 signature
			var s1s2 = this.parseASN1Signature(hSigVal);
			var s1 = s1s2[0];
			var s2 = s1s2[1];

			// 2. trim message hash
			var sHashHex = sHashHex.substr(0, q.bitLength() / 4);
			var hash = new BigInteger(sHashHex, 16);

			if (BigInteger.ZERO.compareTo(s1) > 0 ||
				s1.compareTo(q) > 0 ||
				BigInteger.ZERO.compareTo(s2) > 0 ||
				s2.compareTo(q) > 0) {
				throw "invalid DSA signature";
			}
			var w = s2.modInverse(q);
			var u1 = hash.multiply(w).mod(q);
			var u2 = s1.multiply(w).mod(q);
			var dopublic = g.modPow(u1, p).multiply(y.modPow(u2, p)).mod(p).mod(q);
			return dopublic.compareTo(s1) == 0;
		};

		/**
		 * parse hexadecimal ASN.1 DSA signature value
		 * @name parseASN1Signature
		 * @memberOf KJUR.crypto.DSA
		 * @function
		 * @param {String} hSigVal hexadecimal string of ASN.1 encoded DSA signature value
		 * @return {Array} array [s1, s2] of DSA signature value. Both s1 and s2 are BigInteger.
		 * @since dsa-modified 1.0.0
		 */
		this.parseASN1Signature = function(hSigVal) {
			try {
				var s1 = new BigInteger(ASN1HEX.getVbyList(hSigVal, 0, [0], "02"), 16);
				var s2 = new BigInteger(ASN1HEX.getVbyList(hSigVal, 0, [1], "02"), 16);
				return [s1, s2];
			} catch (ex) {
				throw "malformed DSA signature";
			}
		}

		// s1 = ((g**s) mod p) mod q
		// s1 = ((s**-1)*(sha-1(m)+(s1*x) mod q)
		function sign(hashalgo, m, g, p, q, x) {
			// If the output size of the chosen hash is larger than the number of
			// bits of q, the hash result is truncated to fit by taking the number
			// of leftmost bits equal to the number of bits of q.  This (possibly
			// truncated) hash function result is treated as a number and used
			// directly in the DSA signature algorithm.

			var hashHex = KJUR.crypto.Util.hashString(m, hashalgo.toLowerCase());
			var hashHex = hashHex.substr(0, q.bitLength() / 4);
			var hash = new BigInteger(hashHex, 16);

			var k = getRandomBigIntegerInRange(BigInteger.ONE.add(BigInteger.ONE),
				q.subtract(BigInteger.ONE));
			var s1 = (g.modPow(k, p)).mod(q);
			var s2 = (k.modInverse(q).multiply(hash.add(x.multiply(s1)))).mod(q);
			var result = new Array();
			result[0] = s1;
			result[1] = s2;
			return result;
		}

		function select_hash_algorithm(q) {
			var usersetting = openpgp.config.config.prefer_hash_algorithm;
			/*
			 * 1024-bit key, 160-bit q, SHA-1, SHA-224, SHA-256, SHA-384, or SHA-512 hash
			 * 2048-bit key, 224-bit q, SHA-224, SHA-256, SHA-384, or SHA-512 hash
			 * 2048-bit key, 256-bit q, SHA-256, SHA-384, or SHA-512 hash
			 * 3072-bit key, 256-bit q, SHA-256, SHA-384, or SHA-512 hash
			 */
			switch (Math.round(q.bitLength() / 8)) {
				case 20: // 1024 bit
					if (usersetting != 2 &&
						usersetting > 11 &&
						usersetting != 10 &&
						usersetting < 8)
						return 2; // prefer sha1
					return usersetting;
				case 28: // 2048 bit
					if (usersetting > 11 &&
						usersetting < 8)
						return 11;
					return usersetting;
				case 32: // 4096 bit // prefer sha224
					if (usersetting > 10 &&
						usersetting < 8)
						return 8; // prefer sha256
					return usersetting;
				default:
					util.print_debug("DSA select hash algorithm: returning null for an unknown length of q");
					return null;

			}
		}
		this.select_hash_algorithm = select_hash_algorithm;

		function verify(hashalgo, s1, s2, m, p, q, g, y) {
			var hashHex = KJUR.crypto.Util.hashString(m, hashalgo.toLowerCase());
			var hashHex = hashHex.substr(0, q.bitLength() / 4);
			var hash = new BigInteger(hashHex, 16);

			if (BigInteger.ZERO.compareTo(s1) > 0 ||
				s1.compareTo(q) > 0 ||
				BigInteger.ZERO.compareTo(s2) > 0 ||
				s2.compareTo(q) > 0) {
				util.print_error("invalid DSA Signature");
				return null;
			}
			var w = s2.modInverse(q);
			var u1 = hash.multiply(w).mod(q);
			var u2 = s1.multiply(w).mod(q);
			var dopublic = g.modPow(u1, p).multiply(y.modPow(u2, p)).mod(p).mod(q);
			return dopublic.compareTo(s1) == 0;
		}

		/*
		 * unused code. This can be used as a start to write a key generator
		 * function.
		 */
		function generateKey(bitcount) {
			var qi = new BigInteger(bitcount, primeCenterie);
			var pi = generateP(q, 512);
			var gi = generateG(p, q, bitcount);
			var xi;
			do {
				xi = new BigInteger(q.bitCount(), rand);
			} while (x.compareTo(BigInteger.ZERO) != 1 && x.compareTo(q) != -1);
			var yi = g.modPow(x, p);
			return {
				x: xi,
				q: qi,
				p: pi,
				g: gi,
				y: yi
			};
		}

		function generateP(q, bitlength, randomfn) {
			if (bitlength % 64 != 0) {
				return false;
			}
			var pTemp;
			var pTemp2;
			do {
				pTemp = randomfn(bitcount, true);
				pTemp2 = pTemp.subtract(BigInteger.ONE);
				pTemp = pTemp.subtract(pTemp2.remainder(q));
			} while (!pTemp.isProbablePrime(primeCenterie) || pTemp.bitLength() != l);
			return pTemp;
		}

		function generateG(p, q, bitlength, randomfn) {
			var aux = p.subtract(BigInteger.ONE);
			var pow = aux.divide(q);
			var gTemp;
			do {
				gTemp = randomfn(bitlength);
			} while (gTemp.compareTo(aux) != -1 && gTemp.compareTo(BigInteger.ONE) != 1);
			return gTemp.modPow(pow, p);
		}

		function generateK(q, bitlength, randomfn) {
			var tempK;
			do {
				tempK = randomfn(bitlength, false);
			} while (tempK.compareTo(q) != -1 && tempK.compareTo(BigInteger.ZERO) != 1);
			return tempK;
		}

		function generateR(q, p) {
			k = generateK(q);
			var r = g.modPow(k, p).mod(q);
			return r;
		}

		function generateS(hashfn, k, r, m, q, x) {
			var hash = hashfn(m);
			s = (k.modInverse(q).multiply(hash.add(x.multiply(r)))).mod(q);
			return s;
		}
		this.sign = sign;
		this.verify = verify;
		// this.generate = generateKey;

		//
		// METHODS FROM 
		// https://github.com/openpgpjs/openpgpjs/blob/master/src/ciphers/openpgp.crypto.js
		//
		function getRandomBigIntegerInRange(min, max) {
			if (max.compareTo(min) <= 0)
				return;
			var range = max.subtract(min);
			var r = getRandomBigInteger(range.bitLength());
			while (r > range) {
				r = getRandomBigInteger(range.bitLength());
			}
			return min.add(r);
		}

		function getRandomBigInteger(bits) {
			if (bits < 0)
				return null;
			var numBytes = Math.floor((bits + 7) / 8);

			var randomBits = getRandomBytes(numBytes);
			if (bits % 8 > 0) {
				randomBits = String.fromCharCode((Math.pow(2, bits % 8) - 1) &
						randomBits.charCodeAt(0)) +
					randomBits.substring(1);
			}
			return new BigInteger(hexstrdump(randomBits), 16);
		}

		function getRandomBytes(length) {
			var result = '';
			for (var i = 0; i < length; i++) {
				result += String.fromCharCode(getSecureRandomOctet());
			}
			return result;
		}

		function getSecureRandomOctet() {
			var buf = new Uint32Array(1);
			crypto.getRandomValues(buf);
			return buf[0] & 0xFF;
		}

		// https://github.com/openpgpjs/openpgpjs/blob/master/src/util/util.js
		function hexstrdump(str) {
			if (str == null)
				return "";
			var r = [];
			var e = str.length;
			var c = 0;
			var h;
			while (c < e) {
				h = str[c++].charCodeAt().toString(16);
				while (h.length < 2) h = "0" + h;
				r.push("" + h);
			}
			return r.join('');
		}

		this.getRandomBigIntegerInRange = getRandomBigIntegerInRange;
		this.getRandomBigInteger = getRandomBigInteger;
		this.getRandomBytes = getRandomBytes;
	}

	/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
	 */
	// Basic Javascript Elliptic Curve implementation
	// Ported loosely from BouncyCastle's Java EC code
	// Only Fp curves implemented for now

	// Requires jsbn.js and jsbn2.js

	// ----------------
	// ECFieldElementFp

	// constructor
	function ECFieldElementFp(q, x) {
		this.x = x;
		// TODO if(x.compareTo(q) >= 0) error
		this.q = q;
	}

	function feFpEquals(other) {
		if (other == this) return true;
		return (this.q.equals(other.q) && this.x.equals(other.x));
	}

	function feFpToBigInteger() {
		return this.x;
	}

	function feFpNegate() {
		return new ECFieldElementFp(this.q, this.x.negate().mod(this.q));
	}

	function feFpAdd(b) {
		return new ECFieldElementFp(this.q, this.x.add(b.toBigInteger()).mod(this.q));
	}

	function feFpSubtract(b) {
		return new ECFieldElementFp(this.q, this.x.subtract(b.toBigInteger()).mod(this.q));
	}

	function feFpMultiply(b) {
		return new ECFieldElementFp(this.q, this.x.multiply(b.toBigInteger()).mod(this.q));
	}

	function feFpSquare() {
		return new ECFieldElementFp(this.q, this.x.square().mod(this.q));
	}

	function feFpDivide(b) {
		return new ECFieldElementFp(this.q, this.x.multiply(b.toBigInteger().modInverse(this.q)).mod(this.q));
	}

	ECFieldElementFp.prototype.equals = feFpEquals;
	ECFieldElementFp.prototype.toBigInteger = feFpToBigInteger;
	ECFieldElementFp.prototype.negate = feFpNegate;
	ECFieldElementFp.prototype.add = feFpAdd;
	ECFieldElementFp.prototype.subtract = feFpSubtract;
	ECFieldElementFp.prototype.multiply = feFpMultiply;
	ECFieldElementFp.prototype.square = feFpSquare;
	ECFieldElementFp.prototype.divide = feFpDivide;

	// ----------------
	// ECPointFp

	// constructor
	function ECPointFp(curve, x, y, z) {
		this.curve = curve;
		this.x = x;
		this.y = y;
		// Projective coordinates: either zinv == null or z * zinv == 1
		// z and zinv are just BigIntegers, not fieldElements
		if (z == null) {
			this.z = BigInteger.ONE;
		} else {
			this.z = z;
		}
		this.zinv = null;
		//TODO: compression flag
	}

	function pointFpGetX() {
		if (this.zinv == null) {
			this.zinv = this.z.modInverse(this.curve.q);
		}
		return this.curve.fromBigInteger(this.x.toBigInteger().multiply(this.zinv).mod(this.curve.q));
	}

	function pointFpGetY() {
		if (this.zinv == null) {
			this.zinv = this.z.modInverse(this.curve.q);
		}
		return this.curve.fromBigInteger(this.y.toBigInteger().multiply(this.zinv).mod(this.curve.q));
	}

	function pointFpEquals(other) {
		if (other == this) return true;
		if (this.isInfinity()) return other.isInfinity();
		if (other.isInfinity()) return this.isInfinity();
		var u, v;
		// u = Y2 * Z1 - Y1 * Z2
		u = other.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(other.z)).mod(this.curve.q);
		if (!u.equals(BigInteger.ZERO)) return false;
		// v = X2 * Z1 - X1 * Z2
		v = other.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(other.z)).mod(this.curve.q);
		return v.equals(BigInteger.ZERO);
	}

	function pointFpIsInfinity() {
		if ((this.x == null) && (this.y == null)) return true;
		return this.z.equals(BigInteger.ZERO) && !this.y.toBigInteger().equals(BigInteger.ZERO);
	}

	function pointFpNegate() {
		return new ECPointFp(this.curve, this.x, this.y.negate(), this.z);
	}

	function pointFpAdd(b) {
		if (this.isInfinity()) return b;
		if (b.isInfinity()) return this;

		// u = Y2 * Z1 - Y1 * Z2
		var u = b.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(b.z)).mod(this.curve.q);
		// v = X2 * Z1 - X1 * Z2
		var v = b.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(b.z)).mod(this.curve.q);

		if (BigInteger.ZERO.equals(v)) {
			if (BigInteger.ZERO.equals(u)) {
				return this.twice(); // this == b, so double
			}
			return this.curve.getInfinity(); // this = -b, so infinity
		}

		var THREE = new BigInteger("3");
		var x1 = this.x.toBigInteger();
		var y1 = this.y.toBigInteger();
		var x2 = b.x.toBigInteger();
		var y2 = b.y.toBigInteger();

		var v2 = v.square();
		var v3 = v2.multiply(v);
		var x1v2 = x1.multiply(v2);
		var zu2 = u.square().multiply(this.z);

		// x3 = v * (z2 * (z1 * u^2 - 2 * x1 * v^2) - v^3)
		var x3 = zu2.subtract(x1v2.shiftLeft(1)).multiply(b.z).subtract(v3).multiply(v).mod(this.curve.q);
		// y3 = z2 * (3 * x1 * u * v^2 - y1 * v^3 - z1 * u^3) + u * v^3
		var y3 = x1v2.multiply(THREE).multiply(u).subtract(y1.multiply(v3)).subtract(zu2.multiply(u)).multiply(b.z).add(u.multiply(
			v3)).mod(this.curve.q);
		// z3 = v^3 * z1 * z2
		var z3 = v3.multiply(this.z).multiply(b.z).mod(this.curve.q);

		return new ECPointFp(this.curve, this.curve.fromBigInteger(x3), this.curve.fromBigInteger(y3), z3);
	}

	function pointFpTwice() {
		if (this.isInfinity()) return this;
		if (this.y.toBigInteger().signum() == 0) return this.curve.getInfinity();

		// TODO: optimized handling of constants
		var THREE = new BigInteger("3");
		var x1 = this.x.toBigInteger();
		var y1 = this.y.toBigInteger();

		var y1z1 = y1.multiply(this.z);
		var y1sqz1 = y1z1.multiply(y1).mod(this.curve.q);
		var a = this.curve.a.toBigInteger();

		// w = 3 * x1^2 + a * z1^2
		var w = x1.square().multiply(THREE);
		if (!BigInteger.ZERO.equals(a)) {
			w = w.add(this.z.square().multiply(a));
		}
		w = w.mod(this.curve.q);
		// x3 = 2 * y1 * z1 * (w^2 - 8 * x1 * y1^2 * z1)
		var x3 = w.square().subtract(x1.shiftLeft(3).multiply(y1sqz1)).shiftLeft(1).multiply(y1z1).mod(this.curve.q);
		// y3 = 4 * y1^2 * z1 * (3 * w * x1 - 2 * y1^2 * z1) - w^3
		var y3 = w.multiply(THREE).multiply(x1).subtract(y1sqz1.shiftLeft(1)).shiftLeft(2).multiply(y1sqz1).subtract(w.square()
			.multiply(w)).mod(this.curve.q);
		// z3 = 8 * (y1 * z1)^3
		var z3 = y1z1.square().multiply(y1z1).shiftLeft(3).mod(this.curve.q);

		return new ECPointFp(this.curve, this.curve.fromBigInteger(x3), this.curve.fromBigInteger(y3), z3);
	}

	// Simple NAF (Non-Adjacent Form) multiplication algorithm
	// TODO: modularize the multiplication algorithm
	function pointFpMultiply(k) {
		if (this.isInfinity()) return this;
		if (k.signum() == 0) return this.curve.getInfinity();

		var e = k;
		var h = e.multiply(new BigInteger("3"));

		var neg = this.negate();
		var R = this;

		var i;
		for (i = h.bitLength() - 2; i > 0; --i) {
			R = R.twice();

			var hBit = h.testBit(i);
			var eBit = e.testBit(i);

			if (hBit != eBit) {
				R = R.add(hBit ? this : neg);
			}
		}

		return R;
	}

	// Compute this*j + x*k (simultaneous multiplication)
	function pointFpMultiplyTwo(j, x, k) {
		var i;
		if (j.bitLength() > k.bitLength())
			i = j.bitLength() - 1;
		else
			i = k.bitLength() - 1;

		var R = this.curve.getInfinity();
		var both = this.add(x);
		while (i >= 0) {
			R = R.twice();
			if (j.testBit(i)) {
				if (k.testBit(i)) {
					R = R.add(both);
				} else {
					R = R.add(this);
				}
			} else {
				if (k.testBit(i)) {
					R = R.add(x);
				}
			}
			--i;
		}

		return R;
	}

	ECPointFp.prototype.getX = pointFpGetX;
	ECPointFp.prototype.getY = pointFpGetY;
	ECPointFp.prototype.equals = pointFpEquals;
	ECPointFp.prototype.isInfinity = pointFpIsInfinity;
	ECPointFp.prototype.negate = pointFpNegate;
	ECPointFp.prototype.add = pointFpAdd;
	ECPointFp.prototype.twice = pointFpTwice;
	ECPointFp.prototype.multiply = pointFpMultiply;
	ECPointFp.prototype.multiplyTwo = pointFpMultiplyTwo;

	// ----------------
	// ECCurveFp

	// constructor
	function ECCurveFp(q, a, b) {
		this.q = q;
		this.a = this.fromBigInteger(a);
		this.b = this.fromBigInteger(b);
		this.infinity = new ECPointFp(this, null, null);
	}

	function curveFpGetQ() {
		return this.q;
	}

	function curveFpGetA() {
		return this.a;
	}

	function curveFpGetB() {
		return this.b;
	}

	function curveFpEquals(other) {
		if (other == this) return true;
		return (this.q.equals(other.q) && this.a.equals(other.a) && this.b.equals(other.b));
	}

	function curveFpGetInfinity() {
		return this.infinity;
	}

	function curveFpFromBigInteger(x) {
		return new ECFieldElementFp(this.q, x);
	}

	// for now, work with hex strings because they're easier in JS
	function curveFpDecodePointHex(s) {
		switch (parseInt(s.substr(0, 2), 16)) { // first byte
			case 0:
				return this.infinity;
			case 2:
			case 3:
				// point compression not supported yet
				return null;
			case 4:
			case 6:
			case 7:
				var len = (s.length - 2) / 2;
				var xHex = s.substr(2, len);
				var yHex = s.substr(len + 2, len);

				return new ECPointFp(this,
					this.fromBigInteger(new BigInteger(xHex, 16)),
					this.fromBigInteger(new BigInteger(yHex, 16)));

			default: // unsupported
				return null;
		}
	}

	ECCurveFp.prototype.getQ = curveFpGetQ;
	ECCurveFp.prototype.getA = curveFpGetA;
	ECCurveFp.prototype.getB = curveFpGetB;
	ECCurveFp.prototype.equals = curveFpEquals;
	ECCurveFp.prototype.getInfinity = curveFpGetInfinity;
	ECCurveFp.prototype.fromBigInteger = curveFpFromBigInteger;
	ECCurveFp.prototype.decodePointHex = curveFpDecodePointHex;

	/*! ecdsa-modified-1.0.5.js (c) Stephan Thomas, Kenji Urushima | github.com/bitcoinjs/bitcoinjs-lib/blob/master/LICENSE
	 */
	/*
	 * ecdsa-modified.js - modified Bitcoin.ECDSA class
	 * 
	 * Copyright (c) 2013-2016 Stefan Thomas (github.com/justmoon)
	 *                         Kenji Urushima (kenji.urushima@gmail.com)
	 * LICENSE
	 *   https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/LICENSE
	 */

	/**
	 * @fileOverview
	 * @name ecdsa-modified-1.0.js
	 * @author Stefan Thomas (github.com/justmoon) and Kenji Urushima (kenji.urushima@gmail.com)
	 * @version 1.0.5 (2016-Aug-11)
	 * @since jsrsasign 4.0
	 * @license <a href="https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/LICENSE">MIT License</a>
	 */

	if (typeof KJUR == "undefined" || !KJUR) KJUR = {};
	if (typeof KJUR.crypto == "undefined" || !KJUR.crypto) KJUR.crypto = {};

	/**
	 * class for EC key generation,  ECDSA signing and verifcation
	 * @name KJUR.crypto.ECDSA
	 * @class class for EC key generation,  ECDSA signing and verifcation
	 * @description
	 * <p>
	 * CAUTION: Most of the case, you don't need to use this class except
	 * for generating an EC key pair. Please use {@link KJUR.crypto.Signature} class instead.
	 * </p>
	 * <p>
	 * This class was originally developped by Stefan Thomas for Bitcoin JavaScript library.
	 * (See {@link https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/ecdsa.js})
	 * Currently this class supports following named curves and their aliases.
	 * <ul>
	 * <li>secp256r1, NIST P-256, P-256, prime256v1 (*)</li>
	 * <li>secp256k1 (*)</li>
	 * <li>secp384r1, NIST P-384, P-384 (*)</li>
	 * </ul>
	 * </p>
	 */
	KJUR.crypto.ECDSA = function(params) {
		var curveName = "secp256r1"; // curve name default
		var ecparams = null;
		var prvKeyHex = null;
		var pubKeyHex = null;

		var rng = new SecureRandom();

		var P_OVER_FOUR = null;

		this.type = "EC";

		function implShamirsTrick(P, k, Q, l) {
			var m = Math.max(k.bitLength(), l.bitLength());
			var Z = P.add2D(Q);
			var R = P.curve.getInfinity();

			for (var i = m - 1; i >= 0; --i) {
				R = R.twice2D();

				R.z = BigInteger.ONE;

				if (k.testBit(i)) {
					if (l.testBit(i)) {
						R = R.add2D(Z);
					} else {
						R = R.add2D(P);
					}
				} else {
					if (l.testBit(i)) {
						R = R.add2D(Q);
					}
				}
			}

			return R;
		};

		//===========================
		// PUBLIC METHODS
		//===========================
		this.getBigRandom = function(limit) {
			return new BigInteger(limit.bitLength(), rng)
				.mod(limit.subtract(BigInteger.ONE))
				.add(BigInteger.ONE);
		};

		this.setNamedCurve = function(curveName) {
			this.ecparams = KJUR.crypto.ECParameterDB.getByName(curveName);
			this.prvKeyHex = null;
			this.pubKeyHex = null;
			this.curveName = curveName;
		};

		this.setPrivateKeyHex = function(prvKeyHex) {
			this.isPrivate = true;
			this.prvKeyHex = prvKeyHex;
		};

		this.setPublicKeyHex = function(pubKeyHex) {
			this.isPublic = true;
			this.pubKeyHex = pubKeyHex;
		};

		/**
		 * get X and Y hexadecimal string value of public key
		 * @name getPublicKeyXYHex
		 * @memberOf KJUR.crypto.ECDSA
		 * @function
		 * @return {Array} associative array of x and y value of public key
		 * @since ecdsa-modified 1.0.5 jsrsasign 5.0.14
		 * @example
		 * ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1', 'pub': pubHex});
		 * ec.getPublicKeyXYHex() &rarr; { x: '01bacf...', y: 'c3bc22...' }
		 */
		this.getPublicKeyXYHex = function() {
			var h = this.pubKeyHex;
			if (h.substr(0, 2) !== "04")
				throw "this method supports uncompressed format(04) only";

			var charlen = this.ecparams.keylen / 4;
			if (h.length !== 2 + charlen * 2)
				throw "malformed public key hex length";

			var result = {};
			result.x = h.substr(2, charlen);
			result.y = h.substr(2 + charlen);
			return result;
		};

		/**
		 * get NIST curve short name such as "P-256" or "P-384"
		 * @name getShortNISTPCurveName
		 * @memberOf KJUR.crypto.ECDSA
		 * @function
		 * @return {String} short NIST P curve name such as "P-256" or "P-384" if it's NIST P curve otherwise null;
		 * @since ecdsa-modified 1.0.5 jsrsasign 5.0.14
		 * @example
		 * ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1', 'pub': pubHex});
		 * ec.getShortPCurveName() &rarr; "P-256";
		 */
		this.getShortNISTPCurveName = function() {
			var s = this.curveName;
			if (s === "secp256r1" || s === "NIST P-256" ||
				s === "P-256" || s === "prime256v1")
				return "P-256";
			if (s === "secp384r1" || s === "NIST P-384" || s === "P-384")
				return "P-384";
			return null;
		};

		/**
		 * generate a EC key pair
		 * @name generateKeyPairHex
		 * @memberOf KJUR.crypto.ECDSA
		 * @function
		 * @return {Array} associative array of hexadecimal string of private and public key
		 * @since ecdsa-modified 1.0.1
		 * @example
		 * var ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1'});
		 * var keypair = ec.generateKeyPairHex();
		 * var pubhex = keypair.ecpubhex; // hexadecimal string of EC public key
		 * var prvhex = keypair.ecprvhex; // hexadecimal string of EC private key (=d)
		 */
		this.generateKeyPairHex = function() {
			var biN = this.ecparams['n'];
			var biPrv = null; //this.getBigRandom(biN);
			//var epPub = this.ecparams['G'].multiply(biPrv);
			//var biX = epPub.getX().toBigInteger();
			//var biY = epPub.getY().toBigInteger();
			// 新加同服务端java Integer.toHexString方法.
			function bytesToHex(bytes) {
				var hex = null;
				for (var hexArray = [], i = 0; i < bytes.length; i++) {
					hex = (bytes[i] >>> 4).toString(16) + (bytes[i] & 0xF).toString(16);
					// 带负号byte的情况
					if (hex.length > 6) {
						hex = hex.substring(hex.length - 2);
					}
					hexArray.push(hex);
				}
				return hexArray.join("");
			};
			// mod by zhenggd for 与服务端算法保持一致.
			do {
				biPrv = new BigInteger(biN.bitLength(), rng);
			} while (biPrv.equals(BigInteger.valueOf(0)) || biPrv.compareTo(biN) >= 0);
			var epPub = this.ecparams['G'].multiply(biPrv);
			var hPub = bytesToHex(epPub.getEncoded(false));
			var hPrv = biPrv.toString(16);
			//var charlen = this.ecparams['keylen'] / 4;
			//var hPrv = ("0000000000" + biPrv.toString(16)).slice(-charlen);
			//var hX = ("0000000000" + biX.toString(16)).slice(-charlen);
			//var hY = ("0000000000" + biY.toString(16)).slice(-charlen);
			//var hPub = "04" + hX + hY;

			this.setPrivateKeyHex(hPrv);
			this.setPublicKeyHex(hPub);
			return {
				'ecprvhex': hPrv,
				'ecpubhex': hPub
			};
		};

		this.signWithMessageHash = function(hashHex) {
			return this.signHex(hashHex, this.prvKeyHex);
		};

		/**
		 * signing to message hash
		 * @name signHex
		 * @memberOf KJUR.crypto.ECDSA
		 * @function
		 * @param {String} hashHex hexadecimal string of hash value of signing message
		 * @param {String} privHex hexadecimal string of EC private key
		 * @return {String} hexadecimal string of ECDSA signature
		 * @since ecdsa-modified 1.0.1
		 * @example
		 * var ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1'});
		 * var sigValue = ec.signHex(hash, prvKey);
		 */
		this.signHex = function(hashHex, privHex) {
			var d = new BigInteger(privHex, 16);
			var n = this.ecparams['n'];
			var e = new BigInteger(hashHex, 16);

			do {
				var k = this.getBigRandom(n);
				var G = this.ecparams['G'];
				var Q = G.multiply(k);
				var r = Q.getX().toBigInteger().mod(n);
			} while (r.compareTo(BigInteger.ZERO) <= 0);

			var s = k.modInverse(n).multiply(e.add(d.multiply(r))).mod(n);

			return KJUR.crypto.ECDSA.biRSSigToASN1Sig(r, s);
		};

		this.sign = function(hash, priv) {
			var d = priv;
			var n = this.ecparams['n'];
			var e = BigInteger.fromByteArrayUnsigned(hash);

			do {
				var k = this.getBigRandom(n);
				var G = this.ecparams['G'];
				var Q = G.multiply(k);
				var r = Q.getX().toBigInteger().mod(n);
			} while (r.compareTo(BigInteger.ZERO) <= 0);

			var s = k.modInverse(n).multiply(e.add(d.multiply(r))).mod(n);
			return this.serializeSig(r, s);
		};

		this.verifyWithMessageHash = function(hashHex, sigHex) {
			return this.verifyHex(hashHex, sigHex, this.pubKeyHex);
		};

		/**
		 * verifying signature with message hash and public key
		 * @name verifyHex
		 * @memberOf KJUR.crypto.ECDSA
		 * @function
		 * @param {String} hashHex hexadecimal string of hash value of signing message
		 * @param {String} sigHex hexadecimal string of signature value
		 * @param {String} pubkeyHex hexadecimal string of public key
		 * @return {Boolean} true if the signature is valid, otherwise false
		 * @since ecdsa-modified 1.0.1
		 * @example
		 * var ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1'});
		 * var result = ec.verifyHex(msgHashHex, sigHex, pubkeyHex);
		 */
		this.verifyHex = function(hashHex, sigHex, pubkeyHex) {
			var r, s;

			var obj = KJUR.crypto.ECDSA.parseSigHex(sigHex);
			r = obj.r;
			s = obj.s;

			var Q;
			Q = ECPointFp.decodeFromHex(this.ecparams['curve'], pubkeyHex);
			var e = new BigInteger(hashHex, 16);

			return this.verifyRaw(e, r, s, Q);
		};

		this.verify = function(hash, sig, pubkey) {
			var r, s;
			if (Bitcoin.Util.isArray(sig)) {
				var obj = this.parseSig(sig);
				r = obj.r;
				s = obj.s;
			} else if ("object" === typeof sig && sig.r && sig.s) {
				r = sig.r;
				s = sig.s;
			} else {
				throw "Invalid value for signature";
			}

			var Q;
			if (pubkey instanceof ECPointFp) {
				Q = pubkey;
			} else if (Bitcoin.Util.isArray(pubkey)) {
				Q = ECPointFp.decodeFrom(this.ecparams['curve'], pubkey);
			} else {
				throw "Invalid format for pubkey value, must be byte array or ECPointFp";
			}
			var e = BigInteger.fromByteArrayUnsigned(hash);

			return this.verifyRaw(e, r, s, Q);
		};

		this.verifyRaw = function(e, r, s, Q) {
			var n = this.ecparams['n'];
			var G = this.ecparams['G'];

			if (r.compareTo(BigInteger.ONE) < 0 ||
				r.compareTo(n) >= 0)
				return false;

			if (s.compareTo(BigInteger.ONE) < 0 ||
				s.compareTo(n) >= 0)
				return false;

			var c = s.modInverse(n);

			var u1 = e.multiply(c).mod(n);
			var u2 = r.multiply(c).mod(n);

			// TODO(!!!): For some reason Shamir's trick isn't working with
			// signed message verification!? Probably an implementation
			// error!
			//var point = implShamirsTrick(G, u1, Q, u2);
			var point = G.multiply(u1).add(Q.multiply(u2));

			var v = point.getX().toBigInteger().mod(n);

			return v.equals(r);
		};

		/**
		 * Serialize a signature into DER format.
		 *
		 * Takes two BigIntegers representing r and s and returns a byte array.
		 */
		this.serializeSig = function(r, s) {
			var rBa = r.toByteArraySigned();
			var sBa = s.toByteArraySigned();

			var sequence = [];
			sequence.push(0x02); // INTEGER
			sequence.push(rBa.length);
			sequence = sequence.concat(rBa);

			sequence.push(0x02); // INTEGER
			sequence.push(sBa.length);
			sequence = sequence.concat(sBa);

			sequence.unshift(sequence.length);
			sequence.unshift(0x30); // SEQUENCE
			return sequence;
		};

		/**
		 * Parses a byte array containing a DER-encoded signature.
		 *
		 * This function will return an object of the form:
		 *
		 * {
		 *   r: BigInteger,
		 *   s: BigInteger
		 * }
		 */
		this.parseSig = function(sig) {
			var cursor;
			if (sig[0] != 0x30)
				throw new Error("Signature not a valid DERSequence");

			cursor = 2;
			if (sig[cursor] != 0x02)
				throw new Error("First element in signature must be a DERInteger");;
			var rBa = sig.slice(cursor + 2, cursor + 2 + sig[cursor + 1]);

			cursor += 2 + sig[cursor + 1];
			if (sig[cursor] != 0x02)
				throw new Error("Second element in signature must be a DERInteger");
			var sBa = sig.slice(cursor + 2, cursor + 2 + sig[cursor + 1]);

			cursor += 2 + sig[cursor + 1];

			//if (cursor != sig.length)
			//  throw new Error("Extra bytes in signature");

			var r = BigInteger.fromByteArrayUnsigned(rBa);
			var s = BigInteger.fromByteArrayUnsigned(sBa);

			return {
				r: r,
				s: s
			};
		};

		this.parseSigCompact = function(sig) {
			if (sig.length !== 65) {
				throw "Signature has the wrong length";
			}

			// Signature is prefixed with a type byte storing three bits of
			// information.
			var i = sig[0] - 27;
			if (i < 0 || i > 7) {
				throw "Invalid signature type";
			}

			var n = this.ecparams['n'];
			var r = BigInteger.fromByteArrayUnsigned(sig.slice(1, 33)).mod(n);
			var s = BigInteger.fromByteArrayUnsigned(sig.slice(33, 65)).mod(n);

			return {
				r: r,
				s: s,
				i: i
			};
		};

		/*
		 * Recover a public key from a signature.
		 *
		 * See SEC 1: Elliptic Curve Cryptography, section 4.1.6, "Public
		 * Key Recovery Operation".
		 *
		 * http://www.secg.org/download/aid-780/sec1-v2.pdf
		 */
		/*
			    recoverPubKey: function (r, s, hash, i) {
			  // The recovery parameter i has two bits.
			  i = i & 3;

			  // The less significant bit specifies whether the y coordinate
			  // of the compressed point is even or not.
			  var isYEven = i & 1;

			  // The more significant bit specifies whether we should use the
			  // first or second candidate key.
			  var isSecondKey = i >> 1;

			  var n = this.ecparams['n'];
			  var G = this.ecparams['G'];
			  var curve = this.ecparams['curve'];
			  var p = curve.getQ();
			  var a = curve.getA().toBigInteger();
			  var b = curve.getB().toBigInteger();

			  // We precalculate (p + 1) / 4 where p is if the field order
			  if (!P_OVER_FOUR) {
			      P_OVER_FOUR = p.add(BigInteger.ONE).divide(BigInteger.valueOf(4));
			  }

			  // 1.1 Compute x
			  var x = isSecondKey ? r.add(n) : r;

			  // 1.3 Convert x to point
			  var alpha = x.multiply(x).multiply(x).add(a.multiply(x)).add(b).mod(p);
			  var beta = alpha.modPow(P_OVER_FOUR, p);

			  var xorOdd = beta.isEven() ? (i % 2) : ((i+1) % 2);
			  // If beta is even, but y isn't or vice versa, then convert it,
			  // otherwise we're done and y == beta.
			  var y = (beta.isEven() ? !isYEven : isYEven) ? beta : p.subtract(beta);

			  // 1.4 Check that nR is at infinity
			  var R = new ECPointFp(curve,
			            curve.fromBigInteger(x),
			            curve.fromBigInteger(y));
			  R.validate();

			  // 1.5 Compute e from M
			  var e = BigInteger.fromByteArrayUnsigned(hash);
			  var eNeg = BigInteger.ZERO.subtract(e).mod(n);

			  // 1.6 Compute Q = r^-1 (sR - eG)
			  var rInv = r.modInverse(n);
			  var Q = implShamirsTrick(R, s, G, eNeg).multiply(rInv);

			  Q.validate();
			  if (!this.verifyRaw(e, r, s, Q)) {
			      throw "Pubkey recovery unsuccessful";
			  }

			  var pubKey = new Bitcoin.ECKey();
			  pubKey.pub = Q;
			  return pubKey;
			    },
			    */

		/*
		 * Calculate pubkey extraction parameter.
		 *
		 * When extracting a pubkey from a signature, we have to
		 * distinguish four different cases. Rather than putting this
		 * burden on the verifier, Bitcoin includes a 2-bit value with the
		 * signature.
		 *
		 * This function simply tries all four cases and returns the value
		 * that resulted in a successful pubkey recovery.
		 */
		/*
			    calcPubkeyRecoveryParam: function (address, r, s, hash) {
			  for (var i = 0; i < 4; i++) {
			      try {
			    var pubkey = Bitcoin.ECDSA.recoverPubKey(r, s, hash, i);
			    if (pubkey.getBitcoinAddress().toString() == address) {
			        return i;
			    }
			      } catch (e) {}
			  }
			  throw "Unable to find valid recovery factor";
			    }
			    */

		if (params !== undefined) {
			if (params['curve'] !== undefined) {
				this.curveName = params['curve'];
			}
		}
		if (this.curveName === undefined) this.curveName = curveName;
		this.setNamedCurve(this.curveName);
		if (params !== undefined) {
			if (params['prv'] !== undefined) this.setPrivateKeyHex(params['prv']);
			if (params['pub'] !== undefined) this.setPublicKeyHex(params['pub']);
		}
	};

	/**
	 * parse ASN.1 DER encoded ECDSA signature
	 * @name parseSigHex
	 * @memberOf KJUR.crypto.ECDSA
	 * @function
	 * @static
	 * @param {String} sigHex hexadecimal string of ECDSA signature value
	 * @return {Array} associative array of signature field r and s of BigInteger
	 * @since ecdsa-modified 1.0.1
	 * @example
	 * var ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1'});
	 * var sig = ec.parseSigHex('30...');
	 * var biR = sig.r; // BigInteger object for 'r' field of signature.
	 * var biS = sig.s; // BigInteger object for 's' field of signature.
	 */
	KJUR.crypto.ECDSA.parseSigHex = function(sigHex) {
		var p = KJUR.crypto.ECDSA.parseSigHexInHexRS(sigHex);
		var biR = new BigInteger(p.r, 16);
		var biS = new BigInteger(p.s, 16);

		return {
			'r': biR,
			's': biS
		};
	};

	/**
	 * parse ASN.1 DER encoded ECDSA signature
	 * @name parseSigHexInHexRS
	 * @memberOf KJUR.crypto.ECDSA
	 * @function
	 * @static
	 * @param {String} sigHex hexadecimal string of ECDSA signature value
	 * @return {Array} associative array of signature field r and s in hexadecimal
	 * @since ecdsa-modified 1.0.3
	 * @example
	 * var ec = new KJUR.crypto.ECDSA({'curve': 'secp256r1'});
	 * var sig = ec.parseSigHexInHexRS('30...');
	 * var hR = sig.r; // hexadecimal string for 'r' field of signature.
	 * var hS = sig.s; // hexadecimal string for 's' field of signature.
	 */
	KJUR.crypto.ECDSA.parseSigHexInHexRS = function(sigHex) {
		// 1. ASN.1 Sequence Check
		if (sigHex.substr(0, 2) != "30")
			throw "signature is not a ASN.1 sequence";

		// 2. Items of ASN.1 Sequence Check
		var a = ASN1HEX.getPosArrayOfChildren_AtObj(sigHex, 0);
		if (a.length != 2)
			throw "number of signature ASN.1 sequence elements seem wrong";

		// 3. Integer check
		var iTLV1 = a[0];
		var iTLV2 = a[1];
		if (sigHex.substr(iTLV1, 2) != "02")
			throw "1st item of sequene of signature is not ASN.1 integer";
		if (sigHex.substr(iTLV2, 2) != "02")
			throw "2nd item of sequene of signature is not ASN.1 integer";

		// 4. getting value
		var hR = ASN1HEX.getHexOfV_AtObj(sigHex, iTLV1);
		var hS = ASN1HEX.getHexOfV_AtObj(sigHex, iTLV2);

		return {
			'r': hR,
			's': hS
		};
	};

	/**
	 * convert hexadecimal ASN.1 encoded signature to concatinated signature
	 * @name asn1SigToConcatSig
	 * @memberOf KJUR.crypto.ECDSA
	 * @function
	 * @static
	 * @param {String} asn1Hex hexadecimal string of ASN.1 encoded ECDSA signature value
	 * @return {String} r-s concatinated format of ECDSA signature value
	 * @since ecdsa-modified 1.0.3
	 */
	KJUR.crypto.ECDSA.asn1SigToConcatSig = function(asn1Sig) {
		var pSig = KJUR.crypto.ECDSA.parseSigHexInHexRS(asn1Sig);
		var hR = pSig.r;
		var hS = pSig.s;

		if (hR.substr(0, 2) == "00" && (((hR.length / 2) * 8) % (16 * 8)) == 8)
			hR = hR.substr(2);

		if (hS.substr(0, 2) == "00" && (((hS.length / 2) * 8) % (16 * 8)) == 8)
			hS = hS.substr(2);

		if ((((hR.length / 2) * 8) % (16 * 8)) != 0)
			throw "unknown ECDSA sig r length error";

		if ((((hS.length / 2) * 8) % (16 * 8)) != 0)
			throw "unknown ECDSA sig s length error";

		return hR + hS;
	};

	/**
	 * convert hexadecimal concatinated signature to ASN.1 encoded signature
	 * @name concatSigToASN1Sig
	 * @memberOf KJUR.crypto.ECDSA
	 * @function
	 * @static
	 * @param {String} concatSig r-s concatinated format of ECDSA signature value
	 * @return {String} hexadecimal string of ASN.1 encoded ECDSA signature value
	 * @since ecdsa-modified 1.0.3
	 */
	KJUR.crypto.ECDSA.concatSigToASN1Sig = function(concatSig) {
		if ((((concatSig.length / 2) * 8) % (16 * 8)) != 0)
			throw "unknown ECDSA concatinated r-s sig  length error";

		var hR = concatSig.substr(0, concatSig.length / 2);
		var hS = concatSig.substr(concatSig.length / 2);
		return KJUR.crypto.ECDSA.hexRSSigToASN1Sig(hR, hS);
	};

	/**
	 * convert hexadecimal R and S value of signature to ASN.1 encoded signature
	 * @name hexRSSigToASN1Sig
	 * @memberOf KJUR.crypto.ECDSA
	 * @function
	 * @static
	 * @param {String} hR hexadecimal string of R field of ECDSA signature value
	 * @param {String} hS hexadecimal string of S field of ECDSA signature value
	 * @return {String} hexadecimal string of ASN.1 encoded ECDSA signature value
	 * @since ecdsa-modified 1.0.3
	 */
	KJUR.crypto.ECDSA.hexRSSigToASN1Sig = function(hR, hS) {
		var biR = new BigInteger(hR, 16);
		var biS = new BigInteger(hS, 16);
		return KJUR.crypto.ECDSA.biRSSigToASN1Sig(biR, biS);
	};

	/**
	 * convert R and S BigInteger object of signature to ASN.1 encoded signature
	 * @name biRSSigToASN1Sig
	 * @memberOf KJUR.crypto.ECDSA
	 * @function
	 * @static
	 * @param {BigInteger} biR BigInteger object of R field of ECDSA signature value
	 * @param {BigInteger} biS BIgInteger object of S field of ECDSA signature value
	 * @return {String} hexadecimal string of ASN.1 encoded ECDSA signature value
	 * @since ecdsa-modified 1.0.3
	 */
	KJUR.crypto.ECDSA.biRSSigToASN1Sig = function(biR, biS) {
		var derR = new KJUR.asn1.DERInteger({
			'bigint': biR
		});
		var derS = new KJUR.asn1.DERInteger({
			'bigint': biS
		});
		var derSeq = new KJUR.asn1.DERSequence({
			'array': [derR, derS]
		});
		return derSeq.getEncodedHex();
	};

	/*! (c) Stefan Thomas | https://github.com/bitcoinjs/bitcoinjs-lib
	 */
	/*
	 * splitted from bitcoin-lib/ecdsa.js
	 *
	 * version 1.0.0 is the original of bitcoin-lib/ecdsa.js
	 */
	ECFieldElementFp.prototype.getByteLength = function() {
		return Math.floor((this.toBigInteger().bitLength() + 7) / 8);
	};

	ECPointFp.prototype.getEncoded = function(compressed) {
		var integerToBytes = function(i, len) {
			var bytes = i.toByteArray();

			if (len < bytes.length) {
				bytes = bytes.slice(bytes.length - len);
			} else
				while (len > bytes.length) {
					bytes.unshift(0);
				}
			return bytes;
		};

		var x = this.getX().toBigInteger();
		var y = this.getY().toBigInteger();

		// Get value as a 32-byte Buffer
		// Fixed length based on a patch by bitaddress.org and Casascius
		var enc = integerToBytes(x, 32);

		if (compressed) {
			if (y.isEven()) {
				// Compressed even pubkey
				// M = 02 || X
				enc.unshift(0x02);
			} else {
				// Compressed uneven pubkey
				// M = 03 || X
				enc.unshift(0x03);
			}
		} else {
			// Uncompressed pubkey
			// M = 04 || X || Y
			enc.unshift(0x04);
			enc = enc.concat(integerToBytes(y, 32));
		}
		return enc;
	};

	ECPointFp.decodeFrom = function(curve, enc) {
		var type = enc[0];
		var dataLen = enc.length - 1;

		// Extract x and y as byte arrays
		var xBa = enc.slice(1, 1 + dataLen / 2);
		var yBa = enc.slice(1 + dataLen / 2, 1 + dataLen);

		// Prepend zero byte to prevent interpretation as negative integer
		xBa.unshift(0);
		yBa.unshift(0);

		// Convert to BigIntegers
		var x = new BigInteger(xBa);
		var y = new BigInteger(yBa);

		// Return point
		return new ECPointFp(curve, curve.fromBigInteger(x), curve.fromBigInteger(y));
	};

	/*
	 * @since ec-patch.js 1.0.1
	 */
	ECPointFp.decodeFromHex = function(curve, encHex) {
		var type = encHex.substr(0, 2); // shall be "04"
		var dataLen = encHex.length - 2;

		// Extract x and y as byte arrays
		var xHex = encHex.substr(2, dataLen / 2);
		var yHex = encHex.substr(2 + dataLen / 2, dataLen / 2);

		// Convert to BigIntegers
		var x = new BigInteger(xHex, 16);
		var y = new BigInteger(yHex, 16);

		// Return point
		return new ECPointFp(curve, curve.fromBigInteger(x), curve.fromBigInteger(y));
	};

	ECPointFp.prototype.add2D = function(b) {
		if (this.isInfinity()) return b;
		if (b.isInfinity()) return this;

		if (this.x.equals(b.x)) {
			if (this.y.equals(b.y)) {
				// this = b, i.e. this must be doubled
				return this.twice();
			}
			// this = -b, i.e. the result is the point at infinity
			return this.curve.getInfinity();
		}

		var x_x = b.x.subtract(this.x);
		var y_y = b.y.subtract(this.y);
		var gamma = y_y.divide(x_x);

		var x3 = gamma.square().subtract(this.x).subtract(b.x);
		var y3 = gamma.multiply(this.x.subtract(x3)).subtract(this.y);

		return new ECPointFp(this.curve, x3, y3);
	};

	ECPointFp.prototype.twice2D = function() {
		if (this.isInfinity()) return this;
		if (this.y.toBigInteger().signum() == 0) {
			// if y1 == 0, then (x1, y1) == (x1, -y1)
			// and hence this = -this and thus 2(x1, y1) == infinity
			return this.curve.getInfinity();
		}

		var TWO = this.curve.fromBigInteger(BigInteger.valueOf(2));
		var THREE = this.curve.fromBigInteger(BigInteger.valueOf(3));
		var gamma = this.x.square().multiply(THREE).add(this.curve.a).divide(this.y.multiply(TWO));

		var x3 = gamma.square().subtract(this.x.multiply(TWO));
		var y3 = gamma.multiply(this.x.subtract(x3)).subtract(this.y);

		return new ECPointFp(this.curve, x3, y3);
	};

	ECPointFp.prototype.multiply2D = function(k) {
		if (this.isInfinity()) return this;
		if (k.signum() == 0) return this.curve.getInfinity();

		var e = k;
		var h = e.multiply(new BigInteger("3"));

		var neg = this.negate();
		var R = this;

		var i;
		for (i = h.bitLength() - 2; i > 0; --i) {
			R = R.twice();

			var hBit = h.testBit(i);
			var eBit = e.testBit(i);

			if (hBit != eBit) {
				R = R.add2D(hBit ? this : neg);
			}
		}

		return R;
	};

	ECPointFp.prototype.isOnCurve = function() {
		var x = this.getX().toBigInteger();
		var y = this.getY().toBigInteger();
		var a = this.curve.getA().toBigInteger();
		var b = this.curve.getB().toBigInteger();
		var n = this.curve.getQ();
		var lhs = y.multiply(y).mod(n);
		var rhs = x.multiply(x).multiply(x)
			.add(a.multiply(x)).add(b).mod(n);
		return lhs.equals(rhs);
	};

	ECPointFp.prototype.toString = function() {
		return '(' + this.getX().toBigInteger().toString() + ',' +
			this.getY().toBigInteger().toString() + ')';
	};

	/**
	 * Validate an elliptic curve point.
	 *
	 * See SEC 1, section 3.2.2.1: Elliptic Curve Public Key Validation Primitive
	 */
	ECPointFp.prototype.validate = function() {
		var n = this.curve.getQ();

		// Check Q != O
		if (this.isInfinity()) {
			throw new Error("Point is at infinity.");
		}

		// Check coordinate bounds
		var x = this.getX().toBigInteger();
		var y = this.getY().toBigInteger();
		if (x.compareTo(BigInteger.ONE) < 0 ||
			x.compareTo(n.subtract(BigInteger.ONE)) > 0) {
			throw new Error('x coordinate out of bounds');
		}
		if (y.compareTo(BigInteger.ONE) < 0 ||
			y.compareTo(n.subtract(BigInteger.ONE)) > 0) {
			throw new Error('y coordinate out of bounds');
		}

		// Check y^2 = x^3 + ax + b (mod n)
		if (!this.isOnCurve()) {
			throw new Error("Point is not on the curve.");
		}

		// Check nQ = 0 (Q is a scalar multiple of G)
		if (this.multiply(n).isInfinity()) {
			// TODO: This check doesn't work - fix.
			throw new Error("Point is not a scalar multiple of G.");
		}

		return true;
	};

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	(function() {
		// Shortcuts
		var C = CryptoJS;
		var C_lib = C.lib;
		var Base = C_lib.Base;
		var C_enc = C.enc;
		var Utf8 = C_enc.Utf8;
		var C_algo = C.algo;

		/**
		 * HMAC algorithm.
		 */
		var HMAC = C_algo.HMAC = Base.extend({
			/**
			 * Initializes a newly created HMAC.
			 *
			 * @param {Hasher} hasher The hash algorithm to use.
			 * @param {WordArray|string} key The secret key.
			 *
			 * @example
			 *
			 *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
			 */
			init: function(hasher, key) {
				// Init hasher
				hasher = this._hasher = new hasher.init();

				// Convert string to WordArray, else assume WordArray already
				if (typeof key == 'string') {
					key = Utf8.parse(key);
				}

				// Shortcuts
				var hasherBlockSize = hasher.blockSize;
				var hasherBlockSizeBytes = hasherBlockSize * 4;

				// Allow arbitrary length keys
				if (key.sigBytes > hasherBlockSizeBytes) {
					key = hasher.finalize(key);
				}

				// Clamp excess bits
				key.clamp();

				// Clone key for inner and outer pads
				var oKey = this._oKey = key.clone();
				var iKey = this._iKey = key.clone();

				// Shortcuts
				var oKeyWords = oKey.words;
				var iKeyWords = iKey.words;

				// XOR keys with pad constants
				for (var i = 0; i < hasherBlockSize; i++) {
					oKeyWords[i] ^= 0x5c5c5c5c;
					iKeyWords[i] ^= 0x36363636;
				}
				oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;

				// Set initial values
				this.reset();
			},

			/**
			 * Resets this HMAC to its initial state.
			 *
			 * @example
			 *
			 *     hmacHasher.reset();
			 */
			reset: function() {
				// Shortcut
				var hasher = this._hasher;

				// Reset
				hasher.reset();
				hasher.update(this._iKey);
			},

			/**
			 * Updates this HMAC with a message.
			 *
			 * @param {WordArray|string} messageUpdate The message to append.
			 *
			 * @return {HMAC} This HMAC instance.
			 *
			 * @example
			 *
			 *     hmacHasher.update('message');
			 *     hmacHasher.update(wordArray);
			 */
			update: function(messageUpdate) {
				this._hasher.update(messageUpdate);

				// Chainable
				return this;
			},

			/**
			 * Finalizes the HMAC computation.
			 * Note that the finalize operation is effectively a destructive, read-once operation.
			 *
			 * @param {WordArray|string} messageUpdate (Optional) A final message update.
			 *
			 * @return {WordArray} The HMAC.
			 *
			 * @example
			 *
			 *     var hmac = hmacHasher.finalize();
			 *     var hmac = hmacHasher.finalize('message');
			 *     var hmac = hmacHasher.finalize(wordArray);
			 */
			finalize: function(messageUpdate) {
				// Shortcut
				var hasher = this._hasher;

				// Compute HMAC
				var innerHash = hasher.finalize(messageUpdate);
				hasher.reset();
				var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));

				return hmac;
			}
		});
	}());

	/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
	 */
	// Copyright (c) 2005  Tom Wu
	// All Rights Reserved.
	// See "LICENSE" for details.

	// Basic JavaScript BN library - subset useful for RSA encryption.

	// Bits per digit
	var dbits;

	// JavaScript engine analysis
	var canary = 0xdeadbeefcafe;
	var j_lm = ((canary & 0xffffff) == 0xefcafe);

	// (public) Constructor
	function BigInteger(a, b, c) {
		if (a != null)
			if ("number" == typeof a) this.fromNumber(a, b, c);
			else if (b == null && "string" != typeof a) this.fromString(a, 256);
		else this.fromString(a, b);
	}

	// return new, unset BigInteger
	function nbi() {
		return new BigInteger(null);
	}

	// am: Compute w_j += (x*this_i), propagate carries,
	// c is initial carry, returns final carry.
	// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
	// We need to select the fastest one that works in this environment.

	// am1: use a single mult and divide to get the high bits,
	// max digit bits should be 26 because
	// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
	function am1(i, x, w, j, c, n) {
		while (--n >= 0) {
			var v = x * this[i++] + w[j] + c;
			c = Math.floor(v / 0x4000000);
			w[j++] = v & 0x3ffffff;
		}
		return c;
	}
	// am2 avoids a big mult-and-extract completely.
	// Max digit bits should be <= 30 because we do bitwise ops
	// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
	function am2(i, x, w, j, c, n) {
		var xl = x & 0x7fff,
			xh = x >> 15;
		while (--n >= 0) {
			var l = this[i] & 0x7fff;
			var h = this[i++] >> 15;
			var m = xh * l + h * xl;
			l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
			c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
			w[j++] = l & 0x3fffffff;
		}
		return c;
	}
	// Alternately, set max digit bits to 28 since some
	// browsers slow down when dealing with 32-bit numbers.
	function am3(i, x, w, j, c, n) {
		var xl = x & 0x3fff,
			xh = x >> 14;
		while (--n >= 0) {
			var l = this[i] & 0x3fff;
			var h = this[i++] >> 14;
			var m = xh * l + h * xl;
			l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
			c = (l >> 28) + (m >> 14) + xh * h;
			w[j++] = l & 0xfffffff;
		}
		return c;
	}
	if (j_lm && (navigator && navigator.appName == "Microsoft Internet Explorer")) {
		BigInteger.prototype.am = am2;
		dbits = 30;
	} else if (j_lm && (navigator && navigator.appName != "Netscape")) {
		BigInteger.prototype.am = am1;
		dbits = 26;
	} else { // Mozilla/Netscape seems to prefer am3
		BigInteger.prototype.am = am3;
		dbits = 28;
	}

	BigInteger.prototype.DB = dbits;
	BigInteger.prototype.DM = ((1 << dbits) - 1);
	BigInteger.prototype.DV = (1 << dbits);

	var BI_FP = 52;
	BigInteger.prototype.FV = Math.pow(2, BI_FP);
	BigInteger.prototype.F1 = BI_FP - dbits;
	BigInteger.prototype.F2 = 2 * dbits - BI_FP;

	// Digit conversions
	var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
	var BI_RC = new Array();
	var rr, vv;
	rr = "0".charCodeAt(0);
	for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
	rr = "a".charCodeAt(0);
	for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
	rr = "A".charCodeAt(0);
	for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

	function int2char(n) {
		return BI_RM.charAt(n);
	}

	function intAt(s, i) {
		var c = BI_RC[s.charCodeAt(i)];
		return (c == null) ? -1 : c;
	}

	// (protected) copy this to r
	function bnpCopyTo(r) {
		for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
		r.t = this.t;
		r.s = this.s;
	}

	// (protected) set from integer value x, -DV <= x < DV
	function bnpFromInt(x) {
		this.t = 1;
		this.s = (x < 0) ? -1 : 0;
		if (x > 0) this[0] = x;
		else if (x < -1) this[0] = x + this.DV;
		else this.t = 0;
	}

	// return bigint initialized to value
	function nbv(i) {
		var r = nbi();
		r.fromInt(i);
		return r;
	}

	// (protected) set from string and radix
	function bnpFromString(s, b) {
		var k;
		if (b == 16) k = 4;
		else if (b == 8) k = 3;
		else if (b == 256) k = 8; // byte array
		else if (b == 2) k = 1;
		else if (b == 32) k = 5;
		else if (b == 4) k = 2;
		else {
			this.fromRadix(s, b);
			return;
		}
		this.t = 0;
		this.s = 0;
		var i = s.length,
			mi = false,
			sh = 0;
		while (--i >= 0) {
			var x = (k == 8) ? s[i] & 0xff : intAt(s, i);
			if (x < 0) {
				if (s.charAt(i) == "-") mi = true;
				continue;
			}
			mi = false;
			if (sh == 0)
				this[this.t++] = x;
			else if (sh + k > this.DB) {
				this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
				this[this.t++] = (x >> (this.DB - sh));
			} else
				this[this.t - 1] |= x << sh;
			sh += k;
			if (sh >= this.DB) sh -= this.DB;
		}
		if (k == 8 && (s[0] & 0x80) != 0) {
			this.s = -1;
			if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
		}
		this.clamp();
		if (mi) BigInteger.ZERO.subTo(this, this);
	}

	// (protected) clamp off excess high words
	function bnpClamp() {
		var c = this.s & this.DM;
		while (this.t > 0 && this[this.t - 1] == c) --this.t;
	}

	// (public) return string representation in given radix
	function bnToString(b) {
		if (this.s < 0) return "-" + this.negate().toString(b);
		var k;
		if (b == 16) k = 4;
		else if (b == 8) k = 3;
		else if (b == 2) k = 1;
		else if (b == 32) k = 5;
		else if (b == 4) k = 2;
		else return this.toRadix(b);
		var km = (1 << k) - 1,
			d, m = false,
			r = "",
			i = this.t;
		var p = this.DB - (i * this.DB) % k;
		if (i-- > 0) {
			if (p < this.DB && (d = this[i] >> p) > 0) {
				m = true;
				r = int2char(d);
			}
			while (i >= 0) {
				if (p < k) {
					d = (this[i] & ((1 << p) - 1)) << (k - p);
					d |= this[--i] >> (p += this.DB - k);
				} else {
					d = (this[i] >> (p -= k)) & km;
					if (p <= 0) {
						p += this.DB;
						--i;
					}
				}
				if (d > 0) m = true;
				if (m) r += int2char(d);
			}
		}
		return m ? r : "0";
	}

	// (public) -this
	function bnNegate() {
		var r = nbi();
		BigInteger.ZERO.subTo(this, r);
		return r;
	}

	// (public) |this|
	function bnAbs() {
		return (this.s < 0) ? this.negate() : this;
	}

	// (public) return + if this > a, - if this < a, 0 if equal
	function bnCompareTo(a) {
		var r = this.s - a.s;
		if (r != 0) return r;
		var i = this.t;
		r = i - a.t;
		if (r != 0) return (this.s < 0) ? -r : r;
		while (--i >= 0)
			if ((r = this[i] - a[i]) != 0) return r;
		return 0;
	}

	// returns bit length of the integer x
	function nbits(x) {
		var r = 1,
			t;
		if ((t = x >>> 16) != 0) {
			x = t;
			r += 16;
		}
		if ((t = x >> 8) != 0) {
			x = t;
			r += 8;
		}
		if ((t = x >> 4) != 0) {
			x = t;
			r += 4;
		}
		if ((t = x >> 2) != 0) {
			x = t;
			r += 2;
		}
		if ((t = x >> 1) != 0) {
			x = t;
			r += 1;
		}
		return r;
	}

	// (public) return the number of bits in "this"
	function bnBitLength() {
		if (this.t <= 0) return 0;
		return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
	}

	// (protected) r = this << n*DB
	function bnpDLShiftTo(n, r) {
		var i;
		for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
		for (i = n - 1; i >= 0; --i) r[i] = 0;
		r.t = this.t + n;
		r.s = this.s;
	}

	// (protected) r = this >> n*DB
	function bnpDRShiftTo(n, r) {
		for (var i = n; i < this.t; ++i) r[i - n] = this[i];
		r.t = Math.max(this.t - n, 0);
		r.s = this.s;
	}

	// (protected) r = this << n
	function bnpLShiftTo(n, r) {
		var bs = n % this.DB;
		var cbs = this.DB - bs;
		var bm = (1 << cbs) - 1;
		var ds = Math.floor(n / this.DB),
			c = (this.s << bs) & this.DM,
			i;
		for (i = this.t - 1; i >= 0; --i) {
			r[i + ds + 1] = (this[i] >> cbs) | c;
			c = (this[i] & bm) << bs;
		}
		for (i = ds - 1; i >= 0; --i) r[i] = 0;
		r[ds] = c;
		r.t = this.t + ds + 1;
		r.s = this.s;
		r.clamp();
	}

	// (protected) r = this >> n
	function bnpRShiftTo(n, r) {
		r.s = this.s;
		var ds = Math.floor(n / this.DB);
		if (ds >= this.t) {
			r.t = 0;
			return;
		}
		var bs = n % this.DB;
		var cbs = this.DB - bs;
		var bm = (1 << bs) - 1;
		r[0] = this[ds] >> bs;
		for (var i = ds + 1; i < this.t; ++i) {
			r[i - ds - 1] |= (this[i] & bm) << cbs;
			r[i - ds] = this[i] >> bs;
		}
		if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
		r.t = this.t - ds;
		r.clamp();
	}

	// (protected) r = this - a
	function bnpSubTo(a, r) {
		var i = 0,
			c = 0,
			m = Math.min(a.t, this.t);
		while (i < m) {
			c += this[i] - a[i];
			r[i++] = c & this.DM;
			c >>= this.DB;
		}
		if (a.t < this.t) {
			c -= a.s;
			while (i < this.t) {
				c += this[i];
				r[i++] = c & this.DM;
				c >>= this.DB;
			}
			c += this.s;
		} else {
			c += this.s;
			while (i < a.t) {
				c -= a[i];
				r[i++] = c & this.DM;
				c >>= this.DB;
			}
			c -= a.s;
		}
		r.s = (c < 0) ? -1 : 0;
		if (c < -1) r[i++] = this.DV + c;
		else if (c > 0) r[i++] = c;
		r.t = i;
		r.clamp();
	}

	// (protected) r = this * a, r != this,a (HAC 14.12)
	// "this" should be the larger one if appropriate.
	function bnpMultiplyTo(a, r) {
		var x = this.abs(),
			y = a.abs();
		var i = x.t;
		r.t = i + y.t;
		while (--i >= 0) r[i] = 0;
		for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
		r.s = 0;
		r.clamp();
		if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
	}

	// (protected) r = this^2, r != this (HAC 14.16)
	function bnpSquareTo(r) {
		var x = this.abs();
		var i = r.t = 2 * x.t;
		while (--i >= 0) r[i] = 0;
		for (i = 0; i < x.t - 1; ++i) {
			var c = x.am(i, x[i], r, 2 * i, 0, 1);
			if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
				r[i + x.t] -= x.DV;
				r[i + x.t + 1] = 1;
			}
		}
		if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
		r.s = 0;
		r.clamp();
	}

	// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
	// r != q, this != m.  q or r may be null.
	function bnpDivRemTo(m, q, r) {
		var pm = m.abs();
		if (pm.t <= 0) return;
		var pt = this.abs();
		if (pt.t < pm.t) {
			if (q != null) q.fromInt(0);
			if (r != null) this.copyTo(r);
			return;
		}
		if (r == null) r = nbi();
		var y = nbi(),
			ts = this.s,
			ms = m.s;
		var nsh = this.DB - nbits(pm[pm.t - 1]); // normalize modulus
		if (nsh > 0) {
			pm.lShiftTo(nsh, y);
			pt.lShiftTo(nsh, r);
		} else {
			pm.copyTo(y);
			pt.copyTo(r);
		}
		var ys = y.t;
		var y0 = y[ys - 1];
		if (y0 == 0) return;
		var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0);
		var d1 = this.FV / yt,
			d2 = (1 << this.F1) / yt,
			e = 1 << this.F2;
		var i = r.t,
			j = i - ys,
			t = (q == null) ? nbi() : q;
		y.dlShiftTo(j, t);
		if (r.compareTo(t) >= 0) {
			r[r.t++] = 1;
			r.subTo(t, r);
		}
		BigInteger.ONE.dlShiftTo(ys, t);
		t.subTo(y, y); // "negative" y so we can replace sub with am later
		while (y.t < ys) y[y.t++] = 0;
		while (--j >= 0) {
			// Estimate quotient digit
			var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
			if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) { // Try it out
				y.dlShiftTo(j, t);
				r.subTo(t, r);
				while (r[i] < --qd) r.subTo(t, r);
			}
		}
		if (q != null) {
			r.drShiftTo(ys, q);
			if (ts != ms) BigInteger.ZERO.subTo(q, q);
		}
		r.t = ys;
		r.clamp();
		if (nsh > 0) r.rShiftTo(nsh, r); // Denormalize remainder
		if (ts < 0) BigInteger.ZERO.subTo(r, r);
	}

	// (public) this mod a
	function bnMod(a) {
		var r = nbi();
		this.abs().divRemTo(a, null, r);
		if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
		return r;
	}

	// Modular reduction using "classic" algorithm
	function Classic(m) {
		this.m = m;
	}

	function cConvert(x) {
		if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
		else return x;
	}

	function cRevert(x) {
		return x;
	}

	function cReduce(x) {
		x.divRemTo(this.m, null, x);
	}

	function cMulTo(x, y, r) {
		x.multiplyTo(y, r);
		this.reduce(r);
	}

	function cSqrTo(x, r) {
		x.squareTo(r);
		this.reduce(r);
	}

	Classic.prototype.convert = cConvert;
	Classic.prototype.revert = cRevert;
	Classic.prototype.reduce = cReduce;
	Classic.prototype.mulTo = cMulTo;
	Classic.prototype.sqrTo = cSqrTo;

	// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
	// justification:
	//			         xy == 1 (mod m)
	//			         xy =  1+km
	//   xy(2-xy) = (1+km)(1-km)
	// x[y(2-xy)] = 1-k^2m^2
	// x[y(2-xy)] == 1 (mod m^2)
	// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
	// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
	// JS multiply "overflows" differently from C/C++, so care is needed here.
	function bnpInvDigit() {
		if (this.t < 1) return 0;
		var x = this[0];
		if ((x & 1) == 0) return 0;
		var y = x & 3; // y == 1/x mod 2^2
		y = (y * (2 - (x & 0xf) * y)) & 0xf; // y == 1/x mod 2^4
		y = (y * (2 - (x & 0xff) * y)) & 0xff; // y == 1/x mod 2^8
		y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff; // y == 1/x mod 2^16
		// last step - calculate inverse mod DV directly;
		// assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
		y = (y * (2 - x * y % this.DV)) % this.DV; // y == 1/x mod 2^dbits
		// we really want the negative inverse, and -DV < y < DV
		return (y > 0) ? this.DV - y : -y;
	}

	// Montgomery reduction
	function Montgomery(m) {
		this.m = m;
		this.mp = m.invDigit();
		this.mpl = this.mp & 0x7fff;
		this.mph = this.mp >> 15;
		this.um = (1 << (m.DB - 15)) - 1;
		this.mt2 = 2 * m.t;
	}

	// xR mod m
	function montConvert(x) {
		var r = nbi();
		x.abs().dlShiftTo(this.m.t, r);
		r.divRemTo(this.m, null, r);
		if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
		return r;
	}

	// x/R mod m
	function montRevert(x) {
		var r = nbi();
		x.copyTo(r);
		this.reduce(r);
		return r;
	}

	// x = x/R mod m (HAC 14.32)
	function montReduce(x) {
		while (x.t <= this.mt2) // pad x so am has enough room later
			x[x.t++] = 0;
		for (var i = 0; i < this.m.t; ++i) {
			// faster way of calculating u0 = x[i]*mp mod DV
			var j = x[i] & 0x7fff;
			var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM;
			// use am to combine the multiply-shift-add into one call
			j = i + this.m.t;
			x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
			// propagate carry
			while (x[j] >= x.DV) {
				x[j] -= x.DV;
				x[++j]++;
			}
		}
		x.clamp();
		x.drShiftTo(this.m.t, x);
		if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
	}

	// r = "x^2/R mod m"; x != r
	function montSqrTo(x, r) {
		x.squareTo(r);
		this.reduce(r);
	}

	// r = "xy/R mod m"; x,y != r
	function montMulTo(x, y, r) {
		x.multiplyTo(y, r);
		this.reduce(r);
	}

	Montgomery.prototype.convert = montConvert;
	Montgomery.prototype.revert = montRevert;
	Montgomery.prototype.reduce = montReduce;
	Montgomery.prototype.mulTo = montMulTo;
	Montgomery.prototype.sqrTo = montSqrTo;

	// (protected) true iff this is even
	function bnpIsEven() {
		return ((this.t > 0) ? (this[0] & 1) : this.s) == 0;
	}

	// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
	function bnpExp(e, z) {
		if (e > 0xffffffff || e < 1) return BigInteger.ONE;
		var r = nbi(),
			r2 = nbi(),
			g = z.convert(this),
			i = nbits(e) - 1;
		g.copyTo(r);
		while (--i >= 0) {
			z.sqrTo(r, r2);
			if ((e & (1 << i)) > 0) z.mulTo(r2, g, r);
			else {
				var t = r;
				r = r2;
				r2 = t;
			}
		}
		return z.revert(r);
	}

	// (public) this^e % m, 0 <= e < 2^32
	function bnModPowInt(e, m) {
		var z;
		if (e < 256 || m.isEven()) z = new Classic(m);
		else z = new Montgomery(m);
		return this.exp(e, z);
	}

	// protected
	BigInteger.prototype.copyTo = bnpCopyTo;
	BigInteger.prototype.fromInt = bnpFromInt;
	BigInteger.prototype.fromString = bnpFromString;
	BigInteger.prototype.clamp = bnpClamp;
	BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
	BigInteger.prototype.drShiftTo = bnpDRShiftTo;
	BigInteger.prototype.lShiftTo = bnpLShiftTo;
	BigInteger.prototype.rShiftTo = bnpRShiftTo;
	BigInteger.prototype.subTo = bnpSubTo;
	BigInteger.prototype.multiplyTo = bnpMultiplyTo;
	BigInteger.prototype.squareTo = bnpSquareTo;
	BigInteger.prototype.divRemTo = bnpDivRemTo;
	BigInteger.prototype.invDigit = bnpInvDigit;
	BigInteger.prototype.isEven = bnpIsEven;
	BigInteger.prototype.exp = bnpExp;

	// public
	BigInteger.prototype.toString = bnToString;
	BigInteger.prototype.negate = bnNegate;
	BigInteger.prototype.abs = bnAbs;
	BigInteger.prototype.compareTo = bnCompareTo;
	BigInteger.prototype.bitLength = bnBitLength;
	BigInteger.prototype.mod = bnMod;
	BigInteger.prototype.modPowInt = bnModPowInt;

	// "constants"
	BigInteger.ZERO = nbv(0);
	BigInteger.ONE = nbv(1);

	/*! (c) Tom Wu | http://www-cs-students.stanford.edu/~tjw/jsbn/
	 */
	// Copyright (c) 2005-2009  Tom Wu
	// All Rights Reserved.
	// See "LICENSE" for details.

	// Extended JavaScript BN functions, required for RSA private ops.

	// Version 1.1: new BigInteger("0", 10) returns "proper" zero
	// Version 1.2: square() API, isProbablePrime fix

	// (public)
	function bnClone() {
		var r = nbi();
		this.copyTo(r);
		return r;
	}

	// (public) return value as integer
	function bnIntValue() {
		if (this.s < 0) {
			if (this.t == 1) return this[0] - this.DV;
			else if (this.t == 0) return -1;
		} else if (this.t == 1) return this[0];
		else if (this.t == 0) return 0;
		// assumes 16 < DB < 32
		return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
	}

	// (public) return value as byte
	function bnByteValue() {
		return (this.t == 0) ? this.s : (this[0] << 24) >> 24;
	}

	// (public) return value as short (assumes DB>=16)
	function bnShortValue() {
		return (this.t == 0) ? this.s : (this[0] << 16) >> 16;
	}

	// (protected) return x s.t. r^x < DV
	function bnpChunkSize(r) {
		return Math.floor(Math.LN2 * this.DB / Math.log(r));
	}

	// (public) 0 if this == 0, 1 if this > 0
	function bnSigNum() {
		if (this.s < 0) return -1;
		else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
		else return 1;
	}

	// (protected) convert to radix string
	function bnpToRadix(b) {
		if (b == null) b = 10;
		if (this.signum() == 0 || b < 2 || b > 36) return "0";
		var cs = this.chunkSize(b);
		var a = Math.pow(b, cs);
		var d = nbv(a),
			y = nbi(),
			z = nbi(),
			r = "";
		this.divRemTo(d, y, z);
		while (y.signum() > 0) {
			r = (a + z.intValue()).toString(b).substr(1) + r;
			y.divRemTo(d, y, z);
		}
		return z.intValue().toString(b) + r;
	}

	// (protected) convert from radix string
	function bnpFromRadix(s, b) {
		this.fromInt(0);
		if (b == null) b = 10;
		var cs = this.chunkSize(b);
		var d = Math.pow(b, cs),
			mi = false,
			j = 0,
			w = 0;
		for (var i = 0; i < s.length; ++i) {
			var x = intAt(s, i);
			if (x < 0) {
				if (s.charAt(i) == "-" && this.signum() == 0) mi = true;
				continue;
			}
			w = b * w + x;
			if (++j >= cs) {
				this.dMultiply(d);
				this.dAddOffset(w, 0);
				j = 0;
				w = 0;
			}
		}
		if (j > 0) {
			this.dMultiply(Math.pow(b, j));
			this.dAddOffset(w, 0);
		}
		if (mi) BigInteger.ZERO.subTo(this, this);
	}

	// (protected) alternate constructor
	function bnpFromNumber(a, b, c) {
		if ("number" == typeof b) {
			// new BigInteger(int,int,RNG)
			if (a < 2) this.fromInt(1);
			else {
				this.fromNumber(a, c);
				if (!this.testBit(a - 1)) // force MSB set
					this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
				if (this.isEven()) this.dAddOffset(1, 0); // force odd
				while (!this.isProbablePrime(b)) {
					this.dAddOffset(2, 0);
					if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
				}
			}
		} else {
			// new BigInteger(int,RNG)
			var x = new Array(),
				t = a & 7;
			x.length = (a >> 3) + 1;
			b.nextBytes(x);
			if (t > 0) x[0] &= ((1 << t) - 1);
			else x[0] = 0;
			this.fromString(x, 256);
		}
	}

	// (public) convert to bigendian byte array
	function bnToByteArray() {
		var i = this.t,
			r = new Array();
		r[0] = this.s;
		var p = this.DB - (i * this.DB) % 8,
			d, k = 0;
		if (i-- > 0) {
			if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p)
				r[k++] = d | (this.s << (this.DB - p));
			while (i >= 0) {
				if (p < 8) {
					d = (this[i] & ((1 << p) - 1)) << (8 - p);
					d |= this[--i] >> (p += this.DB - 8);
				} else {
					d = (this[i] >> (p -= 8)) & 0xff;
					if (p <= 0) {
						p += this.DB;
						--i;
					}
				}
				if ((d & 0x80) != 0) d |= -256;
				if (k == 0 && (this.s & 0x80) != (d & 0x80)) ++k;
				if (k > 0 || d != this.s) r[k++] = d;
			}
		}
		return r;
	}

	function bnEquals(a) {
		return (this.compareTo(a) == 0);
	}

	function bnMin(a) {
		return (this.compareTo(a) < 0) ? this : a;
	}

	function bnMax(a) {
		return (this.compareTo(a) > 0) ? this : a;
	}

	// (protected) r = this op a (bitwise)
	function bnpBitwiseTo(a, op, r) {
		var i, f, m = Math.min(a.t, this.t);
		for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
		if (a.t < this.t) {
			f = a.s & this.DM;
			for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
			r.t = this.t;
		} else {
			f = this.s & this.DM;
			for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
			r.t = a.t;
		}
		r.s = op(this.s, a.s);
		r.clamp();
	}

	// (public) this & a
	function op_and(x, y) {
		return x & y;
	}

	function bnAnd(a) {
		var r = nbi();
		this.bitwiseTo(a, op_and, r);
		return r;
	}

	// (public) this | a
	function op_or(x, y) {
		return x | y;
	}

	function bnOr(a) {
		var r = nbi();
		this.bitwiseTo(a, op_or, r);
		return r;
	}

	// (public) this ^ a
	function op_xor(x, y) {
		return x ^ y;
	}

	function bnXor(a) {
		var r = nbi();
		this.bitwiseTo(a, op_xor, r);
		return r;
	}

	// (public) this & ~a
	function op_andnot(x, y) {
		return x & ~y;
	}

	function bnAndNot(a) {
		var r = nbi();
		this.bitwiseTo(a, op_andnot, r);
		return r;
	}

	// (public) ~this
	function bnNot() {
		var r = nbi();
		for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
		r.t = this.t;
		r.s = ~this.s;
		return r;
	}

	// (public) this << n
	function bnShiftLeft(n) {
		var r = nbi();
		if (n < 0) this.rShiftTo(-n, r);
		else this.lShiftTo(n, r);
		return r;
	}

	// (public) this >> n
	function bnShiftRight(n) {
		var r = nbi();
		if (n < 0) this.lShiftTo(-n, r);
		else this.rShiftTo(n, r);
		return r;
	}

	// return index of lowest 1-bit in x, x < 2^31
	function lbit(x) {
		if (x == 0) return -1;
		var r = 0;
		if ((x & 0xffff) == 0) {
			x >>= 16;
			r += 16;
		}
		if ((x & 0xff) == 0) {
			x >>= 8;
			r += 8;
		}
		if ((x & 0xf) == 0) {
			x >>= 4;
			r += 4;
		}
		if ((x & 3) == 0) {
			x >>= 2;
			r += 2;
		}
		if ((x & 1) == 0) ++r;
		return r;
	}

	// (public) returns index of lowest 1-bit (or -1 if none)
	function bnGetLowestSetBit() {
		for (var i = 0; i < this.t; ++i)
			if (this[i] != 0) return i * this.DB + lbit(this[i]);
		if (this.s < 0) return this.t * this.DB;
		return -1;
	}

	// return number of 1 bits in x
	function cbit(x) {
		var r = 0;
		while (x != 0) {
			x &= x - 1;
			++r;
		}
		return r;
	}

	// (public) return number of set bits
	function bnBitCount() {
		var r = 0,
			x = this.s & this.DM;
		for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
		return r;
	}

	// (public) true iff nth bit is set
	function bnTestBit(n) {
		var j = Math.floor(n / this.DB);
		if (j >= this.t) return (this.s != 0);
		return ((this[j] & (1 << (n % this.DB))) != 0);
	}

	// (protected) this op (1<<n)
	function bnpChangeBit(n, op) {
		var r = BigInteger.ONE.shiftLeft(n);
		this.bitwiseTo(r, op, r);
		return r;
	}

	// (public) this | (1<<n)
	function bnSetBit(n) {
		return this.changeBit(n, op_or);
	}

	// (public) this & ~(1<<n)
	function bnClearBit(n) {
		return this.changeBit(n, op_andnot);
	}

	// (public) this ^ (1<<n)
	function bnFlipBit(n) {
		return this.changeBit(n, op_xor);
	}

	// (protected) r = this + a
	function bnpAddTo(a, r) {
		var i = 0,
			c = 0,
			m = Math.min(a.t, this.t);
		while (i < m) {
			c += this[i] + a[i];
			r[i++] = c & this.DM;
			c >>= this.DB;
		}
		if (a.t < this.t) {
			c += a.s;
			while (i < this.t) {
				c += this[i];
				r[i++] = c & this.DM;
				c >>= this.DB;
			}
			c += this.s;
		} else {
			c += this.s;
			while (i < a.t) {
				c += a[i];
				r[i++] = c & this.DM;
				c >>= this.DB;
			}
			c += a.s;
		}
		r.s = (c < 0) ? -1 : 0;
		if (c > 0) r[i++] = c;
		else if (c < -1) r[i++] = this.DV + c;
		r.t = i;
		r.clamp();
	}

	// (public) this + a
	function bnAdd(a) {
		var r = nbi();
		this.addTo(a, r);
		return r;
	}

	// (public) this - a
	function bnSubtract(a) {
		var r = nbi();
		this.subTo(a, r);
		return r;
	}

	// (public) this * a
	function bnMultiply(a) {
		var r = nbi();
		this.multiplyTo(a, r);
		return r;
	}

	// (public) this^2
	function bnSquare() {
		var r = nbi();
		this.squareTo(r);
		return r;
	}

	// (public) this / a
	function bnDivide(a) {
		var r = nbi();
		this.divRemTo(a, r, null);
		return r;
	}

	// (public) this % a
	function bnRemainder(a) {
		var r = nbi();
		this.divRemTo(a, null, r);
		return r;
	}

	// (public) [this/a,this%a]
	function bnDivideAndRemainder(a) {
		var q = nbi(),
			r = nbi();
		this.divRemTo(a, q, r);
		return new Array(q, r);
	}

	// (protected) this *= n, this >= 0, 1 < n < DV
	function bnpDMultiply(n) {
		this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
		++this.t;
		this.clamp();
	}

	// (protected) this += n << w words, this >= 0
	function bnpDAddOffset(n, w) {
		if (n == 0) return;
		while (this.t <= w) this[this.t++] = 0;
		this[w] += n;
		while (this[w] >= this.DV) {
			this[w] -= this.DV;
			if (++w >= this.t) this[this.t++] = 0;
			++this[w];
		}
	}

	// A "null" reducer
	function NullExp() {}

	function nNop(x) {
		return x;
	}

	function nMulTo(x, y, r) {
		x.multiplyTo(y, r);
	}

	function nSqrTo(x, r) {
		x.squareTo(r);
	}

	NullExp.prototype.convert = nNop;
	NullExp.prototype.revert = nNop;
	NullExp.prototype.mulTo = nMulTo;
	NullExp.prototype.sqrTo = nSqrTo;

	// (public) this^e
	function bnPow(e) {
		return this.exp(e, new NullExp());
	}

	// (protected) r = lower n words of "this * a", a.t <= n
	// "this" should be the larger one if appropriate.
	function bnpMultiplyLowerTo(a, n, r) {
		var i = Math.min(this.t + a.t, n);
		r.s = 0; // assumes a,this >= 0
		r.t = i;
		while (i > 0) r[--i] = 0;
		var j;
		for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
		for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
		r.clamp();
	}

	// (protected) r = "this * a" without lower n words, n > 0
	// "this" should be the larger one if appropriate.
	function bnpMultiplyUpperTo(a, n, r) {
		--n;
		var i = r.t = this.t + a.t - n;
		r.s = 0; // assumes a,this >= 0
		while (--i >= 0) r[i] = 0;
		for (i = Math.max(n - this.t, 0); i < a.t; ++i)
			r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
		r.clamp();
		r.drShiftTo(1, r);
	}

	// Barrett modular reduction
	function Barrett(m) {
		// setup Barrett
		this.r2 = nbi();
		this.q3 = nbi();
		BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
		this.mu = this.r2.divide(m);
		this.m = m;
	}

	function barrettConvert(x) {
		if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);
		else if (x.compareTo(this.m) < 0) return x;
		else {
			var r = nbi();
			x.copyTo(r);
			this.reduce(r);
			return r;
		}
	}

	function barrettRevert(x) {
		return x;
	}

	// x = x mod m (HAC 14.42)
	function barrettReduce(x) {
		x.drShiftTo(this.m.t - 1, this.r2);
		if (x.t > this.m.t + 1) {
			x.t = this.m.t + 1;
			x.clamp();
		}
		this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
		this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
		while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
		x.subTo(this.r2, x);
		while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
	}

	// r = x^2 mod m; x != r
	function barrettSqrTo(x, r) {
		x.squareTo(r);
		this.reduce(r);
	}

	// r = x*y mod m; x,y != r
	function barrettMulTo(x, y, r) {
		x.multiplyTo(y, r);
		this.reduce(r);
	}

	Barrett.prototype.convert = barrettConvert;
	Barrett.prototype.revert = barrettRevert;
	Barrett.prototype.reduce = barrettReduce;
	Barrett.prototype.mulTo = barrettMulTo;
	Barrett.prototype.sqrTo = barrettSqrTo;

	// (public) this^e % m (HAC 14.85)
	function bnModPow(e, m) {
		var i = e.bitLength(),
			k, r = nbv(1),
			z;
		if (i <= 0) return r;
		else if (i < 18) k = 1;
		else if (i < 48) k = 3;
		else if (i < 144) k = 4;
		else if (i < 768) k = 5;
		else k = 6;
		if (i < 8)
			z = new Classic(m);
		else if (m.isEven())
			z = new Barrett(m);
		else
			z = new Montgomery(m);

		// precomputation
		var g = new Array(),
			n = 3,
			k1 = k - 1,
			km = (1 << k) - 1;
		g[1] = z.convert(this);
		if (k > 1) {
			var g2 = nbi();
			z.sqrTo(g[1], g2);
			while (n <= km) {
				g[n] = nbi();
				z.mulTo(g2, g[n - 2], g[n]);
				n += 2;
			}
		}

		var j = e.t - 1,
			w, is1 = true,
			r2 = nbi(),
			t;
		i = nbits(e[j]) - 1;
		while (j >= 0) {
			if (i >= k1) w = (e[j] >> (i - k1)) & km;
			else {
				w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
				if (j > 0) w |= e[j - 1] >> (this.DB + i - k1);
			}

			n = k;
			while ((w & 1) == 0) {
				w >>= 1;
				--n;
			}
			if ((i -= n) < 0) {
				i += this.DB;
				--j;
			}
			if (is1) { // ret == 1, don't bother squaring or multiplying it
				g[w].copyTo(r);
				is1 = false;
			} else {
				while (n > 1) {
					z.sqrTo(r, r2);
					z.sqrTo(r2, r);
					n -= 2;
				}
				if (n > 0) z.sqrTo(r, r2);
				else {
					t = r;
					r = r2;
					r2 = t;
				}
				z.mulTo(r2, g[w], r);
			}

			while (j >= 0 && (e[j] & (1 << i)) == 0) {
				z.sqrTo(r, r2);
				t = r;
				r = r2;
				r2 = t;
				if (--i < 0) {
					i = this.DB - 1;
					--j;
				}
			}
		}
		return z.revert(r);
	}

	// (public) gcd(this,a) (HAC 14.54)
	function bnGCD(a) {
		var x = (this.s < 0) ? this.negate() : this.clone();
		var y = (a.s < 0) ? a.negate() : a.clone();
		if (x.compareTo(y) < 0) {
			var t = x;
			x = y;
			y = t;
		}
		var i = x.getLowestSetBit(),
			g = y.getLowestSetBit();
		if (g < 0) return x;
		if (i < g) g = i;
		if (g > 0) {
			x.rShiftTo(g, x);
			y.rShiftTo(g, y);
		}
		while (x.signum() > 0) {
			if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
			if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
			if (x.compareTo(y) >= 0) {
				x.subTo(y, x);
				x.rShiftTo(1, x);
			} else {
				y.subTo(x, y);
				y.rShiftTo(1, y);
			}
		}
		if (g > 0) y.lShiftTo(g, y);
		return y;
	}

	// (protected) this % n, n < 2^26
	function bnpModInt(n) {
		if (n <= 0) return 0;
		var d = this.DV % n,
			r = (this.s < 0) ? n - 1 : 0;
		if (this.t > 0)
			if (d == 0) r = this[0] % n;
			else
				for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
		return r;
	}

	// (public) 1/this % m (HAC 14.61)
	function bnModInverse(m) {
		var ac = m.isEven();
		if ((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
		var u = m.clone(),
			v = this.clone();
		var a = nbv(1),
			b = nbv(0),
			c = nbv(0),
			d = nbv(1);
		while (u.signum() != 0) {
			while (u.isEven()) {
				u.rShiftTo(1, u);
				if (ac) {
					if (!a.isEven() || !b.isEven()) {
						a.addTo(this, a);
						b.subTo(m, b);
					}
					a.rShiftTo(1, a);
				} else if (!b.isEven()) b.subTo(m, b);
				b.rShiftTo(1, b);
			}
			while (v.isEven()) {
				v.rShiftTo(1, v);
				if (ac) {
					if (!c.isEven() || !d.isEven()) {
						c.addTo(this, c);
						d.subTo(m, d);
					}
					c.rShiftTo(1, c);
				} else if (!d.isEven()) d.subTo(m, d);
				d.rShiftTo(1, d);
			}
			if (u.compareTo(v) >= 0) {
				u.subTo(v, u);
				if (ac) a.subTo(c, a);
				b.subTo(d, b);
			} else {
				v.subTo(u, v);
				if (ac) c.subTo(a, c);
				d.subTo(b, d);
			}
		}
		if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
		if (d.compareTo(m) >= 0) return d.subtract(m);
		if (d.signum() < 0) d.addTo(m, d);
		else return d;
		if (d.signum() < 0) return d.add(m);
		else return d;
	}

	var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101,
		103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227,
		229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359,
		367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499,
		503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647,
		653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811,
		821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971,
		977, 983, 991, 997
	];
	var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];

	// (public) test primality with certainty >= 1-.5^t
	function bnIsProbablePrime(t) {
		var i, x = this.abs();
		if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
			for (i = 0; i < lowprimes.length; ++i)
				if (x[0] == lowprimes[i]) return true;
			return false;
		}
		if (x.isEven()) return false;
		i = 1;
		while (i < lowprimes.length) {
			var m = lowprimes[i],
				j = i + 1;
			while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
			m = x.modInt(m);
			while (i < j)
				if (m % lowprimes[i++] == 0) return false;
		}
		return x.millerRabin(t);
	}

	// (protected) true if probably prime (HAC 4.24, Miller-Rabin)
	function bnpMillerRabin(t) {
		var n1 = this.subtract(BigInteger.ONE);
		var k = n1.getLowestSetBit();
		if (k <= 0) return false;
		var r = n1.shiftRight(k);
		t = (t + 1) >> 1;
		if (t > lowprimes.length) t = lowprimes.length;
		var a = nbi();
		for (var i = 0; i < t; ++i) {
			//Pick bases at random, instead of starting at 2
			a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
			var y = a.modPow(r, this);
			if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
				var j = 1;
				while (j++ < k && y.compareTo(n1) != 0) {
					y = y.modPowInt(2, this);
					if (y.compareTo(BigInteger.ONE) == 0) return false;
				}
				if (y.compareTo(n1) != 0) return false;
			}
		}
		return true;
	}

	// protected
	BigInteger.prototype.chunkSize = bnpChunkSize;
	BigInteger.prototype.toRadix = bnpToRadix;
	BigInteger.prototype.fromRadix = bnpFromRadix;
	BigInteger.prototype.fromNumber = bnpFromNumber;
	BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
	BigInteger.prototype.changeBit = bnpChangeBit;
	BigInteger.prototype.addTo = bnpAddTo;
	BigInteger.prototype.dMultiply = bnpDMultiply;
	BigInteger.prototype.dAddOffset = bnpDAddOffset;
	BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
	BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
	BigInteger.prototype.modInt = bnpModInt;
	BigInteger.prototype.millerRabin = bnpMillerRabin;

	// public
	BigInteger.prototype.clone = bnClone;
	BigInteger.prototype.intValue = bnIntValue;
	BigInteger.prototype.byteValue = bnByteValue;
	BigInteger.prototype.shortValue = bnShortValue;
	BigInteger.prototype.signum = bnSigNum;
	BigInteger.prototype.toByteArray = bnToByteArray;
	BigInteger.prototype.equals = bnEquals;
	BigInteger.prototype.min = bnMin;
	BigInteger.prototype.max = bnMax;
	BigInteger.prototype.and = bnAnd;
	BigInteger.prototype.or = bnOr;
	BigInteger.prototype.xor = bnXor;
	BigInteger.prototype.andNot = bnAndNot;
	BigInteger.prototype.not = bnNot;
	BigInteger.prototype.shiftLeft = bnShiftLeft;
	BigInteger.prototype.shiftRight = bnShiftRight;
	BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
	BigInteger.prototype.bitCount = bnBitCount;
	BigInteger.prototype.testBit = bnTestBit;
	BigInteger.prototype.setBit = bnSetBit;
	BigInteger.prototype.clearBit = bnClearBit;
	BigInteger.prototype.flipBit = bnFlipBit;
	BigInteger.prototype.add = bnAdd;
	BigInteger.prototype.subtract = bnSubtract;
	BigInteger.prototype.multiply = bnMultiply;
	BigInteger.prototype.divide = bnDivide;
	BigInteger.prototype.remainder = bnRemainder;
	BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
	BigInteger.prototype.modPow = bnModPow;
	BigInteger.prototype.modInverse = bnModInverse;
	BigInteger.prototype.pow = bnPow;
	BigInteger.prototype.gcd = bnGCD;
	BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

	// JSBN-specific extension
	BigInteger.prototype.square = bnSquare;

	// BigInteger interfaces not implemented in jsbn:

	// BigInteger(int signum, byte[] magnitude)
	// double doubleValue()
	// float floatValue()
	// int hashCode()
	// long longValue()
	// static BigInteger valueOf(long val)









	/*! pkcs5pkey-1.0.7.js (c) 2013-2016 Kenji Urushima | kjur.github.com/jsrsasign/license
	 */
	/*
	 * pkcs5pkey.js - reading passcode protected PKCS#5 PEM formatted RSA private key
	 *
	 * Copyright (c) 2013-2016 Kenji Urushima (kenji.urushima@gmail.com)
	 *
	 * This software is licensed under the terms of the MIT License.
	 * http://kjur.github.com/jsrsasign/license
	 *
	 * The above copyright and license notice shall be 
	 * included in all copies or substantial portions of the Software.
	 */
	/**
	 * @fileOverview
	 * @name pkcs5pkey-1.0.js
	 * @author Kenji Urushima kenji.urushima@gmail.com
	 * @version pkcs5pkey 1.0.7 (2016-Oct-08)
	 * @since jsrsasign 2.0.0
	 * @license <a href="http://kjur.github.io/jsrsasign/license/">MIT License</a>
	 */

	/**
	 * @name PKCS5PKEY
	 * @class class for PKCS#5 and PKCS#8 private key 
	 * @deprecated Since jsrsasign 4.1.3. Please use KEYUTIL class.
	 * @description 
	 * <br/>
	 * {@link PKCS5PKEY} class has following features:
	 * <ul>
	 * <li>read and parse PEM formatted encrypted PKCS#5 private key
	 * <li>generate PEM formatted encrypted PKCS#5 private key
	 * <li>read and parse PEM formatted plain PKCS#8 private key
	 * <li>read and parse PEM formatted encrypted PKCS#8 private key by PBKDF2/HmacSHA1/3DES
	 * </ul>
	 * Currently supports only RSA private key and
	 * following symmetric key algorithms to protect private key.
	 * <ul>
	 * <li>DES-EDE3-CBC</li>
	 * <li>AES-256-CBC</li>
	 * <li>AES-192-CBC</li>
	 * <li>AES-128-CBC</li>
	 * </ul>
	 * 
	 * <h5>METHOD SUMMARY</h5>
	 * <dl>
	 * <dt><b>PKCS8 PRIVATE KEY METHODS</b><dd>
	 * <ul>
	 * <li>{@link PKCS5PKEY.getRSAKeyFromPlainPKCS8PEM} - convert plain PKCS8 PEM to RSAKey object</li>
	 * <li>{@link PKCS5PKEY.getRSAKeyFromPlainPKCS8Hex} - convert plain PKCS8 hexadecimal data to RSAKey object</li>
	 * <li>{@link PKCS5PKEY.getRSAKeyFromEncryptedPKCS8PEM} - convert encrypted PKCS8 PEM to RSAKey object</li>
	 * <li>{@link PKCS5PKEY.getPlainPKCS8HexFromEncryptedPKCS8PEM} - convert encrypted PKCS8 PEM to plain PKCS8 Hex</li>
	 * </ul>
	 * <dt><b>PKCS5 PRIVATE KEY METHODS</b><dd>
	 * <ul>
	 * <li>{@link PKCS5PKEY.getRSAKeyFromEncryptedPKCS5PEM} - convert encrypted PKCS5 PEM to RSAKey object</li>
	 * <li>{@link PKCS5PKEY.getEncryptedPKCS5PEMFromRSAKey} - convert RSAKey object to encryped PKCS5 PEM</li>
	 * <li>{@link PKCS5PKEY.newEncryptedPKCS5PEM} - generate RSAKey and its encrypted PKCS5 PEM</li>
	 * </ul>
	 * <dt><b>PKCS8 PUBLIC KEY METHODS</b><dd>
	 * <ul>
	 * <li>{@link PKCS5PKEY.getKeyFromPublicPKCS8PEM} - convert encrypted PKCS8 PEM to RSAKey/ECDSA object</li>
	 * <li>{@link PKCS5PKEY.getKeyFromPublicPKCS8Hex} - convert encrypted PKCS8 Hex to RSAKey/ECDSA object</li>
	 * <li>{@link PKCS5PKEY.getRSAKeyFromPublicPKCS8PEM} - convert encrypted PKCS8 PEM to RSAKey object</li>
	 * <li>{@link PKCS5PKEY.getRSAKeyFromPublicPKCS8Hex} - convert encrypted PKCS8 Hex to RSAKey object</li>
	 * </ul>
	 * <dt><b>UTITILIY METHODS</b><dd>
	 * <ul>
	 * <li>{@link PKCS5PKEY.getHexFromPEM} - convert PEM string to hexadecimal data</li>
	 * <li>{@link PKCS5PKEY.getDecryptedKeyHexByKeyIV} - decrypt key by sharedKey and IV</li>
	 * </ul>
	 * </dl>
	 * 
	 * @example
	 * Here is an example of PEM formatted encrypted PKCS#5 private key.
	 * -----BEGIN RSA PRIVATE KEY-----
	 * Proc-Type: 4,ENCRYPTED
	 * DEK-Info: AES-256-CBC,40555967F759530864FE022E257DE34E
	 *
	 * jV7uXajRw4cccDaliagcqiLOiQEUCe19l761pXRxzgQP+DH4rCi12T4puTdZyy6l
	 *          ...(snip)...
	 * qxLS+BASmyGm4DME6m+kltZ12LXwPgNU6+d+XQ4NXSA=
	 *-----END RSA PRIVATE KEY-----
	 */
	var PKCS5PKEY = function() {
		// *****************************************************************
		// *** PRIVATE PROPERTIES AND METHODS *******************************
		// *****************************************************************
		// shared key decryption ------------------------------------------
		var decryptAES = function(dataHex, keyHex, ivHex) {
			return decryptGeneral(CryptoJS.AES, dataHex, keyHex, ivHex);
		};

		var decrypt3DES = function(dataHex, keyHex, ivHex) {
			return decryptGeneral(CryptoJS.TripleDES, dataHex, keyHex, ivHex);
		};

		var decryptGeneral = function(f, dataHex, keyHex, ivHex) {
			var data = CryptoJS.enc.Hex.parse(dataHex);
			var key = CryptoJS.enc.Hex.parse(keyHex);
			var iv = CryptoJS.enc.Hex.parse(ivHex);
			var encrypted = {};
			encrypted.key = key;
			encrypted.iv = iv;
			encrypted.ciphertext = data;
			var decrypted = f.decrypt(encrypted, key, {
				iv: iv
			});
			return CryptoJS.enc.Hex.stringify(decrypted);
		};

		// shared key decryption ------------------------------------------
		var encryptAES = function(dataHex, keyHex, ivHex) {
			return encryptGeneral(CryptoJS.AES, dataHex, keyHex, ivHex);
		};

		var encrypt3DES = function(dataHex, keyHex, ivHex) {
			return encryptGeneral(CryptoJS.TripleDES, dataHex, keyHex, ivHex);
		};

		var encryptGeneral = function(f, dataHex, keyHex, ivHex) {
			var data = CryptoJS.enc.Hex.parse(dataHex);
			var key = CryptoJS.enc.Hex.parse(keyHex);
			var iv = CryptoJS.enc.Hex.parse(ivHex);
			var msg = {};
			var encryptedHex = f.encrypt(data, key, {
				iv: iv
			});
			var encryptedWA = CryptoJS.enc.Hex.parse(encryptedHex.toString());
			var encryptedB64 = CryptoJS.enc.Base64.stringify(encryptedWA);
			return encryptedB64;
		};

		// other methods and properties ----------------------------------------
		var ALGLIST = {
			'AES-256-CBC': {
				'proc': decryptAES,
				'eproc': encryptAES,
				keylen: 32,
				ivlen: 16
			},
			'AES-192-CBC': {
				'proc': decryptAES,
				'eproc': encryptAES,
				keylen: 24,
				ivlen: 16
			},
			'AES-128-CBC': {
				'proc': decryptAES,
				'eproc': encryptAES,
				keylen: 16,
				ivlen: 16
			},
			'DES-EDE3-CBC': {
				'proc': decrypt3DES,
				'eproc': encrypt3DES,
				keylen: 24,
				ivlen: 8
			}
		};

		var getFuncByName = function(algName) {
			return ALGLIST[algName]['proc'];
		};

		var _generateIvSaltHex = function(numBytes) {
			var wa = CryptoJS.lib.WordArray.random(numBytes);
			var hex = CryptoJS.enc.Hex.stringify(wa);
			return hex;
		};

		var _parsePKCS5PEM = function(sPKCS5PEM) {
			var info = {};
			var matchResult1 = sPKCS5PEM.match(new RegExp("DEK-Info: ([^,]+),([0-9A-Fa-f]+)", "m"));
			if (matchResult1) {
				info.cipher = matchResult1[1];
				info.ivsalt = matchResult1[2];
			}
			var matchResult2 = sPKCS5PEM.match(new RegExp("-----BEGIN ([A-Z]+) PRIVATE KEY-----"));
			if (matchResult2) {
				info.type = matchResult2[1];
			}
			var i1 = -1;
			var lenNEWLINE = 0;
			if (sPKCS5PEM.indexOf("\r\n\r\n") != -1) {
				i1 = sPKCS5PEM.indexOf("\r\n\r\n");
				lenNEWLINE = 2;
			}
			if (sPKCS5PEM.indexOf("\n\n") != -1) {
				i1 = sPKCS5PEM.indexOf("\n\n");
				lenNEWLINE = 1;
			}
			var i2 = sPKCS5PEM.indexOf("-----END");
			if (i1 != -1 && i2 != -1) {
				var s = sPKCS5PEM.substring(i1 + lenNEWLINE * 2, i2 - lenNEWLINE);
				s = s.replace(/\s+/g, '');
				info.data = s;
			}
			return info;
		};

		var _getKeyAndUnusedIvByPasscodeAndIvsalt = function(algName, passcode, ivsaltHex) {
			//alert("ivsaltHex(2) = " + ivsaltHex);
			var saltHex = ivsaltHex.substring(0, 16);
			//alert("salt = " + saltHex);

			var salt = CryptoJS.enc.Hex.parse(saltHex);
			var data = CryptoJS.enc.Utf8.parse(passcode);
			//alert("salt = " + salt);
			//alert("data = " + data);

			var nRequiredBytes = ALGLIST[algName]['keylen'] + ALGLIST[algName]['ivlen'];
			var hHexValueJoined = '';
			var hLastValue = null;
			//alert("nRequiredBytes = " + nRequiredBytes);
			for (;;) {
				var h = CryptoJS.algo.MD5.create();
				if (hLastValue != null) {
					h.update(hLastValue);
				}
				h.update(data);
				h.update(salt);
				hLastValue = h.finalize();
				hHexValueJoined = hHexValueJoined + CryptoJS.enc.Hex.stringify(hLastValue);
				//alert("joined = " + hHexValueJoined);
				if (hHexValueJoined.length >= nRequiredBytes * 2) {
					break;
				}
			}
			var result = {};
			result.keyhex = hHexValueJoined.substr(0, ALGLIST[algName]['keylen'] * 2);
			result.ivhex = hHexValueJoined.substr(ALGLIST[algName]['keylen'] * 2, ALGLIST[algName]['ivlen'] * 2);
			return result;
		};

		/*
		 * @param {String} privateKeyB64 base64 string of encrypted private key
		 * @param {String} sharedKeyAlgName algorithm name of shared key encryption
		 * @param {String} sharedKeyHex hexadecimal string of shared key to encrypt
		 * @param {String} ivsaltHex hexadecimal string of IV and salt
		 * @param {String} hexadecimal string of decrypted private key
		 */
		var _decryptKeyB64 = function(privateKeyB64, sharedKeyAlgName, sharedKeyHex, ivsaltHex) {
			var privateKeyWA = CryptoJS.enc.Base64.parse(privateKeyB64);
			var privateKeyHex = CryptoJS.enc.Hex.stringify(privateKeyWA);
			var f = ALGLIST[sharedKeyAlgName]['proc'];
			var decryptedKeyHex = f(privateKeyHex, sharedKeyHex, ivsaltHex);
			return decryptedKeyHex;
		};

		/*
		 * @param {String} privateKeyHex hexadecimal string of private key
		 * @param {String} sharedKeyAlgName algorithm name of shared key encryption
		 * @param {String} sharedKeyHex hexadecimal string of shared key to encrypt
		 * @param {String} ivsaltHex hexadecimal string of IV and salt
		 * @param {String} base64 string of encrypted private key
		 */
		var _encryptKeyHex = function(privateKeyHex, sharedKeyAlgName, sharedKeyHex, ivsaltHex) {
			var f = ALGLIST[sharedKeyAlgName]['eproc'];
			var encryptedKeyB64 = f(privateKeyHex, sharedKeyHex, ivsaltHex);
			return encryptedKeyB64;
		};

		// *****************************************************************
		// *** PUBLIC PROPERTIES AND METHODS *******************************
		// *****************************************************************
		return {
			// -- UTILITY METHODS ------------------------------------------
			/**
			 * decrypt private key by shared key
			 * @name version
			 * @memberOf PKCS5PKEY
			 * @property {String} version
			 * @description version string of PKCS5PKEY class
			 */
			version: "1.0.5",

			/**
			 * get hexacedimal string of PEM format
			 * @name getHexFromPEM
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} sPEM PEM formatted string
			 * @param {String} sHead PEM header string without BEGIN/END
			 * @return {String} hexadecimal string data of PEM contents
			 * @since pkcs5pkey 1.0.5
			 */
			getHexFromPEM: function(sPEM, sHead) {
				var s = sPEM;
				if (s.indexOf("BEGIN " + sHead) == -1) {
					throw "can't find PEM header: " + sHead;
				}
				s = s.replace("-----BEGIN " + sHead + "-----", "");
				s = s.replace("-----END " + sHead + "-----", "");
				var sB64 = s.replace(/\s+/g, '');
				var dataHex = b64tohex(sB64);
				return dataHex;
			},

			/**
			 * decrypt private key by shared key
			 * @name getDecryptedKeyHexByKeyIV
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} encryptedKeyHex hexadecimal string of encrypted private key
			 * @param {String} algName name of symmetric key algorithm (ex. 'DES-EBE3-CBC')
			 * @param {String} sharedKeyHex hexadecimal string of symmetric key
			 * @param {String} ivHex hexadecimal string of initial vector(IV).
			 * @return {String} hexadecimal string of decrypted privated key
			 */
			getDecryptedKeyHexByKeyIV: function(encryptedKeyHex, algName, sharedKeyHex, ivHex) {
				var f1 = getFuncByName(algName);
				return f1(encryptedKeyHex, sharedKeyHex, ivHex);
			},

			/**
			 * parse PEM formatted passcode protected PKCS#5 private key
			 * @name parsePKCS5PEM
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} sPKCS5PEM PEM formatted protected passcode protected PKCS#5 private key
			 * @return {Hash} hash of key information
			 * @description
			 * Resulted hash has following attributes.
			 * <ul>
			 * <li>cipher - symmetric key algorithm name (ex. 'DES-EBE3-CBC', 'AES-256-CBC')</li>
			 * <li>ivsalt - IV used for decrypt. Its heading 8 bytes will be used for passcode salt.</li>
			 * <li>type - asymmetric key algorithm name of private key described in PEM header.</li>
			 * <li>data - base64 encoded encrypted private key.</li>
			 * </ul>
			 *
			 */
			parsePKCS5PEM: function(sPKCS5PEM) {
				return _parsePKCS5PEM(sPKCS5PEM);
			},

			/**
			 * the same function as OpenSSL EVP_BytsToKey to generate shared key and IV
			 * @name getKeyAndUnusedIvByPasscodeAndIvsalt
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} algName name of symmetric key algorithm (ex. 'DES-EBE3-CBC')
			 * @param {String} passcode passcode to decrypt private key (ex. 'password')
			 * @param {String} ivsaltHex hexadecimal string of IV. heading 8 bytes will be used for passcode salt
			 * @return {Hash} hash of key and unused IV (ex. {keyhex:2fe3..., ivhex:3fad..})
			 */
			getKeyAndUnusedIvByPasscodeAndIvsalt: function(algName, passcode, ivsaltHex) {
				return _getKeyAndUnusedIvByPasscodeAndIvsalt(algName, passcode, ivsaltHex);
			},

			decryptKeyB64: function(privateKeyB64, sharedKeyAlgName, sharedKeyHex, ivsaltHex) {
				return _decryptKeyB64(privateKeyB64, sharedKeyAlgName, sharedKeyHex, ivsaltHex);
			},

			/**
			 * decrypt PEM formatted protected PKCS#5 private key with passcode
			 * @name getDecryptedKeyHex
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} sEncryptedPEM PEM formatted protected passcode protected PKCS#5 private key
			 * @param {String} passcode passcode to decrypt private key (ex. 'password')
			 * @return {String} hexadecimal string of decrypted RSA priavte key
			 */
			getDecryptedKeyHex: function(sEncryptedPEM, passcode) {
				// 1. parse pem
				var info = _parsePKCS5PEM(sEncryptedPEM);
				var publicKeyAlgName = info.type;
				var sharedKeyAlgName = info.cipher;
				var ivsaltHex = info.ivsalt;
				var privateKeyB64 = info.data;
				//alert("ivsaltHex = " + ivsaltHex);

				// 2. generate shared key
				var sharedKeyInfo = _getKeyAndUnusedIvByPasscodeAndIvsalt(sharedKeyAlgName, passcode, ivsaltHex);
				var sharedKeyHex = sharedKeyInfo.keyhex;
				//alert("sharedKeyHex = " + sharedKeyHex);

				// 3. decrypt private key
				var decryptedKey = _decryptKeyB64(privateKeyB64, sharedKeyAlgName, sharedKeyHex, ivsaltHex);
				return decryptedKey;
			},

			/**
			 * read PEM formatted encrypted PKCS#5 private key and returns RSAKey object
			 * @name getRSAKeyFromEncryptedPKCS5PEM
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} sEncryptedP5PEM PEM formatted encrypted PKCS#5 private key
			 * @param {String} passcode passcode to decrypt private key
			 * @return {RSAKey} loaded RSAKey object of RSA private key
			 * @since pkcs5pkey 1.0.2
			 */
			getRSAKeyFromEncryptedPKCS5PEM: function(sEncryptedP5PEM, passcode) {
				var hPKey = this.getDecryptedKeyHex(sEncryptedP5PEM, passcode);
				var rsaKey = new RSAKey();
				rsaKey.readPrivateKeyFromASN1HexString(hPKey);
				return rsaKey;
			},

			/**
			 * get PEM formatted encrypted PKCS#5 private key from hexadecimal string of plain private key
			 * @name getEncryptedPKCS5PEMFromPrvKeyHex
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} hPrvKey hexadecimal string of plain private key
			 * @param {String} passcode pass code to protect private key (ex. password)
			 * @param {String} sharedKeyAlgName algorithm name to protect private key (ex. AES-256-CBC)
			 * @param {String} ivsaltHex hexadecimal string of IV and salt
			 * @return {String} string of PEM formatted encrypted PKCS#5 private key
			 * @since pkcs5pkey 1.0.2
			 * @description
			 * <br/>
			 * generate PEM formatted encrypted PKCS#5 private key by hexadecimal string encoded
			 * ASN.1 object of plain RSA private key.
			 * Following arguments can be omitted.
			 * <ul>
			 * <li>alg - AES-256-CBC will be used if omitted.</li>
			 * <li>ivsaltHex - automatically generate IV and salt which length depends on algorithm</li>
			 * </ul>
			 * @example
			 * var pem = 
			 *   PKCS5PKEY.getEncryptedPKCS5PEMFromPrvKeyHex(plainKeyHex, "password");
			 * var pem2 = 
			 *   PKCS5PKEY.getEncryptedPKCS5PEMFromPrvKeyHex(plainKeyHex, "password", "AES-128-CBC");
			 * var pem3 = 
			 *   PKCS5PKEY.getEncryptedPKCS5PEMFromPrvKeyHex(plainKeyHex, "password", "AES-128-CBC", "1f3d02...");
			 */
			getEncryptedPKCS5PEMFromPrvKeyHex: function(hPrvKey, passcode, sharedKeyAlgName, ivsaltHex) {
				// 1. set sharedKeyAlgName if undefined (default AES-256-CBC)
				if (typeof sharedKeyAlgName == "undefined" || sharedKeyAlgName == null) {
					sharedKeyAlgName = "AES-256-CBC";
				}
				if (typeof ALGLIST[sharedKeyAlgName] == "undefined")
					throw "PKCS5PKEY unsupported algorithm: " + sharedKeyAlgName;

				// 2. set ivsaltHex if undefined
				if (typeof ivsaltHex == "undefined" || ivsaltHex == null) {
					var ivlen = ALGLIST[sharedKeyAlgName]['ivlen'];
					var randIV = _generateIvSaltHex(ivlen);
					ivsaltHex = randIV.toUpperCase();
				}

				// 3. get shared key
				//alert("ivsalthex=" + ivsaltHex);
				var sharedKeyInfo = _getKeyAndUnusedIvByPasscodeAndIvsalt(sharedKeyAlgName, passcode, ivsaltHex);
				var sharedKeyHex = sharedKeyInfo.keyhex;
				// alert("sharedKeyHex = " + sharedKeyHex);

				// 3. get encrypted Key in Base64
				var encryptedKeyB64 = _encryptKeyHex(hPrvKey, sharedKeyAlgName, sharedKeyHex, ivsaltHex);

				var pemBody = encryptedKeyB64.replace(/(.{64})/g, "$1\r\n");
				var sPEM = "-----BEGIN RSA PRIVATE KEY-----\r\n";
				sPEM += "Proc-Type: 4,ENCRYPTED\r\n";
				sPEM += "DEK-Info: " + sharedKeyAlgName + "," + ivsaltHex + "\r\n";
				sPEM += "\r\n";
				sPEM += pemBody;
				sPEM += "\r\n-----END RSA PRIVATE KEY-----\r\n";

				return sPEM;
			},

			/**
			 * get PEM formatted encrypted PKCS#5 private key from RSAKey object of private key
			 * @name getEncryptedPKCS5PEMFromRSAKey
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {RSAKey} pKey RSAKey object of private key
			 * @param {String} passcode pass code to protect private key (ex. password)
			 * @param {String} alg algorithm name to protect private key (default AES-256-CBC)
			 * @param {String} ivsaltHex hexadecimal string of IV and salt (default generated random IV)
			 * @return {String} string of PEM formatted encrypted PKCS#5 private key
			 * @since pkcs5pkey 1.0.2
			 * @description
			 * <br/>
			 * generate PEM formatted encrypted PKCS#5 private key by
			 * {@link RSAKey} object of RSA private key and passcode.
			 * Following argument can be omitted.
			 * <ul>
			 * <li>alg - AES-256-CBC will be used if omitted.</li>
			 * <li>ivsaltHex - automatically generate IV and salt which length depends on algorithm</li>
			 * </ul>
			 * @example
			 * var pkey = new RSAKey();
			 * pkey.generate(1024, '10001'); // generate 1024bit RSA private key with public exponent 'x010001'
			 * var pem = PKCS5PKEY.getEncryptedPKCS5PEMFromRSAKey(pkey, "password");
			 */
			getEncryptedPKCS5PEMFromRSAKey: function(pKey, passcode, alg, ivsaltHex) {
				var version = new KJUR.asn1.DERInteger({
					'int': 0
				});
				var n = new KJUR.asn1.DERInteger({
					'bigint': pKey.n
				});
				var e = new KJUR.asn1.DERInteger({
					'int': pKey.e
				});
				var d = new KJUR.asn1.DERInteger({
					'bigint': pKey.d
				});
				var p = new KJUR.asn1.DERInteger({
					'bigint': pKey.p
				});
				var q = new KJUR.asn1.DERInteger({
					'bigint': pKey.q
				});
				var dmp1 = new KJUR.asn1.DERInteger({
					'bigint': pKey.dmp1
				});
				var dmq1 = new KJUR.asn1.DERInteger({
					'bigint': pKey.dmq1
				});
				var coeff = new KJUR.asn1.DERInteger({
					'bigint': pKey.coeff
				});
				var seq = new KJUR.asn1.DERSequence({
					'array': [version, n, e, d, p, q, dmp1, dmq1, coeff]
				});
				var hex = seq.getEncodedHex();
				return this.getEncryptedPKCS5PEMFromPrvKeyHex(hex, passcode, alg, ivsaltHex);
			},

			/**
			 * generate RSAKey and PEM formatted encrypted PKCS#5 private key
			 * @name newEncryptedPKCS5PEM
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} passcode pass code to protect private key (ex. password)
			 * @param {Integer} keyLen key bit length of RSA key to be generated. (default 1024)
			 * @param {String} hPublicExponent hexadecimal string of public exponent (default 10001)
			 * @param {String} alg shared key algorithm to encrypt private key (default AES-256-CBC)
			 * @return {String} string of PEM formatted encrypted PKCS#5 private key
			 * @since pkcs5pkey 1.0.2
			 * @example
			 * var pem1 = PKCS5PKEY.newEncryptedPKCS5PEM("password");           // RSA1024bit/10001/AES-256-CBC
			 * var pem2 = PKCS5PKEY.newEncryptedPKCS5PEM("password", 512);      // RSA 512bit/10001/AES-256-CBC
			 * var pem3 = PKCS5PKEY.newEncryptedPKCS5PEM("password", 512, '3'); // RSA 512bit/    3/AES-256-CBC
			 */
			newEncryptedPKCS5PEM: function(passcode, keyLen, hPublicExponent, alg) {
				if (typeof keyLen == "undefined" || keyLen == null) {
					keyLen = 1024;
				}
				if (typeof hPublicExponent == "undefined" || hPublicExponent == null) {
					hPublicExponent = '10001';
				}
				var pKey = new RSAKey();
				pKey.generate(keyLen, hPublicExponent);
				var pem = null;
				if (typeof alg == "undefined" || alg == null) {
					pem = this.getEncryptedPKCS5PEMFromRSAKey(pkey, passcode);
				} else {
					pem = this.getEncryptedPKCS5PEMFromRSAKey(pkey, passcode, alg);
				}
				return pem;
			},

			// === PKCS8 ===============================================================

			/**
			 * read PEM formatted unencrypted PKCS#8 private key and returns RSAKey object
			 * @name getRSAKeyFromPlainPKCS8PEM
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} pkcs8PEM PEM formatted unencrypted PKCS#8 private key
			 * @return {RSAKey} loaded RSAKey object of RSA private key
			 * @since pkcs5pkey 1.0.1
			 */
			getRSAKeyFromPlainPKCS8PEM: function(pkcs8PEM) {
				if (pkcs8PEM.match(/ENCRYPTED/))
					throw "pem shall be not ENCRYPTED";
				var prvKeyHex = this.getHexFromPEM(pkcs8PEM, "PRIVATE KEY");
				var rsaKey = this.getRSAKeyFromPlainPKCS8Hex(prvKeyHex);
				return rsaKey;
			},

			/**
			 * provide hexadecimal string of unencrypted PKCS#8 private key and returns RSAKey object
			 * @name getRSAKeyFromPlainPKCS8Hex
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} prvKeyHex hexadecimal string of unencrypted PKCS#8 private key
			 * @return {RSAKey} loaded RSAKey object of RSA private key
			 * @since pkcs5pkey 1.0.3
			 */
			getRSAKeyFromPlainPKCS8Hex: function(prvKeyHex) {
				var a1 = ASN1HEX.getPosArrayOfChildren_AtObj(prvKeyHex, 0);
				if (a1.length != 3)
					throw "outer DERSequence shall have 3 elements: " + a1.length;
				var algIdTLV = ASN1HEX.getHexOfTLV_AtObj(prvKeyHex, a1[1]);
				if (algIdTLV != "300d06092a864886f70d0101010500") // AlgId rsaEncryption
					throw "PKCS8 AlgorithmIdentifier is not rsaEnc: " + algIdTLV;
				var octetStr = ASN1HEX.getHexOfTLV_AtObj(prvKeyHex, a1[2]);
				var p5KeyHex = ASN1HEX.getHexOfV_AtObj(octetStr, 0);
				//alert(p5KeyHex);
				var rsaKey = new RSAKey();
				rsaKey.readPrivateKeyFromASN1HexString(p5KeyHex);
				return rsaKey;
			},

			/**
			 * generate PBKDF2 key hexstring with specified passcode and information
			 * @name parseHexOfEncryptedPKCS8
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} sHEX passcode to decrypto private key
			 * @return {Array} info associative array of PKCS#8 parameters
			 * @since pkcs5pkey 1.0.3
			 * @description
			 * The associative array which is returned by this method has following properties:
			 * <ul>
			 * <li>info.pbkdf2Salt - hexadecimal string of PBKDF2 salt</li>
			 * <li>info.pkbdf2Iter - iteration count</li>
			 * <li>info.ciphertext - hexadecimal string of encrypted private key</li>
			 * <li>info.encryptionSchemeAlg - encryption algorithm name (currently TripleDES only)</li>
			 * <li>info.encryptionSchemeIV - initial vector for encryption algorithm</li>
			 * </ul>
			 * Currently, this method only supports PKCS#5v2.0 with PBES2/PBDKF2 of HmacSHA1 and TripleDES.
			 * <ul>
			 * <li>keyDerivationFunc = pkcs5PBKDF2 with HmacSHA1</li>
			 * <li>encryptionScheme = des-EDE3-CBC(i.e. TripleDES</li>
			 * </ul>
			 * @example
			 * // to convert plain PKCS#5 private key to encrypted PKCS#8 private
			 * // key with PBKDF2 with TripleDES
			 * % openssl pkcs8 -in plain_p5.pem -topk8 -v2 -des3 -out encrypted_p8.pem
			 */
			parseHexOfEncryptedPKCS8: function(sHEX) {
				var info = {};

				var a0 = ASN1HEX.getPosArrayOfChildren_AtObj(sHEX, 0);
				if (a0.length != 2)
					throw "malformed format: SEQUENCE(0).items != 2: " + a0.length;

				// 1. ciphertext
				info.ciphertext = ASN1HEX.getHexOfV_AtObj(sHEX, a0[1]);

				// 2. pkcs5PBES2
				var a0_0 = ASN1HEX.getPosArrayOfChildren_AtObj(sHEX, a0[0]);
				if (a0_0.length != 2)
					throw "malformed format: SEQUENCE(0.0).items != 2: " + a0_0.length;

				// 2.1 check if pkcs5PBES2(1 2 840 113549 1 5 13)
				if (ASN1HEX.getHexOfV_AtObj(sHEX, a0_0[0]) != "2a864886f70d01050d")
					throw "this only supports pkcs5PBES2";

				// 2.2 pkcs5PBES2 param
				var a0_0_1 = ASN1HEX.getPosArrayOfChildren_AtObj(sHEX, a0_0[1]);
				if (a0_0.length != 2)
					throw "malformed format: SEQUENCE(0.0.1).items != 2: " + a0_0_1.length;

				// 2.2.1 encryptionScheme
				var a0_0_1_1 = ASN1HEX.getPosArrayOfChildren_AtObj(sHEX, a0_0_1[1]);
				if (a0_0_1_1.length != 2)
					throw "malformed format: SEQUENCE(0.0.1.1).items != 2: " + a0_0_1_1.length;
				if (ASN1HEX.getHexOfV_AtObj(sHEX, a0_0_1_1[0]) != "2a864886f70d0307")
					throw "this only supports TripleDES";
				info.encryptionSchemeAlg = "TripleDES";

				// 2.2.1.1 IV of encryptionScheme
				info.encryptionSchemeIV = ASN1HEX.getHexOfV_AtObj(sHEX, a0_0_1_1[1]);

				// 2.2.2 keyDerivationFunc
				var a0_0_1_0 = ASN1HEX.getPosArrayOfChildren_AtObj(sHEX, a0_0_1[0]);
				if (a0_0_1_0.length != 2)
					throw "malformed format: SEQUENCE(0.0.1.0).items != 2: " + a0_0_1_0.length;
				if (ASN1HEX.getHexOfV_AtObj(sHEX, a0_0_1_0[0]) != "2a864886f70d01050c")
					throw "this only supports pkcs5PBKDF2";

				// 2.2.2.1 pkcs5PBKDF2 param
				var a0_0_1_0_1 = ASN1HEX.getPosArrayOfChildren_AtObj(sHEX, a0_0_1_0[1]);
				if (a0_0_1_0_1.length < 2)
					throw "malformed format: SEQUENCE(0.0.1.0.1).items < 2: " + a0_0_1_0_1.length;

				// 2.2.2.1.1 PBKDF2 salt
				info.pbkdf2Salt = ASN1HEX.getHexOfV_AtObj(sHEX, a0_0_1_0_1[0]);

				// 2.2.2.1.2 PBKDF2 iter
				var iterNumHex = ASN1HEX.getHexOfV_AtObj(sHEX, a0_0_1_0_1[1]);
				try {
					info.pbkdf2Iter = parseInt(iterNumHex, 16);
				} catch (ex) {
					throw "malformed format pbkdf2Iter: " + iterNumHex;
				}

				return info;
			},

			/**
			 * generate PBKDF2 key hexstring with specified passcode and information
			 * @name getPBKDF2KeyHexFromParam
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {Array} info result of {@link parseHexOfEncryptedPKCS8} which has preference of PKCS#8 file
			 * @param {String} passcode passcode to decrypto private key
			 * @return {String} hexadecimal string of PBKDF2 key
			 * @since pkcs5pkey 1.0.3
			 * @description
			 * As for info, this uses following properties:
			 * <ul>
			 * <li>info.pbkdf2Salt - hexadecimal string of PBKDF2 salt</li>
			 * <li>info.pkbdf2Iter - iteration count</li>
			 * </ul>
			 * Currently, this method only supports PKCS#5v2.0 with PBES2/PBDKF2 of HmacSHA1 and TripleDES.
			 * <ul>
			 * <li>keyDerivationFunc = pkcs5PBKDF2 with HmacSHA1</li>
			 * <li>encryptionScheme = des-EDE3-CBC(i.e. TripleDES</li>
			 * </ul>
			 * @example
			 * // to convert plain PKCS#5 private key to encrypted PKCS#8 private
			 * // key with PBKDF2 with TripleDES
			 * % openssl pkcs8 -in plain_p5.pem -topk8 -v2 -des3 -out encrypted_p8.pem
			 */
			getPBKDF2KeyHexFromParam: function(info, passcode) {
				var pbkdf2SaltWS = CryptoJS.enc.Hex.parse(info.pbkdf2Salt);
				var pbkdf2Iter = info.pbkdf2Iter;
				var pbkdf2KeyWS = CryptoJS.PBKDF2(passcode,
					pbkdf2SaltWS, {
						keySize: 192 / 32,
						iterations: pbkdf2Iter
					});
				var pbkdf2KeyHex = CryptoJS.enc.Hex.stringify(pbkdf2KeyWS);
				return pbkdf2KeyHex;
			},

			/**
			 * read PEM formatted encrypted PKCS#8 private key and returns hexadecimal string of plain PKCS#8 private key
			 * @name getPlainPKCS8HexFromEncryptedPKCS8PEM
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} pkcs8PEM PEM formatted encrypted PKCS#8 private key
			 * @param {String} passcode passcode to decrypto private key
			 * @return {String} hexadecimal string of plain PKCS#8 private key
			 * @since pkcs5pkey 1.0.3
			 * @description
			 * Currently, this method only supports PKCS#5v2.0 with PBES2/PBDKF2 of HmacSHA1 and TripleDES.
			 * <ul>
			 * <li>keyDerivationFunc = pkcs5PBKDF2 with HmacSHA1</li>
			 * <li>encryptionScheme = des-EDE3-CBC(i.e. TripleDES</li>
			 * </ul>
			 * @example
			 * // to convert plain PKCS#5 private key to encrypted PKCS#8 private
			 * // key with PBKDF2 with TripleDES
			 * % openssl pkcs8 -in plain_p5.pem -topk8 -v2 -des3 -out encrypted_p8.pem
			 */
			getPlainPKCS8HexFromEncryptedPKCS8PEM: function(pkcs8PEM, passcode) {
				// 1. derHex - PKCS#8 private key encrypted by PBKDF2
				var derHex = this.getHexFromPEM(pkcs8PEM, "ENCRYPTED PRIVATE KEY");
				// 2. info - PKCS#5 PBES info
				var info = this.parseHexOfEncryptedPKCS8(derHex);
				// 3. hKey - PBKDF2 key
				var pbkdf2KeyHex = PKCS5PKEY.getPBKDF2KeyHexFromParam(info, passcode);
				// 4. decrypt ciphertext by PBKDF2 key
				var encrypted = {};
				encrypted.ciphertext = CryptoJS.enc.Hex.parse(info.ciphertext);
				var pbkdf2KeyWS = CryptoJS.enc.Hex.parse(pbkdf2KeyHex);
				var des3IVWS = CryptoJS.enc.Hex.parse(info.encryptionSchemeIV);
				var decWS = CryptoJS.TripleDES.decrypt(encrypted, pbkdf2KeyWS, {
					iv: des3IVWS
				});
				var decHex = CryptoJS.enc.Hex.stringify(decWS);
				return decHex;
			},

			/**
			 * read PEM formatted encrypted PKCS#8 private key and returns RSAKey object
			 * @name getRSAKeyFromEncryptedPKCS8PEM
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} pkcs8PEM PEM formatted encrypted PKCS#8 private key
			 * @param {String} passcode passcode to decrypto private key
			 * @return {RSAKey} loaded RSAKey object of RSA private key
			 * @since pkcs5pkey 1.0.3
			 * @description
			 * Currently, this method only supports PKCS#5v2.0 with PBES2/PBDKF2 of HmacSHA1 and TripleDES.
			 * <ul>
			 * <li>keyDerivationFunc = pkcs5PBKDF2 with HmacSHA1</li>
			 * <li>encryptionScheme = des-EDE3-CBC(i.e. TripleDES</li>
			 * </ul>
			 * @example
			 * // to convert plain PKCS#5 private key to encrypted PKCS#8 private
			 * // key with PBKDF2 with TripleDES
			 * % openssl pkcs8 -in plain_p5.pem -topk8 -v2 -des3 -out encrypted_p8.pem
			 */
			getRSAKeyFromEncryptedPKCS8PEM: function(pkcs8PEM, passcode) {
				var prvKeyHex = this.getPlainPKCS8HexFromEncryptedPKCS8PEM(pkcs8PEM, passcode);
				var rsaKey = this.getRSAKeyFromPlainPKCS8Hex(prvKeyHex);
				return rsaKey;
			},

			/**
			 * get RSAKey/ECDSA private key object from encrypted PEM PKCS#8 private key
			 * @name getKeyFromEncryptedPKCS8PEM
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} pkcs8PEM string of PEM formatted PKCS#8 private key
			 * @param {String} passcode passcode string to decrypt key
			 * @return {Object} RSAKey or KJUR.crypto.ECDSA private key object
			 * @since pkcs5pkey 1.0.5
			 */
			getKeyFromEncryptedPKCS8PEM: function(pkcs8PEM, passcode) {
				var prvKeyHex = this.getPlainPKCS8HexFromEncryptedPKCS8PEM(pkcs8PEM, passcode);
				var key = this.getKeyFromPlainPrivatePKCS8Hex(prvKeyHex);
				return key;
			},

			/**
			 * parse hexadecimal string of plain PKCS#8 private key
			 * @name parsePlainPrivatePKCS8Hex
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} pkcs8PrvHex hexadecimal string of PKCS#8 plain private key
			 * @return {Array} associative array of parsed key
			 * @since pkcs5pkey 1.0.5
			 * @description
			 * Resulted associative array has following properties:
			 * <ul>
			 * <li>algoid - hexadecimal string of OID of asymmetric key algorithm</li>
			 * <li>algparam - hexadecimal string of OID of ECC curve name or null</li>
			 * <li>keyidx - string starting index of key in pkcs8PrvHex</li>
			 * </ul>
			 */
			parsePlainPrivatePKCS8Hex: function(pkcs8PrvHex) {
				var result = {};
				result.algparam = null;

				// 1. sequence
				if (pkcs8PrvHex.substr(0, 2) != "30")
					throw "malformed plain PKCS8 private key(code:001)"; // not sequence

				var a1 = ASN1HEX.getPosArrayOfChildren_AtObj(pkcs8PrvHex, 0);
				if (a1.length != 3)
					throw "malformed plain PKCS8 private key(code:002)";

				// 2. AlgID
				if (pkcs8PrvHex.substr(a1[1], 2) != "30")
					throw "malformed PKCS8 private key(code:003)"; // AlgId not sequence

				var a2 = ASN1HEX.getPosArrayOfChildren_AtObj(pkcs8PrvHex, a1[1]);
				if (a2.length != 2)
					throw "malformed PKCS8 private key(code:004)"; // AlgId not have two elements

				// 2.1. AlgID OID
				if (pkcs8PrvHex.substr(a2[0], 2) != "06")
					throw "malformed PKCS8 private key(code:005)"; // AlgId.oid is not OID

				result.algoid = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a2[0]);

				// 2.2. AlgID param
				if (pkcs8PrvHex.substr(a2[1], 2) == "06") {
					result.algparam = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a2[1]);
				}

				// 3. Key index
				if (pkcs8PrvHex.substr(a1[2], 2) != "04")
					throw "malformed PKCS8 private key(code:006)"; // not octet string

				result.keyidx = ASN1HEX.getStartPosOfV_AtObj(pkcs8PrvHex, a1[2]);

				return result;
			},

			/**
			 * get RSAKey/ECDSA private key object from PEM plain PEM PKCS#8 private key
			 * @name getKeyFromPlainPrivatePKCS8PEM
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} prvKeyPEM string of plain PEM formatted PKCS#8 private key
			 * @return {Object} RSAKey or KJUR.crypto.ECDSA private key object
			 * @since pkcs5pkey 1.0.5
			 */
			getKeyFromPlainPrivatePKCS8PEM: function(prvKeyPEM) {
				var prvKeyHex = this.getHexFromPEM(prvKeyPEM, "PRIVATE KEY");
				var key = this.getKeyFromPlainPrivatePKCS8Hex(prvKeyHex);
				return key;
			},

			/**
			 * get RSAKey/ECDSA private key object from HEX plain PEM PKCS#8 private key
			 * @name getKeyFromPlainPrivatePKCS8Hex
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} prvKeyHex hexadecimal string of plain PKCS#8 private key
			 * @return {Object} RSAKey or KJUR.crypto.ECDSA private key object
			 * @since pkcs5pkey 1.0.5
			 */
			getKeyFromPlainPrivatePKCS8Hex: function(prvKeyHex) {
				var p8 = this.parsePlainPrivatePKCS8Hex(prvKeyHex);

				if (p8.algoid == "2a864886f70d010101") { // RSA
					this.parsePrivateRawRSAKeyHexAtObj(prvKeyHex, p8);
					var k = p8.key;
					var key = new RSAKey();
					key.setPrivateEx(k.n, k.e, k.d, k.p, k.q, k.dp, k.dq, k.co);
					return key;
				} else if (p8.algoid == "2a8648ce3d0201") { // ECC
					this.parsePrivateRawECKeyHexAtObj(prvKeyHex, p8);
					if (KJUR.crypto.OID.oidhex2name[p8.algparam] === undefined)
						throw "KJUR.crypto.OID.oidhex2name undefined: " + p8.algparam;
					var curveName = KJUR.crypto.OID.oidhex2name[p8.algparam];
					var key = new KJUR.crypto.ECDSA({
						'curve': curveName,
						'prv': p8.key
					});
					return key;
				} else {
					throw "unsupported private key algorithm";
				}
			},

			// === PKCS8 RSA Public Key ================================================
			/**
			 * read PEM formatted PKCS#8 public key and returns RSAKey object
			 * @name getRSAKeyFromPublicPKCS8PEM
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} pkcs8PubPEM PEM formatted PKCS#8 public key
			 * @return {RSAKey} loaded RSAKey object of RSA public key
			 * @since pkcs5pkey 1.0.4
			 */
			getRSAKeyFromPublicPKCS8PEM: function(pkcs8PubPEM) {
				var pubKeyHex = this.getHexFromPEM(pkcs8PubPEM, "PUBLIC KEY");
				var rsaKey = this.getRSAKeyFromPublicPKCS8Hex(pubKeyHex);
				return rsaKey;
			},

			/**
			 * get RSAKey/ECDSA public key object from PEM PKCS#8 public key
			 * @name getKeyFromPublicPKCS8PEM
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} pkcs8PubPEM string of PEM formatted PKCS#8 public key
			 * @return {Object} RSAKey or KJUR.crypto.ECDSA private key object
			 * @since pkcs5pkey 1.0.5
			 */
			getKeyFromPublicPKCS8PEM: function(pkcs8PubPEM) {
				var pubKeyHex = this.getHexFromPEM(pkcs8PubPEM, "PUBLIC KEY");
				var key = this.getKeyFromPublicPKCS8Hex(pubKeyHex);
				return key;
			},

			/**
			 * get RSAKey/ECDSA public key object from hexadecimal string of PKCS#8 public key
			 * @name getKeyFromPublicPKCS8Hex
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} pkcs8PubHex hexadecimal string of PKCS#8 public key
			 * @return {Object} RSAKey or KJUR.crypto.ECDSA private key object
			 * @since pkcs5pkey 1.0.5
			 */
			getKeyFromPublicPKCS8Hex: function(pkcs8PubHex) {
				var p8 = this.parsePublicPKCS8Hex(pkcs8PubHex);

				if (p8.algoid == "2a864886f70d010101") { // RSA
					var aRSA = this.parsePublicRawRSAKeyHex(p8.key);
					var key = new RSAKey();
					key.setPublic(aRSA.n, aRSA.e);
					return key;
				} else if (p8.algoid == "2a8648ce3d0201") { // ECC
					if (KJUR.crypto.OID.oidhex2name[p8.algparam] === undefined)
						throw "KJUR.crypto.OID.oidhex2name undefined: " + p8.algparam;
					var curveName = KJUR.crypto.OID.oidhex2name[p8.algparam];
					var key = new KJUR.crypto.ECDSA({
						'curve': curveName,
						'pub': p8.key
					});
					return key;
				} else {
					throw "unsupported public key algorithm";
				}
			},

			/**
			 * parse hexadecimal string of plain PKCS#8 private key
			 * @name parsePublicRawRSAKeyHex
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} pubRawRSAHex hexadecimal string of ASN.1 encoded PKCS#8 public key
			 * @return {Array} associative array of parsed key
			 * @since pkcs5pkey 1.0.5
			 * @description
			 * Resulted associative array has following properties:
			 * <ul>
			 * <li>n - hexadecimal string of public key
			 * <li>e - hexadecimal string of public exponent
			 * </ul>
			 */
			parsePublicRawRSAKeyHex: function(pubRawRSAHex) {
				var result = {};

				// 1. Sequence
				if (pubRawRSAHex.substr(0, 2) != "30")
					throw "malformed RSA key(code:001)"; // not sequence

				var a1 = ASN1HEX.getPosArrayOfChildren_AtObj(pubRawRSAHex, 0);
				if (a1.length != 2)
					throw "malformed RSA key(code:002)"; // not 2 items in seq

				// 2. public key "N"
				if (pubRawRSAHex.substr(a1[0], 2) != "02")
					throw "malformed RSA key(code:003)"; // 1st item is not integer

				result.n = ASN1HEX.getHexOfV_AtObj(pubRawRSAHex, a1[0]);

				// 3. public key "E"
				if (pubRawRSAHex.substr(a1[1], 2) != "02")
					throw "malformed RSA key(code:004)"; // 2nd item is not integer

				result.e = ASN1HEX.getHexOfV_AtObj(pubRawRSAHex, a1[1]);

				return result;
			},

			/**
			 * parse hexadecimal string of RSA private key
			 * @name parsePrivateRawRSAKeyHexAtObj
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} pkcs8PrvHex hexadecimal string of PKCS#8 private key concluding RSA private key
			 * @return {Array} info associative array to add parsed RSA private key information
			 * @since pkcs5pkey 1.0.5
			 * @description
			 * Following properties are added to associative array 'info'
			 * <ul>
			 * <li>n - hexadecimal string of public key
			 * <li>e - hexadecimal string of public exponent
			 * <li>d - hexadecimal string of private key
			 * <li>p - hexadecimal string
			 * <li>q - hexadecimal string
			 * <li>dp - hexadecimal string
			 * <li>dq - hexadecimal string
			 * <li>co - hexadecimal string
			 * </ul>
			 */
			parsePrivateRawRSAKeyHexAtObj: function(pkcs8PrvHex, info) {
				var keyIdx = info.keyidx;

				// 1. sequence
				if (pkcs8PrvHex.substr(keyIdx, 2) != "30")
					throw "malformed RSA private key(code:001)"; // not sequence

				var a1 = ASN1HEX.getPosArrayOfChildren_AtObj(pkcs8PrvHex, keyIdx);
				if (a1.length != 9)
					throw "malformed RSA private key(code:002)"; // not sequence

				// 2. RSA key
				info.key = {};
				info.key.n = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[1]);
				info.key.e = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[2]);
				info.key.d = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[3]);
				info.key.p = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[4]);
				info.key.q = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[5]);
				info.key.dp = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[6]);
				info.key.dq = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[7]);
				info.key.co = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[8]);
			},

			/**
			 * parse hexadecimal string of ECC private key
			 * @name parsePrivateRawECKeyHexAtObj
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} pkcs8PrvHex hexadecimal string of PKCS#8 private key concluding EC private key
			 * @return {Array} info associative array to add parsed ECC private key information
			 * @since pkcs5pkey 1.0.5
			 * @description
			 * Following properties are added to associative array 'info'
			 * <ul>
			 * <li>key - hexadecimal string of ECC private key
			 * </ul>
			 */
			parsePrivateRawECKeyHexAtObj: function(pkcs8PrvHex, info) {
				var keyIdx = info.keyidx;

				// 1. sequence
				if (pkcs8PrvHex.substr(keyIdx, 2) != "30")
					throw "malformed ECC private key(code:001)"; // not sequence

				var a1 = ASN1HEX.getPosArrayOfChildren_AtObj(pkcs8PrvHex, keyIdx);
				if (a1.length != 3)
					throw "malformed ECC private key(code:002)"; // not sequence

				// 2. EC private key
				if (pkcs8PrvHex.substr(a1[1], 2) != "04")
					throw "malformed ECC private key(code:003)"; // not octetstring

				info.key = ASN1HEX.getHexOfV_AtObj(pkcs8PrvHex, a1[1]);
			},

			/**
			 * parse hexadecimal string of PKCS#8 public key
			 * @name parsePublicPKCS8Hex
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} pkcs8PubHex hexadecimal string of PKCS#8 public key
			 * @return {Hash} hash of key information
			 * @description
			 * Resulted hash has following attributes.
			 * <ul>
			 * <li>algoid - hexadecimal string of OID of asymmetric key algorithm</li>
			 * <li>algparam - hexadecimal string of OID of ECC curve name or null</li>
			 * <li>key - hexadecimal string of public key</li>
			 * </ul>
			 */
			parsePublicPKCS8Hex: function(pkcs8PubHex) {
				var result = {};
				result.algparam = null;

				// 1. AlgID and Key bit string
				var a1 = ASN1HEX.getPosArrayOfChildren_AtObj(pkcs8PubHex, 0);
				if (a1.length != 2)
					throw "outer DERSequence shall have 2 elements: " + a1.length;

				// 2. AlgID
				var idxAlgIdTLV = a1[0];
				if (pkcs8PubHex.substr(idxAlgIdTLV, 2) != "30")
					throw "malformed PKCS8 public key(code:001)"; // AlgId not sequence

				var a2 = ASN1HEX.getPosArrayOfChildren_AtObj(pkcs8PubHex, idxAlgIdTLV);
				if (a2.length != 2)
					throw "malformed PKCS8 public key(code:002)"; // AlgId not have two elements

				// 2.1. AlgID OID
				if (pkcs8PubHex.substr(a2[0], 2) != "06")
					throw "malformed PKCS8 public key(code:003)"; // AlgId.oid is not OID

				result.algoid = ASN1HEX.getHexOfV_AtObj(pkcs8PubHex, a2[0]);

				// 2.2. AlgID param
				if (pkcs8PubHex.substr(a2[1], 2) == "06") {
					result.algparam = ASN1HEX.getHexOfV_AtObj(pkcs8PubHex, a2[1]);
				}

				// 3. Key
				if (pkcs8PubHex.substr(a1[1], 2) != "03")
					throw "malformed PKCS8 public key(code:004)"; // Key is not bit string

				result.key = ASN1HEX.getHexOfV_AtObj(pkcs8PubHex, a1[1]).substr(2);

				// 4. return result assoc array
				return result;
			},

			/**
			 * provide hexadecimal string of unencrypted PKCS#8 private key and returns RSAKey object
			 * @name getRSAKeyFromPublicPKCS8Hex
			 * @memberOf PKCS5PKEY
			 * @function
			 * @param {String} pkcs8PubHex hexadecimal string of unencrypted PKCS#8 public key
			 * @return {RSAKey} loaded RSAKey object of RSA public key
			 * @since pkcs5pkey 1.0.4
			 */
			getRSAKeyFromPublicPKCS8Hex: function(pkcs8PubHex) {
				var a1 = ASN1HEX.getPosArrayOfChildren_AtObj(pkcs8PubHex, 0);
				if (a1.length != 2)
					throw "outer DERSequence shall have 2 elements: " + a1.length;

				var algIdTLV = ASN1HEX.getHexOfTLV_AtObj(pkcs8PubHex, a1[0]);
				if (algIdTLV != "300d06092a864886f70d0101010500") // AlgId rsaEncryption
					throw "PKCS8 AlgorithmId is not rsaEncryption";

				if (pkcs8PubHex.substr(a1[1], 2) != "03")
					throw "PKCS8 Public Key is not BITSTRING encapslated.";

				var idxPub = ASN1HEX.getStartPosOfV_AtObj(pkcs8PubHex, a1[1]) + 2; // 2 for unused bit

				if (pkcs8PubHex.substr(idxPub, 2) != "30")
					throw "PKCS8 Public Key is not SEQUENCE.";

				var a2 = ASN1HEX.getPosArrayOfChildren_AtObj(pkcs8PubHex, idxPub);
				if (a2.length != 2)
					throw "inner DERSequence shall have 2 elements: " + a2.length;

				if (pkcs8PubHex.substr(a2[0], 2) != "02")
					throw "N is not ASN.1 INTEGER";
				if (pkcs8PubHex.substr(a2[1], 2) != "02")
					throw "E is not ASN.1 INTEGER";

				var hN = ASN1HEX.getHexOfV_AtObj(pkcs8PubHex, a2[0]);
				var hE = ASN1HEX.getHexOfV_AtObj(pkcs8PubHex, a2[1]);

				var pubKey = new RSAKey();
				pubKey.setPublic(hN, hE);

				return pubKey;
			}
		};
	}();

	/*! rsapem-1.1.js (c) 2012 Kenji Urushima | kjur.github.com/jsrsasign/license
	 */
	//
	// rsa-pem.js - adding function for reading/writing PKCS#1 PEM private key
	//			              to RSAKey class.
	//
	// version: 1.1.1 (2013-Apr-12)
	//
	// Copyright (c) 2010-2013 Kenji Urushima (kenji.urushima@gmail.com)
	//
	// This software is licensed under the terms of the MIT License.
	// http://kjur.github.com/jsrsasign/license/
	//
	// The above copyright and license notice shall be 
	// included in all copies or substantial portions of the Software.
	// 
	//
	// Depends on:
	//
	//
	//
	// _RSApem_pemToBase64(sPEM)
	//
	//   removing PEM header, PEM footer and space characters including
	//   new lines from PEM formatted RSA private key string.
	//

	/**
	 * @fileOverview
	 * @name rsapem-1.1.js
	 * @author Kenji Urushima kenji.urushima@gmail.com
	 * @version 1.1
	 * @license <a href="http://kjur.github.io/jsrsasign/license/">MIT License</a>
	 */
	function _rsapem_pemToBase64(sPEMPrivateKey) {
		var s = sPEMPrivateKey;
		s = s.replace("-----BEGIN RSA PRIVATE KEY-----", "");
		s = s.replace("-----END RSA PRIVATE KEY-----", "");
		s = s.replace(/[ \n]+/g, "");
		return s;
	}

	function _rsapem_getPosArrayOfChildrenFromHex(hPrivateKey) {
		var a = new Array();
		var v1 = ASN1HEX.getStartPosOfV_AtObj(hPrivateKey, 0);
		var n1 = ASN1HEX.getPosOfNextSibling_AtObj(hPrivateKey, v1);
		var e1 = ASN1HEX.getPosOfNextSibling_AtObj(hPrivateKey, n1);
		var d1 = ASN1HEX.getPosOfNextSibling_AtObj(hPrivateKey, e1);
		var p1 = ASN1HEX.getPosOfNextSibling_AtObj(hPrivateKey, d1);
		var q1 = ASN1HEX.getPosOfNextSibling_AtObj(hPrivateKey, p1);
		var dp1 = ASN1HEX.getPosOfNextSibling_AtObj(hPrivateKey, q1);
		var dq1 = ASN1HEX.getPosOfNextSibling_AtObj(hPrivateKey, dp1);
		var co1 = ASN1HEX.getPosOfNextSibling_AtObj(hPrivateKey, dq1);
		a.push(v1, n1, e1, d1, p1, q1, dp1, dq1, co1);
		return a;
	}

	function _rsapem_getHexValueArrayOfChildrenFromHex(hPrivateKey) {
		var posArray = _rsapem_getPosArrayOfChildrenFromHex(hPrivateKey);
		var v = ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[0]);
		var n = ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[1]);
		var e = ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[2]);
		var d = ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[3]);
		var p = ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[4]);
		var q = ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[5]);
		var dp = ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[6]);
		var dq = ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[7]);
		var co = ASN1HEX.getHexOfV_AtObj(hPrivateKey, posArray[8]);
		var a = new Array();
		a.push(v, n, e, d, p, q, dp, dq, co);
		return a;
	}

	/**
	 * read RSA private key from a ASN.1 hexadecimal string
	 * @name readPrivateKeyFromASN1HexString
	 * @memberOf RSAKey#
	 * @function
	 * @param {String} keyHex ASN.1 hexadecimal string of PKCS#1 private key.
	 * @since 1.1.1
	 */
	function _rsapem_readPrivateKeyFromASN1HexString(keyHex) {
		var a = _rsapem_getHexValueArrayOfChildrenFromHex(keyHex);
		this.setPrivateEx(a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
	}

	/**
	 * read PKCS#1 private key from a string
	 * @name readPrivateKeyFromPEMString
	 * @memberOf RSAKey#
	 * @function
	 * @param {String} keyPEM string of PKCS#1 private key.
	 */
	function _rsapem_readPrivateKeyFromPEMString(keyPEM) {
		var keyB64 = _rsapem_pemToBase64(keyPEM);
		var keyHex = b64tohex(keyB64) // depends base64.js
		var a = _rsapem_getHexValueArrayOfChildrenFromHex(keyHex);
		this.setPrivateEx(a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
	}

	RSAKey.prototype.readPrivateKeyFromPEMString = _rsapem_readPrivateKeyFromPEMString;
	RSAKey.prototype.readPrivateKeyFromASN1HexString = _rsapem_readPrivateKeyFromASN1HexString;

	/*! rsasign-1.2.7.js (c) 2012 Kenji Urushima | kjur.github.com/jsrsasign/license
	 */
	/*
	 * rsa-sign.js - adding signing functions to RSAKey class.
	 *
	 * version: 1.2.7 (2013 Aug 25)
	 *
	 * Copyright (c) 2010-2013 Kenji Urushima (kenji.urushima@gmail.com)
	 *
	 * This software is licensed under the terms of the MIT License.
	 * http://kjur.github.com/jsrsasign/license/
	 *
	 * The above copyright and license notice shall be 
	 * included in all copies or substantial portions of the Software.
	 */

	/**
	 * @fileOverview
	 * @name rsasign-1.2.js
	 * @author Kenji Urushima kenji.urushima@gmail.com
	 * @version rsasign 1.2.7
	 * @license <a href="http://kjur.github.io/jsrsasign/license/">MIT License</a>
	 */

	var _RE_HEXDECONLY = new RegExp("");
	_RE_HEXDECONLY.compile("[^0-9a-f]", "gi");

	// ========================================================================
	// Signature Generation
	// ========================================================================

	function _rsasign_getHexPaddedDigestInfoForString(s, keySize, hashAlg) {
		var hashFunc = function(s) {
			return KJUR.crypto.Util.hashString(s, hashAlg);
		};
		var sHashHex = hashFunc(s);

		return KJUR.crypto.Util.getPaddedDigestInfoHex(sHashHex, hashAlg, keySize);
	}

	function _zeroPaddingOfSignature(hex, bitLength) {
		var s = "";
		var nZero = bitLength / 4 - hex.length;
		for (var i = 0; i < nZero; i++) {
			s = s + "0";
		}
		return s + hex;
	}

	/**
	 * sign for a message string with RSA private key.<br/>
	 * @name signString
	 * @memberOf RSAKey
	 * @function
	 * @param {String} s message string to be signed.
	 * @param {String} hashAlg hash algorithm name for signing.<br/>
	 * @return returns hexadecimal string of signature value.
	 */
	function _rsasign_signString(s, hashAlg) {
		var hashFunc = function(s) {
			return KJUR.crypto.Util.hashString(s, hashAlg);
		};
		var sHashHex = hashFunc(s);

		return this.signWithMessageHash(sHashHex, hashAlg);
	}

	/**
	 * sign hash value of message to be signed with RSA private key.<br/>
	 * @name signWithMessageHash
	 * @memberOf RSAKey
	 * @function
	 * @param {String} sHashHex hexadecimal string of hash value of message to be signed.
	 * @param {String} hashAlg hash algorithm name for signing.<br/>
	 * @return returns hexadecimal string of signature value.
	 * @since rsasign 1.2.6
	 */
	function _rsasign_signWithMessageHash(sHashHex, hashAlg) {
		var hPM = KJUR.crypto.Util.getPaddedDigestInfoHex(sHashHex, hashAlg, this.n.bitLength());
		var biPaddedMessage = parseBigInt(hPM, 16);
		var biSign = this.doPrivate(biPaddedMessage);
		var hexSign = biSign.toString(16);
		return _zeroPaddingOfSignature(hexSign, this.n.bitLength());
	}

	function _rsasign_signStringWithSHA1(s) {
		return _rsasign_signString.call(this, s, 'sha1');
	}

	function _rsasign_signStringWithSHA256(s) {
		return _rsasign_signString.call(this, s, 'sha256');
	}

	// PKCS#1 (PSS) mask generation function
	function pss_mgf1_str(seed, len, hash) {
		var mask = '',
			i = 0;

		while (mask.length < len) {
			mask += hextorstr(hash(rstrtohex(seed + String.fromCharCode.apply(String, [
				(i & 0xff000000) >> 24,
				(i & 0x00ff0000) >> 16,
				(i & 0x0000ff00) >> 8,
				i & 0x000000ff
			]))));
			i += 1;
		}

		return mask;
	}

	/**
	 * sign for a message string with RSA private key by PKCS#1 PSS signing.<br/>
	 * @name signStringPSS
	 * @memberOf RSAKey
	 * @function
	 * @param {String} s message string to be signed.
	 * @param {String} hashAlg hash algorithm name for signing.
	 * @param {Integer} sLen salt byte length from 0 to (keybytelen - hashbytelen - 2).
	 *        There are two special values:
	 *        <ul>
	 *        <li>-1: sets the salt length to the digest length</li>
	 *        <li>-2: sets the salt length to maximum permissible value
	 *           (i.e. keybytelen - hashbytelen - 2)</li>
	 *        </ul>
	 *        DEFAULT is -1. (NOTE: OpenSSL's default is -2.)
	 * @return returns hexadecimal string of signature value.
	 */
	function _rsasign_signStringPSS(s, hashAlg, sLen) {
		var hashFunc = function(sHex) {
			return KJUR.crypto.Util.hashHex(sHex, hashAlg);
		}
		var hHash = hashFunc(rstrtohex(s));

		if (sLen === undefined) sLen = -1;
		return this.signWithMessageHashPSS(hHash, hashAlg, sLen);
	}

	/**
	 * sign hash value of message with RSA private key by PKCS#1 PSS signing.<br/>
	 * @name signWithMessageHashPSS
	 * @memberOf RSAKey
	 * @function
	 * @param {String} hHash hexadecimal hash value of message to be signed.
	 * @param {String} hashAlg hash algorithm name for signing.
	 * @param {Integer} sLen salt byte length from 0 to (keybytelen - hashbytelen - 2).
	 *        There are two special values:
	 *        <ul>
	 *        <li>-1: sets the salt length to the digest length</li>
	 *        <li>-2: sets the salt length to maximum permissible value
	 *           (i.e. keybytelen - hashbytelen - 2)</li>
	 *        </ul>
	 *        DEFAULT is -1. (NOTE: OpenSSL's default is -2.)
	 * @return returns hexadecimal string of signature value.
	 * @since rsasign 1.2.6
	 */
	function _rsasign_signWithMessageHashPSS(hHash, hashAlg, sLen) {
		var mHash = hextorstr(hHash);
		var hLen = mHash.length;
		var emBits = this.n.bitLength() - 1;
		var emLen = Math.ceil(emBits / 8);
		var i;
		var hashFunc = function(sHex) {
			return KJUR.crypto.Util.hashHex(sHex, hashAlg);
		}

		if (sLen === -1 || sLen === undefined) {
			sLen = hLen; // same as hash length
		} else if (sLen === -2) {
			sLen = emLen - hLen - 2; // maximum
		} else if (sLen < -2) {
			throw "invalid salt length";
		}

		if (emLen < (hLen + sLen + 2)) {
			throw "data too long";
		}

		var salt = '';

		if (sLen > 0) {
			salt = new Array(sLen);
			new SecureRandom().nextBytes(salt);
			salt = String.fromCharCode.apply(String, salt);
		}

		var H = hextorstr(hashFunc(rstrtohex('\x00\x00\x00\x00\x00\x00\x00\x00' + mHash + salt)));
		var PS = [];

		for (i = 0; i < emLen - sLen - hLen - 2; i += 1) {
			PS[i] = 0x00;
		}

		var DB = String.fromCharCode.apply(String, PS) + '\x01' + salt;
		var dbMask = pss_mgf1_str(H, DB.length, hashFunc);
		var maskedDB = [];

		for (i = 0; i < DB.length; i += 1) {
			maskedDB[i] = DB.charCodeAt(i) ^ dbMask.charCodeAt(i);
		}

		var mask = (0xff00 >> (8 * emLen - emBits)) & 0xff;
		maskedDB[0] &= ~mask;

		for (i = 0; i < hLen; i++) {
			maskedDB.push(H.charCodeAt(i));
		}

		maskedDB.push(0xbc);

		return _zeroPaddingOfSignature(this.doPrivate(new BigInteger(maskedDB)).toString(16),
			this.n.bitLength());
	}

	// ========================================================================
	// Signature Verification
	// ========================================================================

	function _rsasign_getDecryptSignatureBI(biSig, hN, hE) {
		var rsa = new RSAKey();
		rsa.setPublic(hN, hE);
		var biDecryptedSig = rsa.doPublic(biSig);
		return biDecryptedSig;
	}

	function _rsasign_getHexDigestInfoFromSig(biSig, hN, hE) {
		var biDecryptedSig = _rsasign_getDecryptSignatureBI(biSig, hN, hE);
		var hDigestInfo = biDecryptedSig.toString(16).replace(/^1f+00/, '');
		return hDigestInfo;
	}

	function _rsasign_getAlgNameAndHashFromHexDisgestInfo(hDigestInfo) {
		for (var algName in KJUR.crypto.Util.DIGESTINFOHEAD) {
			var head = KJUR.crypto.Util.DIGESTINFOHEAD[algName];
			var len = head.length;
			if (hDigestInfo.substring(0, len) == head) {
				var a = [algName, hDigestInfo.substring(len)];
				return a;
			}
		}
		return [];
	}

	function _rsasign_verifySignatureWithArgs(sMsg, biSig, hN, hE) {
		var hDigestInfo = _rsasign_getHexDigestInfoFromSig(biSig, hN, hE);
		var digestInfoAry = _rsasign_getAlgNameAndHashFromHexDisgestInfo(hDigestInfo);
		if (digestInfoAry.length == 0) return false;
		var algName = digestInfoAry[0];
		var diHashValue = digestInfoAry[1];
		var ff = function(s) {
			return KJUR.crypto.Util.hashString(s, algName);
		};
		var msgHashValue = ff(sMsg);
		return (diHashValue == msgHashValue);
	}

	function _rsasign_verifyHexSignatureForMessage(hSig, sMsg) {
		var biSig = parseBigInt(hSig, 16);
		var result = _rsasign_verifySignatureWithArgs(sMsg, biSig,
			this.n.toString(16),
			this.e.toString(16));
		return result;
	}

	/**
	 * verifies a sigature for a message string with RSA public key.<br/>
	 * @name verifyString
	 * @memberOf RSAKey#
	 * @function
	 * @param {String} sMsg message string to be verified.
	 * @param {String} hSig hexadecimal string of siganture.<br/>
	 *                 non-hexadecimal charactors including new lines will be ignored.
	 * @return returns 1 if valid, otherwise 0
	 */
	function _rsasign_verifyString(sMsg, hSig) {
		hSig = hSig.replace(_RE_HEXDECONLY, '');
		hSig = hSig.replace(/[ \n]+/g, "");
		var biSig = parseBigInt(hSig, 16);
		if (biSig.bitLength() > this.n.bitLength()) return 0;
		var biDecryptedSig = this.doPublic(biSig);
		var hDigestInfo = biDecryptedSig.toString(16).replace(/^1f+00/, '');
		var digestInfoAry = _rsasign_getAlgNameAndHashFromHexDisgestInfo(hDigestInfo);

		if (digestInfoAry.length == 0) return false;
		var algName = digestInfoAry[0];
		var diHashValue = digestInfoAry[1];
		var ff = function(s) {
			return KJUR.crypto.Util.hashString(s, algName);
		};
		var msgHashValue = ff(sMsg);
		return (diHashValue == msgHashValue);
	}

	/**
	 * verifies a sigature for a message string with RSA public key.<br/>
	 * @name verifyWithMessageHash
	 * @memberOf RSAKey
	 * @function
	 * @param {String} sHashHex hexadecimal hash value of message to be verified.
	 * @param {String} hSig hexadecimal string of siganture.<br/>
	 *                 non-hexadecimal charactors including new lines will be ignored.
	 * @return returns 1 if valid, otherwise 0
	 * @since rsasign 1.2.6
	 */
	function _rsasign_verifyWithMessageHash(sHashHex, hSig) {
		hSig = hSig.replace(_RE_HEXDECONLY, '');
		hSig = hSig.replace(/[ \n]+/g, "");
		var biSig = parseBigInt(hSig, 16);
		if (biSig.bitLength() > this.n.bitLength()) return 0;
		var biDecryptedSig = this.doPublic(biSig);
		var hDigestInfo = biDecryptedSig.toString(16).replace(/^1f+00/, '');
		var digestInfoAry = _rsasign_getAlgNameAndHashFromHexDisgestInfo(hDigestInfo);

		if (digestInfoAry.length == 0) return false;
		var algName = digestInfoAry[0];
		var diHashValue = digestInfoAry[1];
		return (diHashValue == sHashHex);
	}

	/**
	 * verifies a sigature for a message string with RSA public key by PKCS#1 PSS sign.<br/>
	 * @name verifyStringPSS
	 * @memberOf RSAKey
	 * @function
	 * @param {String} sMsg message string to be verified.
	 * @param {String} hSig hexadecimal string of signature value
	 * @param {String} hashAlg hash algorithm name
	 * @param {Integer} sLen salt byte length from 0 to (keybytelen - hashbytelen - 2).
	 *        There are two special values:
	 *        <ul>
	 *        <li>-1: sets the salt length to the digest length</li>
	 *        <li>-2: sets the salt length to maximum permissible value
	 *           (i.e. keybytelen - hashbytelen - 2)</li>
	 *        </ul>
	 *        DEFAULT is -1. (NOTE: OpenSSL's default is -2.)
	 * @return returns true if valid, otherwise false
	 */
	function _rsasign_verifyStringPSS(sMsg, hSig, hashAlg, sLen) {
		var hashFunc = function(sHex) {
			return KJUR.crypto.Util.hashHex(sHex, hashAlg);
		};
		var hHash = hashFunc(rstrtohex(sMsg));

		if (sLen === undefined) sLen = -1;
		return this.verifyWithMessageHashPSS(hHash, hSig, hashAlg, sLen);
	}

	/**
	 * verifies a sigature for a hash value of message string with RSA public key by PKCS#1 PSS sign.<br/>
	 * @name verifyWithMessageHashPSS
	 * @memberOf RSAKey
	 * @function
	 * @param {String} hHash hexadecimal hash value of message string to be verified.
	 * @param {String} hSig hexadecimal string of signature value
	 * @param {String} hashAlg hash algorithm name
	 * @param {Integer} sLen salt byte length from 0 to (keybytelen - hashbytelen - 2).
	 *        There are two special values:
	 *        <ul>
	 *        <li>-1: sets the salt length to the digest length</li>
	 *        <li>-2: sets the salt length to maximum permissible value
	 *           (i.e. keybytelen - hashbytelen - 2)</li>
	 *        </ul>
	 *        DEFAULT is -1 (NOTE: OpenSSL's default is -2.)
	 * @return returns true if valid, otherwise false
	 * @since rsasign 1.2.6
	 */
	function _rsasign_verifyWithMessageHashPSS(hHash, hSig, hashAlg, sLen) {
		var biSig = new BigInteger(hSig, 16);

		if (biSig.bitLength() > this.n.bitLength()) {
			return false;
		}

		var hashFunc = function(sHex) {
			return KJUR.crypto.Util.hashHex(sHex, hashAlg);
		};
		var mHash = hextorstr(hHash);
		var hLen = mHash.length;
		var emBits = this.n.bitLength() - 1;
		var emLen = Math.ceil(emBits / 8);
		var i;

		if (sLen === -1 || sLen === undefined) {
			sLen = hLen; // same as hash length
		} else if (sLen === -2) {
			sLen = emLen - hLen - 2; // recover
		} else if (sLen < -2) {
			throw "invalid salt length";
		}

		if (emLen < (hLen + sLen + 2)) {
			throw "data too long";
		}

		var em = this.doPublic(biSig).toByteArray();

		for (i = 0; i < em.length; i += 1) {
			em[i] &= 0xff;
		}

		while (em.length < emLen) {
			em.unshift(0);
		}

		if (em[emLen - 1] !== 0xbc) {
			throw "encoded message does not end in 0xbc";
		}

		em = String.fromCharCode.apply(String, em);

		var maskedDB = em.substr(0, emLen - hLen - 1);
		var H = em.substr(maskedDB.length, hLen);

		var mask = (0xff00 >> (8 * emLen - emBits)) & 0xff;

		if ((maskedDB.charCodeAt(0) & mask) !== 0) {
			throw "bits beyond keysize not zero";
		}

		var dbMask = pss_mgf1_str(H, maskedDB.length, hashFunc);
		var DB = [];

		for (i = 0; i < maskedDB.length; i += 1) {
			DB[i] = maskedDB.charCodeAt(i) ^ dbMask.charCodeAt(i);
		}

		DB[0] &= ~mask;

		var checkLen = emLen - hLen - sLen - 2;

		for (i = 0; i < checkLen; i += 1) {
			if (DB[i] !== 0x00) {
				throw "leftmost octets not zero";
			}
		}

		if (DB[checkLen] !== 0x01) {
			throw "0x01 marker not found";
		}

		return H === hextorstr(hashFunc(rstrtohex('\x00\x00\x00\x00\x00\x00\x00\x00' + mHash +
			String.fromCharCode.apply(String, DB.slice(-sLen)))));
	}

	RSAKey.prototype.signWithMessageHash = _rsasign_signWithMessageHash;
	RSAKey.prototype.signString = _rsasign_signString;
	RSAKey.prototype.signStringWithSHA1 = _rsasign_signStringWithSHA1;
	RSAKey.prototype.signStringWithSHA256 = _rsasign_signStringWithSHA256;
	RSAKey.prototype.sign = _rsasign_signString;
	RSAKey.prototype.signWithSHA1 = _rsasign_signStringWithSHA1;
	RSAKey.prototype.signWithSHA256 = _rsasign_signStringWithSHA256;

	RSAKey.prototype.signWithMessageHashPSS = _rsasign_signWithMessageHashPSS;
	RSAKey.prototype.signStringPSS = _rsasign_signStringPSS;
	RSAKey.prototype.signPSS = _rsasign_signStringPSS;
	RSAKey.SALT_LEN_HLEN = -1;
	RSAKey.SALT_LEN_MAX = -2;

	RSAKey.prototype.verifyWithMessageHash = _rsasign_verifyWithMessageHash;
	RSAKey.prototype.verifyString = _rsasign_verifyString;
	RSAKey.prototype.verifyHexSignatureForMessage = _rsasign_verifyHexSignatureForMessage;
	RSAKey.prototype.verify = _rsasign_verifyString;
	RSAKey.prototype.verifyHexSignatureForByteArrayMessage = _rsasign_verifyHexSignatureForMessage;

	RSAKey.prototype.verifyWithMessageHashPSS = _rsasign_verifyWithMessageHashPSS;
	RSAKey.prototype.verifyStringPSS = _rsasign_verifyStringPSS;
	RSAKey.prototype.verifyPSS = _rsasign_verifyStringPSS;
	RSAKey.SALT_LEN_RECOVER = -2;

	/**
	 * @name RSAKey
	 * @class key of RSA public key algorithm
	 * @description Tom Wu's RSA Key class and extension
	 */

	/*! crypto-1.1.10.js (c) 2013-2016 Kenji Urushima | kjur.github.com/jsrsasign/license
	 */
	/*
	 * crypto.js - Cryptographic Algorithm Provider class
	 *
	 * Copyright (c) 2013-2016 Kenji Urushima (kenji.urushima@gmail.com)
	 *
	 * This software is licensed under the terms of the MIT License.
	 * http://kjur.github.com/jsrsasign/license
	 *
	 * The above copyright and license notice shall be 
	 * included in all copies or substantial portions of the Software.
	 */

	/**
	 * @fileOverview
	 * @name crypto-1.1.js
	 * @author Kenji Urushima kenji.urushima@gmail.com
	 * @version 1.1.10 (2016-Oct-29)
	 * @since jsrsasign 2.2
	 * @license <a href="http://kjur.github.io/jsrsasign/license/">MIT License</a>
	 */

	/** 
	 * kjur's class library name space
	 * @name KJUR
	 * @namespace kjur's class library name space
	 */
	if (typeof KJUR == "undefined" || !KJUR) KJUR = {};
	/**
	 * kjur's cryptographic algorithm provider library name space
	 * <p>
	 * This namespace privides following crytpgrahic classes.
	 * <ul>
	 * <li>{@link KJUR.crypto.MessageDigest} - Java JCE(cryptograhic extension) style MessageDigest class</li>
	 * <li>{@link KJUR.crypto.Signature} - Java JCE(cryptograhic extension) style Signature class</li>
	 * <li>{@link KJUR.crypto.Cipher} - class for encrypting and decrypting data</li>
	 * <li>{@link KJUR.crypto.Util} - cryptographic utility functions and properties</li>
	 * </ul>
	 * NOTE: Please ignore method summary and document of this namespace. This caused by a bug of jsdoc2.
	 * </p>
	 * @name KJUR.crypto
	 * @namespace
	 */
	if (typeof KJUR.crypto == "undefined" || !KJUR.crypto) KJUR.crypto = {};

	/**
	 * static object for cryptographic function utilities
	 * @name KJUR.crypto.Util
	 * @class static object for cryptographic function utilities
	 * @property {Array} DIGESTINFOHEAD PKCS#1 DigestInfo heading hexadecimal bytes for each hash algorithms
	 * @property {Array} DEFAULTPROVIDER associative array of default provider name for each hash and signature algorithms
	 * @description
	 */
	KJUR.crypto.Util = new function() {
		this.DIGESTINFOHEAD = {
			'sha1': "3021300906052b0e03021a05000414",
			'sha224': "302d300d06096086480165030402040500041c",
			'sha256': "3031300d060960864801650304020105000420",
			'sha384': "3041300d060960864801650304020205000430",
			'sha512': "3051300d060960864801650304020305000440",
			'md2': "3020300c06082a864886f70d020205000410",
			'md5': "3020300c06082a864886f70d020505000410",
			'ripemd160': "3021300906052b2403020105000414"
		};

		/*
		 * @since crypto 1.1.1
		 */
		this.DEFAULTPROVIDER = {
			'md5': 'cryptojs',
			'sha1': 'cryptojs',
			'sha224': 'cryptojs',
			'sha256': 'cryptojs',
			'sha384': 'cryptojs',
			'sha512': 'cryptojs',
			'ripemd160': 'cryptojs',
			'hmacmd5': 'cryptojs',
			'hmacsha1': 'cryptojs',
			'hmacsha224': 'cryptojs',
			'hmacsha256': 'cryptojs',
			'hmacsha384': 'cryptojs',
			'hmacsha512': 'cryptojs',
			'hmacripemd160': 'cryptojs',
			'sm3': 'cryptojs', //modify

			'MD5withRSA': 'cryptojs/jsrsa',
			'SHA1withRSA': 'cryptojs/jsrsa',
			'SHA224withRSA': 'cryptojs/jsrsa',
			'SHA256withRSA': 'cryptojs/jsrsa',
			'SHA384withRSA': 'cryptojs/jsrsa',
			'SHA512withRSA': 'cryptojs/jsrsa',
			'RIPEMD160withRSA': 'cryptojs/jsrsa',

			'MD5withECDSA': 'cryptojs/jsrsa',
			'SHA1withECDSA': 'cryptojs/jsrsa',
			'SHA224withECDSA': 'cryptojs/jsrsa',
			'SHA256withECDSA': 'cryptojs/jsrsa',
			'SHA384withECDSA': 'cryptojs/jsrsa',
			'SHA512withECDSA': 'cryptojs/jsrsa',
			'RIPEMD160withECDSA': 'cryptojs/jsrsa',

			'SHA1withDSA': 'cryptojs/jsrsa',
			'SHA224withDSA': 'cryptojs/jsrsa',
			'SHA256withDSA': 'cryptojs/jsrsa',

			'MD5withRSAandMGF1': 'cryptojs/jsrsa',
			'SHA1withRSAandMGF1': 'cryptojs/jsrsa',
			'SHA224withRSAandMGF1': 'cryptojs/jsrsa',
			'SHA256withRSAandMGF1': 'cryptojs/jsrsa',
			'SHA384withRSAandMGF1': 'cryptojs/jsrsa',
			'SHA512withRSAandMGF1': 'cryptojs/jsrsa',
			'RIPEMD160withRSAandMGF1': 'cryptojs/jsrsa'
		};

		/*
		 * @since crypto 1.1.2
		 */
		this.CRYPTOJSMESSAGEDIGESTNAME = {
			'md5': CryptoJS.algo.MD5,
			'sha1': CryptoJS.algo.SHA1,
			'sha224': CryptoJS.algo.SHA224,
			'sha256': CryptoJS.algo.SHA256,
			'sha384': CryptoJS.algo.SHA384,
			'sha512': CryptoJS.algo.SHA512,
			'ripemd160': CryptoJS.algo.RIPEMD160,
			'sm3': CryptoJS.algo.SM3
		};

		/**
		 * get hexadecimal DigestInfo
		 * @name getDigestInfoHex
		 * @memberOf KJUR.crypto.Util
		 * @function
		 * @param {String} hHash hexadecimal hash value
		 * @param {String} alg hash algorithm name (ex. 'sha1')
		 * @return {String} hexadecimal string DigestInfo ASN.1 structure
		 */
		this.getDigestInfoHex = function(hHash, alg) {
			if (typeof this.DIGESTINFOHEAD[alg] == "undefined")
				throw "alg not supported in Util.DIGESTINFOHEAD: " + alg;
			return this.DIGESTINFOHEAD[alg] + hHash;
		};

		/**
		 * get PKCS#1 padded hexadecimal DigestInfo
		 * @name getPaddedDigestInfoHex
		 * @memberOf KJUR.crypto.Util
		 * @function
		 * @param {String} hHash hexadecimal hash value of message to be signed
		 * @param {String} alg hash algorithm name (ex. 'sha1')
		 * @param {Integer} keySize key bit length (ex. 1024)
		 * @return {String} hexadecimal string of PKCS#1 padded DigestInfo
		 */
		this.getPaddedDigestInfoHex = function(hHash, alg, keySize) {
			var hDigestInfo = this.getDigestInfoHex(hHash, alg);
			var pmStrLen = keySize / 4; // minimum PM length

			if (hDigestInfo.length + 22 > pmStrLen) // len(0001+ff(*8)+00+hDigestInfo)=22
				throw "key is too short for SigAlg: keylen=" + keySize + "," + alg;

			var hHead = "0001";
			var hTail = "00" + hDigestInfo;
			var hMid = "";
			var fLen = pmStrLen - hHead.length - hTail.length;
			for (var i = 0; i < fLen; i += 2) {
				hMid += "ff";
			}
			var hPaddedMessage = hHead + hMid + hTail;
			return hPaddedMessage;
		};

		/**
		 * get hexadecimal hash of string with specified algorithm
		 * @name hashString
		 * @memberOf KJUR.crypto.Util
		 * @function
		 * @param {String} s input string to be hashed
		 * @param {String} alg hash algorithm name
		 * @return {String} hexadecimal string of hash value
		 * @since 1.1.1
		 */
		this.hashString = function(s, alg) {
			var md = new KJUR.crypto.MessageDigest({
				'alg': alg
			});
			return md.digestString(s);
		};

		/**
		 * get hexadecimal hash of hexadecimal string with specified algorithm
		 * @name hashHex
		 * @memberOf KJUR.crypto.Util
		 * @function
		 * @param {String} sHex input hexadecimal string to be hashed
		 * @param {String} alg hash algorithm name
		 * @return {String} hexadecimal string of hash value
		 * @since 1.1.1
		 */
		this.hashHex = function(sHex, alg) {
			var md = new KJUR.crypto.MessageDigest({
				'alg': alg
			});
			return md.digestHex(sHex);
		};

		/**
		 * get hexadecimal SHA1 hash of string
		 * @name sha1
		 * @memberOf KJUR.crypto.Util
		 * @function
		 * @param {String} s input string to be hashed
		 * @return {String} hexadecimal string of hash value
		 * @since 1.0.3
		 */
		this.sha1 = function(s) {
			var md = new KJUR.crypto.MessageDigest({
				'alg': 'sha1',
				'prov': 'cryptojs'
			});
			return md.digestString(s);
		};

		/**
		 * get hexadecimal SHA256 hash of string
		 * @name sha256
		 * @memberOf KJUR.crypto.Util
		 * @function
		 * @param {String} s input string to be hashed
		 * @return {String} hexadecimal string of hash value
		 * @since 1.0.3
		 */
		this.sha256 = function(s) {
			var md = new KJUR.crypto.MessageDigest({
				'alg': 'sha256',
				'prov': 'cryptojs'
			});
			return md.digestString(s);
		};

		this.sha256Hex = function(s) {
			var md = new KJUR.crypto.MessageDigest({
				'alg': 'sha256',
				'prov': 'cryptojs'
			});
			return md.digestHex(s);
		};

		/**
		 * get hexadecimal SHA512 hash of string
		 * @name sha512
		 * @memberOf KJUR.crypto.Util
		 * @function
		 * @param {String} s input string to be hashed
		 * @return {String} hexadecimal string of hash value
		 * @since 1.0.3
		 */
		this.sha512 = function(s) {
			var md = new KJUR.crypto.MessageDigest({
				'alg': 'sha512',
				'prov': 'cryptojs'
			});
			return md.digestString(s);
		};

		this.sha512Hex = function(s) {
			var md = new KJUR.crypto.MessageDigest({
				'alg': 'sha512',
				'prov': 'cryptojs'
			});
			return md.digestHex(s);
		};

		/**
		 * get hexadecimal MD5 hash of string
		 * @name md5
		 * @memberOf KJUR.crypto.Util
		 * @function
		 * @param {String} s input string to be hashed
		 * @return {String} hexadecimal string of hash value
		 * @since 1.0.3
		 */
		this.md5 = function(s) {
			var md = new KJUR.crypto.MessageDigest({
				'alg': 'md5',
				'prov': 'cryptojs'
			});
			return md.digestString(s);
		};

		/**
		 * get hexadecimal RIPEMD160 hash of string
		 * @name ripemd160
		 * @memberOf KJUR.crypto.Util
		 * @function
		 * @param {String} s input string to be hashed
		 * @return {String} hexadecimal string of hash value
		 * @since 1.0.3
		 */
		this.ripemd160 = function(s) {
			var md = new KJUR.crypto.MessageDigest({
				'alg': 'ripemd160',
				'prov': 'cryptojs'
			});
			return md.digestString(s);
		};

		/*
		 * @since 1.1.2
		 */
		this.getCryptoJSMDByName = function(s) {

		};
	};

	// === Mac ===============================================================

	/**
	 * MessageDigest class which is very similar to java.security.MessageDigest class<br/>
	 * @name KJUR.crypto.MessageDigest
	 * @class MessageDigest class which is very similar to java.security.MessageDigest class
	 * @param {Array} params parameters for constructor
	 * @property {Array} HASHLENGTH static Array of resulted byte length of hash (ex. HASHLENGTH["sha1"] == 20)
	 * @description
	 * <br/>
	 * Currently this supports following algorithm and providers combination:
	 * <ul>
	 * <li>md5 - cryptojs</li>
	 * <li>sha1 - cryptojs</li>
	 * <li>sha224 - cryptojs</li>
	 * <li>sha256 - cryptojs</li>
	 * <li>sha384 - cryptojs</li>
	 * <li>sha512 - cryptojs</li>
	 * <li>ripemd160 - cryptojs</li>
	 * <li>sha256 - sjcl (NEW from crypto.js 1.0.4)</li>
	 * </ul>
	 * @example
	 * // CryptoJS provider sample
	 * var md = new KJUR.crypto.MessageDigest({alg: "sha1", prov: "cryptojs"});
	 * md.updateString('aaa')
	 * var mdHex = md.digest()
	 *
	 * // SJCL(Stanford JavaScript Crypto Library) provider sample
	 * var md = new KJUR.crypto.MessageDigest({alg: "sha256", prov: "sjcl"}); // sjcl supports sha256 only
	 * md.updateString('aaa')
	 * var mdHex = md.digest()
	 *
	 * // HASHLENGTH property
	 * KJUR.crypto.MessageDigest.HASHLENGTH['sha1'] &rarr 20
	 * KJUR.crypto.MessageDigest.HASHLENGTH['sha512'] &rarr 64
	 */
	KJUR.crypto.MessageDigest = function(params) {
		var md = null;
		var algName = null;
		var provName = null;

		/**
		 * set hash algorithm and provider<br/>
		 * @name setAlgAndProvider
		 * @memberOf KJUR.crypto.MessageDigest#
		 * @function
		 * @param {String} alg hash algorithm name
		 * @param {String} prov provider name
		 * @description
		 * This methods set an algorithm and a cryptographic provider.<br/>
		 * Here is acceptable algorithm names ignoring cases and hyphens:
		 * <ul>
		 * <li>MD5</li>
		 * <li>SHA1</li>
		 * <li>SHA224</li>
		 * <li>SHA256</li>
		 * <li>SHA384</li>
		 * <li>SHA512</li>
		 * <li>RIPEMD160</li>
		 * </ul>
		 * NOTE: Since jsrsasign 6.2.0 crypto 1.1.10, this method ignores
		 * upper or lower cases. Also any hyphens (i.e. "-") will be ignored
		 * so that "SHA1" or "SHA-1" will be acceptable.
		 * @example
		 * // for SHA1
		 * md.setAlgAndProvider('sha1', 'cryptojs');
		 * md.setAlgAndProvider('SHA1');
		 * // for RIPEMD160
		 * md.setAlgAndProvider('ripemd160', 'cryptojs');
		 */
		this.setAlgAndProvider = function(alg, prov) {
			alg = KJUR.crypto.MessageDigest.getCanonicalAlgName(alg);

			if (alg !== null && prov === undefined) prov = KJUR.crypto.Util.DEFAULTPROVIDER[alg];

			// for cryptojs
			if (':md5:sha1:sha224:sha256:sha384:sha512:ripemd160:sm3:'.indexOf(alg) != -1 &&
				prov == 'cryptojs') {
				try {
					this.md = KJUR.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[alg].create();
				} catch (ex) {
					throw "setAlgAndProvider hash alg set fail alg=" + alg + "/" + ex;
				}
				this.updateString = function(str) {
					this.md.update(str);
				};
				this.updateHex = function(hex) {
					var wHex = CryptoJS.enc.Hex.parse(hex);
					this.md.update(wHex);
				};
				this.digest = function() {
					var hash = this.md.finalize();
					return hash.toString(CryptoJS.enc.Hex);
				};
				this.digestString = function(str) {
					this.updateString(str);
					return this.digest();
				};
				this.digestHex = function(hex) {
					this.updateHex(hex);
					return this.digest();
				};
			}
			if (':sha256:'.indexOf(alg) != -1 &&
				prov == 'sjcl') {
				try {
					this.md = new sjcl.hash.sha256();
				} catch (ex) {
					throw "setAlgAndProvider hash alg set fail alg=" + alg + "/" + ex;
				}
				this.updateString = function(str) {
					this.md.update(str);
				};
				this.updateHex = function(hex) {
					var baHex = sjcl.codec.hex.toBits(hex);
					this.md.update(baHex);
				};
				this.digest = function() {
					var hash = this.md.finalize();
					return sjcl.codec.hex.fromBits(hash);
				};
				this.digestString = function(str) {
					this.updateString(str);
					return this.digest();
				};
				this.digestHex = function(hex) {
					this.updateHex(hex);
					return this.digest();
				};
			}
		};

		/**
		 * update digest by specified string
		 * @name updateString
		 * @memberOf KJUR.crypto.MessageDigest#
		 * @function
		 * @param {String} str string to update
		 * @description
		 * @example
		 * md.updateString('New York');
		 */
		this.updateString = function(str) {
			throw "updateString(str) not supported for this alg/prov: " + this.algName + "/" + this.provName;
		};

		/**
		 * update digest by specified hexadecimal string
		 * @name updateHex
		 * @memberOf KJUR.crypto.MessageDigest#
		 * @function
		 * @param {String} hex hexadecimal string to update
		 * @description
		 * @example
		 * md.updateHex('0afe36');
		 */
		this.updateHex = function(hex) {
			throw "updateHex(hex) not supported for this alg/prov: " + this.algName + "/" + this.provName;
		};

		/**
		 * completes hash calculation and returns hash result
		 * @name digest
		 * @memberOf KJUR.crypto.MessageDigest#
		 * @function
		 * @description
		 * @example
		 * md.digest()
		 */
		this.digest = function() {
			throw "digest() not supported for this alg/prov: " + this.algName + "/" + this.provName;
		};

		/**
		 * performs final update on the digest using string, then completes the digest computation
		 * @name digestString
		 * @memberOf KJUR.crypto.MessageDigest#
		 * @function
		 * @param {String} str string to final update
		 * @description
		 * @example
		 * md.digestString('aaa')
		 */
		this.digestString = function(str) {
			throw "digestString(str) not supported for this alg/prov: " + this.algName + "/" + this.provName;
		};

		/**
		 * performs final update on the digest using hexadecimal string, then completes the digest computation
		 * @name digestHex
		 * @memberOf KJUR.crypto.MessageDigest#
		 * @function
		 * @param {String} hex hexadecimal string to final update
		 * @description
		 * @example
		 * md.digestHex('0f2abd')
		 */
		this.digestHex = function(hex) {
			throw "digestHex(hex) not supported for this alg/prov: " + this.algName + "/" + this.provName;
		};

		if (params !== undefined) {
			if (params['alg'] !== undefined) {
				this.algName = params['alg'];
				if (params['prov'] === undefined)
					this.provName = KJUR.crypto.Util.DEFAULTPROVIDER[this.algName];
				this.setAlgAndProvider(this.algName, this.provName);
			}
		}
	};

	/**
	 * get canonical hash algorithm name<br/>
	 * @name getCanonicalAlgName
	 * @memberOf KJUR.crypto.MessageDigest
	 * @function
	 * @param {String} alg hash algorithm name (ex. MD5, SHA-1, SHA1, SHA512 et.al.)
	 * @return {String} canonical hash algorithm name
	 * @since jsrsasign 6.2.0 crypto 1.1.10
	 * @description
	 * This static method normalizes from any hash algorithm name such as
	 * "SHA-1", "SHA1", "MD5", "sha512" to lower case name without hyphens
	 * such as "sha1".
	 * @example
	 * KJUR.crypto.MessageDigest.getCanonicalAlgName("SHA-1") &rarr "sha1"
	 * KJUR.crypto.MessageDigest.getCanonicalAlgName("MD5")   &rarr "md5"
	 */
	KJUR.crypto.MessageDigest.getCanonicalAlgName = function(alg) {
		if (typeof alg === "string") {
			alg = alg.toLowerCase();
			alg = alg.replace(/-/, '');
		}
		return alg;
	};

	/**
	 * get resulted hash byte length for specified algorithm name<br/>
	 * @name getHashLength
	 * @memberOf KJUR.crypto.MessageDigest
	 * @function
	 * @param {String} alg non-canonicalized hash algorithm name (ex. MD5, SHA-1, SHA1, SHA512 et.al.)
	 * @return {Integer} resulted hash byte length
	 * @since jsrsasign 6.2.0 crypto 1.1.10
	 * @description
	 * This static method returns resulted byte length for specified algorithm name such as "SHA-1".
	 * @example
	 * KJUR.crypto.MessageDigest.getHashLength("SHA-1") &rarr 20
	 * KJUR.crypto.MessageDigest.getHashLength("sha1") &rarr 20
	 */
	KJUR.crypto.MessageDigest.getHashLength = function(alg) {
		var MD = KJUR.crypto.MessageDigest
		var alg2 = MD.getCanonicalAlgName(alg);
		if (MD.HASHLENGTH[alg2] === undefined)
			throw "not supported algorithm: " + alg;
		return MD.HASHLENGTH[alg2];
	};

	// described in KJUR.crypto.MessageDigest class (since jsrsasign 6.2.0 crypto 1.1.10)
	KJUR.crypto.MessageDigest.HASHLENGTH = {
		'md5': 16,
		'sha1': 20,
		'sha224': 28,
		'sha256': 32,
		'sha384': 48,
		'sha512': 64,
		'ripemd160': 20
	};

	// === Mac ===============================================================

	/**
	 * Mac(Message Authentication Code) class which is very similar to java.security.Mac class 
	 * @name KJUR.crypto.Mac
	 * @class Mac class which is very similar to java.security.Mac class
	 * @param {Array} params parameters for constructor
	 * @description
	 * <br/>
	 * Currently this supports following algorithm and providers combination:
	 * <ul>
	 * <li>hmacmd5 - cryptojs</li>
	 * <li>hmacsha1 - cryptojs</li>
	 * <li>hmacsha224 - cryptojs</li>
	 * <li>hmacsha256 - cryptojs</li>
	 * <li>hmacsha384 - cryptojs</li>
	 * <li>hmacsha512 - cryptojs</li>
	 * </ul>
	 * NOTE: HmacSHA224 and HmacSHA384 issue was fixed since jsrsasign 4.1.4.
	 * Please use 'ext/cryptojs-312-core-fix*.js' instead of 'core.js' of original CryptoJS
	 * to avoid those issue.
	 * <br/>
	 * NOTE2: Hmac signature bug was fixed in jsrsasign 4.9.0 by providing CryptoJS
	 * bug workaround.
	 * <br/>
	 * Please see {@link KJUR.crypto.Mac.setPassword}, how to provide password
	 * in various ways in detail.
	 * @example
	 * var mac = new KJUR.crypto.Mac({alg: "HmacSHA1", "pass": "pass"});
	 * mac.updateString('aaa')
	 * var macHex = md.doFinal()
	 *
	 * // other password representation 
	 * var mac = new KJUR.crypto.Mac({alg: "HmacSHA256", "pass": {"hex":  "6161"}});
	 * var mac = new KJUR.crypto.Mac({alg: "HmacSHA256", "pass": {"utf8": "aa"}});
	 * var mac = new KJUR.crypto.Mac({alg: "HmacSHA256", "pass": {"rstr": "\x61\x61"}});
	 * var mac = new KJUR.crypto.Mac({alg: "HmacSHA256", "pass": {"b64":  "Mi02/+...a=="}});
	 * var mac = new KJUR.crypto.Mac({alg: "HmacSHA256", "pass": {"b64u": "Mi02_-...a"}});
	 */
	KJUR.crypto.Mac = function(params) {
		var mac = null;
		var pass = null;
		var algName = null;
		var provName = null;
		var algProv = null;

		this.setAlgAndProvider = function(alg, prov) {
			alg = alg.toLowerCase();

			if (alg == null) alg = "hmacsha1";

			alg = alg.toLowerCase();
			if (alg.substr(0, 4) != "hmac") {
				throw "setAlgAndProvider unsupported HMAC alg: " + alg;
			}

			if (prov === undefined) prov = KJUR.crypto.Util.DEFAULTPROVIDER[alg];
			this.algProv = alg + "/" + prov;

			var hashAlg = alg.substr(4);

			// for cryptojs
			if (':md5:sha1:sha224:sha256:sha384:sha512:ripemd160:'.indexOf(hashAlg) != -1 &&
				prov == 'cryptojs') {
				try {
					var mdObj = KJUR.crypto.Util.CRYPTOJSMESSAGEDIGESTNAME[hashAlg];
					this.mac = CryptoJS.algo.HMAC.create(mdObj, this.pass);
				} catch (ex) {
					throw "setAlgAndProvider hash alg set fail hashAlg=" + hashAlg + "/" + ex;
				}
				this.updateString = function(str) {
					this.mac.update(str);
				};
				this.updateHex = function(hex) {
					var wHex = CryptoJS.enc.Hex.parse(hex);
					this.mac.update(wHex);
				};
				this.doFinal = function() {
					var hash = this.mac.finalize();
					return hash.toString(CryptoJS.enc.Hex);
				};
				this.doFinalString = function(str) {
					this.updateString(str);
					return this.doFinal();
				};
				this.doFinalHex = function(hex) {
					this.updateHex(hex);
					return this.doFinal();
				};
			}
		};

		/**
		 * update digest by specified string
		 * @name updateString
		 * @memberOf KJUR.crypto.Mac#
		 * @function
		 * @param {String} str string to update
		 * @description
		 * @example
		 * md.updateString('New York');
		 */
		this.updateString = function(str) {
			throw "updateString(str) not supported for this alg/prov: " + this.algProv;
		};

		/**
		 * update digest by specified hexadecimal string
		 * @name updateHex
		 * @memberOf KJUR.crypto.Mac#
		 * @function
		 * @param {String} hex hexadecimal string to update
		 * @description
		 * @example
		 * md.updateHex('0afe36');
		 */
		this.updateHex = function(hex) {
			throw "updateHex(hex) not supported for this alg/prov: " + this.algProv;
		};

		/**
		 * completes hash calculation and returns hash result
		 * @name doFinal
		 * @memberOf KJUR.crypto.Mac#
		 * @function
		 * @description
		 * @example
		 * md.digest()
		 */
		this.doFinal = function() {
			throw "digest() not supported for this alg/prov: " + this.algProv;
		};

		/**
		 * performs final update on the digest using string, then completes the digest computation
		 * @name doFinalString
		 * @memberOf KJUR.crypto.Mac#
		 * @function
		 * @param {String} str string to final update
		 * @description
		 * @example
		 * md.digestString('aaa')
		 */
		this.doFinalString = function(str) {
			throw "digestString(str) not supported for this alg/prov: " + this.algProv;
		};

		/**
		 * performs final update on the digest using hexadecimal string, 
		 * then completes the digest computation
		 * @name doFinalHex
		 * @memberOf KJUR.crypto.Mac#
		 * @function
		 * @param {String} hex hexadecimal string to final update
		 * @description
		 * @example
		 * md.digestHex('0f2abd')
		 */
		this.doFinalHex = function(hex) {
			throw "digestHex(hex) not supported for this alg/prov: " + this.algProv;
		};

		/**
		 * set password for Mac
		 * @name setPassword
		 * @memberOf KJUR.crypto.Mac#
		 * @function
		 * @param {Object} pass password for Mac
		 * @since crypto 1.1.7 jsrsasign 4.9.0
		 * @description
		 * This method will set password for (H)Mac internally.
		 * Argument 'pass' can be specified as following:
		 * <ul>
		 * <li>even length string of 0..9, a..f or A-F: implicitly specified as hexadecimal string</li>
		 * <li>not above string: implicitly specified as raw string</li>
		 * <li>{rstr: "\x65\x70"}: explicitly specified as raw string</li>
		 * <li>{hex: "6570"}: explicitly specified as hexacedimal string</li>
		 * <li>{utf8: "秘密"}: explicitly specified as UTF8 string</li>
		 * <li>{b64: "Mi78..=="}: explicitly specified as Base64 string</li>
		 * <li>{b64u: "Mi7-_"}: explicitly specified as Base64URL string</li>
		 * </ul>
		 * It is *STRONGLY RECOMMENDED* that explicit representation of password argument
		 * to avoid ambiguity. For example string  "6161" can mean a string "6161" or 
		 * a hexadecimal string of "aa" (i.e. \x61\x61).
		 * @example
		 * mac = KJUR.crypto.Mac({'alg': 'hmacsha256'});
		 * // set password by implicit raw string
		 * mac.setPassword("\x65\x70\xb9\x0b");
		 * mac.setPassword("password");
		 * // set password by implicit hexadecimal string
		 * mac.setPassword("6570b90b");
		 * mac.setPassword("6570B90B");
		 * // set password by explicit raw string
		 * mac.setPassword({"rstr": "\x65\x70\xb9\x0b"});
		 * // set password by explicit hexadecimal string
		 * mac.setPassword({"hex": "6570b90b"});
		 * // set password by explicit utf8 string
		 * mac.setPassword({"utf8": "passwordパスワード");
		 * // set password by explicit Base64 string
		 * mac.setPassword({"b64": "Mb+c3f/=="});
		 * // set password by explicit Base64URL string
		 * mac.setPassword({"b64u": "Mb-c3f_"});
		 */
		this.setPassword = function(pass) {
			// internal this.pass shall be CryptoJS DWord Object for CryptoJS bug
			// work around. CrytoJS HMac password can be passed by
			// raw string as described in the manual however it doesn't
			// work properly in some case. If password was passed
			// by CryptoJS DWord which is not described in the manual
			// it seems to work. (fixed since crypto 1.1.7)

			if (typeof pass == 'string') {
				var hPass = pass;
				if (pass.length % 2 == 1 || !pass.match(/^[0-9A-Fa-f]+$/)) { // raw str
					hPass = rstrtohex(pass);
				}
				this.pass = CryptoJS.enc.Hex.parse(hPass);
				return;
			}

			if (typeof pass != 'object')
				throw "KJUR.crypto.Mac unsupported password type: " + pass;

			var hPass = null;
			if (pass.hex !== undefined) {
				if (pass.hex.length % 2 != 0 || !pass.hex.match(/^[0-9A-Fa-f]+$/))
					throw "Mac: wrong hex password: " + pass.hex;
				hPass = pass.hex;
			}
			if (pass.utf8 !== undefined) hPass = utf8tohex(pass.utf8);
			if (pass.rstr !== undefined) hPass = rstrtohex(pass.rstr);
			if (pass.b64 !== undefined) hPass = b64tohex(pass.b64);
			if (pass.b64u !== undefined) hPass = b64utohex(pass.b64u);

			if (hPass == null)
				throw "KJUR.crypto.Mac unsupported password type: " + pass;

			this.pass = CryptoJS.enc.Hex.parse(hPass);
		};

		if (params !== undefined) {
			if (params.pass !== undefined) {
				this.setPassword(params.pass);
			}
			if (params.alg !== undefined) {
				this.algName = params.alg;
				if (params['prov'] === undefined)
					this.provName = KJUR.crypto.Util.DEFAULTPROVIDER[this.algName];
				this.setAlgAndProvider(this.algName, this.provName);
			}
		}
	};

	// ====== Signature class =========================================================
	/**
	 * Signature class which is very similar to java.security.Signature class
	 * @name KJUR.crypto.Signature
	 * @class Signature class which is very similar to java.security.Signature class
	 * @param {Array} params parameters for constructor
	 * @property {String} state Current state of this signature object whether 'SIGN', 'VERIFY' or null
	 * @description
	 * <br/>
	 * As for params of constructor's argument, it can be specify following attributes:
	 * <ul>
	 * <li>alg - signature algorithm name (ex. {MD5,SHA1,SHA224,SHA256,SHA384,SHA512,RIPEMD160}with{RSA,ECDSA,DSA})</li>
	 * <li>provider - currently 'cryptojs/jsrsa' only</li>
	 * </ul>
	 * <h4>SUPPORTED ALGORITHMS AND PROVIDERS</h4>
	 * This Signature class supports following signature algorithm and provider names:
	 * <ul>
	 * <li>MD5withRSA - cryptojs/jsrsa</li>
	 * <li>SHA1withRSA - cryptojs/jsrsa</li>
	 * <li>SHA224withRSA - cryptojs/jsrsa</li>
	 * <li>SHA256withRSA - cryptojs/jsrsa</li>
	 * <li>SHA384withRSA - cryptojs/jsrsa</li>
	 * <li>SHA512withRSA - cryptojs/jsrsa</li>
	 * <li>RIPEMD160withRSA - cryptojs/jsrsa</li>
	 * <li>MD5withECDSA - cryptojs/jsrsa</li>
	 * <li>SHA1withECDSA - cryptojs/jsrsa</li>
	 * <li>SHA224withECDSA - cryptojs/jsrsa</li>
	 * <li>SHA256withECDSA - cryptojs/jsrsa</li>
	 * <li>SHA384withECDSA - cryptojs/jsrsa</li>
	 * <li>SHA512withECDSA - cryptojs/jsrsa</li>
	 * <li>RIPEMD160withECDSA - cryptojs/jsrsa</li>
	 * <li>MD5withRSAandMGF1 - cryptojs/jsrsa</li>
	 * <li>SHA1withRSAandMGF1 - cryptojs/jsrsa</li>
	 * <li>SHA224withRSAandMGF1 - cryptojs/jsrsa</li>
	 * <li>SHA256withRSAandMGF1 - cryptojs/jsrsa</li>
	 * <li>SHA384withRSAandMGF1 - cryptojs/jsrsa</li>
	 * <li>SHA512withRSAandMGF1 - cryptojs/jsrsa</li>
	 * <li>RIPEMD160withRSAandMGF1 - cryptojs/jsrsa</li>
	 * <li>SHA1withDSA - cryptojs/jsrsa</li>
	 * <li>SHA224withDSA - cryptojs/jsrsa</li>
	 * <li>SHA256withDSA - cryptojs/jsrsa</li>
	 * </ul>
	 * Here are supported elliptic cryptographic curve names and their aliases for ECDSA:
	 * <ul>
	 * <li>secp256k1</li>
	 * <li>secp256r1, NIST P-256, P-256, prime256v1</li>
	 * <li>secp384r1, NIST P-384, P-384</li>
	 * </ul>
	 * NOTE1: DSA signing algorithm is also supported since crypto 1.1.5.
	 * <h4>EXAMPLES</h4>
	 * @example
	 * // RSA signature generation
	 * var sig = new KJUR.crypto.Signature({"alg": "SHA1withRSA"});
	 * sig.init(prvKeyPEM);
	 * sig.updateString('aaa');
	 * var hSigVal = sig.sign();
	 *
	 * // DSA signature validation
	 * var sig2 = new KJUR.crypto.Signature({"alg": "SHA1withDSA"});
	 * sig2.init(certPEM);
	 * sig.updateString('aaa');
	 * var isValid = sig2.verify(hSigVal);
	 * 
	 * // ECDSA signing
	 * var sig = new KJUR.crypto.Signature({'alg':'SHA1withECDSA'});
	 * sig.init(prvKeyPEM);
	 * sig.updateString('aaa');
	 * var sigValueHex = sig.sign();
	 *
	 * // ECDSA verifying
	 * var sig2 = new KJUR.crypto.Signature({'alg':'SHA1withECDSA'});
	 * sig.init(certPEM);
	 * sig.updateString('aaa');
	 * var isValid = sig.verify(sigValueHex);
	 */
	KJUR.crypto.Signature = function(params) {
		var prvKey = null; // RSAKey/KJUR.crypto.{ECDSA,DSA} object for signing
		var pubKey = null; // RSAKey/KJUR.crypto.{ECDSA,DSA} object for verifying

		var md = null; // KJUR.crypto.MessageDigest object
		var sig = null;
		var algName = null;
		var provName = null;
		var algProvName = null;
		var mdAlgName = null;
		var pubkeyAlgName = null; // rsa,ecdsa,rsaandmgf1(=rsapss)
		var state = null;
		var pssSaltLen = -1;
		var initParams = null;

		var sHashHex = null; // hex hash value for hex
		var hDigestInfo = null;
		var hPaddedDigestInfo = null;
		var hSign = null;

		this._setAlgNames = function() {
			var matchResult = this.algName.match(/^(.+)with(.+)$/);
			if (matchResult) {
				this.mdAlgName = matchResult[1].toLowerCase();
				this.pubkeyAlgName = matchResult[2].toLowerCase();
			}
		};

		this._zeroPaddingOfSignature = function(hex, bitLength) {
			var s = "";
			var nZero = bitLength / 4 - hex.length;
			for (var i = 0; i < nZero; i++) {
				s = s + "0";
			}
			return s + hex;
		};

		/**
		 * set signature algorithm and provider
		 * @name setAlgAndProvider
		 * @memberOf KJUR.crypto.Signature#
		 * @function
		 * @param {String} alg signature algorithm name
		 * @param {String} prov provider name
		 * @description
		 * @example
		 * md.setAlgAndProvider('SHA1withRSA', 'cryptojs/jsrsa');
		 */
		this.setAlgAndProvider = function(alg, prov) {
			this._setAlgNames();
			if (prov != 'cryptojs/jsrsa')
				throw "provider not supported: " + prov;

			if (':md5:sha1:sha224:sha256:sha384:sha512:ripemd160:sm3:'.indexOf(this.mdAlgName) != -1) {
				try {
					this.md = new KJUR.crypto.MessageDigest({
						'alg': this.mdAlgName
					});
				} catch (ex) {
					throw "setAlgAndProvider hash alg set fail alg=" +
						this.mdAlgName + "/" + ex;
				}

				this.init = function(keyparam, pass) {
					var keyObj = null;
					try {
						if (pass === undefined) {
							keyObj = KEYUTIL.getKey(keyparam);
						} else {
							keyObj = KEYUTIL.getKey(keyparam, pass);
						}
					} catch (ex) {
						throw "init failed:" + ex;
					}

					if (keyObj.isPrivate === true) {
						this.prvKey = keyObj;
						this.state = "SIGN";
					} else if (keyObj.isPublic === true) {
						this.pubKey = keyObj;
						this.state = "VERIFY";
					} else {
						throw "init failed.:" + keyObj;
					}
				};

				this.initSign = function(params) {
					if (typeof params['ecprvhex'] == 'string' &&
						typeof params['eccurvename'] == 'string') {
						this.ecprvhex = params['ecprvhex'];
						this.eccurvename = params['eccurvename'];
					} else {
						this.prvKey = params;
					}
					this.state = "SIGN";
				};

				this.initVerifyByPublicKey = function(params) {
					if (typeof params['ecpubhex'] == 'string' &&
						typeof params['eccurvename'] == 'string') {
						this.ecpubhex = params['ecpubhex'];
						this.eccurvename = params['eccurvename'];
					} else if (params instanceof KJUR.crypto.ECDSA) {
						this.pubKey = params;
					} else if (params instanceof RSAKey) {
						this.pubKey = params;
					}
					this.state = "VERIFY";
				};

				this.initVerifyByCertificatePEM = function(certPEM) {
					var x509 = new X509();
					x509.readCertPEM(certPEM);
					this.pubKey = x509.subjectPublicKeyRSA;
					this.state = "VERIFY";
				};

				this.updateString = function(str) {
					this.md.updateString(str);
				};

				this.updateHex = function(hex) {
					this.md.updateHex(hex);
				};

				this.sign = function() {
					if (this.eccurvename != "sm2") { //modify
						this.sHashHex = this.md.digest();
					}
					//this.sHashHex = this.md.digest();
					if (typeof this.ecprvhex != "undefined" &&
						typeof this.eccurvename != "undefined") {
						if (this.eccurvename == "sm2") { //add
							var ec = new KJUR.crypto.SM3withSM2({
								curve: this.eccurvename
							});

							var G = ec.ecparams['G'];
							var Q = G.multiply(new BigInteger(this.ecprvhex, 16));

							var pubKeyHex = Q.getX().toBigInteger().toRadix(16) + Q.getY().toBigInteger().toRadix(16);

							var smDigest = new SM3Digest();

							var z = new SM3Digest().GetZ(G, pubKeyHex);
							var zValue = smDigest.GetWords(smDigest.GetHex(z).toString());

							var rawData = CryptoJS.enc.Utf8.stringify(this.md.md._data);
							rawData = CryptoJS.enc.Utf8.parse(rawData).toString();
							rawData = smDigest.GetWords(rawData);

							var smHash = new Array(smDigest.GetDigestSize());
							smDigest.BlockUpdate(zValue, 0, zValue.length);
							smDigest.BlockUpdate(rawData, 0, rawData.length);
							smDigest.DoFinal(smHash, 0);

							var hashHex = smDigest.GetHex(smHash).toString();

							this.sHashHex = hashHex;

							this.hSign = ec.signHex(this.sHashHex, this.ecprvhex);
						} else { //modify
							var ec = new KJUR.crypto.ECDSA({
								'curve': this.eccurvename
							});
							this.hSign = ec.signHex(this.sHashHex, this.ecprvhex);
						}
					} else if (this.prvKey instanceof RSAKey &&
						this.pubkeyAlgName == "rsaandmgf1") {
						this.hSign = this.prvKey.signWithMessageHashPSS(this.sHashHex,
							this.mdAlgName,
							this.pssSaltLen);
					} else if (this.prvKey instanceof RSAKey &&
						this.pubkeyAlgName == "rsa") {
						this.hSign = this.prvKey.signWithMessageHash(this.sHashHex,
							this.mdAlgName);
					} else if (this.prvKey instanceof KJUR.crypto.ECDSA) {
						this.hSign = this.prvKey.signWithMessageHash(this.sHashHex);
					} else if (this.prvKey instanceof KJUR.crypto.DSA) {
						this.hSign = this.prvKey.signWithMessageHash(this.sHashHex);
					} else {
						throw "Signature: unsupported public key alg: " + this.pubkeyAlgName;
					}
					return this.hSign;
				};
				this.signString = function(str) {
					this.updateString(str);
					return this.sign();
				};
				this.signHex = function(hex) {
					this.updateHex(hex);
					return this.sign();
				};
				this.verify = function(hSigVal) { //modify
					if (this.eccurvename != "sm2") {

						this.sHashHex = this.md.digest();
					}
					if (typeof this.ecpubhex != "undefined" &&
						typeof this.eccurvename != "undefined") {
						if (this.eccurvename == "sm2") {
							var ec = new KJUR.crypto.SM3withSM2({
								curve: this.eccurvename
							});

							var G = ec.ecparams['G'];

							var pubKeyHex = this.ecpubhex.substr(2, 128);

							var smDigest = new SM3Digest();

							var z = new SM3Digest().GetZ(G, pubKeyHex);
							var zValue = smDigest.GetWords(smDigest.GetHex(z).toString());

							var rawData = CryptoJS.enc.Utf8.stringify(this.md.md._data);
							rawData = CryptoJS.enc.Utf8.parse(rawData).toString();
							rawData = smDigest.GetWords(rawData);

							var smHash = new Array(smDigest.GetDigestSize());
							smDigest.BlockUpdate(zValue, 0, zValue.length);
							smDigest.BlockUpdate(rawData, 0, rawData.length);
							smDigest.DoFinal(smHash, 0);

							var hashHex = smDigest.GetHex(smHash).toString();

							this.sHashHex = hashHex;


							return ec.verifyHex(this.sHashHex, hSigVal, this.ecpubhex);
						} else {
							var ec = new KJUR.crypto.ECDSA({
								curve: this.eccurvename
							});
							return ec.verifyHex(this.sHashHex, hSigVal, this.ecpubhex);
						}
					} else if (this.pubKey instanceof RSAKey &&
						this.pubkeyAlgName == "rsaandmgf1") {
						return this.pubKey.verifyWithMessageHashPSS(this.sHashHex, hSigVal,
							this.mdAlgName,
							this.pssSaltLen);
					} else if (this.pubKey instanceof RSAKey &&
						this.pubkeyAlgName == "rsa") {
						return this.pubKey.verifyWithMessageHash(this.sHashHex, hSigVal);
					} else if (this.pubKey instanceof KJUR.crypto.ECDSA) {
						return this.pubKey.verifyWithMessageHash(this.sHashHex, hSigVal);
					} else if (this.pubKey instanceof KJUR.crypto.DSA) {
						return this.pubKey.verifyWithMessageHash(this.sHashHex, hSigVal);
					} else {
						throw "Signature: unsupported public key alg: " + this.pubkeyAlgName;
					}
				};
			}
		};

		/**
		 * Initialize this object for signing or verifying depends on key
		 * @name init
		 * @memberOf KJUR.crypto.Signature#
		 * @function
		 * @param {Object} key specifying public or private key as plain/encrypted PKCS#5/8 PEM file, certificate PEM or {@link RSAKey}, {@link KJUR.crypto.DSA} or {@link KJUR.crypto.ECDSA} object
		 * @param {String} pass (OPTION) passcode for encrypted private key
		 * @since crypto 1.1.3
		 * @description
		 * This method is very useful initialize method for Signature class since
		 * you just specify key then this method will automatically initialize it
		 * using {@link KEYUTIL.getKey} method.
		 * As for 'key',  following argument type are supported:
		 * <h5>signing</h5>
		 * <ul>
		 * <li>PEM formatted PKCS#8 encrypted RSA/ECDSA private key concluding "BEGIN ENCRYPTED PRIVATE KEY"</li>
		 * <li>PEM formatted PKCS#5 encrypted RSA/DSA private key concluding "BEGIN RSA/DSA PRIVATE KEY" and ",ENCRYPTED"</li>
		 * <li>PEM formatted PKCS#8 plain RSA/ECDSA private key concluding "BEGIN PRIVATE KEY"</li>
		 * <li>PEM formatted PKCS#5 plain RSA/DSA private key concluding "BEGIN RSA/DSA PRIVATE KEY" without ",ENCRYPTED"</li>
		 * <li>RSAKey object of private key</li>
		 * <li>KJUR.crypto.ECDSA object of private key</li>
		 * <li>KJUR.crypto.DSA object of private key</li>
		 * </ul>
		 * <h5>verification</h5>
		 * <ul>
		 * <li>PEM formatted PKCS#8 RSA/EC/DSA public key concluding "BEGIN PUBLIC KEY"</li>
		 * <li>PEM formatted X.509 certificate with RSA/EC/DSA public key concluding
		 *     "BEGIN CERTIFICATE", "BEGIN X509 CERTIFICATE" or "BEGIN TRUSTED CERTIFICATE".</li>
		 * <li>RSAKey object of public key</li>
		 * <li>KJUR.crypto.ECDSA object of public key</li>
		 * <li>KJUR.crypto.DSA object of public key</li>
		 * </ul>
		 * @example
		 * sig.init(sCertPEM)
		 */
		this.init = function(key, pass) {
			throw "init(key, pass) not supported for this alg:prov=" +
				this.algProvName;
		};

		/**
		 * Initialize this object for verifying with a public key
		 * @name initVerifyByPublicKey
		 * @memberOf KJUR.crypto.Signature#
		 * @function
		 * @param {Object} param RSAKey object of public key or associative array for ECDSA
		 * @since 1.0.2
		 * @deprecated from crypto 1.1.5. please use init() method instead.
		 * @description
		 * Public key information will be provided as 'param' parameter and the value will be
		 * following:
		 * <ul>
		 * <li>{@link RSAKey} object for RSA verification</li>
		 * <li>associative array for ECDSA verification
		 *     (ex. <code>{'ecpubhex': '041f..', 'eccurvename': 'secp256r1'}</code>)
		 * </li>
		 * </ul>
		 * @example
		 * sig.initVerifyByPublicKey(rsaPrvKey)
		 */
		this.initVerifyByPublicKey = function(rsaPubKey) {
			throw "initVerifyByPublicKey(rsaPubKeyy) not supported for this alg:prov=" +
				this.algProvName;
		};

		/**
		 * Initialize this object for verifying with a certficate
		 * @name initVerifyByCertificatePEM
		 * @memberOf KJUR.crypto.Signature#
		 * @function
		 * @param {String} certPEM PEM formatted string of certificate
		 * @since 1.0.2
		 * @deprecated from crypto 1.1.5. please use init() method instead.
		 * @description
		 * @example
		 * sig.initVerifyByCertificatePEM(certPEM)
		 */
		this.initVerifyByCertificatePEM = function(certPEM) {
			throw "initVerifyByCertificatePEM(certPEM) not supported for this alg:prov=" +
				this.algProvName;
		};

		/**
		 * Initialize this object for signing
		 * @name initSign
		 * @memberOf KJUR.crypto.Signature#
		 * @function
		 * @param {Object} param RSAKey object of public key or associative array for ECDSA
		 * @deprecated from crypto 1.1.5. please use init() method instead.
		 * @description
		 * Private key information will be provided as 'param' parameter and the value will be
		 * following:
		 * <ul>
		 * <li>{@link RSAKey} object for RSA signing</li>
		 * <li>associative array for ECDSA signing
		 *     (ex. <code>{'ecprvhex': '1d3f..', 'eccurvename': 'secp256r1'}</code>)</li>
		 * </ul>
		 * @example
		 * sig.initSign(prvKey)
		 */
		this.initSign = function(prvKey) {
			throw "initSign(prvKey) not supported for this alg:prov=" + this.algProvName;
		};

		/**
		 * Updates the data to be signed or verified by a string
		 * @name updateString
		 * @memberOf KJUR.crypto.Signature#
		 * @function
		 * @param {String} str string to use for the update
		 * @description
		 * @example
		 * sig.updateString('aaa')
		 */
		this.updateString = function(str) {
			throw "updateString(str) not supported for this alg:prov=" + this.algProvName;
		};

		/**
		 * Updates the data to be signed or verified by a hexadecimal string
		 * @name updateHex
		 * @memberOf KJUR.crypto.Signature#
		 * @function
		 * @param {String} hex hexadecimal string to use for the update
		 * @description
		 * @example
		 * sig.updateHex('1f2f3f')
		 */
		this.updateHex = function(hex) {
			throw "updateHex(hex) not supported for this alg:prov=" + this.algProvName;
		};

		/**
		 * Returns the signature bytes of all data updates as a hexadecimal string
		 * @name sign
		 * @memberOf KJUR.crypto.Signature#
		 * @function
		 * @return the signature bytes as a hexadecimal string
		 * @description
		 * @example
		 * var hSigValue = sig.sign()
		 */
		this.sign = function() {
			throw "sign() not supported for this alg:prov=" + this.algProvName;
		};

		/**
		 * performs final update on the sign using string, then returns the signature bytes of all data updates as a hexadecimal string
		 * @name signString
		 * @memberOf KJUR.crypto.Signature#
		 * @function
		 * @param {String} str string to final update
		 * @return the signature bytes of a hexadecimal string
		 * @description
		 * @example
		 * var hSigValue = sig.signString('aaa')
		 */
		this.signString = function(str) {
			throw "digestString(str) not supported for this alg:prov=" + this.algProvName;
		};

		/**
		 * performs final update on the sign using hexadecimal string, then returns the signature bytes of all data updates as a hexadecimal string
		 * @name signHex
		 * @memberOf KJUR.crypto.Signature#
		 * @function
		 * @param {String} hex hexadecimal string to final update
		 * @return the signature bytes of a hexadecimal string
		 * @description
		 * @example
		 * var hSigValue = sig.signHex('1fdc33')
		 */
		this.signHex = function(hex) {
			throw "digestHex(hex) not supported for this alg:prov=" + this.algProvName;
		};

		/**
		 * verifies the passed-in signature.
		 * @name verify
		 * @memberOf KJUR.crypto.Signature#
		 * @function
		 * @param {String} str string to final update
		 * @return {Boolean} true if the signature was verified, otherwise false
		 * @description
		 * @example
		 * var isValid = sig.verify('1fbcefdca4823a7(snip)')
		 */
		this.verify = function(hSigVal) {
			throw "verify(hSigVal) not supported for this alg:prov=" + this.algProvName;
		};

		this.initParams = params;

		if (params !== undefined) {
			if (params['alg'] !== undefined) {
				this.algName = params['alg'];
				if (params['prov'] === undefined) {
					this.provName = KJUR.crypto.Util.DEFAULTPROVIDER[this.algName];
				} else {
					this.provName = params['prov'];
				}
				this.algProvName = this.algName + ":" + this.provName;
				this.setAlgAndProvider(this.algName, this.provName);
				this._setAlgNames();
			}

			if (params['psssaltlen'] !== undefined) this.pssSaltLen = params['psssaltlen'];

			if (params['prvkeypem'] !== undefined) {
				if (params['prvkeypas'] !== undefined) {
					throw "both prvkeypem and prvkeypas parameters not supported";
				} else {
					try {
						var prvKey = new RSAKey();
						prvKey.readPrivateKeyFromPEMString(params['prvkeypem']);
						this.initSign(prvKey);
					} catch (ex) {
						throw "fatal error to load pem private key: " + ex;
					}
				}
			}
		}
	};

	// ====== Cipher class ============================================================
	/**
	 * Cipher class to encrypt and decrypt data<br/>
	 * @name KJUR.crypto.Cipher
	 * @class Cipher class to encrypt and decrypt data<br/>
	 * @param {Array} params parameters for constructor
	 * @since jsrsasign 6.2.0 crypto 1.1.10
	 * @description
	 * Here is supported canonicalized cipher algorithm names and its standard names:
	 * <ul>
	 * <li>RSA - RSA/ECB/PKCS1Padding (default for RSAKey)</li>
	 * <li>RSAOAEP - RSA/ECB/OAEPWithSHA-1AndMGF1Padding</li>
	 * <li>RSAOAEP224 - RSA/ECB/OAEPWithSHA-224AndMGF1Padding(*)</li>
	 * <li>RSAOAEP256 - RSA/ECB/OAEPWithSHA-256AndMGF1Padding</li>
	 * <li>RSAOAEP384 - RSA/ECB/OAEPWithSHA-384AndMGF1Padding(*)</li>
	 * <li>RSAOAEP512 - RSA/ECB/OAEPWithSHA-512AndMGF1Padding(*)</li>
	 * </ul>
	 * NOTE: (*) is not supported in Java JCE.<br/>
	 * Currently this class supports only RSA encryption and decryption. 
	 * However it is planning to implement also symmetric ciphers near in the future.
	 * @example
	 */
	KJUR.crypto.Cipher = function(params) {};

	/**
	 * encrypt raw string by specified key and algorithm<br/>
	 * @name encrypt
	 * @memberOf KJUR.crypto.Cipher
	 * @function
	 * @param {String} s input string to encrypt
	 * @param {Object} keyObj RSAKey object or hexadecimal string of symmetric cipher key
	 * @param {String} algName short/long algorithm name for encryption/decryption
	 * @return {String} hexadecimal encrypted string
	 * @since jsrsasign 6.2.0 crypto 1.1.10
	 * @description
	 * This static method encrypts raw string with specified key and algorithm.
	 * @example 
	 * KJUR.crypto.Cipher.encrypt("aaa", pubRSAKeyObj) &rarr; "1abc2d..."
	 * KJUR.crypto.Cipher.encrypt("aaa", pubRSAKeyObj, "RSAOAEP) &rarr; "23ab02..."
	 */
	KJUR.crypto.Cipher.encrypt = function(s, keyObj, algName) {
		if (keyObj instanceof RSAKey && keyObj.isPublic) {
			var algName2 = KJUR.crypto.Cipher.getAlgByKeyAndName(keyObj, algName);
			if (algName2 === "RSA") return keyObj.encrypt(s);
			if (algName2 === "RSAOAEP") return keyObj.encryptOAEP(s, "sha1");

			var a = algName2.match(/^RSAOAEP(\d+)$/);
			if (a !== null) return keyObj.encryptOAEP(s, "sha" + a[1]);

			throw "Cipher.encrypt: unsupported algorithm for RSAKey: " + algName;
		} else {
			throw "Cipher.encrypt: unsupported key or algorithm";
		}
	};

	/**
	 * decrypt encrypted hexadecimal string with specified key and algorithm<br/>
	 * @name decrypt
	 * @memberOf KJUR.crypto.Cipher
	 * @function
	 * @param {String} hex hexadecial string of encrypted message
	 * @param {Object} keyObj RSAKey object or hexadecimal string of symmetric cipher key
	 * @param {String} algName short/long algorithm name for encryption/decryption
	 * @return {String} hexadecimal encrypted string
	 * @since jsrsasign 6.2.0 crypto 1.1.10
	 * @description
	 * This static method decrypts encrypted hexadecimal string with specified key and algorithm.
	 * @example 
	 * KJUR.crypto.Cipher.decrypt("aaa", prvRSAKeyObj) &rarr; "1abc2d..."
	 * KJUR.crypto.Cipher.decrypt("aaa", prvRSAKeyObj, "RSAOAEP) &rarr; "23ab02..."
	 */
	KJUR.crypto.Cipher.decrypt = function(hex, keyObj, algName) {
		if (keyObj instanceof RSAKey && keyObj.isPrivate) {
			var algName2 = KJUR.crypto.Cipher.getAlgByKeyAndName(keyObj, algName);
			if (algName2 === "RSA") return keyObj.decrypt(hex);
			if (algName2 === "RSAOAEP") return keyObj.decryptOAEP(hex, "sha1");

			var a = algName2.match(/^RSAOAEP(\d+)$/);
			if (a !== null) return keyObj.decryptOAEP(hex, "sha" + a[1]);

			throw "Cipher.decrypt: unsupported algorithm for RSAKey: " + algName;
		} else {
			throw "Cipher.decrypt: unsupported key or algorithm";
		}
	};

	/**
	 * get canonicalized encrypt/decrypt algorithm name by key and short/long algorithm name<br/>
	 * @name getAlgByKeyAndName
	 * @memberOf KJUR.crypto.Cipher
	 * @function
	 * @param {Object} keyObj RSAKey object or hexadecimal string of symmetric cipher key
	 * @param {String} algName short/long algorithm name for encryption/decryption
	 * @return {String} canonicalized algorithm name for encryption/decryption
	 * @since jsrsasign 6.2.0 crypto 1.1.10
	 * @description
	 * Here is supported canonicalized cipher algorithm names and its standard names:
	 * <ul>
	 * <li>RSA - RSA/ECB/PKCS1Padding (default for RSAKey)</li>
	 * <li>RSAOAEP - RSA/ECB/OAEPWithSHA-1AndMGF1Padding</li>
	 * <li>RSAOAEP224 - RSA/ECB/OAEPWithSHA-224AndMGF1Padding(*)</li>
	 * <li>RSAOAEP256 - RSA/ECB/OAEPWithSHA-256AndMGF1Padding</li>
	 * <li>RSAOAEP384 - RSA/ECB/OAEPWithSHA-384AndMGF1Padding(*)</li>
	 * <li>RSAOAEP512 - RSA/ECB/OAEPWithSHA-512AndMGF1Padding(*)</li>
	 * </ul>
	 * NOTE: (*) is not supported in Java JCE.
	 * @example 
	 * KJUR.crypto.Cipher.getAlgByKeyAndName(objRSAKey) &rarr; "RSA"
	 * KJUR.crypto.Cipher.getAlgByKeyAndName(objRSAKey, "RSAOAEP") &rarr; "RSAOAEP"
	 */
	KJUR.crypto.Cipher.getAlgByKeyAndName = function(keyObj, algName) {
		if (keyObj instanceof RSAKey) {
			if (":RSA:RSAOAEP:RSAOAEP224:RSAOAEP256:RSAOAEP384:RSAOAEP512:".indexOf(algName) != -1)
				return algName;
			if (algName === null || algName === undefined) return "RSA";
			throw "getAlgByKeyAndName: not supported algorithm name for RSAKey: " + algName;
		}
		throw "getAlgByKeyAndName: not supported algorithm name: " + algName;
	}

	// ====== Other Utility class =====================================================

	/**
	 * static object for cryptographic function utilities
	 * @name KJUR.crypto.OID
	 * @class static object for cryptography related OIDs
	 * @property {Array} oidhex2name key value of hexadecimal OID and its name
	 *           (ex. '2a8648ce3d030107' and 'secp256r1')
	 * @since crypto 1.1.3
	 * @description
	 */
	KJUR.crypto.OID = new function() {
		this.oidhex2name = {
			'2a864886f70d010101': 'rsaEncryption',
			'2a8648ce3d0201': 'ecPublicKey',
			'2a8648ce380401': 'dsa',
			'2a8648ce3d030107': 'secp256r1',
			'2b8104001f': 'secp192k1',
			'2b81040021': 'secp224r1',
			'2b8104000a': 'secp256k1',
			'2b81040023': 'secp521r1',
			'2b81040022': 'secp384r1',
			'2a8648ce380403': 'SHA1withDSA',
			'608648016503040301': 'SHA224withDSA',
			'608648016503040302': 'SHA256withDSA'
		};
	};

	/*! ecparam-1.0.0.js (c) 2013 Kenji Urushima | kjur.github.com/jsrsasign/license
	 */
	/*
	 * ecparam.js - Elliptic Curve Cryptography Curve Parameter Definition class
	 *
	 * Copyright (c) 2013 Kenji Urushima (kenji.urushima@gmail.com)
	 *
	 * This software is licensed under the terms of the MIT License.
	 * http://kjur.github.com/jsrsasign/license
	 *
	 * The above copyright and license notice shall be 
	 * included in all copies or substantial portions of the Software.
	 */

	/**
	 * @fileOverview
	 * @name ecparam-1.1.js
	 * @author Kenji Urushima kenji.urushima@gmail.com
	 * @version 1.0.0 (2013-Jul-17)
	 * @since jsrsasign 4.0
	 * @license <a href="http://kjur.github.io/jsrsasign/license/">MIT License</a>
	 */

	if (typeof KJUR == "undefined" || !KJUR) KJUR = {};
	if (typeof KJUR.crypto == "undefined" || !KJUR.crypto) KJUR.crypto = {};

	/**
	 * static object for elliptic curve names and parameters
	 * @name KJUR.crypto.ECParameterDB
	 * @class static object for elliptic curve names and parameters
	 * @description
	 * This class provides parameters for named elliptic curves.
	 * Currently it supoprts following curve names and aliases however 
	 * the name marked (*) are available for {@link KJUR.crypto.ECDSA} and
	 * {@link KJUR.crypto.Signature} classes.
	 * <ul>
	 * <li>secp128r1</li>
	 * <li>secp160r1</li>
	 * <li>secp160k1</li>
	 * <li>secp192r1</li>
	 * <li>secp192k1</li>
	 * <li>secp224r1</li>
	 * <li>secp256r1, NIST P-256, P-256, prime256v1 (*)</li>
	 * <li>secp256k1 (*)</li>
	 * <li>secp384r1, NIST P-384, P-384 (*)</li>
	 * <li>secp521r1, NIST P-521, P-521</li>
	 * </ul>
	 * You can register new curves by using 'register' method.
	 */
	KJUR.crypto.ECParameterDB = new function() {
		var db = {};
		var aliasDB = {};

		function hex2bi(hex) {
			return new BigInteger(hex, 16);
		}

		/**
		 * get curve inforamtion associative array for curve name or alias
		 * @name getByName
		 * @memberOf KJUR.crypto.ECParameterDB
		 * @function
		 * @param {String} nameOrAlias curve name or alias name
		 * @return {Array} associative array of curve parameters
		 * @example
		 * var param = KJUR.crypto.ECParameterDB.getByName('prime256v1');
		 * var keylen = param['keylen'];
		 * var n = param['n'];
		 */
		this.getByName = function(nameOrAlias) {
			var name = nameOrAlias;
			if (typeof aliasDB[name] != "undefined") {
				name = aliasDB[nameOrAlias];
			}
			if (typeof db[name] != "undefined") {
				return db[name];
			}
			throw "unregistered EC curve name: " + name;
		};

		/**
		 * register new curve
		 * @name regist
		 * @memberOf KJUR.crypto.ECParameterDB
		 * @function
		 * @param {String} name name of curve
		 * @param {Integer} keylen key length
		 * @param {String} pHex hexadecimal value of p
		 * @param {String} aHex hexadecimal value of a
		 * @param {String} bHex hexadecimal value of b
		 * @param {String} nHex hexadecimal value of n
		 * @param {String} hHex hexadecimal value of h
		 * @param {String} gxHex hexadecimal value of Gx
		 * @param {String} gyHex hexadecimal value of Gy
		 * @param {Array} aliasList array of string for curve names aliases
		 * @param {String} oid Object Identifier for the curve
		 * @param {String} info information string for the curve
		 */
		this.regist = function(name, keylen, pHex, aHex, bHex, nHex, hHex, gxHex, gyHex, aliasList, oid, info) {
			db[name] = {};
			var p = hex2bi(pHex);
			var a = hex2bi(aHex);
			var b = hex2bi(bHex);
			var n = hex2bi(nHex);
			var h = hex2bi(hHex);
			var curve = new ECCurveFp(p, a, b);
			var G = curve.decodePointHex("04" + gxHex + gyHex);
			db[name]['name'] = name;
			db[name]['keylen'] = keylen;
			db[name]['curve'] = curve;
			db[name]['G'] = G;
			db[name]['n'] = n;
			db[name]['h'] = h;
			db[name]['oid'] = oid;
			db[name]['info'] = info;

			for (var i = 0; i < aliasList.length; i++) {
				aliasDB[aliasList[i]] = name;
			}
		};
	};

	KJUR.crypto.ECParameterDB.regist(
		"secp128r1", // name / p = 2^128 - 2^97 - 1
		128,
		"FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFF", // p
		"FFFFFFFDFFFFFFFFFFFFFFFFFFFFFFFC", // a
		"E87579C11079F43DD824993C2CEE5ED3", // b
		"FFFFFFFE0000000075A30D1B9038A115", // n
		"1", // h
		"161FF7528B899B2D0C28607CA52C5B86", // gx
		"CF5AC8395BAFEB13C02DA292DDED7A83", // gy
		[], // alias
		"", // oid (underconstruction)
		"secp128r1 : SECG curve over a 128 bit prime field"); // info

	KJUR.crypto.ECParameterDB.regist(
		"secp160k1", // name / p = 2^160 - 2^32 - 2^14 - 2^12 - 2^9 - 2^8 - 2^7 - 2^3 - 2^2 - 1
		160,
		"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFAC73", // p
		"0", // a
		"7", // b
		"0100000000000000000001B8FA16DFAB9ACA16B6B3", // n
		"1", // h
		"3B4C382CE37AA192A4019E763036F4F5DD4D7EBB", // gx
		"938CF935318FDCED6BC28286531733C3F03C4FEE", // gy
		[], // alias
		"", // oid
		"secp160k1 : SECG curve over a 160 bit prime field"); // info

	KJUR.crypto.ECParameterDB.regist(
		"secp160r1", // name / p = 2^160 - 2^31 - 1
		160,
		"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFF", // p
		"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7FFFFFFC", // a
		"1C97BEFC54BD7A8B65ACF89F81D4D4ADC565FA45", // b
		"0100000000000000000001F4C8F927AED3CA752257", // n
		"1", // h
		"4A96B5688EF573284664698968C38BB913CBFC82", // gx
		"23A628553168947D59DCC912042351377AC5FB32", // gy
		[], // alias
		"", // oid
		"secp160r1 : SECG curve over a 160 bit prime field"); // info

	KJUR.crypto.ECParameterDB.regist(
		"secp192k1", // name / p = 2^192 - 2^32 - 2^12 - 2^8 - 2^7 - 2^6 - 2^3 - 1
		192,
		"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFEE37", // p
		"0", // a
		"3", // b
		"FFFFFFFFFFFFFFFFFFFFFFFE26F2FC170F69466A74DEFD8D", // n
		"1", // h
		"DB4FF10EC057E9AE26B07D0280B7F4341DA5D1B1EAE06C7D", // gx
		"9B2F2F6D9C5628A7844163D015BE86344082AA88D95E2F9D", // gy
		[]); // alias

	KJUR.crypto.ECParameterDB.regist(
		"secp192r1", // name / p = 2^192 - 2^64 - 1
		192,
		"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFF", // p
		"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFC", // a
		"64210519E59C80E70FA7E9AB72243049FEB8DEECC146B9B1", // b
		"FFFFFFFFFFFFFFFFFFFFFFFF99DEF836146BC9B1B4D22831", // n
		"1", // h
		"188DA80EB03090F67CBF20EB43A18800F4FF0AFD82FF1012", // gx
		"07192B95FFC8DA78631011ED6B24CDD573F977A11E794811", // gy
		[]); // alias

	KJUR.crypto.ECParameterDB.regist(
		"secp224r1", // name / p = 2^224 - 2^96 + 1
		224,
		"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000001", // p
		"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFE", // a
		"B4050A850C04B3ABF54132565044B0B7D7BFD8BA270B39432355FFB4", // b
		"FFFFFFFFFFFFFFFFFFFFFFFFFFFF16A2E0B8F03E13DD29455C5C2A3D", // n
		"1", // h
		"B70E0CBD6BB4BF7F321390B94A03C1D356C21122343280D6115C1D21", // gx
		"BD376388B5F723FB4C22DFE6CD4375A05A07476444D5819985007E34", // gy
		[]); // alias

	KJUR.crypto.ECParameterDB.regist(
		"secp256k1", // name / p = 2^256 - 2^32 - 2^9 - 2^8 - 2^7 - 2^6 - 2^4 - 1
		256,
		"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", // p
		"0", // a
		"7", // b
		"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", // n
		"1", // h
		"79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798", // gx
		"483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8", // gy
		[]); // alias

	KJUR.crypto.ECParameterDB.regist(
		"secp256r1", // name / p = 2^224 (2^32 - 1) + 2^192 + 2^96 - 1
		256,
		"FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFF", // p
		"FFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFC", // a
		"5AC635D8AA3A93E7B3EBBD55769886BC651D06B0CC53B0F63BCE3C3E27D2604B", // b
		"FFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551", // n
		"1", // h
		"6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296", // gx
		"4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5", // gy
		["NIST P-256", "P-256", "prime256v1"]); // alias

	KJUR.crypto.ECParameterDB.regist(
		"secp384r1", // name
		384,
		"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFF", // p
		"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFFFF0000000000000000FFFFFFFC", // a
		"B3312FA7E23EE7E4988E056BE3F82D19181D9C6EFE8141120314088F5013875AC656398D8A2ED19D2A85C8EDD3EC2AEF", // b
		"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC7634D81F4372DDF581A0DB248B0A77AECEC196ACCC52973", // n
		"1", // h
		"AA87CA22BE8B05378EB1C71EF320AD746E1D3B628BA79B9859F741E082542A385502F25DBF55296C3A545E3872760AB7", // gx
		"3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f", // gy
		["NIST P-384", "P-384"]); // alias

	KJUR.crypto.ECParameterDB.regist(
		"secp521r1", // name
		521,
		"1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", // p
		"1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC", // a
		"051953EB9618E1C9A1F929A21A0B68540EEA2DA725B99B315F3B8B489918EF109E156193951EC7E937B1652C0BD3BB1BF073573DF883D2C34F1EF451FD46B503F00", // b
		"1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA51868783BF2F966B7FCC0148F709A5D03BB5C9B8899C47AEBB6FB71E91386409", // n
		"1", // h
		"C6858E06B70404E9CD9E3ECB662395B4429C648139053FB521F828AF606B4D3DBAA14B5E77EFE75928FE1DC127A2FFA8DE3348B3C1856A429BF97E7E31C2E5BD66", // gx
		"011839296a789a3bc0045c8a5fb42c7d1bd998f54449579b446817afbd17273e662c97ee72995ef42640c550b9013fad0761353c7086a272c24088be94769fd16650", // gy
		["NIST P-521", "P-521"]); // alias

	KJUR.crypto.ECParameterDB.regist(
		"sm2", // name
		256,
		"FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFF", // p
		"FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFC", // a
		"28E9FA9E9D9F5E344D5A9E4BCF6509A7F39789F515AB8F92DDBCBD414D940E93", // b
		"FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFF7203DF6B21C6052B53BBF40939D54123", // n
		"1", // h
		"32C4AE2C1F1981195F9904466A39C9948FE30BBFF2660BE1715A4589334C74C7", // gx
		"BC3736A2F4F6779C59BDCEE36B692153D0A9877CC62A474002DF32E52139F0A0", // gy
		["sm2", "SM2"]); // alias


	function SM2Cipher(cipherMode) {
		this.ct = 1;
		this.p2 = null;
		this.sm3keybase = null;
		this.sm3c3 = null;
		this.key = new Array(32);
		this.keyOff = 0;
		if (typeof(cipherMode) != 'undefined') {
			this.cipherMode = cipherMode
		} else {
			this.cipherMode = SM2CipherMode.C1C3C2;
		}
	}
	SM2Cipher.prototype = {
		getHexString: function(h) {
			if ((h.length & 1) == 0) {

				return h;
			} else {
				return "0" + h;
			}
		},
		hex2Byte: function(n) {
			if (n > 127 || n < -128) {
				var result = 0xff & n;
				if (result > 127) {
					result = 0x7f & n;
					result = 0x7f ^ result;
					return -(result + 1);
				}
				return result;
			} else {
				return n;
			}
		},
		Reset: function() {
			this.sm3keybase = new SM3Digest();
			this.sm3c3 = new SM3Digest();
			var xWords = this.GetWords(this.p2.getX().toBigInteger().toRadix(16));
			var yWords = this.GetWords(this.p2.getY().toBigInteger().toRadix(16));
			this.sm3c3.BlockUpdate(xWords, 0, xWords.length);

			this.sm3keybase.BlockUpdate(xWords, 0, xWords.length);
			this.sm3keybase.BlockUpdate(yWords, 0, yWords.length);
			this.ct = 1;
			this.NextKey();
		},
		NextKey: function() {
			var sm3keycur = new SM3Digest(this.sm3keybase);
			sm3keycur.Update(this.ct >> 24 & 0xff);
			sm3keycur.Update(this.ct >> 16 & 0xff);
			sm3keycur.Update(this.ct >> 8 & 0xff);
			sm3keycur.Update(this.ct & 0xff);
			sm3keycur.DoFinal(this.key, 0);
			this.keyOff = 0;
			this.ct++;
		},
		InitEncipher: function(userKey) {
			var k = null;
			var c1 = null;
			var ec = new KJUR.crypto.ECDSA({
				"curve": "sm2"
			});
			// 暂时用预置测试Ok随机的keypair.
			//var keypair = ec.generateKeyPairHex();
			var keyPairStore = [{
					"ecprvhex": "f10aeb1fe41265e45e5a137348b782b5139a81e54e302a6c7cf5513aca0c968a",
					"ecpubhex": "04281739551a4a21b497fccc38a59d15a4923427f176aa34545dfae05dad2bb89033783740f7a37a1019e225312c3ea20772cbe08e43ff47db2b6e191714724aea"
				},
				{
					"ecprvhex": "78692a4f2ab594b99f42633152312341c907fd90d8ca6f32dba1320d6579733c",
					"ecpubhex": "04721b8d9fc186c14b0ffc30f2121faa096b2fed525644d7cf4cfebb5b0af6305e840ebdc43764e12eed23991fd980a982c821a390ae6905919b8887844483ec42"
				},
				{
					"ecprvhex": "48f4b432fb0f0dd83900240ba6f70627b3f796d68f5c38d7838041b99639781f",
					"ecpubhex": "04ba024b471d006ca514a00fbaa70c3b74cac10d79a1d0c20ffedee6d8a32778fa5c40bfc0c8e14cdb12cca64af62e2396b15d4f1e466f5319e456304fa4d652f5"
				}
			];
			var idx = Math.floor(Math.random() * 3);
			var keypair = keyPairStore[Math.floor(Math.random() * 3)];
			k = new BigInteger(keypair.ecprvhex, 16);
			var pubkeyHex = keypair.ecpubhex;
			c1 = ECPointFp.decodeFromHex(ec.ecparams['curve'], pubkeyHex);
			this.p2 = userKey.multiply(k);
			this.Reset();
			return c1;
		},
		EncryptBlock: function(data) {
			this.sm3c3.BlockUpdate(data, 0, data.length);
			for (var i = 0; i < data.length; i++) {
				if (this.keyOff == this.key.length) {
					this.NextKey();
				}
				data[i] ^= this.key[this.keyOff++];
			}
		},
		InitDecipher: function(userD, c1) {
			this.p2 = c1.multiply(userD);
			this.Reset();
		},
		DecryptBlock: function(data) {
			for (var i = 0; i < data.length; i++) {
				if (this.keyOff == this.key.length) {
					this.NextKey();
				}
				data[i] ^= this.key[this.keyOff++];
			}
			this.sm3c3.BlockUpdate(data, 0, data.length);
		},
		Dofinal: function(c3) {
			var yWords = this.GetWords(this.p2.getY().toBigInteger().toRadix(16));
			this.sm3c3.BlockUpdate(yWords, 0, yWords.length);
			this.sm3c3.DoFinal(c3, 0);

			this.Reset();
		},
		Encrypt: function(pubKey, plaintext) {
			var data = new Array(plaintext.length);
			Array.Copy(plaintext, 0, data, 0, plaintext.length);
			var c1 = this.InitEncipher(pubKey);
			this.EncryptBlock(data);
			var c3 = new Array(32);
			this.Dofinal(c3);
			var hexString;
			switch (this.cipherMode) {
				case SM2CipherMode.C1C3C2:
					hexString = this.getHexString(c1.getX().toBigInteger().toRadix(16)) + this.getHexString(c1.getY().toBigInteger()
							.toRadix(16)) +
						this.GetHex(c3).toString() + this.GetHex(data).toString();
					//hexString = this.getHexString(c1.getX().toBigInteger().toRadix(16)) + this.getHexString(c1.getY().toBigInteger().toRadix(16)) + this.GetHex(c3).toString() + this.GetHex(data).toString();
					//hexString = this.getHexString(c1.getX().toBigInteger().toRadix(16)) + this.getHexString(c1.getY().toBigInteger().toRadix(16)) + this.GetHex(c3).toString() + this.GetHex(data).toString();
					break;
				case SM2CipherMode.C1C2C3:
					//hexString = c1.getX().toBigInteger().toRadix(16) + c1.getY().toBigInteger().toRadix(16) + this.GetHex(data).toString() + this.GetHex(c3).toString();
					// 目前服务端java仅提供支持该模式			            
					hexString = this.BytesToHex(c1.getEncoded(false)) + this.GetHex(data).toString() + this.GetHex(c3).toString();
					break;
				default:
					throw new Error("[SM2:Decrypt]invalid type cipherMode(" + this.cipherMode + ")");
			}
			return hexString;
		},
		// 新加同服务端java Integer.toHexString方法.
		BytesToHex: function(bytes) {
			var hex = null;
			for (var hexArray = [], i = 0; i < bytes.length; i++) {
				hex = (bytes[i] >>> 4).toString(16) + (bytes[i] & 0xF).toString(16);
				// 带负号byte的情况
				if (hex.length > 6) {
					hex = hex.substring(hex.length - 2);
				}
				hexArray.push(hex);
			}
			return hexArray.join("");
		},
		StringToBytes: function(str) {
			var ch, st, re = [];
			for (var i = 0; i < str.length; i++) {
				ch = str.charCodeAt(i); // get char  
				st = []; // set up "stack"  
				do {
					st.push(ch & 0xFF); // push byte to stack  
					ch = ch >> 8; // shift value down by 1 byte  
				}
				while (ch);
				// add stack contents to result  
				// done because chars have "wrong" endianness  
				re = re.concat(st.reverse());
			}
			// return an array of bytes  
			return re;
		},

		GetWords: function(hexStr) {
			var words = [];
			var hexStrLength = hexStr.length;
			for (var i = 0; i < hexStrLength; i += 2) {
				words[words.length] = parseInt(hexStr.substr(i, 2), 16);
			}
			return words;
		},

		GetHex: function(arr) {
			var words = new Array(32);
			var j = 0;
			for (var i = 0; i < arr.length * 2; i += 2) {
				words[i >>> 3] |= parseInt(arr[j]) << (24 - (i % 8) * 4);
				j++;
			}

			var wordArray = new CryptoJS.lib.WordArray.init(words, arr.length);
			return wordArray;
		},
		Decrypt: function(privateKey, ciphertext) {
			var hexString = ciphertext;
			var c1X = hexString.substr(0, 64);
			var c1Y = hexString.substr(0 + c1X.length, 64);
			var encrypted;
			var c3;
			switch (this.cipherMode) {
				case SM2CipherMode.C1C3C2:
					c3 = hexString.substr(c1X.length + c1Y.length, 64);
					encrypData = hexString.substr(c1X.length + c1Y.length + 64);
					break;
				case SM2CipherMode.C1C2C3:
					encrypData = hexString.substr(c1X.length + c1Y.length, hexString.length - c1X.length - c1Y.length - 64);
					c3 = hexString.substr(hexString.length - 64);
					break;
				default:
					throw new Error("[SM2:Decrypt]invalid type cipherMode(" + this.cipherMode + ")");
			}

			var data = this.GetWords(encrypData);
			var c1 = this.CreatePoint(c1X, c1Y);
			this.InitDecipher(privateKey, c1);
			this.DecryptBlock(data);
			var c3_ = new Array(32);
			this.Dofinal(c3_);
			var isDecrypt = this.GetHex(c3_).toString() == c3;
			if (isDecrypt) {
				var wordArray = this.GetHex(data);
				var decryptData = CryptoJS.enc.Utf8.stringify(wordArray);
				return decryptData;
			} else {
				throw new Error("[SM2:Decrypt] C3 is not match!");
				return '';
			}
		},
		CreatePoint: function(x, y) {
			var ec = new KJUR.crypto.ECDSA({
				"curve": "sm2"
			});
			var ecc_curve = ec.ecparams['curve'];
			var pubkeyHex = '04' + x + y;
			var point = ECPointFp.decodeFromHex(ec.ecparams['curve'], pubkeyHex);
			return point;
		}
	};
	var SM2CipherMode = {
		C1C2C3: 0,
		C1C3C2: 1
	};
	/*! sm3-sm2-1.0.js (c) Jonllen Peng | http://www.jonllen.com/
	 */
	/*
	 * sm3-sm2-1.0.js
	 * 
	 * Copyright (c) 2014 Jonllen Peng (www.jonllen.com)
	 */
	/**
	 * @fileOverview
	 * @name sm3-sm2-1.0.js
	 * @author Jonllen (www.jonllen.com)
	 * @version 1.0.0 (2014-06-18)
	 */

	if (typeof KJUR == "undefined" || !KJUR) KJUR = {};
	if (typeof KJUR.crypto == "undefined" || !KJUR.crypto) KJUR.crypto = {};

	/**
	 * class for SM2 key generation,  sm3WithSM2 signing and verifcation
	 * @name KJUR.crypto.SM3withSM2
	 * @class class for SM2 key generation,  SM2 signing and verifcation
	 * @description
	 * <p>
	 * CAUTION: Most of the case, you don't need to use this class except
	 * for generating an SM2 key pair. Please use {@link KJUR.crypto.Signature} class instead.
	 * </p>
	 * <p>
	 * This class was originally developped by Stefan Thomas for Bitcoin JavaScript library.
	 * Currently this class supports following named curves and their aliases.
	 * <ul>
	 * <li>secp256r1, NIST P-256, P-256, prime256v1 (*)</li>
	 * <li>secp256k1 (*)</li>
	 * <li>secp384r1, NIST P-384, P-384 (*)</li>
	 * <li>sm2</li>
	 * </ul>
	 * </p>
	 */
	KJUR.crypto.SM3withSM2 = function(params) {
		var curveName = "sm2"; // curve name default
		var ecparams = null;
		var prvKeyHex = null;
		var pubKeyHex = null;

		var rng = new SecureRandom();

		var P_OVER_FOUR = null;

		this.type = "SM2";

		function implShamirsTrick(P, k, Q, l) {
			var m = Math.max(k.bitLength(), l.bitLength());
			var Z = P.add2D(Q);
			var R = P.curve.getInfinity();

			for (var i = m - 1; i >= 0; --i) {
				R = R.twice2D();

				R.z = BigInteger.ONE;

				if (k.testBit(i)) {
					if (l.testBit(i)) {
						R = R.add2D(Z);
					} else {
						R = R.add2D(P);
					}
				} else {
					if (l.testBit(i)) {
						R = R.add2D(Q);
					}
				}
			}

			return R;
		};

		//===========================
		// PUBLIC METHODS
		//===========================
		this.getBigRandom = function(limit) {
			return new BigInteger(limit.bitLength(), rng)
				.mod(limit.subtract(BigInteger.ONE))
				.add(BigInteger.ONE);
		};

		this.setNamedCurve = function(curveName) {
			this.ecparams = KJUR.crypto.ECParameterDB.getByName(curveName);
			this.prvKeyHex = null;
			this.pubKeyHex = null;
			this.curveName = curveName;
		}

		this.setPrivateKeyHex = function(prvKeyHex) {
			this.isPrivate = true;
			this.prvKeyHex = prvKeyHex;
		}

		this.setPublicKeyHex = function(pubKeyHex) {
			this.isPublic = true;
			this.pubKeyHex = pubKeyHex;
		}

		/**
		 * generate a EC key pair
		 * @name generateKeyPairHex
		 * @memberOf KJUR.crypto.ECDSA
		 * @function
		 * @return {Array} associative array of hexadecimal string of private and public key
		 * @since ecdsa-modified 1.0.1
		 * @example
		 * var ec = KJUR.crypto.ECDSA({'curve': 'sm2'});
		 * var keypair = ec.generateKeyPairHex();
		 * var pubhex = keypair.ecpubhex; // hexadecimal string of EC private key (=d)
		 * var prvhex = keypair.ecprvhex; // hexadecimal string of EC public key
		 */
		this.generateKeyPairHex = function() {
			var biN = this.ecparams['n'];
			var biPrv = this.getBigRandom(biN);
			var epPub = this.ecparams['G'].multiply(biPrv);
			var biX = epPub.getX().toBigInteger();
			var biY = epPub.getY().toBigInteger();

			var charlen = this.ecparams['keylen'] / 4;
			var hPrv = ("0000000000" + biPrv.toString(16)).slice(-charlen);
			var hX = ("0000000000" + biX.toString(16)).slice(-charlen);
			var hY = ("0000000000" + biY.toString(16)).slice(-charlen);
			var hPub = "04" + hX + hY;

			this.setPrivateKeyHex(hPrv);
			this.setPublicKeyHex(hPub);
			return {
				'ecprvhex': hPrv,
				'ecpubhex': hPub
			};
		};

		this.signWithMessageHash = function(hashHex) {
			return this.signHex(hashHex, this.prvKeyHex);
		};

		/**
		 * signing to message hash
		 * @name signHex
		 * @memberOf KJUR.crypto.SM3withSM2
		 * @function
		 * @param {String} hashHex hexadecimal string of hash value of signing message
		 * @param {String} privHex hexadecimal string of EC private key
		 * @return {String} hexadecimal string of ECDSA signature
		 * @since ecdsa-modified 1.0.1
		 * @example
		 * var ec = KJUR.crypto.SM3withSM2({'curve': 'sm2'});
		 * var sigValue = ec.signHex(hash, prvKey);
		 */
		this.signHex = function(hashHex, privHex) {
			var d = new BigInteger(privHex, 16);
			var n = this.ecparams['n'];
			var e = new BigInteger(hashHex, 16);

			// k BigInteger
			var k = null;
			var kp = null;
			var r = null;
			var s = null;
			var userD = d;

			do {
				do {
					var keypair = this.generateKeyPairHex();

					k = new BigInteger(keypair.ecprvhex, 16);
					var pubkeyHex = keypair.ecpubhex;

					kp = ECPointFp.decodeFromHex(this.ecparams['curve'], pubkeyHex);
					// r
					r = e.add(kp.getX().toBigInteger());
					r = r.mod(n);
				}
				while (r.equals(BigInteger.ZERO) || r.add(k).equals(n));

				// (1 + dA)~-1
				var da_1 = userD.add(BigInteger.ONE);
				da_1 = da_1.modInverse(n);
				// s
				s = r.multiply(userD);
				s = k.subtract(s).mod(n);
				s = da_1.multiply(s).mod(n);
			} while (s.equals(BigInteger.ZERO));


			return KJUR.crypto.ECDSA.biRSSigToASN1Sig(r, s);
		};

		this.sign = function(hash, priv) {
			var d = priv;
			var n = this.ecparams['n'];
			var e = BigInteger.fromByteArrayUnsigned(hash);

			do {
				var k = this.getBigRandom(n);
				var G = this.ecparams['G'];
				var Q = G.multiply(k);
				var r = Q.getX().toBigInteger().mod(n);
			} while (r.compareTo(BigInteger.ZERO) <= 0);

			var s = k.modInverse(n).multiply(e.add(d.multiply(r))).mod(n);
			return this.serializeSig(r, s);
		};

		this.verifyWithMessageHash = function(hashHex, sigHex) {
			return this.verifyHex(hashHex, sigHex, this.pubKeyHex);
		};

		/**
		 * verifying signature with message hash and public key
		 * @name verifyHex
		 * @memberOf KJUR.crypto.SM3withSM2
		 * @function
		 * @param {String} hashHex hexadecimal string of hash value of signing message
		 * @param {String} sigHex hexadecimal string of signature value
		 * @param {String} pubkeyHex hexadecimal string of public key
		 * @return {Boolean} true if the signature is valid, otherwise false
		 * @since ecdsa-modified 1.0.1
		 * @example
		 * var ec = KJUR.crypto.SM3withSM2({'curve': 'sm2'});
		 * var result = ec.verifyHex(msgHashHex, sigHex, pubkeyHex);
		 */
		this.verifyHex = function(hashHex, sigHex, pubkeyHex) {
			var r, s;

			var obj = KJUR.crypto.ECDSA.parseSigHex(sigHex);
			r = obj.r;
			s = obj.s;

			var Q;
			Q = ECPointFp.decodeFromHex(this.ecparams['curve'], pubkeyHex);
			var e = new BigInteger(hashHex, 16);

			return this.verifyRaw(e, r, s, Q);
		};

		this.verify = function(hash, sig, pubkey) {
			var r, s;
			if (Bitcoin.Util.isArray(sig)) {
				var obj = this.parseSig(sig);
				r = obj.r;
				s = obj.s;
			} else if ("object" === typeof sig && sig.r && sig.s) {
				r = sig.r;
				s = sig.s;
			} else {
				throw "Invalid value for signature";
			}

			var Q;
			if (pubkey instanceof ECPointFp) {
				Q = pubkey;
			} else if (Bitcoin.Util.isArray(pubkey)) {
				Q = ECPointFp.decodeFrom(this.ecparams['curve'], pubkey);
			} else {
				throw "Invalid format for pubkey value, must be byte array or ECPointFp";
			}
			var e = BigInteger.fromByteArrayUnsigned(hash);

			return this.verifyRaw(e, r, s, Q);
		};

		this.verifyRaw = function(e, r, s, Q) {
			var n = this.ecparams['n'];
			var G = this.ecparams['G'];

			var t = r.add(s).mod(n);
			if (t.equals(BigInteger.ZERO))
				return false;

			var x1y1 = G.multiply(s);
			x1y1 = x1y1.add(Q.multiply(t));

			var R = e.add(x1y1.getX().toBigInteger()).mod(n);
			return r.equals(R);
		};

		/**
		 * Serialize a signature into DER format.
		 *
		 * Takes two BigIntegers representing r and s and returns a byte array.
		 */
		this.serializeSig = function(r, s) {
			var rBa = r.toByteArraySigned();
			var sBa = s.toByteArraySigned();

			var sequence = [];
			sequence.push(0x02); // INTEGER
			sequence.push(rBa.length);
			sequence = sequence.concat(rBa);

			sequence.push(0x02); // INTEGER
			sequence.push(sBa.length);
			sequence = sequence.concat(sBa);

			sequence.unshift(sequence.length);
			sequence.unshift(0x30); // SEQUENCE
			return sequence;
		};

		/**
		 * Parses a byte array containing a DER-encoded signature.
		 *
		 * This function will return an object of the form:
		 *
		 * {
		 *   r: BigInteger,
		 *   s: BigInteger
		 * }
		 */
		this.parseSig = function(sig) {
			var cursor;
			if (sig[0] != 0x30)
				throw new Error("Signature not a valid DERSequence");

			cursor = 2;
			if (sig[cursor] != 0x02)
				throw new Error("First element in signature must be a DERInteger");;
			var rBa = sig.slice(cursor + 2, cursor + 2 + sig[cursor + 1]);

			cursor += 2 + sig[cursor + 1];
			if (sig[cursor] != 0x02)
				throw new Error("Second element in signature must be a DERInteger");
			var sBa = sig.slice(cursor + 2, cursor + 2 + sig[cursor + 1]);

			cursor += 2 + sig[cursor + 1];

			//if (cursor != sig.length)
			//  throw new Error("Extra bytes in signature");

			var r = BigInteger.fromByteArrayUnsigned(rBa);
			var s = BigInteger.fromByteArrayUnsigned(sBa);

			return {
				r: r,
				s: s
			};
		};

		this.parseSigCompact = function(sig) {
			if (sig.length !== 65) {
				throw "Signature has the wrong length";
			}

			// Signature is prefixed with a type byte storing three bits of
			// information.
			var i = sig[0] - 27;
			if (i < 0 || i > 7) {
				throw "Invalid signature type";
			}

			var n = this.ecparams['n'];
			var r = BigInteger.fromByteArrayUnsigned(sig.slice(1, 33)).mod(n);
			var s = BigInteger.fromByteArrayUnsigned(sig.slice(33, 65)).mod(n);

			return {
				r: r,
				s: s,
				i: i
			};
		};

		if (params !== undefined) {
			if (params['curve'] !== undefined) {
				this.curveName = params['curve'];
			}
		}
		if (this.curveName === undefined) this.curveName = curveName;
		this.setNamedCurve(this.curveName);
		if (params !== undefined) {
			if (params['prv'] !== undefined) this.setPrivateKeyHex(params['prv']);
			if (params['pub'] !== undefined) this.setPublicKeyHex(params['pub']);
		}
	};

	(function() {
		var C = CryptoJS;
		var C_lib = C.lib;
		var WordArray = C_lib.WordArray;
		var Hasher = C_lib.Hasher;
		var C_algo = C.algo;
		var W = [];
		var SM3 = C_algo.SM3 = Hasher.extend({
			_doReset: function() {
				this._hash = new WordArray.init([0x7380166f, 0x4914b2b9, 0x172442d7, 0xda8a0600, 0xa96f30bc, 0x163138aa,
					0xe38dee4d, 0xb0fb0e4e
				])
			},
			_doProcessBlock: function(M, offset) {
				var H = this._hash.words;
				var a = H[0];
				var b = H[1];
				var c = H[2];
				var d = H[3];
				var e = H[4];
				for (var i = 0; i < 80; i++) {
					if (i < 16) {
						W[i] = M[offset + i] | 0;
					} else {
						var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
						W[i] = (n << 1) | (n >>> 31)
					}
					var t = ((a << 5) | (a >>> 27)) + e + W[i];
					if (i < 20) {
						t += ((b & c) | (~b & d)) + 0x5a827999;
					} else if (i < 40) {
						t += (b ^ c ^ d) + 0x6ed9eba1
					} else if (i < 60) {
						t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
					} else {
						t += (b ^ c ^ d) - 0x359d3e2a;
					}
					e = d;
					d = c;
					c = (b << 30) | (b >>> 2);
					b = a;
					a = t
				}
				H[0] = (H[0] + a) | 0;
				H[1] = (H[1] + b) | 0;
				H[2] = (H[2] + c) | 0;
				H[3] = (H[3] + d) | 0;
				H[4] = (H[4] + e) | 0
			},
			_doFinalize: function() {
				var data = this._data;
				var dataWords = data.words;
				var nBitsTotal = this._nDataBytes * 8;
				var nBitsLeft = data.sigBytes * 8;
				dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
				dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
				dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
				data.sigBytes = dataWords.length * 4;
				this._process();
				return this._hash;
			},
			clone: function() {
				var clone = Hasher.clone.call(this);
				clone._hash = this._hash.clone();
				return clone;
			}
		});
		C.SM3 = Hasher._createHelper(SM3);
		C.HmacSM3 = Hasher._createHmacHelper(SM3)
	}());

	function SM3Digest() {
		this.BYTE_LENGTH = 64;
		this.xBuf = new Array();
		this.xBufOff = 0;
		this.byteCount = 0;
		this.DIGEST_LENGTH = 32;
		this.v0 = [0x7380166f, 0x4914b2b9, 0x172442d7, 0xda8a0600, 0xa96f30bc, 0x163138aa, 0xe38dee4d, 0xb0fb0e4e];
		//this.v0 = [0x7380166f, 0x4914b2b9, 0x172442d7, -628488704, -1452330820, 0x163138aa, -477237683, -1325724082];
		//this.v0 = [1937774191, 1226093241, 388252375, -628488704, -1452330820, 372324522, -477237683, -1325724082];
		this.v = new Array(8);
		this.v_ = new Array(8);
		this.X0 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.X = new Array(68);
		this.xOff = 0;
		this.T_00_15 = 0x79cc4519;
		this.T_16_63 = 0x7a879d8a;
		if (arguments.length > 0) {
			this.InitDigest(arguments[0]);
		} else {
			this.Init();
		}
	}
	SM3Digest.prototype = {
		Init: function() {
			this.xBuf = new Array(4);
			this.Reset();
		},
		InitDigest: function(t) {
			this.xBuf = new Array(t.xBuf.length);
			Array.Copy(t.xBuf, 0, this.xBuf, 0, t.xBuf.length);
			this.xBufOff = t.xBufOff;
			this.byteCount = t.byteCount;
			Array.Copy(t.X, 0, this.X, 0, t.X.length);
			this.xOff = t.xOff;
			Array.Copy(t.v, 0, this.v, 0, t.v.length);
		},
		GetDigestSize: function() {
			return this.DIGEST_LENGTH
		},
		Reset: function() {
			this.byteCount = 0;
			this.xBufOff = 0;
			Array.Clear(this.xBuf, 0, this.xBuf.length);
			Array.Copy(this.v0, 0, this.v, 0, this.v0.length);
			this.xOff = 0;
			Array.Copy(this.X0, 0, this.X, 0, this.X0.length);
		},
		GetByteLength: function() {
			return this.BYTE_LENGTH;
		},

		ProcessBlock: function() {
			var i;
			var ww = this.X;
			var ww_ = new Array(64);
			for (i = 16; i < 68; i++) {
				ww[i] = this.P1(ww[i - 16] ^ ww[i - 9] ^ (roateLeft(ww[i - 3], 15))) ^ (roateLeft(ww[i - 13], 7)) ^ ww[i - 6]
			}
			for (i = 0; i < 64; i++) {
				ww_[i] = ww[i] ^ ww[i + 4]
			}
			var vv = this.v;
			var vv_ = this.v_;
			Array.Copy(vv, 0, vv_, 0, this.v0.length);
			var SS1, SS2, TT1, TT2, aaa;
			//roateLeft
			for (i = 0; i < 16; i++) {
				aaa = roateLeft(vv_[0], 12);

				SS1 = aaa + vv_[4] + roateLeft(this.T_00_15, i);
				SS1 = roateLeft(SS1, 7);
				SS2 = SS1 ^ aaa;
				TT1 = this.FF_00_15(vv_[0], vv_[1], vv_[2]) + vv_[3] + SS2 + ww_[i];
				TT2 = this.GG_00_15(vv_[4], vv_[5], vv_[6]) + vv_[7] + SS1 + ww[i];
				vv_[3] = vv_[2];
				vv_[2] = roateLeft(vv_[1], 9);
				vv_[1] = vv_[0];
				vv_[0] = TT1;
				vv_[7] = vv_[6];
				vv_[6] = roateLeft(vv_[5], 19);
				vv_[5] = vv_[4];
				vv_[4] = this.P0(TT2)
			}

			for (i = 16; i < 64; i++) {
				aaa = roateLeft(vv_[0], 12);
				SS1 = aaa + vv_[4] + roateLeft(this.T_16_63, i);
				SS1 = roateLeft(SS1, 7);
				SS2 = SS1 ^ aaa;
				TT1 = this.FF_16_63(vv_[0], vv_[1], vv_[2]) + vv_[3] + SS2 + ww_[i];
				TT2 = this.GG_16_63(vv_[4], vv_[5], vv_[6]) + vv_[7] + SS1 + ww[i];
				vv_[3] = vv_[2];
				vv_[2] = roateLeft(vv_[1], 9);
				vv_[1] = vv_[0];
				vv_[0] = TT1;
				vv_[7] = vv_[6];
				vv_[6] = roateLeft(vv_[5], 19);
				vv_[5] = vv_[4];
				vv_[4] = this.P0(TT2)
			}

			for (i = 0; i < 8; i++) {
				vv[i] ^= (vv_[i]);
			}
			this.xOff = 0;
			Array.Copy(this.X0, 0, this.X, 0, this.X0.length);
		},
		ProcessWord: function(in_Renamed, inOff) {
			var n = in_Renamed[inOff] << 24;
			n |= (in_Renamed[++inOff] & 0xff) << 16;
			n |= (in_Renamed[++inOff] & 0xff) << 8;
			n |= (in_Renamed[++inOff] & 0xff);
			this.X[this.xOff] = n;
			if (++this.xOff == 16) {
				this.ProcessBlock();
			}
		},
		ProcessLength: function(bitLength) {
			if (this.xOff > 14) {
				this.ProcessBlock();
			}
			this.X[14] = (this.URShiftLong(bitLength, 32));
			this.X[15] = (bitLength & (0xffffffff));
		},
		IntToBigEndian: function(n, bs, off) {
			bs[off] = (n >>> 24 & 0xFF);
			bs[++off] = (n >>> 16 & 0xFF);
			bs[++off] = (n >>> 8 & 0xFF);
			bs[++off] = (n & 0xFF);
		},
		DoFinal: function(out_Renamed, outOff) {
			this.Finish();
			for (var i = 0; i < 8; i++) {
				this.IntToBigEndian(this.v[i], out_Renamed, outOff + i * 4);
			}
			this.Reset();
			return this.DIGEST_LENGTH
		},
		Update: function(input) {
			this.xBuf[this.xBufOff++] = input;
			if (this.xBufOff == this.xBuf.length) {
				this.ProcessWord(this.xBuf, 0);
				this.xBufOff = 0;
			}
			this.byteCount++
		},
		BlockUpdate: function(input, inOff, length) {
			while ((this.xBufOff != 0) && (length > 0)) {
				this.Update(input[inOff]);
				inOff++;
				length--;
			}
			while (length > this.xBuf.length) {
				this.ProcessWord(input, inOff);
				inOff += this.xBuf.length;
				length -= this.xBuf.length;
				this.byteCount += this.xBuf.length;
			}
			while (length > 0) {
				this.Update(input[inOff]);
				inOff++;
				length--;
			}
		},
		Finish: function() {
			var bitLength = (this.byteCount << 3);
			this.Update((128));
			while (this.xBufOff != 0) this.Update((0));
			this.ProcessLength(bitLength);
			this.ProcessBlock();
		},
		ROTATE: function(x, n) {
			return (x << n) | (this.URShift(x, (32 - n)));
		},
		P0: function(X) {
			return ((X) ^ roateLeft((X), 9) ^ roateLeft((X), 17));
		},
		P1: function(X) {
			return ((X) ^ roateLeft((X), 15) ^ roateLeft((X), 23));
		},
		FF_00_15: function(X, Y, Z) {
			return (X ^ Y ^ Z);
		},
		FF_16_63: function(X, Y, Z) {
			return ((X & Y) | (X & Z) | (Y & Z));
		},
		GG_00_15: function(X, Y, Z) {
			return (X ^ Y ^ Z);
		},
		GG_16_63: function(X, Y, Z) {
			return ((X & Y) | (~X & Z))
		},
		URShift: function(number, bits) {
			console.error(number);
			if (number > Int32.maxValue || number < Int32.minValue) {
				//number = Int32.parse(number)
				console.error(number);
				number = IntegerParse(number);
			}
			if (number >= 0) {
				return number >> bits;
			} else {
				return (number >> bits) + (2 << ~bits);
			}
		},
		URShiftLong: function(number, bits) {
			var returnV;
			var big = new BigInteger();
			big.fromInt(number);
			if (big.signum() >= 0) {
				returnV = big.shiftRight(bits).intValue()
			} else {
				var bigAdd = new BigInteger();
				bigAdd.fromInt(2);
				var shiftLeftBits = ~bits;
				var shiftLeftNumber = '';
				if (shiftLeftBits < 0) {
					var shiftRightBits = 64 + shiftLeftBits;
					for (var i = 0; i < shiftRightBits; i++) {
						shiftLeftNumber += '0'
					}
					var shiftLeftNumberBigAdd = new BigInteger();
					shiftLeftNumberBigAdd.fromInt(number >> bits);
					var shiftLeftNumberBig = new BigInteger("10" + shiftLeftNumber, 2);
					shiftLeftNumber = shiftLeftNumberBig.toRadix(10);
					var r = shiftLeftNumberBig.add(shiftLeftNumberBigAdd);
					returnV = r.toRadix(10);
				} else {
					shiftLeftNumber = bigAdd.shiftLeft((~bits)).intValue();
					returnV = (number >> bits) + shiftLeftNumber;
				}
			}
			return returnV;
		},
		GetZ: function(g, pubKeyHex) {
			var userId = CryptoJS.enc.Utf8.parse("1234567812345679");
			var len = userId.words.length * 4 * 8;
			this.Update((len >> 8 & 0x00ff));
			this.Update((len & 0x00ff));
			var userIdWords = this.GetWords(userId.toString());
			this.BlockUpdate(userIdWords, 0, userIdWords.length);
			var aWords = this.GetWords(g.curve.a.toBigInteger().toRadix(16));
			var bWords = this.GetWords(g.curve.b.toBigInteger().toRadix(16));
			var gxWords = this.GetWords(g.getX().toBigInteger().toRadix(16));
			var gyWords = this.GetWords(g.getY().toBigInteger().toRadix(16));
			var pxWords = this.GetWords(pubKeyHex.substr(0, 64));
			var pyWords = this.GetWords(pubKeyHex.substr(64, 64));
			this.BlockUpdate(aWords, 0, aWords.length);
			this.BlockUpdate(bWords, 0, bWords.length);
			this.BlockUpdate(gxWords, 0, gxWords.length);
			this.BlockUpdate(gyWords, 0, gyWords.length);
			this.BlockUpdate(pxWords, 0, pxWords.length);
			this.BlockUpdate(pyWords, 0, pyWords.length);
			var md = new Array(this.GetDigestSize());
			this.DoFinal(md, 0);
			return md;
		},
		GetWords: function(hexStr) {
			var words = [];
			var hexStrLength = hexStr.length;
			for (var i = 0; i < hexStrLength; i += 2) {
				words[words.length] = parseInt(hexStr.substr(i, 2), 16);
			}
			return words;
		},
		GetHex: function(arr) {
			var words = [];
			var j = 0;
			for (var i = 0; i < arr.length * 2; i += 2) {
				words[i >>> 3] |= parseInt(arr[j]) << (24 - (i % 8) * 4);
				j++;
			}
			var wordArray = new CryptoJS.lib.WordArray.init(words, arr.length);
			return wordArray;
		}
	};
	Array.Clear = function(destinationArray, destinationIndex, length) {
		for (var elm in destinationArray) {
			destinationArray[elm] = null;
		}
	};
	Array.Copy = function(sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
		var cloneArray = sourceArray.slice(sourceIndex, sourceIndex + length);
		for (var i = 0; i < cloneArray.length; i++) {
			destinationArray[destinationIndex] = cloneArray[i];
			destinationIndex++;
		}
	};

	function roateLeft(n, distance) {
		//return ((n << distance) | (n >>> (32 - distance)));
		return (n << distance) | (n >>> -distance);

	}
	var Int32 = {
		//minValue: -parseInt('11111111111111111111111111111111', 2),
		minValue: -parseInt('10000000000000000000000000000000', 2),
		maxValue: parseInt('1111111111111111111111111111111', 2),
		parse: function(n) {
			if (n < this.minValue) {
				var bigInteger = new Number(-n);
				var bigIntegerRadix = bigInteger.toString(2);
				var subBigIntegerRadix = bigIntegerRadix.substr(bigIntegerRadix.length - 31, 31);
				var reBigIntegerRadix = '';
				for (var i = 0; i < subBigIntegerRadix.length; i++) {
					var subBigIntegerRadixItem = subBigIntegerRadix.substr(i, 1);
					reBigIntegerRadix += subBigIntegerRadixItem == '0' ? '1' : '0';
				}
				var result = parseInt(reBigIntegerRadix, 2);
				return (result + 1);

			} else if (n > this.maxValue) {
				var bigInteger = Number(n);
				var bigIntegerRadix = bigInteger.toString(2);
				var subBigIntegerRadix = bigIntegerRadix.substr(bigIntegerRadix.length - 31, 31);
				var reBigIntegerRadix = '';
				for (var i = 0; i < subBigIntegerRadix.length; i++) {
					var subBigIntegerRadixItem = subBigIntegerRadix.substr(i, 1);
					reBigIntegerRadix += subBigIntegerRadixItem == '0' ? '1' : '0';
				}
				var result = parseInt(reBigIntegerRadix, 2);
				return -(result + 1);
			} else {
				return n;
			}
		},
		parseByte: function(n) {
			if (n > 255) {
				var result = 0xff & n;
				return result;
			}
			if (n < -256) {
				var result = 0xff & n;
				result = 0xff ^ result;
				return (result + 1);
			} else {
				return n;
			}
		}
	}

	function IntegerParse(n) {
		if (n > 2147483647 || n < -2147483648) {
			var result = 0xffffffff & n;
			if (result > 2147483647) {
				result = 0x7fffffff & n;
				result = 0x7fffffff ^ result;
				return -(result + 1);
			}
			return result;
		} else {
			return n;
		}
	}

	/**
	 * [SM2Encrypt description]
	 * @param {[type]} data       [待加密数据]
	 * @param {[type]} publickey  [公钥 hex]
	 * @param {[type]} cipherMode [加密模式 C1C3C2:1, C1C2C3:0]
	 * @return {[type]}           [返回加密后的数据 hex]
	 */
	function sm2Encrypt(data, publickey, cipherMode) {
		cipherMode = cipherMode == 0 ? cipherMode : 1;
		//msg = SM2.utf8tob64(msg);
		var msgData = CryptoJS.enc.Utf8.parse(data);

		var pubkeyHex = publickey;
		if (pubkeyHex.length > 64 * 2) {
			pubkeyHex = pubkeyHex.substr(pubkeyHex.length - 64 * 2);
		}

		var xHex = pubkeyHex.substr(0, 64);
		var yHex = pubkeyHex.substr(64);


		var cipher = new SM2Cipher(cipherMode);
		var userKey = cipher.CreatePoint(xHex, yHex);

		msgData = cipher.GetWords(msgData.toString());

		//var encryptData = cipher.Encrypt(userKey, msgData);
		//return '04' + encryptData;
		// 已调整成与服务端匹配的sm2算法一致.
		return cipher.Encrypt(userKey, msgData);
	}

	/**
	 * [SM2Decrypt sm2 解密数据]
	 * @param {[type]} encrypted  [待解密数据 hex]
	 * @param {[type]} privateKey [私钥 hex]
	 * @param {[type]} cipherMode [加密模式 C1C3C2:1, C1C2C3:0]
	 * @return {[type]}           [返回解密后的数据]
	 */

	function sm2Decrypt(encrypted, privateKey, cipherMode) {
		cipherMode = cipherMode == 0 ? cipherMode : 1;
		encrypted = encrypted.substr(2);
		//privateKey = b64tohex(privateKey);
		var privKey = new BigInteger(privateKey, 16);
		var cipher = new SM2Cipher(cipherMode);
		var decryptData = cipher.Decrypt(privKey, encrypted);
		return decryptData;
	}


	/**
	 * [SM3Decrypt sm3 摘要数据]
	 */
	function sm3Digest(plainText) {
		var rawData = CryptoJS.enc.Utf8.parse(plainText).toString();
		var smDigest = new SM3Digest();
		rawData = smDigest.GetWords(rawData);
		smDigest.BlockUpdate(rawData, 0, rawData.length);
		var smHash = new Array(smDigest.GetDigestSize());
		smDigest.DoFinal(smHash, 0);
		return smDigest.GetHex(smHash).toString()
	}

	/**
	 * 目前暂时导出需要用到的API,若后续其它功能应用还有需要的话,则再开放对应API.
	 */
	return {
		b64tohex: b64tohex,
		crypto: KJUR.crypto,
		RSAKey: RSAKey,
		sm2Encrypt: sm2Encrypt,
		sm2Decrypt: sm2Decrypt,
		sm3Digest: sm3Digest
	};
}

var CRYPTOAPI = {
	cryptoApi: _ecpSecurityCryptoApi() 
}

export default CRYPTOAPI
