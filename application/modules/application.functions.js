// By default, "cb" is the callback function

let crypto	=	require("crypto");
var core	=	{
	hashes	:	{
		
		// List available system hashes
		// RETURNS: Array
		listAvailable			:	function(cb){
			return cb(crypto.getHashes());
		},
		
		// Check available hash algorithms on system
		// _hash		:	hash type to check for support
		// RETURNS: Boolean
		checkAvailable		:	function(_hash, cb){
			if (crypto.getHashes().indexOf(_hash) > -1){
				return cb(true);
			} else {
				return cb(false);
			};
		},
		
		// Generate a hash against input data under specified hash algorithm
		// _inputData	:	String data to hash
		// _algo			:	Hash algorithm
		// RETURNS: String
		generate				:	function(_inputData, _algo, cb){
			let hash	=	crypto.createHash(_algo).update(_inputData).digest('hex');
			cb(hash);				//	Callback with hash
			hash		=	null;		//	Nullify hash as already returned in callback
			return;
		},
		
		// Generate random bytes and return as hashed value
		// _len					:	number of bytes
		// _algo				:	Hash algorithm
		// RETURNS: Object
		generateRandom	:	function(_len, _algo, cb){
			let hash = crypto.randomBytes(_len, (err, buf) => {
				if (err){
					cb(false, err);
					return;
				};
				core.hashes.generate(buf.toString('hex'), _algo, function(outHash){
					cb(true, outHash);
					return;
				});
			})
		},
		
		// Compares data against a hash to check if data is identical
		// _inputHash	:	Hashed data to compare against
		// _inputData		:	Unhashed data to compare for match
		// _algo				:	Hash algorithm
		// RETURNS: Object
		compareAgainst	:	function(_inputHash, _inputData, _algo, cb){
			core.hashes.generate(_inputData, _algo, function(_hashedInputData){
				if (_hashedInputData == _inputHash){
					return cb(_inputHash, _hashedInputData, true);
				} else {
					return cb(_inputHash, _hashedInputData, false);
				}
			});
		},
	},
	
	server	:	{
		generateId	:	function(cb){
				core.hashes.generateRandom(512, "sha512", function(status, data){
					return cb(status, data);
				});
			},
		master	:	{
			// Generates an ID for master server to be distributed to slaves
			// RETURNS: Object
			
			
		},
		slave	:	{
			// Tells this server to become the master server
			becomeMaster	:	function(cb){
				//
			}
		}
	}
}
module.exports.core		=	core;







