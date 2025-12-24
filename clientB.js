import WebSocket from "ws";
import readline from "readline";

const ws = new WebSocket("ws://localhost:8080");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function send(obj){
    ws.send(JSON.stringify(obj))
}
ws.on("open",()=>{
    console.log("connected");
    send({ type: "join", name: "B"});   
    rl.setPrompt(">");
    rl.prompt();
});

ws.on("message",(raw)=>{
    const data = JSON.parse(raw.toString());
    if(data.type === "system"){
        console.log(`[system]${data.text}`);
    }
    if(data.type === "msg"){
        console.log(`[${data.from}]${data.text}`);        
    }
    rl.prompt()
});
rl.on("line",(line)=>{
    const text = line.trim();
    if(text==="/quit"){
        ws.close()
        rl.close()
        return;
    }
    send({ type: "msg", text});
    rl.prompt()
});

ws.on("close",()=>{
    console.log("disconnected");
    send({ type: "join", name: "A"})
    process.exit(0)
});


