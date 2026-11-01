const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, "public");
const DB = path.join(ROOT, "data.json");
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "schimba-aceasta-parola";

if (!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({
  product: { name: "Produsul tău", price: 99, currency: "RON", description: "Descrierea produsului va apărea aici. O poți modifica din panoul de administrare.", image: "", active: false },
  orders: []
}, null, 2));

const sessions = new Set();
function readDB() { return JSON.parse(fs.readFileSync(DB, "utf8")); }
function writeDB(db) { fs.writeFileSync(DB, JSON.stringify(db, null, 2)); }
function send(res, status, data, type="application/json; charset=utf-8") {
  res.writeHead(status, {"Content-Type": type, "X-Content-Type-Options":"nosniff"});
  res.end(type.startsWith("application/json") ? JSON.stringify(data) : data);
}
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ""; req.on("data", c => { raw += c; if(raw.length > 1e6) req.destroy(); });
    req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch(e) { reject(e); } });
  });
}
function authed(req) {
  const token = (req.headers.cookie || "").split(";").map(x=>x.trim()).find(x=>x.startsWith("toriceli_session="))?.split("=")[1];
  return !!token && sessions.has(token);
}
const mime = {".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};
http.createServer(async (req,res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    if (req.method === "GET" && url.pathname === "/api/store") {
      const db=readDB(); return send(res,200,{product:db.product});
    }
    if (req.method === "POST" && url.pathname === "/api/login") {
      const b=await parseBody(req);
      if (b.password !== ADMIN_PASSWORD) return send(res,401,{error:"Parolă incorectă."});
      const token=crypto.randomBytes(24).toString("hex"); sessions.add(token);
      res.writeHead(200,{"Content-Type":"application/json; charset=utf-8","Set-Cookie":`toriceli_session=${token}; HttpOnly; SameSite=Lax; Path=/`});
      return res.end(JSON.stringify({ok:true}));
    }
    if (req.method === "POST" && url.pathname === "/api/logout") {
      const token=(req.headers.cookie||"").split(";").map(x=>x.trim()).find(x=>x.startsWith("toriceli_session="))?.split("=")[1];
      if(token) sessions.delete(token);
      res.writeHead(200,{"Set-Cookie":"toriceli_session=; Max-Age=0; Path=/","Content-Type":"application/json"}); return res.end('{"ok":true}');
    }
    if (url.pathname.startsWith("/api/admin/") && !authed(req)) return send(res,401,{error:"Trebuie să te autentifici."});
    if (req.method === "POST" && url.pathname === "/api/admin/product") {
      const b=await parseBody(req), db=readDB();
      db.product={name:String(b.name||"Produsul tău").slice(0,100),price:Math.max(0,Number(b.price)||0),currency:"RON",description:String(b.description||"").slice(0,3000),image:String(b.image||"").slice(0,2000),active:!!b.active};
      writeDB(db); return send(res,200,{ok:true,product:db.product});
    }
    if (req.method === "GET" && url.pathname === "/api/admin/orders") return send(res,200,{orders:readDB().orders});
    if (req.method === "POST" && url.pathname === "/api/order") {
      const b=await parseBody(req), db=readDB();
      if(!db.product.active) return send(res,400,{error:"Produsul nu este încă disponibil."});
      if(!b.name || !b.phone || !b.address) return send(res,400,{error:"Completează numele, telefonul și adresa."});
      const order={id:Date.now(),date:new Date().toISOString(),product:db.product.name,price:db.product.price,customer:String(b.name).slice(0,100),phone:String(b.phone).slice(0,40),address:String(b.address).slice(0,300),status:"Test"};
      db.orders.unshift(order); writeDB(db); return send(res,200,{ok:true,message:"Comandă de TEST înregistrată. Nu s-a efectuat nicio plată."});
    }
    let pathname=decodeURIComponent(url.pathname);
    if(pathname==="/") pathname="/index.html";
    const file=path.resolve(PUBLIC,"."+pathname);
    if(!file.startsWith(PUBLIC+path.sep)) return send(res,403,{error:"Forbidden"});
    fs.readFile(file,(err,data)=>{ if(err) return send(res,404,"Nu am găsit pagina.", "text/plain; charset=utf-8"); send(res,200,data,mime[path.extname(file)]||"application/octet-stream"); });
  } catch(e) { send(res,500,{error:"Eroare internă."}); }
}).listen(PORT,"0.0.0.0",()=>console.log(`TORICELI rulează la http://localhost:${PORT}`));
