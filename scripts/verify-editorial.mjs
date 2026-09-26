// Pure JavaScript checks; these do not substitute for visual browser QA.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projects = JSON.parse(readFileSync(path.join(root, 'data/projects.json')));
const script = readFileSync(path.join(root, 'js/editorial.js'), 'utf8');
const mainScript = readFileSync(path.join(root, 'js/script.js'), 'utf8');
let passed = 0;
function check(name, fn) { fn(); passed++; console.log(`PASS ${name}`); }
function element(dataset = {}) {
  const classes = new Set();
  return { dataset, attrs: {}, events: {}, hidden: false, textContent: '',
    addEventListener(name, fn) { this.events[name] = fn; },
    setAttribute(k,v) { this.attrs[k]=v; }, getAttribute(k) { return this.attrs[k]; },
    classList: {add: x=>classes.add(x), remove: x=>classes.delete(x), contains: x=>classes.has(x), toggle(x,on) { on ??= !classes.has(x); on ? classes.add(x) : classes.delete(x); } },
    scrollIntoView() { this.scrolled = true; }, focus() { this.focused = true; }
  };
}
function setupArchive(search='',hash='') {
  const cards=projects.map(p=>Object.assign(element({categories:p.categories.join('|')}),{id:p.legacy_id}));
  const filters=['all',...new Set(projects.flatMap(p=>p.categories))].map(filter=>element({filter}));
  const views=['folders','index'].map(view=>element({view}));
  const archive=element(); archive.querySelectorAll=()=>cards;
  const status=element(),controls=element(),windowEvents={};
  const state={cards,filters,views,archive,status,controls,url:null,windowEvents};
  const context={URL,URLSearchParams,location:{search,hash,href:'https://example.test/work.html'+search+hash},
    history:{replaceState(_a,_b,url){state.url=url;}},
    document:{querySelector(s){return {'#project-archive':archive,'.ed-results':status,'[data-archive-controls]':controls}[s];},querySelectorAll(s){return {'[data-filter]':filters,'[data-view]':views}[s]||[];}},
    matchMedia:()=>({matches:true}),window:{addEventListener(name,fn){windowEvents[name]=fn;}}};
  vm.runInNewContext(script,context);return state;
}
check('All 10 projects are initially visible',()=>{
  const s=setupArchive(); assert.equal(s.cards.filter(x=>!x.hidden).length,10);assert.equal(s.controls.hidden,false);
});
const expected={'Corporate':1,'Fashion':2,'E-commerce':2,'Food & Beverage':3,'Travel':1,'Healthcare':1,'Furniture':1,'Beauty':1};
for(const [category,count] of Object.entries(expected)) check(`${category} filter shows ${count} matching projects`,()=>{
  const s=setupArchive(); s.filters.find(x=>x.dataset.filter===category).events.click();
  assert.equal(s.cards.filter(x=>!x.hidden).length,count);assert.equal(s.url.searchParams.get('industry'),category);
  assert.equal(s.filters.filter(x=>x.attrs['aria-pressed']==='true').length,1);
});
check('Index view preserves the selected industry',()=>{
  const s=setupArchive('?industry=Healthcare');s.views[1].events.click();
  assert.equal(s.cards.filter(x=>!x.hidden).length,1);assert(s.archive.classList.contains('is-index'));assert.equal(s.url.searchParams.get('industry'),'Healthcare');
});
check('Invalid URL filters recover to all projects',()=>assert.equal(setupArchive('?industry=Unknown&view=nope').cards.filter(x=>!x.hidden).length,10));
check('Legacy project hashes remain visible through conflicting filters',()=>{
  const s=setupArchive('?industry=Healthcare','#jovi');assert.equal(s.cards.find(x=>x.id==='jovi').hidden,false);
});
check('All resets the URL and project count',()=>{
  const s=setupArchive('?industry=Healthcare');s.filters[0].events.click();assert.equal(s.cards.filter(x=>!x.hidden).length,10);assert.equal(s.url.search,'');
});
function setupMain(values={}) {
  const toggle=element(),menu=element(),main=element(),footer=element(),header=element(),status=element(),form=element(),submit=element(),firstLink=element();
  toggle.attrs['aria-expanded']='false';menu.inert=true;menu.querySelector=()=>firstLink;menu.querySelectorAll=()=>[firstLink];
  form.querySelector=()=>submit;submit.disabled=true;
  const document={body:{style:{}},activeElement:null,getElementById(id){return {'main':main,'enquiry-form':form,'form-status':status}[id];},querySelector(s){return {'.site-header':header,'.nav__toggle':toggle,'.mobile-menu':menu,'.site-footer':footer}[s]||null;},querySelectorAll(){return [];},addEventListener(_name,fn){this.ready=fn;}};
  const media={matches:false,addEventListener(_name,fn){this.change=fn;}};const winEvents={};let opened;
  const window={scrollY:0,matchMedia:()=>media,addEventListener(name,fn){winEvents[name]=fn;},open(url){opened=url;}};
  class FormData { get(k){return values[k]||'';} }
  vm.runInNewContext(mainScript,{document,window,FormData,Date,Array,encodeURIComponent});document.ready();
  return {toggle,menu,main,footer,status,form,submit,firstLink,media,winEvents,get opened(){return opened;}};
}
check('Mobile navigation opens and closes with correct inert state',()=>{
  const s=setupMain();s.toggle.events.click();assert.equal(s.menu.inert,false);assert.equal(s.main.inert,true);assert(s.firstLink.focused);
  s.winEvents.keydown({key:'Escape'});assert.equal(s.menu.inert,true);assert.equal(s.main.inert,false);assert(s.toggle.focused);
});
check('Desktop resize releases mobile background lock',()=>{
  const s=setupMain();s.toggle.events.click();s.media.change({matches:true});assert.equal(s.main.inert,false);assert.equal(s.toggle.attrs['aria-expanded'],'false');
});
check('Empty enquiry does not open WhatsApp',()=>{
  const s=setupMain();s.form.events.submit({preventDefault(){}});assert.equal(s.opened,undefined);assert(s.status.textContent.includes('Please fill'));
});
check('Enquiry prepares an encoded WhatsApp draft with the correct number',()=>{
  const s=setupMain({name:'QA Example',email:'qa@example.com',business:'Test & Co',message:'A café site? Yes.'});
  s.form.events.submit({preventDefault(){}});const u=new URL(s.opened);assert.equal(u.pathname,'/60176146502');assert(u.searchParams.get('text').includes('Test & Co'));assert(u.searchParams.get('text').includes('A café site? Yes.'));assert.equal(s.submit.disabled,false);
});
console.log(`${passed} checks passed. Visual/responsive browser verification remains separate.`);
