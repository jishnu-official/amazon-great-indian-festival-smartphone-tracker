import {load} from 'cheerio';
export const festivalUrl='https://www.amazon.in/events/greatindianfestival/';
export const collectionId='221992814031';
export function parseSearch(html){
 const $=load(html);$('script,style').remove();
 const products=[];const seen=new Set();
 $('[data-component-type="s-search-result"][data-asin]').each((_,node)=>{
  const card=$(node),id=card.attr('data-asin'),name=card.find('h2').first().text().trim();
  if(!/^[A-Z0-9]{10}$/.test(id||'')||!name||seen.has(id))return;
  if(card.find('[data-component-type="sp-sponsored-result"],.puis-sponsored-label-text').length||/Sponsored/.test(card.text()))return;
  const priceText=card.find('.a-price:not(.a-text-price) .a-offscreen').first().text();
  const price=priceText?Number(priceText.replace(/[^\d.]/g,'')):null;
  const image=card.find('img.s-image').attr('src');
  products.push({id,name,price:Number.isFinite(price)&&price>0?price:null,image:/^https:\/\/[^/]*media-amazon\.com\//.test(image||'')?image:null,url:`https://www.amazon.in/dp/${id}`,status:/currently unavailable/i.test(card.text())?'Currently unavailable':'Check availability',specs:[]});seen.add(id);
 });
 const text=$('body').text();
 if(!products.length&&!/No results for|did not match any products/i.test(text))throw new Error('Amazon did not return readable results. Automated requests may be blocked.');
 const next=$('a.s-pagination-next').attr('href');
 return {products,hasNext:!!next};
}
export function parseDetails(html,product){
 const $=load(html);$('script,style').remove();
 const title=$('#productTitle').text().trim();
 if(!title)throw new Error('Product specifications could not be read.');
 const fields={};$('tr').each((_,row)=>{const key=$(row).find('th').text().trim().toLowerCase();const value=$(row).find('td').text().replace(/\s+/g,' ').trim();if(key&&value)fields[key]=value;});
 const field=(pattern)=>Object.entries(fields).filter(([k])=>pattern.test(k)).map(([,v])=>v).join(' ');
 const titlePair=title.match(/(\d+)\s*GB\s*\+\s*(\d+)\s*GB/i);
 const ram=Number(field(/ram|memory installed/).match(/(\d+)\s*GB/i)?.[1]||title.match(/(\d+)\s*GB\s*RAM/i)?.[1]||titlePair?.[1])||null;
 const storage=Number(field(/storage capacity|memory storage/).match(/(\d+)\s*GB/i)?.[1]||title.match(/(\d+)\s*GB\s*(?:Storage|ROM)/i)?.[1]||titlePair?.[2])||null;
 const battery=Number((field(/battery capacity/)).match(/([\d,]+)\s*(?:mAh|milliamp)/i)?.[1]?.replace(/,/g,'')||title.match(/(\d+)\s*mAh/i)?.[1])||null;
 const cameraText=field(/rear.*camera.*resolution|camera.*rear|primary.*camera/);
 const camera=Number(cameraText.match(/(\d+(?:\.\d+)?)\s*(?:MP|megapixel)/i)?.[1]||title.match(/(\d+)\s*MP\s*(?:AI\s*)?(?:Dual\s*)?(?:Rear\s*)?(?:OIS\s*)?Camera/i)?.[1])||null;
 const networkText=field(/cellular technology|network service/);const network=/5\.5G/i.test(networkText+' '+title)?'5.5G':/\b5G\b/i.test(networkText+' '+title)?'5G':null;
 const simText=field(/sim.*(type|slot|size|card)|sim$/);
 const sim=/dual/i.test(simText)&&!/eSIM/i.test(simText)?'Dual Sim':/dual/i.test(simText)&&/eSIM/i.test(simText)?(/nano/i.test(simText)?'Dual Sim(Nano + eSIM)':'Dual Sim(Physical + eSIM)'):null;
 const brand=field(/^brand$/)||title.split(' ')[0];
 const statusText=$('#availability').text();
 const status=/currently unavailable/i.test(statusText)?'Currently unavailable':/out of stock/i.test(statusText)?'Out of stock':/in stock/i.test(statusText)?'In stock (location not verified)':'Check availability';
 const smartphone=/smartphones/i.test($('#wayfinding-breadcrumbs_feature_div').text())||/smartphone/i.test(field(/form factor|phone type/));
 return {...product,name:title,status,attributes:{brand,ram,storage,battery,camera,network,sim,smartphone},specs:[ram&&`${ram} GB RAM`,storage&&`${storage} GB storage`,battery&&`${battery} mAh Battery`,camera&&`${camera} MP Camera`,network,sim].filter(Boolean)};
}
export function matches(product,filters){
 const a=product.attributes;if(!a||!a.smartphone||product.price===null||product.price<filters.priceMin||product.price>filters.priceMax)return false;
 const normalized=value=>value.toLowerCase().replace(/[^a-z0-9]/g,'');
 const brand=normalized(a.brand);const brands=filters.brand.map(normalized);
 if(brands.length&&!brands.some(b=>b===brand||(b==='mi'&&brand==='xiaomi')||(b==='cmfbynothing'&&brand==='cmf')))return false;
 const range=(key,value,low,threshold)=>!filters[key].length||(value!==null&&filters[key].some(v=>v===low?value>=({ram:6,internal_storage:128,primary_camera:48,battery_capacity:5000}[key])&&value<threshold:value>=threshold));
 return range('ram',a.ram,'6 GB',8)&&range('internal_storage',a.storage,'128 - 255.9 GB',256)&&range('primary_camera',a.camera,'48 - 63.9 MP',64)&&range('battery_capacity',a.battery,'5000 - 5999 mAh',6000)&&(!filters.network_type.length||filters.network_type.includes(a.network))&&(!filters.sim_type.length||filters.sim_type.includes(a.sim));
}
