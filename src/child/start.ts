const child = Bun.spawn(["bun", "./child.ts"],{
	stdio: ["ignore","inherit", "inherit"],
	detached:true
});

child.unref();
process.exit(0);




