export const dynamic='force-dynamic';
export async function GET(request) {
 const pincode=new URL(request.url).searchParams.get('pincode')||'';
 if(!/^[1-9]\d{5}$/.test(pincode))return Response.json({error:'Enter a valid six-digit Indian pincode.'},{status:400});
 try{
  const r=await fetch(`https://api.postalpincode.in/pincode/${pincode}`,{signal:AbortSignal.timeout(12000),cache:'no-store'});
  if(!r.ok)throw new Error();
  const result=(await r.json())?.[0];
  if(result?.Status!=='Success'||!Array.isArray(result.PostOffice))return Response.json({error:'No location found for this pincode.'},{status:404});
  const offices=result.PostOffice.filter(p=>p.Pincode===pincode&&p.Country==='India');
  if(!offices.length)throw new Error();
  return Response.json({pincode,district:offices[0].District,state:offices[0].State,areas:[...new Set(offices.map(p=>p.Name.trim()))],availabilityVerified:false},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Could not fetch the location. Please try again.'},{status:502});}
}
