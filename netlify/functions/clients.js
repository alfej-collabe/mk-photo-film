const { getStore, connectLambda } = require("@netlify/blobs");

const headers={
 "Access-Control-Allow-Origin":"*",
 "Access-Control-Allow-Methods":"GET,POST,OPTIONS",
 "Access-Control-Allow-Headers":"Content-Type",
 "Content-Type":"application/json"
};

exports.handler=async(event)=>{
 if(event.httpMethod==="OPTIONS")return{statusCode:204,headers,body:""};
 try{
  connectLambda(event);
  const store=getStore("mkphotofilms");
  if(event.httpMethod==="GET"){
   const data=await store.get("clients-list",{type:"json"});
   return{statusCode:200,headers,body:JSON.stringify(Array.isArray(data)?data:[])};
  }
  if(event.httpMethod==="POST"){
   let body;
   try{body=JSON.parse(event.body||"[]")}catch{return{statusCode:400,headers,body:JSON.stringify({error:"Invalid JSON body"})}}
   if(!Array.isArray(body))return{statusCode:400,headers,body:JSON.stringify({error:"Clients must be an array"})};
   if(body.length>200)return{statusCode:413,headers,body:JSON.stringify({error:"Too many client albums"})};
   const clean=body.map((c,i)=>({
    id:String(c?.id||("client-"+i)).slice(0,120),
    name:String(c?.name||"Untitled").slice(0,160),
    category:String(c?.category||"Wedding").slice(0,60),
    createdAt:Number(c?.createdAt||Date.now())
   }));
   await store.setJSON("clients-list",clean);
   return{statusCode:200,headers,body:JSON.stringify({ok:true,clients:clean})};
  }
  return{statusCode:405,headers,body:JSON.stringify({error:"Method not allowed"})};
 }catch(e){
  console.error(e);
  return{statusCode:500,headers,body:JSON.stringify({error:"Clients service failed.",detail:e?.message||String(e)})};
 }
};
