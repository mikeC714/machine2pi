import { $ } from "bun";
import { homedir } from  "node:os";


const TARGET = "./main.ts";
const COMMAND = "bulux";

async function setup(){
	const dir = `${homedir()}/.local/bin`;
	const link = `${dir}/${COMMAND}`;
	try{

		await $`mkdir -p ${dir}`;
		const abso = Bun.file(TARGET).name;
		await $`ln -s ${abso} ${link}`;

		console.log("SUCCESS. bulux is ready to be used!");
		process.exit(0);

	}catch(e){
		console.log(`FAILED.${e}`);	
		process.exit(1);
	}

};
setup();

