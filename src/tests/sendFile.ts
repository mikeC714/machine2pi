import { beforeAll, afterAll, test, describe, expect } from "bun:test";
import path from "node:path";
import request from "supertest";
import fs from "node:fs/promises";
import { server } from "../server.ts";

const app = request(server as any);

let filePath:string | any;
let dir:string | any;
let recipient = process.env.TEST_SERVER;

beforeAll(async() => {
	dir = path.join(import.meta.dirname, "test_directory");
	filePath = path.join(dir, "test_file.txt");
	const data = "Hello World!";
	try{
		await fs.mkdir(dir);	
		await fs.appendFile(filePath, data, "utf8");
	}catch(e){
		throw e;
	}
});


afterAll(async() => {
	await fs.rm(dir, { force:true });
	server.stop();
});

test("POST. Send file over http to test server", async() => {
	const res:any = app
				.delete("/")
				.send("test_file.txt");

	expect(res.status).toStrictEqual(201);
})
