module.exports	=	function(app, cfg, adv_cfg, AREQS, TPSvcs, sessionMiddleware){	
	const app_root	= app.get("app_root");
	const funcs		=	require(app_root + "/application/modules/"+adv_cfg.app.modules.functions);
	
	var runOnAll	=	function(req,res,next){
		var ip					= Forced to this during testing -- req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var servers			=	app.get("SERVERS");
		var senderId		=	req.header("senderId");
		var sharedKey	=	req.header("sharedKey");
		
		if (!senderId || !sharedKey){
			console.log("Invalid Request");
			res.send("Invalid Request");
			return;
		};

		if (app.get("CLUSTER_SHARED_KEY") != sharedKey || servers.indexOf(ip) <= -1){
			console.log("Validation failed");
			res.send("Validation failed");
			return;
		}
		next();
	}
	
	app.all('*', function(req,res,next) {
		var ip					= req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		next();
	});

	
	app.get("/api/v1/:resUrl?", runOnAll, function(req,res){
		var ACTIVE_CONNECTIONS	=	app.get("ACTIVE_CONNECTIONS");		
		app.set("ACTIVE_CONNECTIONS", ACTIVE_CONNECTIONS+1);
		var resource		=	req.params.resUrl;
		if (!resource){
			console.log("Invalid Resource");
			res.send("Invalid Resource");
			return;
		};
		
		res.sendFile(resource, {}, function(err){
			if (err){
				console.log(err);
				//res.send(false, err);
			} else {
				app.set("ACTIVE_CONNECTIONS", ACTIVE_CONNECTIONS-1);
				return;
			}
		});
		
	});
	
	
	// SYSTEM ROUTES
	
	// Get server ID
	app.get("/system/core/id/get/", runOnAll, function(req,res){
		var ip						= req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		var SERVER_OBJ	=	app.get("SERVER_OBJ");
		var SRV_ID				=	req.header("senderId");
		if (!SERVER_OBJ[ip] == false){
			console.log("*** NEW SERVER COMING ONLINE! ***")
		}
		SERVER_OBJ[ip]		=	{
			ID								:	SRV_ID,
			ActiveConnections	:	0
		};
		res.send(app.get("SRV_ID"));
		return;
	});
	
	// Get status
	app.get("/system/core/status/get/", runOnAll, function(req, res){
		res.send(app.get("ACTIVE_CONNECTIONS"));
		return;
	});
	
	// Check alive
	app.get('/system/core/heartbeat/:hbhash?/:targetId?/:sharedKey?', runOnAll, function(req, res){
		// NYI
	});
	
	
}