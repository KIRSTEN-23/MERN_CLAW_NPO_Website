import { useEffect, useState } from 'react';
import { dogs } from './mock-dogs.js';
// UI preview data until the user-facing API is connected.
export async function api(path, options = {}) {
 if (path === '/auth/me') return {user: null};
 if (path.startsWith('/dogs/')) {
  const dog = dogs.find(dog => dog.id === decodeURIComponent(path.slice(6)));
  if (!dog) throw new Error('Dog not found.');
  return {dog};
 }
 if (path.startsWith('/dogs')) return {dogs: path.includes('available=true') ? dogs.filter(dog => dog.available) : dogs};
 throw new Error('This preview is not connected to the backend yet.');
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
