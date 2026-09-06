"use client";
import {useEffect,useMemo,useState} from "react";
import {createClient} from "@/lib/supabase";
import {Home,Search,Library,Layers,NotebookPen,LogOut,Plus,ArrowRight,ShieldCheck} from "lucide-react";
import tealLogo from "./glaze-shelf-teal.png";
import logoSuite from "./glaze-shelf-logo-suite.png";
const placementOptions=["overall","top half","bottom half","rim","design only","overlapping band"];
const effectOptions=["Waterfall","Drippy","Pools","Fluid","Stable","Breaks on texture","Reactive layering","Crackle","Matte","Gloss","Crystal"];
const colorOptions=["Blue","Blue-Green","Green","White / Cream","Black / Charcoal","Brown","Red","Orange / Coral","Yellow / Gold","Pink","Purple","Clear"];
export default function App(){
 const sb=useMemo(()=>createClient(),[]);
 const[session,setSession]=useState<any>(null),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[msg,setMsg]=useState(""),[tab,setTab]=useState("home"),[recovery,setRecovery]=useState(false),[newPassword,setNewPassword]=useState(""),[confirmPassword,setConfirmPassword]=useState("");
 const[shelf,setShelf]=useState<any[]>([]),[kind,setKind]=useState("glaze"),[q,setQ]=useState(""),[results,setResults]=useState<any[]>([]),[layers,setLayers]=useState<any[]>([]),[clay,setClay]=useState<any>(null),[cone,setCone]=useState(6),[projectDescription,setProjectDescription]=useState(""),[goal,setGoal]=useState(""),[analysis,setAnalysis]=useState<any>(null),[recipes,setRecipes]=useState<any[]>([]),[recipeName,setRecipeName]=useState(""),[recipeDetail,setRecipeDetail]=useState<any[]>([]),[shelfView,setShelfView]=useState("materials"),[studios,setStudios]=useState<any[]>([]),[studio,setStudio]=useState(""),[studioName,setStudioName]=useState(""),[join,setJoin]=useState(""),[studioShelf,setStudioShelf]=useState<any[]>([]),[firings,setFirings]=useState<any[]>([]),[recipe,setRecipe]=useState(""),[movement,setMovement]=useState(""),[rating,setRating]=useState(5),[photo,setPhoto]=useState<File|null>(null),[preview,setPreview]=useState("");
 const[glazeDetail,setGlazeDetail]=useState<any>(null),[glazeDetailLoading,setGlazeDetailLoading]=useState(false);
 const[effectSearch,setEffectSearch]=useState(""),[colorSearch,setColorSearch]=useState(""),[searchScope,setSearchScope]=useState("all"),[finderCone,setFinderCone]=useState(""),[searchStarted,setSearchStarted]=useState(false),[searching,setSearching]=useState(false);
 function decodeApplication(value:any){const raw=String(value||"overall").toLowerCase();if(raw.includes("::")){const[surface,placement]=raw.split("::");return{surface:surface||"inside & outside",placement:placement||"overall"}}if(raw==="inside"||raw==="outside")return{surface:raw,placement:"overall"};return{surface:"inside & outside",placement:raw}}
 function encodeApplication(layer:any){return `${layer.surface||"inside & outside"}::${layer.placement||"overall"}`}
 function titleCase(value:string){return value.replace(/\b\w/g,c=>c.toUpperCase())}
 function usesCustomPlacement(layer:any){return layer.placementMode==="custom"||!placementOptions.includes(layer.placement||"overall")}
 useEffect(()=>{sb.auth.getSession().then(({data})=>setSession(data.session));const{data}=sb.auth.onAuthStateChange((event,s)=>{setSession(s);if(event==="PASSWORD_RECOVERY"){setRecovery(true);setMsg("")}});return()=>data.subscription.unsubscribe()},[sb]);
 useEffect(()=>{if(session){setMsg("");load()}},[session]);
 async function load(preferredStudioId=""){
  const[a,b,c,d]=await Promise.all([sb.rpc("get_my_shelf"),sb.rpc("get_my_recipes"),sb.rpc("get_my_studios"),sb.rpc("get_my_firings")]);
  setShelf(a.data??[]);setRecipes(b.data??[]);setFirings(d.data??[]);
  const studioRows=c.data??[];
  const selectedStudioId=preferredStudioId||(studioRows.some((s:any)=>s.studio_id===studio)?studio:(studioRows.find((s:any)=>s.is_default)||studioRows[0])?.studio_id)||"";
  setStudios(studioRows);setStudio(selectedStudioId);
  let studioError:any=null;
  if(selectedStudioId){const e=await sb.rpc("get_studio_shelf",{p_studio_id:selectedStudioId});studioError=e.error;setStudioShelf(e.data??[])}else setStudioShelf([]);
  const error=a.error||b.error||c.error||d.error||studioError;if(error)setMsg(error.message)
 }
 async function auth(signup=false){const r=signup?await sb.auth.signUp({email,password}):await sb.auth.signInWithPassword({email,password});if(r.error)setMsg(r.error.message);else if(signup)setMsg("Account created. Check email if required.")}
 async function forgotPassword(){if(!email.trim())return setMsg("Enter your email address first.");const r=await sb.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin});setMsg(r.error?r.error.message:"Check your email for a password reset link.")}
 async function saveNewPassword(){if(newPassword.length<8)return setMsg("Your new password must be at least 8 characters.");if(newPassword!==confirmPassword)return setMsg("The two passwords do not match.");const r=await sb.auth.updateUser({password:newPassword});if(r.error)setMsg(r.error.message);else{setNewPassword("");setConfirmPassword("");setRecovery(false);window.history.replaceState({},document.title,window.location.pathname);setMsg("Password updated ✓")}}
 async function search(){setSearching(true);setSearchStarted(true);const r=kind==="glaze"?await sb.rpc("find_glazes",{p_query:q.trim()||null,p_cone:finderCone?Number(finderCone):null,p_color_family:colorSearch||null,p_effect:effectSearch.trim()||null,p_user_id:session.user.id,p_studio_id:studio||null,p_access:searchScope,p_limit:60}):await sb.rpc("search_clays",{p_query:q.trim()||null,p_cone:null,p_limit:40});setSearching(false);if(r.error)setMsg(r.error.message);else{setMsg("");setResults(r.data??[])}}
 function openFinder(scope="all",fromBuilder=false){setKind("glaze");setQ("");setEffectSearch("");setColorSearch("");setSearchScope(scope);setFinderCone(fromBuilder?String(cone):"");setResults([]);setSearchStarted(false);setTab("find")}
 async function createStudio(){const r=await sb.rpc("create_my_studio",{p_name:studioName,p_location_label:null,p_visibility:"private"});if(r.error)setMsg(r.error.message);else{setStudioName("");setMsg("Studio created ✓");await load(r.data)}}
 async function joinStudio(){const r=await sb.rpc("join_studio_by_code",{p_code:join});if(r.error)setMsg(r.error.message);else{setJoin("");setMsg("Studio joined ✓");await load(r.data)}}
 async function openStudio(id:string){setStudio(id);setTab("studio");const r=await sb.rpc("get_studio_shelf",{p_studio_id:id});if(r.error)setMsg(r.error.message);else setStudioShelf(r.data??[])}
 async function invite(id:string){const r=await sb.rpc("regenerate_studio_join_code",{p_studio_id:id});setMsg(r.error?r.error.message:"Invite code: "+r.data)}
 async function studioAdd(x:any){if(!studio)return setMsg("Open a studio first.");const r=kind==="glaze"?await sb.rpc("set_studio_glaze",{p_studio_id:studio,p_glaze_id:x.glaze_id,p_status:"available",p_notes:null}):await sb.rpc("set_studio_clay",{p_studio_id:studio,p_clay_id:x.clay_id,p_status:"available",p_notes:null});if(r.error)setMsg(r.error.message);else{setMsg("Added to Studio Shelf ✓");await openStudio(studio)}}
 async function mine(x:any){const r=kind==="glaze"?await sb.rpc("set_my_glaze",{p_glaze_id:x.glaze_id,p_status:"owned",p_quantity:null,p_notes:null}):await sb.rpc("set_my_clay",{p_clay_id:x.clay_id,p_status:"owned",p_notes:null});if(r.error)setMsg(r.error.message);else load()}
 function addShelfGlazeToBuild(x:any){const glazeName=x.item_name||x.glaze_name||x.name,manufacturer=typeof x.manufacturer==="string"?x.manufacturer:x.manufacturer?.name;setLayers([...layers,{glaze_id:x.item_id||x.glaze_id||x.id,glaze_name:glazeName,manufacturer,coats:2,surface:"inside & outside",placement:"overall",placementMode:"preset"}]);setAnalysis(null);setGlazeDetail(null);setMsg(`${glazeName} added to your build ✓`);setTab("build")}
 async function openGlazeDetail(x:any){const glazeId=x.item_id||x.glaze_id||x.id,glazeName=x.item_name||x.glaze_name||x.name,manufacturer=typeof x.manufacturer==="string"?x.manufacturer:x.manufacturer?.name;setGlazeDetail({id:glazeId,name:glazeName,manufacturer:{name:manufacturer}});setGlazeDetailLoading(true);const r=await sb.from("glazes").select("id,name,sku,cone_min,cone_max,finish,opacity,movement_score,food_contact_note,notes,manufacturer:manufacturers(name),glaze_line:glaze_lines(name,cone_min,cone_max),intelligence:glaze_intelligence(manufacturer_movement,our_type,behavior_score,color_family,breaks_over_texture,pools,waterfall_potential,layer_reactivity,run_risk,layer_role,cone_text,dinnerware_safe,manufacturer_description,best_pairings,studio_notes,confidence,last_verified,food_safe_chemistry_claim,food_contact_surface_recommended,food_contact_restriction_reason)").eq("id",glazeId).single();setGlazeDetailLoading(false);if(r.error){setGlazeDetail(null);setMsg(r.error.message)}else setGlazeDetail(r.data)}
 function coneRange(min:any,max:any){if(min==null&&max==null)return "Not yet recorded";if(min!=null&&max!=null&&String(min)!==String(max))return `Cone ${min}–${max}`;return `Cone ${min??max}`}
 async function analyze(){const r=await sb.rpc("analyze_glaze_stack_v2",{p_glaze_ids:layers.map(x=>x.glaze_id),p_clay_id:clay?.clay_id??null,p_cone:cone,p_orientation:"vertical",p_texture:"carved",p_goal:goal||null,p_coats:layers.map(x=>x.coats)});if(r.error)setMsg(r.error.message);else setAnalysis(r.data?.[0])}
 async function saveRecipe(){const name=recipeName.trim()||layers.map(x=>x.glaze_name).join(" + ")||"Saved Combination";const r=await sb.rpc("save_recipe_from_stack",{p_name:name,p_clay_id:clay?.clay_id??null,p_cone:cone,p_form:projectDescription.trim()||"vertical",p_texture:"carved",p_goal:goal||null,p_glaze_ids:layers.map(x=>x.glaze_id),p_coats:layers.map(x=>x.coats),p_placements:layers.map(encodeApplication)});if(r.error)setMsg(r.error.message);else{setRecipeName("");setMsg("Recipe saved ✓");await load();setShelfView("recipes");setTab("shelf")}}
 async function deleteRecipe(id:string,name:string){if(!window.confirm(`Delete “${name}”?\n\nThis permanently removes the recipe and any firing logs connected to it.`))return;const r=await sb.from("recipes").delete().eq("id",id);if(r.error)setMsg(r.error.message);else{if(recipe===id)setRecipe("");setRecipeDetail([]);setMsg("Recipe deleted ✓");await load()}}
 async function openRecipe(id:string){const r=await sb.rpc("get_recipe_detail",{p_recipe_id:id});if(r.error)setMsg(r.error.message);else setRecipeDetail(r.data??[])}
 function editRecipe(){if(!recipeDetail.length)return;const first=recipeDetail[0];setClay(first.clay_id?{clay_id:first.clay_id,clay_name:first.clay_name}:null);setCone(Number(first.cone)||6);setProjectDescription(first.form&&first.form!=="vertical"?first.form:"");setGoal(first.goal||"");setRecipeName(first.recipe_name||"");setLayers(recipeDetail.map(x=>{const application=decodeApplication(x.placement);return{glaze_id:x.glaze_id,glaze_name:x.glaze_name,manufacturer:x.manufacturer,coats:Number(x.coats)||2,...application,placementMode:placementOptions.includes(application.placement)?"preset":"custom"}}));setAnalysis(null);setRecipeDetail([]);setTab("build")}
 function startFiring(id:string,recipeCone:any){setRecipe(id);if(recipeCone)setCone(Number(recipeCone));setRecipeDetail([]);setTab("journal")}
 async function fire(){if(!recipe)return setMsg("Choose a recipe.");const r=await sb.rpc("log_firing",{p_recipe_id:recipe,p_fired_at:new Date().toISOString(),p_cone:cone,p_schedule:null,p_orientation:"vertical",p_movement_result:movement||null,p_travel_mm:null,p_color_result:null,p_surface_result:null,p_defects:null,p_rating:rating});if(r.error)return setMsg(r.error.message);if(photo){const path=`${session.user.id}/${r.data}/${Date.now()}-${photo.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;const up=await sb.storage.from("firing-photos").upload(path,photo);if(up.error)return setMsg(up.error.message);await sb.rpc("attach_firing_photo",{p_firing_id:r.data,p_storage_path:path,p_photo_type:"after"})}setMsg("Firing saved ✓");load()}
 async function view(id:string){const r=await sb.rpc("get_firing_photos",{p_firing_id:id});if(!r.data?.length)return setMsg("No photo.");const s=await sb.storage.from("firing-photos").createSignedUrl(r.data[0].storage_path,3600);if(s.data)setPreview(s.data.signedUrl)}
 const combinedMaterials=useMemo(()=>{
  const items=new Map<string,any>();
  shelf.forEach(x=>items.set(`${x.item_type}:${x.item_id}`,{...x,onMyShelf:true,onStudioShelf:false}));
  studioShelf.forEach(x=>{const key=`${x.item_type}:${x.item_id}`,existing=items.get(key);items.set(key,{...(existing||{}),...x,onMyShelf:!!existing,onStudioShelf:true})});
  return [...items.values()].sort((a,b)=>String(a.item_name).localeCompare(String(b.item_name)));
 },[shelf,studioShelf]);
 const currentStudio=studios.find(s=>s.studio_id===studio)||studios.find(s=>s.is_default)||studios[0];
 const detailIntel=glazeDetail?(Array.isArray(glazeDetail.intelligence)?glazeDetail.intelligence[0]:glazeDetail.intelligence):null;
 const detailLine=glazeDetail?(Array.isArray(glazeDetail.glaze_line)?glazeDetail.glaze_line[0]:glazeDetail.glaze_line):null;
 const detailManufacturer=glazeDetail?(Array.isArray(glazeDetail.manufacturer)?glazeDetail.manufacturer[0]?.name:glazeDetail.manufacturer?.name):"";
 const detailCone=glazeDetail?(detailIntel?.cone_text||coneRange(glazeDetail.cone_min??detailLine?.cone_min,glazeDetail.cone_max??detailLine?.cone_max)):"";
 const detailFoodChemistry=detailIntel?.food_safe_chemistry_claim||"Not yet verified";
 const detailFoodContact=detailIntel?.food_contact_surface_recommended||detailIntel?.dinnerware_safe||glazeDetail?.food_contact_note||"Not yet verified";
 const detailFoodClass=String(detailFoodContact).toLowerCase().includes("not yet")?"unknown":String(detailFoodContact).toLowerCase()==="yes"?"safe":"caution";
 const myGlazeCount=shelf.filter(x=>x.item_type==="glaze").length;
 if(recovery)return <main className="shell"><div className="auth recovery-auth"><img className="auth-logo" src={tealLogo.src} alt="The Glaze Shelf"/><h1>Create a New Password</h1><p>Choose a password with at least 8 characters.</p><div className="stack"><input className="input" type="password" autoComplete="new-password" placeholder="New password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/><input className="input" type="password" autoComplete="new-password" placeholder="Confirm new password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/><button className="btn primary" onClick={saveNewPassword}>Save New Password</button><button className="btn ghost" onClick={()=>{sb.auth.signOut();setRecovery(false);setMsg("")}}>Back to Sign In</button>{msg&&<div className="notice">{msg}</div>}</div></div></main>;
 if(!session)return <main className="auth-shell"><div className="auth-glow auth-glow-one"/><div className="auth-glow auth-glow-two"/><section className="auth-brand-panel"><div className="color-logo-crop auth-color-logo"><img src={logoSuite.src} alt="The Glaze Shelf"/></div><span className="auth-kicker">YOUR GLAZE WORKSPACE</span><h1>Know what you have.<br/>Discover what works.</h1><p>Organize your glazes, build combinations, and learn from every firing.</p><div className="auth-features"><span><Library size={16}/>Your shelf</span><span><Layers size={16}/>Build recipes</span><span><NotebookPen size={16}/>Track results</span></div></section><section className="auth-form-card"><span className="eyebrow">WELCOME TO THE GLAZE SHELF</span><h2>Sign in to your shelf</h2><form className="stack" onSubmit={e=>{e.preventDefault();auth()}}><label className="auth-field">Email<input className="input" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="auth-field">Password<input className="input" type="password" autoComplete="current-password" placeholder="Your password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="forgot-link" type="button" onClick={forgotPassword}>Forgot password?</button><button className="btn primary auth-signin" type="submit">Sign In <ArrowRight size={18}/></button><div className="auth-divider"><span>New to The Glaze Shelf?</span></div><button className="btn ghost auth-create" type="button" onClick={()=>auth(true)}>Create an Account</button>{msg&&<div className="notice">{msg}</div>}</form></section></main>;
 return <main className="shell"><div className="row app-header"><div className="brand"><span className="brand-icon" style={{backgroundImage:`url(${logoSuite.src})`}} aria-hidden="true"/><strong>THE GLAZE SHELF</strong></div><button className="nav" aria-label="Sign out" onClick={()=>sb.auth.signOut()}><LogOut size={18}/></button></div>
 {tab==="home"&&<><section className="home-dashboard-hero"><div className="color-logo-crop home-color-logo"><img src={logoSuite.src} alt="The Glaze Shelf"/></div><span className="home-kicker">YOUR GLAZE WORKSPACE</span><h1>Ready for your next glaze test?</h1><p>Build it. Fire it. Learn from it.</p></section><div className="quick-action-grid"><button className="quick-action build" onClick={()=>setTab("build")}><span className="quick-icon"><Layers size={21}/></span><span><strong>Build a Combination</strong><small>Layer glazes and plan your piece</small></span><ArrowRight size={18}/></button><button className="quick-action find" onClick={()=>openFinder("all")}><span className="quick-icon"><Search size={21}/></span><span><strong>Find by Effect</strong><small>Search color, movement, and finish</small></span><ArrowRight size={18}/></button><button className="quick-action shelf" onClick={()=>{setShelfView("materials");setTab("shelf")}}><span className="quick-icon"><Library size={21}/></span><span><strong>Open My Shelf</strong><small>{myGlazeCount} {myGlazeCount===1?"glaze":"glazes"} saved</small></span><ArrowRight size={18}/></button><button className="quick-action journal" onClick={()=>setTab("journal")}><span className="quick-icon"><NotebookPen size={21}/></span><span><strong>Firing Journal</strong><small>{firings.length} {firings.length===1?"firing":"firings"} recorded</small></span><ArrowRight size={18}/></button></div><div className="dashboard-stats"><div><strong>{myGlazeCount}</strong><span>My Glazes</span></div><div><strong>{recipes.length}</strong><span>Recipes</span></div><div><strong>{studios.length}</strong><span>{studios.length===1?"Studio":"Studios"}</span></div></div>
 {currentStudio?<>
  <div className="card current-studio-card">
   <span className="eyebrow">YOUR CURRENT STUDIO</span>
   <div className="row studio-heading"><div><strong className="studio-name">{currentStudio.name}</strong><div className="muted">{currentStudio.role==="owner"?"You created this studio":"You’re a member of this studio"}</div></div><span className="tag">Current</span></div>
   <div className="grid"><button className="btn primary" onClick={()=>openStudio(currentStudio.studio_id)}>Open Studio Shelf</button>{currentStudio.role==="owner"&&<button className="btn ghost" onClick={()=>invite(currentStudio.studio_id)}>Invite Someone</button>}</div>
  </div>
  {studios.length>1&&<div className="card"><strong>Your Other Studios</strong>{studios.filter(s=>s.studio_id!==currentStudio.studio_id).map(s=><button className="studio-list-item" key={s.studio_id} onClick={()=>setStudio(s.studio_id)}><span><strong>{s.name}</strong><small>{s.role==="owner"?"You created this studio":"Member"}</small></span><span>Choose →</span></button>)}</div>}
 </>:<div className="card studio-empty"><strong>No studio is connected to this signed-in account yet.</strong><p className="muted">Create one below, or join an existing studio with its invite code.</p></div>}
 <details className="card studio-tools" open={!currentStudio}><summary>{currentStudio?"Create or join another studio":"Create or Join a Studio"}</summary><div className="stack studio-form"><label className="field-label">Studio Name<input className="input" placeholder="e.g., My Studio" value={studioName} onChange={e=>setStudioName(e.target.value)}/></label><button className="btn secondary" onClick={createStudio}>Create Studio</button><div className="studio-divider"><span>or</span></div><label className="field-label">Invite Code<input className="input" placeholder="Enter invite code" value={join} onChange={e=>setJoin(e.target.value)}/></label><button className="btn ghost" onClick={joinStudio}>Join Studio</button></div></details>
 </>}

 {tab==="studio"&&<><section className="hero"><h1>{studios.find(s=>s.studio_id===studio)?.name||"Studio Shelf"}</h1><p>Everything available in this studio.</p></section>
 <div className="grid"><button className="btn primary" onClick={()=>openFinder("all")}>+ Add Glaze</button><button className="btn secondary" onClick={()=>{setKind("clay");setResults([]);setSearchStarted(false);setTab("find")}}>+ Add Clay</button></div>
 {studioShelf.length===0&&<div className="card"><strong>This studio shelf is empty.</strong><p className="muted">Add the glazes and clay bodies this studio carries. Once they’re here, the Finder can tell you what combinations are actually available in this studio.</p></div>}
 {studioShelf.map(x=><div className="item" key={x.item_type+x.item_id}><div className="row"><strong>{x.item_name}</strong><span className="tag">{x.status||"available"}</span></div><div className="muted">{x.manufacturer} • {x.item_type}</div></div>)}
 <button className="btn ghost" style={{width:"100%",marginTop:12}} onClick={()=>setTab("home")}>← Back to Home</button>
 </>}

 {tab==="shelf"&&<><section className="hero shelf-hero"><span className="eyebrow">YOUR COLLECTION</span><h1>My Shelf</h1></section><div className="segmented"><button className={shelfView==="materials"?"selected":""} onClick={()=>setShelfView("materials")}>Materials</button><button className={shelfView==="recipes"?"selected":""} onClick={()=>setShelfView("recipes")}>Recipes</button></div>{shelfView==="materials"&&<><div className="shelf-actions"><button className="btn shelf-add-button" onClick={()=>openFinder("all")}><span><Plus size={19}/> Add to My Shelf</span><ArrowRight size={18}/></button><button className="btn shelf-effect-button" onClick={()=>openFinder("mine")}><Search size={18}/> Search My Shelf by Effect</button></div><p className="shelf-tip">Tap a glaze to see safety, firing, and behavior details.</p>{combinedMaterials.length===0&&<div className="card shelf-empty"><strong>Your shelf is ready.</strong><p className="muted">Add your first glaze or clay body above.</p></div>}{combinedMaterials.map(x=>x.item_type==="glaze"?<button type="button" className="item material-card material-card-button" key={x.item_type+x.item_id} onClick={()=>openGlazeDetail(x)}><div className="row material-card-heading"><div><strong>{x.item_name}</strong><div className="muted">{x.manufacturer} • glaze</div></div><span className="build-cue">View Details <ArrowRight size={16}/></span></div><div className="shelf-locations">{x.onMyShelf&&<span className="location-badge personal">My Shelf</span>}{x.onStudioShelf&&<span className="location-badge studio">Studio Shelf</span>}</div></button>:<div className="item material-card clay-material-card" key={x.item_type+x.item_id}><strong>{x.item_name}</strong><div className="muted">{x.manufacturer} • {x.item_type}</div><div className="shelf-locations">{x.onMyShelf&&<span className="location-badge personal">My Shelf</span>}{x.onStudioShelf&&<span className="location-badge studio">Studio Shelf</span>}</div></div>)}</>}{shelfView==="recipes"&&<>{recipes.length===0&&<div className="card"><strong>No saved recipes yet.</strong><p className="muted">Build and analyze a combination, then save it here.</p></div>}{recipes.map(r=><div className="item recipe-card" key={r.recipe_id}><div className="row"><div><strong>{r.name}</strong><div className="muted">{r.clay_name||"No clay selected"} • Cone {r.cone}</div></div><span className="tag">{r.layer_count} {Number(r.layer_count)===1?"layer":"layers"}</span></div>{r.goal&&<p>{r.goal}</p>}<div className="grid"><button className="btn secondary" onClick={()=>openRecipe(r.recipe_id)}>View Recipe</button><button className="btn primary" onClick={()=>startFiring(r.recipe_id,r.cone)}>Start Firing Log</button></div><button className="btn delete-btn" onClick={()=>deleteRecipe(r.recipe_id,r.name)}>Delete Recipe</button></div>)}</>}</>}
 {tab==="find"&&<><section className="hero finder-hero"><span className="eyebrow">GLAZE DISCOVERY</span><h1>{kind==="glaze"?"Find Glazes":"Find Clay"}</h1>{kind==="glaze"&&<p>Search by effect, color, name, brand, or firing cone.</p>}</section><div className="grid"><button className={"btn "+(kind==="glaze"?"primary":"ghost")} onClick={()=>{setKind("glaze");setResults([]);setSearchStarted(false)}}>Glazes</button><button className={"btn "+(kind==="clay"?"primary":"ghost")} onClick={()=>{setKind("clay");setResults([]);setSearchStarted(false)}}>Clay</button></div>{kind==="glaze"?<form className="finder-form" onSubmit={e=>{e.preventDefault();search()}}><div className="finder-card"><span className="filter-label">WHERE TO SEARCH</span><div className="scope-tabs"><button type="button" className={searchScope==="all"?"selected":""} onClick={()=>setSearchScope("all")}>All Glazes</button><button type="button" className={searchScope==="mine"?"selected":""} onClick={()=>setSearchScope("mine")}>My Shelf</button><button type="button" disabled={!studio} className={searchScope==="studio"?"selected":""} onClick={()=>setSearchScope("studio")}>Studio Shelf</button></div></div><div className="finder-card effect-card"><label className="field-label">Desired Effect<input className="input" placeholder="e.g., waterfall, drippy, pools" enterKeyHint="search" value={effectSearch} onChange={e=>setEffectSearch(e.target.value)}/></label><div className="effect-chips">{effectOptions.map(effect=><button type="button" key={effect} className={"filter-chip "+(effectSearch.toLowerCase()===effect.toLowerCase()?"selected":"")} onClick={()=>setEffectSearch(effectSearch.toLowerCase()===effect.toLowerCase()?"":effect)}>{effect}</button>)}</div><div className="filter-grid"><label className="field-label">Color<select className="select" value={colorSearch} onChange={e=>setColorSearch(e.target.value)}><option value="">Any color</option>{colorOptions.map(color=><option key={color} value={color}>{color}</option>)}</select></label><label className="field-label">Firing Cone<select className="select" value={finderCone} onChange={e=>setFinderCone(e.target.value)}><option value="">Any cone</option>{[5,6,7,8,9,10].map(value=><option key={value} value={value}>Cone {value}</option>)}</select></label></div><label className="field-label">Name, Brand, or Code <span className="optional-label">optional</span><input className="input" placeholder="e.g., Winter Wood or Mayco" enterKeyHint="search" value={q} onChange={e=>setQ(e.target.value)}/></label><button className="btn finder-submit" type="submit"><Search size={18}/>{searching?"Searching…":"Find Glaze Suggestions"}</button></div></form>:<form className="row search-row" onSubmit={e=>{e.preventDefault();search()}}><input className="input" aria-label="Search clay" placeholder="Search clay bodies" enterKeyHint="search" value={q} onChange={e=>setQ(e.target.value)}/><button className="btn primary search-action" type="submit" aria-label="Search"><Search size={17}/></button></form>}{searchStarted&&<div className="results-heading"><strong>{results.length} {results.length===1?"match":"matches"}</strong><span>{kind==="glaze"?(searchScope==="mine"?"on My Shelf":searchScope==="studio"?"on Studio Shelf":"in All Glazes"):"for clay"}</span></div>}{searchStarted&&!searching&&results.length===0&&<div className="card finder-empty"><strong>No exact matches yet.</strong><p className="muted">Try a broader effect such as “fluid,” remove the color, or search All Glazes.</p></div>}{results.map(x=><div className="item finder-result" key={x.glaze_id||x.clay_id}><div className="row result-title"><div><strong>{x.glaze_name||x.clay_name}</strong><div className="muted">{x.manufacturer}{x.sku?` • ${x.sku}`:""}</div></div>{x.access_state&&<span className="location-badge search-access">{x.access_state==="Mine"?"My Shelf":x.access_state==="Studio"?"Studio Shelf":x.access_state==="Mine + Studio"?"My + Studio":"All Glazes"}</span>}</div>{kind==="glaze"&&<><div className="result-tags">{x.color_family&&<span>{x.color_family}</span>}{x.our_type&&<span>{x.our_type}</span>}{x.finish&&<span>{x.finish}</span>}{x.run_risk>=4&&<span>Strong movement</span>}{x.run_risk!=null&&x.run_risk<=2&&<span>Stable</span>}{x.layer_reactivity>=4&&<span>Reactive layering</span>}</div><button className="detail-link" type="button" onClick={()=>openGlazeDetail(x)}>View glaze details <ArrowRight size={16}/></button></>}<div className="grid"><button className="btn clay" onClick={()=>mine(x)}>+ My Shelf</button><button className="btn secondary" disabled={!studio} onClick={()=>studioAdd(x)}>+ Studio</button></div><button className="btn ghost" style={{width:"100%",marginTop:7}} onClick={()=>kind==="glaze"?addShelfGlazeToBuild(x):(setClay(x),setAnalysis(null),setTab("build"))}>{kind==="glaze"?"Add to Build":"Use as Clay"}</button></div>)}</>}
{tab==="build"&&<>
  <section className="hero">
    <h1>Combination Builder</h1>
  </section>

  <label className="field-label project-field">Project Description
    <input
      className="input"
      placeholder="e.g., Bowl with chatter lines"
      value={projectDescription}
      onChange={e=>setProjectDescription(e.target.value)}
    />
  </label>

  <button
    className="card"
    style={{width:"100%",textAlign:"left"}}
    onClick={()=>{
      setKind("clay");
      setQ("");
      setResults([]);
      setTab("find");
    }}
  >
    <strong>Clay:</strong> {clay?.clay_name||"Select clay"}
  </button>

  {layers.map((x,i)=>
    <div className="item" key={i}>
      <div className="row">
        <div>
          <span className="muted">
            {i===0 ? "Base glaze" : `Layer ${i+1}`}
          </span>
          <br/>
          <strong>{x.glaze_name}</strong>
          <div className="muted">{x.manufacturer}</div>
          <div className="layer-controls">
            <label>Coats
              <select className="mini-select" value={x.coats} onChange={e=>{const next=[...layers];next[i]={...next[i],coats:+e.target.value};setLayers(next);setAnalysis(null)}}>
                <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option>
              </select>
            </label>
            <label>Surface
              <select className="mini-select" value={x.surface||"inside & outside"} onChange={e=>{const next=[...layers];next[i]={...next[i],surface:e.target.value};setLayers(next);setAnalysis(null)}}>
                <option value="outside">Outside</option><option value="inside">Inside</option><option value="inside & outside">Inside &amp; Outside</option>
              </select>
            </label>
            <label>Placement
              <select className="mini-select" value={usesCustomPlacement(x)?"custom":x.placement||"overall"} onChange={e=>{const next=[...layers];next[i]={...next[i],placement:e.target.value==="custom"?"":e.target.value,placementMode:e.target.value==="custom"?"custom":"preset"};setLayers(next);setAnalysis(null)}}>
                <option value="overall">Overall</option><option value="top half">Top half</option><option value="bottom half">Bottom half</option><option value="rim">Rim</option><option value="design only">Design only</option><option value="overlapping band">Overlapping band</option><option value="custom">Custom placement…</option>
              </select>
            </label>
          </div>
          {usesCustomPlacement(x)&&<label className="custom-placement">Custom Placement
            <input className="mini-select" placeholder="Describe where this glaze goes" value={x.placement||""} onChange={e=>{const next=[...layers];next[i]={...next[i],placement:e.target.value,placementMode:"custom"};setLayers(next);setAnalysis(null)}}/>
          </label>}
        </div>

        <button
          className="nav"
          onClick={()=>setLayers(layers.filter((_,j)=>j!==i))}
        >
          Remove
        </button>
      </div>
    </div>
  )}

  <div className="builder-finder-card">
    <div>
      <span className="eyebrow">NEED INSPIRATION?</span>
      <strong>Find a glaze by effect or color</strong>
      <p>Try waterfall, drippy, pooling, stable, turquoise, and more.</p>
    </div>
    <button className="btn builder-finder-button" onClick={()=>openFinder("all",true)}><Search size={18}/> Find Suggestions</button>
  </div>

  <button
    className="btn secondary"
    style={{width:"100%",marginBottom:8}}
    onClick={()=>openFinder("all",true)}
  >
    {layers.length===0 ? "+ Select Base Glaze" : "+ Add Another Glaze"}
  </button>

  <label className="field-label">Firing Cone
    <select
      className="select"
      value={cone}
      onChange={e=>setCone(+e.target.value)}
    >
      <option value="5">Cone 5</option>
      <option value="6">Cone 6</option>
      <option value="7">Cone 7</option>
      <option value="8">Cone 8</option>
      <option value="9">Cone 9</option>
      <option value="10">Cone 10</option>
    </select>
  </label>

  <textarea
    className="textarea"
    placeholder="Desired effect"
    value={goal}
    onChange={e=>setGoal(e.target.value)}
    style={{marginTop:8}}
  />

  <button
    className="btn primary"
    style={{width:"100%",marginTop:8}}
    onClick={()=>{
      if(layers.length===0){
        setMsg("Add at least one glaze before analyzing.");
        return;
      }
      analyze();
    }}
  >
    Analyze Combination
  </button>

  {analysis&&
    <div className="card result">
      <strong>{analysis.verdict}</strong>
      <p>{analysis.compatibility}</p>
      <p>{analysis.clay_influence}</p>
      <p>{analysis.rationale}</p>
      <input className="input" placeholder="Name this recipe" value={recipeName} onChange={e=>setRecipeName(e.target.value)}/>
      <button className="btn secondary" onClick={saveRecipe}>
        Save Recipe
      </button>
    </div>
  }
</>}
 {tab==="journal"&&<><section className="hero"><h1>Firing Journal</h1></section><div className="card stack journal-card"><label className="field-label">Recipe<select className="select" value={recipe} onChange={e=>{setRecipe(e.target.value);const chosen=recipes.find(r=>r.recipe_id===e.target.value);if(chosen?.cone)setCone(Number(chosen.cone))}}><option value="">Choose recipe…</option>{recipes.map(r=><option key={r.recipe_id} value={r.recipe_id}>{r.name}</option>)}</select></label>{recipe&&<div className="firing-cone"><span>Firing Cone</span><strong>Cone {cone}</strong></div>}<label className="field-label">Movement After Firing<input className="input" placeholder="Describe running, pooling, or movement" value={movement} onChange={e=>setMovement(e.target.value)}/></label><label className="field-label">Result Rating<select className="select" value={rating} onChange={e=>setRating(+e.target.value)}><option value="5">★★★★★ Excellent</option><option value="4">★★★★ Very good</option><option value="3">★★★ Good</option><option value="2">★★ Needs work</option><option value="1">★ Poor result</option></select></label><label className="field-label file-field">Add Result Photo<input className="input" type="file" accept="image/*" onChange={e=>setPhoto(e.target.files?.[0]??null)}/></label><button className="btn primary" onClick={fire}>Save Firing</button></div>{firings.map(f=><div className="item" key={f.firing_id}><div className="row"><strong>{f.recipe_name}</strong><span className="tag">E{f.evidence_tier}</span></div>{f.photo_count>0&&<button className="btn ghost" onClick={()=>view(f.firing_id)}>View Photo</button>}</div>)}{preview&&<img className="photo" src={preview} alt="Firing result"/>}</>}
 {glazeDetail&&<div className="overlay" onClick={()=>setGlazeDetail(null)}><div className="glaze-detail-sheet" role="dialog" aria-modal="true" aria-label={`${glazeDetail.name} glaze details`} onClick={e=>e.stopPropagation()}><div className="row detail-heading"><div><span className="eyebrow">GLAZE DETAILS</span><h2>{glazeDetail.name}</h2><p>{detailManufacturer}{glazeDetail.sku?` • ${glazeDetail.sku}`:""}</p></div><button className="close" aria-label="Close glaze details" onClick={()=>setGlazeDetail(null)}>×</button></div>{glazeDetailLoading?<div className="detail-loading">Loading glaze details…</div>:<><div className="detail-chips"><span>{detailCone}</span><span>{detailIntel?.our_type||"Type needs review"}</span>{detailIntel?.color_family&&<span>{detailIntel.color_family}</span>}</div><section className={`food-safety-card ${detailFoodClass}`}><div className="food-safety-title"><ShieldCheck size={23}/><div><span className="eyebrow">FOOD &amp; DINNERWARE</span><strong>{detailFoodContact}</strong></div></div><div className="detail-row"><span>Food-safe chemistry</span><strong>{detailFoodChemistry}</strong></div><div className="detail-row"><span>Food-contact surface</span><strong>{detailFoodContact}</strong></div>{detailIntel?.food_contact_restriction_reason&&<p className="restriction-note">{detailIntel.food_contact_restriction_reason}</p>}<p className="safety-note">Always follow the manufacturer’s current label. Food-contact safety also depends on correct firing and an intact, stable glaze surface.</p></section><section className="detail-section"><span className="eyebrow">APPEARANCE &amp; BEHAVIOR</span><div className="detail-grid"><div><span>Finish</span><strong>{glazeDetail.finish||"Not yet recorded"}</strong></div><div><span>Opacity</span><strong>{glazeDetail.opacity||"Not yet recorded"}</strong></div><div><span>Layer role</span><strong>{detailIntel?.layer_role||"Not yet recorded"}</strong></div><div><span>Movement risk</span><strong>{detailIntel?.run_risk!=null?`${detailIntel.run_risk}/5`:glazeDetail.movement_score!=null?`${glazeDetail.movement_score}/5`:"Not yet recorded"}</strong></div><div><span>Layer reactivity</span><strong>{detailIntel?.layer_reactivity!=null?`${detailIntel.layer_reactivity}/5`:"Not yet recorded"}</strong></div><div><span>Breaks on texture</span><strong>{detailIntel?.breaks_over_texture!=null?`${detailIntel.breaks_over_texture}/5`:"Not yet recorded"}</strong></div></div></section>{(detailIntel?.manufacturer_description||glazeDetail.notes)&&<section className="detail-copy"><span className="eyebrow">ABOUT THIS GLAZE</span><p>{detailIntel?.manufacturer_description||glazeDetail.notes}</p></section>}{detailIntel?.best_pairings&&<section className="detail-copy pairing-copy"><span className="eyebrow">PAIRING NOTES</span><p>{detailIntel.best_pairings}</p></section>}<div className="detail-verification"><span>{detailIntel?.confidence||"Details awaiting review"}</span>{detailIntel?.last_verified&&<span>Verified {detailIntel.last_verified}</span>}</div><div className="stack detail-actions"><button className="btn primary" onClick={()=>addShelfGlazeToBuild(glazeDetail)}>Add to Build</button><button className="btn ghost" onClick={()=>setGlazeDetail(null)}>Back to My Shelf</button></div></>}</div></div>}
 {recipeDetail.length>0&&<div className="overlay" onClick={()=>setRecipeDetail([])}><div className="recipe-sheet" onClick={e=>e.stopPropagation()}><div className="row"><div><span className="eyebrow">SAVED RECIPE</span><h2>{recipeDetail[0].recipe_name}</h2></div><button className="close" aria-label="Close recipe" onClick={()=>setRecipeDetail([])}>×</button></div><div className="recipe-meta"><span>{recipeDetail[0].clay_name||"No clay selected"}</span><span>Cone {recipeDetail[0].cone}</span><span>{recipeDetail[0].texture||"No texture"}</span></div>{recipeDetail[0].form&&recipeDetail[0].form!=="vertical"&&<div className="project-summary"><span className="eyebrow">PROJECT</span><p>{recipeDetail[0].form}</p></div>}{recipeDetail[0].goal&&<div className="goal"><span className="eyebrow">DESIRED EFFECT</span><p>{recipeDetail[0].goal}</p></div>}<div className="recipe-layers">{recipeDetail.map((x,i)=>{const application=decodeApplication(x.placement);return <div className="recipe-layer" key={x.glaze_id+i}><span className="layer-number">{i+1}</span><div><span className="muted">{i===0?"Base glaze":`Layer ${i+1}`}</span><strong>{x.glaze_name}</strong><span className="muted">{x.manufacturer}</span></div><div className="layer-detail"><strong>{x.coats||"—"}</strong><span className="muted">coats</span><span>{titleCase(application.surface)}</span><span className="muted">{titleCase(application.placement)}</span></div></div>})}</div><div className="stack"><button className="btn primary" onClick={()=>startFiring(recipeDetail[0].recipe_id,recipeDetail[0].cone)}>Start Firing Log</button><button className="btn ghost" onClick={editRecipe}>Edit Recipe in Builder</button><button className="btn delete-btn" onClick={()=>deleteRecipe(recipeDetail[0].recipe_id,recipeDetail[0].recipe_name)}>Delete Recipe</button></div></div></div>}
 {msg&&<div className="notice">{msg}</div>}<nav className="bottom">{[["home",Home,"Home"],["shelf",Library,"Shelf"],["find",Search,"Find"],["build",Layers,"Build"],["journal",NotebookPen,"Journal"]].map(([t,I,l]:any)=><button key={t} className={"nav "+((tab===t||(tab==="studio"&&t==="shelf"))?"active":"")} onClick={()=>setTab(t)}><I size={19}/><br/>{l}</button>)}</nav></main>
}
