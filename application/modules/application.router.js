module.exports	=	function(app, cfg, adv_cfg, AREQS, TPSvcs, sessionMiddleware){
	const app_root	= app.get("app_root");
	const funcs		=	require(app_root + "/application/modules/"+adv_cfg.app.modules.functions);
	
	app.all('*', function(req,res,next) {
		var ip					= "http://devbox.net.local:"+cfg.app_port;//	Forced to this during testing -- req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		// Todo: Get status from remote server
		console.log("Request to " + req.path + " from " + ip);
		next();
	});
	
	app.get("/", function(req,res,next){
		res.send("Hello!");
	});
	
	
	// SYSTEM ROUTES
	
	// Get server ID
	app.get("/system/core/id/get/:senderId?/:sharedKey?", function(req,res){
		var ip					= "http://devbox.net.local:"+cfg.app_port;//	Forced to this during testing -- req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var servers			=	app.get("SERVERS");
		var senderId		=	req.params.senderId;
		var sharedKey	=	req.params.sharedKey;
		
		
		if (!senderId || !sharedKey){
			console.log("Invalid Request");
			res.send("Invalid Request");
			return;
		};

		//console.log(sharedKey);
		//console.log(app.get("CLUSTER_SHARED_KEY"));
		if (app.get("CLUSTER_SHARED_KEY") != sharedKey || servers.indexOf(ip) <= -1){
			console.log("Validation failed");
			res.send("Validation failed");
			return;
		}
		res.send(app.get("SRV_ID"));
		return;
	});
	
	// Check alive
	app.get('/system/core/heartbeat/:hbhash?/:targetId?/:sharedKey?', function(req, res){
		// NYI
	});
	
	
}