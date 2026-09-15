import { existsSync } from "node:fs";
import type { SOURCE } from "./types/src.d.ts";


export class ReqMethods{
	private src:SOURCE;
	constructor(src:SOURCE){
		this.src = src;
	}
	
	sendDelete = async(target:string) =>{
		//target is the relative path
		if(target === undefined) return;

		try{
			await fetch(process.env.RECIPIENT as string,{
				method:"DELETE",
				body:target,
				headers:{
					"Content-type" : "application/json",
					"x-file-name": target	
				}
			});	

			console.log(`Delete Request Sent Successfully!`);
			process.exit(0);

		}catch(e){
			console.error(e);
			process.exit(1);
		};	
	};

	send = async(path:string) => {
		if(this.src.recipient.length === 0 || this.src.recipient === ""){
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

			await fetch(this.src.recipient,{
				method:"POST",
				body:file,
				headers:{
					"Content-type" : "application/json",
					"x-file-name": file,
					"content-length": file.size
				}
			});	

			console.log(`File Sent Successfully!`);
			process.exit(0);

		}catch(e){
			console.error(e);
			process.exit(1);
		};	
	};
};
