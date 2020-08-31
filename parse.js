const KEYS = {};

const markEmptySentences = () => {
  const keys = Object.keys(KEYS);
  for(let k of keys){
    const e = document.querySelector(`.eo[data-id="${k}"`);
    if(localStorage.getItem(k)=='') e.dataset.empty = true;;
    

  }

}

const niceQuotes = str => str.replace(/"\b/,'“').replace(/\b"/,'”');

const mkSentenceKey = (i,j) =>  {
  const key = `[section,${i},sentence,${j}]`;
  KEYS[key] = true;
  return key;
}
const mkTitleKey = (i,j) =>  {
  const key = `[section,${i},title]`;
  KEYS[key] = true;
  return key;
}

const mkJSON = () => {
  const obj = {};
  let progress = 0;
  const keys = Object.keys(KEYS);
  const total = keys.length;
  keys.forEach( key => {
    const content = localStorage.getItem(key).trim();
    progress += content===''?0:1;

    obj[key] = content;
  });
  const json = JSON.stringify(obj,null,2);
  console.log(`progress: ${(progress/total*100).toFixed(1)}% (${progress} of ${total})`);
  return json;
}

const text2sections = (text) => {
  const sections = [];
  const lines = text.split(/\n+/);
  lines.forEach((line,i)=>{
      let md;
      if( md = /^(_|\d+)\.\s*(.*)$/.exec(line) ){
        sections.push( {number: md[1], title: md[2], sentences: []} );
      } else{
        sections[sections.length-1].sentences.push(line);
      }
    }
  )  
  return sections;
} 

const sections = {
  da: text2sections( TEXT_DA ),
  eo: text2sections( TEXT_EO ),
  eo2: text2sections( TEXT_EO2 )
}

const getItem = (key,def='') => {
  const local = localStorage.getItem(key);
  if(!local){
    console.log(fileStorage[key])
    localStorage.setItem(key, fileStorage[key]||niceQuotes(def));
    return def;
  }
  return local;
}

const html = []; 
sections.da.forEach(({number,title,sentences},i)=>{
  const tkey = mkTitleKey(i);
  const tcontent = getItem(tkey, sections.eo[i].title);
  html.push('<div class = "da-eo">')
    html.push( `
    <h2 class="section-title section-title--da">
    ${sections.eo[i].number}. 
    <span class="sentence da">${title}</span>
    </h2>\n
  `);
    html.push( `
      <h2 class="section-title section-title--eo">
      ${sections.eo[i].number}. 
      <span class="sentence eo" data-id="${tkey}" >${tcontent}</span>
      </h2>\n
    `);
    html.push( `
    <h2 class="section-title section-title--eo2">
    ${sections.eo[i].number}. 
    <span class="sentence eo2" >${sections.eo2[i]?sections.eo2[i].title:''}</span>
    </h2>\n
  `);
  html.push('</div>')

    
    sentences.forEach( (s,j) => { 
      const key = mkSentenceKey(i,j);
      const content = getItem(key, sections.eo[i].sentences[j]);

      html.push('<div class = "da-eo">')
      html.push( `\t<div class="sentence da">${s}</div>\n` ); 
      html.push( `\t<div class="sentence eo" data-key="${i}_${j}" data-id="${key}">${content} </div>\n` ); 
      html.push( `\t<div class="sentence eo2">${sections.eo2[i]?sections.eo2[i].sentences[j]:''}</div>\n` ); 
      html.push('</div>')
    });
  }
);



window.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('container').innerHTML = html.join('');
    let counter = 0;
    const update = elm => {
      const key = elm.dataset.id;
      const content = elm.textContent;
      localStorage.setItem(key, content);
      elm.dataset.empty = content =='';
    };
    document.querySelectorAll('.eo').forEach(
      (e,_i) => {
        counter++;
        e.dataset.counter = counter;
        e.contentEditable=true;
/*         e.addEventListener( 'blur', evt => {
          evt.target.textContent = niceQuotes(evt.target.textContent);
          const key = evt.target.dataset.id;
          const content = evt.target.textContent;
          localStorage.setItem(key, content);
        }); */
        e.addEventListener( 'input', evt => {
          update(evt.target);
          } 
        );
      });

      document.querySelectorAll('.da-eo').forEach(elm=>{
        const eo  = elm.querySelector('.eo' );
        const eo2 = elm.querySelector('.eo2');

        eo2.addEventListener('click', _e => {
          if(eo.dataset.empty=="true"){
            console.log(eo.textContent);
            eo.textContent =  eo2.textContent;
            update(eo);
          } else {
            console.log("Please erase translation before copying.")
          }
        });

        /* INIT */ 
        elm.dataset.state='idle';  
        eo.addEventListener('focus', e=>{ elm.dataset.state='active'; });
        eo.addEventListener('blur' , e=>{ elm.dataset.state='idle'; });

      });

    document.getElementById('MAKE_JSON').addEventListener('click',_e=>{
      const json = mkJSON();
      navigator.clipboard.writeText(json).then(
        ()=>{console.log("<json copied to clipboard>")},()=>{console.log("fail")}
      )
    });
    markEmptySentences();
  }
);