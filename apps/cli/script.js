"use strict";(()=>{var et=Object.create;var Or=Object.defineProperty;var tt=Object.getOwnPropertyDescriptor;var ot=Object.getOwnPropertyNames;var at=Object.getPrototypeOf,nt=Object.prototype.hasOwnProperty;var Pr=(r,e)=>()=>(e||r((e={exports:{}}).exports,e),e.exports);var it=(r,e,t,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let f of ot(e))!nt.call(r,f)&&f!==t&&Or(r,f,{get:()=>e[f],enumerable:!(a=tt(e,f))||a.enumerable});return r};var ft=(r,e,t)=>(t=r!=null?et(at(r)):{},it(e||!r||!r.__esModule?Or(t,"default",{value:r,enumerable:!0}):t,r));var Nr=Pr((Xo,Hr)=>{"use strict";var st="bold|bolder|lighter|[1-9]00",pt="italic|oblique",lt="small-caps",mt="ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded",dt="px|pt|pc|in|cm|mm|%|em|ex|ch|rem|q",Rr=`'([^']+)'|"([^"]+)"|[\\w\\s-]+`,ht=new RegExp(`(${st}) +`,"i"),yt=new RegExp(`(${pt}) +`,"i"),xt=new RegExp(`(${lt}) +`,"i"),bt=new RegExp(`(${mt}) +`,"i"),vt=new RegExp(`([\\d\\.]+)(${dt}) *((?:${Rr})( *, *(?:${Rr}))*)`),hr={},gt=16;Hr.exports=r=>{if(hr[r])return hr[r];let e=vt.exec(r);if(!e)return;let t={weight:"normal",style:"normal",stretch:"normal",variant:"normal",size:parseFloat(e[1]),unit:e[2],family:e[3].replace(/["']/g,"").replace(/ *, */g,",")},a,f,p,s,d=r.substring(0,e.index);switch((a=ht.exec(d))&&(t.weight=a[1]),(f=yt.exec(d))&&(t.style=f[1]),(p=xt.exec(d))&&(t.variant=p[1]),(s=bt.exec(d))&&(t.stretch=s[1]),t.unit){case"pt":t.size/=.75;break;case"pc":t.size*=16;break;case"in":t.size*=96;break;case"cm":t.size*=96/2.54;break;case"mm":t.size*=96/25.4;break;case"%":break;case"em":case"rem":t.size*=gt/.75;break;case"q":t.size*=96/25.4/4;break}return hr[r]=t}});var Fr=Pr($=>{var _t=Nr();$.parseFont=_t;$.createCanvas=function(r,e){return Object.assign(document.createElement("canvas"),{width:r,height:e})};$.createImageData=function(r,e,t){switch(arguments.length){case 0:return new ImageData;case 1:return new ImageData(r);case 2:return new ImageData(r,e);default:return new ImageData(r,e,t)}};$.loadImage=function(r,e){return new Promise(function(t,a){let f=Object.assign(document.createElement("img"),e);function p(){f.onload=null,f.onerror=null}f.onload=function(){p(),t(f)},f.onerror=function(){p(),a(new Error('Failed to load the image "'+r+'"'))},f.src=r})}});function ut(r,e,t,a,f,p,s){let d=a*s+r*(1-s),m=f*s+e*(1-s),y=p*s+t*(1-s);return[d,m,y]}function ct(r,e){async function t(a){if(r===0)return;let{width:f,height:p}=a.canvas,s=a.getImageData(0,0,f,p),d=a.createImageData(f,p);for(let m=0;m<f;m++)for(let y=0;y<p;y++){let c=(m+y*f)*4,n=s.data[c+0]/255,i=s.data[c+1]/255,L=s.data[c+2]/255,w=s.data[c+3]/255;if(w===0)continue;let I,O,R,T=0;w>0&&(n/=w,i/=w,L/=w),I=e[0]*n,I+=e[1]*i,I+=e[2]*L,I+=e[3]*w,I+=e[4],O=e[5]*n,O+=e[6]*i,O+=e[7]*L,O+=e[8]*w,O+=e[9],R=e[10]*n,R+=e[11]*i,R+=e[12]*L,R+=e[13]*w,R+=e[14],T=e[15]*n,T+=e[16]*i,T+=e[17]*L,T+=e[18]*w,T+=e[19],[I,O,R]=ut(n,i,L,I,O,R,r),I*=T,O*=T,R*=T,d.data[c+0]=tr(I*255),d.data[c+1]=tr(O*255),d.data[c+2]=tr(R*255),d.data[c+3]=tr(w*255)}a.putImageData(d,0,0)}return t}function Mr(){let r=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0],e=1;function t(){return r}function a(c){r=[...c]}function f(c){e=c}function p(c,n,i){return c[0]=n[0]*i[0]+n[1]*i[5]+n[2]*i[10]+n[3]*i[15],c[1]=n[0]*i[1]+n[1]*i[6]+n[2]*i[11]+n[3]*i[16],c[2]=n[0]*i[2]+n[1]*i[7]+n[2]*i[12]+n[3]*i[17],c[3]=n[0]*i[3]+n[1]*i[8]+n[2]*i[13]+n[3]*i[18],c[4]=n[0]*i[4]+n[1]*i[9]+n[2]*i[14]+n[3]*i[19]+n[4],c[5]=n[5]*i[0]+n[6]*i[5]+n[7]*i[10]+n[8]*i[15],c[6]=n[5]*i[1]+n[6]*i[6]+n[7]*i[11]+n[8]*i[16],c[7]=n[5]*i[2]+n[6]*i[7]+n[7]*i[12]+n[8]*i[17],c[8]=n[5]*i[3]+n[6]*i[8]+n[7]*i[13]+n[8]*i[18],c[9]=n[5]*i[4]+n[6]*i[9]+n[7]*i[14]+n[8]*i[19]+n[9],c[10]=n[10]*i[0]+n[11]*i[5]+n[12]*i[10]+n[13]*i[15],c[11]=n[10]*i[1]+n[11]*i[6]+n[12]*i[11]+n[13]*i[16],c[12]=n[10]*i[2]+n[11]*i[7]+n[12]*i[12]+n[13]*i[17],c[13]=n[10]*i[3]+n[11]*i[8]+n[12]*i[13]+n[13]*i[18],c[14]=n[10]*i[4]+n[11]*i[9]+n[12]*i[14]+n[13]*i[19]+n[14],c[15]=n[15]*i[0]+n[16]*i[5]+n[17]*i[10]+n[18]*i[15],c[16]=n[15]*i[1]+n[16]*i[6]+n[17]*i[11]+n[18]*i[16],c[17]=n[15]*i[2]+n[16]*i[7]+n[17]*i[12]+n[18]*i[17],c[18]=n[15]*i[3]+n[16]*i[8]+n[17]*i[13]+n[18]*i[18],c[19]=n[15]*i[4]+n[16]*i[9]+n[17]*i[14]+n[18]*i[19]+n[19],c}function s(c){let n=[...c];return n[4]/=255,n[9]/=255,n[14]/=255,n[19]/=255,n}function d(c,n=!1){let i=c;n&&(p(i,r,c),i=s(i)),a(i)}return[()=>ct(e,r),{getMatrix:t,setMatrix:a,setAlpha:f,multiply:p,colorMatrix:s,loadMatrix:d}]}function b(r,e,t){let[a,f,p]=e,[s,d,m]=t,y=[a*s,f*s,p*s,0,0,a*d,f*d,p*d,0,0,a*m,f*m,p*m,0,0,0,0,0,1,0];r.loadMatrix(y)}function tr(r){return r<0?0:r>255?255:Math.round(r)}function v(r){let e=parseInt(r.substr(1,2),16)/255,t=parseInt(r.substr(3,2),16)/255,a=parseInt(r.substr(5,2),16)/255;return[e,t,a]}var dr=new Map;async function Dr(r,e){if(dr.has(r))return dr.get(r);let t=await e(r);return dr.set(r,t),t}async function qr(r,e){if(typeof window<"u"&&typeof document<"u"){let a=document.createElement("canvas");return a.width=r,a.height=e,a}let t=await Promise.resolve().then(()=>ft(Fr(),1));return new t.Canvas(r,e)}function h(r,e){return async t=>{let a=await Dr(r,e);t.drawImage(a,0,0)}}function J(...r){return async e=>{for(let t of r)await t(e)}}async function C(...r){return async e=>{let t=await qr(e.canvas.width,e.canvas.height),a=t.getContext("2d");a.clearRect(0,0,t.width,t.height),await J(...r)(a),e.drawImage(t,0,0)}}async function zr(r,e){let t=r.getContext("2d");t.clearRect(0,0,r.width,r.height);for(let a of[...e].sort((f,p)=>f.zIndex-p.zIndex))await a.draw(t)}function M(r){return r!=null&&typeof r=="object"&&r["@@functional/placeholder"]===!0}function u(r){return function e(t){return arguments.length===0||M(t)?e:r.apply(this,arguments)}}function o(r){return function e(t,a){switch(arguments.length){case 0:return e;case 1:return M(t)?e:u(function(f){return r(t,f)});default:return M(t)&&M(a)?e:M(t)?u(function(f){return r(f,a)}):M(a)?u(function(f){return r(t,f)}):r(t,a)}}}var W=Array.isArray||function(e){return e!=null&&e.length>=0&&Object.prototype.toString.call(e)==="[object Array]"};var G=Number.isInteger||function(e){return e<<0===e};var Q=function(e){return(e<10?"0":"")+e},Oc=typeof Date.prototype.toISOString=="function"?function(e){return e.toISOString()}:function(e){return e.getUTCFullYear()+"-"+Q(e.getUTCMonth()+1)+"-"+Q(e.getUTCDate())+"T"+Q(e.getUTCHours())+":"+Q(e.getUTCMinutes())+":"+Q(e.getUTCSeconds())+"."+(e.getUTCMilliseconds()/1e3).toFixed(3).slice(2,5)+"Z"};var Z5=typeof String.prototype.trim=="function";var To=o(function(e,t){for(var a=0,f=Math.min(e.length,t.length),p={};a<f;)p[e[a]]=t[a],a+=1;return p}),kr=To;function B(r,e){let t=Object.keys(r),a=Object.values(r);return Eo(t,a,e)}function S(r,e,t){let a=ko(Object.values(t),r,e);return kr(Object.keys(t),a)}function ko(r,e,t){let a=r.reduce((m,y)=>m+y,0),f=r.map(m=>m/a),p=t-e,s=f.map(m=>Math.round(m*p)),d=s.reduce((m,y)=>m+y,0);if(d!==p){let m=p-d,y=s.indexOf(s.reduce((c,n)=>Math.max(c,n),0));s[y]+=m}return s}function Eo(r,e,t=a=>Math.random()*a){if(r.length!==e.length)throw new RangeError("Chance: Length of array and weights must match");let a=0,f;for(let c=0;c<e.length;++c){if(f=e[c],isNaN(f))throw new RangeError("Chance: All weights must be numbers");f>0&&(a+=f)}if(a===0)throw new RangeError("Chance: No valid entries in array weights");let p=t(a),s=0,d=-1,m=0;for(let c=0;c<e.length;++c){if(f=e[c],s+=f,f>0){if(p<=s){m=c;break}d=c}c===e.length-1&&(m=d)}var y=r[m];return y}var _=[0,1,0],ue=v("#906B4A"),ce=v("#261C13"),se=v("#FEC8EA"),pe=v("#C63D72"),le=v("#FFCBBF"),me=v("#FF6C62"),de=v("#F0F4FB"),he=v("#C86C93"),ye=v("#B1FF8B"),xe=v("#20BA90"),be=v("#3D3F49"),ve=v("#161D3D"),ge=v("#ED8567"),_e=v("#C0421D"),we=v("#672C32"),Ce=v("#431419"),Ie=v("#513872"),Ae=v("#1E004C"),Se=v("#D2522B"),We=v("#B73811");var X=[{color:"Pink",filter:[r=>b(r,_,se)]},{color:"Peach",filter:[r=>b(r,_,le)]},{color:"Brown",filter:[r=>b(r,_,ue)]},{color:"White",filter:[r=>b(r,_,de)]},{color:"Lime",filter:[r=>b(r,_,ye)]},{color:"Black",filter:[r=>b(r,_,be)]},{color:"Red",filter:[r=>b(r,_,ge)]}],Er=[{color:"Pink",filter:[r=>b(r,_,pe)]},{color:"Peach",filter:[r=>b(r,_,me)]},{color:"Brown",filter:[r=>b(r,_,ce)]},{color:"White",filter:[r=>b(r,_,he)]},{color:"Lime",filter:[r=>b(r,_,xe)]},{color:"Black",filter:[r=>b(r,_,ve)]},{color:"Red",filter:[r=>b(r,_,_e)]}],Be=[{color:"Red",filter:[r=>b(r,_,we)]},{color:"Purple",filter:[r=>b(r,_,Ie)]},{color:"Orange",filter:[r=>b(r,_,Se)]}],Lo=[{color:"Red",filter:[r=>b(r,_,Ce)]},{color:"Purple",filter:[r=>b(r,_,Ae)]},{color:"Orange",filter:[r=>b(r,_,We)]}];function lr(r){return["Diamond","Gold"].includes(r)}function ke({color:r},e){return{draw:h(`${r}.webp`,e),zIndex:-1/0}}function P(r,e){let t=[],a=r.find(f=>f.color===e)?.filter;return a&&t.push(...a.map(f=>{let[p,s]=Mr();return f(s),p()})),t}async function Oo({zIndex:r,baseColor:e,secondaryColor:t,baseColorBasePath:a,secondaryColorBasePath:f},p){let s;function d(c,n,i,L){let w=["Diamond","Gold"].includes(n),I=[h(`${i}/${w?n:L}.webp`,p)];return w||I.push(...P(c,n)),I}let m=d(X,e,a,"BaseColor"),y=t?d(X,t,f,"SplitColor"):[];return s=J(await C(...m),await C(...y)),{draw:s,zIndex:r}}function Ee({color:r,splitColor:e},t){return Oo({zIndex:-1e5,baseColor:r,secondaryColor:e,baseColorBasePath:"BaseColor",secondaryColorBasePath:"SplitColor"},t)}async function Le({color:r,splitColor:e,tailType:t},a){let f=[];if(r=e??r,lr(r))f.push(h(`Tails/${t}-Colors/${r}.webp`,a));else{let p=P(X,r),s=P(Er,r);f.push(await C(h(`Tails/${t}-Colors/${t}-Base.webp`,a),...p),await C(h(`Tails/${t}-Colors/${t}-Accent.webp`,a),...s))}return f.push(h(`Tails/${t}.webp`,a)),[{draw:await C(...f),zIndex:-1e3}]}function Oe(r){return{draw:h("Base/Base.webp",r),zIndex:1700}}async function Pe({color:r,faceType:e,frillType:t,mouthType:a,headType:f,specialType:p,splitColor:s,mustache:d},m){return p==="None"?[...await Te({color:r,frillType:t,splitColor:s},m),...await Po({mouthType:a,mustache:d},m),Mo({faceType:e},m),Do({color:r,splitColor:s,headType:f},m)]:p==="TV Head"?[{draw:h(`Special/${p}.webp`,m),zIndex:1e9}]:[{draw:h(`Special/${p}.webp`,m),zIndex:1e9},...await Te({color:r,frillType:t,splitColor:s},m)]}async function Te({color:r,splitColor:e,frillType:t},a){let f=[];if(lr(r))f.push(h(`Ears/${t}-Colors/Base/${r}.webp`,a));else{let p=P(X,r),s=P(Er,r);f.push(await C(h(`Ears/${t}-Colors/${t}-Base.webp`,a),...p),await C(h(`Ears/${t}-Colors/${t}-Accent.webp`,a),...s))}if(e)if(lr(e))f.push(h(`Ears/${t}-Colors/Base/${e}.webp`,a));else{let p=P(X,e),s=P(Er,e);f.push(await C(h(`Ears/${t}-Colors/${t}-Base-Split.webp`,a),...p),await C(h(`Ears/${t}-Colors/${t}-Accent-Split.webp`,a),...s))}return f.push(h(`Ears/${t}.webp`,a)),[{draw:await C(...f),zIndex:1500}]}async function Po({mouthType:r,mustache:e},t){return[{draw:h(`Mouths/${r}.webp`,t),zIndex:9999990},...e?[{draw:h("Mouths/Moustache.webp",t),zIndex:10000010}]:[]]}function Mo({faceType:r},e){return{draw:h(`Eyes/${r}.webp`,e),zIndex:1e7}}function Do({headType:r,color:e,splitColor:t},a){let f;return["Side","Tuft"].includes(r)?f=J(h(`Head/${r}-Color/${t||e}.webp`,a),h(`Head/${r}.webp`,a)):f=h(`Head/${r}.webp`,a),{draw:f,zIndex:10000005}}async function Me({armType:r,color:e,splitColor:t},a){let f=[];if(lr(e))f.push(h(`Arms/${r}-Colors/Base/${e}.webp`,a));else if(f.push(await C(h(`Arms/${r}-Colors/${r}-Base.webp`,a),...P(X,e))),t){let p=P(X,t);f.push(await C(h(`Arms/${r}-Colors/${r}-Split.webp`,a),...p))}return[{draw:J(await C(...f),h(`Arms/${r}.webp`,a)),zIndex:1000105}]}async function De({accessoryType:r,color:e},t){let a=[];return r==="Flamingo"?(a.push({draw:h(`Accessories/${r}B.webp`,t),zIndex:5e4}),a.push({draw:h(`Accessories/${r}T.webp`,t),zIndex:1000500})):r==="Hoodie"?(a.push({draw:await C(h("Accessories/HoodieBase.webp",t),...P(Be,e)),zIndex:1e6}),a.push({draw:await C(h("Accessories/HoodieLine.webp",t)),zIndex:1000030}),a.push({draw:await C(h("Accessories/SleevesColor.webp",t),...P(Be,e)),zIndex:1000500}),a.push({draw:await C(h("Accessories/HoodieAccent.webp",t),...P(Lo,e)),zIndex:1000020}),a.push({draw:await C(h("Accessories/SleevesLine.webp",t)),zIndex:1000530})):r!=="None"&&a.push({draw:h(`Accessories/${r}.webp`,t),zIndex:1000500}),a}var Re=S(0,255,{Blue:40,Gold:7,Lime:3,Pink:20,Salmon:20,Turquoise:20,White:1}),He=S(0,255,{Normal:6,Curled:3,Wiggles:1,Short:.5}),Lr=S(0,255,{Pink:30.25,Peach:24,Brown:16,White:20,Gold:.5,Diamond:.25,Lime:1,Black:10}),Ne=S(0,255,{Split:2,"Not Split":48}),Fe=S(0,255,{None:98.5,"Skull Face":.5,"TV Head":.5,"Giant Eye":.5}),qe=S(0,255,{Claws:8,Paws:2}),ze=S(0,255,{Short:2,Wide:3,Thin:4,Wiggles:1,Puffy:1,"Teenie Tiny":1}),je=S(0,255,{None:40,"Bow Tie":16,Heart:12,"Neck Tie":5,"Rainbow Cape":3,Flamingo:3,Floaties:8,Hoodie:2}),Ge=S(0,255,{Red:10,Orange:50,Purple:10}),Ue=S(0,255,{Anger:10,"Clout Goggles":3,Derp:7,Lash:25,Oval:30,Troll:4,Visor:6,Bored:9,Disapproval:4}),Xe=S(0,255,{Bleh:11,Blunt:2,"Happy mouth":17,owo:14,Plain:10,Smile:19,Smirk:18,"Smol frown":7,Fangs:4}),Ve=S(0,255,{Mustache:3,"Clean Shaven":97}),Ke=S(0,255,{Bald:40,Tuft:22,Side:14,"Cowboy Hat":5,Crown:1,Halo:2,Octopus:1.5,"Party Hat":3,"Spin Beanie":2.5,Beanie:5.5,Birdie:3.5});function Ho(r){let e="";for(let t=0;t<r.length;t++){let a=r[t].toString(16);a=a.length===1?"0"+a:a,e+=a}return e}function No(r){let e=r,t=T=>{if(T!=255)throw new Error(`Expected a range of 255 but got ${T}`);let mr=e[0];return e=e.slice(1),mr},a=B(Re,t),f=B(Lr,t),p=B(Ne,t),s;if(p==="Split"){let T={...Lr};delete T[f];let mr=S(0,255,T);s=B(mr,t)}else e=e.slice(1);let d=B(je,t),m=B(Ge,t),y=B(He,t),c=B(qe,t),n=B(ze,t),i=B(Ue,t),L=B(Xe,t),w=B(Ve,t),I=B(Ke,t),O=B(Fe,t);return["Cloud Goggles","Troll","Visor"].includes(i)&&(w="Clean Shaven"),{metadata:{seed:Ho(r),attributes:[{trait_type:"Background Color",value:a},{trait_type:"Base Color",value:f},...p==="Split"?[{trait_type:"Secondary Color",value:s}]:[],...O!=="None"?[{trait_type:"Special Feature",value:O}]:[],{trait_type:"Accessory",value:d},...d==="Hoodie"?[{trait_type:"Accessory Color",value:m}]:[],{trait_type:"Tail",value:y},{trait_type:"Arm",value:c},{trait_type:"Frills",value:n},{trait_type:"Face",value:i},{trait_type:"Mouth",value:L},{trait_type:"Facial Hair",value:w},{trait_type:"Head",value:I}]},arm:c,special:O,accessory:d,accessoryColor:m,backgroundColor:a,baseColor:f,split:p,secondaryColor:s,tail:y,face:i,frills:n,mouth:L,head:I,mustache:w}}async function $e(r,e){let{metadata:t,arm:a,special:f,accessory:p,accessoryColor:s,backgroundColor:d,baseColor:m,secondaryColor:y,tail:c,face:n,frills:i,mouth:L,head:w,mustache:I}=No(r);return{metadata:t,layers:[ke({color:d},e),await Ee({color:m,splitColor:y},e),...await De({accessoryType:p,color:s},e),...await Me({armType:a,color:m,splitColor:y},e),...await Pe({frillType:i,faceType:n,mouthType:L,headType:w,specialType:f,color:m,splitColor:y,mustache:I==="Mustache"},e),Oe(e),...await Le({color:m,splitColor:y,tailType:c},e)]}}var Je={"White.webp":"d751554f45682e0a890931727c2664d741f96dc9198d9b4b34f0bd2fe4c29803i0","Turquoise.webp":"81200863b54bdbd8c51a94c77f1022e8c415a9ec2b04112e077773af24012dcci0","Salmon.webp":"d300f6ea34ff2cf08368055cbf9d3dd0f4e4698576112a717cf34a612d6b0e77i0","Pink.webp":"0049a8a9b1fe9030f8eac45eefcada79ca8771cecfcad9bcdece5b6a69c5bdefi0","Lime.webp":"d9c5f85772117429118a5dff5b94ed09db9f31c5dc6656a11bbf27029f24f936i0","Gold.webp":"2390b9cc8742a97e187d36ef410f97a13c1babd53e583df660a6516937f61472i0","Blue.webp":"d332fb707da7d6b9996f7d41297118e6fa2e6d61af0ed1643099503a92761325i0","Tails/Wiggles.webp":"ebff831484d5607e0c26ec6bedc0a8eb4d92504f7f3a51995c1af54dadf48b57i0","Tails/Short.webp":"0cea684f1b7a7f44e9f210e3b94eb0812982543f49e27be5cde1809ba27fc5f6i0","Tails/Normal.webp":"61ac5cbe3c5fb1740da00723f35a7d422d8c402d7e7a4ec23052c6336e7fbe57i0","Tails/Curled.webp":"956947ff206b6df6b2a73205e49c8703d8f1adfbeaf4b38673aee3a6e26cdbc0i0","SplitColor/SplitColor.webp":"049a963b445b7b10b38a2b13f26103eee6ca39d001fe0f70459e65fa85461859i0","SplitColor/Gold.webp":"6f469705b75a37fafa22025bedb173fe39837a17651063c61d760bd347a8403ai0","SplitColor/Diamond.webp":"2dbdf874c493a57a0f8cf084b52ad0670f5ece817ee78ce035678e57abc459ffi0","Special/TV Head.webp":"c2e5e6962611990ebbdc93325dbf5b20a991629f761a2403e1c0ed8fa630bf87i0","Special/Skull Face.webp":"a4917840b3c016d48830236450cc9bf9f487e6d44e5c604fc9d0222c8782e3e0i0","Special/Giant Eye.webp":"7c31075140cf4b1f5e857e800457374f067c9dc4129c13495a7072850b783ccei0","Mouths/owo.webp":"76742afc8d6be376a07e77deb09ec9d9c79444d2d3790616d6a478d564f83102i0","Mouths/Smol frown.webp":"cbfe6db5e16066c5ca46ce17cb392b2c63bb3e323de60049a6c20064234b3cfai0","Mouths/Smirk.webp":"76e30ac635d14f27486d15e6d251f29df3d10c5352d3425d97810d2b5bb0ad3bi0","Mouths/Smile.webp":"b26df7d4b889cc190765cfc7923920a4264e94b96611ea6dc3d76459e520acdai0","Mouths/Plain.webp":"2488ff0bd0d5dd8b6240b41d8c9a6f4d17c6ecf55b3324ddeaaecfc809973537i0","Mouths/Moustache.webp":"30ef2b615c633646e6b34441225412ebc017d56d28f9d01af22934949d3da291i0","Mouths/Happy mouth.webp":"78c8ed42f839bebdd08a45809e478c28a6010a0cb17c3ca7e9e81472056d9acfi0","Mouths/Fangs.webp":"c3fd848bdc7a5abb6dd6c387ff48b3f2a52da3d3acceb806d34a1d2e6f3bdfcci0","Mouths/Blunt.webp":"baf3e9a94c4b343ae85eebba0985935577c7351b382ff4aa2bc9d610a9180c0ci0","Mouths/Bleh.webp":"a7edc7a0fb85b4a32df5b133d26b4b2339256f36b8f9552157ab3764beb85c28i0","Markings/Freckles.webp":"a0a1512ae517231011a8e0514cbb4ecc2a032624f46947e62c0914dcc098f257i0","Markings/Blush.webp":"d59863e9957a39ed7de53d7eb962dc3627f777d94e8c1f78f0f0cfe8fcd65ffci0","Head/Tuft.webp":"cdb539e5e03076c8453e6af08ed6c1034471f4a8f1191fedbfa70844d980a6efi0","Head/Spin Beanie.webp":"f2612b08199394a5a4c0a470eddef4908572d4eef118db59c3c579c1b34ea4d6i0","Head/Side.webp":"b248edd77f318892e494fff7e7b826a50f27806623bbdc7749dc42c76708e450i0","Head/Party Hat.webp":"92b7c7d2909c131c92de120fb99e9e8550a8826b6bbc7f841e9abb346a427a1ci0","Head/Octopus.webp":"2f32912c1e20c1dff826e49b209dee1c407a1cb5f0ec79290cde569d9f3d816ci0","Head/Halo.webp":"ed16807bd6f40eab6427aa650571edf65191f52b3e0a5d92543b0080916733b8i0","Head/Crown.webp":"6fba7e0188573fcb333b0e4d57c304c840dc5a6ee56687197140536a55371dc3i0","Head/Cowboy Hat.webp":"29d16e156e66f956dea7bc11c28e4c0965f540f7f3417b4c092c9673797c9bd5i0","Head/Bowl Hat.webp":"11abde26869e48f2ec9c4cffe01cff57837890beba3ff866bd7651e3a4890ccci0","Head/Birdie.webp":"617fbd2ff9d78b86fb4bcce7636749fff093b99cad94820bfede53d9b332dcb1i0","Head/Beanie.webp":"a987011aa34092a4591336278f2ed127525094bd6d5e73a365342fa09224d7cci0","Head/Bald.webp":"49c48f4d43611f7b94bd2d9328f876f4ec75639ff5fe9a79e5da1875c044333di0","Eyes/Visor.webp":"076cadce13f3fd89c2762c54eaa91ae050316e3c880190c8b3201a21186fb92ei0","Eyes/Troll.webp":"b515a5840f3d00276c469d1d57c641f4d780ed25ddce47a9f31ded41d61b6f5bi0","Eyes/Oval.webp":"7f403b1cebb34ffae71ba1719dbf123e0eb924ba86f96cf7313d3e001f84cf02i0","Eyes/Lash.webp":"313ad3fcb558cf38c4db2edbc0a9d4bdb391964a70b6b0a28237baceaa1c3b96i0","Eyes/Disapproval.webp":"63b662a22dd9aa85c9ca233c0bb68105c85fff408005898d683ee3c74124dd28i0","Eyes/Derp.webp":"704dce0f237a5298e6a5590858088c35dc41e3d21057cf80a0792c3479a68c57i0","Eyes/Clout Goggles.webp":"53a2fe445650717e8d5d6ddff1f0a0ab85b79ecdc38f5c59bfebdf223eb2bd87i0","Eyes/Bored.webp":"127f0bfccdc7c63f0ba0750e1cc872d1d1133338d6e6e6b16c6a0800a295c2b6i0","Eyes/Anger.webp":"0d2450f23f791d09ee50df257f02aba888829f5ff00dca0b1f95bd2e11f38c9ai0","Ears/Wiggles.webp":"8af832b9ad9cb9b9ede5ca046e81ee3f93e3781dca9107234994eb671c90e0c2i0","Ears/Wide.webp":"f09623b6f2d9347ae648ef49569595b533470dbb85dec0f75729e2bfc4e45939i0","Ears/Thin.webp":"a9a29d1f559acc55f2cda884120310bd3885fb2b5325b34f9ded015d03e3e299i0","Ears/Teenie Tiny.webp":"827f8129d769fcfaa9a78033ccf86fefdc98949eb8a615b06eee63f6563223f2i0","Ears/Short.webp":"0e04a5d814dedc0222a49f2e0cfac4161c7b314101eff9b510d128ba1885066ci0","Ears/Puffy.webp":"2a5ceac19fee11deb705d73756ea2268e6df896e40946af530568ec06365ff18i0","Base/Base.webp":"43fa46bffba992fa71fd2a1829ec25d6868ec958241cd0522bd9604f292b2cf4i0","BaseColor/Gold.webp":"923243a4b1fd9aaa8cc32145e3a3016a68d5e1ba12676ee04f953ed18eaee9aai0","BaseColor/Diamond.webp":"8ccdb10a61984d5afa967a574da6126f88d2eeda33bd5ccc208103e4e556eccei0","BaseColor/BaseColor.webp":"310b6d998d461a91dee549501f5e281d974536e6d133bb07ebc48c302bad3cb6i0","Arms/Paws.webp":"d297696237bbc1b94cbf1490cb5bad7fbfcbd251c796f60f529c45037f20c0c7i0","Arms/Claws.webp":"ec39df21aa41fdef9d69324cf4190ba9fa112184709ee9b3f9e7c5776190c04di0","Accessories/SleevesLine.webp":"a746afb9a0904cad17905f2111f12b739a8f0d6dabb8d5bce112f14826fac0a8i0","Accessories/SleevesColor.webp":"b2c08417fc032093dbd0b95ce7e817c179d75d46eca64e6c3028793d5a51cedci0","Accessories/Rainbow Cape.webp":"d725b5d320211421df2a0f88b6706701283bbe9bf86ccaaa92ac0cdf56f9fc2fi0","Accessories/Neck Tie.webp":"82787cb252f60fd67eb58f63677b52f6592045d05052950f1c04cc8ed7059fe8i0","Accessories/HoodieLine.webp":"b96c723f99bbc3937adcf8eebdf62976314cfd3dc856f5af26eebcdcd11efb2ci0","Accessories/HoodieBase.webp":"e63df6d302780092bfa18a8220c06db37bc0953341047dadeee5d95452968b29i0","Accessories/HoodieAccent.webp":"19477123f26ef50ea602c8d89cf1eddcdaaef97add302446d9cbc9422c5a81d8i0","Accessories/Heart.webp":"d329deb95d25070ac41c54f9358228fcc73111c5ba10ecfb9f6bab9b705f599fi0","Accessories/Floaties.webp":"261d7c20bd3f69b5f8e94cb0d2bbcbe0a0c40976924c1397da89182369404619i0","Accessories/FlamingoT.webp":"b469a47d27c4075d659420bc313b7b82b25c6a4169e0a31cf428a77dcd7f253ei0","Accessories/FlamingoB.webp":"1cbc0a00a1d8d97c446971539760c6e3b207a7c010d935864c240c1f0057fd82i0","Accessories/Bow Tie.webp":"6ab44cc4d1f8b19baf8c7f43946fcab8543983c550c8f395b8b9392139ad1673i0","Tails/Wiggles-Colors/Wiggles-Base.webp":"5913e36adf4bb469b1e3c26af0f38d2ca523718b088ed49c3ae3785b2617116fi0","Tails/Wiggles-Colors/Wiggles-Accent.webp":"13e4a8906c5210a3dc9d1b2b9f8e281fc1d9aca7125c4738d60084356df6381bi0","Tails/Wiggles-Colors/Gold.webp":"79eb8e2c46fe0fad23d1e199a6fcac5943b4015ce910d0863d1e3ac7fcb889afi0","Tails/Wiggles-Colors/Diamond.webp":"11bfc8b19e2b30f2c4c506c74e0e8f5b86f016332fd269c4b48e0e5693ddb6a1i0","Tails/Short-Colors/Short-Base.webp":"dce2607074a8f949902f50430d055281bd438b25397bcf5494d7b37d80a6b11bi0","Tails/Short-Colors/Short-Accent.webp":"0f6471f2f4bdb2a50b64a8081ed4563e64bc29112864e14acda8ddf01fdb07c7i0","Tails/Short-Colors/Gold.webp":"f14098bf7de0d3f0af52b70bdf21a29bbff569cace24df33ef80828e517f4896i0","Tails/Short-Colors/Diamond.webp":"f01084203fc40841df26c56bfbaf02615791ac4968aaaa778a3fd1daba18852ei0","Tails/Normal-Colors/Normal-Base.webp":"a40fca383e1e94f101023d29c93e6eb6f8baeb1ca9e73dae3d76aed40ad0a54ai0","Tails/Normal-Colors/Normal-Accent.webp":"a4a8461d740de0e335d8c9d3d51867faecf483168143d87df7e5be5a44e03a29i0","Tails/Normal-Colors/Gold.webp":"a14d3136d259d879a06f9d1565bc42eedd3458b67429ca725fe37bc9c3148ee8i0","Tails/Normal-Colors/Diamond.webp":"ce04a7d0b859f4aeb3ba25d53cc00b8eb109f840bb01bf9409fca68372ccc299i0","Tails/Curled-Colors/Gold.webp":"ed82345c3696e5adb921cb5eb4d1ee44061ed566d1b2628621691074c55804cdi0","Tails/Curled-Colors/Diamond.webp":"6a1b34fcad78aba9eda6956537cc1007a484e2e1b53262c602fe5ad90f445aa0i0","Tails/Curled-Colors/Curled-Base.webp":"dc80b6be6ac01bee3547d9b1dd8482e90aeb71f54ac9b71bd00692bef60ee2dfi0","Tails/Curled-Colors/Curled-Accent.webp":"28257e1069c1d6a3de7a4ffca45583e056d97f802c937d5997e8e95b7baf09abi0","Head/Tuft-Color/White.webp":"aafd689d68ad25b3baf0d74a95e810787d1f31e11746da681230444462eb23a8i0","Head/Tuft-Color/Tuft-Split.webp":"91ae07c0cc2342575c2c457ff0f0b142eda991213f0f8369942a7beb8fda29a3i0","Head/Tuft-Color/Pink.webp":"ae1736c5e0e02317651bd938593edf67f27a20951cb810ff1f46484a8fac7189i0","Head/Tuft-Color/Peach.webp":"0c329e3388fd179249fffbc2293d4806055896a6d2d8dcf9eabe9a71c1f35f21i0","Head/Tuft-Color/Lime.webp":"414fbe968411203ba63a33dd03e9295b4303a9d178b5c7e4aeed875227eaeaa9i0","Head/Tuft-Color/Gold.webp":"d6c0623e44f876de9a8ddca68e18840b8bf46d75fa7250852b8e81276c58026fi0","Head/Tuft-Color/Diamond.webp":"e66ed4ddcfc3b7f06fae13be97b213e4f46424b154ee206d7f66c6971db5ecb8i0","Head/Tuft-Color/Brown.webp":"709906a4bdc098cf9e5ef36de46e425bca0439c6a8341f4e9a19a3d212b1bcd0i0","Head/Tuft-Color/Black.webp":"44ef03a349e540ed618f3b036617a67ad5e963ea097f874a5ef250838e2460f0i0","Head/Side-Color/White.webp":"b52cff1024418cc49c955c29afbc012271916d2b27ca5a507f9ace0d1ec8799bi0","Head/Side-Color/Side-Split.webp":"5d8e70dfb238c79b4f37dee2795dfdaa114137a16c3e95460b6dc0e07d6319fbi0","Head/Side-Color/Pink.webp":"697a94e6f67ca8069fd8d8c0d307b14e1f8e1cefcf0fb211255db69fec8b035di0","Head/Side-Color/Peach.webp":"230d71c8bbf4be31febe6dec569250772d19430d155b9e51b99ffa4990bac6fei0","Head/Side-Color/Lime.webp":"add40ca67e9800302a0fb0c603035a580b27c39b1048b64b509316adcdc48a4fi0","Head/Side-Color/Gold.webp":"0504d7f09ecac62c2bd22d2219ebda3bb458b048ca85c6acbcb585a44723e883i0","Head/Side-Color/Diamond.webp":"16fb7d1eac7d9487d5a6ee788dad64292be87ec7f27347429204a0757218113bi0","Head/Side-Color/Brown.webp":"0a5cf45c9fb99c07031286ce89b17fdbdd69520dc50f94bf8c0852f48f3e8cb6i0","Head/Side-Color/Black.webp":"d21802c9e244bdabcbc4ee8765e57f6728aa400f727b12a46d8312242a84d3a9i0","Ears/Wiggles-Colors/Wiggles-Base.webp":"4ae4e835d37b136adc4c66a282360573a656a6bfcbada0e113e78487967da2f8i0","Ears/Wiggles-Colors/Wiggles-Base-Split.webp":"46c9ab3e62cca7dbc8adeba1cb6e39fc820a5fa485a07787fa200fad580e48a2i0","Ears/Wiggles-Colors/Wiggles-Accent.webp":"e97048b8c9042868023df95cdba3303df5d45ad9fc8fccbdf3dcfceeb609b2f1i0","Ears/Wiggles-Colors/Wiggles-Accent-Split.webp":"4baa44640545b6a733925060c9f344c50282fc94ec2ceceeb757d36ede76ef46i0","Ears/Wide-Colors/Wide-Base.webp":"21f0284ece17194e08bd1650a802f73fd10f6f39d3187feacf763a9b7a2dfdaai0","Ears/Wide-Colors/Wide-Base-Split.webp":"8bbfa3f23c96b4707c4ae6216a54af5ab4d12d0014a7afcaa41f8973a6585c02i0","Ears/Wide-Colors/Wide-Accent.webp":"e43a36998edf9f22b7f5c79aeafc8e20713c121f9e31744836b889447dd19e99i0","Ears/Wide-Colors/Wide-Accent-Split.webp":"35f07f8a98f110c93a331a22870fb86a249946a728945555311fcc5b86e500d2i0","Ears/Thin-Colors/Thin-Base.webp":"7d1ee1d0c6482946496bf034d3e9068b3a40ab2da5fdf407e2d24f106d4be048i0","Ears/Thin-Colors/Thin-Base-Split.webp":"149825bb5d7307517f62807c1b2c6ec6ca2ef8ef57b57e1c1ab413a61e7ba40bi0","Ears/Thin-Colors/Thin-Accent.webp":"e8766e74f0b1d019958eb3bac54b2b0bec61a4a7483e05eea994d5136e69a463i0","Ears/Thin-Colors/Thin-Accent-Split.webp":"19812daf3045670aa8624e3b3cd406fa33a500b641d73b75c25b6dd4ce1d38cei0","Ears/Teenie Tiny-Colors/Teenie Tiny-Base.webp":"4ecf670d7ea35269b3906f0505799c30c7cb02bd1d635aaef14888dc7237f690i0","Ears/Teenie Tiny-Colors/Teenie Tiny-Base-Split.webp":"70e9d2c8bab88559841d0fe2cf1d2b199dad33b51b98acc334e99d1c1f37f0fei0","Ears/Teenie Tiny-Colors/Teenie Tiny-Accent.webp":"9d92e4e7c567fe90dacb2f352a35389e84b6096cba5a556d18112b86f90104b9i0","Ears/Teenie Tiny-Colors/Teenie Tiny-Accent-Split.webp":"c1f116485a8cedd0c3928984b3974d3a7d08fba8ccf0a854119d897f977c6ae9i0","Ears/Short-Colors/Short-Base.webp":"cb5dee0b56a63ea03947eeef6df3b071c195e6d38b904d7b06b23593fc7a10ebi0","Ears/Short-Colors/Short-Base-Split.webp":"ee756b0a109c710bfa2af7e3646b352a1ecc3bfd632f32f4c6d19bd7b0cc0af7i0","Ears/Short-Colors/Short-Accent.webp":"80906fa2818346999330723de5cace7c08863385314088a2d4d62c151f64d442i0","Ears/Short-Colors/Short-Accent-Split.webp":"fcde14942485a54aac5cf066f14cd0108b2ad54e2c51828f4b0b2e7deab59914i0","Ears/Puffy-Colors/Puffy-Base.webp":"d0372200e0e35628187ab18217920019c07bbb7b7e363b205197e1e0d0dbdce3i0","Ears/Puffy-Colors/Puffy-Base-Split.webp":"d08c438068327c2c136087c00bbc29e505b83cb94944ae0a68731bd708ef601ai0","Ears/Puffy-Colors/Puffy-Accent.webp":"19ce001e9ef40540be85d4a0b1e07d2c553074c5783df5e95b296036f3e2f5afi0","Ears/Puffy-Colors/Puffy-Accent-Split.webp":"82128c81011b8a83eb2182917a28ba44ffb7722e2f2fa815ec7ba674e564e33bi0","Arms/Paws-Colors/Paws-Split.webp":"305b2662c59019a1c3006b12880e7d42fc4d6ee1af854856d6639be36b277b37i0","Arms/Paws-Colors/Paws-Base.webp":"ecdf4c88b75e18c6f71a5e2150eff7a28ebe685194236ea6fb48222cc5304854i0","Arms/Claws-Colors/Claws-Split.webp":"9ba13cf778b5fbf0681e11bccb4a0df4dce3cf2f6ba87865e4c750831c1035c3i0","Arms/Claws-Colors/Claws-Base.webp":"05ab5f9abaf9ef0ee2ea93e67126265f93ec85f4e3979557dfd109e1a947efe3i0","Ears/Wiggles-Colors/Split/Gold.webp":"73b1591c01f5d9532f8c821c9b4bb15fb3ca0bc16af52b0f8d04f7b044604523i0","Ears/Wiggles-Colors/Split/Diamond.webp":"2b6159c9a44b4bb7f5da4ab5928b88e520dd626d97bfbd756a322d4bc707ac22i0","Ears/Wiggles-Colors/Base/Gold.webp":"a362463753d1623702ad6dd7d86abe049280edad6f5c8029bebbb0efe67cdff6i0","Ears/Wiggles-Colors/Base/Diamond.webp":"d0d9eccd70dbb11d65ac60596dc5da03d6b7e508011b43d65d05405546e7faa6i0","Ears/Wide-Colors/Split/Gold.webp":"2d210ebeab73f5a6e1f9eb9fccab7eb83c53a4b3801b5a88c47a48ee0f049db1i0","Ears/Wide-Colors/Split/Diamond.webp":"539a5676dc6c7ffde8849c6b760f2acbe1e2574143c1666ca7788afeb4101e12i0","Ears/Wide-Colors/Base/Gold.webp":"8a9e295c6a83075b4a1d182d50509c6ee40a20735f1dc49e4fe5ac82ac87383fi0","Ears/Wide-Colors/Base/Diamond.webp":"165f0297abd354834979e0579f63d184462fb215b0545247a631d53418d41b17i0","Ears/Thin-Colors/Split/Gold.webp":"9319ee77db1a58120cfd0fa101191bc9155e3989a408f95df53be35b8392ae0fi0","Ears/Thin-Colors/Split/Diamond.webp":"94cfa9ec9feaef029e675250f9fcc5a505b513e52a0c9585f121533bb8b4da6ei0","Ears/Thin-Colors/Base/Gold.webp":"534deffb78d2b9eb8da6b3687ab4821e622c27984db03c9ee426f5314419b576i0","Ears/Thin-Colors/Base/Diamond.webp":"01cfb063bb0a2de688b46c09767588a5ec27cf70ec97ba334c2f40b575828f79i0","Ears/Teenie Tiny-Colors/Split/Gold.webp":"c6d078eb75fdf6c17c1385f1c405f5331fb09e18794ca6ba7869230d24510ed0i0","Ears/Teenie Tiny-Colors/Split/Diamond.webp":"008bc996f61f37b3bd18485d8571b1a47552074e2b26042649dd3f483b3daf37i0","Ears/Teenie Tiny-Colors/Base/Gold.webp":"0c60fbe7d594f7ca9582553d3dddd0cb2644e7c1bd548fe6fb068cf3b35d34e8i0","Ears/Teenie Tiny-Colors/Base/Diamond.webp":"f5c9b0798054e6d01e665c7420715818b8d55045b5400a6fb96e196c1adcbb26i0","Ears/Short-Colors/Split/Gold.webp":"0b7f82b137305412a315452d7b3f58d2a472ee10440791bf1ec30f27071e68b9i0","Ears/Short-Colors/Split/Diamond.webp":"538b17628793826caa85121f670c51ce61019061cecd8dbbbe7e8b557311538fi0","Ears/Short-Colors/Base/Gold.webp":"be63a9cbd557648de565660be1ed946ab8c90d84136bc743281255ede556f831i0","Ears/Short-Colors/Base/Diamond.webp":"1da308870ba1aa9ff9560a3353452591452ac575a2464fee7c476b8a422fd27ei0","Ears/Puffy-Colors/Split/Gold.webp":"5cb1996419ec732d7dc26a17f02b28deaec49cf973c9c422a829841bd1893587i0","Ears/Puffy-Colors/Split/Diamond.webp":"18a2dc85306f2757feefada912eb58a2f2809b59ce29331abf7a953997d977fci0","Ears/Puffy-Colors/Base/Gold.webp":"3e5580a820230deffdf141734e7b82dc4ec8dc6bce57cb05340d307ac4831323i0","Ears/Puffy-Colors/Base/Diamond.webp":"941924d3f9a43908f759ffb481196cc8d1f7e18712014733948cfebfdf83123di0","Arms/Paws-Colors/Split/Gold.webp":"030ce242f106ed6b32704a07c35216a58645a74c15a80d585b0ee8bba195bf24i0","Arms/Paws-Colors/Split/Diamond.webp":"340f522bbb2f827908cc125f1eff480a140d6a758bf8517bdc5a14b706de2006i0","Arms/Paws-Colors/Base/Gold.webp":"8c5c489982b3987d243584623832385e17e4c3a67267ab6e6596d8c84678674bi0","Arms/Paws-Colors/Base/Diamond.webp":"ce063dfcd15ae8a86e514c6821e34f9509505028eb7cdb82f60265360f96539ei0","Arms/Claws-Colors/Split/Gold.webp":"795b8b72db3a683570df0fc33efefa7cdac63fd665afb865d83e83e85c785f1di0","Arms/Claws-Colors/Split/Diamond.webp":"9593d1cbc3e54a65637acbf330e125490dea24f8462105f6d71f22181bcc49bfi0","Arms/Claws-Colors/Base/Gold.webp":"b99d7b63e9b6423aaf957fb9408127b6265d17e16ef3425206ecc3502254b948i0","Arms/Claws-Colors/Base/Diamond.webp":"c64bc6a7fb14fdebd04e52cbfcd91d8b72ed0d43900ae018725436778da32066i0"};var er=document.querySelector("canvas#main");function Fo(r){return`/content/${Je[r]??r}`}var Ye=null;async function qo(r){let{layers:e,metadata:t}=await $e(r,p=>{let s=document.createElement("img");return s.src=Fo(p),s.crossOrigin="anonymous",new Promise(d=>{s.onload=()=>d(s)})});Ye=t;let a=document.createElement("canvas");a.width=569,a.height=569,await zr(a,e),er.getContext("2d").drawImage(a,0,0)}function Ze(r){let e=new Uint8Array(r);for(let t=0;t<r;t++)e[t]=Math.floor(Math.random()*256);return e}async function zo(){let r;if(globalThis.window.genesis)try{let t=await fetch("/blockhash");if(t.status!==200)return Ze(32);r=await t.text()}catch{return null}else try{r=await(await fetch(`/blockhash/${globalThis.window.revealedAt}`)).text()}catch{return null}return await crypto.subtle.digest("SHA-256",new TextEncoder().encode(r+globalThis.window.tokenId))}async function Qe(){let r=await zo(),e,t=!1;if(r){let a=new Uint8Array(r);e=new Uint8Array(a.slice(0,32)),t=!0}else e=Ze(32);await qo(e),t||setTimeout(Qe,1e3)}Qe();function rt(){var r=Math.min(window.innerWidth/569,window.innerHeight/569);er.style.width=569*r+"px",er.style.height=569*r+"px"}window.addEventListener("resize",rt,!1);rt();er.addEventListener("contextmenu",r=>{r.preventDefault();let e=er.toDataURL("image/png"),t=document.createElement("a");t.href=e,t.download=`${globalThis.window.tokenId}.png`,t.click()});window.addEventListener("keydown",r=>{if(r.key==="m"){r.preventDefault();let e=JSON.stringify({tokenId:globalThis.window.tokenId,...Ye},null,2),t=document.createElement("a");t.href="data:text/json;charset=utf-8,"+encodeURIComponent(e),t.download=`${globalThis.window.tokenId}.json`,t.click()}});})();
