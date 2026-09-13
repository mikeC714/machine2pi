import src from "../src.json" with { type:"json" };
import { join } from "node:path";
import  readline from "node:readline";
import { existsSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { stdout as output, stdin as input } from "node:process";

export class Methods{
	private MAX = 50 * 1024 * 1024;

	help = () => {
		console.log(
			`
			send<target>: Send file to target
			delete<target>: Delete file from target
			`
		);
	};
	
	sendDelete = async(target:string) =>{
		//target is the relative path
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

	deleteTarget = async(target:string) => {
		const targetPath = join(src.dest, target);
		if(!existsSync(targetPath)) return new Response("Target does not exist.", { status:400 });

		const file = Bun.file(targetPath);
		try{
			await file.delete();		
			return new Response("Deleting target was a success.", { status:200 });
		}catch(e){
			throw e;
		}
	}
	
	receive = async(fileName:string, contentLength:number | any, data:ReadableStream) => {

		if(contentLength > this.MAX){
			return new Response("File too large.", { status: 413 });
		};

		if(contentLength === 0){
			return new Response("FAILURE. Failed to transport file.", { status: 400 });
		}

		if(src.dest === "" || src.dest === null){
			console.log("Destination is undefined. Use <dest> in order to set your desired destination.");
			return new Response("Destination is undefined. Use <dest> in order to set your desired destination.", { status:400 });
		};

		const newPath = join(src.dest, fileName)
		const compressedPath = join(src.dest, fileName);
		const compressedFile = Bun.file(compressedPath).stream().pipeThrough(new DecompressionStream("gzip"));	

		try{
		
			await Bun.write(newPath, new Response(compressedFile));
			return new Response("Transport complete.", { status:201 });

		}catch(e){

			try{
				await unlink(newPath); 
				return new Response("FAILURE. Failed to recieve transport request.", { status: 400 });
			}catch{
			}finally{
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
			
			//absolute path leading to the file
			file = Bun.file(path);

			await fetch(src.recipient,{
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

	setDest = async(dest:string) => {
		let rl:any;
		let value:any;
		if(src.dest){
			rl = readline.createInterface({ input, output }) 

			try{
				value = await rl.question(`Source destination is already set to ${src.dest}. Would you like to change it? (Y/n)`);
				value = value.toLowerCase().trim();

				if(value === "y"){
					const newSourceDestination = await rl.question("What would you like the source destination to be?");

					if(newSourceDestination.length === 0){
						console.log("Failed to provide a valid source.");
						process.exit(1);
					};

					src.dest = newSourceDestination;
					await Bun.write("../src.json", JSON.stringify(src, null, 2));
				}else if(value === "n"){
					process.exit(1);
				};	

			}catch(e){
				console.error(e);
				process.exit(1);
			};
		}
	};

	setRecipient = async() => {
	};
}
