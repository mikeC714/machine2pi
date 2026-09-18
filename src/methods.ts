import { decrypt } from "./utils.ts";
import { join } from "node:path";
import  readline from "node:readline";
import { existsSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { stdout as output, stdin as input } from "node:process";
import type { SOURCE } from "./types/src.d.ts";

export class Methods{
	private MAX = 50 * 1024 * 1024;
	private src:SOURCE;
	constructor(src:SOURCE){
		this.src = src;
	};

	help = () => {
		console.log(
			`
			send<target>: Send file to target
			delete<target>: Delete file from target
			`
		);
	};

	deleteTarget = async(target:string) => {
		const targetPath = join(this.src.dest, target);
		if(!existsSync(targetPath)) return new Response("Target does not exist.", { status:400});

		const file = Bun.file(targetPath);
		try{
			await file.delete();		
			return new Response("Deleting target was a success.", { status:200 });
		}catch(e){
			throw e;
		}
	};

	setDest = async(newDestination:string) => {
		let rl:any;
		let value:any;
		if(this.src.dest){
			rl = readline.createInterface({ input, output }) 

			try{
				value = await rl.question(`Source destination is already set to ${this.src.dest}. Would you like to change it? (Y/n)`);
				value = value.toLowerCase().trim();

				if(value === "y"){

					if(newDestination.length === 0){
						console.log("Failed to provide a valid source.");
						process.exit(1);
					};

					this.src.dest = newDestination;
					await Bun.write("../src.json", JSON.stringify(this.src, null, 2));

				}else if(value === "n"){
					process.exit(1);
				};	

			}catch(e){
				console.error(e);
				process.exit(1);
			};
		}
	};

	setRecipient = async(newRecipient:string) => {
		let rl:any;
		let value:any;
		if(this.src.dest){
			rl = readline.createInterface({ input, output }) 

			try{
				value = await rl.question(`Source recipient is already set to ${this.src.recipient}. Would you like to change it? (Y/n)`);
				value = value.toLowerCase().trim();

				if(value === "y"){

					if(newRecipient.length === 0){
						console.log("Failed to provide a valid source.");
						process.exit(1);
					};

					this.src.dest = newRecipient;
					await Bun.write("../src.json", JSON.stringify(this.src, null, 2));

				}else if(value === "n"){
					process.exit(1);
				};	

			}catch(e){
				console.error(e);
				process.exit(1);
			};
		};
	};

	receive = async(fileName:string, contentLength:number | any, data:ReadableStream) => {

		if(contentLength > this.MAX){
			return new Response("File too large.", { status: 413 });
		};

		if(contentLength === 0){
			return new Response("FAILURE. Failed to transport file.", { status: 400 });
		}

		if(this.src.dest === "" || this.src.dest === null){
			console.log("Destination is undefined. Use <dest> in order to set your desired destination.");
			return new Response("Destination is undefined. Use <dest> in order to set your desired destination.", { status:400 });
		};

		const newPath = join(this.src.dest, fileName)

		//create a decryption transform layer
		const decompressedData = data.pipeThrough(new DecompressionStream("gzip"));

		try{
		
			console.log("WRITTING TO THE NEW PATH")
			await Bun.write(newPath, new Response(decompressedData));
			console.log("FINSIHED WRITTING")
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
			console.log("Finshed write attempt.")
		}
	}
};




