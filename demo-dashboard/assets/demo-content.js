/* ============================================================
   Demo layer — window.DemoUI
   ------------------------------------------------------------
   Everything the session demo adds on top of the copied Measures
   teacher app (teacher-dashboard.js calls in through DemoUI, and
   reads/writes the app through window.TD):
     • mondayCard()      Home: who to check in with, what's due, a
                         suggested activity, the upload task
     • passport(stu)     Child → "Memory layer" tab: memory
                         layer (notes carried forward), maths marks
                         explained through skills, past grades
     • upload overlay    pick a sample maths sheet → scripted read
     • chipsHTML/answer  Ask Tilli: tap-only questions, scripted
                         answers (no AI behind it)
   All copy lives in COPY below, per language (es / en / hi). It is
   written directly in each language, so the page translator skips
   these blocks (they carry data-demo).
   ============================================================ */
(function () {
  'use strict';
  var D = window.DEMO, L = D.lang;

  // ---------- small helpers ----------
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fill(s, v) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v && v[k] != null ? v[k] : m; }); }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function pick(arr, seed) { return arr[hash(seed) % arr.length]; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  // Spanish: skill / topic names are lower-case mid-sentence.
  function lc(x) { return L === 'es' ? String(x).charAt(0).toLowerCase() + String(x).slice(1) : x; }
  function md(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>'); }

  // ---------- copy (per language) ----------
  var SKILL = {
    es: { emotion_awareness: 'Conciencia emocional', emotion_regulation: 'Regulación emocional', empathy: 'Empatía', relationship_skills: 'Habilidades de relación', metacognition: 'Metacognición', critical_thinking: 'Pensamiento crítico', working_memory: 'Memoria de trabajo', planning: 'Planificación y organización', cognitive_flexibility: 'Flexibilidad cognitiva', inhibition_distraction: 'Inhibición (distracción)', inhibition_response: 'Inhibición (respuesta)', attention: 'Atención' },
    en: { emotion_awareness: 'Emotion Awareness', emotion_regulation: 'Emotion Regulation', empathy: 'Empathy', relationship_skills: 'Relationship Skills', metacognition: 'Metacognition', critical_thinking: 'Critical Thinking', working_memory: 'Working Memory', planning: 'Planning & Organization', cognitive_flexibility: 'Cognitive Flexibility', inhibition_distraction: 'Inhibition (Distraction)', inhibition_response: 'Inhibition (Response)', attention: 'Attention' },
    hi: { emotion_awareness: 'भावनाओं की पहचान', emotion_regulation: 'भावनाओं पर नियंत्रण', empathy: 'सहानुभूति', relationship_skills: 'रिश्ते बनाने का कौशल', metacognition: 'अपनी सोच को समझना', critical_thinking: 'आलोचनात्मक सोच', working_memory: 'कार्यशील स्मृति', planning: 'योजना और संगठन', cognitive_flexibility: 'सोच का लचीलापन', inhibition_distraction: 'ध्यान भटकने पर रोक', inhibition_response: 'प्रतिक्रिया पर रोक', attention: 'ध्यान' },
  }[L];
  var BAND = {
    es: { Beginner: 'Principiante', Learner: 'Aprendiz', Advanced: 'Avanzado' },
    en: { Beginner: 'Beginner', Learner: 'Learner', Advanced: 'Advanced' },
    hi: { Beginner: 'शुरुआती', Learner: 'विकासशील', Advanced: 'उन्नत' },
  }[L];
  var MATH = {
    es: { number: 'Sentido numérico', addsub: 'Suma y resta', mult: 'Multiplicación', words: 'Resolución de problemas', measure: 'Medida' },
    en: { number: 'Number sense', addsub: 'Addition & subtraction', mult: 'Multiplication', words: 'Word problems', measure: 'Measurement' },
    hi: { number: 'संख्या की समझ', addsub: 'जोड़ और घटाव', mult: 'गुणा', words: 'शाब्दिक प्रश्न', measure: 'माप' },
  }[L];
  // Which skill most often sits behind a low maths topic.
  var MATH_SKILL = { number: 'critical_thinking', addsub: 'attention', mult: 'working_memory', words: 'working_memory', measure: 'planning' };
  // Parent report (PDF) copy, per language. teacher-dashboard.js builds the report from this (DemoUI.report).
  // {n} = child's first name; strings marked <b> carry HTML, everything else is plain text.
  var REPORT = {
    en: {
      logo: 'PARENT REPORT', hello: 'Hello, {fam} 👋', fam: '{n}’s family', teacher: 'Teacher: {t}', teacherFallback: 'your class teacher', term: 'Term One',
      intro: 'This report brings together what we’ve seen across three different lenses — your survey as a parent, {n}’s direct assessment, and their teacher’s observations — to give you a full picture of how {n} is growing.',
      s1: 'How we look at your child’s development 🌸', s1p: 'We look at your child through three different lenses. Each one tells us something the others can’t — and together they give us the fullest picture.',
      lens: [['Parent Survey', 'What you observe at home — your child’s behaviour, emotions, and relationships in everyday life.'], ['Student Assessment', 'Direct tasks completed by your child that measure skills like attention, memory, and reasoning.'], ['Teacher Survey', 'What the teacher observes in the classroom — focus, self-regulation, and social behaviour.']],
      lvP: 'These three perspectives are combined to give each skill a level. Here’s what each level means:',
      lv: { Beginner: 'This skill is emerging. Consistent practice and support will help it grow.', Learner: 'Developing well. Showing this skill in many situations — keep building!', Advanced: 'Strong and consistent — really shining in this area!' },
      s2: 'The 12 skills we look at 🌿', s2p: 'These skills shape how children learn, relate to others, and navigate the world. Research shows they matter just as much as academic ability for long-term wellbeing and happiness.',
      sel: 'Social-Emotional Learning', cog: 'Cognitive Skills', thSkill: 'Skill', thWhy: 'Why it matters', thLevel: 'Level',
      s3: '{n}’s skill levels 💜', s3wait: '{n}’s first assessment is still in progress. Their skill levels will appear here once Baseline is complete.',
      s3p: 'Here’s where {n} is right now across all 12 skills, based on the combined view from you, their teacher, and their own assessment.',
      s4: 'Snapshot summary ✨', sumWait: '✨ Once {n}’s Baseline is complete, this summary will highlight their biggest strength and where they’ll grow the most with a little extra support.',
      sumTop: '✨ {n}’s biggest strength is <b>{skill}</b> — {n} {what}.', sumMid1: '{n}’s {skills} is developing well.', sumMid2: '{n}’s {skills} are developing well.', and: ' and ',
      sumLow: 'The area where {n} will grow the most with extra support right now is <b>{skill}</b> — {how}.',
      s5: 'What you can do at home 🏠', s5p: 'Small, consistent moments at home make a real difference. Here are a few things to try this term:',
      conf: 'Confidential — for family use only',
      why: {
        emotion_awareness: 'Helps children understand what they and others feel — the foundation of all social connection.',
        emotion_regulation: 'Builds the ability to stay calm under pressure and recover from frustration or disappointment.',
        empathy: 'Enables children to consider other perspectives, essential for kindness and conflict resolution.',
        relationship_skills: 'Supports healthy friendships and teamwork through communication and cooperation.',
        metacognition: 'Teaches children to think about their own thinking — a key driver of learning and growth.',
        critical_thinking: 'Develops the ability to reason, question, and evaluate information independently.',
        attention: 'The ability to focus and filter distractions — foundational for learning in any setting.',
        working_memory: 'Holding and using information in mind while completing tasks — crucial for problem solving.',
        cognitive_flexibility: 'Adapting thinking when situations change — supports resilience and creative problem solving.',
        planning: 'Setting goals and breaking them into steps — key for academic and personal success.',
        inhibition_distraction: 'Resisting distractions to stay on task, supporting self-directed focus.',
        inhibition_response: 'Pausing before acting impulsively — builds thoughtful, careful decision making.',
      },
      strength: {
        emotion_awareness: 'picks up on feelings in themselves and others with real confidence', emotion_regulation: 'stays steady when things get hard and bounces back from frustration',
        empathy: 'notices how others feel and responds with kindness', relationship_skills: 'joins in, shares and works well with other children',
        metacognition: 'talks about how they solved a problem and what was tricky', critical_thinking: 'asks "why" and gives reasons for their thinking',
        attention: 'stays focused and filters out distractions well', working_memory: 'holds instructions in mind and follows them through',
        cognitive_flexibility: 'switches between ideas and activities with ease', planning: 'thinks ahead and organises the steps of a task',
        inhibition_distraction: 'keeps going with a task even when there is noise around', inhibition_response: 'pauses before reacting and makes careful choices',
      },
      grow: {
        emotion_awareness: 'helping {n} put a name to feelings as they happen', emotion_regulation: 'helping {n} find a calm-down routine for big feelings',
        empathy: 'helping {n} notice how other people might be feeling', relationship_skills: 'helping {n} practise taking turns and joining in',
        metacognition: 'helping {n} pause and reflect on how they think and learn', critical_thinking: 'helping {n} explain the "why" behind their ideas',
        attention: 'helping {n} stay with one thing a little longer', working_memory: 'helping {n} hold a few steps in mind at once',
        cognitive_flexibility: 'helping {n} adjust when plans change', planning: 'helping {n} break tasks into small first steps',
        inhibition_distraction: 'helping {n} keep focus when there are distractions', inhibition_response: 'helping {n} stop and think before acting',
      },
      tips: {
        emotion_awareness: ['Name emotions out loud', '💛', 'When you notice a feeling at home, say it aloud — "I’m feeling a bit frustrated right now." This makes emotions normal and visible, which helps {n} do the same.'],
        emotion_regulation: ['Make a calm-down plan', '🌊', 'Together, pick two things that help when feelings get big — three slow breaths, a hug, a quiet corner. Practise them when {n} is calm so they’re ready when needed.'],
        empathy: ['Wonder about others', '🤝', 'While reading or watching something together, pause and ask: "How do you think they feel right now? Why?" It builds the habit of seeing through someone else’s eyes.'],
        relationship_skills: ['Play turn-taking games', '🎲', 'Board games, cards or building together give {n} easy practice in waiting, sharing and handling winning and losing kindly.'],
        metacognition: ['Ask "what were you thinking?"', '🌸', 'After a decision or problem, ask: "What was going through your mind?" or "Would you do anything differently next time?" This is the simplest way to build metacognition.'],
        critical_thinking: ['Ask "how do you know?"', '🔍', 'When {n} shares an idea, gently ask "How do you know?" or "What makes you think that?" and listen to the reasoning — no right answers needed.'],
        attention: ['One thing at a time', '🎯', 'Set up short, screen-free moments for one activity — a puzzle, a drawing, a story. Gradually stretch the time, and notice out loud when {n} stays with it.'],
        working_memory: ['Two-step jobs', '🧺', 'Give simple two-step requests — "Put your shoes away, then bring your book." As {n} gets them right, add a third step.'],
        cognitive_flexibility: ['Play "what else could it be?"', '🔄', 'Pick an everyday object and take turns thinking of new uses for it. Silly ideas count — it trains {n}’s thinking to bend when things change.'],
        planning: ['Plan together before big tasks', '💜', 'Before homework or a project, ask: "What’s the first step? What comes after?" Planning out loud, with you, is exactly how organisation skills grow.'],
        inhibition_distraction: ['Create a focus spot', '📚', 'Choose one quiet spot for homework or reading, away from the TV and toys. A predictable space makes it easier for {n} to tune out distractions.'],
        inhibition_response: ['Celebrate the pause', '🌿', 'When {n} stops before reacting — even for a second — notice it. "I saw you take a breath there. That was really thoughtful." Small moments build big habits.'],
      },
      ui: { selBtn: 'Parent reports', selTitle: 'Select students and download a PDF report for each, ready to share with parents', selAll: 'Select all', nSel: '{k} selected', cancel: 'Cancel',
        preview: 'Preview', previewTitle: 'See the report on screen before making the PDFs', dl1: '⬇ Download PDF', dlN: '⬇ Download PDFs', loading: 'Loading…', preparing: 'Preparing {i} of {n}…',
        err: 'Couldn’t create the PDFs — check your connection and try again.', pvAria: 'Parent report preview', pvTitle: 'Parent report · {name}', pvOf: '{i} of {n} · ', pvSub: 'What this child’s family will receive',
        prev: '‹ Previous', next: 'Next ›', close: 'Close preview', file: 'Tilli-report' },
    },
    es: {
      logo: 'INFORME PARA FAMILIAS', hello: 'Hola, {fam} 👋', fam: 'familia de {n}', teacher: 'Docente: {t}', teacherFallback: 'su tutor o tutora', term: 'Primer trimestre',
      intro: 'Este informe reúne lo que hemos visto desde tres miradas distintas —tu encuesta como familia, la evaluación directa de {n} y las observaciones de su docente— para darte una imagen completa de cómo está creciendo {n}.',
      s1: 'Cómo miramos el desarrollo de tu peque 🌸', s1p: 'Miramos a tu peque desde tres miradas distintas. Cada una nos cuenta algo que las otras no pueden y, juntas, nos dan la imagen más completa.',
      lens: [['Encuesta a la familia', 'Lo que ves en casa: el comportamiento, las emociones y las relaciones de tu peque en el día a día.'], ['Evaluación del alumno', 'Tareas que hace tu peque y que miden habilidades como la atención, la memoria y el razonamiento.'], ['Encuesta al docente', 'Lo que observa su docente en clase: la concentración, la autorregulación y el comportamiento social.']],
      lvP: 'Estas tres miradas se combinan para dar un nivel a cada habilidad. Esto es lo que significa cada nivel:',
      lv: { Beginner: 'Esta habilidad está empezando a aparecer. Con práctica y apoyo constantes, crecerá.', Learner: 'Se está desarrollando bien. Aparece en muchas situaciones: ¡a seguir!', Advanced: 'Sólida y constante: ¡está brillando en esta área!' },
      s2: 'Las 12 habilidades que miramos 🌿', s2p: 'Estas habilidades influyen en cómo aprenden los niños, cómo se relacionan con los demás y cómo se mueven por el mundo. La investigación muestra que importan tanto como el rendimiento académico para el bienestar y la felicidad a largo plazo.',
      sel: 'Aprendizaje socioemocional', cog: 'Habilidades cognitivas', thSkill: 'Habilidad', thWhy: 'Por qué importa', thLevel: 'Nivel',
      s3: 'Niveles de {n} en cada habilidad 💜', s3wait: 'La primera evaluación de {n} todavía está en marcha. Sus niveles aparecerán aquí cuando termine la evaluación inicial.',
      s3p: 'Así está {n} ahora mismo en las 12 habilidades, según lo que ves tú, lo que ve su docente y su propia evaluación.',
      s4: 'Resumen ✨', sumWait: '✨ Cuando termine la evaluación inicial de {n}, este resumen mostrará su mayor fortaleza y dónde más crecerá con un poco de apoyo extra.',
      sumTop: '✨ La mayor fortaleza de {n} es <b>{skill}</b>: {n} {what}.', sumMid1: 'Además, {skills} se está desarrollando bien.', sumMid2: 'Además, {skills} se están desarrollando bien.', and: ' y ',
      sumLow: 'El área en la que {n} más puede crecer ahora con un poco de apoyo extra es <b>{skill}</b>. Lo que más ayuda: {how}.',
      s5: 'Qué puedes hacer en casa 🏠', s5p: 'Los momentos pequeños y constantes en casa marcan una gran diferencia. Aquí tienes algunas ideas para este trimestre:',
      conf: 'Confidencial: solo para uso de la familia',
      why: {
        emotion_awareness: 'Ayuda a los niños a entender lo que sienten ellos y los demás: la base de toda conexión social.',
        emotion_regulation: 'Desarrolla la capacidad de mantener la calma bajo presión y recuperarse de la frustración o la decepción.',
        empathy: 'Permite ponerse en el lugar del otro, algo esencial para la amabilidad y la resolución de conflictos.',
        relationship_skills: 'Favorece las amistades sanas y el trabajo en equipo a través de la comunicación y la cooperación.',
        metacognition: 'Enseña a pensar sobre el propio pensamiento: un motor clave del aprendizaje y el crecimiento.',
        critical_thinking: 'Desarrolla la capacidad de razonar, preguntar y valorar la información de forma independiente.',
        attention: 'La capacidad de concentrarse y filtrar las distracciones: la base para aprender en cualquier entorno.',
        working_memory: 'Mantener y usar información en la mente mientras se hace una tarea: clave para resolver problemas.',
        cognitive_flexibility: 'Adaptar el pensamiento cuando cambian las situaciones: favorece la resiliencia y la creatividad.',
        planning: 'Ponerse metas y dividirlas en pasos: clave para el éxito escolar y personal.',
        inhibition_distraction: 'Resistir las distracciones para seguir con la tarea, lo que favorece la concentración autónoma.',
        inhibition_response: 'Pararse antes de actuar por impulso: ayuda a tomar decisiones con calma y cuidado.',
      },
      strength: {
        emotion_awareness: 'reconoce con mucha seguridad las emociones propias y las de los demás', emotion_regulation: 'mantiene la calma cuando las cosas se ponen difíciles y se recupera de la frustración',
        empathy: 'se da cuenta de cómo se sienten los demás y responde con amabilidad', relationship_skills: 'se une al grupo, comparte y trabaja bien con otros niños',
        metacognition: 'explica cómo ha resuelto un problema y qué le ha costado', critical_thinking: 'pregunta «¿por qué?» y da razones de lo que piensa',
        attention: 'se concentra y filtra bien las distracciones', working_memory: 'recuerda las instrucciones y las sigue hasta el final',
        cognitive_flexibility: 'cambia de idea y de actividad con facilidad', planning: 'piensa con antelación y organiza los pasos de una tarea',
        inhibition_distraction: 'sigue con la tarea aunque haya ruido alrededor', inhibition_response: 'se para antes de reaccionar y elige con cuidado',
      },
      grow: {
        emotion_awareness: 'ayudar a {n} a poner nombre a las emociones en el momento', emotion_regulation: 'ayudar a {n} a encontrar una rutina para calmarse cuando las emociones son intensas',
        empathy: 'ayudar a {n} a fijarse en cómo pueden sentirse los demás', relationship_skills: 'ayudar a {n} a practicar los turnos y a unirse al juego',
        metacognition: 'ayudar a {n} a pararse a pensar en cómo piensa y aprende', critical_thinking: 'ayudar a {n} a explicar el «porqué» de sus ideas',
        attention: 'ayudar a {n} a quedarse con una cosa un poco más de tiempo', working_memory: 'ayudar a {n} a recordar varios pasos a la vez',
        cognitive_flexibility: 'ayudar a {n} a adaptarse cuando cambian los planes', planning: 'ayudar a {n} a dividir las tareas en primeros pasos pequeños',
        inhibition_distraction: 'ayudar a {n} a mantener la concentración cuando hay distracciones', inhibition_response: 'ayudar a {n} a pararse y pensar antes de actuar',
      },
      tips: {
        emotion_awareness: ['Di las emociones en voz alta', '💛', 'Cuando notes una emoción en casa, dila en voz alta: «Ahora mismo siento un poco de frustración». Así las emociones se vuelven normales y visibles, y a {n} le resulta más fácil hacer lo mismo.'],
        emotion_regulation: ['Un plan para calmarse', '🌊', 'Elige con {n} dos cosas que ayuden cuando las emociones se hacen grandes: tres respiraciones lentas, un abrazo, un rincón tranquilo. Practicadlas en momentos de calma para tenerlas listas cuando hagan falta.'],
        empathy: ['Piensa en los demás', '🤝', 'Mientras leéis o veis algo juntos, para y pregunta: «¿Cómo crees que se siente ahora? ¿Por qué?». Así se crea el hábito de mirar con los ojos de otra persona.'],
        relationship_skills: ['Juegos por turnos', '🎲', 'Los juegos de mesa, las cartas o construir juntos le dan a {n} una práctica fácil para esperar, compartir y saber ganar y perder con amabilidad.'],
        metacognition: ['Pregunta «¿qué estabas pensando?»', '🌸', 'Después de una decisión o un problema, pregunta: «¿Qué se te pasaba por la cabeza?» o «¿Harías algo distinto la próxima vez?». Es la forma más sencilla de desarrollar la metacognición.'],
        critical_thinking: ['Pregunta «¿cómo lo sabes?»', '🔍', 'Cuando {n} comparta una idea, pregunta con cariño: «¿Cómo lo sabes?» o «¿Qué te hace pensar eso?», y escucha su razonamiento. No hacen falta respuestas correctas.'],
        attention: ['Una cosa cada vez', '🎯', 'Prepara ratos cortos sin pantallas para una sola actividad: un puzle, un dibujo, un cuento. Alarga el tiempo poco a poco y dilo en voz alta cuando {n} se mantenga en ella.'],
        working_memory: ['Encargos de dos pasos', '🧺', 'Pide cosas sencillas de dos pasos: «Guarda los zapatos y luego trae tu libro». Cuando {n} lo haga bien, añade un tercer paso.'],
        cognitive_flexibility: ['Juega a «¿qué más podría ser?»', '🔄', 'Elegid un objeto cotidiano y, por turnos, pensad usos nuevos para él. Las ideas disparatadas también cuentan: así el pensamiento de {n} aprende a adaptarse cuando las cosas cambian.'],
        planning: ['Planificad juntos antes de las tareas grandes', '💜', 'Antes de los deberes o de un proyecto, pregunta: «¿Cuál es el primer paso? ¿Y después?». Planificar en voz alta contigo es justo como crecen las habilidades de organización.'],
        inhibition_distraction: ['Un rincón para concentrarse', '📚', 'Elige un sitio tranquilo para los deberes o la lectura, lejos de la tele y los juguetes. Un espacio previsible le facilita a {n} desconectar de las distracciones.'],
        inhibition_response: ['Celebra la pausa', '🌿', 'Cuando {n} se pare antes de reaccionar, aunque sea un segundo, díselo: «He visto que has respirado antes de contestar. ¡Muy bien pensado!». Los pequeños momentos crean grandes hábitos.'],
      },
      ui: { selBtn: 'Informes para familias', selTitle: 'Elige alumnos y descarga un informe en PDF de cada uno, listo para compartir con las familias', selAll: 'Seleccionar todos', nSel: '{k} seleccionados', cancel: 'Cancelar',
        preview: 'Vista previa', previewTitle: 'Mira el informe en pantalla antes de crear los PDF', dl1: '⬇ Descargar PDF', dlN: '⬇ Descargar PDF', loading: 'Cargando…', preparing: 'Preparando {i} de {n}…',
        err: 'No se han podido crear los PDF. Revisa la conexión y vuelve a intentarlo.', pvAria: 'Vista previa del informe', pvTitle: 'Informe para la familia · {name}', pvOf: '{i} de {n} · ', pvSub: 'Lo que recibirá su familia',
        prev: '‹ Anterior', next: 'Siguiente ›', close: 'Cerrar vista previa', file: 'informe-Tilli' },
    },
    hi: {
      logo: 'अभिभावक रिपोर्ट', hello: '{fam}, नमस्ते 👋', fam: '{n} के परिवारजन', teacher: 'शिक्षक: {t}', teacherFallback: 'कक्षा शिक्षक', term: 'पहला सत्र',
      intro: 'यह रिपोर्ट तीन अलग-अलग नज़रियों से देखी गई बातों को एक साथ लाती है — अभिभावक के रूप में आपका सर्वे, {n} का सीधा आकलन, और शिक्षक के अवलोकन — ताकि आपको {n} के विकास की पूरी तस्वीर मिले।',
      s1: 'हम आपके बच्चे के विकास को कैसे देखते हैं 🌸', s1p: 'हम आपके बच्चे को तीन अलग-अलग नज़रियों से देखते हैं। हर नज़रिया कुछ ऐसा बताता है जो बाकी नहीं बता सकते — और साथ मिलकर ये सबसे पूरी तस्वीर देते हैं।',
      lens: [['अभिभावक सर्वे', 'आप घर पर जो देखते हैं — रोज़मर्रा की ज़िंदगी में बच्चे का व्यवहार, भावनाएँ और रिश्ते।'], ['विद्यार्थी आकलन', 'बच्चे के किए सीधे काम, जो ध्यान, याददाश्त और तर्क जैसे कौशल मापते हैं।'], ['शिक्षक सर्वे', 'शिक्षक कक्षा में जो देखते हैं — एकाग्रता, आत्म-नियंत्रण और सामाजिक व्यवहार।']],
      lvP: 'इन तीनों नज़रियों को मिलाकर हर कौशल को एक स्तर दिया जाता है। हर स्तर का मतलब:',
      lv: { Beginner: 'यह कौशल अभी उभर रहा है। नियमित अभ्यास और सहारे से यह बढ़ेगा।', Learner: 'अच्छी तरह विकसित हो रहा है। कई स्थितियों में यह कौशल दिखता है — इसे बढ़ाते रहें!', Advanced: 'मज़बूत और लगातार — इस क्षेत्र में सच में चमक रहा है!' },
      s2: '12 कौशल जिन्हें हम देखते हैं 🌿', s2p: 'ये कौशल तय करते हैं कि बच्चे कैसे सीखते हैं, दूसरों से कैसे जुड़ते हैं और दुनिया में कैसे आगे बढ़ते हैं। शोध बताता है कि लंबे समय की खुशहाली के लिए ये पढ़ाई जितने ही ज़रूरी हैं।',
      sel: 'सामाजिक-भावनात्मक सीख', cog: 'संज्ञानात्मक कौशल', thSkill: 'कौशल', thWhy: 'यह क्यों ज़रूरी है', thLevel: 'स्तर',
      s3: 'हर कौशल में {n} का स्तर 💜', s3wait: '{n} का पहला आकलन अभी चल रहा है। शुरुआती आकलन पूरा होने पर स्तर यहाँ दिखेंगे।',
      s3p: 'आपके, शिक्षक के और बच्चे के अपने आकलन को मिलाकर, सभी 12 कौशलों में {n} की अभी की स्थिति:',
      s4: 'सारांश ✨', sumWait: '✨ {n} का शुरुआती आकलन पूरा होने पर यह सारांश सबसे बड़ी ताक़त दिखाएगा, और वह क्षेत्र भी जहाँ थोड़े अतिरिक्त सहारे से सबसे ज़्यादा बढ़त होगी।',
      sumTop: '✨ {n} की सबसे बड़ी ताक़त है <b>{skill}</b> — {what}।', sumMid1: 'इसके अलावा {skills} में भी अच्छा विकास दिख रहा है।', sumMid2: 'इसके अलावा {skills} में भी अच्छा विकास दिख रहा है।', and: ' और ',
      sumLow: 'अभी थोड़े अतिरिक्त सहारे से सबसे ज़्यादा बढ़त <b>{skill}</b> में हो सकती है। इसमें मदद मिलेगी: {how}।',
      s5: 'आप घर पर क्या कर सकते हैं 🏠', s5p: 'घर पर छोटे, नियमित पल बड़ा फ़र्क लाते हैं। इस सत्र में आज़माने के लिए कुछ बातें:',
      conf: 'गोपनीय — केवल परिवार के लिए',
      why: {
        emotion_awareness: 'बच्चों को यह समझने में मदद करता है कि वे और दूसरे क्या महसूस करते हैं — हर सामाजिक जुड़ाव की नींव।',
        emotion_regulation: 'दबाव में शांत रहने और निराशा या हताशा से उबरने की क्षमता बनाता है।',
        empathy: 'दूसरों का नज़रिया समझने में मदद करता है — दयालुता और झगड़े सुलझाने के लिए ज़रूरी।',
        relationship_skills: 'बातचीत और सहयोग से अच्छी दोस्ती और मिलकर काम करने में मदद करता है।',
        metacognition: 'बच्चों को अपनी सोच के बारे में सोचना सिखाता है — सीखने और बढ़ने की एक बड़ी ताक़त।',
        critical_thinking: 'खुद से तर्क करने, सवाल पूछने और जानकारी को परखने की क्षमता बढ़ाता है।',
        attention: 'ध्यान लगाने और भटकाने वाली चीज़ों को छाँटने की क्षमता — कहीं भी सीखने की नींव।',
        working_memory: 'काम करते हुए जानकारी को मन में रखना और इस्तेमाल करना — समस्याएँ सुलझाने के लिए बहुत ज़रूरी।',
        cognitive_flexibility: 'हालात बदलने पर सोच बदल पाना — लचीलेपन और रचनात्मक समाधान में मदद करता है।',
        planning: 'लक्ष्य बनाना और उन्हें कदमों में बाँटना — पढ़ाई और ज़िंदगी में सफलता की कुंजी।',
        inhibition_distraction: 'काम पर टिके रहने के लिए भटकाव से बचना, जिससे खुद से ध्यान लगाने में मदद मिलती है।',
        inhibition_response: 'बिना सोचे कुछ करने से पहले रुकना — सोच-समझकर फ़ैसले लेना सिखाता है।',
      },
      strength: {
        emotion_awareness: 'अपनी और दूसरों की भावनाओं को आत्मविश्वास से पहचानना', emotion_regulation: 'मुश्किल समय में शांत रहना और निराशा से जल्दी उबरना',
        empathy: 'दूसरों की भावनाओं पर ध्यान देना और दयालुता से जवाब देना', relationship_skills: 'दूसरे बच्चों के साथ घुलना-मिलना, बाँटना और मिलकर काम करना',
        metacognition: 'यह बताना कि कोई समस्या कैसे सुलझाई और क्या मुश्किल लगा', critical_thinking: '"क्यों" पूछना और अपनी सोच के कारण बताना',
        attention: 'ध्यान बनाए रखना और भटकाने वाली चीज़ों को अनदेखा करना', working_memory: 'निर्देशों को याद रखना और उन्हें अंत तक पूरा करना',
        cognitive_flexibility: 'आसानी से एक विचार या काम से दूसरे पर जाना', planning: 'आगे की सोचना और काम के कदम व्यवस्थित करना',
        inhibition_distraction: 'आसपास शोर होने पर भी काम में लगे रहना', inhibition_response: 'प्रतिक्रिया देने से पहले रुकना और सोच-समझकर चुनना',
      },
      grow: {
        emotion_awareness: 'भावनाएँ आते ही उन्हें नाम देने में {n} की मदद करना', emotion_regulation: 'बड़ी भावनाओं के लिए शांत होने का एक तरीका ढूँढने में {n} की मदद करना',
        empathy: 'दूसरे कैसा महसूस कर रहे होंगे, यह देखने में {n} की मदद करना', relationship_skills: 'बारी लेने और खेल में शामिल होने का अभ्यास करने में {n} की मदद करना',
        metacognition: 'रुककर अपनी सोच और सीखने के तरीके पर विचार करने में {n} की मदद करना', critical_thinking: 'अपने विचारों के पीछे का "क्यों" समझाने में {n} की मदद करना',
        attention: 'एक चीज़ पर थोड़ी देर और टिके रहने में {n} की मदद करना', working_memory: 'एक साथ कुछ कदम याद रखने में {n} की मदद करना',
        cognitive_flexibility: 'योजना बदलने पर ढलने में {n} की मदद करना', planning: 'कामों को छोटे-छोटे पहले कदमों में बाँटने में {n} की मदद करना',
        inhibition_distraction: 'भटकाने वाली चीज़ों के बीच भी ध्यान बनाए रखने में {n} की मदद करना', inhibition_response: 'कुछ करने से पहले रुककर सोचने में {n} की मदद करना',
      },
      tips: {
        emotion_awareness: ['भावनाओं को बोलकर बताएँ', '💛', 'घर पर जब कोई भावना महसूस हो, उसे बोलकर कहें — "मुझे अभी थोड़ी झुंझलाहट हो रही है।" इससे भावनाएँ सामान्य और दिखने वाली बनती हैं, और {n} को भी ऐसा करने में मदद मिलती है।'],
        emotion_regulation: ['शांत होने की योजना बनाएँ', '🌊', '{n} के साथ मिलकर दो चीज़ें चुनें जो बड़ी भावनाओं में मदद करें — तीन धीमी साँसें, एक झप्पी, एक शांत कोना। इनका अभ्यास शांत समय में करें, ताकि ज़रूरत पड़ने पर ये तैयार रहें।'],
        empathy: ['दूसरों के बारे में सोचें', '🤝', 'साथ में कुछ पढ़ते या देखते हुए रुकें और पूछें: "तुम्हें क्या लगता है, वे अभी कैसा महसूस कर रहे हैं? क्यों?" इससे किसी और की नज़र से देखने की आदत बनती है।'],
        relationship_skills: ['बारी-बारी वाले खेल खेलें', '🎲', 'बोर्ड गेम, ताश या साथ में कुछ बनाना {n} को इंतज़ार करने, बाँटने और जीत-हार को अच्छे से सँभालने का आसान अभ्यास देते हैं।'],
        metacognition: ['पूछें "तुम्हारे मन में क्या चल रहा था?"', '🌸', 'किसी फ़ैसले या समस्या के बाद पूछें: "तुम्हारे मन में क्या चल रहा था?" या "अगली बार क्या अलग किया जा सकता है?" अपनी सोच को समझने का कौशल बढ़ाने का यह सबसे आसान तरीका है।'],
        critical_thinking: ['पूछें "तुम्हें कैसे पता?"', '🔍', 'जब {n} कोई विचार बताए, प्यार से पूछें "तुम्हें कैसे पता?" या "तुम्हें ऐसा क्यों लगता है?" और उसका तर्क सुनें — सही जवाब ज़रूरी नहीं।'],
        attention: ['एक समय में एक काम', '🎯', 'बिना स्क्रीन के छोटे-छोटे समय तय करें, सिर्फ़ एक गतिविधि के लिए — पहेली, चित्र बनाना, कहानी। धीरे-धीरे समय बढ़ाएँ, और जब {n} ध्यान बनाए रखे, तो बोलकर उसकी तारीफ़ करें।'],
        working_memory: ['दो कदम वाले काम', '🧺', 'आसान दो कदम वाले काम दें — "अपने जूते रखो, फिर अपनी किताब लाओ।" जब {n} इन्हें ठीक से कर ले, तो तीसरा कदम जोड़ें।'],
        cognitive_flexibility: ['"और क्या हो सकता है?" खेलें', '🔄', 'रोज़ की कोई चीज़ चुनें और बारी-बारी से उसके नए इस्तेमाल सोचें। मज़ेदार विचार भी चलेंगे — इससे {n} की सोच बदलती स्थितियों में ढलना सीखती है।'],
        planning: ['बड़े कामों से पहले साथ में योजना बनाएँ', '💜', 'होमवर्क या किसी प्रोजेक्ट से पहले पूछें: "पहला कदम क्या है? उसके बाद क्या?" आपके साथ बोलकर योजना बनाने से ही संगठन के कौशल बढ़ते हैं।'],
        inhibition_distraction: ['ध्यान लगाने की एक जगह बनाएँ', '📚', 'होमवर्क या पढ़ने के लिए टीवी और खिलौनों से दूर एक शांत जगह चुनें। तय जगह होने से {n} के लिए भटकाव से बचना आसान होता है।'],
        inhibition_response: ['रुकने की तारीफ़ करें', '🌿', 'जब {n} प्रतिक्रिया देने से पहले रुके — एक पल के लिए भी — तो उस पर ध्यान दें: "मैंने देखा, तुमने पहले एक साँस ली। यह बहुत समझदारी की बात थी।" छोटे पल बड़ी आदतें बनाते हैं।'],
      },
      ui: { selBtn: 'अभिभावक रिपोर्ट', selTitle: 'विद्यार्थी चुनें और हर एक की PDF रिपोर्ट डाउनलोड करें, अभिभावकों को भेजने के लिए तैयार', selAll: 'सभी चुनें', nSel: '{k} चुने गए', cancel: 'रद्द करें',
        preview: 'पूर्वावलोकन', previewTitle: 'PDF बनाने से पहले रिपोर्ट स्क्रीन पर देखें', dl1: '⬇ PDF डाउनलोड करें', dlN: '⬇ PDF डाउनलोड करें', loading: 'लोड हो रहा है…', preparing: '{n} में से {i} तैयार हो रही है…',
        err: 'PDF नहीं बन सकीं — कनेक्शन जाँचकर फिर कोशिश करें।', pvAria: 'रिपोर्ट का पूर्वावलोकन', pvTitle: 'अभिभावक रिपोर्ट · {name}', pvOf: '{n} में से {i} · ', pvSub: 'इस बच्चे के परिवार को यही मिलेगा',
        prev: '‹ पिछला', next: 'अगला ›', close: 'पूर्वावलोकन बंद करें', file: 'Tilli-रिपोर्ट' },
    },
  }[L];

  var COPY = {
    en: {
      todayTitle: 'Your plan', allDone: 'All done 🎉',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], dayToday: 'Today', dayTasks: '{k} to do', dayLocked: 'Plans open three days ahead',
      rTueCheck: 'Start with a feelings check-in. {n} is calmer on days that start this way.', sTueCheck: 'feelings check-in',
      rTueCards: 'Try numbered picture cards with {n} for word problems', sTueCards: 'picture cards with {n}',
      rTueNote: 'Send a short note home to {n}’s family', sTueNote: 'note to {n}’s family',
      rWedCircle: 'Story steps again with {a}, {b} and 3 others', sWedCircle: 'Story steps',
      rWedCheck: 'Check in with {n} again. Did Monday’s plan help?', sWedCheck: 'check in with {n}',
      rWedNotes: 'Read back this week’s notes before Friday', sWedNotes: 'read back your notes',
      slot: { arrive: 'When they arrive', circle: 'Morning circle', brk: 'Before first break', maths: 'Maths lesson', free: 'Free period', after: 'After school' },
      rArrive: 'Welcome {n} back. New baby brother at home.', sArrive: 'welcome {n} back',
      rCircle: 'Story steps with {a}, {b} and 3 others', sCircle: 'Story steps',
      rBrk: 'Check in with {n}. Settling after break was hard on Thursday.', sBrk: 'check in with {n}',
      rMaths: 'Sit with {n} for the first word problem', sMaths: 'sit with {n} in maths',
      rFree: 'Midline observations · {k} children left', rFreeSub: 'Closes {date} · {d} days left', sFree: 'Midline observations',
      rAfter: 'Photograph {n}’s Friday maths test', sAfter: 'upload {n}’s test',
      mins: '{m} min', actHow: 'How to run it', actGo: 'Continue', actUp: 'Upload', markDone: 'Mark done', markUndo: 'Mark not done',
      mxUrgent: 'Urgent', mxWait: 'Can wait', mxImp: 'Important', mxLess: 'Less important',
      q: { 1: 'Do first', 2: 'Plan it', 3: 'Quick win', 4: 'Later' }, q4empty: 'Nothing here',
      upNext: 'Up next', boxDone: '{d} of {n} done', boxCount: 'tasks: {n}', back: 'Back',
      lEyebrow: 'Developmentally on track by 10', lTitle: 'Welcome to Tilli Measures', lSub: 'Every skill a seed. Watch the whole child grow.',
      lStat1: 'foundational skills, measured from three angles', lStat2: 'a year · 20 minutes a week', lEnter: 'Enter the dashboard',
      continueAs: 'Continue as {name}', welcome: 'Welcome to the Tilli teacher dashboard',
      welcomeSub: '{school} · Grade 3 A · {n} children', demoNote: 'Sample data. What you change stays on this device until you close the tab.',
      langLabel: 'Language',
      fromNote: 'Your note · Thu', fromTilli: 'Tilli noticed', fromParent: 'From a parent',
      upGo: 'Upload sheet',
      passportTab: 'Memory layer',
      remembers: 'What Tilli remembers', memSrc: { note: 'Your note', parent: 'Parent', lastyear: 'Last year’s teacher', tilli: 'Tilli', upload: 'Maths sheet', beh: 'Behaviour note' },
      memLastYear: '“Strongest in {top}. Still building {low}.”', memLastYearWho: '{t}, Grade 2',
      memParent: ['Calm mornings at home; reads with grandparents most evenings.', 'Loves building things. Gets frustrated when a game is lost.', 'Has started helping with cooking. Asks a lot of “why” questions.'],
      memTilli: 'Since Baseline, {skill} grew the most (+{g} points).',
      memCalm1: 'Hard time settling after break; sat apart from the group.', memCalm2: 'Calmer on days that start with a feelings check-in.',
      memMath1: 'Word problems 45%. Gets the first two steps right, then loses track.', memMath2: 'Grade 2: “Quick with sums, slower when instructions are long.”',
      memHome1: 'Absent Wed–Thu. New baby brother at home.',
      when: { thu: 'Thu', lastweek: 'Last week', lastyear: 'Grade 2', midline: 'Midline survey', today: 'Today', sept: 'September' },
      mathTitle: 'Maths · this term',
      mathWhy: '{pct}% on {topic} isn’t only a maths gap. {n}’s {skill} is at {band} level, and that is what {topic} leans on most.',
      sumFocus: 'Focus', sumMaths: 'Maths', sumAvg: '{p}% average', sumLowest: '{topic} {p}%', sumStrong: 'Strongest', sumAtt: 'Attendance', prevT: 'Previous classes', prevTeacher: 'Teacher: {t}', prevOpen: 'See the full history', fortnight: 'This fortnight', mlThisYear: 'This year', addNote: 'Add note', skillsT: 'Skills',
      yearRow: { g1: 'Grade 1', g2: 'Grade 2', g3: 'Grade 3 · now' },
      askAbout: 'Ask Tilli about {n}',
      // upload overlay
      upHead: 'Upload a maths assessment', upFor: 'Whose sheet is this?', upPick: 'Choose a sample sheet', upSample: 'Sample {i}',
      upRead: 'Read the sheet', upCancel: 'Cancel', upSteps: ['Reading the sheet…', 'Marking each answer…', 'Looking for patterns…'],
      upScore: 'Score', upNoticed: 'What Tilli noticed', upLinked: 'Linked skill', upNext: 'Next step', upSave: 'Save to {n}’s memory layer', upSaved: 'Saved to {n}’s memory layer', upAsk: 'Ask Tilli about this', upClose: 'Close',
      sheets: [
        { name: 'Word problems', score: '6/10', marks: [1, 1, 1, 0, 1, 0, 1, 0, 1, 0], noticed: 'Every one-step problem is right. All four misses are 3-step problems: {n} does the first step correctly, then stops or repeats it.', skill: 'working_memory', next: 'Break each problem into numbered steps with a picture card for each. Fade the cards over two weeks.' },
        { name: 'Subtraction with regrouping', score: '7/10', marks: [1, 1, 0, 1, 1, 0, 1, 1, 0, 1], noticed: 'Three misses, all the same slip: {n} subtracts the smaller digit from the bigger one instead of regrouping (52 − 17 = 45).', skill: 'attention', next: 'Have {n} circle any column where the top digit is smaller before starting. One check, every time.' },
        { name: 'Place value', score: '8/10', marks: [1, 1, 1, 1, 0, 1, 1, 0, 1, 1], noticed: 'Strong with tens and ones. Both misses are three-digit numbers with a zero (writes 407 as 47).', skill: 'critical_thinking', next: 'Use place-value cards for numbers with zeros, and say each number aloud while building it.' },
        { name: 'Word problems (photo)', score: '5/5', marks: [1, 1, 1, 1, 1], noticed: 'All five are right (Tilli also marked 4 and 5, which weren’t ticked yet). On 2 and 4, {n} wrote a first answer, spotted it was wrong and fixed it: on 2 they first added (6 + 4) instead of multiplying. That’s real self-checking, and a sign that choosing the operation isn’t automatic yet.', skill: 'metacognition', next: 'Before writing, {n} says the operation and why (“more, less, or groups of?”). Keep the self-checking going: praise it out loud when you see it.' },
      ],
      // ask
      askEmpty: 'Tap a question below. I’ll answer from your class data and what I remember.',
      askDone: 'That’s all the questions for this demo. Explore the other tabs, or open a child’s memory layer.',
      askThinking: 'Thinking…', askThought: 'How I got there ({k} steps)', askStart: 'Start here, or type your own question',
      askPh: 'Ask or tell Tilli…', askSend: 'Send',
      thinkData: 'Looking at {c}’s latest results', thinkPick: 'Picking what matters most this week',
      qFocus: 'What should I focus on this week?', qCheck: 'Who needs a check-in today, and why?', qWhy: 'Why is {n}’s word-problem score low?', qAct: 'Give me a 10-minute working-memory activity',
      sRemember: 'What do you remember about {n}?', sTry: 'What should I try with {n} this week?', sParent: 'What can I tell {n}’s parents?',
      aFocus: 'This week, focus on **{skill}**. {k} of your {N} children are still at Beginner level in it, and it sits behind most of the maths mistakes I’ve seen.\n\nThree things that fit a normal week:\n• Start the day with a 3-step instruction game (2 min)\n• Picture cards for word problems\n• Finish your Midline observations: {left} children left',
      aCheck: '**{a}**: you noted on Thursday that settling after break was hard. Check in before first break.\n**{b}**: back after two days off, with a new baby brother at home. A warm welcome and a small job in class can help.\n**{c}**: word problems at {wp}%. Sit with {c} for the first problem today.',
      aWhy: '{n} gets the first step of a word problem right, then loses track. That pattern points to **working memory** (Beginner), not maths knowledge: {n}’s sums and number sense are at {num}%.\n\nLast year’s teacher noticed the same thing: “quick with sums, slower when instructions are long.”\n\nTry numbered steps with a picture card for each, and fade the cards over two weeks.',
      aAct: '**Story steps (10 min)**\n1. Show 3 picture cards that tell a short story. Children look for 20 seconds.\n2. Turn the cards over. Partners retell the story in order.\n3. Add a 4th card. Retell again.\n4. Finish with: “What helped you remember?”\n\nRun it twice this week. Keep {n} in a pair with a calm partner.',
      aRemember: 'Here’s what I have on **{n}**:\n• Grade 2 teacher: strongest in {top}; still building {low}\n• Since Baseline, {grew} grew the most (+{g} points)\n• Home: {home}\n• Right now {low2} is the skill to tend',
      aTry: 'For {n} this week, aim at **{low}**:\n• Give one instruction at a time and ask {n} to say it back\n• Pair {n} with a classmate at Advanced level in {low}\n• Notice it out loud when it goes well; {n} responds well to specific praise\n\nI’ll remind you to check how it went on Friday.',
      aParent: 'Start with what’s going well: {n} is **{topBand} in {top}**.\n\nThen one thing to practise at home: **{low}**. A 10-minute game: give {n} a 3-step job (“shoes by the door, bag on the hook, water bottle in the kitchen”), then make it 4 steps.\n\nI can turn this into a short note in the family’s language.',
    },
    es: {
      todayTitle: 'Tu plan', allDone: 'Todo hecho 🎉',
      days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'], dayToday: 'Hoy', dayTasks: '{k} tareas', dayLocked: 'Los planes se abren con tres días de antelación',
      rTueCheck: 'Empieza con una ronda de emociones. A {n} le ayuda empezar así el día.', sTueCheck: 'ronda de emociones',
      rTueCards: 'Prueba las tarjetas con pasos numerados con {n} en los problemas', sTueCards: 'tarjetas con {n}',
      rTueNote: 'Manda una nota breve a la familia de {n}', sTueNote: 'nota a la familia de {n}',
      rWedCircle: 'Otra vez pasos de la historia con {a}, {b} y 3 más', sWedCircle: 'pasos de la historia',
      rWedCheck: 'Vuelve a hablar con {n}. ¿Le ayudó lo del lunes?', sWedCheck: 'hablar con {n}',
      rWedNotes: 'Repasa tus notas de la semana antes del viernes', sWedNotes: 'repasar tus notas',
      slot: { arrive: 'Al llegar', circle: 'Asamblea', brk: 'Antes del primer recreo', maths: 'Clase de matemáticas', free: 'Hora libre', after: 'Después de clase' },
      rArrive: 'Da la bienvenida a {n}. Acaba de nacer su hermanito.', sArrive: 'dar la bienvenida a {n}',
      rCircle: 'Pasos de la historia con {a}, {b} y 3 más', sCircle: 'Pasos de la historia',
      rBrk: 'Habla con {n}. El jueves le costó calmarse después del recreo.', sBrk: 'hablar con {n}',
      rMaths: 'Siéntate con {n} en el primer problema', sMaths: 'sentarte con {n} en mates',
      rFree: 'Observaciones intermedias · faltan {k} alumnos', rFreeSub: 'Cierra el {date} · quedan {d} días', sFree: 'observaciones intermedias',
      rAfter: 'Haz una foto al examen de mates de {n} del viernes', sAfter: 'subir el examen de {n}',
      mins: '{m} min', actHow: 'Cómo hacerla', actGo: 'Continuar', actUp: 'Subir', markDone: 'Marcar como hecho', markUndo: 'Marcar como pendiente',
      mxUrgent: 'Urgente', mxWait: 'Puede esperar', mxImp: 'Importante', mxLess: 'Menos importante',
      q: { 1: 'Primero', 2: 'Planifícalo', 3: 'Rápido', 4: 'Más tarde' }, q4empty: 'Nada aquí',
      upNext: 'A continuación', boxDone: '{d} de {n} hechas', boxCount: 'tareas: {n}', back: 'Volver',
      lEyebrow: 'Desarrollo en buen camino a los 10', lTitle: 'Te damos la bienvenida a Tilli Measures', lSub: 'Cada habilidad, una semilla. Mira crecer a cada niño por completo.',
      lStat1: 'habilidades fundamentales, medidas desde tres miradas', lStat2: 'al año · 20 minutos a la semana', lEnter: 'Entrar al panel',
      continueAs: 'Continuar como {name}', welcome: 'Bienvenida al panel de Tilli para docentes',
      welcomeSub: '{school} · 3.º A de Primaria · {n} alumnos', demoNote: 'Datos de ejemplo. Lo que cambies se queda en este dispositivo hasta que cierres la pestaña.',
      langLabel: 'Idioma',
      fromNote: 'Tu nota · jue', fromTilli: 'Tilli ha visto', fromParent: 'De la familia',
      upGo: 'Subir hoja',
      passportTab: 'Capa de memoria',
      remembers: 'Lo que Tilli recuerda', memSrc: { note: 'Tu nota', parent: 'Familia', lastyear: 'Tutora del curso pasado', tilli: 'Tilli', upload: 'Hoja de matemáticas', beh: 'Nota de convivencia' },
      memLastYear: '«Su punto fuerte es {top}. Todavía está trabajando {low}».', memLastYearWho: '{t}, 2.º de Primaria',
      memParent: ['Mañanas tranquilas en casa; lee con sus abuelos casi todas las tardes.', 'Le encanta construir cosas. Se frustra cuando pierde un juego.', 'Ha empezado a ayudar a cocinar. Pregunta muchos «¿por qué?».'],
      memTilli: 'Desde la evaluación inicial, lo que más ha crecido es {skill} (+{g} puntos).',
      memCalm1: 'Le costó calmarse después del recreo; se sentó aparte del grupo.', memCalm2: 'Tiene más calma los días que empiezan con una ronda de emociones.',
      memMath1: 'Problemas: 45 %. Hace bien los dos primeros pasos y luego se pierde.', memMath2: '2.º de Primaria: «Va rápido con las cuentas y más despacio cuando las instrucciones son largas».',
      memHome1: 'Faltó miércoles y jueves. Acaba de nacer su hermanito.',
      when: { thu: 'Jue', lastweek: 'La semana pasada', lastyear: '2.º de Primaria', midline: 'Encuesta intermedia', today: 'Hoy', sept: 'Septiembre' },
      mathTitle: 'Matemáticas · este trimestre',
      mathWhy: 'Un {pct} % en {topic} no es solo cosa de matemáticas. Esa parte depende sobre todo de una habilidad, {skill}, y {n} está en el nivel «{band}» en ella.',
      sumFocus: 'Foco', sumMaths: 'Matemáticas', sumAvg: '{p} % de media', sumLowest: '{topic}: {p} %', sumStrong: 'Su punto fuerte', sumAtt: 'Asistencia', prevT: 'Cursos anteriores', prevTeacher: 'Tutor/a: {t}', prevOpen: 'Ver el historial completo', fortnight: 'Estas dos semanas', mlThisYear: 'Este curso', addNote: 'Añadir nota', skillsT: 'Habilidades',
      yearRow: { g1: '1.º de Primaria', g2: '2.º de Primaria', g3: '3.º de Primaria · ahora' },
      askAbout: 'Pregunta a Tilli por {n}',
      upHead: 'Sube una evaluación de matemáticas', upFor: '¿De quién es esta hoja?', upPick: 'Elige una hoja de ejemplo', upSample: 'Ejemplo {i}',
      upRead: 'Leer la hoja', upCancel: 'Cancelar', upSteps: ['Leyendo la hoja…', 'Corrigiendo cada respuesta…', 'Buscando patrones…'],
      upScore: 'Nota', upNoticed: 'Lo que Tilli ha visto', upLinked: 'Habilidad relacionada', upNext: 'Siguiente paso', upSave: 'Guardar en la capa de memoria de {n}', upSaved: 'Guardado en la capa de memoria de {n}', upAsk: 'Preguntar a Tilli', upClose: 'Cerrar',
      sheets: [
        { name: 'Problemas', score: '6/10', marks: [1, 1, 1, 0, 1, 0, 1, 0, 1, 0], noticed: 'Todos los problemas de un paso están bien. Los cuatro fallos son problemas de 3 pasos: {n} hace bien el primer paso y luego se para o lo repite.', skill: 'working_memory', next: 'Divide cada problema en pasos numerados con una tarjeta para cada uno. Retira las tarjetas poco a poco en dos semanas.' },
        { name: 'Restas llevando', score: '7/10', marks: [1, 1, 0, 1, 1, 0, 1, 1, 0, 1], noticed: 'Tres fallos, siempre el mismo: {n} resta la cifra pequeña de la grande en vez de llevar (52 − 17 = 45).', skill: 'attention', next: 'Antes de empezar, que {n} rodee las columnas donde la cifra de arriba es más pequeña. Una comprobación, siempre.' },
        { name: 'Valor posicional', score: '8/10', marks: [1, 1, 1, 1, 0, 1, 1, 0, 1, 1], noticed: 'Domina decenas y unidades. Los dos fallos son números de tres cifras con un cero (escribe 407 como 47).', skill: 'critical_thinking', next: 'Usa tarjetas de valor posicional con números que llevan cero y que diga el número en voz alta mientras lo forma.' },
        { name: 'Problemas (foto)', score: '5/5', marks: [1, 1, 1, 1, 1], noticed: 'Los cinco están bien (Tilli también corrigió el 4 y el 5, que aún no tenían tic). En el 2 y el 4, {n} se equivocó al calcular (18 + 14 = 22, 45 − 17 = 38), se dio cuenta y lo corrigió solo: revisa su propio trabajo, aunque la suma y la resta con llevada aún no son automáticas.', skill: 'metacognition', next: 'Que {n} compruebe cada resultado con la operación inversa (28 + 17 = 45) antes de pasar al siguiente, y elógiale en voz alta cuando se autocorrija.' },
      ],
      askEmpty: 'Toca una pregunta. Respondo con los datos de tu clase y lo que recuerdo.',
      askDone: 'Esas son todas las preguntas de la demo. Explora las otras pestañas o abre la capa de memoria de un alumno.',
      askThinking: 'Pensando…', askThought: 'Cómo he llegado aquí ({k} pasos)', askStart: 'Empieza aquí o escribe tu propia pregunta',
      askPh: 'Pregunta o cuéntale a Tilli…', askSend: 'Enviar',
      thinkData: 'Mirando los últimos resultados de {c}', thinkPick: 'Eligiendo lo más importante esta semana',
      qFocus: '¿En qué me centro esta semana?', qCheck: '¿Con quién hablo hoy y por qué?', qWhy: '¿Por qué {n} saca poca nota en problemas?', qAct: 'Dame una actividad de 10 minutos para la memoria de trabajo',
      sRemember: '¿Qué recuerdas de {n}?', sTry: '¿Qué pruebo con {n} esta semana?', sParent: '¿Qué le cuento a la familia de {n}?',
      aFocus: 'Esta semana, céntrate en **{skill}**. {k} de tus {N} alumnos siguen en el nivel «Principiante», y está detrás de la mayoría de los errores de matemáticas que he visto.\n\nTres cosas que caben en una semana normal:\n• Empieza el día con un juego de instrucciones de 3 pasos (2 min)\n• Tarjetas con dibujos para los problemas\n• Termina tus observaciones intermedias: faltan {left} alumnos',
      aCheck: '**{a}**: el jueves anotaste que le costó calmarse después del recreo. Habla con {a} antes del primer descanso.\n**{b}**: vuelve tras dos días sin venir y acaba de nacer su hermanito. Una bienvenida cariñosa y un pequeño encargo en clase pueden ayudar.\n**{c}**: {wp} % en problemas. Siéntate con {c} en el primer problema de hoy.',
      aWhy: '{n} hace bien el primer paso de un problema y luego se pierde. Ese patrón apunta a la **memoria de trabajo** (nivel «Principiante»), no a lo que sabe de matemáticas: en cuentas y sentido numérico está en un {num} %.\n\nSu tutora del curso pasado vio lo mismo: «va rápido con las cuentas y más despacio cuando las instrucciones son largas».\n\nPrueba con pasos numerados y una tarjeta para cada uno, y retíralas poco a poco en dos semanas.',
      aAct: '**Pasos de la historia (10 min)**\n1. Enseña 3 tarjetas que cuentan una historia corta. Los niños las miran 20 segundos.\n2. Dales la vuelta. Por parejas, cuentan la historia en orden.\n3. Añade una 4.ª tarjeta. Vuelven a contarla.\n4. Termina con: «¿Qué te ha ayudado a recordar?».\n\nHazla dos veces esta semana. Pon a {n} en pareja con alguien tranquilo.',
      aRemember: 'Esto es lo que tengo de **{n}**:\n• Tutora de 2.º: su punto fuerte es {top}; todavía trabaja {low}\n• Desde la evaluación inicial, {grew} es lo que más ha crecido (+{g} puntos)\n• En casa: {home}\n• Ahora mismo, la habilidad que hay que cuidar es {low2}',
      aTry: 'Con {n} esta semana, trabaja **{low}**:\n• Da una instrucción cada vez y pide a {n} que la repita\n• Siéntale junto a alguien que esté en el nivel «Avanzado» en {low}\n• Dilo en voz alta cuando salga bien; a {n} le funcionan los elogios concretos\n\nEl viernes te recordaré que revises cómo ha ido.',
      aParent: 'Empieza por lo que va bien: {n} está en **«{topBand}» en {top}**.\n\nLuego, una cosa para practicar en casa: **{low}**. Un juego de 10 minutos: dale a {n} un encargo de 3 pasos («zapatos junto a la puerta, mochila en el perchero, botella en la cocina») y después pásalo a 4 pasos.\n\nPuedo convertirlo en una nota breve para la familia.',
    },
    hi: {
      todayTitle: 'आपकी योजना', allDone: 'सब काम पूरा 🎉',
      days: ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र'], dayToday: 'आज', dayTasks: '{k} बाकी', dayLocked: 'योजना तीन दिन पहले खुलती है',
      rTueCheck: 'दिन की शुरुआत भावनाओं वाली बातचीत से करें। ऐसी शुरुआत से {n} को शांत रहने में मदद मिलती है।', sTueCheck: 'भावनाओं वाली बातचीत',
      rTueCards: 'शाब्दिक प्रश्नों के लिए {n} के साथ क्रम वाले चित्र-कार्ड आज़माएँ', sTueCards: '{n} के साथ चित्र-कार्ड',
      rTueNote: '{n} के परिवार को एक छोटा संदेश भेजें', sTueNote: '{n} के परिवार को संदेश',
      rWedCircle: '{a}, {b} और 3 और बच्चों के साथ फिर से कहानी के कदम', sWedCircle: 'कहानी के कदम',
      rWedCheck: '{n} से फिर बात करें। क्या सोमवार की योजना से मदद मिली?', sWedCheck: '{n} से बात',
      rWedNotes: 'शुक्रवार से पहले इस हफ़्ते के नोट्स दोबारा पढ़ें', sWedNotes: 'नोट्स दोबारा पढ़ना',
      slot: { arrive: 'बच्चों के आते ही', circle: 'सुबह की सभा', brk: 'पहले ब्रेक से पहले', maths: 'गणित की कक्षा', free: 'खाली पीरियड', after: 'स्कूल के बाद' },
      rArrive: '{n} का स्वागत करें। घर में छोटा भाई आया है।', sArrive: '{n} का स्वागत',
      rCircle: '{a}, {b} और 3 और बच्चों के साथ कहानी के कदम', sCircle: 'कहानी के कदम',
      rBrk: '{n} से बात करें। गुरुवार को ब्रेक के बाद शांत होना मुश्किल था।', sBrk: '{n} से बात',
      rMaths: 'पहले शाब्दिक प्रश्न पर {n} के साथ बैठें', sMaths: 'गणित में {n} के साथ बैठना',
      rFree: 'मध्य अवलोकन · {k} बच्चे बाकी', rFreeSub: '{date} को बंद · {d} दिन बाकी', sFree: 'मध्य अवलोकन',
      rAfter: '{n} की शुक्रवार वाली गणित परीक्षा की फ़ोटो लें', sAfter: '{n} की परीक्षा अपलोड',
      mins: '{m} मिनट', actHow: 'कैसे कराएँ', actGo: 'जारी रखें', actUp: 'अपलोड', markDone: 'पूरा हुआ', markUndo: 'पूरा नहीं हुआ',
      mxUrgent: 'अभी ज़रूरी', mxWait: 'रुक सकता है', mxImp: 'अहम', mxLess: 'कम अहम',
      q: { 1: 'पहले करें', 2: 'योजना बनाएँ', 3: 'झटपट', 4: 'बाद में' }, q4empty: 'यहाँ कुछ नहीं',
      upNext: 'अगला काम', boxDone: '{n} में से {d} पूरे', boxCount: 'काम: {n}', back: 'वापस',
      lEyebrow: '10 साल की उम्र तक सही विकास', lTitle: 'Tilli Measures में आपका स्वागत है', lSub: 'हर कौशल एक बीज। पूरे बच्चे को बढ़ते देखें।',
      lStat1: 'बुनियादी कौशल, तीन नज़रियों से मापे गए', lStat2: 'साल में · हफ़्ते में 20 मिनट', lEnter: 'डैशबोर्ड में जाएँ',
      continueAs: '{name} के रूप में आगे बढ़ें', welcome: 'Tilli शिक्षक डैशबोर्ड में आपका स्वागत है',
      welcomeSub: '{school} · कक्षा 3 A · {n} बच्चे', demoNote: 'नमूना डेटा। आप जो बदलेंगे, वह टैब बंद करने तक इसी डिवाइस पर रहेगा।',
      langLabel: 'भाषा',
      fromNote: 'आपका नोट · गुरु', fromTilli: 'Tilli ने देखा', fromParent: 'अभिभावक से',
      upGo: 'शीट अपलोड करें',
      passportTab: 'मेमोरी लेयर',
      remembers: 'Tilli को क्या याद है', memSrc: { note: 'आपका नोट', parent: 'अभिभावक', lastyear: 'पिछले साल के शिक्षक', tilli: 'Tilli', upload: 'गणित शीट', beh: 'व्यवहार नोट' },
      memLastYear: '“सबसे मज़बूत: {top}। अभी सीख रहे हैं: {low}।”', memLastYearWho: '{t}, कक्षा 2',
      memParent: ['घर पर सुबह शांत रहती है; ज़्यादातर शाम दादा-दादी के साथ पढ़ते हैं।', 'चीज़ें बनाना बहुत पसंद है। खेल हारने पर झुंझला जाते हैं।', 'खाना बनाने में मदद करने लगे हैं। बहुत “क्यों” पूछते हैं।'],
      memTilli: 'आरंभिक आकलन के बाद सबसे ज़्यादा बढ़त {skill} में (+{g} अंक)।',
      memCalm1: 'ब्रेक के बाद शांत होने में मुश्किल; समूह से अलग बैठे।', memCalm2: 'जिन दिनों की शुरुआत भावनाओं की बातचीत से होती है, उन दिनों ज़्यादा शांत।',
      memMath1: 'शाब्दिक प्रश्न 45%। पहले दो कदम सही, फिर भूल जाते हैं।', memMath2: 'कक्षा 2: “जोड़-घटाव में तेज़, लंबे निर्देशों में धीमे।”',
      memHome1: 'बुधवार–गुरुवार अनुपस्थित। घर में छोटा भाई आया है।',
      when: { thu: 'गुरु', lastweek: 'पिछला हफ़्ता', lastyear: 'कक्षा 2', midline: 'मध्य सर्वे', today: 'आज', sept: 'सितंबर' },
      mathTitle: 'गणित · इस सत्र',
      mathWhy: '{topic} में {pct}% सिर्फ़ गणित की कमी नहीं है। {n} की {skill} “{band}” स्तर पर है, और {topic} सबसे ज़्यादा इसी पर टिका है।',
      sumFocus: 'फ़ोकस', sumMaths: 'गणित', sumAvg: 'औसत {p}%', sumLowest: '{topic} {p}%', sumStrong: 'सबसे मज़बूत', sumAtt: 'उपस्थिति', prevT: 'पिछली कक्षाएँ', prevTeacher: 'शिक्षक: {t}', prevOpen: 'पूरा इतिहास देखें', fortnight: 'ये दो हफ़्ते', mlThisYear: 'इस साल', addNote: 'नोट जोड़ें', skillsT: 'कौशल',
      yearRow: { g1: 'कक्षा 1', g2: 'कक्षा 2', g3: 'कक्षा 3 · अभी' },
      askAbout: '{n} के बारे में Tilli से पूछें',
      upHead: 'गणित का आकलन अपलोड करें', upFor: 'यह शीट किसकी है?', upPick: 'एक नमूना शीट चुनें', upSample: 'नमूना {i}',
      upRead: 'शीट पढ़ें', upCancel: 'रद्द करें', upSteps: ['शीट पढ़ी जा रही है…', 'हर उत्तर जाँचा जा रहा है…', 'पैटर्न खोजे जा रहे हैं…'],
      upScore: 'अंक', upNoticed: 'Tilli ने क्या देखा', upLinked: 'जुड़ा हुआ कौशल', upNext: 'अगला कदम', upSave: '{n} की मेमोरी लेयर में सेव करें', upSaved: '{n} की मेमोरी लेयर में सेव हो गया', upAsk: 'इसके बारे में Tilli से पूछें', upClose: 'बंद करें',
      sheets: [
        { name: 'शाब्दिक प्रश्न', score: '6/10', marks: [1, 1, 1, 0, 1, 0, 1, 0, 1, 0], noticed: 'एक कदम वाले सभी प्रश्न सही हैं। चारों गलतियाँ 3 कदम वाले प्रश्नों में हैं: {n} पहला कदम सही करते हैं, फिर रुक जाते हैं या उसे दोहराते हैं।', skill: 'working_memory', next: 'हर प्रश्न को क्रमांकित कदमों में बाँटें, हर कदम के लिए एक चित्र कार्ड। दो हफ़्तों में कार्ड धीरे-धीरे हटाएँ।' },
        { name: 'हासिल वाला घटाव', score: '7/10', marks: [1, 1, 0, 1, 1, 0, 1, 1, 0, 1], noticed: 'तीन गलतियाँ, तीनों एक जैसी: {n} हासिल लेने के बजाय बड़े अंक में से छोटा अंक घटा देते हैं (52 − 17 = 45)।', skill: 'attention', next: 'शुरू करने से पहले {n} उन कॉलम पर गोला लगाएँ जहाँ ऊपर का अंक छोटा है। हर बार एक जाँच।' },
        { name: 'स्थानीय मान', score: '8/10', marks: [1, 1, 1, 1, 0, 1, 1, 0, 1, 1], noticed: 'दहाई और इकाई में मज़बूत। दोनों गलतियाँ शून्य वाली तीन अंकों की संख्याओं में हैं (407 को 47 लिखते हैं)।', skill: 'critical_thinking', next: 'शून्य वाली संख्याओं के लिए स्थानीय मान कार्ड इस्तेमाल करें, और संख्या बनाते समय उसे ज़ोर से बोलने को कहें।' },
        { name: 'शाब्दिक प्रश्न (फ़ोटो)', score: '5/5', marks: [1, 1, 1, 1, 1], noticed: 'पाँचों उत्तर सही हैं (Tilli ने 4 और 5 भी जाँचे, जिन पर अभी टिक नहीं था)। 2 और 4 में {n} ने पहला उत्तर लिखा, गलती पहचानी और खुद सुधारा: 2 में पहले गुणा की जगह जोड़ा (6 + 4)। यह खुद की जाँच है, और संकेत है कि सही संक्रिया चुनना अभी अपने-आप नहीं होता।', skill: 'metacognition', next: 'लिखने से पहले {n} बताए कि कौन-सी संक्रिया और क्यों (“ज़्यादा, कम, या समूह?”)। खुद की जाँच की आदत बनाए रखें: दिखे तो ज़ोर से तारीफ़ करें।' },
      ],
      askEmpty: 'नीचे कोई सवाल चुनें। मैं आपकी कक्षा के डेटा और अपनी याद के आधार पर जवाब दूँगा।',
      askDone: 'इस डेमो के सारे सवाल हो गए। दूसरे टैब देखें या किसी बच्चे की मेमोरी लेयर खोलें।',
      askThinking: 'सोच रहा हूँ…', askThought: 'मैं यहाँ कैसे पहुँचा ({k} कदम)', askStart: 'यहाँ से शुरू करें',
      askPh: 'Tilli से पूछें…', askSend: 'भेजें',
      thinkData: '{c} के ताज़ा नतीजे देख रहा हूँ', thinkPick: 'इस हफ़्ते सबसे ज़रूरी बात चुन रहा हूँ',
      qFocus: 'इस हफ़्ते मैं किस पर ध्यान दूँ?', qCheck: 'आज मुझे किससे बात करनी चाहिए, और क्यों?', qWhy: '{n} के शाब्दिक प्रश्नों में अंक कम क्यों हैं?', qAct: 'कार्यशील स्मृति के लिए 10 मिनट की गतिविधि बताइए',
      sRemember: 'आपको {n} के बारे में क्या याद है?', sTry: 'इस हफ़्ते {n} के साथ क्या आज़माऊँ?', sParent: '{n} के माता-पिता को क्या बताऊँ?',
      aFocus: 'इस हफ़्ते **{skill}** पर ध्यान दें। आपके {N} में से {k} बच्चे इसमें अभी “शुरुआती” स्तर पर हैं, और गणित की ज़्यादातर गलतियों के पीछे यही है।\n\nसामान्य हफ़्ते में ये तीन चीज़ें आसानी से हो सकती हैं:\n• दिन की शुरुआत 3 कदम वाले निर्देश के खेल से (2 मिनट)\n• शाब्दिक प्रश्नों के लिए चित्र कार्ड\n• अपने मध्य आकलन पूरे करें: {left} बच्चे बाकी',
      aCheck: '**{a}**: गुरुवार को आपने लिखा था कि ब्रेक के बाद शांत होना मुश्किल था। पहले ब्रेक से पहले {a} से बात करें।\n**{b}**: दो दिन बाद लौटे हैं, और घर में छोटा भाई आया है। गर्मजोशी से स्वागत और कक्षा में कोई छोटा काम मदद कर सकता है।\n**{c}**: शाब्दिक प्रश्नों में {wp}%। आज पहले प्रश्न पर {c} के साथ बैठें।',
      aWhy: '{n} शाब्दिक प्रश्न का पहला कदम सही करते हैं, फिर भूल जाते हैं। यह पैटर्न **कार्यशील स्मृति** (“शुरुआती”) की ओर इशारा करता है, गणित की समझ की ओर नहीं: जोड़-घटाव और संख्या की समझ में {num}% है।\n\nपिछले साल के शिक्षक ने भी यही देखा था: “जोड़-घटाव में तेज़, लंबे निर्देशों में धीमे।”\n\nक्रमांकित कदम और हर कदम के लिए एक चित्र कार्ड आज़माएँ, और दो हफ़्तों में कार्ड धीरे-धीरे हटाएँ।',
      aAct: '**कहानी के कदम (10 मिनट)**\n1. एक छोटी कहानी बताने वाले 3 चित्र कार्ड दिखाएँ। बच्चे 20 सेकंड देखें।\n2. कार्ड पलट दें। जोड़ियों में बच्चे कहानी क्रम से सुनाएँ।\n3. चौथा कार्ड जोड़ें। फिर से सुनाएँ।\n4. अंत में पूछें: “याद रखने में किस चीज़ ने मदद की?”\n\nइस हफ़्ते दो बार कराएँ। {n} को किसी शांत साथी के साथ रखें।',
      aRemember: '**{n}** के बारे में मेरे पास यह है:\n• कक्षा 2 के शिक्षक: सबसे मज़बूत {top}; अभी सीख रहे हैं {low}\n• आरंभिक आकलन के बाद सबसे ज़्यादा बढ़त {grew} में (+{g} अंक)\n• घर: {home}\n• अभी ध्यान देने वाला कौशल: {low2}',
      aTry: 'इस हफ़्ते {n} के साथ **{low}** पर काम करें:\n• एक बार में एक निर्देश दें और {n} से उसे दोहराने को कहें\n• {n} को किसी ऐसे साथी के साथ बैठाएँ जो {low} में “उन्नत” स्तर पर हो\n• अच्छा होने पर ज़ोर से तारीफ़ करें; {n} पर साफ़-साफ़ तारीफ़ का अच्छा असर होता है\n\nशुक्रवार को मैं आपको याद दिलाऊँगा कि यह कैसा रहा, देख लें।',
      aParent: 'जो अच्छा चल रहा है, उससे शुरू करें: {n} **{top} में “{topBand}”** स्तर पर हैं।\n\nफिर घर पर अभ्यास के लिए एक चीज़: **{low}**। 10 मिनट का खेल: {n} को 3 कदम का काम दें (“जूते दरवाज़े के पास, बस्ता खूँटी पर, पानी की बोतल रसोई में”), फिर इसे 4 कदम का करें।\n\nमैं इसे परिवार के लिए एक छोटे संदेश में बदल सकता हूँ।',
    },
  };
  // ---------- copy, part 2: memory-layer additions (notes, evidence, 14-day plan, ownership, school data) ----------
  var SK_KEYS = ['emotion_awareness', 'emotion_regulation', 'empathy', 'relationship_skills', 'metacognition', 'critical_thinking', 'working_memory', 'planning', 'cognitive_flexibility', 'inhibition_distraction', 'inhibition_response', 'attention'];
  function bySkill(list) { var o = {}; SK_KEYS.forEach(function (k, i) { o[k] = list[i]; }); return o; }
  var COPY2 = {
    en: {
      fromTilli: 'Ask Tilli noticed', memSrcTilli: 'Ask Tilli', cls: 'Grade 3 A',
      micLabel: 'Speak your note', micStop: 'Stop listening', micListening: 'Listening… speak now', micBlocked: 'Microphone not available. You can type instead.', micDemo: 'Voice typing isn’t available here, so here’s an example.', micSample: '{n} settled much better after break today.',
      noteTitle: 'Tell Tilli something to remember', notePrimePh: 'Tell Tilli something to remember about a child. Start with their name…', noteWho: 'Who is this about? Tap their name, or type it.', notePh: 'e.g. {n} found it hard to focus after lunch today', noteFor: 'About', noteSave: 'Save note',
      notePrivate: 'Only you can see your notes. Families, coordinators and next year’s teacher can’t.', noteNow: 'Just now', privateTag: 'Private',
      noteAck: 'Got it. I’ll remember that about {n} and bring it up when it matters.', noteSaved: 'Saved to {n}’s memory layer',
      sOkay: 'Is {n} doing okay overall?',
      aOkay: '**Short answer: {n} {verdict}.** Across the 12 skills {n} is at {band} level, strongest in {top}.\n\nOne thing to watch, not worry about: **{low}** is still at {lowBand} level. The 14-day plan is working on it (day {d} of 14).\n\nWhat you could tell a parent: “{n} is growing well. We’re giving {low} a little extra practice this term.”',
      verdict: { Advanced: 'is doing really well', Learner: 'is doing fine', Beginner: 'needs a little extra support right now' },
      evSrc: 'From: your observation · the parent survey · {game}', evAgree: 'You, home and the game agree.', evMore: '{hi} shows it more than {lo}.',
      views: { you: 'Your observation', home: 'Home', game: 'The game' }, tryClass: 'Try in class:',
      plan14: '14-day plan · {skill}', planDay: 'Day {d} of 14', planTonight: 'Tonight at home · 10 min', planStreak: '{k}-day streak at home', planClass: 'In class this week',
      planCheck: 'Friday: check how it went with Ask Tilli',
      // Learning passport PDF (Download passport, student header). Parent-facing, like the website's passport.
      ppDl: 'Download passport', ppBusy: 'Preparing…', ppErr: 'Couldn’t make the PDF. Try again.', ppFile: 'learning-passport',
      ppEyebrow: 'Tilli parent portal', ppTitle: '{n}’s learning passport', ppOwned: 'Owned by the family · follows {n}, not the school',
      ppDip: '{topic} is {n}’s lowest maths topic', ppNext: 'Next skills check-in', ppOwnT: 'You own {n}’s record',
      ppOwnBody: 'Follows {n} to the next grade and the next school. Every share needs your approval.',
      ppSkills: '12 foundational skills', ppMeasured: 'Measured by Tilli · Midline', ppSrc: 'Teacher · family survey · {game}',
      ppViews: { you: 'School', home: 'Home', game: 'The game' }, ppAgree: 'School, home and the game agree.', ppMore: '{hi} shows it more than {lo}.',
      ppTryHome: 'Try at home:', ppMoreSk: '+ {k} more · each combines {n}’s game, the teacher’s observation and your survey',
      ppSynced: 'Synced from school', ppOverall: '{s} · {g} overall', ppMathSrc: 'From this term’s unit tests, marked by Tilli',
      ppLowBody: 'This lines up with {n}’s {skill}, which is at {band} level right now. Practising that skill helps the maths too.',
      ppLinked: 'Linked to {n}’s {skill} · Skills', ppFoot: 'Made with Tilli · {date}',
      ownTitle: 'Owned by {n}’s family', ownBody: 'Follows {n} to the next grade and the next school. The family approves every share. Your private notes are not part of it.',
      ownItems: ['Transfer to a new school', 'Export the record (PDF)', 'Connect an AI tutor'], ownBy: 'Managed by the family in the Tilli parent app',
      sdSync: 'Synced from the school system · read-only',
      att: 'Attendance', attLine: '{p}% this term · {d} days absent', attLine1: '{p}% this term · {d} day absent', attRecent: 'Absent Wed–Thu last week',
      subjects: 'Subjects', subj: { english: 'English', maths: 'Maths', science: 'Science', reading: 'Reading', writing: 'Writing', comp: 'Comprehension', living: 'Living things', materials: 'Materials' },
      weekly: 'Weekly assessments', weeklyItems: ['Spelling test', 'Maths quiz', 'Reading check', 'Science quiz'], weekLbl: 'Week {w}',
      behaviour: 'Behaviour notes', thisweek: 'This week',
      beh: ['Helped a classmate tidy up after art.', 'Shared materials without being asked.', 'Needed a reminder to wait for a turn.', 'Led the line calmly after lunch.', 'Was upset after a game; settled with support.', 'Took care of the class plant this week.'],
      portfolio: 'Portfolio', port: ['Story: “My best day”', 'Science model: the water cycle', 'Art: self-portrait', 'Maths: shape hunt photos', 'Poem: “Rain”', 'Project: my family tree'],
      game: bySkill(['emotion matching game', 'tricky situations stories', 'friend’s feelings stories', 'playground choices game', 'how-did-I-do check', 'odd-one-out puzzles', 'pattern-recall game', 'pack-the-bag game', 'sort-and-switch game', 'busy-screen game', 'hearts & flowers game', 'spot-the-star game']),
      tipClass: bySkill(['Start the day with a 30-second feelings check-in.', 'Offer a calm-down corner and practise “name it to tame it”.', 'After a story, ask “how do you think they felt?”', 'Pair with a kind buddy for group work.', 'End tasks with “what was tricky, and what helped?”', 'Ask for one reason: “How do you know?”', 'Give one instruction at a time; ask for it to be said back.', 'Use a first–then card for multi-step work.', 'Warn before switching: “Two minutes, then we change.”', 'Seat away from the door and the window.', 'Practise “stop, think, go” before answering.', 'Break work into 5-minute chunks with a tick list.']),
      tipHome: bySkill(['Name the feelings of characters in a bedtime story.', 'Practise three slow “balloon breaths” together.', 'Talk about how someone in the family felt today.', 'Play a turn-taking board game.', 'Ask “what was hard today, and what did you try?”', 'Play “would you rather” and give reasons.', 'The two-step instructions game: “shoes away, then water bottle”.', 'Pack tomorrow’s school bag together, step by step.', 'Play “Simon says” with the rules switched halfway.', 'Do one puzzle with the TV off.', 'Play “red light, green light”.', 'Do a 5-minute spot-the-difference.']),
    },
    es: {
      fromTilli: 'Lo detectó Tilli', memSrcTilli: 'Pregunta a Tilli', cls: '3.º A',
      micLabel: 'Dicta tu nota', micStop: 'Dejar de escuchar', micListening: 'Escuchando… habla ahora', micBlocked: 'El micrófono no está disponible. Puedes escribirla.', micDemo: 'El dictado no está disponible aquí; este es un ejemplo.', micSample: 'Hoy {n} se ha calmado mucho mejor después del recreo.',
      noteTitle: 'Cuéntale a Tilli algo para recordar', notePrimePh: 'Cuéntale a Tilli algo para recordar sobre un alumno. Empieza por su nombre…', noteWho: '¿Sobre quién es? Toca su nombre o escríbelo.', notePh: 'p. ej.: hoy a {n} le ha costado concentrarse después de comer', noteFor: 'Sobre', noteSave: 'Guardar nota',
      notePrivate: 'Solo tú ves tus notas. Ni las familias, ni la coordinación, ni el docente del curso que viene.', noteNow: 'Ahora', privateTag: 'Privada',
      noteAck: 'Entendido. Lo recordaré sobre {n} y te lo diré cuando importe.', noteSaved: 'Guardado en la capa de memoria de {n}',
      sOkay: '¿{n} va bien en general?',
      aOkay: '**En pocas palabras: {n} {verdict}.** En las 12 habilidades está en el nivel «{band}», y su punto fuerte es {top}.\n\nAlgo para vigilar, no para preocuparse: **{low}** sigue en el nivel «{lowBand}». El plan de 14 días lo está trabajando (día {d} de 14).\n\nLo que puedes decir a la familia: «{n} está creciendo bien. Este trimestre estamos practicando un poco más {low}».',
      verdict: { Advanced: 'va muy bien', Learner: 'va bien', Beginner: 'necesita un poco más de apoyo ahora mismo' },
      evSrc: 'De: tu observación · la encuesta de la familia · {game}', evAgree: 'Tu observación, la familia y el juego coinciden.', evMore: 'Se ve más en {hi} que en {lo}.',
      views: { you: 'tu observación', home: 'casa', game: 'el juego' }, tryClass: 'Prueba en clase:',
      plan14: 'Plan de 14 días · {skill}', planDay: 'Día {d} de 14', planTonight: 'Esta noche en casa · 10 min', planStreak: '{k} días seguidos en casa', planClass: 'En clase esta semana',
      planCheck: 'Viernes: revisa con Tilli cómo ha ido',
      ppDl: 'Descargar pasaporte', ppBusy: 'Preparando…', ppErr: 'No se ha podido crear el PDF. Inténtalo de nuevo.', ppFile: 'pasaporte-de-aprendizaje',
      ppEyebrow: 'Portal de familias de Tilli', ppTitle: 'Pasaporte de aprendizaje de {n}', ppOwned: 'Es de la familia · acompaña a {n}, no al colegio',
      ppDip: '{topic}: el tema de matemáticas más bajo de {n}', ppNext: 'Próxima revisión de habilidades', ppOwnT: 'El registro de {n} es tuyo',
      ppOwnBody: 'Acompaña a {n} al siguiente curso y al siguiente colegio. Cada vez que se comparte, necesita tu permiso.',
      ppSkills: '12 habilidades fundamentales', ppMeasured: 'Medido por Tilli · Evaluación intermedia', ppSrc: 'Docente · encuesta de la familia · {game}',
      ppViews: { you: 'el colegio', home: 'casa', game: 'el juego' }, ppAgree: 'El colegio, la familia y el juego coinciden.', ppMore: 'Se ve más en {hi} que en {lo}.',
      ppTryHome: 'Prueba en casa:', ppMoreSk: '+ {k} más · cada una combina el juego de {n}, la observación del docente y tu encuesta',
      ppSynced: 'Sincronizado con el colegio', ppOverall: '{s} · {g} en conjunto', ppMathSrc: 'De los controles de este trimestre, corregidos por Tilli',
      ppLowBody: 'Coincide con {skill} de {n}, que ahora está en el nivel «{band}». Practicar esa habilidad también ayuda en matemáticas.',
      ppLinked: 'Relacionado con {skill} de {n} · Habilidades', ppFoot: 'Hecho con Tilli · {date}',
      ownTitle: 'Es de la familia de {n}', ownBody: 'Acompaña a {n} al siguiente curso y al siguiente colegio. La familia aprueba cada vez que se comparte. Tus notas privadas no forman parte de él.',
      ownItems: ['Pasar a un nuevo colegio', 'Exportar el registro (PDF)', 'Conectar un tutor de IA'], ownBy: 'Lo gestiona la familia en la app de Tilli para familias',
      sdSync: 'Sincronizado con el sistema del colegio · solo lectura',
      att: 'Asistencia', attLine: '{p} % este trimestre · {d} días de ausencia', attLine1: '{p} % este trimestre · {d} día de ausencia', attRecent: 'Faltó miércoles y jueves la semana pasada',
      subjects: 'Asignaturas', subj: { english: 'Lengua', maths: 'Matemáticas', science: 'Ciencias', reading: 'Lectura', writing: 'Escritura', comp: 'Comprensión', living: 'Seres vivos', materials: 'Materiales' },
      weekly: 'Evaluaciones semanales', weeklyItems: ['Dictado', 'Prueba de mates', 'Lectura', 'Prueba de ciencias'], weekLbl: 'Semana {w}',
      behaviour: 'Notas de convivencia', thisweek: 'Esta semana',
      beh: ['Ayudó a recoger a un compañero después de plástica.', 'Compartió el material sin que se lo pidieran.', 'Necesitó un recordatorio para esperar su turno.', 'Encabezó la fila con calma después de comer.', 'Se disgustó tras un juego; se calmó con ayuda.', 'Cuidó la planta de la clase esta semana.'],
      portfolio: 'Portafolio', port: ['Cuento: «Mi mejor día»', 'Maqueta: el ciclo del agua', 'Plástica: autorretrato', 'Mates: fotos de la caza de formas', 'Poema: «La lluvia»', 'Proyecto: mi árbol familiar'],
      game: bySkill(['juego de emparejar emociones', 'cuentos de situaciones difíciles', 'cuentos de lo que siente un amigo', 'juego de decisiones en el patio', 'repaso de cómo lo hice', 'acertijos del intruso', 'juego de recordar patrones', 'juego de preparar la mochila', 'juego de clasificar y cambiar', 'juego de pantalla con distracciones', 'juego de corazones y flores', 'juego de encontrar la estrella']),
      tipClass: bySkill(['Empieza el día con una ronda de emociones de 30 segundos.', 'Ofrece un rincón de la calma y practica «ponle nombre para calmarlo».', 'Después de un cuento, pregunta «¿cómo crees que se sintió?».', 'Para el trabajo en grupo, busca una pareja amable.', 'Termina las tareas con «¿qué ha sido difícil y qué te ha ayudado?».', 'Pide un motivo: «¿Cómo lo sabes?».', 'Da una instrucción cada vez y pide que la repita.', 'Usa una tarjeta de «primero–después» para las tareas de varios pasos.', 'Avisa antes de cambiar: «Dos minutos y cambiamos».', 'Sitúa su mesa lejos de la puerta y de la ventana.', 'Practicad «para, piensa, actúa» antes de responder.', 'Divide el trabajo en bloques de 5 minutos con una lista para marcar.']),
      tipHome: bySkill(['Poned nombre a lo que sienten los personajes del cuento de la noche.', 'Practicad juntos tres «respiraciones de globo» lentas.', 'Hablad de cómo se ha sentido hoy alguien de la familia.', 'Jugad a un juego de mesa por turnos.', 'Preguntad «¿qué ha sido difícil hoy y qué has probado?».', 'Jugad a «¿qué prefieres?» y dad razones.', 'El juego de instrucciones de dos pasos: «zapatos a su sitio y luego la botella».', 'Preparad juntos la mochila de mañana, paso a paso.', 'Jugad a «Simón dice» cambiando las reglas a mitad.', 'Haced un puzle con la tele apagada.', 'Jugad a «luz roja, luz verde».', 'Haced un juego de las diferencias de 5 minutos.']),
    },
    hi: {
      fromTilli: 'Tilli ने पहचाना', memSrcTilli: 'Tilli से पूछें', cls: 'कक्षा 3 A',
      micLabel: 'नोट बोलकर लिखें', micStop: 'सुनना बंद करें', micListening: 'सुन रहा है… अब बोलें', micBlocked: 'माइक्रोफ़ोन उपलब्ध नहीं है। आप टाइप कर सकते हैं।', micDemo: 'यहाँ बोलकर लिखना उपलब्ध नहीं है, इसलिए एक उदाहरण दिया गया है।', micSample: 'आज ब्रेक के बाद {n} काफ़ी जल्दी शांत हो गए।',
      noteTitle: 'Tilli को कुछ याद रखने के लिए बताएँ', notePh: 'जैसे: आज लंच के बाद {n} का मन नहीं लग रहा था', noteFor: 'किसके बारे में', noteSave: 'नोट सेव करें',
      notePrivate: 'आपके नोट सिर्फ़ आप देख सकते हैं। अभिभावक, कोऑर्डिनेटर और अगले साल के शिक्षक नहीं।', noteNow: 'अभी', privateTag: 'निजी',
      noteAck: 'ठीक है। मैं {n} के बारे में यह याद रखूँगा और ज़रूरत पड़ने पर बताऊँगा।', noteSaved: '{n} की मेमोरी लेयर में सेव हो गया',
      sOkay: 'क्या {n} कुल मिलाकर ठीक चल रहे हैं?',
      aOkay: '**संक्षेप में: {n} {verdict}।** 12 कौशलों में कुल मिलाकर “{band}” स्तर पर, और सबसे मज़बूत {top} में।\n\nध्यान रखने वाली बात, चिंता की नहीं: **{low}** अभी “{lowBand}” स्तर पर है। 14 दिन की योजना इसी पर काम कर रही है (दिन {d} / 14)।\n\nअभिभावक से आप कह सकते हैं: “{n} अच्छी तरह बढ़ रहे हैं। इस सत्र हम {low} का थोड़ा ज़्यादा अभ्यास करा रहे हैं।”',
      verdict: { Advanced: 'बहुत अच्छा कर रहे हैं', Learner: 'ठीक चल रहे हैं', Beginner: 'को अभी थोड़ी ज़्यादा मदद चाहिए' },
      evSrc: 'स्रोत: आपका अवलोकन · अभिभावक सर्वे · {game}', evAgree: 'आपका अवलोकन, घर और खेल — तीनों एक जैसा दिखाते हैं।', evMore: '{hi} में यह {lo} से ज़्यादा दिखता है।',
      views: { you: 'आपके अवलोकन', home: 'घर', game: 'खेल' }, tryClass: 'कक्षा में आज़माएँ:',
      plan14: '14 दिन की योजना · {skill}', planDay: 'दिन {d} / 14', planTonight: 'आज रात घर पर · 10 मिनट', planStreak: 'घर पर लगातार {k} दिन', planClass: 'इस हफ़्ते कक्षा में',
      planCheck: 'शुक्रवार: Tilli के साथ देखें कि कैसा रहा',
      ppDl: 'पासपोर्ट डाउनलोड करें', ppBusy: 'तैयार हो रहा है…', ppErr: 'PDF नहीं बन पाया। फिर से कोशिश करें।', ppFile: 'learning-passport',
      ppEyebrow: 'Tilli अभिभावक पोर्टल', ppTitle: '{n} का लर्निंग पासपोर्ट', ppOwned: 'परिवार का · {n} के साथ चलता है, स्कूल के साथ नहीं',
      ppDip: '{topic} {n} का सबसे कमज़ोर गणित विषय है', ppNext: 'अगली कौशल जाँच', ppOwnT: '{n} का रिकॉर्ड आपका है',
      ppOwnBody: 'यह अगली कक्षा और अगले स्कूल तक {n} के साथ जाता है। हर बार शेयर करने के लिए आपकी अनुमति चाहिए।',
      ppSkills: '12 बुनियादी कौशल', ppMeasured: 'Tilli द्वारा मापा गया · मध्य आकलन', ppSrc: 'शिक्षक · परिवार का सर्वे · {game}',
      ppViews: { you: 'स्कूल', home: 'घर', game: 'खेल' }, ppAgree: 'स्कूल, घर और खेल — तीनों एक जैसा बताते हैं।', ppMore: '{hi} में यह {lo} से ज़्यादा दिखता है।',
      ppTryHome: 'घर पर आज़माएँ:', ppMoreSk: '+ {k} और · हर एक में {n} का खेल, शिक्षक का अवलोकन और आपका सर्वे शामिल है',
      ppSynced: 'स्कूल से सिंक', ppOverall: '{s} · कुल {g}', ppMathSrc: 'इस टर्म के यूनिट टेस्ट से, Tilli द्वारा जाँचा गया',
      ppLowBody: 'यह {n} की {skill} से मेल खाता है, जो अभी “{band}” स्तर पर है। इस कौशल का अभ्यास गणित में भी मदद करता है।',
      ppLinked: '{n} की {skill} से जुड़ा · कौशल', ppFoot: 'Tilli के साथ बनाया गया · {date}',
      ownTitle: 'यह {n} के परिवार का है', ownBody: 'यह अगली कक्षा और अगले स्कूल तक {n} के साथ जाता है। हर बार साझा करने से पहले परिवार मंज़ूरी देता है। आपके निजी नोट इसका हिस्सा नहीं हैं।',
      ownItems: ['नए स्कूल में भेजें', 'रिकॉर्ड एक्सपोर्ट करें (PDF)', 'AI ट्यूटर से जोड़ें'], ownBy: 'परिवार इसे Tilli पैरेंट ऐप में संभालता है',
      sdSync: 'स्कूल सिस्टम से सिंक · सिर्फ़ देखने के लिए',
      att: 'उपस्थिति', attLine: 'इस सत्र {p}% · {d} दिन अनुपस्थित', attRecent: 'पिछले हफ़्ते बुध–गुरु अनुपस्थित',
      subjects: 'विषय', subj: { english: 'अंग्रेज़ी', maths: 'गणित', science: 'विज्ञान', reading: 'पढ़ना', writing: 'लिखना', comp: 'समझ', living: 'सजीव', materials: 'पदार्थ' },
      weekly: 'साप्ताहिक आकलन', weeklyItems: ['वर्तनी परीक्षा', 'गणित क्विज़', 'पढ़ने की जाँच', 'विज्ञान क्विज़'], weekLbl: 'हफ़्ता {w}',
      behaviour: 'व्यवहार नोट्स', thisweek: 'इस हफ़्ते',
      beh: ['आर्ट के बाद साथी की सफ़ाई में मदद की।', 'बिना कहे सामान साझा किया।', 'बारी का इंतज़ार करने के लिए याद दिलाना पड़ा।', 'लंच के बाद शांति से लाइन का नेतृत्व किया।', 'खेल के बाद परेशान हुए; मदद से शांत हुए।', 'इस हफ़्ते कक्षा के पौधे की देखभाल की।'],
      portfolio: 'पोर्टफ़ोलियो', port: ['कहानी: “मेरा सबसे अच्छा दिन”', 'विज्ञान मॉडल: जल चक्र', 'कला: अपना चित्र', 'गणित: आकार खोज की फ़ोटो', 'कविता: “बारिश”', 'प्रोजेक्ट: मेरा परिवार वृक्ष'],
      game: bySkill(['भावना मिलान खेल', 'मुश्किल हालात की कहानियाँ', 'दोस्त की भावनाओं की कहानियाँ', 'खेल के मैदान के फ़ैसलों का खेल', 'मैंने कैसे किया जाँच', 'अलग कौन पहेलियाँ', 'पैटर्न याद करने का खेल', 'बस्ता तैयार करने का खेल', 'छाँटो-बदलो खेल', 'भीड़ भरी स्क्रीन का खेल', 'दिल और फूल खेल', 'तारा खोजो खेल']),
      tipClass: bySkill(['दिन की शुरुआत 30 सेकंड की भावनाओं वाली बातचीत से करें।', 'शांत होने का कोना दें और “नाम दें, शांत करें” का अभ्यास कराएँ।', 'कहानी के बाद पूछें: “तुम्हें क्या लगता है, उसे कैसा लगा?”', 'समूह के काम में किसी दयालु साथी के साथ जोड़ी बनाएँ।', 'काम के अंत में पूछें: “क्या मुश्किल था, और किससे मदद मिली?”', 'एक कारण पूछें: “तुम्हें कैसे पता?”', 'एक बार में एक निर्देश दें; उसे दोहराने को कहें।', 'कई कदम वाले काम के लिए “पहले–फिर” कार्ड इस्तेमाल करें।', 'बदलने से पहले बताएँ: “दो मिनट, फिर बदलेंगे।”', 'दरवाज़े और खिड़की से दूर बैठाएँ।', 'जवाब देने से पहले “रुको, सोचो, करो” का अभ्यास कराएँ।', 'काम को 5-5 मिनट के हिस्सों में बाँटें, साथ में टिक-सूची।']),
      tipHome: bySkill(['सोते समय की कहानी के किरदारों की भावनाओं को नाम दें।', 'साथ में तीन धीमी “गुब्बारा साँसें” लें।', 'आज परिवार में किसी को कैसा लगा, इस पर बात करें।', 'बारी-बारी से खेला जाने वाला कोई बोर्ड गेम खेलें।', 'पूछें: “आज क्या मुश्किल था, और तुमने क्या आज़माया?”', '“तुम क्या चुनोगे?” खेलें और कारण बताएँ।', 'दो कदम वाले निर्देश का खेल: “जूते जगह पर, फिर पानी की बोतल।”', 'कल का बस्ता साथ में, एक-एक कदम करके तैयार करें।', '“साइमन कहता है” खेलें, बीच में नियम बदल दें।', 'टीवी बंद करके एक पहेली हल करें।', '“रेड लाइट, ग्रीन लाइट” खेलें।', '5 मिनट का “अंतर खोजो” खेलें।']),
    },
  };
  Object.keys(COPY2).forEach(function (l) { Object.assign(COPY[l], COPY2[l]); COPY[l].memSrc = Object.assign({}, COPY[l].memSrc, { tilli: COPY2[l].memSrcTilli }); });
  // ---------- copy, part 3: the Data page ----------
  var COPY3 = {
    en: {
      dTitle: 'Data', dSub: 'Attendance, assessments and files for Grade 3 A, organised by student.', dAttToday: 'Attendance today', dNotTaken: 'Not taken yet',
      dPresent: '{p} of {n} present', dLate: '{k} late', dTake: 'Take attendance', dEdit: 'Edit attendance', dFilesT: 'Assessment files', dFilesN: '{k} files across the class',
      dUpload: 'Upload a file', dAll: 'All', dAtt: 'Attendance', dAssess: 'Assessments', dFiles: 'Files', dSearch: 'Find a child…', dAttPct: 'Attendance {p}%',
      dFilesCount: '{k} files', dDaysAbs: '{d} days absent this term', dNoAbs: 'No absences this term', st: { P: 'Present', A: 'Absent', L: 'Late' },
      dOpenPP: 'Open memory layer', dAddFile: 'Add a file', dSample: 'Sample', dYours: 'Added by you', dOpenPdf: 'Open PDF', dClose: 'Close', dNone: 'No children match.',
      types: { maths: 'Maths test', spelling: 'Spelling test', reading: 'Reading record', science: 'Science worksheet', other: 'Other' },
      dAttTitle: 'Take attendance · {date}', dAttHelp: 'Everyone starts as present. Tap anyone who is absent or late.',
      dAttManual: 'Take manually', dAttUpload: 'Upload CSV or PDF', dAttUpTitle: 'Upload attendance · {date}', dAttUpHelp: 'Upload today’s register as a CSV or PDF. Tilli reads it and fills in the list for you to check.',
      dAttUpSample: 'Sample register (CSV)', dAttUpOwn: 'Or choose your own file', dAttUpBtn: 'Choose CSV or PDF', dAttRead: 'Read register', dAttSteps: ['Opening the register…', 'Matching names to your class…', 'Marking who was in…'],
      dAttFrom: 'Filled in from {f}. Check it, then save.', dAttSim: 'Demo: the reading is simulated.', dSave: 'Save', dCancel: 'Cancel',
      dSaved: 'Attendance saved: {p} of {n} present', dUpTitle: 'Upload a file', dUpFor: 'Child', dUpType: 'Type', dUpPick: 'Choose a sample', dUpOwn: 'Or choose from your phone',
      dUpOwnBtn: 'Choose photo or PDF', dUpChosen: 'Chosen: {f}', dUpSave: 'Save to {n}’s records', dUpNoSample: 'No sample for this type. Choose a file from your phone.',
      dUpDone: 'Saved to {n}’s files', dUpRead: 'Tilli read it: {score} · added to {n}’s memory', dUpOwnNote: 'In this demo, Tilli reads the sample maths sheets only.',
      dUpLocal: 'Stays in this browser only. Nothing is uploaded.', dWeek: 'Week {w}', dTodayW: 'Today', dPhoneTabs: ['To-do', 'Done so far'],
    },
    es: {
      dTitle: 'Datos', dSub: 'Asistencia, evaluaciones y archivos de 3.º A, por alumno.', dAttToday: 'Asistencia de hoy', dNotTaken: 'Aún sin pasar lista',
      dPresent: '{p} de {n} presentes', dLate: '{k} con retraso', dTake: 'Pasar lista', dEdit: 'Editar asistencia', dFilesT: 'Archivos de evaluación', dFilesN: '{k} archivos en la clase',
      dUpload: 'Subir un archivo', dAll: 'Todo', dAtt: 'Asistencia', dAssess: 'Evaluaciones', dFiles: 'Archivos', dSearch: 'Busca un alumno…', dAttPct: 'Asistencia {p} %',
      dFilesCount: '{k} archivos', dDaysAbs: '{d} días de ausencia este trimestre', dNoAbs: 'Sin ausencias este trimestre', st: { P: 'Presente', A: 'Ausente', L: 'Retraso' },
      dOpenPP: 'Abrir capa de memoria', dAddFile: 'Añadir archivo', dSample: 'Ejemplo', dYours: 'Subido por ti', dOpenPdf: 'Abrir PDF', dClose: 'Cerrar', dNone: 'Ningún alumno coincide.',
      types: { maths: 'Examen de mates', spelling: 'Dictado', reading: 'Registro de lectura', science: 'Ficha de ciencias', other: 'Otro' },
      dAttTitle: 'Pasar lista · {date}', dAttHelp: 'Todos empiezan como presentes. Toca a quien esté ausente o llegue tarde.',
      dAttManual: 'Pasar lista a mano', dAttUpload: 'Subir CSV o PDF', dAttUpTitle: 'Subir asistencia · {date}', dAttUpHelp: 'Sube la lista de hoy en CSV o PDF. Tilli la lee y rellena la lista para que la revises.',
      dAttUpSample: 'Lista de ejemplo (CSV)', dAttUpOwn: 'O elige tu propio archivo', dAttUpBtn: 'Elegir CSV o PDF', dAttRead: 'Leer lista', dAttSteps: ['Abriendo la lista…', 'Emparejando nombres con tu clase…', 'Marcando quién vino…'],
      dAttFrom: 'Rellenado desde {f}. Revísalo y guarda.', dAttSim: 'Demo: la lectura es simulada.', dSave: 'Guardar', dCancel: 'Cancelar',
      dSaved: 'Asistencia guardada: {p} de {n} presentes', dUpTitle: 'Subir un archivo', dUpFor: 'Alumno', dUpType: 'Tipo', dUpPick: 'Elige un ejemplo', dUpOwn: 'O elige uno de tu móvil',
      dUpOwnBtn: 'Elegir foto o PDF', dUpChosen: 'Elegido: {f}', dUpSave: 'Guardar en la ficha de {n}', dUpNoSample: 'No hay ejemplo de este tipo. Elige un archivo de tu móvil.',
      dUpDone: 'Guardado en los archivos de {n}', dUpRead: 'Tilli lo ha leído: {score} · añadido a la memoria de {n}', dUpOwnNote: 'En esta demo, Tilli solo lee las hojas de mates de ejemplo.',
      dUpLocal: 'Se queda solo en este navegador. No se sube nada.', dWeek: 'Semana {w}', dTodayW: 'Hoy', dPhoneTabs: ['Pendiente', 'Hecho hasta ahora'],
    },
    hi: {
      dTitle: 'डेटा', dSub: 'कक्षा 3 A की उपस्थिति, आकलन और फ़ाइलें, हर विद्यार्थी के हिसाब से।', dAttToday: 'आज की उपस्थिति', dNotTaken: 'अभी नहीं ली गई',
      dPresent: '{n} में से {p} उपस्थित', dLate: '{k} देर से', dTake: 'उपस्थिति लें', dEdit: 'उपस्थिति बदलें', dFilesT: 'आकलन की फ़ाइलें', dFilesN: 'पूरी कक्षा में {k} फ़ाइलें',
      dUpload: 'फ़ाइल अपलोड करें', dAll: 'सब', dAtt: 'उपस्थिति', dAssess: 'आकलन', dFiles: 'फ़ाइलें', dSearch: 'बच्चा खोजें…', dAttPct: 'उपस्थिति {p}%',
      dFilesCount: '{k} फ़ाइलें', dDaysAbs: 'इस सत्र {d} दिन अनुपस्थित', dNoAbs: 'इस सत्र कोई अनुपस्थिति नहीं', st: { P: 'उपस्थित', A: 'अनुपस्थित', L: 'देर से' },
      dOpenPP: 'मेमोरी लेयर खोलें', dAddFile: 'फ़ाइल जोड़ें', dSample: 'नमूना', dYours: 'आपने जोड़ा', dOpenPdf: 'PDF खोलें', dClose: 'बंद करें', dNone: 'कोई बच्चा नहीं मिला।',
      types: { maths: 'गणित परीक्षा', spelling: 'वर्तनी परीक्षा', reading: 'पढ़ने का रिकॉर्ड', science: 'विज्ञान वर्कशीट', other: 'अन्य' },
      dAttTitle: 'उपस्थिति लें · {date}', dAttHelp: 'सब पहले से उपस्थित हैं। जो अनुपस्थित या देर से है, उस पर टैप करें।',
      dAttManual: 'ख़ुद उपस्थिति लें', dAttUpload: 'CSV या PDF अपलोड करें', dAttUpTitle: 'उपस्थिति अपलोड करें · {date}', dAttUpHelp: 'आज का रजिस्टर CSV या PDF में अपलोड करें। Tilli उसे पढ़कर सूची भर देगा, आप जाँच लें।',
      dAttUpSample: 'नमूना रजिस्टर (CSV)', dAttUpOwn: 'या अपनी फ़ाइल चुनें', dAttUpBtn: 'CSV या PDF चुनें', dAttRead: 'रजिस्टर पढ़ें', dAttSteps: ['रजिस्टर खोला जा रहा है…', 'नाम आपकी कक्षा से मिलाए जा रहे हैं…', 'कौन आया, यह दर्ज हो रहा है…'],
      dAttFrom: '{f} से भरा गया। जाँचें, फिर सेव करें।', dAttSim: 'डेमो: पढ़ना सिम्युलेटेड है।', dSave: 'सेव करें', dCancel: 'रद्द करें',
      dSaved: 'उपस्थिति सेव हुई: {n} में से {p} उपस्थित', dUpTitle: 'फ़ाइल अपलोड करें', dUpFor: 'बच्चा', dUpType: 'प्रकार', dUpPick: 'नमूना चुनें', dUpOwn: 'या अपने फ़ोन से चुनें',
      dUpOwnBtn: 'फ़ोटो या PDF चुनें', dUpChosen: 'चुना गया: {f}', dUpSave: '{n} के रिकॉर्ड में सेव करें', dUpNoSample: 'इस प्रकार का नमूना नहीं है। अपने फ़ोन से फ़ाइल चुनें।',
      dUpDone: '{n} की फ़ाइलों में सेव हो गया', dUpRead: 'Tilli ने पढ़ लिया: {score} · {n} की मेमोरी में जुड़ गया', dUpOwnNote: 'इस डेमो में Tilli सिर्फ़ नमूना गणित शीट पढ़ता है।',
      dUpLocal: 'यह सिर्फ़ इसी ब्राउज़र में रहता है। कुछ भी अपलोड नहीं होता।', dWeek: 'हफ़्ता {w}', dTodayW: 'आज', dPhoneTabs: ['बाकी काम', 'अब तक पूरे'],
    },
  };
  Object.keys(COPY3).forEach(function (l) { Object.assign(COPY[l], COPY3[l]); });
  // ---------- copy, part 4: Assess → Records (attendance grid, completion, academic + social-emotional) ----------
  var COPY4 = {
    en: {
      tabAcad: 'Academics', tabRecords: 'Files & records',
      rAtt: 'Attendance', rClassAvg: 'Class average {p}%',
      rBands: ['Under 85%', '85–94%', '95%+'], rStuBands: ['Absent', 'Late', 'Present'],
      rCellTip: '{date} · {p} of {n} present ({pct}%)', rNotYet: 'not taken yet', rStuTip: { A: '{date} · absent', L: '{date} · late', P: '{date} · present' },
      rAllKids: 'All children', rAllKidsT: 'Every child’s attendance', rPickDayKid: 'Tap a day to see if {n} was in.', rDayAbs: 'Absent', rDayLate: 'Late', rAllIn: 'Everyone was in.',
      rAbsN: '{d} absent', rLateN: '{d} late',
      rAssess: 'Assessments', rDoneT: 'done · {w}',
      rParts: { teacher: 'Your observations', parent: 'Parent surveys', student: 'Student assessments', acad: 'Academic marks' }, rOf: '{a} of {b}',
      rAcad: 'Academic', rEmo: 'Social-emotional',
      rNew: 'New assessment', rName: 'Name', rNamePh: 'Fractions quiz', rMax: 'Maximum score', rCreate: 'Create', acMore: 'More options', acEdit: 'Edit', acDel: 'Delete', acDate: 'Date given', acSave: 'Save', acDateErr: 'Pick the date it was given.', acDelQ: 'Delete “{name}”? Its marks and papers are removed too. This can’t be undone.', rNameErr: 'Give the assessment a name.', rMaxErr: 'Enter a maximum score above 0.',
      rLeft: '{k} left', rAllMarked: 'All {b} marked', rDoneS: '{a} of {b} done', rAvg: 'average {p}%', rAvgCol: 'avg {p}%', rAvgLbl: 'class average',
      rGoPart: { teacher: 'Open: who still needs an observation', parent: 'Open: parents still to finish', student: 'Open: student assessments still to do', acad: 'Open: academic marks' }, rUpClass: 'Upload class PDF', rUpOne: 'One child',
      rDoneN: '{a} of {b} completed', rFAll: 'All {k}', rFNot: 'Not completed {k}', rTagDone: 'Completed {d}', rTagNot: 'Not completed', rMissing: 'Missing', rSwipe: 'Swipe sideways to see every assessment',
      rCol: { stu: 'Student', status: 'Status', score: 'Score', paper: 'Paper' }, rViewA: 'By assessment', rViewK: 'By child', rScoreOf: '{s} / {m}',
      rUpTitle: 'Upload · {name}', rModeClass: 'Whole class · one PDF', rModeOne: 'One child',
      rClassHelp: 'Scan every child’s paper into one PDF, or add photos. Tilli finds each child’s pages and reads the score.',
      rPack: 'Sample class pack · {k} pages', rOwnMany: 'Or choose your own PDF or photos', rOwnChosen: 'Chosen: {f}', rRead: 'Read and split', rReadOne: 'Read the score',
      rSteps: ['Finding each child’s pages…', 'Matching names to your class…', 'Reading the scores…'], rResult: 'Split across {k} children', rPages: 'pages {a}–{b}',
      rSaveAll: 'Save {k} scores', rSavedAll: '{name}: {k} scores saved', rSaveOne: 'Save to {n}’s record', rSavedOne: '{name}: saved for {n}', rSim: 'Demo: the split and the scores are simulated.', rChild: 'Child', rPaper: 'Paper',
      rWinName: { baseline: 'Baseline', mid: 'Midline', post: 'Endline' },
      rFiles: 'Files', rFilesN: '{k} files', rFilesAll: 'Show all {k}', rFilesLess: 'Show fewer',
    },
    es: {
      tabAcad: 'Académicas', tabRecords: 'Archivos y registros',
      rAtt: 'Asistencia', rClassAvg: 'Media de la clase: {p} %',
      rBands: ['Menos del 85 %', '85–94 %', '95 % o más'], rStuBands: ['Ausente', 'Retraso', 'Presente'],
      rCellTip: '{date} · {p} de {n} presentes ({pct} %)', rNotYet: 'aún sin pasar lista', rStuTip: { A: '{date} · ausente', L: '{date} · retraso', P: '{date} · presente' },
      rAllKids: 'Todos los alumnos', rAllKidsT: 'Asistencia de cada alumno', rPickDayKid: 'Toca un día para ver si {n} vino.', rDayAbs: 'Ausentes', rDayLate: 'Con retraso', rAllIn: 'Vinieron todos.',
      rAbsN: '{d} ausencias', rAbsN1: '{d} ausencia', rLateN: '{d} retrasos', rLateN1: '{d} retraso',
      rAssess: 'Evaluaciones', rDoneT: 'hecho · evaluación {w}',
      rParts: { teacher: 'Tus observaciones', parent: 'Encuestas de las familias', student: 'Evaluaciones del alumnado', acad: 'Notas académicas' }, rOf: '{a} de {b}',
      rAcad: 'Académicas', rEmo: 'Socioemocionales',
      rNew: 'Nueva evaluación', rName: 'Nombre', rNamePh: 'Prueba de fracciones', rMax: 'Puntuación máxima', rCreate: 'Crear', acMore: 'Más opciones', acEdit: 'Editar', acDel: 'Eliminar', acDate: 'Fecha', acSave: 'Guardar', acDateErr: 'Elige la fecha en que se hizo.', acDelQ: '¿Eliminar «{name}»? También se borran sus notas y trabajos. No se puede deshacer.', rNameErr: 'Ponle un nombre a la evaluación.', rMaxErr: 'Escribe una puntuación máxima mayor que 0.',
      rLeft: '{k} pendientes', rAllMarked: 'Las {b} corregidas', rDoneS: '{a} de {b} hechas', rAvg: 'media {p} %', rAvgCol: 'media {p} %', rAvgLbl: 'media de la clase',
      rGoPart: { teacher: 'Abrir: a quién te falta observar', parent: 'Abrir: familias que faltan', student: 'Abrir: evaluaciones del alumnado pendientes', acad: 'Abrir: notas académicas' }, rUpClass: 'Subir PDF de la clase', rUpOne: 'Un alumno',
      rDoneN: '{a} de {b} completadas', rFAll: 'Todos ({k})', rFNot: 'Sin completar ({k})', rTagDone: 'Completada el {d}', rTagNot: 'Sin completar', rMissing: 'Falta', rSwipe: 'Desliza hacia el lado para ver todas las evaluaciones',
      rCol: { stu: 'Alumno', status: 'Estado', score: 'Nota', paper: 'Hoja' }, rViewA: 'Por evaluación', rViewK: 'Por alumno', rScoreOf: '{s} / {m}',
      rUpTitle: 'Subir · {name}', rModeClass: 'Toda la clase · un PDF', rModeOne: 'Un alumno',
      rClassHelp: 'Escanea las hojas de todos en un solo PDF o añade fotos. Tilli encuentra las páginas de cada alumno y lee la nota.',
      rPack: 'Ejemplo de la clase · {k} páginas', rOwnMany: 'O elige tu PDF o tus fotos', rOwnChosen: 'Elegido: {f}', rRead: 'Leer y repartir', rReadOne: 'Leer la nota',
      rSteps: ['Buscando las páginas de cada alumno…', 'Emparejando nombres con tu clase…', 'Leyendo las notas…'], rResult: 'Repartido entre {k} alumnos', rPages: 'páginas {a}–{b}',
      rSaveAll: 'Guardar {k} notas', rSavedAll: '{name}: {k} notas guardadas', rSaveOne: 'Guardar en la ficha de {n}', rSavedOne: '{name}: guardado para {n}', rSim: 'Demo: el reparto y las notas son simulados.', rChild: 'Alumno', rPaper: 'Hoja',
      rWinName: { baseline: 'inicial', mid: 'intermedia', post: 'final' },
      rFiles: 'Archivos', rFilesN: '{k} archivos', rFilesAll: 'Ver los {k}', rFilesLess: 'Ver menos',
    },
    hi: {
      tabAcad: 'पढ़ाई', tabRecords: 'फ़ाइलें और रिकॉर्ड',
      rAtt: 'उपस्थिति', rClassAvg: 'कक्षा का औसत {p}%',
      rBands: ['85% से कम', '85–94%', '95% या ज़्यादा'], rStuBands: ['अनुपस्थित', 'देर से', 'उपस्थित'],
      rCellTip: '{date} · {n} में से {p} उपस्थित ({pct}%)', rNotYet: 'अभी नहीं ली गई', rStuTip: { A: '{date} · अनुपस्थित', L: '{date} · देर से', P: '{date} · उपस्थित' },
      rAllKids: 'सभी बच्चे', rAllKidsT: 'हर बच्चे की उपस्थिति', rPickDayKid: 'किसी दिन पर टैप करके {n} की उस दिन की उपस्थिति देखें।', rDayAbs: 'अनुपस्थित', rDayLate: 'देर से', rAllIn: 'सब आए।',
      rAbsN: '{d} अनुपस्थित', rLateN: '{d} देर से',
      rAssess: 'आकलन', rDoneT: '{w} आकलन · पूरा',
      rParts: { teacher: 'आपके अवलोकन', parent: 'अभिभावक सर्वे', student: 'विद्यार्थी आकलन', acad: 'पढ़ाई के अंक' }, rOf: '{b} में से {a}',
      rAcad: 'पढ़ाई', rEmo: 'सामाजिक-भावनात्मक',
      rNew: 'नया आकलन', rName: 'नाम', rNamePh: 'भिन्न क्विज़', rMax: 'पूरे अंक', rCreate: 'बनाएँ', acMore: 'और विकल्प', acEdit: 'बदलें', acDel: 'हटाएँ', acDate: 'दी गई तारीख़', acSave: 'सेव करें', acDateErr: 'वह तारीख़ चुनें जब यह दिया गया।', acDelQ: '“{name}” हटाएँ? इसके अंक और पेपर भी हट जाएँगे। यह वापस नहीं होगा।', rNameErr: 'आकलन का नाम लिखें।', rMaxErr: '0 से ज़्यादा पूरे अंक लिखें।',
      rLeft: '{k} बाकी', rAllMarked: 'सभी {b} जाँचे गए', rDoneS: '{b} में से {a} पूरे', rAvg: 'औसत {p}%', rAvgCol: 'औसत {p}%', rAvgLbl: 'कक्षा का औसत',
      rGoPart: { teacher: 'खोलें: किनका अवलोकन बाकी है', parent: 'खोलें: कौन से अभिभावक बाकी हैं', student: 'खोलें: बाकी विद्यार्थी आकलन', acad: 'खोलें: पढ़ाई के अंक' }, rUpClass: 'कक्षा की PDF अपलोड करें', rUpOne: 'एक बच्चा',
      rDoneN: '{b} में से {a} पूरे', rFAll: 'सभी {k}', rFNot: 'अधूरे {k}', rTagDone: '{d} को पूरा', rTagNot: 'अधूरा', rMissing: 'बाकी', rSwipe: 'सारे आकलन देखने के लिए बगल में स्वाइप करें',
      rCol: { stu: 'विद्यार्थी', status: 'स्थिति', score: 'अंक', paper: 'शीट' }, rViewA: 'आकलन के हिसाब से', rViewK: 'बच्चे के हिसाब से', rScoreOf: '{s} / {m}',
      rUpTitle: 'अपलोड · {name}', rModeClass: 'पूरी कक्षा · एक PDF', rModeOne: 'एक बच्चा',
      rClassHelp: 'सभी बच्चों की शीट एक PDF में स्कैन करें या फ़ोटो जोड़ें। Tilli हर बच्चे के पन्ने ढूँढकर अंक पढ़ता है।',
      rPack: 'कक्षा का नमूना · {k} पन्ने', rOwnMany: 'या अपनी PDF या फ़ोटो चुनें', rOwnChosen: 'चुना गया: {f}', rRead: 'पढ़ें और बाँटें', rReadOne: 'अंक पढ़ें',
      rSteps: ['हर बच्चे के पन्ने ढूँढे जा रहे हैं…', 'नाम आपकी कक्षा से मिलाए जा रहे हैं…', 'अंक पढ़े जा रहे हैं…'], rResult: '{k} बच्चों में बाँटा गया', rPages: 'पन्ने {a}–{b}',
      rSaveAll: '{k} अंक सेव करें', rSavedAll: '{name}: {k} अंक सेव हुए', rSaveOne: '{n} के रिकॉर्ड में सेव करें', rSavedOne: '{name}: {n} के लिए सेव हुआ', rSim: 'डेमो: बँटवारा और अंक सिर्फ़ दिखाने के लिए हैं।', rChild: 'बच्चा', rPaper: 'शीट',
      rWinName: { baseline: 'शुरुआती', mid: 'मध्य', post: 'अंतिम' },
      rFiles: 'फ़ाइलें', rFilesN: '{k} फ़ाइलें', rFilesAll: 'सभी {k} देखें', rFilesLess: 'कम दिखाएँ',
    },
  };
  Object.keys(COPY4).forEach(function (l) { Object.assign(COPY[l], COPY4[l]); });
  var C = COPY[L];
  function t(k, v) { return fill(C[k] != null ? C[k] : COPY.en[k], v); }

  // ---------- class data (read from the app) ----------
  function kids() { try { return (window.TD.section().students || []).filter(function (s) { return s.state !== 'waiting'; }); } catch (e) { return []; } }
  function allKids() { try { return window.TD.section().students || []; } catch (e) { return []; } }
  function skillOf(s, key) { return (s.skills || []).find(function (k) { return k.key === key; }) || { pct: 50, band: 'Learner', pre: 45 }; }
  function nm(s) { return s ? (s.dispFirst || s.first) : ''; }
  // The three children the story is about, picked from the data so the names follow the language.
  function cast() {
    var ks = kids(); if (ks.length < 3) return null;
    var by = function (key) { return ks.slice().sort(function (a, b) { return skillOf(a, key).pct - skillOf(b, key).pct; }); };
    var math = by('working_memory')[0];
    var calm = by('emotion_regulation').find(function (s) { return s !== math; });
    var home = ks.slice().sort(function (a, b) { return hash(a.id + 'home') - hash(b.id + 'home'); }).find(function (s) { return s !== math && s !== calm; });
    var tend = ks.filter(function (s) { return s !== math && s !== calm && s !== home; })
      .sort(function (a, b) { return ((a.state === 'tending' ? 0 : 1) - (b.state === 'tending' ? 0 : 1)) || (a.overallPct - b.overallPct); })[0];
    return { math: math, calm: calm, home: home, tend: tend };
  }
  function topLow(s) {
    var sk = (s.skills || []).slice().sort(function (a, b) { return b.pct - a.pct; });
    var grew = (s.skills || []).slice().sort(function (a, b) { return (b.pct - b.pre) - (a.pct - a.pre); })[0];
    return { top: sk[0], low: sk[sk.length - 1], low2: sk[sk.length - 2], grew: grew };
  }
  // Maths marks this term (sample): seeded per child; the "math" child has the word-problem story.
  var SHEET_TOPIC = ['words', 'addsub', 'number', 'words'];   // 4th = a teacher's own maths photo (demo kit worksheet)   // sample sheets 1–3: Word problems · Subtraction with regrouping · Place value
  function mathMarks(s) {
    var c = cast(), base = clamp(Math.round((s.overallPct || 55) * 0.5 + 38), 40, 95);
    var out = {};
    Object.keys(MATH).forEach(function (k) { out[k] = clamp(base + (hash(s.id + k) % 23) - 11, 32, 98); });
    var wm = skillOf(s, 'working_memory').pct;
    out.words = clamp(Math.round(out.words * 0.6 + wm * 0.4), 30, 96);
    if (c && c.math === s) { out.words = 45; out.mult = Math.max(Math.min(out.mult, 58), 52); out.number = Math.max(out.number, 78); out.addsub = Math.max(out.addsub, 80); out.measure = Math.max(out.measure, 62); }
    // An uploaded sheet is the newest mark for its topic, so every screen shows the same number after an upload.
    var up = ST.uploads && ST.uploads[s.id], sh = up && C.sheets[up.sheet];
    if (sh) out[SHEET_TOPIC[up.sheet]] = Math.round(parseInt(sh.score, 10) / parseInt(sh.score.split('/')[1], 10) * 100);
    return out;
  }
  function midLeft() {
    var ks = allKids(), TD = window.TD; if (!TD) return 0;
    return ks.filter(function (s) { return !TD.teacherDone(s, 'mid'); }).length;
  }
  function midClose() {
    try {
      var w = (window.TD.S.data.windows || []).find(function (x) { return x.key === 'mid'; });
      return w && w.date ? w.date : '';
    } catch (e) { return ''; }
  }
  function prevTeacher(s) { var n = D.names.teachers; return pick(n, s.id + 't') + ' ' + pick(D.names.last, s.id + 'tl'); }

  // ---------- demo state (lives until refresh) ----------
  var ST = { uploads: {}, asked: {}, lastChips: {}, done: {}, box: null, day: 0, notes: {}, noteFlash: null, files: {}, attToday: {}, attTaken: false, attDraft: {}, dataQ: '', dataOpen: null, dup: null, attDay: null, acad: null, acadOpen: null, acadForm: null };
  // Ticks and notes survive a refresh in this tab (sessionStorage; gone when the tab closes, cleared by Reset demo).
  var WORK_KEY = 'tilliDemo.work';
  try { var W0 = JSON.parse(sessionStorage.getItem(WORK_KEY) || 'null'); if (W0) { ST.done = W0.done || {}; ST.notes = W0.notes || {}; } } catch (e) {}
  function saveWork() { try { sessionStorage.setItem(WORK_KEY, JSON.stringify({ done: ST.done, notes: ST.notes })); } catch (e) {} }

  // ---------- Home: Monday plan ----------
  var ICON = {
    note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2Z"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/></svg>',
    clip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h4"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-13M9 7V4h6v3"/></svg>',
    // line icons used in place of emoji across the dashboard (Nov 13, user); teacher-dashboard.js reads them via window.TIcon
    pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8a2 2 0 0 1 2-2h2l2-2h4l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5L5 20"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
    paperclip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L14 7"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6Z"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    cap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 9l10-5 10 5-10 5Z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/></svg>',   // arrow into a tray
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 0 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3A4.7 4.7 0 0 0 22 10c0-3.9-4.5-7-10-7Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15" cy="7.5" r="1"/></svg>',
    triangle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4 3 20h18Z"/></svg>',
    tree: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 6 11h3l-4 6h14l-4-6h3Z"/><path d="M12 17v4"/></svg>',
    sprout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21v-9"/><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6Z"/><path d="M12 10c0-3.5 2.5-6 7-6 0 4-3 6-7 6Z"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c0-9 5-14 15-15-1 10-6 15-15 15Z"/><path d="M5 19l7-7"/></svg>',
    flower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"/></svg>',
    hourglass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12M6 21h12"/><path d="M7 3c0 5 10 5 10 9s-10 4-10 9"/><path d="M17 3c0 5-10 5-10 9s10 4 10 9"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 20h20Z"/><path d="M12 10v4M12 17h.01"/></svg>',
    mirror: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="9" rx="6" ry="7"/><path d="M12 16v5M9 21h6M9.5 6.5A3 3 0 0 1 12 5"/></svg>',
    teacher: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="11" y="3" width="10" height="8" rx="1"/><circle cx="7" cy="9" r="3"/><path d="M2 21v-1a5 5 0 0 1 10 0v1M12 13l3-2"/></svg>',
    student: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="3.5"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/></svg>',
    keyboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></svg>',
    checksq: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/></svg>',
    // box icons (phone tiles): Do first · Plan it · Quick win · Later
    q1: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7Z"/></svg>',
    q2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
    q3: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7Z"/></svg>',
    q4: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>',
  };
  // Skill icons for the Class Skill Overview cards (Nov 13, user): TIcon('sk-' + skill key).
  Object.assign(ICON, {
    'sk-working_memory': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4 4 8l8 4 8-4-8-4Z"/><path d="m4 12 8 4 8-4"/><path d="m4 16 8 4 8-4"/></svg>',   // stacked layers
    'sk-emotion_regulation': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/></svg>',   // calm wave
    'sk-planning': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M12 6h8M12 12h8M12 18h8"/></svg>',   // checklist
    'sk-attention': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 12h.01"/></svg>',   // target
    'sk-critical_thinking': ICON.bulb,   // lightbulb
    'sk-inhibition_distraction': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15Z"/><path d="M10 21h4M4 4l16 16"/></svg>',   // muted bell
    'sk-empathy': ICON.heart,   // heart
    'sk-metacognition': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a8 7 0 0 0-5 12.5V20l3.5-2A8 7 0 1 0 12 3Z"/><path d="M10 9a2 2 0 1 1 3 1.7c-.6.4-1 .8-1 1.3M12 15h.01"/></svg>',   // thought bubble
    'sk-inhibition_response': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11.5V4a1.5 1.5 0 0 1 3 0v8M14 11.5V5.5a1.5 1.5 0 0 1 3 0V12M17 12V8.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.6-2.8L3.7 15a1.6 1.6 0 0 1 2.6-1.9L8 15"/></svg>',   // stop hand
    'sk-emotion_awareness': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 0 0 5 0"/></svg>',   // smile
    'sk-cognitive_flexibility': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',   // shuffle
    'sk-relationship_skills': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.1a4 4 0 0 1 0 7.8M21 21v-2a4 4 0 0 0-3-3.9"/></svg>',   // people
  });
  // One icon as inline SVG (class .ti sizes it to the text). Unknown name → ''.
  window.TIcon = function (k) { return ICON[k] ? ICON[k].replace('<svg ', '<svg class="ti" ') : ''; };

  // "Today, in order": the day's tasks sorted into an urgent × important grid (Eisenhower).
  // Each card keeps its school-day number (people first, paperwork later).
  // Desktop: full cards inside the four boxes. Phone: four box tiles (one circle per task) + one "Up next" card;
  // tapping a tile opens only that box's checklist.
  function midDaysLeft() {
    try {
      var d = (window.TilliAPI.getDeployments(D.school.id) || []).find(function (x) { return x.phase === 'Midline' && x.end; });
      return d ? Math.max(0, Math.ceil((new Date(d.end + 'T23:59:59') - Date.now()) / 864e5)) : null;
    } catch (e) { return null; }
  }
  function todayRows() {
    var c = cast(); if (!c) return [];
    var left = midLeft(), up = !!ST.uploads[c.math.id];
    return [
      { key: 'arrive', slot: 'arrive', q: 1, min: 1, text: 'rArrive', short: 'sArrive', names: { n: c.home }, src: 'parent' },
      { key: 'circle', slot: 'circle', q: 2, min: 10, text: 'rCircle', short: 'sCircle', names: { a: c.math, b: c.tend || c.calm },
        act: '<button class="btn-soft green sm focus" data-demo-askq="qAct">' + window.TD.chatIcon('var(--green-700)') + ' ' + esc(t('actHow')) + '</button>' },
      { key: 'brk', slot: 'brk', q: 1, min: 2, text: 'rBrk', short: 'sBrk', names: { n: c.calm }, src: 'note' },
      { key: 'maths', slot: 'maths', q: 1, min: 5, text: 'rMaths', short: 'sMaths', names: { n: c.math }, src: 'tilli' },
      // Observations are "Plan it" until the last 3 days of the window, then "Do first".
      { key: 'free', slot: 'free', q: midDaysLeft() != null && midDaysLeft() <= 3 ? 1 : 2, min: Math.max(5, left * 5), text: 'rFree', short: 'sFree', vars: { k: left }, auto: left === 0,
        sub: t('rFreeSub', { date: midClose(), d: midDaysLeft() == null ? '–' : midDaysLeft() }),
        act: '<button class="btn btn-primary sm focus" data-demo-assess>' + esc(t('actGo')) + ' →</button>' },
      { key: 'after', slot: 'after', q: 3, min: 2, text: 'rAfter', short: 'sAfter', names: { n: c.math }, auto: up,
        act: '<button class="btn-line sm focus" data-demo-upload="' + esc(c.math.id) + '">' + ICON.up + ' ' + esc(t('actUp')) + '</button>' },
    ];
  }
  // Tuesday and Wednesday: lighter days that follow on from Monday's story.
  function dayRows(d) {
    var c = cast(); if (!c) return [];
    if (d === 1) return [
      { key: 'tue-check', slot: 'circle', q: 1, min: 3, text: 'rTueCheck', short: 'sTueCheck', names: { n: c.calm }, src: 'tilli' },
      { key: 'tue-cards', slot: 'maths', q: 2, min: 10, text: 'rTueCards', short: 'sTueCards', names: { n: c.math } },
      { key: 'tue-note', slot: 'after', q: 3, min: 3, text: 'rTueNote', short: 'sTueNote', names: { n: c.home } },
    ];
    if (d === 2) return [
      { key: 'wed-circle', slot: 'circle', q: 2, min: 10, text: 'rWedCircle', short: 'sWedCircle', names: { a: c.math, b: c.tend || c.calm },
        act: '<button class="btn-soft green sm focus" data-demo-askq="qAct">' + window.TD.chatIcon('var(--green-700)') + ' ' + esc(t('actHow')) + '</button>' },
      { key: 'wed-check', slot: 'brk', q: 1, min: 2, text: 'rWedCheck', short: 'sWedCheck', names: { n: c.calm } },
      { key: 'wed-notes', slot: 'after', q: 4, min: 10, text: 'rWedNotes', short: 'sWedNotes' },
    ];
    return todayRows();
  }
  function isDone(r) { return !!(r.auto || ST.done[r.key]); }
  // Template → HTML with each child's name as a link to their passport.
  function rowText(r) {
    var h = esc(t(r.text, r.vars || {}));
    Object.keys(r.names || {}).forEach(function (k) {
      var s = r.names[k]; if (!s) return;
      h = h.split('{' + k + '}').join('<button class="dt-name focus" data-demo-stu="' + esc(s.id) + '">' + esc(nm(s)) + '</button>');
    });
    return h;
  }

  function mondayCard() {
    var rows = dayRows(ST.day); if (!rows.length) return '';
    var open = rows.filter(function (r) { return !isDone(r); });
    var next = open[0];
    var SRC = { note: [ICON.note, t('fromNote')], parent: [ICON.home, t('fromParent')], tilli: [ICON.spark, t('fromTilli')] };
    // One task card. Desktop: inside its matrix box. Phone: the "Up next" card, or a row of an opened box.
    var card = function (r, i, extra, attrs) {
      var done = isDone(r);
      return '<div class="dt-card q' + r.q + (done ? ' done' : '') + (extra || '') + '" data-i="' + i + '"' + (attrs || '') + '>' +
        '<button class="dt-tick focus" data-demo-done="' + r.key + '" aria-pressed="' + done + '" aria-label="' + esc(done ? t('markUndo') : t('markDone')) + '"' + (r.auto ? ' disabled' : '') + '>' +
          (done ? ICON.check : '') + '</button>' +
        '<div class="dt-body">' +
          '<div class="dt-when"><b>' + esc(C.slot[r.slot]) + '</b><span>' + esc(t('mins', { m: r.min })) + '</span><span class="dt-q">' + esc(C.q[r.q]) + '</span></div>' +
          '<p class="dt-text">' + rowText(r) + (r.src ? ' <span class="dm-tag">' + SRC[r.src][0] + esc(SRC[r.src][1]) + '</span>' : '') + '</p>' +
          (r.sub && !done ? '<p class="dt-sub">' + esc(r.sub) + '</p>' : '') +
          (r.act && !done ? '<div class="dt-act">' + r.act + '</div>' : '') +
        '</div></div>';
    };
    var inQ = function (q) { return rows.map(function (r, i) { return { r: r, i: i }; }).filter(function (x) { return x.r.q === q; }); };
    // Desktop box: the full cards.
    var box = function (q) {
      var mine = inQ(q);
      return '<div class="dt-cell q' + q + '"><b>' + esc(C.q[q]) + '</b>' +
        (mine.length ? '<div class="dt-cards">' + mine.map(function (x) { return card(x.r, x.i); }).join('') + '</div>' : '<em>' + esc(t('q4empty')) + '</em>') + '</div>';
    };
    var matrix = '<div class="dt-matrix dt-big" role="group" aria-label="' + esc(t('todayTitle')) + '">' +
      '<span></span><span class="dt-ax">' + esc(t('mxUrgent')) + '</span><span class="dt-ax">' + esc(t('mxWait')) + '</span>' +
      '<span class="dt-ax dt-axy">' + esc(t('mxImp')) + '</span>' + box(1) + box(2) +
      '<span class="dt-ax dt-axy">' + esc(t('mxLess')) + '</span>' + box(3) + box(4) + '</div>';
    // Phone: one circle per task on each tile (filled = done).
    var rings = function (mine) {
      return mine.length ? '<span class="dt-rings" aria-hidden="true">' + mine.map(function (x) { return '<i' + (isDone(x.r) ? ' class="done"' : '') + '></i>'; }).join('') + '</span>'
        : '<em>' + esc(t('q4empty')) + '</em>';
    };
    var tile = function (q) {
      var mine = inQ(q);
      return '<button class="dt-tile q' + q + ' focus" data-demo-box="' + q + '" aria-label="' + esc(C.q[q] + ' · ' + t('boxCount', { n: mine.length })) + '">' +
        '<span class="dt-qi">' + ICON['q' + q] + '</span><span class="dt-tlbl"><b>' + esc(C.q[q]) + '</b>' + rings(mine) + '</span></button>';
    };
    var phone;
    if (ST.box) {
      var q = ST.box, mine = inQ(q), d = mine.filter(function (x) { return isDone(x.r); }).length;
      phone = '<div class="dt-open q' + q + '">' +
        '<div class="dt-openhead"><button class="dt-back focus" data-demo-box="0" aria-label="' + esc(t('back')) + '">‹</button>' +
          '<span class="dt-qi">' + ICON['q' + q] + '</span><div class="dt-openttl"><b>' + esc(C.q[q]) + '</b>' +
          (mine.length ? '<span>' + esc(t('boxDone', { d: d, n: mine.length })) + '</span><span class="dt-bar"><i style="width:' + Math.round(d / mine.length * 100) + '%"></i></span>' : '') +
        '</div></div>' +
        (mine.length ? '<div class="dt-cards">' + mine.map(function (x) { return card(x.r, x.i); }).join('') + '</div>' : '<em class="dt-none">' + esc(t('q4empty')) + '</em>') + '</div>';
    } else {
      // Up next: the first unfinished task, Do first before the other boxes, then school-day order.
      var up = rows.map(function (r, i) { return { r: r, i: i }; }).filter(function (x) { return !isDone(x.r); })
        .sort(function (a, b) { return a.r.q - b.r.q || a.i - b.i; })[0];
      phone = '<div class="dt-tiles" role="group" aria-label="' + esc(t('todayTitle')) + '">' + [1, 2, 3, 4].map(tile).join('') + '</div>' +
        (up ? '<div class="dt-nexthead"><b>' + esc(t('upNext')) + '</b><span>' + esc(t('boxDone', { d: rows.length - open.length, n: rows.length })) + '</span></div>' +
          card(up.r, up.i, ' dt-next', ' data-demo-box="' + up.r.q + '"') : '');
    }
    return '<section class="ui-card dm-monday dt" data-demo>' +
      '<div class="dt-head"><h2 class="dm-sr">' + esc(t('todayTitle')) + '</h2>' + dayStrip() +
        (next ? '' : '<p class="dt-help"><b>' + esc(t('allDone')) + '</b></p>') + '</div>' +
      matrix + '<div class="dt-phone">' + phone + '</div></section>';
  }
  // Today + the next two school days are open; the rest of the week is shown but locked.
  function dayStrip() {
    return '<div class="dt-strip"><div class="dt-days" role="tablist" aria-label="' + esc(t('todayTitle')) + '">' + C.days.map(function (w, i) {
      if (i > 2) return '<button class="dt-day off" disabled title="' + esc(t('dayLocked')) + '"><b>' + esc(w) + '</b><span>–</span></button>';
      var left = dayRows(i).filter(function (r) { return !isDone(r); }).length;
      return '<button class="dt-day focus' + (i === ST.day ? ' on' : '') + '" role="tab" aria-selected="' + (i === ST.day) + '" data-demo-day="' + i + '">' +
        '<b>' + esc(w) + '</b><span>' + esc(i === 0 ? t('dayToday') : t('dayTasks', { k: left })) + '</span></button>';
    }).join('') + '</div></div>';
  }

  // ---------- Child: learning passport ----------
  function memoryItems(s) {
    var c = cast() || {}, tl = topLow(s), items = [];
    (ST.notes[s.id] || []).forEach(function (x) { items.push({ src: 'note', when: C.noteNow, text: x.text + (x.skills && x.skills.length ? ' · ' + x.skills.map(function (k) { return SKILL[k]; }).join(', ') : ''), priv: true }); });   // typed to Ask Tilli: the skill(s) it was sorted into
    var up = ST.uploads[s.id];
    if (up) { var sh = C.sheets[up.sheet]; items.push({ src: 'upload', when: C.when.today, text: sh.name + ' · ' + sh.score + '. ' + fill(sh.noticed, { n: nm(s) }) }); }
    if (s === c.calm) { items.push({ src: 'note', when: C.when.thu, text: C.memCalm1, priv: true }); items.push({ src: 'tilli', when: C.when.lastweek, text: C.memCalm2 }); }
    if (s === c.math) { items.push({ src: 'tilli', when: C.when.lastweek, text: C.memMath1 }); }
    if (s === c.home) items.push({ src: 'parent', when: C.when.thu, text: C.memHome1 });
    items.push({ src: 'tilli', when: C.when.midline, text: fill(C.memTilli, { skill: lc(SKILL[tl.grew.key]), g: Math.max(3, tl.grew.pct - tl.grew.pre) }) });
    items.push({ src: 'parent', when: C.when.midline, text: pick(C.memParent, s.id + 'p') });
    // Last year's teacher is not repeated here: their handover note lives in Earlier years → Class by class.
    return items;
  }
  function bandChip(band) { return '<span class="dm-band dm-' + band.toLowerCase() + '">' + esc(BAND[band] || band) + '</span>'; }
  function bandOf(p) { return p < 34 ? 'Beginner' : p < 67 ? 'Learner' : 'Advanced'; }

  // Day of the 14-day plan + home streak (sample, stable per child).
  // The skill the 14-day plan works on: working memory for the word-problem child (the demo story), else the lowest skill.
  function focusSkill(s) { var c = cast(); return c && c.math === s ? skillOf(s, 'working_memory') : topLow(s).low; }
  function planDay(s) { return 3 + hash(s.id + 'plan') % 9; }
  // "Tell Tilli something to remember" — on the passport and in Ask Tilli (with a child picker).
  function noteBox(stu, withPicker) {
    var opts = withPicker ? '<label class="dm-lbl" for="dm-notefor">' + esc(t('noteFor')) + '</label><select id="dm-notefor" class="select dm-select dm-notefor">' +
      allKids().map(function (k) { return '<option value="' + esc(k.id) + '"' + (stu && k.id === stu.id ? ' selected' : '') + '>' + esc(k.name) + '</option>'; }).join('') + '</select>' : '';
    var who = stu || allKids()[0] || {};
    var flash = ST.noteFlash && stu && ST.noteFlash === stu.id && !withPicker ? '<span class="dm-saved">' + ICON.check + esc(t('noteSaved', { n: nm(stu) })) + '</span>' : '';
    return '<div class="dm-note"' + (stu ? ' data-stu="' + esc(stu.id) + '"' : '') + '>' +
      '<b class="dm-notet">' + ICON.note + esc(t('noteTitle')) + '</b>' + opts +
      '<div class="dm-notefield"><textarea class="dm-notein" rows="2" placeholder="' + esc(t('notePh', { n: nm(who) })) + '" aria-label="' + esc(t('noteTitle')) + '"></textarea>' +
        '<button type="button" class="dm-mic focus" data-demo-mic aria-pressed="false" aria-label="' + esc(t('micLabel')) + '" title="' + esc(t('micLabel')) + '">' + ICON.mic + '</button></div>' +
      '<p class="dm-micstat" aria-live="polite" hidden></p>' +
      '<div class="dm-noteacts"><span class="dm-priv">' + window.TIcon('lock') + ' ' + esc(t('notePrivate')) + '</span>' + flash +
      '<button class="btn btn-primary sm focus" data-demo-notesave>' + esc(t('noteSave')) + '</button></div></div>';
  }
  // Mic: the browser's own speech-to-text (Chrome, Edge, Safari), in the page language.
  // Where the browser has none (e.g. Firefox), it types a sample note so the demo still shows the idea.
  var MIC = null;   // { rec, btn, box } while listening
  function micStop() { if (MIC) { try { MIC.rec && MIC.rec.stop(); } catch (e) {} micUi(MIC.box, false); MIC = null; } }
  function micUi(box, on, msg) {
    var b = box.querySelector('[data-demo-mic]'), nx = box.nextElementSibling;
    var st = box.querySelector('.dm-micstat') || (nx && nx.classList.contains('dm-micstat') ? nx : null);   // Ask composer: the status line sits just under it
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? t('micStop') : t('micLabel'));
    if (st) { st.hidden = !msg; st.textContent = msg || ''; }
  }
  function micToggle(box) {
    if (MIC && MIC.box === box) { micStop(); return; }
    micStop();
    var inp = box.querySelector('.dm-notein, .ask-input'), SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var sel = box.querySelector('.dm-notefor'), id = sel ? sel.value : box.getAttribute('data-stu');
    var who = allKids().find(function (x) { return x.id === id; }) || CONVO.child || currentStudent() || allKids()[0] || {};
    // The Ask composer keeps its text in TD state and grows with it: let its own input listener see each change.
    var put = function (v) { inp.value = v; if (inp.classList.contains('ask-input')) inp.dispatchEvent(new Event('input', { bubbles: true })); };
    if (!SR) {   // no speech engine: type the sample, letter by letter
      var text = t('micSample', { n: nm(who) }), i = 0, base = inp.value ? inp.value.replace(/\s*$/, ' ') : '';
      micUi(box, true, t('micDemo'));
      var timer = setInterval(function () { if (!box.isConnected) { clearInterval(timer); return; } put(base + text.slice(0, ++i)); if (i >= text.length) { clearInterval(timer); micUi(box, false, t('micDemo')); } }, 35);
      return;
    }
    var rec = new SR(), base0 = inp.value ? inp.value.replace(/\s*$/, ' ') : '';
    rec.lang = D.locale; rec.interimResults = true; rec.continuous = false;
    rec.onresult = function (e) { var said = ''; for (var k = 0; k < e.results.length; k++) said += e.results[k][0].transcript; put(base0 + said); };
    rec.onerror = function (e) { var msg = e.error === 'no-speech' ? '' : t('micBlocked'); micUi(box, false, msg); MIC = null; };
    rec.onend = function () { if (MIC && MIC.rec === rec) { micUi(box, false); MIC = null; inp.focus(); } };
    MIC = { rec: rec, box: box };
    micUi(box, true, t('micListening'));
    try { rec.start(); } catch (e) { micUi(box, false, t('micBlocked')); MIC = null; }
  }
  function saveNote(box) {
    if (MIC && MIC.box === box) micStop();
    var inp = box.querySelector('.dm-notein'), sel = box.querySelector('.dm-notefor');
    var text = (inp.value || '').trim(); if (!text) { inp.focus(); return; }
    var id = sel ? sel.value : box.getAttribute('data-stu'), s = allKids().find(function (x) { return x.id === id; }); if (!s) return;
    (ST.notes[id] = ST.notes[id] || []).unshift({ text: text, at: Date.now() });
    saveWork();
    var TD = window.TD;
    if (box.closest('.ask-panel, .askx')) {   // said to Ask Tilli: show it in the chat
      TD.S.ask.thread = TD.S.ask.thread.concat([{ role: 'user', text: nm(s) + ': ' + text }, { role: 'tilli', text: t('noteAck', { n: nm(s) }) }]);
    } else ST.noteFlash = id;
    TD.render();
  }
  // Full student header (teacher-dashboard stuHead): "Ask Tilli about {name}" next to History and Edit.
  function askBtn(s) {
    return '<button class="btn btn-primary sm focus dm-headask" data-demo-askstu="' + esc(s.id) + '" translate="no">' + window.TD.chatIcon('var(--white)') + ' ' + esc(t('askAbout', { n: nm(s) })) + '</button>';
  }

  // Focus tile + This fortnight plan: child's Overview tab.
  function sumTile(label, big, small) { return '<div class="dm-sum"><span>' + esc(label) + '</span><b>' + esc(big) + '</b><small>' + esc(small) + '</small></div>'; }
  function focusTile(s) { return sumTile(t('sumFocus'), SKILL[focusSkill(s).key], t('planDay', { d: planDay(s) })); }
  function planCard(s) {
    var low = focusSkill(s), d = planDay(s);
    return '<div class="ui-card dm-card dm-plan14"><div class="dm-planh"><h3>' + esc(t('fortnight')) + ' · ' + esc(SKILL[low.key]) + '</h3><span class="dm-day">' + esc(t('planDay', { d: d })) + '</span></div>' +
      '<div class="dm-planbar"><i style="width:' + Math.round(d / 14 * 100) + '%"></i></div>' +
      '<p class="dm-tonight"><b>' + esc(t('planTonight')) + '</b>' + esc(C.tipHome[low.key]) + '<span>' + esc(t('planStreak', { k: Math.max(2, d - 4) })) + '</span></p>' +
      '<b class="dm-planclass">' + esc(t('planClass')) + '</b><ul class="dm-plan"><li>' + esc(C.tipClass[low.key]) + '</li><li>' + esc(t('planCheck')) + '</li></ul></div>';
  }
  // Attendance card (term grid + absent days): child's Overview tab.
  function attCardOf(s) {
    var c = cast() || {}, att = attOf(s);
    return '<div class="ui-card dm-card" id="dm-ppatt"><h3>' + esc(t('att')) + '</h3><div class="dm-att"><b>' + att.pct + '%</b><span>' + esc(t(att.days === 1 && C.attLine1 ? 'attLine1' : 'attLine', { p: att.pct, d: att.days }) + ' · ' + fill(att.late === 1 && C.rLateN1 || C.rLateN, { d: att.late })) + '</span></div>' + childAttGrid(s) +
      (s === c.home ? '<p class="dm-attnote">' + esc(t('attRecent')) + '</p>' : '') + (att.absent.length ? '<div class="dd-days"><b class="dd-dayslbl">' + esc(C.st.A) + '</b>' + att.absent.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '') + '</div>';
  }
  // Summary strip (Focus · Attendance · Maths · Strongest): top of the child's Overview tab.
  function sumStrip(s) {
    var att = attOf(s), mm = mathMarks(s), tl = topLow(s), ks = Object.keys(MATH);
    var avg = Math.round(ks.reduce(function (x, k) { return x + mm[k]; }, 0) / ks.length);
    var lowTopic = ks.slice().sort(function (a, b) { return mm[a] - mm[b]; })[0];
    return '<div class="dm-sumrow">' + focusTile(s) +
      sumTile(t('sumAtt'), att.pct + '%', fill(att.days === 1 && C.rAbsN1 || C.rAbsN, { d: att.days })) +
      sumTile(t('sumMaths'), t('sumAvg', { p: avg }), t('sumLowest', { topic: MATH[lowTopic], p: mm[lowTopic] })) +
      sumTile(t('sumStrong'), SKILL[tl.top.key], BAND[tl.top.band] || tl.top.band) + '</div>';
  }

  // English / Science marks (sample, stable per child): memory layer Subjects card + passport PDF.
  function subjScores(s) {
    var base = clamp(Math.round((s.overallPct || 55) * 0.5 + 40), 45, 95), r = function (k, spread) { return clamp(base + (hash(s.id + k) % (spread * 2 + 1)) - spread, 35, 99); };
    return { eng: [r('rd', 10), r('wr', 12), r('cp', 10)], sci: [r('lv', 10), r('mt', 12)] };
  }
  function meanOf(a) { return Math.round(a.reduce(function (x, y) { return x + y; }, 0) / a.length); }

  // ---------- Child: learning passport PDF (Download passport, student header) ----------
  // Same layout as the passport on the website (assets/measure/kia-passport.webp), filled with this
  // child's data. Parent-facing voice. teacher-dashboard.js turns it into a one-page PDF (.pp-pdf in demo.css).
  function passportDoc(s) {
    var n = nm(s), low = focusSkill(s), d = planDay(s), att = attOf(s), mm = mathMarks(s), tl = topLow(s), ks = Object.keys(MATH);
    var avg = Math.round(ks.reduce(function (x, k) { return x + mm[k]; }, 0) / ks.length);
    var lowTopic = ks.slice().sort(function (a, b) { return mm[a] - mm[b]; })[0], lowSk = MATH_SKILL[lowTopic], linked = skillOf(s, lowSk);
    var SJ = C.subj, sc = subjScores(s), V = C.ppViews || COPY.en.ppViews;
    var chip = function (band) { return '<span class="pp-band pp-' + String(band).toLowerCase() + '">' + esc(BAND[band] || band) + '</span>'; };
    var end = new Date(); end.setDate(end.getDate() + (14 - d));
    var short = function (dt) { return dt.toLocaleDateString(D.locale, { day: 'numeric', month: 'short' }); };
    var lowLine = function (k) {   // where the views agree / differ, in the family's voice
      var vals = [['you', k.teacher], ['home', k.parent], ['game', k.student]].sort(function (a, b) { return b[1] - a[1]; });
      if (vals[0][1] - vals[2][1] < 15) return t('ppAgree');
      var line = t('ppMore', { hi: V[vals[0][0]], lo: L === 'en' ? V[vals[2][0]].toLowerCase() : V[vals[2][0]] });
      return line.charAt(0).toUpperCase() + line.slice(1);
    };
    // header
    var head = '<div class="pp-head"><span class="pp-dots"><i></i><i></i><i></i></span><div class="pp-ttl"><span>' + esc(t('ppEyebrow')) + '</span><h1>' + esc(t('ppTitle', { n: n })) + '</h1></div>' +
      '<span class="pp-owned">' + window.TIcon('lock') + ' ' + esc(t('ppOwned', { n: n })) + '</span><span class="pp-av">' + esc(Array.from(n)[0] || '') + '</span></div>';
    // left: plan · maths insight · attendance + next check-in · ownership
    var left = '<div class="pp-plan"><div class="pp-planh"><b>' + esc(t('fortnight')) + ' · ' + esc(SKILL[low.key]) + '</b><span>' + esc(t('planDay', { d: d })) + '</span></div>' +
        '<div class="pp-bar"><i style="width:' + Math.round(d / 14 * 100) + '%"></i></div>' +
        '<p><b>' + esc(t('planTonight')) + '</b><br>' + esc(C.tipHome[low.key]) + ' ' + esc(t('planStreak', { k: Math.max(2, d - 4) })) + '.</p></div>' +
      '<div class="pp-card pp-alert pp-insight"><span class="pp-ic">' + window.TIcon('bulb') + '</span><div><h3>' + esc(t('ppDip', { topic: MATH[lowTopic], n: n })) + '</h3>' +
        '<p>' + esc(t('mathWhy', { pct: mm[lowTopic], topic: lc(MATH[lowTopic]), n: n, skill: lc(SKILL[lowSk]), band: BAND[linked.band] })) + '</p></div></div>' +
      '<div class="pp-tiles"><div class="pp-card pp-tile"><span>' + esc(t('att')) + ' ↻</span><b>' + att.pct + '%</b></div>' +
        '<div class="pp-card pp-tile"><span>' + esc(t('ppNext')) + '</span><b>' + esc(short(end)) + '</b></div></div>' +
      '<div class="pp-card pp-own"><h3><span class="pp-shield">' + window.TIcon('shield') + '</span>' + esc(t('ppOwnT', { n: n })) + '</h3><p>' + esc(t('ppOwnBody', { n: n })) + '</p>' +
        C.ownItems.map(function (x, i) { return '<div class="pp-ownrow"><span>' + window.TIcon(['cap', 'download', 'spark'][i]) + '</span><b>' + esc(x) + '</b></div>'; }).join('') + '</div>';
    // middle: the three skills that tell the story, with evidence; then a short list of the rest
    var feat = [low, tl.top, tl.grew, tl.low2].filter(function (x, i, a) { return x && a.indexOf(x) === i; }).slice(0, 3);
    var rest = (s.skills || []).filter(function (k) { return feat.indexOf(k) < 0; }).sort(function (a, b) { return b.pct - a.pct; });
    var mid = '<div class="pp-colh"><h2>' + esc(t('ppSkills')) + '</h2><span class="pp-pill">' + esc(t('ppMeasured')) + '</span></div>' +
      feat.map(function (k) {
        return '<div class="pp-card pp-skill"><div class="pp-skh"><h3>' + esc(SKILL[k.key]) + '</h3>' + chip(k.band) + '</div>' +
          '<span class="pp-src">' + esc(t('ppSrc', { game: C.game[k.key] })) + '</span><p>' + esc(lowLine(k)) + '</p>' +
          '<div class="pp-try"><b>' + window.TIcon('home') + ' ' + esc(t('ppTryHome')) + '</b> ' + esc(C.tipHome[k.key]) + '</div></div>';
      }).join('') +
      '<div class="pp-card pp-list">' + rest.slice(0, 4).map(function (k) { return '<div class="pp-lrow"><span>' + esc(SKILL[k.key]) + '</span>' + chip(k.band) + '</div>'; }).join('') +
        (rest.length > 4 ? '<p class="pp-more">' + esc(t('ppMoreSk', { k: rest.length - 4, n: n })) + '</p>' : '') + '</div>';
    // right: maths bars · lowest topic · English + Science
    var bars = ks.map(function (k) {
      var v = mm[k], c = v >= 75 ? 'hi' : v >= 55 ? 'mid' : 'lo';
      return '<div class="pp-mbar"><span>' + esc(MATH[k]) + '</span><i><em class="' + c + '" style="width:' + v + '%"></em></i><b' + (k === lowTopic ? ' class="low"' : '') + '>' + v + '%</b></div>';
    }).join('');
    var right = '<div class="pp-colh"><h2>' + esc(t('subjects')) + ' · ' + esc(SJ.maths) + '</h2><span class="pp-pill soft">↻ ' + esc(t('ppSynced')) + '</span></div>' +
      '<div class="pp-card"><h3>' + esc(t('ppOverall', { s: SJ.maths, g: letter(avg) })) + '</h3><p class="pp-meta">' + window.TIcon('file') + ' ' + esc(t('ppMathSrc')) + '</p>' + bars + '</div>' +
      '<div class="pp-card pp-alert"><h3>' + esc(MATH[lowTopic]) + ' · ' + mm[lowTopic] + '%</h3>' +
        '<p>' + esc(t('ppLowBody', { n: n, skill: lc(SKILL[lowSk]), band: BAND[linked.band] })) + '</p>' +
        '<div class="pp-try"><b>' + window.TIcon('home') + ' ' + esc(t('ppTryHome')) + '</b> ' + esc(C.tipHome[lowSk]) + '</div>' +
        '<div class="pp-link">' + window.TIcon('link') + ' ' + esc(t('ppLinked', { n: n, skill: lc(SKILL[lowSk]) })) + '</div></div>' +
      '<div class="pp-card pp-subj"><div class="pp-srow"><b>' + esc(SJ.english) + ' · ' + esc(letter(meanOf(sc.eng))) + '</b><span>' + esc(SJ.reading + ' ' + sc.eng[0] + ' · ' + SJ.writing + ' ' + sc.eng[1] + ' · ' + SJ.comp + ' ' + sc.eng[2]) + '</span></div>' +
        '<div class="pp-srow"><b>' + esc(SJ.science) + ' · ' + esc(letter(meanOf(sc.sci))) + '</b><span>' + esc(SJ.living + ' ' + sc.sci[0] + ' · ' + SJ.materials + ' ' + sc.sci[1]) + '</span></div></div>';
    return head + '<div class="pp-grid"><div class="pp-col">' + left + '</div><div class="pp-col">' + mid + '</div><div class="pp-col">' + right + '</div></div>' +
      '<div class="pp-foot">' + esc(t('ppFoot', { date: new Date().toLocaleDateString(D.locale, { day: 'numeric', month: 'long', year: 'numeric' }) })) + '</div>';
  }
  function passportFile(s) {
    var base = ((s.first || '') + '-' + (s.last || '')).normalize('NFC').replace(/[^\p{L}\p{M}\p{N}-]+/gu, '').replace(/^-+|-+$/g, '');
    return (base ? base + '-' : '') + t('ppFile') + '.pdf';
  }

  function passport(s, history, changes) {
    var n = nm(s), tl = topLow(s), mm = mathMarks(s), low = focusSkill(s), d = planDay(s);
    var c = cast() || {}, att = attOf(s), mem;
    // Behaviour notes (school system) sit in the same timeline, just before the Midline items.
    var items = memoryItems(s), bi = hash(s.id + 'beh') % C.beh.length, at = items.findIndex(function (m) { return m.when === C.when.midline; });
    items.splice(at < 0 ? items.length : at, 0, { src: 'beh', when: C.thisweek, text: C.beh[bi] }, { src: 'beh', when: C.when.lastweek, text: C.beh[(bi + 3) % C.beh.length] });
    mem = items.map(function (m) {
      return '<li class="dm-mem dm-src-' + m.src + '"><span class="dm-memsrc">' + esc(C.memSrc[m.src]) + ' · ' + esc(m.when) +
        (m.priv ? ' <span class="dm-privtag">' + window.TIcon('lock') + ' ' + esc(t('privateTag')) + '</span>' : '') + '</span><p>' + esc(m.text) + '</p></li>';
    }).join('');
    var lowTopic = Object.keys(mm).sort(function (a, b) { return mm[a] - mm[b]; })[0];
    var linked = skillOf(s, MATH_SKILL[lowTopic]);
    var avg = Math.round(Object.keys(MATH).reduce(function (x, k) { return x + mm[k]; }, 0) / Object.keys(MATH).length);
    var bars = Object.keys(MATH).map(function (k) {
      return '<div class="dm-bar' + (k === lowTopic ? ' low' : '') + '"><span class="dm-barl">' + esc(MATH[k]) + '</span><span class="dm-bart"><i style="width:' + mm[k] + '%"></i></span><b>' + mm[k] + '%</b></div>';
    }).join('');
    // This year · left: what Tilli remembers (composer opens on demand), then files and portfolio
    var noteOpen = !!(ST.noteOpen && ST.noteOpen[s.id]);
    var notes = '<div class="ui-card dm-card"><div class="dm-cardh"><h3>' + esc(t('remembers')) + '</h3>' +
      (noteOpen ? '' : '<button class="btn-line sm focus" data-demo-noteopen="' + esc(s.id) + '">＋ ' + esc(t('addNote')) + '</button>') + '</div>' +
      (noteOpen ? noteBox(s, false) : '') + '<ul class="dm-memlist">' + mem + '</ul></div>';
    // This year · right: the school record — subjects, weekly assessments
    var sc = subjScores(s), SJ = C.subj, eng = sc.eng, sci = sc.sci, mean = meanOf;
    var subjRow = function (name, pct, sub) { return '<div><b>' + esc(name) + '</b><span>' + esc(sub) + '</span></div><em>' + esc(letter(pct)) + '</em>'; };
    var subjects = '<div class="ui-card dm-card"><h3>' + esc(t('subjects')) + '</h3>' +
      '<div class="dm-subj">' + subjRow(SJ.english, mean(eng), SJ.reading + ' ' + eng[0] + ' · ' + SJ.writing + ' ' + eng[1] + ' · ' + SJ.comp + ' ' + eng[2]) + '</div>' +
      '<details class="dm-subjx"><summary class="dm-subj focus">' + subjRow(SJ.maths, avg, t('mathTitle')) + '<span class="dm-chev" aria-hidden="true">▾</span></summary>' + bars +
        '<p class="dm-explain">' + esc(t('mathWhy', { pct: mm[lowTopic], topic: lc(MATH[lowTopic]), n: n, skill: lc(SKILL[MATH_SKILL[lowTopic]]), band: BAND[linked.band] })) + '</p>' +
        (ST.uploads[s.id] ? '' : '<button class="btn-line sm focus dm-upbtn" data-demo-upload="' + esc(s.id) + '">' + ICON.up + ' ' + esc(t('upGo')) + '</button>') + '</details>' +
      '<div class="dm-subj">' + subjRow(SJ.science, mean(sci), SJ.living + ' ' + sci[0] + ' · ' + SJ.materials + ' ' + sci[1]) + '</div></div>';
    var weekly = '<div class="ui-card dm-card"><h3>' + esc(t('weekly')) + '</h3>' + assessOf(s).map(function (a) { return '<div class="dm-bar"><span class="dm-barl">' + esc(a.name) + ' <small>' + esc(a.when) + '</small></span><span class="dm-bart"><i style="width:' + a.score + '%"></i></span><b>' + a.score + '%</b></div>'; }).join('') + '</div>';
    var ICONS = ['book', 'globe', 'palette', 'triangle', 'pencil', 'tree'].map(window.TIcon), pi = hash(s.id + 'port') % C.port.length;
    var files = '<div class="ui-card dm-card"><h3>' + esc(C.dFiles) + '</h3><div class="dd-files">' + filesOf(s).map(function (x, i) { return fileTile(s, x, i); }).join('') +
      '<button class="dd-file dd-add focus" data-demo-dup="' + esc(s.id) + '"><span>＋</span>' + esc(C.dAddFile) + '</button></div></div>';
    var portfolio = '<div class="ui-card dm-card"><h3>' + esc(t('portfolio')) + '</h3><ul class="dm-port">' + [0, 2, 4].map(function (k) { var i = (pi + k) % C.port.length; return '<li><span>' + ICONS[i] + '</span>' + esc(C.port[i]) + '</li>'; }).join('') + '</ul></div>';
    // quiet footer: where school data comes from + who owns the record (opens on tap)
    var foot = '<div class="dm-ppfoot"><span class="dm-sync">↻ ' + esc(t('sdSync')) + '</span>' +
      '<details class="dm-own"><summary class="focus">' + window.TIcon('shield') + ' ' + esc(t('ownTitle', { n: n })) + '</summary><p>' + esc(t('ownBody', { n: n })) + '</p>' +
      '<ul>' + C.ownItems.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><p class="dm-meta">' + esc(t('ownBy')) + '</p></details></div>';
    // Order: This year (notes | school record) → Earlier years (TD html) → Record changes (TD, folded) → footer.
    // TD-built html stays outside [data-demo] so the DOM translator covers it.
    return '<div class="dm-pp"><div data-demo><h2 class="ui-title lg dm-mlh">' + esc(t('mlThisYear')) + '</h2>' +
      '<div class="dm-ppgrid"><div class="dm-col">' + notes + files + '</div>' +
        '<div class="dm-col">' + subjects + weekly + portfolio + '</div></div></div>' +   // Portfolio fills the right column, beside Files (Nov 12, user)
      (history || '') + (changes || '') + '<div data-demo>' + foot + '</div></div>';
  }

  // ---------- shared school records (one source for the Data page and the passport's School data tab) ----------
  function dayLabel(d) { return d.toLocaleDateString(D.locale, { weekday: 'short', day: 'numeric', month: 'short' }); }
  function schoolDaysAgo(n) { var d = new Date(); d.setHours(12); var k = 0; while (k < n) { d.setDate(d.getDate() - 1); if (d.getDay() % 6) k++; } return d; }
  // Attendance: one record per child per school day this term (sample, stable per child).
  // Day index = school days ago (0 = today). A third of absences fall in the week a bug went round,
  // so the class grid shows a few lighter days. Today only counts once attendance is taken.
  var TERM_DAYS = 50, TDAYS = null;
  function termDays() {   // [{ i, date }] oldest → today
    var key = new Date().toDateString();
    if (TDAYS && TDAYS.key === key) return TDAYS.list;
    var list = [], d = new Date(); d.setHours(12, 0, 0, 0);
    if (d.getDay() % 6) list.push({ i: 0, date: new Date(d) });
    for (var i = 1; i < TERM_DAYS; i++) { do { d.setDate(d.getDate() - 1); } while (!(d.getDay() % 6)); list.push({ i: i, date: new Date(d) }); }
    list.reverse(); TDAYS = { key: key, list: list }; return list;
  }
  function attModel(s) {   // { daysAgo: 'A' | 'L' }; anything missing = present
    var c = cast() || {}, m = {}, h = hash(s.id + 'att'), need = s === c.home ? 4 : 1 + h % 4, k = 0;
    if (s === c.home) { m[3] = 'A'; m[4] = 'A'; }   // Wed + Thu last week: the child who was off
    while (Object.keys(m).length < need && k < 60) {
      var x = hash(s.id + 'a' + k++), d = x % 3 === 0 ? 18 + x % 5 : 1 + x % (TERM_DAYS - 1);
      if (!m[d]) m[d] = 'A';
    }
    for (var j = 0; j < h % 3; j++) { var y = 1 + hash(s.id + 'l' + j) % (TERM_DAYS - 1); if (!m[y]) m[y] = 'L'; }
    var td = ST.attToday[s.id]; if (ST.attTaken && td && td !== 'P') m[0] = td;
    return m;
  }
  function attOf(s) {
    var m = attModel(s), total = TERM_DAYS - 1 + (ST.attTaken ? 1 : 0), abs = [], late = 0, byI = {};
    termDays().forEach(function (x) { byI[x.i] = x.date; });
    Object.keys(m).forEach(function (d) { if (m[d] === 'A') abs.push(+d); else late++; });
    abs.sort(function (a, b) { return a - b; });
    return { pct: Math.round((total - abs.length) / total * 100), days: abs.length, late: late, total: total, map: m,
      absent: abs.map(function (d) { return dayLabel(byI[d] || new Date()); }), today: ST.attToday[s.id] || null };
  }
  function weeklyPct(s, i) { var base = clamp(Math.round((s.overallPct || 55) * 0.5 + 40), 45, 95); return clamp(base + (hash(s.id + 'w' + i) % 29) - 14, 35, 99); }
  function weeklyOf(s) { return C.weeklyItems.map(function (w, i) { return { name: w, when: fill(C.dWeek, { w: i + 1 }), score: weeklyPct(s, i) }; }); }
  // Academic assessments: the weekly checks (newest first) plus anything the teacher adds.
  // The newest weekly check is only partly marked, so completion isn't 100%.
  function acadList() {
    if (!ST.acad) {
      var ks = allKids(), MAX = [20, 10, 10, 10];
      var n = C.weeklyItems.length;
      ST.acad = C.weeklyItems.map(function (w, i) {
        var gAgo = 3 + (n - 1 - i) * 5, sc = {}, dt = {};   // given: newest 3 school days ago, then a week apart; each child finished 1–3 days later
        ks.forEach(function (s, j) { if (i < 3 || j % 3) { sc[s.id] = Math.round(weeklyPct(s, i) * MAX[i] / 100); dt[s.id] = schoolDaysAgo(Math.max(0, gAgo - 1 - hash(s.id + 'ad' + i) % 3)); } });
        return { id: 'w' + i, name: w, max: MAX[i], when: fill(C.dWeek, { w: i + 1 }), given: schoolDaysAgo(gAgo), scores: sc, dates: dt, files: {} };
      }).reverse();
    }
    return ST.acad;
  }
  function assessOf(s) {   // newest first: uploaded maths sheets, then every marked academic assessment
    var up = (ST.files[s.id] || []).filter(function (f) { return f.score; }).map(function (f) { return { name: f.title, when: f.when, score: f.score }; });
    return up.concat(acadList().filter(function (a) { return a.scores[s.id] != null; }).map(function (a) { return { name: a.name, when: a.when, score: Math.round(a.scores[s.id] / a.max * 100) }; }));
  }
  var SAMPLE_PDF = L === 'es' ? 'assets/samples/reading-record-es.pdf' : 'assets/samples/reading-record-en.pdf';
  var SAMPLES = {
    maths: [0, 1, 2].map(function (i) { return { src: 'assets/sheets/sheet-' + (i + 1) + '.svg', kind: 'img', sheet: i }; }),
    spelling: [{ src: 'assets/samples/spelling-' + L + '.svg', kind: 'img' }],
    reading: [{ src: SAMPLE_PDF, thumb: 'assets/samples/reading-record-thumb.svg', kind: 'pdf' }],
    science: [{ src: 'assets/samples/science.svg', kind: 'img' }],
    other: [],
  };
  function sampleFile(type, i, when) {
    var x = SAMPLES[type][i]; return { type: type, title: C.types[type], when: when, src: x.src, thumb: x.thumb || x.src, kind: x.kind, sample: true, sheet: x.sheet };
  }
  function filesOf(s) {   // newest first: what was added in this session, then 2–3 sample files per child
    // Same names and weeks as the Academics list (C.weeklyItems: Week 1 spelling · 2 maths · 3 reading · 4 science), newest first.
    var h = hash(s.id + 'files'), wk = function (type, i, w) { var f = sampleFile(type, i, fill(C.dWeek, { w: w + 1 })); f.title = C.weeklyItems[w]; return f; };
    var base = [h % 2 ? wk('reading', 0, 2) : wk('science', 0, 3), wk('maths', h % 3, 1), wk('spelling', 0, 0)];
    return (ST.files[s.id] || []).concat(base);
  }
  function fileTile(s, f, i) {
    return '<button class="dd-file focus" data-demo-file="' + esc(s.id) + ':' + i + '">' +
      '<img src="' + esc(f.thumb) + '" alt="" loading="lazy"><span class="dd-ftitle">' + esc(f.title) + '</span>' +
      '<span class="dd-fmeta">' + esc(f.when) + (f.kind === 'pdf' ? ' · PDF' : '') + ' · ' + esc(f.sample ? C.dSample : C.dYours) + '</span></button>';
  }
  function toast(msg) {
    var el = document.getElementById('dm-toast');
    if (!el) { el = document.createElement('div'); el.id = 'dm-toast'; el.setAttribute('data-demo', ''); el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('on'); }, 3200);
  }

  // ---------- Assess: Social-emotional · Academics · Files & records ----------
  // Page tabs; on Academics, By assessment | By child and ＋ New assessment sit on a row under them, left-aligned.
  function assessTabs(active) {
    return '<div class="rc-toprow" data-demo><div class="rc-tabs" role="tablist">' + [['emo', 'todo', C.rEmo], ['acad', 'acad', C.tabAcad], ['records', 'records', C.tabRecords]].map(function (x) {
      return '<button class="rc-tab focus' + (active === x[0] ? ' on' : '') + '" role="tab" aria-selected="' + (active === x[0]) + '" data-assesstab="' + x[1] + '">' + esc(x[2]) + '</button>';
    }).join('') + '</div>' + (active === 'acad' ? acadTools() : '') + '</div>';
  }
  function acadTools() {
    var view = ST.acadView === 'k' ? 'k' : 'a';
    var bar = '<div class="ui-tabs rc-viewtabs" role="group">' + [['a', C.rViewA], ['k', C.rViewK]].map(function (x) {   // underline tabs (design-system .ui-tab), not a capsule
      return '<button class="ui-tab focus' + (view === x[0] ? ' on' : '') + '" aria-pressed="' + (view === x[0]) + '" data-demo-acview="' + x[0] + '">' + esc(x[1]) + '</button>';
    }).join('') + '</div>';
    var nb = !(ST.acadForm && ST.acadForm.open) ? '<button class="btn btn-primary sm focus" data-demo-acadform="1">＋ ' + esc(C.rNew) + '</button>' : '';
    return '<div class="rc-toptools">' + bar + nb + '</div>';
  }
  function attSummary() {
    var ks = allKids(), n = ks.length;
    if (!ST.attTaken) return null;
    var a = ks.filter(function (k) { return ST.attToday[k.id] === 'A'; }).length, l = ks.filter(function (k) { return ST.attToday[k.id] === 'L'; }).length;
    return { n: n, p: n - a, late: l };
  }
  // GitHub-style grid: one column per week, one square per school day (Mon–Fri). Squares are buttons: tap = look up that day.
  function heatGrid(cell, days) {
    var cols = [], col = null, lastWd = 9, lastMonth = -1;
    days.forEach(function (x) {
      var wd = x.date.getDay();
      if (wd <= lastWd) { col = { month: '', cells: [null, null, null, null, null] }; cols.push(col); }
      lastWd = wd;
      var mo = x.date.getMonth(); if (mo !== lastMonth) { col.month = x.date.toLocaleDateString(D.locale, { month: 'short' }); lastMonth = mo; }
      col.cells[wd - 1] = x;
    });
    var wdName = function (k) { return new Date(2024, 0, 1 + k).toLocaleDateString(D.locale, { weekday: 'short' }); };   // 1 Jan 2024 = Monday
    return '<div class="rc-heat" style="--rc-cols:' + cols.length + '"><div class="rc-hcol rc-hdays"><span class="rc-hmon"></span>' + [0, 1, 2, 3, 4].map(function (k) { return '<span class="rc-hday">' + (k % 2 ? '' : esc(wdName(k))) + '</span>'; }).join('') + '</div>' +
      cols.map(function (c) {
        return '<div class="rc-hcol"><span class="rc-hmon">' + esc(c.month) + '</span>' + c.cells.map(function (x) {
          if (!x) return '<i class="rc-c rc-cx"></i>';
          var r = cell(x), sel = ST.attDay === x.i;
          return '<button class="rc-c focus ' + r.cls + (sel ? ' rc-sel' : '') + '" data-demo-attday="' + x.i + '" title="' + esc(r.tip) + '" aria-label="' + esc(r.tip) + '" aria-pressed="' + sel + '"></button>';
        }).join('') + '</div>';
      }).join('') + '</div>';
  }
  function heatLegend(labels) {
    return '<div class="rc-legend">' + labels.map(function (l, i) { return '<span><i class="rc-c rc-c' + (i + 1) + '"></i>' + esc(l) + '</span>'; }).join('') + '</div>';
  }
  function dayOf(i) { var x = termDays().find(function (d) { return d.i === i; }); return x ? x.date : null; }
  function notTaken(i) { return i === 0 && !ST.attTaken; }
  // One child's day grid (School data tab on their page). Tap a day → that day's status under the grid.
  function childAttGrid(s) {
    var a = attOf(s), picked = ST.attDay != null && termDays().some(function (x) { return x.i === ST.attDay; }) ? ST.attDay : null;
    var line = picked == null ? '<p class="dm-meta rc-pick">' + esc(fill(C.rPickDayKid, { n: nm(s) })) + '</p>'
      : '<div class="rc-day"><b>' + esc(notTaken(picked) ? dayLabel(dayOf(picked)) + ' · ' + C.rNotYet : fill(C.rStuTip[a.map[picked] || 'P'], { date: dayLabel(dayOf(picked)) })) + '</b>' +
        '<button class="dialog-close dm-x focus" data-demo-attday="" aria-label="' + esc(C.dClose) + '">×</button></div>';
    return '<div class="rc-small">' + heatGrid(function (x) {
      if (notTaken(x.i)) return { cls: 'rc-c0', tip: dayLabel(x.date) + ' · ' + C.rNotYet };
      var v = a.map[x.i] || 'P'; return { cls: v === 'A' ? 'rc-c1' : v === 'L' ? 'rc-c2' : 'rc-c3', tip: fill(C.rStuTip[v], { date: dayLabel(x.date) }) };
    }, termDays()) + heatLegend(C.rStuBands) + line + '</div>';
  }
  function attSection() {
    var ks = allKids(), n = ks.length, sum = attSummary(), days = termDays();
    var models = ks.map(attModel);
    var dayPct = function (i) { return Math.round(models.filter(function (m) { return m[i] !== 'A'; }).length / n * 100); };
    var counted = days.filter(function (x) { return !notTaken(x.i); });
    var avg = counted.length ? Math.round(counted.reduce(function (s2, x) { return s2 + dayPct(x.i); }, 0) / counted.length) : 0;
    var head = '<div class="rc-sechead"><div><h2>' + esc(C.rAtt) + '</h2><p>' + esc((sum ? fill(C.dPresent, { p: sum.p, n: sum.n }) + (sum.late ? ' · ' + fill(C.dLate, { k: sum.late }) : '') + ' · ' : '') + fill(C.rClassAvg, { p: avg })) + '</p></div>' +
      '<div class="rc-headacts"><button class="btn-line sm focus" data-demo-attall>' + esc(C.rAllKids) + '</button>' +
      '<details class="rc-attmenu"><summary class="btn btn-primary sm focus">' + esc(sum ? C.dEdit : C.dTake) + ' <span aria-hidden="true">▾</span></summary>' +
        '<div class="rc-attpop" role="menu"><button class="rc-attopt focus" role="menuitem" data-demo-att>' + window.TIcon('pencil') + '' + esc(C.dAttManual) + '</button>' +
        '<button class="rc-attopt focus" role="menuitem" data-demo-attup>' + ICON.up + ' ' + esc(C.dAttUpload) + '</button></div></details></div></div>';
    var picked = ST.attDay != null && days.some(function (x) { return x.i === ST.attDay; }) ? ST.attDay : null;
    var grid = heatGrid(function (x) {
      if (notTaken(x.i)) return { cls: 'rc-c0', tip: dayLabel(x.date) + ' · ' + C.rNotYet };
      var p = models.filter(function (m) { return m[x.i] !== 'A'; }).length, pct = Math.round(p / n * 100);
      return { cls: pct >= 95 ? 'rc-c3' : pct >= 85 ? 'rc-c2' : 'rc-c1', tip: fill(C.rCellTip, { date: dayLabel(x.date), p: p, n: n, pct: pct }) };
    }, days);
    // The picked day: who was absent / late (tap a name to open that child's page).
    var dayBox = '';   // no standing hint: the squares are buttons (hover shows the day)
    if (picked != null) {
      var dl = dayLabel(dayOf(picked)), close = '<button class="dialog-close dm-x focus" data-demo-attday="" aria-label="' + esc(C.dClose) + '">×</button>';
      if (notTaken(picked)) dayBox = '<div class="rc-day"><div class="rc-dayhead"><b>' + esc(dl) + '</b><span>' + esc(C.rNotYet) + '</span>' + close + '</div></div>';
      else {
        var who = function (v) { return ks.filter(function (k, j) { return models[j][picked] === v; }); };
        var abs = who('A'), late = who('L'), chip = function (k) { return '<button class="rc-who-chip focus" data-demo-attstu="' + esc(k.id) + '">' + esc(k.name) + '</button>'; };
        dayBox = '<div class="rc-day"><div class="rc-dayhead"><b>' + esc(dl) + '</b><span>' + esc(fill(C.dPresent, { p: n - abs.length, n: n })) + '</span>' + close + '</div>' +
          (abs.length || late.length
            ? (abs.length ? '<div class="rc-dayrow"><em class="dd-pill A">' + esc(C.rDayAbs) + '</em>' + abs.map(chip).join('') + '</div>' : '') +
              (late.length ? '<div class="rc-dayrow"><em class="dd-pill L">' + esc(C.rDayLate) + '</em>' + late.map(chip).join('') + '</div>' : '')
            : '<p class="dm-meta m-0">' + esc(C.rAllIn) + '</p>') + '</div>';
      }
    }
    return '<section class="rc-sec" data-demo>' + head + grid + heatLegend(C.rBands) + dayBox + '</section>';
  }
  // Pop-up: every child's attendance, lowest first, with search. A child opens their page (School data tab).
  var ATT_LOW = 90, DONE_LOW = 50;   // below these % a figure turns warm (child attendance · marking)
  function attListOpen() {
    var ks = allKids(), atts = ks.map(attOf);
    var rows = ks.map(function (s, i) { return { s: s, a: atts[i] }; }).sort(function (x, y) { return x.a.pct - y.a.pct; }).map(function (r) {
      var s = r.s, a = r.a, pill = a.today && a.today !== 'P' ? '<em class="dd-pill ' + a.today + '">' + esc(C.st[a.today]) + '</em>' : '';
      return '<li class="dd-row" data-name="' + esc(s.name.toLowerCase()) + '"><button class="dd-head focus" data-demo-attstu="' + esc(s.id) + '">' +
        '<span class="ui-avatar sm">' + esc(((s.first || '')[0] || '') + ((s.last || '')[0] || '')) + '</span>' +
        '<span class="dd-name"><b>' + esc(s.name) + '</b>' + pill + '<span class="dd-meta"><span>' + esc(fill(a.days === 1 && C.rAbsN1 || C.rAbsN, { d: a.days })) + '</span><span>' + esc(fill(a.late === 1 && C.rLateN1 || C.rLateN, { d: a.late })) + '</span></span></span>' +
        '<b class="rc-apct' + (a.pct < ATT_LOW ? ' low' : '') + '">' + a.pct + '%</b><span class="dd-chev" aria-hidden="true">›</span></button></li>';
    }).join('');
    ST.dataQ = '';
    var el = overlay('dm-attlist', '<div class="dm-uphead"><h3>' + esc(C.rAllKidsT) + '</h3><button class="dialog-close dm-x focus" data-demo-ovclose aria-label="' + esc(C.dClose) + '">×</button></div>' +
      '<input class="dd-search rc-listq" type="search" data-demo-dsearch placeholder="' + esc(C.dSearch) + '" aria-label="' + esc(C.dSearch) + '">' +
      '<ul class="dd-list rc-list">' + rows + '</ul><p class="dd-none" hidden>' + esc(C.dNone) + '</p>');
    var q = el.querySelector('.rc-listq'); if (q) q.focus();
  }
  // Social-emotional tab: the flower journey (passed in from teacher-dashboard.js). Academics tab: marks only.
  function assessPage(vine, sub) {
    if (sub === 'acad') {
      return '<div class="rc"><div data-demo>' + acadPane() + '</div></div>';
    }
    return '<div class="rc">' + (vine || '') + '</div>';
  }
  function acadPane() {
    var ks = allKids(), f = ST.acadForm || {};
    var form = '<div class="rc-new">' + (f.open
      ? '<div class="rc-newform"><label class="dm-lbl">' + esc(C.rName) + '<input class="dd-search rc-in" id="rc-name" placeholder="' + esc(C.rNamePh) + '" value="' + esc(f.name || '') + '"></label>' +
        '<label class="dm-lbl">' + esc(C.rMax) + '<input class="dd-search rc-in rc-max" id="rc-max" type="number" min="1" inputmode="numeric" placeholder="20" value="' + esc(f.max || '') + '"></label>' +
        '<div class="rc-newacts"><button class="btn btn-ghost focus" data-demo-acadform="0">' + esc(C.dCancel) + '</button><button class="btn btn-primary sm focus" data-demo-acadcreate>' + esc(C.rCreate) + '</button></div>' +
        (f.err ? '<p class="rc-err" role="alert">' + esc(f.err) + '</p>' : '') + '</div>'
      : '') + '</div>';
    var view = ST.acadView === 'k' ? 'k' : 'a';   // view switch + New assessment live in the top row (acadTools)
    if (view === 'k') return form + acadMatrix();
    var list = acadList().map(function (a) {
      var marked = ks.filter(function (s) { return a.scores[s.id] != null; }), open = ST.acadOpen === a.id, left = ks.length - marked.length;
      var avg = marked.length ? Math.round(marked.reduce(function (x, s) { return x + a.scores[s.id] / a.max * 100; }, 0) / marked.length) : null;
      var body = '';
      if (open) {
        var filt = ST.acadFilter === 'not' && left ? 'not' : 'all', dates = a.dates || {};
        var chips = left ? '<div class="log-tabs">' + [['all', fill(C.rFAll, { k: ks.length })], ['not', fill(C.rFNot, { k: left })]].map(function (x) {
          return '<button class="ui-filterchip dark atab' + (filt === x[0] ? ' on' : '') + '" data-demo-acfilter="' + x[0] + '">' + esc(x[1]) + '</button>';
        }).join('') + '</div>' : '';
        var order = ks.slice().sort(function (x, y) { return (a.scores[x.id] != null) - (a.scores[y.id] != null); });   // not completed first
        // Opened: the children as a grid of tiles (not completed first), each with status, score and paper.
        body = '<div class="rc-abody"><div class="rc-ahead"><b class="rc-acount' + (left ? '' : ' full') + '">' + esc(fill(C.rDoneN, { a: marked.length, b: ks.length })) + '</b>' + chips + '</div>' +
          '<div class="rc-aacts"><button class="btn-line sm focus" data-demo-acup="' + a.id + ':class">' + ICON.up + ' ' + esc(C.rUpClass) + '</button>' +
          '<button class="btn-line sm focus" data-demo-acup="' + a.id + ':one">' + ICON.up + ' ' + esc(C.rUpOne) + '</button></div>' +
          '<ul class="rc-kgrid">' +
          order.filter(function (s) { return filt === 'all' || a.scores[s.id] == null; }).map(function (s) {
            var v = a.scores[s.id], fi = a.files[s.id] ? filesOf(s).indexOf(a.files[s.id]) : -1;
            return '<li class="rc-kid' + (v != null ? '' : ' no') + '"><b class="rc-kname">' + esc(s.name) + '</b>' +
              '<strong class="rc-kscore">' + (v != null ? esc(fill(C.rScoreOf, { s: v, m: a.max })) : '—') + '</strong>' +
              (v != null ? '<em class="rc-tag ok">' + esc(fill(C.rTagDone, { d: shortDate(dates[s.id]) })) + '</em>' : '<em class="rc-tag no">' + esc(C.rTagNot) + '</em>') +
              (fi >= 0 ? '<button class="rc-file focus" data-demo-file="' + esc(s.id) + ':' + fi + '">' + window.TIcon('paperclip') + ' ' + esc(C.rPaper) + '</button>' : '') + '</li>';
          }).join('') + '</ul></div>';
      }
      // Each assessment is a card: name · when, the class average large, a marking bar, then status.
      var pct = ks.length ? Math.round(marked.length / ks.length * 100) : 0;
      // ⋯ menu (Edit · Delete); Edit swaps the header for a form, Delete asks first (Nov 12, user).
      var menu = '<details class="rc-amenu"><summary class="rc-amore focus" aria-label="' + esc(C.acMore) + '">⋯</summary><div class="rc-attpop rc-apop">' +
        '<button class="rc-attopt focus" data-demo-acedit="' + a.id + '">' + ICON.note + esc(C.acEdit) + '</button><button class="rc-attopt rc-optdel focus" data-demo-acdel="' + a.id + '">' + ICON.trash + esc(C.acDel) + '</button></div></details>';
      var delAsk = ST.acDel === a.id ? '<div class="rc-adel" role="alert"><p>' + esc(fill(C.acDelQ, { name: a.name })) + '</p><div class="rc-newacts">' +
        '<button class="btn btn-ghost focus" data-demo-acdel="0">' + esc(C.dCancel) + '</button><button class="btn btn-danger sm focus" data-demo-acdelyes="' + a.id + '">' + esc(C.acDel) + '</button></div></div>' : '';
      return '<li class="rc-acard' + (open ? ' open' : '') + '" id="rc-a-' + a.id + '">' + menu + delAsk + '<button class="rc-ahd focus" data-demo-acopen="' + a.id + '" aria-expanded="' + open + '">' +
        '<span class="rc-atop"><b class="rc-aname">' + esc(a.name) + '</b><span class="dd-chev" aria-hidden="true">' + (open ? '▴' : '▾') + '</span></span>' +
        '<span class="rc-awhen">' + esc(a.when + (a.given ? ' · ' + shortDate(a.given) : '')) + '</span>' +
        '<span class="rc-abig"><b>' + (avg != null ? avg + '%' : '—') + '</b><small>' + esc(C.rAvgLbl) + '</small></span>' +
        '<span class="rc-aprog' + (left ? '' : ' full') + '"><i style="width:' + pct + '%"></i></span>' +
        // Footer says it once: "9 of 14 done · 5 left", or just "✓ All 14 marked" (Nov 13, user: less text).
        '<span class="rc-afoot">' + (left ? '<span>' + esc(fill(C.rDoneS, { a: marked.length, b: ks.length })) + '</span><b class="rc-mk' + (pct < DONE_LOW ? ' low' : '') + '">' + esc(fill(C.rLeft, { k: left })) + '</b>'
          : '<b class="rc-mk full">✓ ' + esc(fill(C.rAllMarked, { b: ks.length })) + '</b>') + '</span>' +
        '</button>' + body + '</li>';
    }).join('');
    return form + '<ul class="rc-agrid">' + list + '</ul>';
  }
  function shortDate(d) { return d ? d.toLocaleDateString(D.locale, { day: 'numeric', month: 'short' }) : ''; }
  function closeAcMenus() { Array.prototype.forEach.call(document.querySelectorAll('.rc-amenu[open]'), function (d) { d.removeAttribute('open'); }); }
  function isoDay(d) { if (!d) return ''; var p = function (x) { return (x < 10 ? '0' : '') + x; }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
  // ⋯ → Edit opens a pop-up (Nov 13, user): name · maximum score · date given. Keeps typed values and shows the error on a failed save.
  function acEditRender() {
    var a = acadList().find(function (x) { return x.id === ST.acEdit; }); if (!a) return;
    var ef = ST.acEditForm || {};
    overlay('dm-aceditov', '<div class="dm-uphead"><h3>' + esc(C.acEdit) + ' · ' + esc(a.name) + '</h3><button class="dialog-close dm-x focus" data-demo-acedit="0" aria-label="' + esc(C.dClose) + '">×</button></div>' +
      '<div class="rc-aedit rc-aedit-pop">' +
        '<label class="dm-lbl">' + esc(C.rName) + '<input class="dd-search rc-in" id="rc-ename" value="' + esc(ef.name != null ? ef.name : a.name) + '"></label>' +
        '<label class="dm-lbl">' + esc(C.rMax) + '<input class="dd-search rc-in rc-max" id="rc-emax" type="number" min="1" inputmode="numeric" value="' + esc(ef.max != null ? ef.max : a.max) + '"></label>' +
        '<label class="dm-lbl">' + esc(C.acDate) + '<input class="dd-search rc-in" id="rc-edate" type="date" max="' + isoDay(new Date()) + '" value="' + esc(ef.date != null ? ef.date : isoDay(a.given)) + '"></label>' +
        (ef.err ? '<p class="rc-err" role="alert">' + esc(ef.err) + '</p>' : '') +
        '<div class="rc-newacts"><button class="btn btn-ghost focus" data-demo-acedit="0">' + esc(C.dCancel) + '</button><button class="btn btn-primary sm focus" data-demo-acsave="' + a.id + '">' + esc(C.acSave) + '</button></div>' +
      '</div>');
  }
  function acEditClose() { ST.acEdit = null; ST.acEditForm = null; var x = document.getElementById('dm-aceditov'); if (x) x.remove(); }
  // Save an edited assessment: name, total marks (children keep their percentage), date given.
  function acadSave(id) {
    var a = acadList().find(function (x) { return x.id === id; }); if (!a) return;
    var g = function (k) { var el = document.getElementById(k); return el ? el.value : ''; };
    var name = g('rc-ename').trim(), max = parseInt(g('rc-emax'), 10), date = g('rc-edate');
    ST.acEditForm = { name: g('rc-ename'), max: g('rc-emax'), date: date };
    var err = !name ? C.rNameErr : !(max > 0) ? C.rMaxErr : !/^\d{4}-\d{2}-\d{2}$/.test(date) ? C.acDateErr : '';
    if (err) { ST.acEditForm.err = err; acEditRender(); var fe = document.getElementById(!name ? 'rc-ename' : !(max > 0) ? 'rc-emax' : 'rc-edate'); if (fe) fe.focus(); return; }
    if (max !== a.max) Object.keys(a.scores).forEach(function (k) { a.scores[k] = Math.round(a.scores[k] / a.max * max); });
    a.name = name; a.max = max; a.given = new Date(date + 'T12:00:00');
    acEditClose(); window.TD.render();
  }
  // View 2: every child × every assessment. A score means completed; only gaps get a tag. Children with the most gaps first.
  function acadMatrix() {
    var ks = allKids(), L2 = acadList();
    var miss = function (s) { return L2.filter(function (a) { return a.scores[s.id] == null; }).length; };
    var rows = ks.slice().sort(function (x, y) { return miss(y) - miss(x) || x.name.localeCompare(y.name); });
    var head = '<tr><th scope="col" class="rc-mxname">' + esc(C.rCol.stu) + '</th>' + L2.map(function (a) {
      return '<th scope="col"><button class="rc-mxa focus" data-demo-acopenx="' + a.id + '"><b>' + esc(a.name) + '</b><span>' + esc(shortDate(a.given)) + '</span></button></th>';
    }).join('') + '</tr>';
    var body = rows.map(function (s) {
      return '<tr><th scope="row" class="rc-mxname"><button class="rc-mxkid focus" data-demo-attstu="' + esc(s.id) + '">' + esc(s.name) + '</button></th>' + L2.map(function (a) {
        var v = a.scores[s.id]; return '<td>' + (v != null ? esc(fill(C.rScoreOf, { s: v, m: a.max })) : '<em class="rc-tag no">' + esc(C.rMissing) + '</em>') + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return '<p class="rc-mxhint"><span aria-hidden="true">⇆</span>' + esc(C.rSwipe) + '</p><div class="rc-mxwrap"><table class="rc-mx"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
  }
  // Records tab: Done so far (passed in from teacher-dashboard.js, translated there), class files.
  function recordsPage(doneSoFar) {
    return '<div class="rc">' + (doneSoFar ? '<section class="rc-sec" id="rc-donesec">' + doneSoFar + '</section>' : '') + filesSection() + '</div>';
  }
  // My Garden: attendance sits under the Monday plan (moved out of Records).
  function gardenAttendance() { return '<div class="rc mg-att">' + attSection() + '</div>'; }
  // Every child's papers in one place, newest first (each child's newest, then the next…). Filter by child; 12 shown until "Show all".
  var FILES_LIM = 12, FILES_LIM_PHONE = 5;   // files shown before "Show all": desktop grid · phone list
  // Every file in the class (or one child's), interleaved newest-first across children.
  function filesAllOf() {
    var ks = allKids(), kid = ST.filesKid && ks.some(function (k) { return k.id === ST.filesKid; }) ? ST.filesKid : '';
    var lists = (kid ? ks.filter(function (k) { return k.id === kid; }) : ks).map(function (s) { return filesOf(s).map(function (f, i) { return { s: s, f: f, i: i }; }); });
    var all = [];
    for (var r = 0; lists.some(function (l) { return l[r]; }); r++) lists.forEach(function (l) { if (l[r]) all.push(l[r]); });
    return { ks: ks, kid: kid, all: all };
  }
  // One file as a list row (phones + the "Show all" pop-up): thumbnail · title · child · when.
  function fileRow(x, inPop) {
    return '<li class="' + (inPop ? 'dd-row' : 'rc-frow') + '"' + (inPop ? ' data-name="' + esc((x.s.name + ' ' + x.f.title).toLowerCase()) + '"' : '') + '>' +
      '<button class="rc-fbtn focus" data-demo-file="' + esc(x.s.id) + ':' + x.i + '"><img class="rc-fthumb" src="' + esc(x.f.thumb) + '" alt="" loading="lazy">' +
      '<span class="rc-finfo"><b>' + esc(x.f.title) + '</b><span>' + esc(x.s.name) + ' · ' + esc(x.f.when) + (x.f.kind === 'pdf' ? ' · PDF' : '') + '</span></span><span class="dd-chev" aria-hidden="true">›</span></button></li>';
  }
  function filesPop() {
    var F = filesAllOf();
    overlay('dm-fileslist', '<div class="dm-uphead"><h3>' + esc(C.rFiles) + ' · ' + esc(fill(C.rFilesN, { k: F.all.length })) + '</h3><button class="dialog-close dm-x focus" data-demo-ovclose aria-label="' + esc(C.dClose) + '">×</button></div>' +
      '<input class="dd-search rc-listq" type="search" data-demo-dsearch placeholder="' + esc(C.dSearch) + '" aria-label="' + esc(C.dSearch) + '">' +
      '<ul class="dd-list rc-list rc-flist">' + F.all.map(function (x) { return fileRow(x, true); }).join('') + '</ul><p class="dd-none" hidden>' + esc(C.dNone) + '</p>');
    ST.dataQ = '';
  }
  function filesSection() {
    var F = filesAllOf(), ks = F.ks, kid = F.kid, all = F.all;
    var shown = ST.filesAll ? all : all.slice(0, FILES_LIM);
    var sel = '<select class="select dm-select rc-fkid" data-demo-fkid aria-label="' + esc(C.rAllKids) + '"><option value="">' + esc(C.rAllKids) + '</option>' +
      ks.map(function (k) { return '<option value="' + esc(k.id) + '"' + (k.id === kid ? ' selected' : '') + '>' + esc(k.name) + '</option>'; }).join('') + '</select>';
    var tiles = shown.map(function (x) {
      return '<button class="dd-file focus" data-demo-file="' + esc(x.s.id) + ':' + x.i + '"><img src="' + esc(x.f.thumb) + '" alt="" loading="lazy"><span class="dd-ftitle">' + esc(x.f.title) + '</span>' +
        '<span class="dd-fmeta rc-fkidname">' + esc(x.s.name) + '</span><span class="dd-fmeta">' + esc(x.f.when) + (x.f.kind === 'pdf' ? ' · PDF' : '') + '</span></button>';
    }).join('');
    var add = '<button class="dd-file dd-add focus" data-demo-dup="' + esc(kid || (ks[0] || {}).id || '') + '"><span>＋</span>' + esc(C.dAddFile) + '</button>';
    return '<section class="rc-sec" data-demo id="rc-files"><div class="rc-sechead"><div><h2>' + esc(C.rFiles) + '</h2><p>' + esc(fill(C.rFilesN, { k: all.length })) + '</p></div>' +
      '<div class="rc-headacts">' + sel + '</div></div><div class="dd-files rc-fdesk">' + tiles + add + '</div>' +
      (all.length > FILES_LIM ? '<button class="btn-line sm focus mt-3 rc-fdesk" data-demo-fall>' + esc(ST.filesAll ? C.rFilesLess : fill(C.rFilesAll, { k: all.length })) + '</button>' : '') +
      // Phones (Nov 12, user): a list of the newest few; "Show all N" opens every file in a pop-up.
      '<ul class="rc-flist rc-fphone">' + all.slice(0, FILES_LIM_PHONE).map(function (x) { return fileRow(x, false); }).join('') + '</ul>' +
      '<div class="rc-facts rc-fphone">' + (all.length > FILES_LIM_PHONE ? '<button class="btn-line sm focus" data-demo-fpop>' + esc(fill(C.rFilesAll, { k: all.length })) + '</button>' : '') +
        '<button class="btn-line sm focus" data-demo-dup="' + esc(kid || (ks[0] || {}).id || '') + '">＋ ' + esc(C.dAddFile) + '</button></div></section>';
  }
  function acadCreate() {
    var nmIn = document.getElementById('rc-name'), mxIn = document.getElementById('rc-max');
    var name = (nmIn && nmIn.value || '').trim(), max = parseInt(mxIn && mxIn.value, 10);
    ST.acadForm = { open: true, name: name, max: mxIn ? mxIn.value : '' };
    if (!name) { ST.acadForm.err = C.rNameErr; window.TD.render(); var a = document.getElementById('rc-name'); if (a) a.focus(); return; }
    if (!(max > 0)) { ST.acadForm.err = C.rMaxErr; window.TD.render(); var b = document.getElementById('rc-max'); if (b) b.focus(); return; }
    var id = 'n' + Date.now();
    acadList().unshift({ id: id, name: name, max: max, when: C.dTodayW, given: new Date(), scores: {}, dates: {}, files: {} });
    ST.acadForm = null; ST.acadOpen = id; window.TD.render();
  }
  // Upload for an academic assessment: one class PDF (split per child) or one child's paper. Scripted, like the maths sheet.
  var AU = null;   // { aid, mode: 'class'|'one', stu, own, step: 'pick'|'read'|'result', res }
  function acScore(s, a) { var p = clamp(Math.round((s.overallPct || 55) * 0.5 + 40) + (hash(s.id + a.id) % 25) - 12, 30, 100); return Math.round(p * a.max / 100); }
  function auOpen(aid, mode) { AU = { aid: aid, mode: mode, stu: (allKids()[0] || {}).id, own: null, step: 'pick' }; auRender(); }
  function auRender() {
    var a = acadList().find(function (x) { return x.id === AU.aid; }); if (!a) return;
    var ks = allKids(), body = '', head = '<div class="dm-uphead"><h3>' + esc(fill(C.rUpTitle, { name: a.name })) + '</h3><button class="dialog-close dm-x focus" data-demo-ovclose aria-label="' + esc(C.dClose) + '">×</button></div>';
    var thumb = AU.own && AU.own.kind === 'img' ? AU.own.thumb : SHEETS[0];
    if (AU.step === 'pick') {
      var modes = '<div class="log-tabs mb-3">' + [['class', C.rModeClass], ['one', C.rModeOne]].map(function (x) {
        return '<button class="ui-filterchip dark atab' + (AU.mode === x[0] ? ' on' : '') + '" data-demo-aumode="' + x[0] + '">' + esc(x[1]) + '</button>';
      }).join('') + '</div>';
      var kid = AU.mode === 'one' ? '<label class="dm-lbl">' + esc(C.rChild) + '<select class="select dm-select" data-demo-austu>' + ks.map(function (k) { return '<option value="' + esc(k.id) + '"' + (k.id === AU.stu ? ' selected' : '') + '>' + esc(k.name) + '</option>'; }).join('') + '</select></label>' : '';
      var sample = '<div class="dm-sheets rc-pack"><button class="dm-sheet focus' + (AU.own ? '' : ' on') + '" data-demo-aupack aria-pressed="' + !AU.own + '"><img src="' + SHEETS[0] + '" alt=""><span>' +
        esc(AU.mode === 'class' ? fill(C.rPack, { k: ks.length * 2 }) : C.dSample) + '</span></button></div>';
      body = modes + (AU.mode === 'class' ? '<p class="dm-meta">' + esc(C.rClassHelp) + '</p>' : '') + kid + sample +
        '<div class="dm-lbl mt-3">' + esc(C.rOwnMany) + '</div><label class="btn-line sm dd-own focus">' + ICON.up + ' ' + esc(C.dUpOwnBtn) +
        '<input type="file" accept="image/*,application/pdf"' + (AU.mode === 'class' ? ' multiple' : '') + ' data-demo-aufile hidden></label>' +
        (AU.own ? '<p class="dd-chosen">' + (AU.own.kind === 'img' ? '<img src="' + esc(AU.own.thumb) + '" alt="">' : window.TIcon('file') + ' ') + esc(fill(C.rOwnChosen, { f: AU.own.name })) + '</p>' : '') +
        '<p class="dm-meta mt-3">' + window.TIcon('lock') + ' ' + esc(C.dUpLocal) + '</p>' +
        '<div class="dm-upacts"><button class="btn btn-ghost focus" data-demo-ovclose>' + esc(C.dCancel) + '</button><button class="btn btn-primary md focus" data-demo-auread>' + esc(AU.mode === 'class' ? C.rRead : C.rReadOne) + ' →</button></div>';
    } else if (AU.step === 'read') {
      body = '<div class="dm-scan"><img src="' + esc(thumb) + '" alt=""><i class="dm-scanline"></i></div><p class="dm-scanmsg" aria-live="polite">' + esc(C.rSteps[0]) + '</p>';
    } else {
      var res = AU.res;
      body = (AU.mode === 'class' ? '<p class="rc-resh">' + ICON.check + esc(fill(C.rResult, { k: res.length })) + '</p>' : '') +
        '<ul class="rc-scores rc-res">' + res.map(function (r) {
          return '<li><span>' + esc(r.s.name) + '</span><span class="dm-meta m-0">' + esc(AU.mode === 'class' ? fill(C.rPages, { a: r.p, b: r.p + 1 }) : '') + '</span><b>' + esc(fill(C.rScoreOf, { s: r.v, m: a.max })) + '</b></li>';
        }).join('') + '</ul><p class="dm-meta mt-3">' + esc(C.rSim) + '</p>' +
        '<div class="dm-upacts"><button class="btn btn-ghost focus" data-demo-ovclose>' + esc(C.dCancel) + '</button><button class="btn btn-primary md focus" data-demo-ausave>' +
          esc(AU.mode === 'class' ? fill(C.rSaveAll, { k: res.length }) : fill(C.rSaveOne, { n: nm(res[0].s) })) + '</button></div>';
    }
    overlay('dm-acov', head + body);
  }
  function auFile(files) {
    if (!files || !files.length) return;
    var f = files[0], names = Array.prototype.map.call(files, function (x) { return x.name; }).join(', ');
    var isPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name), url = URL.createObjectURL(f);
    AU.own = { name: names, kind: isPdf ? 'pdf' : 'img', src: url, thumb: isPdf ? 'assets/samples/reading-record-thumb.svg' : url };
    auRender();
  }
  function auRead() {
    var a = acadList().find(function (x) { return x.id === AU.aid; }), ks = allKids();
    var who = AU.mode === 'class' ? ks : ks.filter(function (k) { return k.id === AU.stu; });
    AU.res = who.map(function (s, i) { return { s: s, p: i * 2 + 1, v: acScore(s, a) }; });
    AU.step = 'read'; auRender();
    [700, 1400].forEach(function (ms, i) { setTimeout(function () { var m = document.querySelector('#dm-acov .dm-scanmsg'); if (AU && AU.step === 'read' && m) m.textContent = C.rSteps[i + 1]; }, ms); });
    setTimeout(function () { if (AU && AU.step === 'read') { AU.step = 'result'; auRender(); } }, 2300);
  }
  function auSave() {
    var a = acadList().find(function (x) { return x.id === AU.aid; }), own = AU.own;
    AU.res.forEach(function (r) {
      a.scores[r.s.id] = r.v; (a.dates = a.dates || {})[r.s.id] = new Date();
      var f = { type: 'other', title: a.name, when: C.dTodayW, src: own ? own.src : SHEETS[0], thumb: own ? own.thumb : SHEETS[0], kind: own ? own.kind : 'img', sample: !own };
      a.files[r.s.id] = f; (ST.files[r.s.id] = ST.files[r.s.id] || []).unshift(f);
    });
    var msg = AU.mode === 'class' ? fill(C.rSavedAll, { name: a.name, k: AU.res.length }) : fill(C.rSavedOne, { name: a.name, n: nm(AU.res[0].s) });
    AU = null; closeOverlays(); ST.acadOpen = a.id; window.TD.render(); toast(msg);
  }

  // ---------- overlays: attendance, upload, file viewer ----------
  function overlay(id, inner) {
    var el = document.getElementById(id);
    if (!el) { el = document.createElement('div'); el.id = id; el.className = 'dm-ov'; el.setAttribute('data-demo', ''); document.body.appendChild(el); }
    el.innerHTML = '<div class="ui-scrim dm-upscrim" data-demo-ovclose></div><div class="dm-upcard" role="dialog" aria-modal="true">' + inner + '</div>';
    return el;
  }
  function closeOverlays() { AU = null; ST.attUp = null; ST.acEdit = null; ST.acEditForm = null; ['dm-attov', 'dm-dupov', 'dm-view', 'dm-acov', 'dm-attlist', 'dm-fileslist', 'dm-aceditov'].forEach(function (id) { var x = document.getElementById(id); if (x) x.remove(); }); if (ST.dup && ST.dup.url && !ST.dup.saved) URL.revokeObjectURL(ST.dup.url); ST.dup = null; }
  function attOpen() {
    ST.attDraft = {}; ST.attFrom = null; allKids().forEach(function (k) { ST.attDraft[k.id] = ST.attToday[k.id] || 'P'; });
    attRender();
  }
  // Upload a register (CSV / PDF): pick → scripted read → the usual list, pre-filled, to check and save.
  var REG_THUMB = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#fff"/><rect width="300" height="44" fill="#e8f3ee"/>' +
    '<rect x="18" y="16" width="120" height="12" rx="6" fill="#4a8f6f"/>' + Array.apply(null, Array(12)).map(function (_, i) {
      var y = 62 + i * 27, m = i === 3 || i === 8 ? '#e07a5f' : i === 6 ? '#f2b544' : '#7cc49b';
      return '<rect x="18" y="' + y + '" width="' + (110 + (i * 37) % 70) + '" height="9" rx="4.5" fill="#d9dee3"/><circle cx="262" cy="' + (y + 4.5) + '" r="7" fill="' + m + '"/><line x1="18" x2="282" y1="' + (y + 18) + '" y2="' + (y + 18) + '" stroke="#eef1f3"/>';
    }).join('') + '</svg>');
  function attUpOpen() { ST.attUp = { own: null, step: 'pick' }; attUpRender(); }
  function attUpRender() {
    var u = ST.attUp, head = '<div class="dm-uphead"><h3>' + esc(fill(C.dAttUpTitle, { date: dayLabel(new Date()) })) + '</h3><button class="dialog-close dm-x focus" data-demo-ovclose aria-label="' + esc(C.dClose) + '">×</button></div>', body;
    if (u.step === 'read') body = '<div class="dm-scan"><img src="' + REG_THUMB + '" alt=""><i class="dm-scanline"></i></div><p class="dm-scanmsg" aria-live="polite">' + esc(C.dAttSteps[0]) + '</p>';
    else body = '<p class="dm-meta">' + esc(C.dAttUpHelp) + '</p>' +
      '<div class="dm-sheets rc-pack"><button class="dm-sheet focus' + (u.own ? '' : ' on') + '" data-demo-attupsample aria-pressed="' + !u.own + '"><img src="' + REG_THUMB + '" alt=""><span>' + esc(C.dAttUpSample) + '</span></button></div>' +
      '<div class="dm-lbl mt-3">' + esc(C.dAttUpOwn) + '</div><label class="btn-line sm dd-own focus">' + ICON.up + ' ' + esc(C.dAttUpBtn) +
      '<input type="file" accept=".csv,text/csv,application/pdf,.pdf" data-demo-attupfile hidden></label>' +
      (u.own ? '<p class="dd-chosen">' + window.TIcon('file') + ' ' + esc(fill(C.dUpChosen, { f: u.own })) + '</p>' : '') +
      '<p class="dm-meta mt-3">' + window.TIcon('lock') + ' ' + esc(C.dUpLocal) + '</p>' +
      '<div class="dm-upacts"><button class="btn btn-ghost focus" data-demo-ovclose>' + esc(C.dCancel) + '</button><button class="btn btn-primary md focus" data-demo-attupread>' + esc(C.dAttRead) + ' →</button></div>';
    overlay('dm-attov', head + body);
  }
  function attUpRead() {
    var u = ST.attUp; u.step = 'read'; attUpRender();
    [700, 1400].forEach(function (ms, i) { setTimeout(function () { var m = document.querySelector('#dm-attov .dm-scanmsg'); if (ST.attUp === u && m) m.textContent = C.dAttSteps[i + 1]; }, ms); });
    setTimeout(function () {
      if (ST.attUp !== u) return;
      // Scripted "read": the same two absent + one late each time for this class.
      var ks = allKids(), order = ks.slice().sort(function (x, y) { return hash(x.id + ':attup') - hash(y.id + ':attup'); });
      ST.attDraft = {}; ks.forEach(function (k) { ST.attDraft[k.id] = 'P'; });
      order.slice(0, ks.length > 3 ? 3 : 0).forEach(function (k, i) { ST.attDraft[k.id] = i < 2 ? 'A' : 'L'; });
      ST.attFrom = u.own || C.dAttUpSample; ST.attUp = null; attRender();
    }, 2300);
  }
  function attRender() {
    var rows = allKids().map(function (k) {
      var v = ST.attDraft[k.id];
      return '<li class="dd-attrow"><b>' + esc(k.name) + '</b><span class="dd-seg">' + ['P', 'A', 'L'].map(function (x) {
        return '<button class="' + x + (v === x ? ' on' : '') + '" data-demo-attset="' + esc(k.id) + ':' + x + '" aria-pressed="' + (v === x) + '">' + esc(C.st[x]) + '</button>';
      }).join('') + '</span></li>';
    }).join('');
    overlay('dm-attov', '<div class="dm-uphead"><h3>' + esc(fill(C.dAttTitle, { date: dayLabel(new Date()) })) + '</h3><button class="dialog-close dm-x focus" data-demo-ovclose aria-label="' + esc(C.dClose) + '">×</button></div>' +
      (ST.attFrom ? '<p class="rc-attfrom">' + ICON.check + esc(fill(C.dAttFrom, { f: ST.attFrom })) + '</p><p class="dm-meta">' + esc(C.dAttSim) + '</p>' : '<p class="dm-meta">' + esc(C.dAttHelp) + '</p>') + '<ul class="dd-attlist">' + rows + '</ul>' +
      '<div class="dm-upacts"><button class="btn btn-ghost focus" data-demo-ovclose>' + esc(C.dCancel) + '</button><button class="btn btn-primary md focus" data-demo-attsave>' + esc(C.dSave) + '</button></div>');
  }
  function dupOpen(stuId) { ST.dup = { stu: stuId || (allKids()[0] || {}).id, type: 'maths', sample: 0, own: null }; dupRender(); }
  function dupRender() {
    var d = ST.dup, s = allKids().find(function (x) { return x.id === d.stu; }) || {};
    var kidOpts = allKids().map(function (k) { return '<option value="' + esc(k.id) + '"' + (k.id === d.stu ? ' selected' : '') + '>' + esc(k.name) + '</option>'; }).join('');
    var typeOpts = Object.keys(C.types).map(function (k) { return '<option value="' + k + '"' + (k === d.type ? ' selected' : '') + '>' + esc(C.types[k]) + '</option>'; }).join('');
    var samples = SAMPLES[d.type];
    var tiles = samples.length ? '<div class="dm-sheets">' + samples.map(function (x, i) {
      var on = !d.own && d.sample === i;
      return '<button class="dm-sheet focus' + (on ? ' on' : '') + '" data-demo-dupsample="' + i + '" aria-pressed="' + on + '"><img src="' + esc(x.thumb || x.src) + '" alt=""><span>' + esc(d.type === 'maths' ? C.sheets[i].name : C.types[d.type]) + '</span></button>';
    }).join('') + '</div>' : '<p class="dm-meta">' + esc(C.dUpNoSample) + '</p>';
    overlay('dm-dupov', '<div class="dm-uphead"><h3>' + esc(C.dUpTitle) + '</h3><button class="dialog-close dm-x focus" data-demo-ovclose aria-label="' + esc(C.dClose) + '">×</button></div>' +
      '<div class="dd-form"><label class="dm-lbl">' + esc(C.dUpFor) + '<select class="select dm-select" data-demo-dupstu>' + kidOpts + '</select></label>' +
      '<label class="dm-lbl">' + esc(C.dUpType) + '<select class="select dm-select" data-demo-duptype>' + typeOpts + '</select></label></div>' +
      (samples.length ? '<div class="dm-lbl">' + esc(C.dUpPick) + '</div>' + tiles : tiles) +
      '<div class="dm-lbl mt-3">' + esc(C.dUpOwn) + '</div>' +
      '<label class="btn-line sm dd-own focus">' + ICON.up + ' ' + esc(C.dUpOwnBtn) + '<input type="file" accept="image/*,application/pdf" data-demo-dupfile hidden></label>' +
      (d.own ? '<p class="dd-chosen">' + (d.own.kind === 'img' ? '<img src="' + esc(d.own.thumb) + '" alt="">' : window.TIcon('file') + ' ') + esc(fill(C.dUpChosen, { f: d.own.name })) + '</p>' : '') +
      '<p class="dm-meta mt-3">' + window.TIcon('lock') + ' ' + esc(C.dUpLocal) + '</p>' +
      '<div class="dm-upacts"><button class="btn btn-ghost focus" data-demo-ovclose>' + esc(C.dCancel) + '</button>' +
      '<button class="btn btn-primary md focus" data-demo-dupsave' + (!d.own && !samples.length ? ' disabled' : '') + '>' + esc(fill(C.dUpSave, { n: nm(s) })) + '</button></div>');
  }
  // A phone photo is shrunk to a 900px preview before it is shown, so big photos don't slow old phones.
  function dupFile(file) {
    if (!file) return;
    var d = ST.dup, isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    // DEMO: the demo-kit worksheet photo has a name written on it; Tilli "reads" it and picks that child.
    if (/worksheet-word-problems/i.test(file.name) && D.sheetKid && allKids().some(function (k) { return k.id === D.sheetKid; })) d.stu = D.sheetKid;
    if (isPdf) { var url = URL.createObjectURL(file); d.own = { name: file.name, kind: 'pdf', src: url, thumb: 'assets/samples/reading-record-thumb.svg' }; d.url = url; dupRender(); return; }
    var img = new Image(), raw = URL.createObjectURL(file);
    img.onload = function () {
      var k = Math.min(1, 900 / Math.max(img.width, img.height)), cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(raw);
      var data = cv.toDataURL('image/jpeg', 0.85); d.own = { name: file.name, kind: 'img', src: data, thumb: data }; dupRender();
    };
    img.onerror = function () { URL.revokeObjectURL(raw); };
    img.src = raw;
  }
  function dupSave() {
    var d = ST.dup, s = allKids().find(function (x) { return x.id === d.stu; }); if (!s) return;
    var f, read = '';
    if (d.own) f = { type: d.type, title: C.types[d.type], when: C.dTodayW, src: d.own.src, thumb: d.own.thumb, kind: d.own.kind, sample: false };
    else f = sampleFile(d.type, d.sample, C.dTodayW);
    if (d.type === 'maths' && !d.own) {   // Tilli "reads" the sample maths sheet → score + memory, like the Today upload
      var sh = C.sheets[d.sample]; f.title = sh.name; f.score = Math.round(parseInt(sh.score, 10) / 10 * 100); ST.uploads[s.id] = { sheet: d.sample };
      read = fill(C.dUpRead, { score: sh.score, n: nm(s) });
    }
    if (d.type === 'maths' && d.own) {   // DEMO (Nov 13): a teacher's own maths photo or PDF is "read" too: scripted result for the demo-kit worksheet
      var own = d.own; closeOverlays(); ST.dataOpen = s.id; window.TD.render();
      UP = { stu: s.id, sheet: 3, own: own }; upRead(); return;
    }
    (ST.files[s.id] = ST.files[s.id] || []).unshift(f);
    d.saved = true; closeOverlays(); ST.dataOpen = s.id; window.TD.render();
    toast(read || (d.own && d.type === 'maths' ? fill(C.dUpDone, { n: nm(s) }) + ' · ' + C.dUpOwnNote : fill(C.dUpDone, { n: nm(s) })));
  }
  function viewFile(stuId, i) {
    var s = allKids().find(function (x) { return x.id === stuId; }); if (!s) return;
    var f = filesOf(s)[i]; if (!f) return;
    var body = f.kind === 'pdf'
      ? '<iframe class="dd-pdf" src="' + esc(f.src) + '" title="' + esc(f.title) + '"></iframe><a class="btn btn-primary md focus dd-openpdf" href="' + esc(f.src) + '" target="_blank" rel="noopener">' + esc(C.dOpenPdf) + ' ↗</a>'
      : '<img class="dd-big" src="' + esc(f.src) + '" alt="' + esc(f.title) + '">';
    var el = overlay('dm-view', '<div class="dm-uphead"><h3>' + esc(f.title) + ' · ' + esc(s.name) + '</h3><button class="dialog-close dm-x focus" data-demo-ovclose aria-label="' + esc(C.dClose) + '">×</button></div>' +
      '<p class="dm-meta">' + esc(f.when) + ' · ' + esc(f.sample ? C.dSample : C.dYours) + '</p>' + body);
    el.classList.add('dm-viewer');
  }

  // ---------- Child: school data (synced from the school system, read-only, sample) ----------
  function letter(p) {
    if (L === 'es') return p >= 85 ? 'Sobresaliente' : p >= 70 ? 'Notable' : p >= 55 ? 'Bien' : 'Suficiente';
    return p >= 85 ? 'A' : p >= 70 ? 'B' : p >= 55 ? 'C' : 'D';
  }
  // ---------- Ask Tilli: chips + scripted answers ----------
  function currentStudent() {
    try { var S = window.TD.S; if (S.nav === 'students' && S.studentId) return allKids().find(function (x) { return x.id === S.studentId; }) || null; } catch (e) {}
    return null;
  }
  function chipSet() {
    var s = currentStudent(), c = cast();
    if (s && s.state !== 'waiting') {
      return [['sOkay', s], ['sRemember', s], ['sTry', s], ['sParent', s]].map(function (x) { return { key: x[0] + ':' + s.id, q: t(x[0], { n: nm(s) }), gen: x[0], stu: s }; });
    }
    if (!c) return [];
    return [['qFocus'], ['qCheck'], ['qWhy'], ['qAct']].map(function (x) { return { key: x[0], q: t(x[0], { n: nm(c.math) }), gen: x[0] }; });
  }
  function chipsHTML() {
    var started = false; try { started = window.TD.S.ask.thread.length > 0; } catch (e) {}
    // en/es: the link primes the normal chat box for a note; Hindi (no typed chat) keeps the note box.
    var noteDet = BANK && BL
      ? '<div class="dm-askn"><button type="button" class="dm-noteprime focus' + (NOTE.primed ? ' on' : '') + '" data-demo-noteprime aria-pressed="' + NOTE.primed + '">' + window.TIcon('note') + ' ' + esc(t('noteTitle')) + '</button></div>'
      : '<details class="dm-askn"><summary>' + window.TIcon('note') + ' ' + esc(t('noteTitle')) + '</summary>' + noteBox(currentStudent(), true) + '</details>';
    if (started && BANK && BL) return '<div class="dm-chips" data-demo>' + noteDet + '</div>';   // typed chat: follow-ups sit under each answer
    var set = chipSet().filter(function (x) { return !ST.asked[x.key]; });
    ST.lastChips = {}; chipSet().forEach(function (x) { ST.lastChips[x.q] = x; });
    var thinking = false; try { thinking = window.TD.S.ask.thinking; } catch (e) {}
    var chips = !set.length ? '<p class="dm-chipsdone">' + esc(t('askDone')) + '</p>' : set.map(function (x) {
      return '<button class="dm-chip focus" data-demo-q="' + esc(x.q) + '"' + (thinking ? ' disabled' : '') + '>' + esc(x.q) + '</button>';
    }).join('');
    // Tap a question, or tell Tilli something to remember (saved as a private note on that child).
    var start = BANK && BL && set.length ? '<p class="dm-askstart">' + esc(t('askStart')) + '</p>' : '';
    return '<div class="dm-chips" data-demo>' + start + chips + noteDet + '</div>';
  }
  function answer(q) {
    micStop();
    var x = ST.lastChips[q];
    if (x) { NOTE.primed = false; NOTE.pending = null; }   // a tapped starter chip is a question, not the note
    if (!x) return BANK && BL ? bankReply(q) : null;
    ST.asked[x.key] = true;
    var txt = chipAnswer(x), cs = currentStudent() || x.stu;
    if (x.stu) CONVO.child = x.stu;
    var nx = BANK && BL ? (BANK.chipNext[x.gen] || []) : [];
    return { text: txt, think: [t('thinkData', { c: x.stu ? nm(x.stu) : clsLabel() }), t('thinkPick')], next: nextQs(nx, cs) };
  }
  function chipAnswer(x) {
    var c = cast(), N = allKids().length, ks = kids();
    if (x.stu) {
      var s = x.stu, tl = topLow(s);
      var v = { n: nm(s), top: lc(SKILL[tl.top.key]), low: lc(SKILL[tl.low.key]), low2: lc(SKILL[tl.low.key]), grew: lc(SKILL[tl.grew.key]), g: Math.max(3, tl.grew.pct - tl.grew.pre), home: pick(C.memParent, s.id + 'p'), topBand: BAND[tl.top.band] };
      v.verdict = C.verdict[s.band] || C.verdict.Learner; v.band = BAND[s.band] || s.band; v.d = planDay(s); var fs = focusSkill(s); v.lowBand = BAND[fs.band]; if (x.gen === 'sOkay') v.low = lc(SKILL[fs.key]);
      return t({ sOkay: 'aOkay', sRemember: 'aRemember', sTry: 'aTry', sParent: 'aParent' }[x.gen], v);
    }
    var wmK = ks.filter(function (s) { return skillOf(s, 'working_memory').band === 'Beginner'; }).length;
    var mm = mathMarks(c.math);
    return t({ qFocus: 'aFocus', qCheck: 'aCheck', qWhy: 'aWhy', qAct: 'aAct' }[x.gen], {
      skill: lc(SKILL.working_memory), k: Math.max(2, wmK), N: N, left: midLeft(), a: nm(c.calm), b: nm(c.home), c: nm(c.math), n: nm(c.math), num: Math.round((mm.number + mm.addsub) / 2), wp: mm.words });
  }
  // Open the Ask panel and send one chip straight away (Home "Ask Tilli how to run it").
  function askNow(gen) {
    var TD = window.TD;
    TD.openAsk('', '');
    var x = chipSet().find(function (y) { return y.gen === gen; });
    if (x && !ST.asked[x.key]) { ST.lastChips[x.q] = x; TD.sendAsk(x.q); }
  }

  // ---------- Ask Tilli: typed questions (assets/ask-bank.js) ----------
  // ~100 scripted questions a Grade 3 teacher might ask (en + es), matched by
  // keywords like the website's Ask Tilli (js/ask-tilli-demo.js). Every answer
  // is computed from this demo's own data, so it stays true after uploads and
  // saves. A message that names a child and describes how they are is a note:
  // Tilli sorts it into skills, shows its steps and saves it. Hindi keeps the chips.
  var BANK = window.TilliAskBank || null, BL = L === 'en' || L === 'es' ? L : null;
  var CONVO = { child: null };   // who the chat is about, for "he / she" and follow-up chips
  // "Tell Tilli something to remember" link: the next message is a note (primed); one sent
  // without a child's name waits (pending) while Tilli asks who it is about.
  var NOTE = { primed: false, pending: null };
  function composerPh() { return t(NOTE.primed ? 'notePrimePh' : 'askPh'); }
  function composerMic() { return '<button type="button" class="dm-mic ask-mic focus" data-demo-mic aria-pressed="false" aria-label="' + esc(t('micLabel')) + '" title="' + esc(t('micLabel')) + '">' + ICON.mic + '</button>'; }
  function normQ(x) { return String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']s\b/g, '').replace(/[’']/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(); }
  var RX = {};
  function hasW(tq, alt) {   // whole word(s); a word ending in * = any word starting with it
    var rx = RX[alt] || (RX[alt] = new RegExp('(^| )' + alt.split(' ').map(function (w) { return w.slice(-1) === '*' ? w.slice(0, -1) + '[a-z0-9]*' : w; }).join(' ') + '( |$)'));
    return rx.test(tq);
  }
  function clsLabel() {
    var g = (D.myClass || ['Grade 3', 'A']), m = String(g[0]).match(/\d+/), n = m ? m[0] : '';
    return L === 'es' ? n + '.º ' + g[1] : L === 'hi' ? 'कक्षा ' + n + ' ' + g[1] : g[0] + ' ' + g[1];
  }
  function kidsIn(tq) { return allKids().filter(function (s) { var k = normQ(nm(s)); return k && hasW(tq, k); }); }
  function pronoun(tq) { return (BANK.pron[BL] || []).some(function (w) { return hasW(tq, w); }); }
  function skillIn(tq) {
    var best = null;
    Object.keys(BANK.skillWords[BL]).forEach(function (k) {
      BANK.skillWords[BL][k].forEach(function (w) { if (hasW(tq, w) && (!best || w.length > best.len)) best = { key: k, len: w.length }; });
    });
    return best ? best.key : null;
  }
  function namesList(arr, max) {
    var a = arr.map(function (s) { return typeof s === 'string' ? s : nm(s); }), extra = 0;
    if (max && a.length > max) { extra = a.length - max; a = a.slice(0, max); }
    var and = L === 'es' ? ' y ' : ' and ';
    var out = a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + and + a[a.length - 1];
    return extra ? out + (L === 'es' ? ' (y ' + extra + ' más)' : ' (+' + extra + ' more)') : out;
  }
  function skillStats(ks) {
    return SK_KEYS.map(function (k) {
      var rows = ks.map(function (s) { return skillOf(s, k); }), n = rows.length || 1;
      var avg = function (f) { return Math.round(rows.reduce(function (a, r) { return a + (r[f] || 0); }, 0) / n); };
      var o = { key: k, name: SKILL[k], lname: lc(SKILL[k]), beg: 0, lea: 0, adv: 0, avg: avg('pct'), pre: avg('pre'), mid: avg('mid'), t: avg('teacher'), p: avg('parent'), s: avg('student') };
      rows.forEach(function (r) { if (r.band === 'Beginner') o.beg++; else if (r.band === 'Advanced') o.adv++; else o.lea++; });
      o.grow = o.avg - o.pre; o.gap = Math.max(o.t, o.p, o.s) - Math.min(o.t, o.p, o.s);
      var vs = [['teacher', o.t], ['parent', o.p], ['student', o.s]].sort(function (x, y) { return x[1] - y[1]; });
      o.lo = vs[0][0]; o.hi = vs[2][0];
      return o;
    });
  }
  function childInfo(s) {
    var tl = topLow(s), fs = focusSkill(s), mm = mathMarks(s), mk = Object.keys(mm).sort(function (a, b) { return mm[a] - mm[b]; });
    var pg = (s.skills || []).slice().sort(function (a, b) { return (b.gap || 0) - (a.gap || 0); })[0] || {};
    var vs = pg.key ? [['teacher', pg.teacher], ['parent', pg.parent], ['student', pg.student]].sort(function (x, y) { return x[1] - y[1]; }) : [];
    return { s: s, n: nm(s), full: s.name, band: BAND[s.band] || s.band, bandKey: s.band, pct: s.overallPct, growth: (s.overallPct || 0) - (s.overallPre || 0),
      top: SKILL[tl.top.key], topKey: tl.top.key, topBand: BAND[tl.top.band], low: SKILL[tl.low.key], lowKey: tl.low.key, lowBand: BAND[tl.low.band],
      grew: SKILL[tl.grew.key], grewKey: tl.grew.key, g: Math.max(1, tl.grew.pct - tl.grew.pre),
      focus: SKILL[fs.key], focusKey: fs.key, focusBand: BAND[fs.band], day: planDay(s), prev: prevTeacher(s),
      att: attOf(s), marks: mm, weak: MATH[mk[0]], weakKey: mk[0], weakPct: mm[mk[0]], strong: MATH[mk[mk.length - 1]], strongPct: mm[mk[mk.length - 1]],
      persp: pg.key ? { key: pg.key, name: SKILL[pg.key], gap: pg.gap || 0, lo: vs[0][0], hi: vs[2][0], t: pg.teacher, p: pg.parent, st: pg.student } : null,
      notes: (ST.notes[s.id] || []).slice(), sk: function (k) { return skillOf(s, k); }, home: pick(C.memParent, s.id + 'p') };
  }
  function helpers(child, skill) {
    var ks = kids(), st = skillStats(ks), c = cast() || {};
    var by = function (f, dir) { return st.slice().sort(function (a, b) { return dir * (b[f] - a[f]); }); };
    var all = allKids(), sum = attSummary();
    var attRows = all.map(function (s) { return { s: s, a: attOf(s) }; });
    var list = acadList(), last = list[0], marked = all.filter(function (s) { return last && last.scores[s.id] != null; });
    var pctOf = function (s) { return Math.round(last.scores[s.id] / last.max * 100); };
    var lead = {}; st.filter(function (x) { return x.gap >= 12; }).forEach(function (x) { lead[x.lo] = (lead[x.lo] || 0) + 1; });
    var leanLow = Object.keys(lead).sort(function (a, b) { return lead[b] - lead[a]; })[0] || null;
    return {
      L: L, cls: clsLabel(), N: ks.length, all: all.length, kids: ks, cast: c, child: child || null, ci: child ? childInfo(child) : null,
      skill: skill || null, skillName: skill ? SKILL[skill] : null, lskill: skill ? lc(SKILL[skill]) : null,
      sk: function (k) { return SKILL[k]; }, lsk: function (k) { return lc(SKILL[k]); }, band: function (b) { return BAND[b] || b; }, n: nm,
      list: namesList, st: st, stat: function (k) { return st.find(function (x) { return x.key === k; }); },
      gap: by('beg', 1)[0], gap2: by('beg', 1)[1], strong: by('adv', 1)[0], strong2: by('adv', 1)[1], grew: by('grow', 1)[0], slow: by('grow', -1)[0],
      sel: Math.round(st.slice(0, 6).reduce(function (a, x) { return a + x.avg; }, 0) / 6), cog: Math.round(st.slice(6).reduce(function (a, x) { return a + x.avg; }, 0) / 6),
      beg: function (k) { return ks.filter(function (s) { return skillOf(s, k).band === 'Beginner'; }); },
      lowest: function (k, n) { return ks.slice().sort(function (a, b) { return skillOf(a, k).pct - skillOf(b, k).pct; }).slice(0, n || 3); },
      highest: function (k, n) { return ks.slice().sort(function (a, b) { return skillOf(b, k).pct - skillOf(a, k).pct; }).slice(0, n || 3); },
      bands: { Beginner: ks.filter(function (s) { return s.band === 'Beginner'; }), Learner: ks.filter(function (s) { return s.band === 'Learner'; }), Advanced: ks.filter(function (s) { return s.band === 'Advanced'; }) },
      tending: ks.slice().sort(function (a, b) { return a.overallPct - b.overallPct; }).slice(0, 3),
      quiet: ks.filter(function (s) { return s.band !== 'Beginner' && (s.overallPct - (s.overallPre || 0)) <= 2; }).slice(0, 3),
      att: { taken: !!sum, present: sum ? sum.p : null, n: all.length,
        absent: all.filter(function (s) { return ST.attToday[s.id] === 'A'; }), late: all.filter(function (s) { return ST.attToday[s.id] === 'L'; }),
        avg: Math.round(attRows.reduce(function (a, r) { return a + r.a.pct; }, 0) / (attRows.length || 1)),
        low: attRows.slice().sort(function (a, b) { return a.a.pct - b.a.pct; }).slice(0, 3),
        lates: attRows.filter(function (r) { return r.a.late >= 2; }).sort(function (a, b) { return b.a.late - a.a.late; }).slice(0, 3) },
      acad: last ? { name: last.name, max: last.max, marked: marked.length, total: all.length,
        missing: all.filter(function (s) { return last.scores[s.id] == null; }),
        avg: marked.length ? Math.round(marked.reduce(function (a, s) { return a + pctOf(s); }, 0) / marked.length) : 0,
        low: marked.slice().sort(function (a, b) { return pctOf(a) - pctOf(b); }).slice(0, 3), high: marked.slice().sort(function (a, b) { return pctOf(b) - pctOf(a); }).slice(0, 3),
        pct: pctOf, count: list.length } : null,
      math: function (s) { return mathMarks(s); }, MATH: MATH,
      mathClass: (function () { var o = {}; Object.keys(MATH).forEach(function (k) { o[k] = Math.round(ks.reduce(function (a, s) { return a + mathMarks(s)[k]; }, 0) / (ks.length || 1)); }); return o; })(),
      persp: { gapN: st.filter(function (x) { return x.gap >= 12; }).length, top: by('gap', 1)[0], leanLow: leanLow, leanN: leanLow ? lead[leanLow] : 0 },
      midLeft: midLeft(), midClose: midClose(), notes: function (s) { return ST.notes[s.id] || []; },
      teacher: (D.teacher && D.teacher.name) || '', school: (D.school && D.school.name) || '',
    };
  }
  function gapSkill() { var st = skillStats(kids()).sort(function (a, b) { return b.beg - a.beg; }); return st[0] ? st[0].key : 'working_memory'; }
  function nextQs(ids, child) {
    if (!BANK || !BL) return [];
    var who = child || CONVO.child || (cast() || {}).math, sk = CONVO.skill || gapSkill();
    var v = { child: nm(who), skill: L === 'es' ? lc(SKILL[sk]) : SKILL[sk] };
    return (ids || []).map(function (id) { var e = BANK.byId[id]; return e ? fill(e.q[BL], v) : null; }).filter(Boolean).slice(0, 3);
  }
  // Insights "Ask Tilli …" buttons → one bank question in the page language (teacher-dashboard.js data-ask / data-ask-ins).
  function askFor(kind, skill) {
    if (!BANK || !BL || kind === 'cmp') return null;
    var key = null; try { var f = window.TD.S.data.skills.find(function (x) { return x.key === skill || x.name === skill; }); key = f ? f.key : null; } catch (e) {}
    var id = { grow: 'c2', persp: key ? 'v1' : 'v1', build: 's1', activity: 's3' }[kind] || (key ? 's3' : null);
    var e = id && BANK.byId[id]; if (!e) return null;
    if (key) CONVO.skill = key;
    var sk = key || gapSkill(), name = L === 'es' ? lc(SKILL[sk]) : SKILL[sk];
    return { q: fill(e.q[BL], { skill: name }), context: clsLabel() + (key ? ' · ' + SKILL[key] : '') };
  }
  function bankMatch(tq) {
    var best = null, named = kidsIn(tq), ctx = CONVO.child || currentStudent();
    var hasChild = named.length > 0 || (ctx && pronoun(tq));
    BANK.entries.forEach(function (e) {
      var rules = (e.m && e.m[BL]) || [], not = (e.not && e.not[BL]) || [];
      if (not.some(function (w) { return hasW(tq, w); })) return;
      rules.forEach(function (rule) {
        var sc = 0, ok = rule.split(' + ').every(function (g) {
          if (g === '@child') { if (hasChild) { sc += 1000; return true; } return false; }
          if (g === '@skill') { if (skillIn(tq)) { sc += 1000; return true; } return false; }
          var hit = g.split('|').filter(function (w) { return hasW(tq, w); }).sort(function (a, b) { return b.length - a.length; })[0];
          if (!hit) return false; sc += 1000 + hit.length; return true;
        });
        if (ok) { sc += (e.w || 0) + (e.child && named.length ? 1500 : 0); if (!best || sc > best.sc) best = { e: e, sc: sc }; }   // a named child pulls toward that child's answers
      });
    });
    return best;
  }
  // A note: names a child, isn't a question, and has a cue word or a feeling / behaviour word.
  function noteFor(text, tq) {
    var ks = kidsIn(tq); if (!ks.length) return null;
    var q = /\?\s*$/.test(text) || (BANK.qStart[BL] || []).some(function (w) { return tq.indexOf(w + ' ') === 0; }) || (BANK.askCue[BL] || []).some(function (w) { return hasW(tq, w); });
    var cue = (BANK.noteCue[BL] || []).some(function (w) { return hasW(tq, w); });
    if (q && !(BANK.noteCue[BL] || []).some(function (w) { return tq.indexOf(w + ' ') === 0; })) return null;   // a question stays a question unless it opens with "note / remember…" 
    if (!cue && !noteSkills(tq).length) return null;
    return ks[0];
  }
  function noteSkills(tq) {
    var W = BANK.noteWords[BL], out = [];
    Object.keys(W).forEach(function (k) { var hits = W[k].filter(function (w) { return hasW(tq, w); }); if (hits.length) out.push({ key: k, hits: hits }); });
    return out.sort(function (a, b) { return b.hits.length - a.hits.length; }).slice(0, 2);
  }
  function keepNote(who, text) {
    var tq = normQ(text), sks = noteSkills(tq), up = (BANK.upWords[BL] || []).some(function (w) { return hasW(tq, w); });
    var down = (BANK.downWords[BL] || []).some(function (w) { return hasW(tq, w); });
    (ST.notes[who.id] = ST.notes[who.id] || []).unshift({ text: text.trim(), at: Date.now(), skills: sks.map(function (x) { return x.key; }) });
    saveWork(); CONVO.child = who;
    var r = BANK.note[BL](helpers(who), { skills: sks, up: up && !down, text: text.trim() });
    return { text: r.text, think: r.think, next: nextQs(['k1', 'k4', 'k10'], who) };
  }
  var NOTE_WHO_WORDS = 4;   // a reply to "Who is this about?" longer than this is a new message, not just the name
  function bankReply(text) {
    var tq = normQ(text); if (!tq) return null;
    if (NOTE.primed) {   // sent from the primed box: always a note
      NOTE.primed = false;
      var ks = kidsIn(tq); if (ks.length) return keepNote(ks[0], text);
      NOTE.pending = text.trim();
      return { text: t('noteWho'), think: [], next: allKids().map(nm) };   // every child's name as a chip
    }
    if (NOTE.pending) {
      var pend = NOTE.pending, kp = kidsIn(tq); NOTE.pending = null;
      if (kp.length && tq.split(' ').length <= NOTE_WHO_WORDS) return keepNote(kp[0], pend);
    }
    var who = noteFor(text, tq);
    if (who) return keepNote(who, text);
    var named = kidsIn(tq), m = bankMatch(tq);
    if (named.length >= 2 && (!m || (m.e.w || 0) < 2500)) {
      var cr = BANK.compare[BL](helpers(named[0]), named.slice(0, 4).map(childInfo));
      CONVO.child = named[0];
      return { text: cr.text, think: cr.think, next: nextQs(['k3', 'c15'], named[0]) };
    }
    if (!m) {
      var fb = BANK.fallback[BL](helpers(null));
      return { text: fb, think: [], next: nextQs(BANK.starters, null) };
    }
    var e = m.e, child = null;
    if (e.child) { child = named[0] || CONVO.child || currentStudent() || null; if (child) CONVO.child = child; }
    var skq = skillIn(tq); if (skq) CONVO.skill = skq;
    var H = helpers(child, skq || (e.cat === 'skill' ? CONVO.skill : null));
    if (e.child && !child) return { text: BANK.whichChild[BL](H), think: [], next: [] };
    var think = typeof e.th === 'function' ? e.th(H) : (e.th && e.th[BL] ? (typeof e.th[BL] === 'function' ? e.th[BL](H) : e.th[BL]) : []);
    return { text: e.a[BL](H), think: (think || []).map(function (x) { return fill(x, { cls: H.cls, child: child ? nm(child) : '' }); }), next: nextQs(e.next, child), id: e.id };
  }

  // ---------- upload overlay ----------
  var SHEETS = ['assets/sheets/sheet-1.svg', 'assets/sheets/sheet-2.svg', 'assets/sheets/sheet-3.svg'];
  var UP = null;   // { stu, sheet, step: 'pick'|'read'|'result', readStep }
  function upOpen(stuId) { UP = { stu: stuId, sheet: 0, step: 'pick' }; upRender(); }
  function upClose() { UP = null; var el = document.getElementById('dm-up'); if (el) el.remove(); }
  function upImg() { return UP.own ? (UP.own.kind === 'img' ? UP.own.src : UP.own.thumb) : SHEETS[UP.sheet]; }
  function upRender() {
    var el = document.getElementById('dm-up');
    if (!UP) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'dm-up'; el.setAttribute('data-demo', ''); document.body.appendChild(el); }
    var s = allKids().find(function (x) { return x.id === UP.stu; }) || cast().math, n = nm(s), body = '';
    if (UP.step === 'pick') {
      var opts = allKids().map(function (k) { return '<option value="' + esc(k.id) + '"' + (k.id === s.id ? ' selected' : '') + '>' + esc(k.name) + '</option>'; }).join('');
      body = '<label class="dm-lbl" for="dm-upstu">' + esc(t('upFor')) + '</label><select id="dm-upstu" class="select dm-select" data-demo-upstu>' + opts + '</select>' +
        '<div class="dm-lbl">' + esc(t('upPick')) + '</div><div class="dm-sheets">' + SHEETS.map(function (src, i) {
          return '<button class="dm-sheet focus' + (i === UP.sheet ? ' on' : '') + '" data-demo-sheet="' + i + '" aria-pressed="' + (i === UP.sheet) + '"><img src="' + src + '" alt=""><span>' + esc(C.sheets[i].name) + '</span></button>';
        }).join('') + '</div>' +
        '<div class="dm-upacts"><button class="btn btn-ghost focus" data-demo-upclose>' + esc(t('upCancel')) + '</button><button class="btn btn-primary md focus" data-demo-upread>' + esc(t('upRead')) + ' →</button></div>';
    } else if (UP.step === 'read') {
      body = '<div class="dm-scan"><img src="' + esc(upImg()) + '" alt=""><i class="dm-scanline"></i></div><p class="dm-scanmsg" aria-live="polite">' + esc(C.upSteps[UP.readStep || 0]) + '</p>';
    } else {
      var sh = C.sheets[UP.sheet], saved = !!ST.uploads[s.id] && ST.uploads[s.id].sheet === UP.sheet;
      var marks = sh.marks.map(function (m, i) { return '<span class="dm-q ' + (m ? 'ok' : 'no') + '">' + (i + 1) + '</span>'; }).join('');
      body = '<div class="dm-res"><div class="dm-resimg"><img src="' + esc(upImg()) + '" alt=""></div><div class="dm-resbody">' +
        '<div class="dm-score"><span>' + esc(t('upScore')) + '</span><b>' + esc(sh.score) + '</b><em>' + esc(sh.name) + ' · ' + esc(s.name) + '</em></div>' +
        '<div class="dm-qs">' + marks + '</div>' +
        '<h4>' + esc(t('upNoticed')) + '</h4><p>' + esc(fill(sh.noticed, { n: n })) + '</p>' +
        '<h4>' + esc(t('upLinked')) + '</h4><p>' + esc(SKILL[sh.skill]) + ' ' + bandChip(skillOf(s, sh.skill).band) + '</p>' +
        '<h4>' + esc(t('upNext')) + '</h4><p>' + esc(fill(sh.next, { n: n })) + '</p></div></div>' +
        '<div class="dm-upacts">' + (saved ? '<span class="dm-saved">' + ICON.check + esc(t('upSaved', { n: n })) + '</span><button class="btn btn-primary md focus" data-demo-upclose>' + esc(t('upClose')) + '</button>'
          : '<button class="btn btn-ghost focus" data-demo-upclose>' + esc(t('upClose')) + '</button><button class="btn btn-primary md focus" data-demo-upsave>' + esc(t('upSave', { n: n })) + '</button>') + '</div>';
    }
    el.innerHTML = '<div class="ui-scrim dm-upscrim" data-demo-upclose></div><div class="dm-upcard" role="dialog" aria-modal="true" aria-label="' + esc(t('upHead')) + '">' +
      '<div class="dm-uphead"><h3>' + esc(t('upHead')) + '</h3><button class="dialog-close dm-x focus" data-demo-upclose aria-label="' + esc(t('upClose')) + '">×</button></div>' + body + '</div>';
  }
  function upRead() {
    UP.step = 'read'; UP.readStep = 0; upRender();
    // Only the message changes between steps, so the scan line keeps sweeping (a re-render would restart it).
    [700, 1400].forEach(function (ms, i) { setTimeout(function () { var m = document.querySelector('#dm-up .dm-scanmsg'); if (UP && UP.step === 'read' && m) { UP.readStep = i + 1; m.textContent = C.upSteps[i + 1]; } }, ms); });
    setTimeout(function () { if (UP && UP.step === 'read') { UP.step = 'result'; upRender(); } }, 2300);
  }

  // ---------- "Continue as" welcome ----------
  // Pop-up over the landing page, opened by "Enter the dashboard" (desktop and phone; Nov 12, user).
  function welcome() {
    if (document.getElementById('dm-welcome')) return;
    var el = document.createElement('div');
    el.id = 'dm-welcome'; el.setAttribute('data-demo', '');
    var tn = D.teacher.name, first = tn.split(' ')[0];
    el.innerHTML = '<div class="dm-wscrim" data-demo-wclose></div><div class="dm-wcard" role="dialog" aria-modal="true" aria-label="' + esc(t('welcome')) + '">' +
      '<img class="dm-wlogo" src="_ds/tilli/assets/logos/tilli-logo.png" alt="Tilli">' +
      '<h1>' + esc(t('welcome')) + '</h1>' +
      '<p class="dm-wsub">' + esc(t('welcomeSub', { school: D.school.name, n: 14 })) + '</p>' +
      '<button class="btn btn-primary md dm-wgo focus" data-demo-continue><span class="ui-avatar sm">' + esc(first[0]) + '</span>' + esc(t('continueAs', { name: tn })) + ' →</button>' +
      '<p class="dm-wnote">' + esc(t('demoNote')) + '</p>' +
      langLinks('dm-wlangs') + '</div>';
    document.body.appendChild(el);
  }
  function closeWelcome() { var w = document.getElementById('dm-welcome'); if (w) w.remove(); }
  // ---------- landing (mirrors the Measures sign-in page's look; one button instead of the role picker) ----------
  function landing() {
    var el = document.createElement('div');
    el.id = 'dm-landing'; el.setAttribute('data-demo', '');
    el.innerHTML = '<div class="brand-rail" aria-hidden="true"><span></span><span class="seg pink"></span><span class="seg cyan"></span><span class="seg yellow"></span></div>' +
      '<div class="dl-page"><div class="dl-inner">' +
        '<div class="dl-top"><div class="lockup"><img src="_ds/tilli/assets/logos/tilli-logo.png" alt="Tilli"><span class="divider"></span><span class="measures">Measures</span></div>' + langLinks('dm-wlangs dl-langs') + '</div>' +
        '<div class="dl-hero">' +
          '<div class="dl-copy"><p class="dl-eyebrow">' + esc(t('lEyebrow')) + '</p><h1 class="dl-title">' + esc(t('lTitle')) + '</h1><p class="dl-sub">' + esc(t('lSub')) + '</p>' +
            '<div class="dl-cta"><button class="btn btn-primary focus" data-demo-enter>' + esc(t('lEnter')) + ' →</button></div></div>' +
          '<div class="dl-stats">' +
            '<div class="dl-stat"><span class="dl-icon"><img src="_ds/tilli/assets/icons/chart-up.png" alt=""></span><span><span class="dl-num">12</span><span class="dl-label">' + esc(t('lStat1')) + '</span></span></div>' +
            '<div class="dl-stat yellow"><span class="dl-icon yellow"><img src="_ds/tilli/assets/icons/clock.png" alt=""></span><span><span class="dl-num">3×</span><span class="dl-label">' + esc(t('lStat2')) + '</span></span></div>' +
          '</div>' +
        '</div></div>' +
        '<img class="dl-milo" src="assets/milo-hand.png" alt="" aria-hidden="true">' +
        '<div class="flower-band dl-band" aria-hidden="true"></div>' +
      '</div>';
    document.body.appendChild(el);
    if (window.renderFlowerBand) window.renderFlowerBand(el.querySelector('.dl-band'));
  }
  function langLinks(cls) {
    return '<nav class="' + cls + '" aria-label="' + esc(t('langLabel')) + '">' + D.langs.map(function (l) {
      return l.code === L ? '<b aria-current="true">' + esc(l.native) + '</b>' : '<a href="/demo-dashboard/' + l.code + '/" lang="' + l.code + '">' + esc(l.native) + '</a>';
    }).join('') + '</nav>';
  }
  function profileExtras() {
    var reset = { es: 'Reiniciar la demo', en: 'Reset demo', hi: 'डेमो फिर से शुरू करें' }[L];
    var resetSub = { es: 'Vuelve al principio, como si nadie la hubiera usado.', en: 'Start again from the beginning, as if nobody had used it.', hi: 'शुरुआत से फिर शुरू करें, जैसे किसी ने इस्तेमाल ही न किया हो।' }[L];
    return '<div class="ui-card mt-4 dm-prof" data-demo><div class="td-langrow"><span>' + esc(t('langLabel')) + '</span>' + langLinks('dm-plangs') + '</div>' +
      '<div class="dm-reset"><div><b>' + esc(reset) + '</b><p>' + esc(resetSub) + '</p></div><button class="btn btn-danger-outline td-btn-md focus" data-demo-reset>↺ ' + esc(reset) + '</button></div></div>';
  }

  // ---------- one delegated click handler for everything above ----------
  document.addEventListener('click', function (e) {
    // Attendance + Students Sort / ⋮ dropdowns: close on an outside click or once an option is picked.
    Array.prototype.forEach.call(document.querySelectorAll('.rc-attmenu[open], .rc-amenu[open], .roster-sortmenu[open], .roster-kebab[open]'), function (d) { if (!d.contains(e.target) || e.target.closest('.rc-attopt, .roster-sortopt, .roster-kebabopt')) d.removeAttribute('open'); });
    var b = e.target.closest('[data-demo-acview],[data-demo-acfilter],[data-demo-acopenx],[data-demo-fall],[data-demo-fpop],[data-demo-attstu],[data-demo-attday],[data-demo-attall],[data-demo-acopen],[data-demo-acadform],[data-demo-acadcreate],[data-demo-acedit],[data-demo-acsave],[data-demo-acdel],[data-demo-acdelyes],[data-demo-acup],[data-demo-aumode],[data-demo-aupack],[data-demo-auread],[data-demo-ausave],[data-demo-att],[data-demo-attup],[data-demo-attupsample],[data-demo-attupread],[data-demo-attset],[data-demo-attsave],[data-demo-dup],[data-demo-dupsample],[data-demo-dupsave],[data-demo-file],[data-demo-ovclose],[data-demo-mic],[data-demo-noteprime],[data-demo-notesave],[data-demo-noteopen],[data-demo-done],[data-demo-day],[data-demo-box],[data-demo-enter],[data-demo-wclose],[data-demo-continue],[data-demo-stu],[data-demo-assess],[data-demo-askq],[data-demo-askstu],[data-demo-upload],[data-demo-sheet],[data-demo-upread],[data-demo-upsave],[data-demo-upclose],[data-demo-q],[data-demo-reset]');
    if (!b) return;
    var TD = window.TD, ds = b.dataset;
    if ('demoEnter' in ds) { welcome(); var go = document.querySelector('[data-demo-continue]'); if (go) go.focus(); return; }
    if ('demoWclose' in ds) { closeWelcome(); return; }
    if ('demoContinue' in ds) {   // into the dashboard: the pop-up and the landing page go together
      ['dm-welcome', 'dm-landing'].forEach(function (id) { var x = document.getElementById(id); if (x) { x.classList.add('out'); setTimeout(function () { x.remove(); }, 380); } });
      return;
    }
    if ('demoStu' in ds) { TD.openStudent(ds.demoStu); window.scrollTo(0, 0); return; }
    if ('demoAttstu' in ds) { closeOverlays(); ST.attDay = null; TD.openStudent(ds.demoAttstu); TD.render(); setTimeout(function () { var a = document.getElementById('dm-ppatt'); if (a) a.scrollIntoView({ block: 'start' }); }, 0); return; }
    if ('demoAttall' in ds) { attListOpen(); return; }
    if ('demoAttday' in ds) { var di = ds.demoAttday === '' ? null : +ds.demoAttday; ST.attDay = ST.attDay === di ? null : di; TD.render(); return; }
    if ('demoFall' in ds) { ST.filesAll = !ST.filesAll; TD.render(); return; }
    if ('demoAcopen' in ds) { ST.acadOpen = ST.acadOpen === ds.demoAcopen ? null : ds.demoAcopen; ST.acadFilter = 'all'; TD.render(); return; }
    if ('demoAcview' in ds) { ST.acadView = ds.demoAcview; TD.render(); return; }
    if ('demoAcfilter' in ds) { ST.acadFilter = ds.demoAcfilter; TD.render(); return; }
    if ('demoAcopenx' in ds) {   // table header → that assessment, opened, in the list view
      ST.acadView = 'a'; ST.acadOpen = ds.demoAcopenx; ST.acadFilter = 'all'; TD.render();
      var row = document.getElementById('rc-a-' + ds.demoAcopenx); if (row) row.scrollIntoView({ block: 'start' }); return;
    }
    if ('demoAcadform' in ds) { ST.acadForm = ds.demoAcadform === '1' ? { open: true } : null; TD.render(); if (ST.acadForm) { var ni = document.getElementById('rc-name'); if (ni) ni.focus(); } return; }
    if ('demoAcadcreate' in ds) { acadCreate(); return; }
    if ('demoAcedit' in ds) {   // ⋯ → Edit (or Cancel with "0")
      closeAcMenus(); ST.acDel = null; ST.acEditForm = null;
      if (ds.demoAcedit === '0') { acEditClose(); return; }
      ST.acEdit = ds.demoAcedit; acEditRender();
      var en = document.getElementById('rc-ename'); if (en) { en.focus(); en.select(); }
      return;
    }
    if ('demoAcsave' in ds) { acadSave(ds.demoAcsave); return; }
    if ('demoAcdel' in ds) { closeAcMenus(); ST.acEdit = null; ST.acDel = ds.demoAcdel === '0' ? null : ds.demoAcdel; TD.render(); return; }
    if ('demoAcdelyes' in ds) {
      var L3 = acadList(), di = L3.findIndex(function (x) { return x.id === ds.demoAcdelyes; });
      if (di >= 0) L3.splice(di, 1);
      if (ST.acadOpen === ds.demoAcdelyes) ST.acadOpen = null;
      ST.acDel = null; TD.render(); return;
    }
    if ('demoAcup' in ds) { var au = ds.demoAcup.split(':'); auOpen(au[0], au[1]); return; }
    if ('demoAumode' in ds) { AU.mode = ds.demoAumode; AU.own = null; auRender(); return; }
    if ('demoAupack' in ds) { AU.own = null; auRender(); return; }
    if ('demoAuread' in ds) { auRead(); return; }
    if ('demoAusave' in ds) { auSave(); return; }
    if ('demoAtt' in ds) { attOpen(); return; }
    if ('demoAttup' in ds) { attUpOpen(); return; }
    if ('demoAttupsample' in ds) { if (ST.attUp) { ST.attUp.own = null; attUpRender(); } return; }
    if ('demoAttupread' in ds) { if (ST.attUp) attUpRead(); return; }
    if ('demoAttset' in ds) { var pr = ds.demoAttset.split(':'); ST.attDraft[pr[0]] = pr[1]; attRender(); return; }
    if ('demoAttsave' in ds) { ST.attToday = Object.assign({}, ST.attDraft); ST.attTaken = true; closeOverlays(); TD.render(); var sm = attSummary(); toast(fill(C.dSaved, { p: sm.p, n: sm.n })); return; }
    if ('demoDup' in ds) { dupOpen(ds.demoDup || (ST.dataOpen || '')); return; }
    if ('demoDupsample' in ds) { ST.dup.sample = +ds.demoDupsample; ST.dup.own = null; dupRender(); return; }
    if ('demoDupsave' in ds) { if (!b.disabled) dupSave(); return; }
    if ('demoFpop' in ds) { filesPop(); return; }
    if ('demoFile' in ds) { var fp = ds.demoFile.split(':'); viewFile(fp[0], +fp[1]); return; }
    if ('demoOvclose' in ds) { if (e.target === b || !b.classList.contains('dm-upscrim')) closeOverlays(); return; }
    if ('demoMic' in ds) { micToggle(b.closest('.dm-note, .ask-compose')); return; }
    if ('demoNoteprime' in ds) { NOTE.primed = !NOTE.primed; NOTE.pending = null; TD.render(); var ai = document.querySelector('.ask-input'); if (ai) ai.focus(); return; }
    if ('demoNotesave' in ds) { saveNote(b.closest('.dm-note')); return; }
    if ('demoNoteopen' in ds) { (ST.noteOpen = ST.noteOpen || {})[ds.demoNoteopen] = true; TD.render(); var ni = document.querySelector('.dm-pp .dm-notein'); if (ni) ni.focus(); return; }
    if ('demoDone' in ds) { ST.done[ds.demoDone] = !ST.done[ds.demoDone]; saveWork(); TD.render(); return; }
    if ('demoDay' in ds) { ST.day = +ds.demoDay; ST.box = null; TD.render(); return; }
    // Phone: open one box's checklist (0 = back to the tiles), then put focus where the eye is.
    if ('demoBox' in ds) {
      var was = ST.box; ST.box = +ds.demoBox || null; TD.render();
      var f = document.querySelector(ST.box ? '.dt-back' : '.dt-tile[data-demo-box="' + was + '"]'); if (f) f.focus();
      return;
    }
    if ('demoAssess' in ds) { TD.goAssess('pending'); return; }   // straight to who's still to observe
    if ('demoAskq' in ds) { askNow(ds.demoAskq); return; }
    if ('demoAskstu' in ds) { TD.openAsk('', ''); return; }   // on the child's page, so the chips are about them
    if ('demoUpload' in ds) { upOpen(ds.demoUpload); return; }
    if ('demoSheet' in ds) { UP.sheet = +ds.demoSheet; upRender(); return; }
    if ('demoUpread' in ds) { upRead(); return; }
    if ('demoUpsave' in ds) { var s = allKids().find(function (x) { return x.id === UP.stu; }); ST.uploads[UP.stu] = { sheet: UP.sheet };
      var shx = C.sheets[UP.sheet], sf = UP.own ? { type: 'maths', title: C.types.maths, when: C.dTodayW, src: UP.own.src, thumb: UP.own.thumb, kind: UP.own.kind, sample: false } : sampleFile('maths', UP.sheet, C.dTodayW);
      sf.title = shx.name; sf.score = Math.round(parseInt(shx.score, 10) / parseInt(shx.score.split('/')[1], 10) * 100); (ST.files[UP.stu] = ST.files[UP.stu] || []).unshift(sf); upRender(); TD.render(); return; }
    if ('demoUpclose' in ds) { if (e.target === b || !b.classList.contains('dm-upscrim')) upClose(); return; }
    if ('demoQ' in ds) { if (!b.disabled) TD.sendAsk(ds.demoQ); return; }
    if ('demoReset' in ds) { forgetView(); location.reload(); return; }
  });
  document.addEventListener('change', function (e) {
    var tg = e.target; if (!tg.matches) return;
    if (tg.matches('[data-demo-dupstu]') && ST.dup) { ST.dup.stu = tg.value; dupRender(); return; }
    if (tg.matches('[data-demo-duptype]') && ST.dup) { ST.dup.type = tg.value; ST.dup.sample = 0; dupRender(); return; }
    if (tg.matches('[data-demo-dupfile]') && ST.dup) { dupFile(tg.files && tg.files[0]); return; }
    if (tg.matches('[data-demo-upstu]') && UP) { UP.stu = tg.value; }
    if (tg.matches('[data-demo-austu]') && AU) { AU.stu = tg.value; }
    if (tg.matches('[data-demo-fkid]')) { ST.filesKid = tg.value; ST.filesAll = false; window.TD.render(); var f = document.querySelector('[data-demo-fkid]'); if (f) f.focus(); return; }
    if (tg.matches('[data-demo-aufile]') && AU) { auFile(tg.files); }
    if (tg.matches('[data-demo-attupfile]') && ST.attUp && tg.files && tg.files[0]) { ST.attUp.own = tg.files[0].name; attUpRender(); }
  });
  // Search on the Data page filters rows in place (no re-render, so typing keeps focus).
  document.addEventListener('input', function (e) {
    if (!e.target.matches || !e.target.matches('[data-demo-dsearch]')) return;
    var q = ST.dataQ = e.target.value.trim().toLowerCase(), any = false;
    document.querySelectorAll('.dd-row[data-name]').forEach(function (r) { var hit = !q || r.getAttribute('data-name').indexOf(q) >= 0; r.hidden = !hit; any = any || hit; });
    var none = document.querySelector('.dd-none'); if (none) none.hidden = any;
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('rc-in')) { e.preventDefault(); if (e.target.closest('.rc-aedit') && ST.acEdit) acadSave(ST.acEdit); else acadCreate(); return; } });
  document.addEventListener('keydown', function (e) { if (e.key !== 'Escape') return; var om = document.querySelector('.rc-attmenu[open], .rc-amenu[open], .roster-sortmenu[open], .roster-kebab[open]'); if (om) { om.removeAttribute('open'); return; } if (document.querySelector('.dm-ov')) closeOverlays(); else if (UP) upClose(); else if (document.getElementById('dm-welcome')) closeWelcome(); });

  // ---------- refresh keeps your place ----------
  // Remembered in sessionStorage: this tab only, gone when the tab closes, so every new phone still starts
  // at the landing page. WHERE you are is kept here (screen, child, tab, day); ticks and notes via saveWork(); uploads etc. reset.
  var VIEW_KEY = 'tilliDemo.view', noSave = false;
  function saveView() {
    if (noSave || document.getElementById('dm-landing')) return;
    var S = window.TD && window.TD.S; if (!S) return;
    try { sessionStorage.setItem(VIEW_KEY, JSON.stringify({ nav: S.nav, gardenLevel: S.gardenLevel, sectionId: S.sectionId, studentId: S.studentId,
      studentTab: S.studentTab, assessTab: S.assessTab, rosterView: S.rosterView, acadView: ST.acadView, day: ST.day })); } catch (e) {}
  }
  window.addEventListener('pagehide', saveView);
  function restore() {
    var v; try { v = JSON.parse(sessionStorage.getItem(VIEW_KEY) || 'null'); } catch (e) {}
    var TD = window.TD; if (!v || !TD || !TD.S) return false;
    var S = TD.S;
    ['nav', 'gardenLevel', 'studentTab', 'assessTab', 'rosterView'].forEach(function (k) { if (v[k] != null) S[k] = v[k]; });
    if (S.studentTab === 'school') S.studentTab = 'passport';   // School data was merged into Passport
    if (S.nav === 'data') { S.nav = 'assess'; S.assessTab = 'records'; }
    if (v.sectionId && S.data.sections.some(function (x) { return x.id === v.sectionId; })) S.sectionId = v.sectionId;
    // Each language has its own children, so a child is only reopened if they exist here.
    var kid = v.studentId && S.data.sections.some(function (x) { return (x.students || []).some(function (k) { return k.id === v.studentId; }); });
    S.studentId = kid ? v.studentId : null;
    if (!kid && S.nav === 'students' && v.studentId) S.nav = 'garden';
    ST.day = v.day > 0 && v.day < 3 ? v.day : 0;
    if (v.recSub === 'acad' && S.assessTab === 'todo') S.assessTab = 'acad';   // views saved before the 3-tab split
    if (v.acadView === 'a' || v.acadView === 'k') ST.acadView = v.acadView;
    TD.render();
    return true;
  }
  function forgetView() { noSave = true; try { sessionStorage.removeItem(VIEW_KEY); sessionStorage.removeItem(WORK_KEY); } catch (e) {} }

  window.DemoUI = { askFor: askFor, composerPh: composerPh, composerMic: composerMic, bankReply: function (q) { return BANK && BL ? bankReply(q) : null; }, hasBank: function () { return !!(BANK && BL); }, t: t, mondayCard: mondayCard, passport: passport, passportDoc: passportDoc, passportFile: passportFile, sumStrip: sumStrip, planCard: planCard, attCard: attCardOf, chipsHTML: chipsHTML, answer: answer, profileExtras: profileExtras, welcome: welcome, landing: landing, restore: restore, report: REPORT, askBtn: askBtn, recordsPage: recordsPage, gardenAttendance: gardenAttendance, assessPage: assessPage, assessTabs: assessTabs, SKILL: SKILL, BAND: BAND };
})();
