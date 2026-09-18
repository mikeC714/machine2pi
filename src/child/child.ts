import { stop, start } from "./methods.ts";


Bun.listen({
	unix:"PathToSocket",
	socket:{
		data(socket, data){
			let cmd;
			try{
				cmd = JSON.parse(data.toString());
			}catch{
				socket.write(JSON.stringify({ error:"FAILURE. Invalid JSON." }));
				return;
			};
			
			switch (cmd.type){
				case "ping":
					socket.write("PONG");
				break;
				case "start":
					(async() => start())();
					socket.write("Starting Server!");
				break;
				case "stop":
					socket.write("Shutting Down Server!");
					setTimeout(async() => {
						await stop()
					}, 5000);
				break;
			}
		}
	}
});
