import { $ } from "bun";


async function stop(){
	await $`bulux stop`	
}
async function start(){
	await $`bulux-server start`
}



export { stop, start }
