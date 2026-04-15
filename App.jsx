import { useState, useCallback, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════
//  奇门遁甲 · 企业版前端
//  含登录、水印、管理后台
//  把下面的 API_BASE 改成你部署的后端地址
// ══════════════════════════════════════════════════
const API_BASE = "https://qimen-backend-production.up.railway.app"; // ← 部署后修改这里
const COMPANY  = "永康市炎光商贸";                       // ← 改成你的公司名

// ── 基础常量 ─────────────────────────────────────
const GAN10 = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const ZHI12 = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const ZHI_T = ["23-1时","1-3时","3-5时","5-7时","7-9时","9-11时","11-13时","13-15时","15-17时","17-19时","19-21时","21-23时"];
const GUA   = {1:"坎",2:"坤",3:"震",4:"巽",5:"中",6:"乾",7:"兑",8:"艮",9:"离"};
const DIR   = {1:"北",2:"西南",3:"东",4:"东南",5:"中",6:"西北",7:"西",8:"东北",9:"南"};
const SQ    = ["乙","丙","丁"];
const LY    = ["戊","己","庚","辛","壬","癸"];
const YANG8 = [1,2,3,4,6,7,8,9];
const YIN8  = [9,8,7,6,4,3,2,1];
const YANG9 = [1,2,3,4,5,6,7,8,9];
const YIN9  = [9,8,7,6,5,4,3,2,1];
const RIGAN_GONG = {甲:2,己:2,乙:3,庚:3,丙:6,辛:6,丁:1,壬:1,戊:8,癸:8};
const GONG_YANG = [1,3,6,8];
const GONG_YIN  = [2,4,7,9];

const CITIES = [
  {name:"北京",lat:39.9,lng:116.4},{name:"上海",lat:31.2,lng:121.5},
  {name:"广州",lat:23.1,lng:113.3},{name:"深圳",lat:22.5,lng:114.1},
  {name:"成都",lat:30.7,lng:104.1},{name:"重庆",lat:29.6,lng:106.5},
  {name:"武汉",lat:30.6,lng:114.3},{name:"西安",lat:34.3,lng:108.9},
  {name:"杭州",lat:30.3,lng:120.2},{name:"南京",lat:32.1,lng:118.8},
  {name:"天津",lat:39.1,lng:117.2},{name:"郑州",lat:34.7,lng:113.6},
  {name:"长沙",lat:28.2,lng:112.9},{name:"沈阳",lat:41.8,lng:123.4},
  {name:"青岛",lat:36.1,lng:120.4},{name:"昆明",lat:25.0,lng:102.7},
  {name:"哈尔滨",lat:45.8,lng:126.5},{name:"福州",lat:26.1,lng:119.3},
  {name:"合肥",lat:31.8,lng:117.3},{name:"海口",lat:20.0,lng:110.3},
  {name:"香港",lat:22.3,lng:114.2},{name:"台北",lat:25.1,lng:121.6},
];
const QUICK_CITIES = ["北京","上海","广州","深圳","成都","重庆","武汉","杭州"];
const PAL_DIR_LABEL = {1:"正北",2:"西南",3:"正东",4:"东南",6:"西北",7:"正西",8:"东北",9:"正南"};

// ── 农历 ─────────────────────────────────────────
const LUNAR_DATA = [
  0x04AE53,0x0A5748,0x5526BD,0x0D2650,0x0D9544,0x46AAB9,0x056A4D,0x09AD42,0x24AEB6,0x04AE4A,
  0x6AA550,0x0B5544,0x0AD538,0x095D4D,0x04FDA2,0x0A4D47,0x0D4AB5,0x0EAD4A,0x0EA55E,0x09B253,
  0x0492F7,0x0B274B,0x0D6A4F,0x0DA544,0x1D4AB8,0x0D4A4C,0x0DA541,0x25AAB6,0x056A49,0x7AADBD,
  0x025D52,0x092D47,0x5C95BA,0x0A954E,0x0B4A43,0x4B5537,0x0AD54A,0x955ABF,0x04BA53,0x0A5B48,
  0x652BBD,0x0553F1,0x0D9A4F,0x0E4D44,0x2E9638,0x0D4C4C,0x0DA541,0x25D536,0x0ADA4A,0x855ABF,
  0x056A53,0x096D48,0x64AEBB,0x04AD50,0x0A4D45,0x4A4DB9,0x0A4D4C,0x0D1541,0x2D92B5,0x0D524A,
  0x0D69BE,0x05AA53,0x056A48,0x96ADBC,0x04BA51,0x049B46,0x5493BB,0x0A4B4F,0x0B2743,0x6B5238,
  0x0B254C,0x0D6A41,0x955AB6,0x056A4A,0x096D3F,0x64AEB3,0x04AE48,0x0A4D3D,0x4A4EB1,0x0A4E46,
  0x0B253A,0x6D934F,0x0D5244,0x0DA538,0x2DAA4D,0x05AA42,0x056D36,0x54AEAB,0x04AE50,0x0A2744,
  0x4AB239,0x0AB24D,0x0AD542,0x25D537,0x0B544B,0x756AFF,0x056A51,0x096D46,0x54AEBB,0x04AE4F,
  0x0A4D43,0x4A4DB8,0x0A4D4C,0x0D2541,0x5D92B6,0x0D524A,0x0DA53F,0x25AA54,0x056A48,0x096D3C,
  0x64AEB1,0x04AE46,0x0A4D3A,0x6A4DBF,0x0A4D53,0x0B2548,0x5B523C,0x0B5451,0x0D6A46,0x955ABA,
  0x056A4E,0x096D43,0x44AEBB,0x04AE4E,0x0A2743,0x4AB238,0x0AB24C,0x0AD541,0x25D536,0x0DA54A,
  0x755ABF,0x056A53,0x097D48,0x54AEBB,0x04AE50,0x0A4D45,0x4A4EB9,0x0A4D4C,0x0D2541,0x5D52B6,
  0x0D524A,0x0DA53E,0x25AA53,0x056A47,0x097D3C,0x54AEB1,0x04AE46,0x0A4D3A,0x6A4DBF,0x0A4D53,
];
const CN_MONTH = ["正","二","三","四","五","六","七","八","九","十","十一","十二"];
const CN_DAY = ["初一","初二","初三","初四","初五","初六","初七","初八","初九","初十",
  "十一","十二","十三","十四","十五","十六","十七","十八","十九","二十",
  "廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];

function getLunar(year, month, day) {
  try {
    const base = new Date(1900, 0, 31);
    let offset = Math.round((new Date(year, month-1, day) - base) / 86400000);
    let ly = 1900, i = 0;
    while (i < LUNAR_DATA.length && offset > 0) {
      const yd = LUNAR_DATA[i]; let days = 29*12;
      const leap = yd & 0xF, mb = (yd>>4) & 0xFFF;
      for (let m=0;m<12;m++) if ((mb>>(11-m))&1) days++;
      if (leap>0) days += ((yd>>20)&1)?30:29;
      if (offset < days) break;
      offset -= days; i++; ly++;
    }
    if (i >= LUNAR_DATA.length) return null;
    const yd = LUNAR_DATA[i], leap = yd&0xF, mb = (yd>>4)&0xFFF;
    let lm=1, ld=1, isLeap=false;
    for (let m=1;m<=12;m++) {
      const dm = ((mb>>(12-m))&1)?30:29;
      if (offset<dm){lm=m;ld=offset+1;break;} offset-=dm;
      if (m===leap){const ldm=((yd>>20)&1)?30:29;if(offset<ldm){lm=m;ld=offset+1;isLeap=true;break;}offset-=ldm;}
    }
    return `${isLeap?"闰":""}${CN_MONTH[lm-1]}月${CN_DAY[ld-1]}`;
  } catch(e){return null;}
}

// ── 节气与局数 ───────────────────────────────────
const JIE_QI = [[12,22],[1,6],[1,20],[2,4],[2,19],[3,6],[3,21],[4,5],[4,20],[5,6],[5,21],[6,6],[6,21],[7,7],[7,23],[8,7],[8,23],[9,8],[9,23],[10,8],[10,24],[11,7],[11,22],[12,7]];
const JIE_NAMES = ["冬至","小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪"];
const YANG_JU = [[1,2,3],[4,5,6],[7,8,9],[1,2,3],[4,5,6],[7,8,9],[1,2,3],[4,5,6],[7,8,9],[1,2,3],[4,5,6],[7,8,9]];
const YIN_JU  = [[9,8,7],[6,5,4],[3,2,1],[9,8,7],[6,5,4],[3,2,1],[9,8,7],[6,5,4],[3,2,1],[9,8,7],[6,5,4],[3,2,1]];
function getJieIdx(m,d){let b=0;for(let i=0;i<24;i++){const[jm,jd]=JIE_QI[i];if(m>jm||(m===jm&&d>=jd))b=i;}return b;}
function getYuan(ji,m,d){const[jm,jd]=JIE_QI[ji];const diff=Math.round((new Date(2000,m-1,d)-new Date(2000,jm-1,jd))/86400000);return diff<5?0:diff<10?1:2;}
function getJu(ji,yuan){return(ji<12?YANG_JU[ji]:YIN_JU[ji-12])[yuan];}

// ── 干支（基准：1900-01-01=甲戌）────────────────
function jd(y,m,d){if(m<=2){y--;m+=12;}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524;}
const BASE_JD=jd(1900,1,1);
function getDayGZ(y,m,d){const diff=jd(y,m,d)-BASE_JD;return{gan:((0+diff)%10+10)%10,zhi:((10+diff)%12+12)%12};}
function hourGan(dg,zi){return((dg*2+zi)%10+10)%10;}
function xunIdx(hg,zi){const XZH=[0,10,8,6,4,2];const sz=((zi-hg)%12+12)%12;const i=XZH.indexOf(sz);return i>=0?i:0;}
const XUN_YI=["戊","己","庚","辛","壬","癸"];

// ── 排盘核心 ─────────────────────────────────────
const TIAN_SEQ=["戊","己","庚","辛","壬","癸","丁","丙","乙"];
const GAN2XING={戊:"天辅",己:"天禽",庚:"天心",辛:"天柱",壬:"天任",癸:"天英",丁:"天蓬",丙:"天芮",乙:"天冲"};
const XING8=["天辅","天心","天柱","天任","天英","天蓬","天芮","天冲"];
const DI_MEN={1:"休",2:"死",3:"伤",4:"杜",6:"开",7:"惊",8:"生",9:"景"};
const MEN_JI={休:true,生:true,开:true,景:false,死:false,伤:false,惊:false,杜:false};
const MEN_SEQ=["休","死","伤","杜","开","惊","生","景"];
const BA_SHEN=["值符","螣蛇","太阴","六合","白虎","玄武","九地","九天"];
const SHEN_JI={值符:true,螣蛇:false,太阴:true,六合:true,白虎:false,玄武:false,九地:true,九天:true};

function calcPan(dateStr,ziIdx,birthStr,gender){
  const[y,m,d]=dateStr.split("-").map(Number);
  const ji=getJieIdx(m,d),yuan=getYuan(ji,m,d),isY=ji<12,ju=getJu(ji,yuan);
  const{gan:dg,zhi:dz}=getDayGZ(y,m,d);
  const hg=hourGan(dg,ziIdx),xi=xunIdx(hg,ziIdx);
  const seq9=isY?YANG9:YIN9,si9=seq9.indexOf(ju);
  const tp={};for(let i=0;i<9;i++)tp[seq9[(si9+i)%9]]=TIAN_SEQ[i];
  const seq8=isY?YANG8:YIN8,si8=seq8.indexOf(ju);
  const xp={};for(let i=0;i<8;i++)xp[seq8[(si8+i)%8]]=XING8[i];xp[5]="天禽";
  let zhiPal=null;for(const[p,g]of Object.entries(tp)){if(g===GAN10[hg]){zhiPal=parseInt(p);break;}}
  if(zhiPal===5||!zhiPal)zhiPal=isY?2:8;
  const zhiMen=DI_MEN[zhiPal]||"休",mSi=MEN_SEQ.indexOf(zhiMen),pSi=seq8.indexOf(zhiPal);
  const sm={};for(let i=0;i<8;i++){const pal=seq8[(pSi+i)%8];sm[pal]={men:MEN_SEQ[(mSi+i)%8],ji:MEN_JI[MEN_SEQ[(mSi+i)%8]]};}
  const xStr=XUN_YI[xi];let fuPal=null;for(const[p,g]of Object.entries(tp)){if(g===xStr){fuPal=parseInt(p);break;}}
  if(!fuPal)fuPal=1;const fsi=seq8.indexOf(fuPal);
  const sp={};for(let i=0;i<8;i++){const pal=seq8[(fsi+i)%8];sp[pal]={shen:BA_SHEN[i],ji:SHEN_JI[BA_SHEN[i]]};}
  let selfPal=null,selfGan="";
  if(birthStr){try{const[by,bm,bd]=birthStr.split("-").map(Number);const{gan:bg}=getDayGZ(by,bm,bd);selfGan=GAN10[bg];selfPal=RIGAN_GONG[selfGan]||null;}catch(e){}}
  const palaces={};
  for(let i=1;i<=9;i++){
    const isGF=gender==="male"?GONG_YANG.includes(i):gender==="female"?GONG_YIN.includes(i):false;
    palaces[i]={pal:i,gan:tp[i]||"",xing:xp[i]||"",men:sm[i]?.men||"",menJi:sm[i]?.ji??true,shen:sp[i]?.shen||"",shenJi:sp[i]?.ji??true,isFu:i===fuPal,isShi:i===zhiPal,isSelf:i===selfPal,isGF};
  }
  return{palaces,isY,ju,ji,yuan,jieStr:JIE_NAMES[ji],yuanStr:["上元","中元","下元"][yuan],dg,dz,hg,hz:ziIdx,xunYi:XUN_YI[xi],fuPal,zhiPal,zhiMen,selfPal,selfGan,gender,lunar:getLunar(y,m,d)};
}

// ── 格局与用神（同v9，略）────────────────────────
const GJC={ji:"#E1F5EE",xio:"#FCEBEB",zh:"#FEF9E7"};
const GJB={ji:"#1D9E75",xio:"#E24B4A",zh:"#EF9F27"};
const VPB={ji:"#E1F5EE",xiong:"#FCEBEB",info:"#EFF6FF",zhong:"#FEF9E7"};
const DISP=[{p:4,l:"巽4"},{p:9,l:"离9"},{p:2,l:"坤2"},{p:3,l:"震3"},{p:5,l:"中5"},{p:7,l:"兑7"},{p:8,l:"艮8"},{p:1,l:"坎1"},{p:6,l:"乾6"}];

function inferMatter(q){
  if(/彩票|中奖/.test(q))return"lottery";
  if(/换工作|跳槽|求职|升职|offer/.test(q))return"career";
  if(/发财|投资|生意|创业|股票|财运/.test(q))return"wealth";
  if(/结婚|恋爱|感情|婚姻|分手|相亲/.test(q))return"marriage";
  if(/官司|诉讼|纠纷|法院/.test(q))return"lawsuit";
  if(/出行|旅行|搬家|出差/.test(q))return"travel";
  if(/生病|健康|看病|就医/.test(q))return"health";
  if(/考试|考研|升学|学业/.test(q))return"exam";
  return"general";
}

function getZhiIdx(h,min){if(h===23||h===0)return 0;return Math.floor((h+1)/2);}

// ── API 请求封装 ──────────────────────────────────
function apiPost(path, body, token) {
  return fetch(API_BASE + path, {
    method: "POST",
    headers: { "Content-Type":"application/json", ...(token?{"Authorization":"Bearer "+token}:{}) },
    body: JSON.stringify(body),
  }).then(r => r.json());
}
function apiGet(path, token) {
  return fetch(API_BASE + path, {
    headers: { "Authorization": "Bearer " + token },
  }).then(r => r.json());
}
function apiPatch(path, body, token) {
  return fetch(API_BASE + path, {
    method:"PATCH",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},
    body:JSON.stringify(body),
  }).then(r=>r.json());
}
function apiDelete(path, token) {
  return fetch(API_BASE + path, {
    method:"DELETE", headers:{"Authorization":"Bearer "+token},
  }).then(r=>r.json());
}

// ══════════════════════════════════════════════════
//  登录页面
// ══════════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err,  setErr]  = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!user || !pass) { setErr("请填写账号和密码"); return; }
    setLoading(true); setErr("");
    try {
      const res = await apiPost("/api/login", { username: user, password: pass });
      if (res.error) { setErr(res.error); return; }
      onLogin(res);
    } catch(e) { setErr("网络错误，请稍后重试"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh",background:"#f8f7f4",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#fff",borderRadius:16,padding:36,width:"100%",maxWidth:380,boxShadow:"0 4px 24px rgba(0,0,0,.08)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:28,marginBottom:8}}>☯</div>
          <div style={{fontSize:20,fontWeight:700,color:"#1a1a1a"}}>{COMPANY}</div>
          <div style={{fontSize:13,color:"#888",marginTop:4}}>奇门遁甲 · 智能断事系统</div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:12,color:"#888",display:"block",marginBottom:4}}>账号</label>
          <input value={user} onChange={e=>setUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}
            placeholder="请输入账号" style={{width:"100%",border:"1px solid #e0ddd6",borderRadius:8,padding:"10px 12px",fontSize:14,boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{fontSize:12,color:"#888",display:"block",marginBottom:4}}>密码</label>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}
            placeholder="请输入密码" style={{width:"100%",border:"1px solid #e0ddd6",borderRadius:8,padding:"10px 12px",fontSize:14,boxSizing:"border-box"}}/>
        </div>
        {err && <div style={{color:"#A32D2D",fontSize:12,marginBottom:12,padding:"8px 12px",background:"#FCEBEB",borderRadius:6}}>{err}</div>}
        <button onClick={login} disabled={loading} style={{width:"100%",background:loading?"#888":"#1a1a1a",color:"#fff",border:"none",padding:12,borderRadius:8,fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer"}}>
          {loading ? "登录中…" : "登录"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  管理后台
// ══════════════════════════════════════════════════
function AdminPanel({ token, onBack }) {
  const [tab, setTab]   = useState("users");
  const [users, setUsers] = useState([]);
  const [logs,  setLogs]  = useState([]);
  const [stats, setStats] = useState(null);
  const [newUser, setNewUser] = useState({username:"",password:""});
  const [msg, setMsg] = useState("");

  useEffect(() => { loadAll(); }, []);
  const loadAll = async () => {
    const [u, l, s] = await Promise.all([
      apiGet("/api/admin/users", token),
      apiGet("/api/admin/logs?limit=30", token),
      apiGet("/api/admin/stats", token),
    ]);
    setUsers(u); setLogs(l.logs||[]); setStats(s);
  };

  const createUser = async () => {
    if (!newUser.username || !newUser.password) { setMsg("请填写账号和密码"); return; }
    const res = await apiPost("/api/admin/users", newUser, token);
    if (res.error) { setMsg(res.error); return; }
    setMsg(res.message); setNewUser({username:"",password:""}); loadAll();
  };
  const toggle = async (id) => { await apiPatch(`/api/admin/users/${id}/toggle`,{},token); loadAll(); };
  const del = async (id, name) => {
    if (!confirm(`确定删除账号 ${name}？`)) return;
    await apiDelete(`/api/admin/users/${id}`, token); loadAll();
  };

  const S = {
    tab: (active) => ({padding:"8px 16px",borderRadius:6,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:active?"#1a1a1a":"transparent",color:active?"#fff":"#555"}),
    card: {background:"#fff",border:"1px solid #e5e3dd",borderRadius:10,padding:16,marginBottom:12},
  };

  return (
    <div style={{minHeight:"100vh",background:"#f8f7f4",padding:16,fontFamily:"system-ui,sans-serif"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:17,fontWeight:700}}>{COMPANY} · 管理后台</div>
        <button onClick={onBack} style={{padding:"6px 14px",borderRadius:7,border:"1px solid #ddd",background:"#fff",cursor:"pointer",fontSize:13}}>返回断事</button>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
          {[["总断事次数",stats.today+"次（今日）"],["员工账号",stats.active+"/"+stats.users+" 个启用"],["累计断事",stats.total+" 次"],["最活跃",stats.topUsers?.[0]?.username||"—"]].map(([l,v])=>(
            <div key={l} style={{background:"#fff",border:"1px solid #e5e3dd",borderRadius:8,padding:"12px 14px"}}>
              <div style={{fontSize:11,color:"#aaa",marginBottom:4}}>{l}</div>
              <div style={{fontSize:15,fontWeight:700}}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab */}
      <div style={{display:"flex",gap:4,marginBottom:12,background:"#f0ede8",padding:4,borderRadius:8,width:"fit-content"}}>
        {[["users","员工管理"],["logs","使用记录"]].map(([t,label])=>(
          <button key={t} onClick={()=>setTab(t)} style={S.tab(tab===t)}>{label}</button>
        ))}
      </div>

      {tab === "users" && (
        <>
          {/* 创建账号 */}
          <div style={S.card}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:10,color:"#555"}}>创建员工账号</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <input value={newUser.username} onChange={e=>setNewUser({...newUser,username:e.target.value})}
                placeholder="账号（3字符以上）" style={{flex:1,minWidth:120,border:"1px solid #e0ddd6",borderRadius:7,padding:"8px 10px",fontSize:13}}/>
              <input value={newUser.password} onChange={e=>setNewUser({...newUser,password:e.target.value})}
                placeholder="密码（6位以上）" style={{flex:1,minWidth:120,border:"1px solid #e0ddd6",borderRadius:7,padding:"8px 10px",fontSize:13}}/>
              <button onClick={createUser} style={{padding:"8px 18px",background:"#1a1a1a",color:"#fff",border:"none",borderRadius:7,fontSize:13,fontWeight:600,cursor:"pointer"}}>创建</button>
            </div>
            {msg && <div style={{fontSize:12,color:"#0F6E56",marginTop:8}}>{msg}</div>}
          </div>

          {/* 员工列表 */}
          <div style={S.card}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:10,color:"#555"}}>员工列表</div>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{borderBottom:"1px solid #eee"}}>
                  {["账号","角色","状态","创建时间","操作"].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"6px 8px",color:"#888",fontWeight:500}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u=>(
                  <tr key={u.id} style={{borderBottom:"1px solid #f5f5f5"}}>
                    <td style={{padding:"8px 8px",fontWeight:600}}>{u.username}</td>
                    <td style={{padding:"8px 8px",color:"#888"}}>{u.role==="admin"?"管理员":"员工"}</td>
                    <td style={{padding:"8px 8px"}}>
                      <span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:u.enabled?"#E1F5EE":"#FCEBEB",color:u.enabled?"#0F6E56":"#A32D2D",fontWeight:600}}>
                        {u.enabled?"启用":"停用"}
                      </span>
                    </td>
                    <td style={{padding:"8px 8px",color:"#aaa",fontSize:12}}>{u.created_at?.slice(0,10)}</td>
                    <td style={{padding:"8px 8px"}}>
                      {u.role!=="admin"&&(
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>toggle(u.id)} style={{fontSize:11,padding:"3px 8px",borderRadius:5,border:"1px solid #ddd",background:"#fff",cursor:"pointer"}}>
                            {u.enabled?"停用":"启用"}
                          </button>
                          <button onClick={()=>del(u.id,u.username)} style={{fontSize:11,padding:"3px 8px",borderRadius:5,border:"1px solid #FCEBEB",background:"#FCEBEB",color:"#A32D2D",cursor:"pointer"}}>删除</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "logs" && (
        <div style={S.card}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:10,color:"#555"}}>最近30条使用记录</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{borderBottom:"1px solid #eee"}}>
                {["时间","员工","问题","结果"].map(h=>(
                  <th key={h} style={{textAlign:"left",padding:"6px 8px",color:"#888",fontWeight:500}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(l=>(
                <tr key={l.id} style={{borderBottom:"1px solid #f5f5f5"}}>
                  <td style={{padding:"7px 8px",color:"#aaa",whiteSpace:"nowrap"}}>{l.created_at?.slice(5,16)}</td>
                  <td style={{padding:"7px 8px",fontWeight:600,whiteSpace:"nowrap"}}>{l.username}</td>
                  <td style={{padding:"7px 8px",color:"#555",maxWidth:300}}>{l.question}</td>
                  <td style={{padding:"7px 8px"}}>
                    <span style={{fontSize:11,padding:"1px 6px",borderRadius:8,background:l.verdict==="吉"?"#E1F5EE":l.verdict==="凶"?"#FCEBEB":"#FEF9E7",color:l.verdict==="吉"?"#0F6E56":l.verdict==="凶"?"#A32D2D":"#854F0B",fontWeight:600}}>
                      {l.verdict||"—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
//  主断事界面（水印版）
// ══════════════════════════════════════════════════
function MainApp({ user, token, onLogout, onAdmin }) {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  const initZi = getZhiIdx(now.getHours(), now.getMinutes());

  const [dateVal, setDateVal]   = useState(todayStr);
  const [ziIdx,   setZiIdx]     = useState(initZi);
  const [question,setQuestion]  = useState("");
  const [birth,   setBirth]     = useState("");
  const [gender,  setGender]    = useState("");
  const [city,    setCity]      = useState(null);
  const [cityInput,setCityInput]= useState("");
  const [pan,     setPan]       = useState(null);
  const [gj,      setGj]        = useState([]);
  const [ys,      setYs]        = useState([]);
  const [verdict, setVerdict]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState("");
  const [selPal,  setSelPal]    = useState(null);

  const mt    = inferMatter(question);
  const top2  = ys.slice(0,2).map(s=>s.pal);
  const selP  = pan&&selPal ? pan.palaces[selPal] : null;
  const selR  = ys.findIndex(s=>s.pal===selPal);

  // 格局识别（简化版，完整版同v9）
  function calcGJ(pan) {
    const{palaces,fuPal,zhiPal,zhiMen,selfPal,gender}=pan;
    const res=[],fP=palaces[fuPal],sP=palaces[zhiPal];
    if(SQ.includes(sP.gan)&&["生","开","休"].includes(sP.men))res.push({n:"三奇得使",t:"ji",d:`${sP.gan}奇临值使${sP.men}门，天时大利，万事顺遂。`});
    if(SQ.includes(fP.gan))res.push({n:"奇加值符",t:"ji",d:`${fP.gan}奇临值符宫，贵人现身，谋事大得助力。`});
    if(["生","开","休"].includes(fP.men)&&fP.shenJi)res.push({n:"值符三吉",t:"ji",d:`值符宫${fP.men}门合吉神${fP.shen}，三吉汇聚，大利进取。`});
    if(fP.men==="开"&&fP.shen==="九天")res.push({n:"青龙返首",t:"ji",d:"九天合开门临值符，贵气上腾，谋事顺遂。"});
    if(fP.men==="生"&&fP.shen==="九地")res.push({n:"风云际会",t:"ji",d:"九地合生门，时机已至，财运亨通。"});
    const gc=Object.values(palaces).filter(p=>p.gan==="庚").length;
    if(gc>=3)res.push({n:"天网四张",t:"xio",d:"庚字三见，天罗地网，主事受阻，宜暂缓。"});
    else if(fP.gan==="庚")res.push({n:"庚临值符",t:"xio",d:"庚金入值符宫，贵人受困，行事受制。"});
    if(sP.men==="死"&&!sP.shenJi)res.push({n:"死门凶神",t:"xio",d:"死门合凶神临值使，主事阻滞，防财损人散。"});
    if(sP.men==="惊"&&sP.shen==="白虎")res.push({n:"虎猖狂",t:"xio",d:"白虎合惊门临值使，防惊险变故血光官讼。"});
    const{1:p1,9:p9,2:p2,8:p8,3:p3,7:p7,4:p4,6:p6}=palaces;
    const dg={1:9,9:1,2:8,8:2,3:7,7:3,4:6,6:4};
    if(dg[fuPal]===zhiPal)res.push({n:"反吟局",t:"xio",d:"值符与值使对冲，主事反复动荡。"});
    if(DI_MEN[zhiPal]===zhiMen)res.push({n:"伏吟局",t:"xio",d:"值使门在本宫不动，主事停滞反复。"});
    const jc=Object.values(palaces).filter(p=>p.pal!==5&&["生","开","休"].includes(p.men)).length;
    const xc=Object.values(palaces).filter(p=>p.pal!==5&&["死","伤","惊"].includes(p.men)).length;
    if(jc>=3&&xc<=1)res.push({n:"吉门汇聚",t:"ji",d:`盘中${jc}个吉门，整体局势大利。`});
    if(xc>=3)res.push({n:"凶门遍布",t:"xio",d:`盘中${xc}个凶门，时机欠佳，宜守成观望。`});
    if(selfPal){const self=palaces[selfPal];if(["生","开","休"].includes(self.men)&&self.shenJi)res.push({n:"自身逢吉",t:"ji",d:`自身宫${GUA[selfPal]}宫逢${self.men}门，个人当前运势向好。`});else if(["死","惊","伤"].includes(self.men)||!self.shenJi)res.push({n:"自身逢凶",t:"xio",d:`自身宫${GUA[selfPal]}宫逢${self.men}门，当前宜守不宜动。`});}
    if(res.length===0)res.push({n:"普通局",t:"zh",d:"本局无特殊格局，按各宫综合判断，平中见稳。"});
    return res;
  }

  const MW={general:{men:{休:2,生:3,伤:-1,杜:0,景:1,死:-3,惊:-2,开:3},xing:{天蓬:0,天芮:-1,天冲:1,天辅:2,天禽:0,天心:2,天柱:-1,天任:2,天英:1},shen:{值符:3,螣蛇:-1,太阴:2,六合:2,白虎:-2,玄武:-2,九地:1,九天:1}},career:{men:{休:2,生:3,伤:-1,杜:0,景:2,死:-3,惊:-2,开:4},xing:{天蓬:1,天芮:-1,天冲:2,天辅:3,天禽:0,天心:2,天柱:-1,天任:1,天英:2},shen:{值符:3,螣蛇:-1,太阴:1,六合:2,白虎:-2,玄武:-2,九地:0,九天:3}},wealth:{men:{休:1,生:4,伤:-1,杜:0,景:1,死:-3,惊:-2,开:2},xing:{天蓬:0,天芮:-1,天冲:2,天辅:1,天禽:1,天心:1,天柱:-1,天任:3,天英:1},shen:{值符:2,螣蛇:-1,太阴:2,六合:3,白虎:-2,玄武:-2,九地:2,九天:1}},marriage:{men:{休:3,生:3,伤:-2,杜:0,景:1,死:-3,惊:-2,开:2},xing:{天蓬:0,天芮:-1,天冲:0,天辅:2,天禽:1,天心:1,天柱:-1,天任:2,天英:1},shen:{值符:1,螣蛇:-2,太阴:3,六合:4,白虎:-3,玄武:-3,九地:1,九天:0}},lottery:{men:{休:1,生:4,伤:-1,杜:0,景:2,死:-3,惊:-2,开:3},xing:{天蓬:0,天芮:-2,天冲:1,天辅:2,天禽:1,天心:3,天柱:-1,天任:3,天英:2},shen:{值符:3,螣蛇:-2,太阴:1,六合:3,白虎:-3,玄武:-3,九地:2,九天:2}},health:{men:{休:2,生:3,伤:-1,杜:0,景:0,死:-4,惊:-2,开:2},xing:{天蓬:-1,天芮:-2,天冲:0,天辅:1,天禽:1,天心:4,天柱:-1,天任:2,天英:0},shen:{值符:2,螣蛇:-2,太阴:1,六合:2,白虎:-3,玄武:-1,九地:1,九天:0}},exam:{men:{休:1,生:2,伤:-1,杜:0,景:3,死:-3,惊:-1,开:2},xing:{天蓬:0,天芮:-1,天冲:1,天辅:4,天禽:0,天心:2,天柱:-1,天任:1,天英:2},shen:{值符:2,螣蛇:-1,太阴:2,六合:1,白虎:-1,玄武:-2,九地:1,九天:2}}};

  function calcYS(pan,mt){
    const w=MW[mt]||MW.general,{selfPal,gender}=pan;
    return Object.values(pan.palaces).filter(p=>p.pal!==5).map(p=>{
      let s=0;s+=w.men[p.men]||0;s+=w.xing[p.xing]||0;s+=w.shen[p.shen]||0;
      if(SQ.includes(p.gan))s+=2;if(p.isFu)s+=2;
      if(gender&&p.isGF&&["生","开","休"].includes(p.men))s+=1;
      if(mt==="marriage"){if(gender==="male"&&p.shen==="六合")s+=3;if(gender==="female"&&p.shen==="太阴")s+=3;}
      if(selfPal&&p.pal===selfPal){if(["生","开","休"].includes(p.men)&&p.shenJi)s+=3;else if(["死","惊","伤"].includes(p.men)&&!p.shenJi)s-=3;}
      return{pal:p.pal,score:s,p};
    }).sort((a,b)=>b.score-a.score);
  }

  function buildPrompt(q,pan,gj,ys,city){
    const mm={general:"综合",career:"仕途",wealth:"求财",marriage:"婚姻",lottery:"彩票",health:"健康",exam:"考试",lawsuit:"官讼",travel:"出行"};
    const{selfPal,selfGan,gender,fuPal,zhiPal,zhiMen}=pan;
    const gStr=gender==="male"?"男性":gender==="female"?"女性":"性别未填";
    const selfInfo=selfPal?`问事者：${gStr}，日干${selfGan}，自身宫${GUA[selfPal]}宫（${DIR[selfPal]}）\n自身宫：${pan.palaces[selfPal].men}门·${pan.palaces[selfPal].xing}·${pan.palaces[selfPal].shen}`:`问事者：${gStr}`;
    const cityInfo=city?`\n起卦地点：${city.name}（${Object.entries(PAL_DIR_LABEL).map(([p,d])=>`${d}=${city.name}${d}方向`).join("、")}）`:"";
    const ps=Object.values(pan.palaces).map(p=>p.pal===5?`中宫：${p.gan}`:`${GUA[p.pal]}宫(${DIR[p.pal]})：${p.gan}${SQ.includes(p.gan)?"[三奇]":LY.includes(p.gan)?"[六仪]":""}，${p.men}门(${p.menJi?"吉":"凶"})，${p.xing}，${p.shen}(${p.shenJi?"吉":"凶"})${p.isFu?"[值符]":""}${p.isShi?"[值使]":""}${p.isSelf?"[自身宫]":""}`).join("\n");
    const gs=gj.map(g=>`【${g.n}】${g.d}`).join("\n");
    const ys3=ys.slice(0,3).map((s,i)=>`第${i+1}推荐：${GUA[s.pal]}宫(${DIR[s.pal]})，${s.p.men}门·${s.p.xing}·${s.p.shen}`).join("\n");
    return`你是精通奇门遁甲的命理师，请根据盘面用大白话为问事者解答，像朋友聊天，不用术语。\n\n问题：${q}\n问事类型：${mm[mt]||"综合"}\n\n${selfInfo}${cityInfo}\n\n盘面：${pan.isY?"阳":"阴"}遁第${pan.ju}局，${pan.jieStr}${pan.yuanStr}\n值符宫：${GUA[fuPal]}宫  值使宫：${GUA[zhiPal]}宫，值使门：${zhiMen}\n\n各宫：\n${ps}\n\n格局：\n${gs}\n\n用神推荐：\n${ys3}\n\n${city?"断语行动建议中请把方位翻译成该城市的具体地理方向。":""}\n严格返回JSON，无其他内容：\n{"verdict":"吉或凶或中","title":"一句话总结10字内","summary":"2-3句大白话80字内","points":[{"type":"ji或xiong或info","text":"分析点40字内"},{"type":"ji或xiong或info","text":"分析2"},{"type":"ji或xiong或info","text":"分析3"},{"type":"info","text":"分析4"}],"advice":"具体行动建议100字内"}`;
  }

  const run = useCallback(async () => {
    if (!dateVal)         { setError("请选择日期"); return; }
    if (!question.trim()) { setError("请输入你想问的问题"); return; }
    setError("");
    const p  = calcPan(dateVal, ziIdx, birth||null, gender);
    const gr = calcGJ(p);
    const yr = calcYS(p, mt);
    setPan(p); setGj(gr); setYs(yr); setVerdict(null); setSelPal(null);
    setLoading(true);
    try {
      const prompt = buildPrompt(question, p, gr, yr, city);
      const res = await apiPost("/api/duanyu", { prompt, question }, token);
      if (res.error) throw new Error(res.error);
      setVerdict(res);
    } catch(e) { setError("断语生成失败：" + e.message); }
    finally { setLoading(false); }
  }, [dateVal, ziIdx, question, birth, gender, city, token]);

  const cityResults = cityInput && !city ? CITIES.filter(c=>c.name.includes(cityInput)).slice(0,6) : [];

  let birthPreview = null;
  if (birth) {
    try { const[by,bm,bd]=birth.split("-").map(Number);const{gan:bg,zhi:bz}=getDayGZ(by,bm,bd);birthPreview={ganStr:GAN10[bg],zhiStr:ZHI12[bz],selfPal:RIGAN_GONG[GAN10[bg]]}; } catch(e){}
  }

  const C = {
    card: {background:"#fff",border:"1px solid #e5e3dd",borderRadius:12,padding:16,marginBottom:12},
    lbl:  {fontSize:11,color:"#888",display:"block",marginBottom:4},
    inp:  {width:"100%",border:"1px solid #e0ddd6",borderRadius:7,padding:"7px 9px",fontSize:13,fontFamily:"inherit",boxSizing:"border-box"},
  };

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:"#f8f7f4",minHeight:"100vh",padding:16,color:"#1a1a1a",fontSize:14,position:"relative"}}>

      {/* 水印层 */}
      <div style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
        {Array.from({length:12}).map((_,i)=>(
          <div key={i} style={{position:"absolute",color:"rgba(0,0,0,0.04)",fontSize:13,fontWeight:600,whiteSpace:"nowrap",transform:"rotate(-30deg)",top:`${(i%4)*28}%`,left:`${Math.floor(i/4)*38-10}%`,userSelect:"none"}}>
            {COMPANY} · {user.username}
          </div>
        ))}
      </div>

      {/* 顶栏 */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,padding:"8px 12px",background:"#fff",borderRadius:10,border:"1px solid #e5e3dd"}}>
        <div style={{fontSize:15,fontWeight:700}}>{COMPANY} · 奇门断事</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:12,color:"#888"}}>{user.username}</span>
          {user.role==="admin"&&<button onClick={onAdmin} style={{fontSize:11,padding:"4px 10px",borderRadius:6,border:"1px solid #ddd",background:"#fff",cursor:"pointer"}}>管理后台</button>}
          <button onClick={onLogout} style={{fontSize:11,padding:"4px 10px",borderRadius:6,border:"1px solid #ddd",background:"#fff",cursor:"pointer",color:"#888"}}>退出</button>
        </div>
      </div>

      {/* 输入区 */}
      <div style={C.card}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div>
            <label style={C.lbl}>起局日期</label>
            <input type="date" value={dateVal} onChange={e=>setDateVal(e.target.value)} style={C.inp}/>
            {pan?.lunar&&<div style={{fontSize:11,color:"#888",marginTop:4}}>农历 {pan.lunar}</div>}
          </div>
          <div>
            <label style={C.lbl}>时辰</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:2}}>
              {ZHI12.map((z,i)=>(
                <button key={i} title={ZHI_T[i]} onClick={()=>setZiIdx(i)} style={{fontSize:10,padding:"2px 6px",borderRadius:4,cursor:"pointer",border:"1px solid "+(ziIdx===i?"#1a1a1a":"#ddd"),background:ziIdx===i?"#1a1a1a":"#fff",color:ziIdx===i?"#fff":"#555"}}>
                  {z}<span style={{fontSize:8,opacity:.6,display:"block",lineHeight:"10px"}}>{ZHI_T[i].replace("时","")}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:10,marginBottom:10,alignItems:"flex-start"}}>
          <div>
            <label style={C.lbl}>出生日期 <span style={{color:"#ccc",fontWeight:400}}>（选填）</span></label>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <input type="date" value={birth} onChange={e=>setBirth(e.target.value)} style={{...C.inp,flex:1}}/>
              {birthPreview&&<div style={{flexShrink:0,background:"#FEF9E7",border:"1px solid #EF9F27",borderRadius:7,padding:"4px 8px",fontSize:11,color:"#854F0B",whiteSpace:"nowrap"}}>日柱 {birthPreview.ganStr}{birthPreview.zhiStr}<br/><span style={{fontSize:10}}>自身宫：{GUA[birthPreview.selfPal]}</span></div>}
              {birth&&<button onClick={()=>setBirth("")} style={{padding:"6px 8px",borderRadius:7,border:"1px solid #ddd",background:"#fff",fontSize:11,cursor:"pointer"}}>×</button>}
            </div>
          </div>
          <div style={{flexShrink:0}}>
            <label style={C.lbl}>性别</label>
            <div style={{display:"flex",gap:5}}>
              {[["","不填"],["male","男"],["female","女"]].map(([v,l])=>(
                <button key={v} onClick={()=>setGender(v)} style={{padding:"6px 10px",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600,border:"1px solid "+(gender===v?"#1a1a1a":"#ddd"),background:gender===v?"#1a1a1a":"#fff",color:gender===v?"#fff":"#555"}}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{marginBottom:10}}>
          <label style={C.lbl}>起卦地点 <span style={{color:"#ccc",fontWeight:400}}>（选填）</span></label>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}>
            <input value={cityInput} onChange={e=>{setCityInput(e.target.value);if(!e.target.value)setCity(null);}} placeholder="搜索城市" style={{...C.inp,flex:1}}/>
            {city&&<div style={{flexShrink:0,background:"#EFF6FF",border:"1px solid #378ADD",borderRadius:7,padding:"4px 8px",fontSize:11,color:"#185FA5",whiteSpace:"nowrap"}}>{city.name} ✓</div>}
            {city&&<button onClick={()=>{setCity(null);setCityInput("");}} style={{padding:"6px 8px",borderRadius:7,border:"1px solid #ddd",background:"#fff",fontSize:11,cursor:"pointer"}}>×</button>}
          </div>
          {cityResults.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:4}}>{cityResults.map(c=><button key={c.name} onClick={()=>{setCity(c);setCityInput(c.name);}} style={{padding:"3px 8px",borderRadius:5,border:"1px solid #378ADD",background:"#EFF6FF",color:"#185FA5",fontSize:11,cursor:"pointer"}}>{c.name}</button>)}</div>}
          {!cityInput&&!city&&<div style={{display:"flex",flexWrap:"wrap",gap:3}}>{QUICK_CITIES.map(name=>{const c=CITIES.find(x=>x.name===name);return c?<button key={name} onClick={()=>{setCity(c);setCityInput(name);}} style={{padding:"2px 7px",borderRadius:5,border:"1px solid #e0ddd6",background:"#fff",color:"#555",fontSize:11,cursor:"pointer"}}>{name}</button>:null;})}</div>}
        </div>

        <div style={{marginBottom:10}}>
          <label style={C.lbl}>你想问什么？</label>
          <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="例：我今年要不要换工作？…" style={{...C.inp,minHeight:65,resize:"vertical",lineHeight:1.6}}/>
        </div>
        {error&&<div style={{color:"#A32D2D",fontSize:12,marginBottom:8,padding:"6px 10px",background:"#FCEBEB",borderRadius:6}}>{error}</div>}
        <button onClick={run} disabled={loading} style={{width:"100%",background:loading?"#888":"#1a1a1a",color:"#fff",border:"none",padding:10,borderRadius:8,fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer"}}>
          {loading?"正在推演断语…":"起局 · 断事"}
        </button>
      </div>

      {pan&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:12}}>
            {[["节气",pan.jieStr+pan.yuanStr],[pan.isY?"阳遁":"阴遁","第"+pan.ju+"局"],["日干支",GAN10[pan.dg]+ZHI12[pan.dz]+"日"],["时干支",GAN10[pan.hg]+ZHI12[pan.hz]+"时"],["农历",pan.lunar||"—"]].map(([l,v])=>(
              <div key={l} style={{background:"#fff",border:"1px solid #e5e3dd",borderRadius:8,padding:"8px 10px"}}>
                <div style={{fontSize:10,color:"#aaa",marginBottom:2}}>{l}</div>
                <div style={{fontSize:11,fontWeight:600}}>{v}</div>
              </div>
            ))}
          </div>

          {loading&&<div style={{background:"#fff",border:"1px solid #e5e3dd",borderRadius:12,padding:24,marginBottom:12,textAlign:"center"}}><div style={{color:"#888",fontSize:13,marginBottom:8}}>正在推演断语，请稍候…</div><div style={{display:"inline-block",width:20,height:20,border:"2px solid #ddd",borderTopColor:"#555",borderRadius:"50%",animation:"spin .8s linear infinite"}}/></div>}

          {verdict&&(
            <div style={{background:"#fff",border:"1px solid #e5e3dd",borderRadius:12,padding:18,marginBottom:12}}>
              <div style={{fontSize:11,color:"#aaa",marginBottom:4}}>你的问题</div>
              <div style={{fontSize:13,color:"#555",marginBottom:14,paddingBottom:12,borderBottom:"1px solid #f0ede8",lineHeight:1.6}}>{question}</div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:verdict.verdict==="吉"?"#E1F5EE":verdict.verdict==="凶"?"#FCEBEB":"#FEF9E7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{verdict.verdict==="吉"?"✦":verdict.verdict==="凶"?"✕":"◈"}</div>
                <div style={{fontSize:17,fontWeight:700,color:verdict.verdict==="吉"?"#0F6E56":verdict.verdict==="凶"?"#A32D2D":"#854F0B"}}>{verdict.title}</div>
              </div>
              <div style={{fontSize:14,lineHeight:1.85,marginBottom:14,padding:"12px 14px",background:"#f8f7f4",borderRadius:9}}>{verdict.summary}</div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                {(verdict.points||[]).map((pt,i)=><div key={i} style={{padding:"9px 12px",borderRadius:8,background:VPB[pt.type]||"#f8f7f4",fontSize:13,lineHeight:1.6,color:"#333"}}>{pt.text}</div>)}
              </div>
              <div style={{background:"#1a1a1a",color:"#fff",borderRadius:10,padding:"13px 16px"}}>
                <div style={{fontSize:11,color:"#888",marginBottom:4}}>建议你这样做</div>
                <div style={{fontSize:13,color:"#eee",lineHeight:1.8}}>{verdict.advice}</div>
              </div>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 270px",gap:12}}>
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:"#ccc",border:"1px solid #ccc",borderRadius:10,overflow:"hidden",marginBottom:10}}>
                {DISP.map(({p})=>{
                  const pal=pan.palaces[p],isC=p===5,qi=SQ.includes(pal.gan),yi=!qi&&LY.includes(pal.gan);
                  const isSpouse=mt==="marriage"&&((gender==="male"&&pal.shen==="六合")||(gender==="female"&&pal.shen==="太阴"));
                  return(
                    <div key={p} onClick={()=>setSelPal(selPal===p?null:p)} style={{background:selPal===p?"#EEEDFE":pal.isSelf?"#FEF9E7":isSpouse?"#FBEAF0":isC?"#faf9f7":"#fff",padding:"6px 6px",minHeight:110,position:"relative",cursor:"pointer",outline:top2.includes(p)?"2px solid #1D9E75":pal.isSelf?"2px solid #EF9F27":"none",outlineOffset:-2}}>
                      <div style={{position:"absolute",top:3,left:5,fontSize:9,color:"#ccc"}}>{DIR[p]}</div>
                      <div style={{position:"absolute",top:3,right:5,fontSize:9,color:"#bbb"}}>{DISP.find(d=>d.p===p)?.l}</div>
                      {pal.shen&&<div style={{fontSize:9,color:pal.shenJi?"#854F0B":"#B02020",marginTop:14,fontWeight:600}}>{pal.shen}</div>}
                      {pal.men&&!isC&&<div style={{fontSize:10,fontWeight:700,color:pal.menJi?"#185FA5":"#B02020",marginBottom:1}}>{pal.men}门</div>}
                      <div style={{display:"flex",alignItems:"baseline",gap:2,marginBottom:2}}>
                        <span style={{fontSize:18,fontWeight:700,color:qi?"#534AB7":yi?"#0F6E56":"#111"}}>{isC?"":pal.gan}</span>
                        {pal.xing&&!isC&&<span style={{fontSize:9,color:"#3B6D11"}}>{pal.xing}</span>}
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:1}}>
                        {pal.isFu&&<span style={{fontSize:8,padding:"0 3px",borderRadius:2,background:"#EEEDFE",color:"#534AB7",fontWeight:700}}>值符</span>}
                        {pal.isShi&&<span style={{fontSize:8,padding:"0 3px",borderRadius:2,background:"#E1F5EE",color:"#085041",fontWeight:700}}>值使</span>}
                        {pal.isSelf&&<span style={{fontSize:8,padding:"0 3px",borderRadius:2,background:"#FEF9E7",color:"#854F0B",fontWeight:700}}>自身</span>}
                        {top2.includes(p)&&!pal.isSelf&&<span style={{fontSize:8,padding:"0 3px",borderRadius:2,background:"#E1F5EE",color:"#085041",fontWeight:700}}>荐</span>}
                        {isC&&<span style={{fontSize:9,color:"#aaa"}}>{pal.gan}时干</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {selP&&<div style={{background:"#fff",border:"1px solid #e5e3dd",borderRadius:10,padding:13}}>
                <div style={{fontSize:12,fontWeight:600,marginBottom:8,color:"#444"}}>{GUA[selPal]}宫（{DIR[selPal]}方）{selR===0?" — 首推":selR===1?" — 次推":""}{selP.isSelf?" — 自身宫":""}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:8}}>
                  {[["天干",`${selP.gan}${SQ.includes(selP.gan)?" 三奇":LY.includes(selP.gan)?" 六仪":""}`],["八门",`${selP.men||"—"} ${selP.menJi?"吉":"凶"}`],["九星",selP.xing||"—"],["八神",`${selP.shen||"—"} ${selP.shenJi?"吉":"凶"}`],["值符/使",selP.isFu?"值符":selP.isShi?"值使":"—"],["用神排名",selR>=0?"第"+(selR+1)+"位":"—"]].map(([k,v])=>(
                    <div key={k}><div style={{fontSize:9,color:"#aaa",marginBottom:1}}>{k}</div><div style={{fontSize:11,fontWeight:600}}>{v}</div></div>
                  ))}
                </div>
              </div>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{background:"#fff",border:"1px solid #e5e3dd",borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:600,marginBottom:7,paddingBottom:5,borderBottom:"1px solid #eee",color:"#555"}}>格局识别</div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {gj.map((g,i)=><div key={i} style={{padding:"5px 8px",borderRadius:"0 6px 6px 0",background:GJC[g.t]||"#FEF9E7",borderLeft:`3px solid ${GJB[g.t]||"#EF9F27"}`}}><div style={{fontSize:10,fontWeight:600,marginBottom:1}}>{g.n}</div><div style={{fontSize:9,color:"#666",lineHeight:1.4}}>{g.d}</div></div>)}
                </div>
              </div>
              <div style={{background:"#fff",border:"1px solid #e5e3dd",borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:600,marginBottom:7,paddingBottom:5,borderBottom:"1px solid #eee",color:"#555"}}>用神宫推荐</div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {ys.slice(0,4).map((s,r)=>{const max=Math.max(ys[0]?.score||1,1),filled=Math.round((Math.max(s.score,0)/max)*5);return(
                    <div key={s.pal} onClick={()=>setSelPal(s.pal)} style={{background:r===0?"#E1F5EE":s.p.isSelf?"#FEF9E7":"#f8f7f4",borderRadius:6,padding:"6px 8px",cursor:"pointer"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:1}}>
                        <span style={{fontSize:10,fontWeight:600}}>{GUA[s.pal]}宫（{DIR[s.pal]}）{r===0?"★":""}{s.p.isSelf?" 自":""}</span>
                        <div style={{display:"flex",gap:2}}>{Array.from({length:5}).map((_,j)=><div key={j} style={{width:5,height:5,borderRadius:"50%",background:j<filled?"#1D9E75":"#ddd"}}/>)}</div>
                      </div>
                      <div style={{fontSize:9,color:"#666"}}>{s.p.men}门·{s.p.xing}·{s.p.shen}</div>
                    </div>
                  );})}
                </div>
              </div>
              <div style={{background:"#fff",border:"1px solid #e5e3dd",borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,fontWeight:600,marginBottom:7,paddingBottom:5,borderBottom:"1px solid #eee",color:"#555"}}>本局信息</div>
                <div style={{fontSize:10,color:"#555",lineHeight:1.9}}>
                  <div>{pan.jieStr}{pan.yuanStr} · {pan.isY?"阳":"阴"}遁第{pan.ju}局</div>
                  <div>旬首仪：{pan.xunYi}（{GUA[pan.fuPal]}宫）</div>
                  <div>值符：{GUA[pan.fuPal]}宫 · {DIR[pan.fuPal]}方</div>
                  <div>值使：{GUA[pan.zhiPal]}宫 · {pan.zhiMen}门</div>
                  {city&&<div style={{color:"#185FA5"}}>起卦地点：{city.name}</div>}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════
//  根组件：路由控制
// ══════════════════════════════════════════════════
export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem("qimen_session")||"null"); } catch(e) { return null; }
  });
  const [showAdmin, setShowAdmin] = useState(false);

  const handleLogin = (data) => {
    localStorage.setItem("qimen_session", JSON.stringify(data));
    setSession(data);
  };
  const handleLogout = () => {
    localStorage.removeItem("qimen_session");
    setSession(null); setShowAdmin(false);
  };

  if (!session) return <LoginPage onLogin={handleLogin}/>;
  if (showAdmin && session.role==="admin") return <AdminPanel token={session.token} onBack={()=>setShowAdmin(false)}/>;
  return <MainApp user={session} token={session.token} onLogout={handleLogout} onAdmin={()=>setShowAdmin(true)}/>;
}
