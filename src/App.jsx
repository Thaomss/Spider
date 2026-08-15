import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { anecdotes } from './data';
import DecryptedText from './components/DecryptedText';
import ClickSpark from './components/ClickSpark';

const FINAL_QUESTION = "Quand t'en seras arrivée à Spider-Man, ça te dit qu'on aille le voir ensemble ?";
const REVEAL_AFTER = 5;
const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

const SUPABASE_REST_URL = 'https://seuyhbyuuhclxcaoydgl.supabase.co/rest/v1';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vgzy7PHvjVtwnlkwuYnlXg_VtE2q6X5';

async function saveAnswer(response){
  const res = await fetch(`${SUPABASE_REST_URL}/spider_response`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({ response })
  });

  if(!res.ok){
    throw new Error(`Supabase ${res.status}`);
  }
}

const SPECIAL_FACT = { id:'special-question', tag:'À PROPOS DE CE SITE', universe:'HORS-SÉRIE', title:"Tout ce site aurait pu être un simple message.", text:"Mais quitte à poser une question, autant faire beaucoup trop compliqué.", detail:"Voilà. C'était l'info inutilement importante du jour. Tu peux passer à la suite normalement." };

function shuffle(list){ return [...list].sort(() => Math.random() - .5); }
function getUniverse(tag=''){
  const t=tag.toLowerCase();
  if(t.includes('ultimate')) return 'COMICS • TERRE-6160';
  if(t.includes('spider-verse') || t.includes('animation')) return 'FILMS • SPIDER-VERSE';
  if(t.includes('superior')) return 'COMICS • TERRE-616';
  if(t.includes('comics')) return 'COMICS • TERRE-616';
  if(t.includes('cinéma') || t.includes('film')) return 'CINÉMA';
  return 'ARCHIVES SPIDER-MAN';
}

