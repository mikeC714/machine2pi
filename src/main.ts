#!/usr/bin/env node
// shebang for now come up with custom later
import { Methods } from "./methods.ts";
import { basename } from "node:path";

const ACTION = process.argv[1];
const TARGET = process.argv[2];

if(ACTION === undefined || TARGET === undefined){
	process.exit(1);
}

const methods = new Methods();

const actions:Record<string, any> = { 
	"dest":methods.setDest,
	"send":methods.send,
	"delete":methods.deleteTarget,
	"--help":methods.help,
}

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

Bun.serve({
	port: process.env.PORT as string,
	hostname:process.env.HOSTNAME,
	routes:{
		"/receive":{
			POST: async(req):Promise<Response> => {
				if(!req.headers.has("x-file-name")){
					return new Response("Invalid request missing headers.", { status:400 });
				};

				const pathName = basename(req.headers.get("x-file-name") as string);
				if(pathName === null){
					return new Response("Invalid request missing headers.", { status:400 });
				};

				let contentLength:number | string = req.headers.get("content-length") || 0;
				if(contentLength) contentLength = Number(contentLength);

				try{
					await methods.receive(pathName, contentLength, req.body as ReadableStream);
					return new Response(JSON.stringify({ ok:true, status: 201 }));
				}catch(e){
					throw e;
				}
			}
		},
		"/transport":{
			POST: async(req):Promise<Response> => {
				try{
					await methods.send(TARGET);
					return new Response(JSON.stringify({ ok:true })); 
				}catch(e){
					throw e;
				}
			}
		},
		"/delete":{
			DELETE: async(req):Promise<Response> => {
				try{
					return new Response(JSON.stringify({ ok:true }));
				}catch(e){
					throw e;
				}
			}	
		}
	}
})







