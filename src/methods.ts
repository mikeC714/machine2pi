import { join } from "node:path";
import { existsSync } from "node:fs";
import { unlink } from "node:fs/promises";
import src from "../src.json" with { type:"json" };

export class Methods{

	help = () => {
		console.log(
			`
			send<target>: Send file to target
			delete<target>: Delete file from target
			`
		);
	};
	
	deleteTarget = async(target:string) =>{
		if(target === undefined) return;

		try{
			if(!existsSync(target)){
				console.log(`${target} does not exists.`);
				process.exit(1);
			};

			await fetch(process.env.RECIPIENT as string,{
				method:"DELETE",
				body:target
			});	

			console.log(`File Deleted Successfully!`);
			process.exit(0);

		}catch(e){
			console.error(e);
			process.exit(1);
		};	
	};
	
	receive = async(fileName:string, contentLength:number | any, data:ReadableStream) => {
		const MAX = 50 * 1024 * 1024;

		if(contentLength > MAX){
			return new Response("File too large.", { status: 413 });
		};
		if(contentLength === 0){
			return new Response("FAILURE. Failed to transport file.", { status: 400 });
		}

		if(src.dest === "" || src.dest === null){
			console.log("Destination is undefined. Use <dest> in order to set your desired destination.");
			return new Response("Destination is undefined. Use <dest> in order to set your desired destination.", { status:400 });
		};

		const fullPath = join(src.dest, fileName);

		try{

			await Bun.write(fullPath, data);
			return new Response("Transport complete.");

		}catch(e){

			try{
				await unlink(fullPath) 
			}catch{}finally{
				console.log("FAILURE write has finished cleanup.");
			}

		}finally{
			console.log("Finshed write attept.")
		}
	}; 

	send = async(path:string) => {
		if(src.recipient.length === 0 || src.recipient === ""){
			console.log("Recipient is not set. Use recipient to set recipient value.");
			process.exit(1);
		};

		if(path === undefined) return;
		let file:any;

		try{
			if(!existsSync(path)){
				console.log(`${path} does not exists.`)
				process.exit(1);
			};
			
			file = Bun.file(path);

			await fetch(process.env.RECIPIENT as string,{
				method:"POST",
				body:file
			});	
			console.log(`File Sent Successfully!`);
			process.exit(0);

		}catch(e){
			console.error(e);
			process.exit(1);
		};	
	};

	setDest = async(property:string, value:string) => {

	};
}
