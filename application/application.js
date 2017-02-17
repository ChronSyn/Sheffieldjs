"use strict"

var app_root				= "";
const findup				= require('findup');
try {
	app_root = findup.sync(__dirname, "application.config");
} catch(e) {
	console.log("Could not find application.config, terminating!");
	process.exit();
};

const path							=	require('path');
const url							=	require('url');
const util							= require('util');
const os								=	require('os');
const fs								=	require('fs');
const express					=	require("express");
const session					=	require("express-session");
const methodOverride	=	require("method-override");
const cookieParser			=	require('cookie-parser');
const bodyParser				=	require('body-parser');
const http							=	require('http');
const request					=	require('request');
const async						=	require('async');

const 	cfg_file	= require(app_root + '/application.config');
const	app			=	express();
const 	cfg			= cfg_file.cfg;
const	adv_cfg	= cfg_file.adv_cfg;

var sessionMiddleware = session({
	secret							:	adv_cfg.app.session_secret,
	key								:	adv_cfg.app.session_key,
	maxAge						:	new Date(Date.now() + adv_cfg.app.session_age),
	name							:	adv_cfg.app.session_name,	// default is connect.sid - changed for protection
	resave							:	true,
	saveUninitialized		:	false,
	secure							:	true,
	httpOnly						:	true,
});

if (!adv_cfg.app.session_key || adv_cfg.app.session_key == ""){
	throw "Please ensure you set a session key in application.config (adv_cfg.app.session_key)!";
}

if (!adv_cfg.app.session_secret || adv_cfg.app.session_secret == ""){
	throw "Please ensure you set a session secret in application.config (adv_cfg.app.session_secret)!";
}

if (!adv_cfg.app.session_name || adv_cfg.app.session_name == ""){
	throw "Please ensure you set a session name in application.config (adv_cfg.app.session_name)!";
}

if (!adv_cfg.app.sharedKey || adv_cfg.app.sharedKey == ""){
	throw "Please ensure you set a shared key in application.config (adv_cfg.app.sharedKey)!";
}


app.set("app_root",app_root);
app.use(sessionMiddleware);
app.use(methodOverride());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(adv_cfg.app.public_dir));

var funcs 	= require(app_root + "/application/modules/"+adv_cfg.app.modules.functions);
var router	= require(__dirname + "/modules/"+adv_cfg.app.modules.router)(app, cfg, adv_cfg, sessionMiddleware);

function setupServers(cb ){
	funcs.core.server.generateId(function(status, SrvId){
		app.set("SRV_ID", SrvId);
		var SERVER_OBJ	=	{};
		funcs.core.hashes.generate(adv_cfg.app.sharedKey, "sha512", function(shrKey){
			
			// Set server shared key
			app.set("CLUSTER_SHARED_KEY", shrKey);
			console.log("Shared key set to: " + shrKey);

			// Advertise to each server in cluster
			adv_cfg.app.servers.forEach(function(val,index){
				var tServ	=	val;
				var ReqOpts	=	{
					url			:	tServ+"/system/core/id/get/",
					headers	:	{
						"senderId"		:	SrvId,
						"sharedKey"	:	shrKey
					}
				};
				
				request(ReqOpts, function(err, resp, remShrKey){
					//console.log(remShrKey);
					//console.log("Request result from " + tServ + " : " + remShrKey);
					SERVER_OBJ[tServ]	=	{
						"ID"									:	remShrKey,
						"ActiveConnections"		:	0,
					};
				});
			});

			app.set("ACTIVE_CONNECTIONS", 0);
			app.set("SERVER_OBJ", SERVER_OBJ)
			return cb(SERVER_OBJ);
		});
		
	});
};

setupServers(function(data){
	//console.log(data);
});

app.set("SERVERS", adv_cfg.app.servers);//SERVER_OBJ);

app.listen(cfg.app_port);











