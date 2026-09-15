import { describe, test, beforeAll, afterAll, expect } from "bun:test";
import fsp from "node:fs/promises";
import fs from "node:fs";
import { createGunzip, createGzip } from "node:zlib";
import path from "node:path";
import { Methods } from "../methods.ts";


const target = "test_file.txt";

let src:any = {
	dest:"test_directory"
};
let fileDest:string = "";
let contentLen:number | string = 0;
let readStream:ReadableStream;
let writeStream:any;
let gzipStream:any;
let zipOutput:any;


beforeAll(async() => {
	const dir = path.join(import.meta.dirname, src.dest);
	fileDest = path.join(dir, "test_file.txt");
	const data = "HELLO WORLD!\n";
	writeStream = fs.createWriteStream(fileDest, { encoding:"utf8" });
	gzipStream = createGzip();
	zipOutput = fs.createWriteStream(path.join(dir, "test_file.txt.gz"));


	
	try{
		await fsp.mkdir(dir);
		const oneHundred = data.repeat(100);
		fs.appendFileSync(fileDest, oneHundred, "utf8");
		const stat = await fsp.stat(fileDest);
		contentLen = stat.size;

			
	}catch(e:any){
		if(e.code === "EEXIST") return;
	throw e;
	}finally{
		console.log("Done creation!");
	};
});

afterAll(async() => {
	await fsp.rm(src.dest, { force:true, recursive:true });	
});


describe("Receive file and save to disk using a new ReadStream", async() => {
	const methods = new Methods(src);
	readStream = Bun.file(fileDest).stream();
	const newFileName = "transport_test.txt"; 

	test("Receive file iterate over the readable stream and successfully transport the file data into another file.", async() => {
		if(!target || target.length === 0) throw new Error("Failed to emit target file."); 
		const res = await methods.receive(newFileName,contentLen,readStream);		
		console.log(res);
		expect(res?.status).toStrictEqual(200);
	});
})
