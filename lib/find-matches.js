// Inspect source pages sequentially; an empty page is not an empty catalog.
export async function findMatches(startPage, readPage, onProgress, signal) {
  let page=startPage;
  while(true){
    signal?.throwIfAborted();
    onProgress?.(page);
    const data=await readPage(page);
    signal?.throwIfAborted();
    if(!Number.isInteger(data.totalPages)||data.totalPages<1||data.totalPages>1000)throw new Error('Invalid source pagination.');
    if(data.products.length||page>=data.totalPages)return {...data,page};
    page++;
  }
}
