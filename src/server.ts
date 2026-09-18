#!/usr/bin/env node

import { basename } from "node:path";
import { methods } from "./main.ts";

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
		"/ping": async():Promise<Response> => {
			return new Response("PONG")
		}
	}
});