export default function App(){
  const [booted,setBooted]=useState(false);
  const [deck]=useState(()=>shuffle(anecdotes));
  const [index,setIndex]=useState(0);
  const [seen,setSeen]=useState(0);
  const [alert,setAlert]=useState(false);
  const [invite,setInvite]=useState(false);
  const [answer,setAnswer]=useState(null);
  const [sending,setSending]=useState(false);
  const [sendError,setSendError]=useState(false);
  const [specialPassed,setSpecialPassed]=useState(false);
  const touch=useRef(null);
  const special = seen >= REVEAL_AFTER && !specialPassed;
  const fact = special ? SPECIAL_FACT : deck[index % deck.length];
  const universe = special ? SPECIAL_FACT.universe : getUniverse(fact.tag);
  const art = useMemo(()=> seen % 3 === 1 ? asset('miles.png') : seen % 4 === 2 ? asset('spider-hanging.png') : null,[seen]);

  const next=()=>{
    if(alert || invite) return;
    if(special){
      setSpecialPassed(true);
      setTimeout(()=>setAlert(true),420);
      return;
    }
    const n=seen+1;
    setSeen(n);
    setIndex(i=>(i+1)%deck.length);
  };
  const prev=()=>{ if(!alert && !invite && seen>0 && !specialPassed){ setSeen(s=>s-1); if(!special && index>0) setIndex(i=>i-1); } };
  const onTouchStart=e=>touch.current=e.touches[0].clientX;
  const onTouchEnd=e=>{if(touch.current==null)return; const d=e.changedTouches[0].clientX-touch.current; touch.current=null; if(d<-45)next(); else if(d>45)prev();};

  const chooseAnswer=async(value)=>{
    if(sending || answer) return;
    setSending(true);
    setSendError(false);
    const response = value === 'yes' ? 'oui' : 'non';

    for(let attempt=0; attempt<3; attempt+=1){
      try{
        await saveAnswer(response);
        setAnswer(value);
        setSending(false);
        return;
      }catch(error){
        if(attempt < 2) await new Promise(resolve=>setTimeout(resolve,650));
      }
    }

    setSending(false);
    setSendError(true);
  };

  if(!booted) return <ClickSpark><main className="boot-screen story-boot"><div className="halftone"/><motion.img src={asset('spider-hanging.png')} alt="Spider-Man suspendu" className="boot-spider" initial={{y:-45,opacity:0}} animate={{y:0,opacity:1}}/><motion.div className="boot-copy" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.2}}><div className="eyebrow">ARCHIVES DU RÉSEAU</div><h1>Traqueur Spider-Man</h1><p>Des anecdotes plus ou moins utiles sur l’homme-araignée.</p><button className="primary-btn" onClick={()=>setBooted(true)}>Ouvrir les archives</button></motion.div></main></ClickSpark>;

  return <ClickSpark><main className="story-shell" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
    <div className="noise"/><header className="story-top"><div className="brand"><img src={asset('spider-badge.png')} alt="" className="brand-icon"/><div><span>ARCHIVES</span><strong>Spider-Man</strong></div></div><div className="online"><i/> ACTIF</div></header>
    <div className="story-progress"><span style={{width:`${Math.min((seen+1)/(REVEAL_AFTER+1)*100,100)}%`}}/></div>
    <section className="story-stage">
      <AnimatePresence mode="wait">
        <motion.article key={fact.id} className="story-card" initial={{opacity:0,x:45,rotate:.5}} animate={{opacity:1,x:0,rotate:0}} exit={{opacity:0,x:-45}} transition={{duration:.25}}>
          <div className="universe-label"><span>{universe}</span><i>•</i><b>{fact.tag}</b></div><div className="story-meta"><span>LE SAVAIS-TU ?</span></div>
          {art && <motion.img src={art} alt="Illustration Spider-Man" className="story-art" initial={{opacity:0,scale:.92}} animate={{opacity:.28,scale:1}}/>}
          <div className="story-content"><div className="story-number">{special ? 'PETITE PARENTHÈSE' : `ARCHIVE ${String(index+1).padStart(2,'0')}`}</div><h2><DecryptedText text={fact.title} start speed={18}/></h2><p>{fact.text}</p><div className="story-detail"><span>LE PETIT DÉTAIL</span>{fact.detail}</div></div>
        </motion.article>
      </AnimatePresence>
      <div className="story-controls"><button onClick={prev} disabled={index===0} aria-label="Anecdote précédente">‹</button><span>{special ? 'Petite parenthèse' : `${seen+1} découverte${seen ? 's' : ''}`}<small>Fais glisser ou appuie pour continuer</small></span><button onClick={next} aria-label="Anecdote suivante">›</button></div>
      <button className="tap-zone" onClick={next} aria-label="Passer à l'anecdote suivante"/>
    </section>

    <AnimatePresence>{alert&&!invite&&<motion.div className="center-alert-backdrop" initial={{opacity:0}} animate={{opacity:1}}><motion.div className="center-alert" initial={{scale:.72,opacity:0,y:25}} animate={{scale:1,opacity:1,y:0}} transition={{type:'spring',stiffness:280,damping:20}}><div className="alert-rings"><img src={asset('spider-badge.png')} alt=""/><i/><i/></div><div className="eyebrow">TOUT ÇA POUR ÇA</div><h2>Bon, j’aurais pu commencer par là.</h2><p>J’aurais pu simplement te demander ça autour d’une partie de mots fléchés, mais apparemment faire un site pendant 10h était plus logique.</p><button className="primary-btn" onClick={()=>{setAlert(false);setInvite(true)}}>Continuer</button></motion.div></motion.div>}</AnimatePresence>

    <AnimatePresence>{invite&&<motion.div className="center-alert-backdrop" initial={{opacity:0}} animate={{opacity:1}}><motion.section className="invite-mobile" initial={{y:80,opacity:0}} animate={{y:0,opacity:1}}><div className="signal-scan"><span>ANALYSE TERMINÉE</span><strong>Correspondance trouvée</strong></div><div className="invite-data mobile-data"><div><span>SUJET</span><strong>Spider-Man</strong></div><div><span>LIEU PROBABLE</span><strong>Cinéma</strong></div><div><span>DATE</span><strong>Quand t'en seras là</strong></div></div><div className="final-question"><div className="eyebrow">BON. TOUT ÇA POUR ÇA.</div><h3>{FINAL_QUESTION}</h3>{!answer?<><div className="answer-row"><button className="primary-btn" disabled={sending} onClick={()=>chooseAnswer('yes')}>{sending?'...':'Oui'}</button><button className="secondary-btn" disabled={sending} onClick={()=>chooseAnswer('no')}>{sending?'...':'Non'}</button></div>{sendError&&<p className="send-error">Petit bug de connexion, retente juste une fois.</p>}</>:<motion.div className="answer-result answer-result-stack" initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}}><p>{answer==='yes'?"Bon bah ça valait le coup de faire un site entier finalement":"Ça marche, au moins t'auras appris des trucs sur Spider-Man"}</p><span>Il reste encore des anecdotes si t'as envie de continuer.</span><button className="secondary-btn continue-facts" onClick={()=>{setInvite(false);setAnswer(null);setSeen(s=>s+1);setIndex(i=>(i+1)%deck.length)}}>Continuer les anecdotes</button></motion.div>}</div></motion.section></motion.div>}</AnimatePresence>
  </main></ClickSpark>;
}
