import { useEffect, useState } from 'react';
export async function api(path,options={}) {
 let response;
 try { response=await fetch(`/api${path}`,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...options.headers}}); }
 catch {throw new Error('Unable to reach CLAW. Please try again.');}
 if(response.status===204)return null;
 const isJson=response.headers.get('content-type')?.includes('application/json');
 if(!isJson)throw new Error('The CLAW API is unavailable. Please restart the frontend server and check that the backend is running.');
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.error||'Unable to complete this request. Please try again.');
 return data;
}
export function useApi(path) {
 const [state,setState]=useState({data:null,error:'',loading:true});
 const [retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;setState({path,data:null,error:'',loading:true});
 api(path).then(data=>{if(active)setState({path,data,error:'',loading:false});}).catch(error=>{if(active)setState({path,data:null,error:error.message,loading:false});});
 return ()=>{active=false;};},[path,retry]);
 return {...(state.path===path ? state : {data:null,error:'',loading:true}),retry:()=>setRetry(value=>value+1)};
}
export function ageGroup(months) {
 return months<12?'Puppy (0–1 years old)':months<36?'Young (1–3 years old)':months<=84?'Adult (3–7 years old)':'Adult (7+ years old)';
}
