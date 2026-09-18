#!/usr/bin/env node

import src from "../src.json" with { type:"json" }; 
import { Methods } from "./methods.ts"
import { ReqMethods } from "./reqMethods.ts"

const methods = new Methods(src);
const reqMethods = new ReqMethods(src);

const ACTION = process.argv[1];
const TARGET = process.argv[2];

if(ACTION === undefined || TARGET === undefined){
	process.exit(1);
}

const actions:Record<string, any> = { 
	"dest":methods.setDest,
	"send":reqMethods.send,
	"delete":reqMethods.sendDelete,
	"--help":methods.help,
};

if(!actions.includes(ACTION)){
	console.error(`${ACTION} is not a valid method. Use "--help" to see available methods.`);
	process.exit(1);
}

if(ACTION === "send"){
	actions.send(TARGET);
}else if(ACTION === "delete"){
	actions.deleteTarget(TARGET);
}else if(ACTION === "--help"){
	actions.help();
};

export { methods, reqMethods };






