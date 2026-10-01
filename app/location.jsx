'use client';
import {useRef,useState,useEffect} from 'react';
export default function Location(){
 const [pin,setPin]=useState(''),[location,setLocation]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const active=useRef(null);
 useEffect(()=>()=>active.current?.abort(),[]);
 async function lookup(e){
  e.preventDefault();active.current?.abort();const controller=new AbortController();active.current=controller;
  setBusy(true);setError('');setLocation(null);
  try{const r=await fetch('/api/location?'+new URLSearchParams({pincode:pin}),{signal:controller.signal});const data=await r.json();if(!r.ok)throw new Error(data.error);setLocation(data)}
  catch(e){if(e.name!=='AbortError')setError(e.message)}finally{if(!controller.signal.aborted)setBusy(false)}
 }
 return <section className="location-box" aria-label="Pincode location lookup"><h2>Delivery location</h2><form onSubmit={lookup}><label htmlFor="delivery-pin">Indian pincode</label><div className="pin-row"><input id="delivery-pin" inputMode="numeric" autoComplete="postal-code" pattern="[1-9][0-9]{5}" maxLength={6} required value={pin} placeholder="6-digit pincode" onChange={e=>{active.current?.abort();setBusy(false);setPin(e.target.value.replace(/\D/g,''));setLocation(null);setError('')}}/><button disabled={busy} type="submit">{busy?'Looking up…':'Find area'}</button></div></form><p className="pin-help">Looks up your area using Postal Pincode API.</p><div aria-live="polite">{error&&<p className="pin-error" role="alert">{error}</p>}{location&&<><strong>{location.district}, {location.state} · {location.pincode}</strong><p>{location.areas.join(' · ')}</p></>}</div><p className="pin-help">Amazon delivery availability is not checked for this pincode. Open a product on Amazon and set its delivery location to confirm stock.</p></section>;
}
