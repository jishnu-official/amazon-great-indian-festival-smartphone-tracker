import {buildAmazonUrl,defaults,groups,validPriceRange} from '../../../lib/filters.js';
import {parseSearch,parseDetails,matches} from '../../../lib/amazon.js';
export const dynamic='force-dynamic';
async function read(url){const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(12000)});if(!response.ok)throw new Error('Amazon returned HTTP '+response.status+'. Live listings are unavailable; please open the festival collection on Amazon.');return response.text();}
export async function GET(request){
 const q=new URL(request.url).searchParams,page=Number(q.get('page')||1);let filters=defaults;
 try{if(q.has('filters'))filters=JSON.parse(q.get('filters'));if(!Number.isInteger(page)||page<1||page>1000||!filters||!validPriceRange(filters)||groups.some(g=>!Array.isArray(filters[g.key])||filters[g.key].some(v=>!g.values.includes(v))))throw new Error();}catch{return Response.json({error:'Invalid filters or page.'},{status:400});}
 const sourceUrl=buildAmazonUrl(filters,page);
 try{
  const result=parseSearch(await read(sourceUrl));const products=[];let unreadable=0;
  for(let offset=0;offset<result.products.length;offset+=3){
   const batch=await Promise.all(result.products.slice(offset,offset+3).map(async product=>{
    if(product.price!==null&&(product.price<filters.priceMin||product.price>filters.priceMax))return null;
    try{const detailed=parseDetails(await read(product.url),product);return matches(detailed,filters)?detailed:null;}catch{unreadable++;return null;}
   }));products.push(...batch.filter(Boolean));
  }
  if(unreadable)throw new Error(unreadable+' product detail pages could not be verified. Please retry; incomplete results are not presented as complete.');
  return Response.json({products:products.sort((a,b)=>a.price-b.price),page,totalPages:result.hasNext?page+1:page,hasNext:result.hasNext,sourceUrl,checkedAt:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return Response.json({error:error.message,sourceUrl},{status:502,headers:{'Cache-Control':'no-store'}});}
}