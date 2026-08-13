const { getStore, connectLambda } = require("@netlify/blobs");

const headers={
 "Access-Control-Allow-Origin":"*",
 "Access-Control-Allow-Methods":"GET,POST,DELETE,OPTIONS",
 "Access-Control-Allow-Headers":"Content-Type",
 "Content-Type":"application/json"
};

function validId(id){return typeof id==="string" && /^[a-zA-Z0-9_-]{1,140}$/.test(id)}

exports.handler=async(event)=>{
 if(event.httpMethod==="OPTIONS")return{statusCode:204,headers,body:""};
 const clientId=event.queryStringParameters?.clientId;
 if(!validId(clientId))return{statusCode:400,headers,body:JSON.stringify({error:"Valid clientId is required"})};

 try{
  connectLambda(event);
  const store=getStore("mkphotofilms");
  const key="client-media:"+clientId;

  if(event.httpMethod==="GET"){
   const data=await store.get(key,{type:"json"});
   return{statusCode:200,headers,body:JSON.stringify(Array.isArray(data)?data:[])};
  }

  if(event.httpMethod==="DELETE"){
   await store.delete(key);
   return{statusCode:200,headers,body:JSON.stringify({ok:true})};
  }

  if(event.httpMethod==="POST"){
   let incoming;
   try{incoming=JSON.parse(event.body||"[]")}catch{return{statusCode:400,headers,body:JSON.stringify({error:"Invalid JSON body"})}};
   if(!Array.isArray(incoming))return{statusCode:400,headers,body:JSON.stringify({error:"Media must be an array"})};

   const clean=incoming.map((m,i)=>({
     id:String(m?.id||("m-"+Date.now()+"-"+i)).slice(0,160),
     type:m?.type==="video"?"video":"photo",
     src:String(m?.src||"").slice(0,1200000),
     addedAt:Number(m?.addedAt||Date.now())
   })).filter(m=>m.src && (m.type==="video" ? /^https?:\/\//i.test(m.src) : m.src.startsWith("data:image/")));

   const approxBytes=Buffer.byteLength(JSON.stringify(clean),"utf8");
   if(approxBytes>4500000)return{statusCode:413,headers,body:JSON.stringify({error:"Album is too large. Upload fewer/smaller photos."})};

   await store.setJSON(key,clean);
   return{statusCode:200,headers,body:JSON.stringify({ok:true,media:clean})};
  }

  return{statusCode:405,headers,body:JSON.stringify({error:"Method not allowed"})};
 }catch(e){
  console.error(e);
  return{statusCode:500,headers,body:JSON.stringify({error:"Media service failed.",detail:e?.message||String(e)})};
 }
};
