import  { WebSocketServer } from "ws";

const port = 8080;

const wss = new WebSocketServer({port:port})

console.log(`ws://localhost:${port}`);

function broadcast(obj)
{
    const data = JSON.stringify(obj);
    for(const client of wss.clients){
        if(client.readyState === client.OPEN){
            client.send(data)
        }
    }
}
// function send(obj){
//     ws.send(JSON.stringify(obj))
// }

wss.on("connection",(ws)=>{
    ws.name = null;
    ws.send(JSON.stringify({type:"system",text:"send join first"}));
    ws.on("message",(raw)=>{
        const str = raw.toString()
        let msg;
        try{
        msg = JSON.parse(str)

        }catch(err){
            ws.send(JSON.stringify({type:"system",text:"bad json"}));
            return;
        }
        if(!msg.type){
            ws.send(JSON.stringify({type:"system",text:"missing type"}));
            return;
        }
        if(msg.type === "join"){
            if(typeof msg.name !==  "string" || msg.name.trim()===''){
                ws.send(JSON.stringify({type:"system",text:"join invalid"}));
                return;
            }
            ws.name = msg.name.trim()
            broadcast({type:"system",text:`${ws.name}joined`});
            return;
        }
        if(msg.type === "msg"){
            if(!ws.name){
                ws.send(JSON.stringify({type:"system",text:"you must join first"}));
                return;
            }
            if(typeof msg.text !== "string" || msg.text.trim().length < 1 || msg.text.trim().length >100){
                ws.send(JSON.stringify({ type: "system", text: "text invalid"}));
                return;
            }
            broadcast({ type: "msg", from: ws.name, text: msg.text.trim()});
            return;
        }
        ws.send(JSON.stringify({type:"system", text: "unknown type"}));
    });
    ws.on("close",()=>{
        if(ws.name){
            broadcast({type: "system", text: `${ws.name} left`});
        }
    });
});