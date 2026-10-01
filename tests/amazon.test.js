import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSearch,matches} from '../lib/amazon.js';
import {buildAmazonUrl,defaults} from '../lib/filters.js';
test('query stays inside the inspected festival collection with price in paise',()=>{const u=new URL(buildAmazonUrl());assert.equal(u.searchParams.get('bbn'),'221992814031');assert.match(u.searchParams.get('rh'),/p_36:1000000-2000000/)});
test('blocked responses are errors rather than empty products',()=>{assert.throws(()=>parseSearch('<html><body>503 Service Unavailable</body></html>'))});
test('unknown required attributes never pass the default filters',()=>{const product={price:15000,attributes:{smartphone:true,brand:'Redmi',ram:6,storage:128,camera:50,battery:6000,network:'5G',sim:'Dual Sim'}};assert.equal(matches(product,defaults),true);assert.equal(matches({...product,attributes:{...product.attributes,sim:null}},defaults),false);assert.equal(matches({...product,attributes:{...product.attributes,smartphone:false}},defaults),false);assert.equal(matches({...product,price:25000},defaults),false)});
test('ignores sponsored products',()=>{const html='<body><div data-component-type="s-search-result" data-asin="B012345678"><h2>Phone</h2><span class="puis-sponsored-label-text">Sponsored</span></div></body>';assert.throws(()=>parseSearch(html))});
