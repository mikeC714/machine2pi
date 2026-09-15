#!/usr/bin/env node
// shebang for now come up with custom later
import src from "../src.json" with { type:"json" }; 
import { basename } from "node:path";
import { Methods } from "./methods.ts"
import { ReqMethods } from "./reqMethods.ts"

const ACTION = process.argv[1];
const TARGET = process.argv[2];

if(ACTION === undefined || TARGET === undefined){
	process.exit(1);
}

const methods = new Methods(src);
const reqMethods = new ReqMethods(src);

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


export const server = Bun.serve({
	port: process.env.PORT as string,
	hostname:process.env.HOSTNAME,
	routes:{
		"/":{
			POST: async(req):Promise<Response> => {
				let fileName = basename(req.headers.get("x-file-name") as string) || null;
				if( fileName === null) return new Response("Invalid request missing headers.", { status:400 });;

				let contentLen = req.headers.get("content-length") || 0;
				if(contentLen) contentLen = Number(contentLen);

				await methods.receive(fileName, contentLen, req.body as ReadableStream);
				return new Response(JSON.stringify({ ok:true, status: 201 }));
			},
			DELETE: async(req):Promise<Response> => {
				let fileName = basename(req.headers.get("x-file-name") as string) || null;
				if( fileName === null) return new Response("Invalid request missing headers.", { status:400 });;

				await methods.deleteTarget(fileName);
				return new Response(JSON.stringify({ ok:true, status:200 }));
			}
		},
	}
})







