const KEYS = {};

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
}

const getItem = (key,def='') => {
  const local = localStorage.getItem(key);
  if(!local){
    localStorage.setItem(key, def);
    return def;
  }
  return local;
}

const html = []; 
sections.da.forEach(({number,title,sentences},i)=>{
  const tkey = mkTitleKey(i);
  const tcontent = getItem(tkey, sections.eo[i].title);
    html.push( `\n<h2 class="section-title da">${number}. ${title}</h2>\n` );
    html.push( `
      <h2 class="section-title">
      ${sections.eo[i].number}. 
      <span class="eo" data-id="${tkey}" >${tcontent}</span>
      </h2>\n
    `);
    sentences.forEach( (s,j) => { 
      const key = mkSentenceKey(i,j);
      const content = getItem(key, sections.eo[i].sentences[j]);
      html.push('<div class = "da-eo">')
      html.push( `\t<div class="sentence da">${s}</div>\n` ); 
      html.push( `\t<div class="sentence eo" data-id="${key}">${content}</div>\n` ); 
      html.push('</div>')
    });
  }
);



window.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('container').innerHTML = html.join('');
    let counter = 0;
    document.querySelectorAll('.eo').forEach(
      (e,_i) => {
        counter++;
        e.dataset.counter = counter;
        e.contentEditable=true;
        e.addEventListener( 'click', e => {
          } 
        )
        e.addEventListener( 'input', e => {
          const key = e.target.dataset.id;
          const content = e.target.textContent;
          localStorage.setItem(key, content);

        } 
      )
      
      }
    );

    document.getElementById('MAKE_JSON').addEventListener('click',_e=>{
      const json = mkJSON();
      navigator.clipboard.writeText(json).then(
        ()=>{console.log("<json copied to clipboard>")},()=>{console.log("fail")}
      )
    });

  }
);