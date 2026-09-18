

const command = process.argv[2]; 

const socket = await Bun.connect({
	unix:"",
	socket:{
		data(socket, data){
			console.log(data.toString());
			socket.end()
		},
		open(socket){
			socket.write(JSON.stringify({ type:command }))
		},
		error(socket, err){
			console.error(`FAILURE. Socket failure: ${err.message}`);
		}
	},
});
