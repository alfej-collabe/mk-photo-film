const { getStore, connectLambda } = require("@netlify/blobs");

const STORE_NAME = "mkphotofilms";
const SETTINGS_KEY = "site-settings";

const DEFAULT_SETTINGS = {
  heroEyebrow: "Wedding Photography & Films",
  heroTitle1: "MK PHOTO",
  heroTitle2: "Films",
  ownerName: "Sahil Khanusiya",
  heroSub: "Cinematic wedding photography & films by {OWNER} — every frame shot to be felt again, years from now.",
  aboutEyebrow: "The Studio",
  aboutName: "Sahil Khanusiya",
  aboutRole: "MK Photo Films — Ahmedabad",
  aboutP1: "MK Photo Films is a wedding photography & film studio built on one belief — a wedding should be documented the way it felt, not just the way it looked. Every candid glance, every ritual, every unscripted laugh is framed with intent.",
  aboutP2: "Led by Sahil Khanusiya, the studio blends candid storytelling with cinematic film craft, working closely with every family to turn their day into an archive they'll return to for decades.",
  founderTag: "Founder & Lead Photographer",
  aboutPhoto: "",
  statClients: "0",
  statClientsLabel: "Clients Shot",
  statMedia: "0",
  statMediaLabel: "Moments Delivered",
  statCraft: "100%",
  statCraftLabel: "Candid Craft",
  statsAuto: true,
  services: [
    {title:"Wedding Photography",desc:"Full-day candid & traditional coverage across every ceremony, styled to feel timeless."},
    {title:"Cinematic Films",desc:"Story-led wedding films cut like short cinema — music, motion & the moments in between."},
    {title:"Pre-Wedding Shoots",desc:"Location-based couple shoots designed around your story, not a generic checklist of poses."},
    {title:"Candid Coverage",desc:"Unposed, real-time storytelling — reactions, emotions and details captured as they happen."},
    {title:"Event & Reception",desc:"Engagements, sangeet & receptions covered with the same craft as the main event."},
    {title:"Photo Albums",desc:"Curated, printed keepsake albums — the physical archive of your biggest day."}
  ],
  phone:"+91 91731 78720",
  whatsapp:"+91 91731 78720",
  whatsappDisplay:"Message the studio",
  instagramUrl:"https://www.instagram.com/the_mk_photo_films",
  instagramDisplay:"@the_mk_photo_films",
  quote:"A wedding lasts a day. The frames last forever.",
  quoteAuthor:"Sahil Khanusiya",
  footerText:"MK Photo Films. All rights reserved."
};

const headers = {
  "Content-Type":"application/json",
  "Cache-Control":"no-store",
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Methods":"GET,POST,OPTIONS",
  "Access-Control-Allow-Headers":"Content-Type"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return {statusCode:204,headers,body:""};
  try {
    connectLambda(event);
    const store = getStore(STORE_NAME);
    if (event.httpMethod === "GET") {
      const saved = await store.get(SETTINGS_KEY,{type:"json"});
      return {statusCode:200,headers,body:JSON.stringify(saved || DEFAULT_SETTINGS)};
    }
    if (event.httpMethod === "POST") {
      let incoming;
      try { incoming = JSON.parse(event.body || "{}"); }
      catch { return {statusCode:400,headers,body:JSON.stringify({error:"Invalid JSON body."})}; }
      if (!incoming || typeof incoming !== "object" || Array.isArray(incoming))
        return {statusCode:400,headers,body:JSON.stringify({error:"Settings must be an object."})};

      const settings = {...DEFAULT_SETTINGS,...incoming};
      settings.services = Array.isArray(incoming.services) && incoming.services.length===6
        ? incoming.services.map((s,i)=>({
            title:String(s?.title ?? DEFAULT_SETTINGS.services[i].title).slice(0,160),
            desc:String(s?.desc ?? DEFAULT_SETTINGS.services[i].desc).slice(0,1200)
          }))
        : DEFAULT_SETTINGS.services;

      if (typeof settings.aboutPhoto !== "string") settings.aboutPhoto="";
      if (settings.aboutPhoto.length > 1200000)
        return {statusCode:413,headers,body:JSON.stringify({error:"Founder photo is too large. Use a smaller image."})};

      await store.setJSON(SETTINGS_KEY,settings);
      return {statusCode:200,headers,body:JSON.stringify({ok:true,settings})};
    }
    return {statusCode:405,headers,body:JSON.stringify({error:"Method not allowed"})};
  } catch (e) {
    console.error(e);
    return {statusCode:500,headers,body:JSON.stringify({error:"Settings service failed.",detail:e?.message||String(e)})};
  }
};
