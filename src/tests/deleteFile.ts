import { test, beforeAll, afterAll, expect } from "bun:test";
import fsp from "node:fs/promises";
import path from "node:path";
import { Methods } from "../methods.ts";


const target = "test_file.txt";

let src:any = {
	dest:"test_directory"
};
let fileDest:string = "";

beforeAll(async() => {
	const dir = path.join(import.meta.dirname, src.dest);
	fileDest = path.join(dir, "test_file.txt");
	const data = "HELLO WORLD!";
	
	try{
		await fsp.mkdir(dir);
		await fsp.appendFile(fileDest, data, "utf8");

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


const methods = new Methods(src);

test("The target value will be a relative path pointing to the file within the source destination directory, successfully deleting the file.", async() => {
	if(!target || target.length === 0) throw new Error("Failed to emit target file."); 
	const res = await methods.deleteTarget(target as string);		
	console.log(res);
	expect(res.status).toStrictEqual(200);
});
