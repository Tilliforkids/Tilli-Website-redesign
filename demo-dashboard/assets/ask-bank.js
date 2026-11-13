/* ============================================================
   Ask Tilli — demo question bank (teacher view, English + Spanish)
   ------------------------------------------------------------
   ~100 questions a Grade 3 teacher might type, in the style of the
   website's Ask Tilli bank (ask-tilli-questions.json). Matched by the
   engine in demo-content.js (bankReply). Every answer is a function of
   live demo data (h = helpers()), so it stays true after uploads.

   Entry: { id, cat, q:{en,es}, m:{en:[rules],es:[rules]}, not?, w?,
            child?, th:{en:[steps],es:[steps]} | fn, a:{en:fn,es:fn}, next:[ids] }
   Rule  : groups joined by ' + ' (all must match); alternatives by '|';
           a trailing * matches a word start; '@child' = a child is named
           (or "he/she" with a child already in the chat); '@skill' = a
           skill is named. Text is lower-cased with accents stripped.
   Hindi keeps the 8 tap chips (no typed bank).
   ============================================================ */
(function () {
  'use strict';
  var E = [];
  function B(id, cat, o) { o.id = id; o.cat = cat; E.push(o); }
  var SKS = ['emotion_awareness', 'emotion_regulation', 'empathy', 'relationship_skills', 'metacognition', 'critical_thinking',
    'working_memory', 'planning', 'cognitive_flexibility', 'inhibition_distraction', 'inhibition_response', 'attention'];

  // ---------- words ----------
  var skillWords = {
    en: { emotion_awareness: ['emotion awareness', 'feelings', 'feeling', 'name emotions', 'naming feelings', 'notice their feelings', 'self awareness'],
      emotion_regulation: ['emotion regulation', 'self regulation', 'regulation', 'regulate*', 'calm*', 'big feelings', 'tantrum*', 'meltdown*', 'anger', 'angry', 'temper'],
      empathy: ['empathy', 'empath*', 'kindness', 'kind to others', 'caring'],
      relationship_skills: ['relationship skills', 'relationship*', 'friends', 'friendship*', 'teamwork', 'team work', 'getting along', 'social skills', 'share', 'sharing'],
      metacognition: ['metacognition', 'metacogn*', 'check their own work', 'thinking about thinking', 'reflect*', 'self check'],
      critical_thinking: ['critical thinking', 'critical*', 'reasoning', 'problem solving', 'think critically'],
      working_memory: ['working memory', 'memory', 'forget*', 'remember instructions', 'instructions'],
      planning: ['planning', 'plan their work', 'organis*', 'organiz*', 'organization', 'organisation'],
      cognitive_flexibility: ['cognitive flexibility', 'flexib*', 'change of plan', 'plans change', 'transitions', 'rigid'],
      inhibition_distraction: ['inhibition distraction', 'distract*', 'easily distracted'],
      inhibition_response: ['inhibition response', 'impuls*', 'interrupt*', 'blurt*', 'waiting their turn', 'wait their turn'],
      attention: ['attention', 'focus*', 'concentrat*', 'pay attention', 'attentive'] },
    es: { emotion_awareness: ['conciencia emocional', 'emociones', 'sentimientos', 'reconocer emociones', 'nombrar emociones', 'lo que sienten'],
      emotion_regulation: ['regulacion emocional', 'autorregulacion', 'regulacion', 'regular*', 'calma*', 'tranquil*', 'rabieta*', 'enfad*', 'ira', 'enojo', 'frustracion'],
      empathy: ['empatia', 'empatic*', 'amabilidad', 'ponerse en el lugar'],
      relationship_skills: ['habilidades de relacion', 'relacion*', 'amigos', 'amistad*', 'trabajo en equipo', 'en equipo', 'convivencia', 'compartir', 'habilidades sociales'],
      metacognition: ['metacognicion', 'metacogn*', 'revisar su trabajo', 'revisen su trabajo', 'reflexion*', 'pensar sobre su pensamiento'],
      critical_thinking: ['pensamiento critico', 'critic*', 'razonamiento', 'razonar', 'resolver problemas'],
      working_memory: ['memoria de trabajo', 'memoria', 'olvid*', 'instrucciones', 'consignas'],
      planning: ['planificacion', 'planificar', 'organizacion', 'organizar*', 'organiz*'],
      cognitive_flexibility: ['flexibilidad cognitiva', 'flexib*', 'cambios de plan', 'cambia el plan', 'transiciones', 'rigid*'],
      inhibition_distraction: ['inhibicion distraccion', 'distrae*', 'distraccion*', 'distraid*'],
      inhibition_response: ['inhibicion respuesta', 'impuls*', 'interrump*', 'esperar su turno', 'respetar el turno'],
      attention: ['atencion', 'concentra*', 'centrarse', 'atent*', 'prestar atencion'] },
  };
  // Note sorting: words in a teacher's note → the skill it most likely touches.
  var noteWords = {
    en: { emotion_regulation: ['angry', 'anger', 'upset', 'cried', 'crying', 'cry', 'tantrum', 'meltdown', 'frustrated', 'frustration', 'shouted', 'shouting', 'yelled', 'hit', 'hitting', 'snapped', 'calmed', 'calm', 'calmer', 'temper', 'overwhelmed', 'stormed'],
      emotion_awareness: ['sad', 'worried', 'anxious', 'nervous', 'scared', 'happy', 'excited', 'proud', 'feeling', 'feelings', 'named', 'told me he felt', 'told me she felt', 'lonely', 'quiet', 'withdrawn'],
      empathy: ['kind', 'helped', 'comforted', 'shared', 'noticed a friend', 'hugged', 'cared', 'mean', 'teased', 'laughed at'],
      relationship_skills: ['friend', 'friends', 'played', 'alone', 'fight', 'fought', 'argued', 'argument', 'left out', 'group', 'partner', 'team', 'bullied', 'new friend', 'included'],
      metacognition: ['checked', 'checked his work', 'checked her work', 'noticed his mistake', 'noticed her mistake', 'fixed', 'reflected', 'asked for help', 'gave up', 'stuck'],
      critical_thinking: ['figured out', 'reasoned', 'explained why', 'solved', 'puzzle', 'curious', 'asked why'],
      working_memory: ['forgot', 'forgets', 'forgetting', 'lost track', 'remembered', 'mixed up', 'confused', 'word problem', 'word problems', 'instructions'],
      planning: ['disorganised', 'disorganized', 'messy', 'planned', 'organised', 'organized', 'late homework', 'homework', 'packed', 'unprepared'],
      cognitive_flexibility: ['change', 'changed', 'routine', 'transition', 'refused', 'stuck on', 'new way', 'switch'],
      inhibition_distraction: ['distracted', 'daydreaming', 'looking out', 'window', 'fidget', 'fidgeting', 'off task'],
      inhibition_response: ['interrupted', 'interrupting', 'blurted', 'grabbed', 'pushed', 'impulsive', 'could not wait', 'couldnt wait', 'jumped in'],
      attention: ['focus', 'focused', 'concentrate', 'concentrated', 'attention', 'listening', 'zoned out', 'after lunch'] },
    es: { emotion_regulation: ['enfadado', 'enfadada', 'enfado', 'lloro', 'llorando', 'rabieta', 'frustrado', 'frustrada', 'frustracion', 'grito', 'gritando', 'pego', 'se calmo', 'tranquilo', 'tranquila', 'nervioso', 'nerviosa', 'desbordado', 'desbordada'],
      emotion_awareness: ['triste', 'preocupado', 'preocupada', 'ansioso', 'ansiosa', 'miedo', 'contento', 'contenta', 'feliz', 'orgulloso', 'orgullosa', 'sentia', 'se sentia', 'solo', 'sola', 'callado', 'callada'],
      empathy: ['amable', 'ayudo', 'consolo', 'compartio', 'abrazo', 'se preocupo', 'se burlo', 'se rio de'],
      relationship_skills: ['amigo', 'amiga', 'amigos', 'jugo', 'jugando', 'pelea', 'peleo', 'discutio', 'excluido', 'excluida', 'grupo', 'pareja', 'equipo', 'acoso'],
      metacognition: ['reviso', 'reviso su trabajo', 'se dio cuenta de su error', 'corrigio', 'pidio ayuda', 'se rindio', 'atascado', 'atascada'],
      critical_thinking: ['descubrio', 'razono', 'explico por que', 'resolvio', 'curioso', 'curiosa', 'pregunto por que'],
      working_memory: ['olvido', 'se olvida', 'olvida', 'se perdio', 'recordo', 'confundio', 'confundido', 'confundida', 'problemas', 'instrucciones'],
      planning: ['desorganizado', 'desorganizada', 'desordenado', 'desordenada', 'planifico', 'organizado', 'organizada', 'deberes'],
      cognitive_flexibility: ['cambio', 'cambios', 'rutina', 'transicion', 'se nego', 'no quiso cambiar'],
      inhibition_distraction: ['distraido', 'distraida', 'en las nubes', 'ventana', 'se movia', 'inquieto', 'inquieta'],
      inhibition_response: ['interrumpio', 'interrumpe', 'interrumpiendo', 'empujo', 'impulsivo', 'impulsiva', 'no pudo esperar', 'no espero su turno'],
      attention: ['concentrarse', 'concentrado', 'concentrada', 'atencion', 'escuchaba', 'despues del recreo', 'despues de comer'] },
  };
  var upWords = { en: ['great', 'well', 'better', 'proud', 'calmed', 'calmer', 'helped', 'kind', 'shared', 'focused', 'remembered', 'solved', 'figured out', 'included', 'new friend', 'happy', 'checked'],
    es: ['bien', 'mejor', 'genial', 'orgulloso', 'orgullosa', 'se calmo', 'ayudo', 'amable', 'compartio', 'concentrado', 'concentrada', 'recordo', 'resolvio', 'contento', 'contenta', 'feliz', 'reviso'] };
  var downWords = { en: ['not', 'no', 'didnt', 'couldnt', 'hard', 'struggled', 'never', 'upset', 'angry', 'forgot', 'refused', 'alone', 'sad'],
    es: ['no', 'nunca', 'le costo', 'dificil', 'triste', 'enfadado', 'enfadada', 'olvido', 'se nego', 'solo', 'sola'] };
  var noteCue = { en: ['note', 'remember', 'fyi', 'heads up', 'today', 'this morning', 'yesterday', 'just now', 'hey'],
    es: ['nota', 'apunta', 'recuerda', 'hoy', 'esta manana', 'ayer', 'ahora mismo', 'oye', 'ojo'] };
  var askCue = { en: ['worried about', 'concerned about', 'idea for', 'ideas for', 'activity for', 'game for', 'plan for', 'suggest*'], es: ['me preocupa', 'preocupado por', 'preocupada por', 'idea para', 'ideas para', 'actividad para', 'juego para', 'sugiere*'] };
  var qStart = { en: ['how', 'what', 'which', 'who', 'why', 'when', 'where', 'should', 'can', 'could', 'is', 'are', 'does', 'do', 'give', 'show', 'tell me', 'list', 'write', 'help', 'compare', 'summarise', 'summarize', 'plan'],
    es: ['como', 'que', 'cual', 'cuales', 'quien', 'quienes', 'por que', 'cuando', 'donde', 'deberia', 'puedes', 'puedo', 'es', 'esta', 'dame', 'dime', 'muestrame', 'escribe', 'ayudame', 'compara', 'resume', 'planifica', 'cuentame'] };
  var pron = { en: ['he', 'she', 'him', 'her', 'his', 'hers'], es: ['ella', 'este nino', 'esta nina', 'este alumno', 'esta alumna'] };

  // ---------- per-skill copy (what it looks like · a 10-minute activity · a one-line tip · why it matters) ----------
  var TIP = {
    en: {
      emotion_awareness: { looks: 'naming how they feel ("I’m frustrated, not angry") and noticing feelings in others', act: '**Feelings weather report** (10 min): each child picks sunny, cloudy or stormy for how they feel and says one word why. You go first.', tip: 'Name the feeling out loud for them: "You look disappointed."', why: 'Children who can name a feeling can start to manage it, and they learn better when they feel understood.' },
      emotion_regulation: { looks: 'calming down after a setback, asking for help instead of shouting, waiting when upset', act: '**Balloon breaths + calm corner** (10 min): teach 3 slow balloon breaths, practise them together, then show the calm corner and its two rules.', tip: 'Offer a "reset" before a consequence: two breaths, then try again.', why: 'Calm children can think: regulation comes before working memory and attention can do their job.' },
      empathy: { looks: 'noticing when a classmate is upset, offering help, imagining how someone else feels', act: '**How would they feel?** (10 min): read a 3-line story, pause, and ask partners how each character feels and what would help.', tip: 'Ask "How do you think she felt?" after any conflict, before "Who started it?"', why: 'Empathy keeps group work kind and cuts down conflicts you would otherwise have to settle.' },
      relationship_skills: { looks: 'taking turns, joining a game, sorting out small disagreements with words', act: '**Pair-share with roles** (10 min): partners take turns as "talker" and "listener"; the listener repeats one thing they heard.', tip: 'Give every group job a name (reader, timer, checker) so no one is left out.', why: 'Children who get along spend more time learning and less time sorting out friendships.' },
      metacognition: { looks: 'checking their own work, saying what they found hard, choosing a strategy', act: '**Traffic-light check** (10 min): after a task, children mark it green / amber / red and write one thing that helped.', tip: 'Ask "How do you know it’s right?" instead of "Is it right?"', why: 'Children who check their own thinking catch their own mistakes, and keep improving without you.' },
      critical_thinking: { looks: 'asking why, comparing two answers, explaining their reasoning', act: '**Which one doesn’t belong?** (10 min): show 4 pictures or numbers; partners argue which is the odd one out and why. More than one answer can be right.', tip: 'Praise the reasoning, not just the right answer.', why: 'Reasoning is what turns facts into understanding in every subject.' },
      working_memory: { looks: 'holding a 2–3 step instruction in mind, keeping track in multi-step maths', act: '**Simon says, plus one** (10 min): give 2-step instructions, then 3-step ones; children repeat them back before acting.', tip: 'Give one step at a time and write the steps on the board.', why: 'Working memory is behind word problems and following instructions; supporting it lifts maths marks too.' },
      planning: { looks: 'breaking a task into steps, having materials ready, finishing on time', act: '**Plan–Do–Review** (10 min): children draw 3 boxes, plan a small task, do it, then tick what went to plan.', tip: 'Model your own plan out loud: "First… then… last…".', why: 'Planning helps children finish what they start, and feel in control of their work.' },
      cognitive_flexibility: { looks: 'trying another way when stuck, coping when plans change', act: '**Two ways to solve it** (10 min): give one maths problem and ask pairs to find two different ways to solve it.', tip: 'Warn before changes: "In 2 minutes we’ll switch."', why: 'Flexible thinkers recover faster from mistakes and handle new topics better.' },
      inhibition_distraction: { looks: 'staying on task with noise around, ignoring distractions', act: '**Statue focus** (10 min): set a 3-minute task while you make small sounds; children who stay on task "freeze" their focus. Grow the time each day.', tip: 'Seat easily distracted children away from doors and windows, near you.', why: 'Shutting out distractions is what lets attention last through a lesson.' },
      inhibition_response: { looks: 'waiting their turn, putting a hand up instead of calling out', act: '**Red light, green light — talk version** (10 min): children may speak only on "green"; practise waiting with a fun topic.', tip: 'Give a "thinking time" signal before anyone answers.', why: 'Stopping and thinking before acting keeps children safe and makes class discussions work.' },
      attention: { looks: 'listening to a short explanation, staying with a task for 10–15 minutes', act: '**Listen for the word** (10 min): read a short story; children clap every time they hear a chosen word.', tip: 'Break work into short chunks with a quick movement break between them.', why: 'Attention is the doorway to every lesson: what a child doesn’t notice, they can’t learn.' },
    },
    es: {
      emotion_awareness: { looks: 'poner nombre a lo que sienten ("estoy frustrado, no enfadado") y notar lo que sienten los demás', act: '**El tiempo de mis emociones** (10 min): cada alumno elige sol, nubes o tormenta según cómo se siente y dice una palabra de por qué. Empiezas tú.', tip: 'Ponle nombre a la emoción en voz alta: "Pareces decepcionado".', why: 'Quien sabe nombrar una emoción puede empezar a gestionarla, y aprende mejor cuando se siente comprendido.' },
      emotion_regulation: { looks: 'calmarse tras un contratiempo, pedir ayuda en vez de gritar, esperar cuando está alterado', act: '**Respiración de globo + rincón de la calma** (10 min): enseña 3 respiraciones lentas de globo, practicadlas juntos y presenta el rincón de la calma con sus dos normas.', tip: 'Ofrece un "reinicio" antes de una consecuencia: dos respiraciones y vuelve a intentarlo.', why: 'Un alumno tranquilo puede pensar: la regulación va antes de que la memoria y la atención funcionen.' },
      empathy: { looks: 'darse cuenta de que un compañero está mal, ofrecer ayuda, imaginar cómo se siente otro', act: '**¿Cómo se sentiría?** (10 min): lee un cuento de 3 líneas, para y pregunta por parejas cómo se siente cada personaje y qué le ayudaría.', tip: 'Tras un conflicto, pregunta "¿Cómo crees que se sintió?" antes de "¿Quién empezó?".', why: 'La empatía hace que el trabajo en grupo sea amable y reduce los conflictos que tendrías que resolver tú.' },
      relationship_skills: { looks: 'respetar turnos, unirse a un juego, resolver pequeños desacuerdos hablando', act: '**Parejas con roles** (10 min): por turnos, uno habla y otro escucha; quien escucha repite una cosa que ha oído.', tip: 'Da a cada tarea de grupo un rol (lector, tiempo, revisor) para que nadie se quede fuera.', why: 'Los alumnos que se llevan bien dedican más tiempo a aprender y menos a resolver problemas de amistad.' },
      metacognition: { looks: 'revisar su propio trabajo, decir qué les ha costado, elegir una estrategia', act: '**Semáforo** (10 min): tras una tarea, cada alumno la marca en verde, ámbar o rojo y escribe una cosa que le ayudó.', tip: 'Pregunta "¿Cómo sabes que está bien?" en vez de "¿Está bien?".', why: 'Quien revisa su propio pensamiento detecta sus errores y sigue mejorando sin ti.' },
      critical_thinking: { looks: 'preguntar por qué, comparar dos respuestas, explicar su razonamiento', act: '**¿Cuál sobra?** (10 min): muestra 4 imágenes o números; por parejas defienden cuál sobra y por qué. Puede haber más de una respuesta correcta.', tip: 'Elogia el razonamiento, no solo la respuesta correcta.', why: 'Razonar es lo que convierte los datos en comprensión, en todas las materias.' },
      working_memory: { looks: 'retener una consigna de 2 o 3 pasos, no perder el hilo en problemas de varios pasos', act: '**Simón dice, uno más** (10 min): da consignas de 2 pasos y luego de 3; los alumnos las repiten antes de hacerlas.', tip: 'Da un paso cada vez y escribe los pasos en la pizarra.', why: 'La memoria de trabajo está detrás de los problemas y de seguir instrucciones; apoyarla también sube las notas de mates.' },
      planning: { looks: 'dividir una tarea en pasos, tener el material listo, acabar a tiempo', act: '**Planifico, hago, reviso** (10 min): dibujan 3 cajas, planifican una tarea pequeña, la hacen y marcan qué salió según lo previsto.', tip: 'Planifica en voz alta delante de ellos: "Primero… luego… al final…".', why: 'Planificar ayuda a terminar lo que empiezan y a sentir que controlan su trabajo.' },
      cognitive_flexibility: { looks: 'probar otra forma cuando se atascan, adaptarse cuando cambia el plan', act: '**Dos maneras de resolverlo** (10 min): da un problema y pide a cada pareja dos formas distintas de resolverlo.', tip: 'Avisa antes de un cambio: "En 2 minutos cambiamos".', why: 'Quien piensa con flexibilidad se recupera antes de los errores y afronta mejor los temas nuevos.' },
      inhibition_distraction: { looks: 'seguir con la tarea aunque haya ruido, ignorar distracciones', act: '**Estatuas concentradas** (10 min): pon una tarea de 3 minutos mientras haces pequeños ruidos; quien sigue concentrado "congela" su atención. Alarga el tiempo cada día.', tip: 'Sienta a quien se distrae con facilidad lejos de puertas y ventanas, cerca de ti.', why: 'Saber ignorar distracciones es lo que permite que la atención dure toda la clase.' },
      inhibition_response: { looks: 'esperar su turno, levantar la mano en vez de hablar sin permiso', act: '**Semáforo de la palabra** (10 min): solo se habla con "verde"; practicad la espera con un tema divertido.', tip: 'Usa una señal de "tiempo para pensar" antes de que nadie responda.', why: 'Parar y pensar antes de actuar mantiene a los alumnos seguros y hace que las asambleas funcionen.' },
      attention: { looks: 'escuchar una explicación corta, mantenerse en una tarea 10–15 minutos', act: '**Atentos a la palabra** (10 min): lee un cuento corto; los alumnos dan una palmada cada vez que oyen una palabra elegida.', tip: 'Divide el trabajo en bloques cortos con una pausa de movimiento entre ellos.', why: 'La atención es la puerta de cada clase: lo que un alumno no percibe, no lo puede aprender.' },
    },
  };
  var tip = function (lang, k) { return TIP[lang][k] || TIP[lang].attention; };
  var VIEW = { en: { teacher: 'you', parent: 'parents', student: 'the children' }, es: { teacher: 'tú', parent: 'las familias', student: 'los alumnos' } };
  var pc = function (x) { return x + '%'; };

  // ================= Class overview =================
  B('c1', 'class', {
    q: { en: 'How is my class doing overall?', es: '¿Cómo va mi clase en general?' },
    m: { en: ['how + class|everyone|kids|children|students + doing|going|overall|progress*', 'overview|overall + class', 'class + summary'], es: ['como + clase|alumnos|ninos|grupo + va|van|general|progres*', 'resumen|vision general + clase', 'que tal + clase|alumnos|grupo'] },
    th: { en: ['Reading {cls}’s Midline results for all 12 skills', 'Counting children at each level', 'Checking which skills grew most since Baseline'], es: ['Leyendo los resultados de la fase intermedia de {cls} en las 12 habilidades', 'Contando alumnos por nivel', 'Viendo qué habilidades han crecido más desde la fase inicial'] },
    a: { en: function (h) { return '**' + h.cls + '** is mostly at **Learner** level: ' + h.bands.Learner.length + ' of ' + h.N + ' children, with ' + h.bands.Advanced.length + ' Advanced and ' + h.bands.Beginner.length + ' Beginner.\n• Strongest: **' + h.strong.name + '** (' + h.strong.adv + ' at Advanced)\n• Most room to grow: **' + h.gap.name + '** (' + h.gap.beg + ' at Beginner)\n• Grew most since Baseline: **' + h.grew.name + '** (+' + h.grew.grow + ' points)\n\nOverall the class is moving in the right direction. ' + h.gap.name + ' is where a small daily routine would help most.'; },
      es: function (h) { return '**' + h.cls + '** está sobre todo en nivel **Aprendiz**: ' + h.bands.Learner.length + ' de ' + h.N + ' alumnos, con ' + h.bands.Advanced.length + ' en Avanzado y ' + h.bands.Beginner.length + ' en Principiante.\n• Lo más fuerte: **' + h.strong.name + '** (' + h.strong.adv + ' en Avanzado)\n• Más margen de mejora: **' + h.gap.name + '** (' + h.gap.beg + ' en Principiante)\n• Lo que más ha crecido desde la fase inicial: **' + h.grew.name + '** (+' + h.grew.grow + ' puntos)\n\nEn general, la clase va en buena dirección. Una rutina diaria corta de ' + h.gap.lname + ' es lo que más ayudaría.'; } },
    next: ['c3', 'c2', 'c6'],
  });
  B('c2', 'class', {
    q: { en: 'What should I focus on this week?', es: '¿En qué me centro esta semana?' },
    m: { en: ['focus|priorit*|work on|start with + week|first|now|next|today', 'where + start', 'what + focus', 'what + priorit*'], es: ['centr*|priorid*|trabajar|empez* + semana|primero|ahora|hoy', 'por donde + empiezo|empezar', 'en que + centro|centrarme'] },
    th: { en: ['Finding the skill with the most children at Beginner', 'Checking which children it affects', 'Picking one low-prep routine'], es: ['Buscando la habilidad con más alumnos en Principiante', 'Viendo a qué alumnos afecta', 'Eligiendo una rutina sin preparación'] },
    a: { en: function (h) { var t = tip('en', h.gap.key); return 'Focus on **' + h.gap.name + '** this week: ' + h.gap.beg + ' of ' + h.N + ' children are at Beginner (' + h.list(h.beg(h.gap.key), 4) + ').\n\nTry this:\n' + t.act + '\n\nOne thing to do all week: ' + t.tip; },
      es: function (h) { var t = tip('es', h.gap.key); return 'Esta semana céntrate en **' + h.gap.name + '**: ' + h.gap.beg + ' de ' + h.N + ' alumnos están en Principiante (' + h.list(h.beg(h.gap.key), 4) + ').\n\nPrueba esto:\n' + t.act + '\n\nAlgo que hacer toda la semana: ' + t.tip; } },
    next: ['s2', 'r1', 'c15'],
  });
  B('c3', 'class', {
    q: { en: 'Which children need the most support?', es: '¿Qué alumnos necesitan más apoyo?' },
    m: { en: ['who|which + need*|support|help|struggl*|behind|tend', 'children|kids|students + need* + support|help'], es: ['quien*|que alumnos|cuales + necesit*|apoyo|ayuda|cuesta|cuestan|atras|retras*'] },
    not: { en: ['angry', 'anger', 'temper', 'tantrum*', 'interrupt*', 'stuck', 'plans change', 'forget*', 'forgot', 'distract*', 'feelings', 'how do i', 'mark*', 'observ*'], es: ['enfad*', 'rabieta*', 'interrump*', 'bloquea', 'cambia el plan', 'olvid*', 'distra*', 'sienten', 'como ayudo', 'corregir', 'observ*'] },
    th: { en: ['Ranking children by overall score', 'Checking each one’s lowest skill', 'Looking for anything in your notes'], es: ['Ordenando a los alumnos por puntuación global', 'Mirando la habilidad más baja de cada uno', 'Buscando algo en tus notas'] },
    a: { en: function (h) { return 'These children would benefit most from a little extra this week:\n' + h.tending.map(function (s) { var c = h.cast; var lo = s.skills.slice().sort(function (a, b) { return a.pct - b.pct; })[0]; return '• **' + h.n(s) + '**: ' + h.band(s.band) + ' overall; lowest in ' + h.sk(lo.key); }).join('\n') + '\n\nNone of this is a label. It’s where a short check-in or a small-group activity will make the biggest difference.'; },
      es: function (h) { return 'Estos alumnos se beneficiarían más de un poco de apoyo extra esta semana:\n' + h.tending.map(function (s) { var lo = s.skills.slice().sort(function (a, b) { return a.pct - b.pct; })[0]; return '• **' + h.n(s) + '**: ' + h.band(s.band) + ' en general; lo más bajo, ' + h.lsk(lo.key); }).join('\n') + '\n\nNo es una etiqueta: es donde una charla breve o una actividad en grupo pequeño marcará más la diferencia.'; } },
    next: ['k1', 'c15', 'k4'],
  });
  B('c4', 'class', {
    q: { en: 'What is my class strongest at?', es: '¿En qué es más fuerte mi clase?' },
    m: { en: ['strong*|strength*|best|good at|well', 'what + class + great at'], es: ['fuerte*|fortaleza*|mejor|destaca*|bien'] },
    th: { en: ['Counting children at Advanced in each skill', 'Comparing social-emotional and cognitive skills'], es: ['Contando alumnos en Avanzado por habilidad', 'Comparando habilidades socioemocionales y cognitivas'] },
    a: { en: function (h) { return h.cls + '’s biggest strength is **' + h.strong.name + '**: ' + h.strong.adv + ' of ' + h.N + ' children are already Advanced. Next comes **' + h.strong2.name + '** (' + h.strong2.adv + ' Advanced).\n\nUse it as a bridge: pair a child who is strong in ' + h.strong.name + ' with one who is still building ' + h.gap.name + '.'; },
      es: function (h) { return 'La mayor fortaleza de ' + h.cls + ' es **' + h.strong.name + '**: ' + h.strong.adv + ' de ' + h.N + ' alumnos ya están en Avanzado. Le sigue **' + h.strong2.name + '** (' + h.strong2.adv + ' en Avanzado).\n\nÚsala como puente: empareja a un alumno fuerte en ' + h.strong.lname + ' con otro que aún trabaja ' + h.gap.lname + '.'; } },
    next: ['c5', 'c13', 'c15'],
  });
  B('c5', 'class', {
    q: { en: 'What’s the biggest skill gap in my class?', es: '¿Cuál es la mayor carencia de mi clase?' },
    m: { en: ['gap|weak*|lowest|weakest|worst|hardest', 'most room|least developed', 'biggest|largest + gap|weakness'], es: ['carencia*|debil*|mas bajo|mas baja|peor|flojo|floja|cuesta mas|margen de mejora'] },
    th: { en: ['Counting children at Beginner in each skill', 'Checking the second-lowest skill'], es: ['Contando alumnos en Principiante por habilidad', 'Mirando la segunda habilidad más baja'] },
    a: { en: function (h) { return 'The biggest gap is **' + h.gap.name + '**: ' + h.gap.beg + ' of ' + h.N + ' children are at Beginner. Next is **' + h.gap2.name + '** (' + h.gap2.beg + ' at Beginner).\n\nIn Grade 3, ' + h.gap.name.toLowerCase() + ' looks like ' + tip('en', h.gap.key).looks + '. A small daily routine aimed at it will move the most children.'; },
      es: function (h) { return 'La mayor carencia es **' + h.gap.name + '**: ' + h.gap.beg + ' de ' + h.N + ' alumnos están en Principiante. Le sigue **' + h.gap2.name + '** (' + h.gap2.beg + ' en Principiante).\n\nEn 3.º, ' + h.gap.lname + ' se ve en ' + tip('es', h.gap.key).looks + '. Una rutina diaria corta centrada en ella es lo que más alumnos moverá.'; } },
    next: ['s2', 's3', 'c2'],
  });
  B('c6', 'class', {
    q: { en: 'Which skill has grown the most since Baseline?', es: '¿Qué habilidad ha crecido más desde la fase inicial?' },
    w: 100, m: { en: ['grown|grow*|improv*|progress* + most|biggest|best', 'since baseline'], es: ['crecid*|crecio|mejorad*|progres* + mas|mayor', 'desde la fase inicial|desde el inicio'] },
    th: { en: ['Comparing Baseline and Midline averages for each skill'], es: ['Comparando la media de la fase inicial y la intermedia en cada habilidad'] },
    a: { en: function (h) { return '**' + h.grew.name + '** grew the most: the class average went from ' + h.grew.pre + '% at Baseline to ' + h.grew.avg + '% now (+' + h.grew.grow + ').\n\nWhatever you have been doing for ' + h.grew.name.toLowerCase() + ' is working. Tell the class! Children grow more when they can see their own progress.'; },
      es: function (h) { return '**' + h.grew.name + '** es la que más ha crecido: la media de la clase pasó del ' + h.grew.pre + ' % en la fase inicial al ' + h.grew.avg + ' % ahora (+' + h.grew.grow + ').\n\nLo que estés haciendo para ' + h.grew.lname + ' funciona. ¡Cuéntaselo a la clase! Los alumnos crecen más cuando ven su propio progreso.'; } },
    next: ['c7', 'c13', 'c11'],
  });
  B('c7', 'class', {
    q: { en: 'Which skill is growing slowest?', es: '¿Qué habilidad crece más despacio?' },
    m: { en: ['slow*|least|stuck|not growing|flat|stalled'], es: ['despacio|lent*|menos|estancad*|no crece'] },
    th: { en: ['Comparing Baseline and Midline averages', 'Looking for the smallest change'], es: ['Comparando la media inicial y la intermedia', 'Buscando el cambio más pequeño'] },
    a: { en: function (h) { var t = tip('en', h.slow.key); return '**' + h.slow.name + '** has moved least: ' + h.slow.pre + '% at Baseline, ' + h.slow.avg + '% now (+' + h.slow.grow + ').\n\nSlow growth here is common mid-year; it often needs explicit practice rather than more time. ' + t.tip; },
      es: function (h) { var t = tip('es', h.slow.key); return '**' + h.slow.name + '** es la que menos se ha movido: ' + h.slow.pre + ' % en la fase inicial y ' + h.slow.avg + ' % ahora (+' + h.slow.grow + ').\n\nEs habitual a mitad de curso: suele necesitar práctica explícita más que tiempo. ' + t.tip; } },
    next: ['s3', 'c2', 'r7'],
  });
  B('c8', 'class', {
    q: { en: 'How many children are at each level?', es: '¿Cuántos alumnos hay en cada nivel?' },
    m: { en: ['how many + level*|beginner*|learner*|advanced', 'each level', 'level* + breakdown|split'], es: ['cuantos + nivel*|principiante*|aprendiz*|avanzad*', 'cada nivel'] },
    th: { en: ['Counting each child’s overall level'], es: ['Contando el nivel global de cada alumno'] },
    a: { en: function (h) { return 'Across all 12 skills, ' + h.cls + ' (' + h.N + ' children assessed):\n• **Advanced**: ' + h.bands.Advanced.length + (h.bands.Advanced.length ? ' (' + h.list(h.bands.Advanced, 4) + ')' : '') + '\n• **Learner**: ' + h.bands.Learner.length + '\n• **Beginner**: ' + h.bands.Beginner.length + (h.bands.Beginner.length ? ' (' + h.list(h.bands.Beginner, 4) + ')' : '') + '\n\nLevels are per skill too: most children are Advanced in one skill and Beginner in another.'; },
      es: function (h) { return 'En las 12 habilidades, ' + h.cls + ' (' + h.N + ' alumnos evaluados):\n• **Avanzado**: ' + h.bands.Advanced.length + (h.bands.Advanced.length ? ' (' + h.list(h.bands.Advanced, 4) + ')' : '') + '\n• **Aprendiz**: ' + h.bands.Learner.length + '\n• **Principiante**: ' + h.bands.Beginner.length + (h.bands.Beginner.length ? ' (' + h.list(h.bands.Beginner, 4) + ')' : '') + '\n\nLos niveles también van por habilidad: la mayoría está en Avanzado en una y en Principiante en otra.'; } },
    next: ['t3', 'c3', 'c4'],
  });
  B('c9', 'class', {
    q: { en: 'Summarise my class for my principal', es: 'Resume mi clase para la dirección' },
    m: { en: ['principal|head|hod|coordinator|leadership|management', 'summar* + class|report|update'], es: ['direccion|director*|jefa de estudios|jefe de estudios|coordinador*|equipo directivo', 'resum* + clase|informe'] },
    th: { en: ['Collecting levels, growth and attendance', 'Writing it as a short update'], es: ['Reuniendo niveles, crecimiento y asistencia', 'Redactándolo como un resumen breve'] },
    a: { en: function (h) { return 'Here’s a short update you can paste:\n\n"**' + h.cls + ', Midline update.** ' + h.N + ' children assessed. Most are at Learner level (' + h.bands.Learner.length + '), ' + h.bands.Advanced.length + ' Advanced, ' + h.bands.Beginner.length + ' Beginner. Strongest skill: ' + h.strong.name + '. Biggest growth since Baseline: ' + h.grew.name + ' (+' + h.grew.grow + '). Focus for the next weeks: ' + h.gap.name + ' (' + h.gap.beg + ' children at Beginner), with a short daily routine. Term attendance averages ' + h.att.avg + '%."'; },
      es: function (h) { return 'Aquí tienes un resumen para pegar:\n\n"**' + h.cls + ', fase intermedia.** ' + h.N + ' alumnos evaluados. La mayoría está en nivel Aprendiz (' + h.bands.Learner.length + '), ' + h.bands.Advanced.length + ' en Avanzado y ' + h.bands.Beginner.length + ' en Principiante. Habilidad más fuerte: ' + h.strong.lname + '. Mayor crecimiento desde la fase inicial: ' + h.grew.lname + ' (+' + h.grew.grow + '). Prioridad para las próximas semanas: ' + h.gap.lname + ' (' + h.gap.beg + ' alumnos en Principiante), con una rutina diaria corta. La asistencia media del trimestre es del ' + h.att.avg + ' %."'; } },
    next: ['p7', 'c11', 'c1'],
  });
  B('c10', 'class', {
    q: { en: 'Are social-emotional or cognitive skills stronger?', es: '¿Son más fuertes las habilidades socioemocionales o las cognitivas?' },
    m: { en: ['social emotional|sel|socio emotional + cognitive|executive', 'cognitive + or|vs|versus|stronger|compare'], es: ['socioemocional* + cognitiv*', 'cognitiv* + o|frente|comparad*|mas fuert*'] },
    th: { en: ['Averaging the 6 social-emotional skills', 'Averaging the 6 cognitive skills'], es: ['Haciendo la media de las 6 socioemocionales', 'Haciendo la media de las 6 cognitivas'] },
    a: { en: function (h) { var more = h.sel >= h.cog; return '**' + (more ? 'Social-emotional' : 'Cognitive') + '** skills are a little stronger: ' + h.sel + '% average for social-emotional vs ' + h.cog + '% for cognitive.\n\nThey feed each other: calmer, more connected children have more attention and working memory free for learning.'; },
      es: function (h) { var more = h.sel >= h.cog; return 'Las habilidades **' + (more ? 'socioemocionales' : 'cognitivas') + '** son algo más fuertes: ' + h.sel + ' % de media en las socioemocionales frente a ' + h.cog + ' % en las cognitivas.\n\nSe alimentan entre sí: un alumno más tranquilo y conectado tiene más atención y memoria de trabajo libres para aprender.'; } },
    next: ['c4', 'c5', 's5'],
  });
  B('c11', 'class', {
    q: { en: 'Is my class on track for Endline?', es: '¿Va mi clase bien encaminada para la fase final?' },
    m: { en: ['on track|endline|end of year|by the end'], es: ['bien encaminad*|fase final|final de curso|a final'] },
    th: { en: ['Projecting the growth so far to the end of the year', 'Checking who is still to be observed'], es: ['Proyectando el crecimiento hasta final de curso', 'Viendo a quién falta observar'] },
    a: { en: function (h) { return 'Yes, mostly. The class has grown in most skills since Baseline (biggest: ' + h.grew.name + ', +' + h.grew.grow + '). At this pace most children will finish the year at Learner or above.\n\nTwo things would help most before Endline:\n• A routine for **' + h.gap.name + '** (' + h.gap.beg + ' still at Beginner)\n• ' + (h.midLeft ? 'Finishing the **' + h.midLeft + '** Midline observations still open' : 'Keeping your notes going, since every note sharpens the picture'); },
      es: function (h) { return 'Sí, en general. La clase ha crecido en casi todas las habilidades desde la fase inicial (la que más: ' + h.grew.lname + ', +' + h.grew.grow + '). A este ritmo, la mayoría acabará el curso en Aprendiz o más.\n\nAntes de la fase final, lo que más ayudaría:\n• Una rutina de **' + h.gap.lname + '** (' + h.gap.beg + ' aún en Principiante)\n• ' + (h.midLeft ? 'Terminar las **' + h.midLeft + '** observaciones de la fase intermedia pendientes' : 'Seguir con tus notas: cada nota afina la imagen'); } },
    next: ['c12', 'r10', 'c2'],
  });
  B('c12', 'class', {
    q: { en: 'Who still needs a Midline observation?', es: '¿A quién me falta observar en la fase intermedia?' },
    m: { en: ['who + observ*|observation* + left|still|need*|missing|pending', 'midline + left|pending|still'], es: ['quien|a quien + observ* + falta|faltan|pendiente*', 'observaciones + pendientes'] },
    th: { en: ['Checking this window’s observations for each child'], es: ['Revisando las observaciones de esta fase para cada alumno'] },
    a: { en: function (h) { return h.midLeft ? '**' + h.midLeft + '** children still need their Midline teacher observation' + (h.midClose ? ' (the window closes ' + h.midClose + ')' : '') + '. Each one takes about 3 minutes: open **Assess**, and the list starts with who is left.' : 'Everyone has their Midline teacher observation. Nothing left to do there 🌸'; },
      es: function (h) { return h.midLeft ? 'A **' + h.midLeft + '** alumnos les falta la observación docente de la fase intermedia' + (h.midClose ? ' (la fase cierra el ' + h.midClose + ')' : '') + '. Cada una lleva unos 3 minutos: abre **Evaluar** y la lista empieza por quién falta.' : 'Todos tienen su observación docente de la fase intermedia. No queda nada pendiente 🌸'; } },
    next: ['t7', 'c11', 'c1'],
  });
  B('c13', 'class', {
    q: { en: 'What can I celebrate with my class?', es: '¿Qué puedo celebrar con mi clase?' },
    m: { en: ['celebrat*|proud|good news|wins|praise'], es: ['celebrar|orgull*|buenas noticias|logros|felicitar'] },
    th: { en: ['Looking for the biggest gains since Baseline', 'Finding children who moved up a level'], es: ['Buscando las mayores mejoras desde la fase inicial', 'Buscando alumnos que han subido de nivel'] },
    a: { en: function (h) { return 'Plenty to celebrate 🎉\n• The class grew **+' + h.grew.grow + '** in ' + h.grew.name + ' since Baseline\n• ' + h.strong.adv + ' children are already Advanced in ' + h.strong.name + '\n• Term attendance averages **' + h.att.avg + '%**\n\nTry a "class win" moment on Friday: name the skill, say what you saw, and let children add their own examples.'; },
      es: function (h) { return 'Hay mucho que celebrar 🎉\n• La clase ha crecido **+' + h.grew.grow + '** en ' + h.grew.lname + ' desde la fase inicial\n• ' + h.strong.adv + ' alumnos ya están en Avanzado en ' + h.strong.lname + '\n• La asistencia media del trimestre es del **' + h.att.avg + ' %**\n\nPrueba un "logro de clase" el viernes: nombra la habilidad, di lo que viste y deja que los alumnos añadan sus ejemplos.'; } },
    next: ['c6', 'p7', 'r2'],
  });
  B('c14', 'class', {
    q: { en: 'Which children might be quietly falling behind?', es: '¿Qué alumnos se pueden estar quedando atrás sin que se note?' },
    w: 1100, m: { en: ['quiet*|falling behind|slipping|unnoticed|under the radar|not growing'], es: ['sin que se note|quedando atras|pasan desapercibid*|estancad*'] },
    th: { en: ['Looking for children whose scores barely moved', 'Leaving out children already flagged at Beginner'], es: ['Buscando alumnos cuyas puntuaciones apenas se movieron', 'Dejando fuera a quien ya está en Principiante'] },
    a: { en: function (h) { return h.quiet.length ? 'These children are doing fine on paper, but their scores have barely moved since Baseline:\n' + h.quiet.map(function (s) { return '• **' + h.n(s) + '**: ' + h.band(s.band) + ', ' + s.overallPre + '% → ' + s.overallPct + '%'; }).join('\n') + '\n\nThey are easy to miss because nothing is "wrong". A short one-to-one chat this week would tell you a lot.' : 'Good news: every child at Learner or above has grown since Baseline. No one is quietly stalling right now.'; },
      es: function (h) { return h.quiet.length ? 'A estos alumnos les va bien sobre el papel, pero sus puntuaciones apenas se han movido desde la fase inicial:\n' + h.quiet.map(function (s) { return '• **' + h.n(s) + '**: ' + h.band(s.band) + ', ' + s.overallPre + ' % → ' + s.overallPct + ' %'; }).join('\n') + '\n\nEs fácil pasarlos por alto porque nada va "mal". Una charla breve a solas esta semana te diría mucho.' : 'Buenas noticias: todos los alumnos en Aprendiz o más han crecido desde la fase inicial. Nadie se está estancando sin que se note.'; } },
    next: ['k1', 'c3', 'k10'],
  });
  B('c15', 'class', {
    q: { en: 'How should I group children for small-group work?', es: '¿Cómo agrupo a los alumnos para trabajar en grupos pequeños?' },
    m: { en: ['group*|pair*|partner*|seat* + children|kids|students|work|class', 'small group*'], es: ['agrup*|grupos|parejas|sentar + alumnos|ninos|trabajo|clase', 'grupos pequenos', 'hago|hacer|formo|formar + grupos|parejas'] },
    th: { en: ['Finding who is strong and who is still building the focus skill', 'Mixing levels so every group has a helper'], es: ['Viendo quién es fuerte y quién aún trabaja la habilidad prioritaria', 'Mezclando niveles para que cada grupo tenga un apoyo'] },
    a: { en: function (h) { var hi = h.highest(h.gap.key, 3), lo = h.lowest(h.gap.key, 3); return 'For **' + h.gap.name + '**, try mixed groups of 3–4 with one confident child in each:\n' + lo.map(function (s, i) { return '• Group ' + (i + 1) + ': **' + h.n(hi[i] || hi[0]) + '** with ' + h.n(s); }).join('\n') + '\n…and spread everyone else between them.\n\nGive each child a job (reader, timer, checker) so no one sits back.'; },
      es: function (h) { var hi = h.highest(h.gap.key, 3), lo = h.lowest(h.gap.key, 3); return 'Para **' + h.gap.lname + '**, prueba grupos mixtos de 3–4 con un alumno seguro en cada uno:\n' + lo.map(function (s, i) { return '• Grupo ' + (i + 1) + ': **' + h.n(hi[i] || hi[0]) + '** con ' + h.n(s); }).join('\n') + '\n…y reparte al resto entre ellos.\n\nDa un rol a cada alumno (lector, tiempo, revisor) para que nadie se quede atrás.'; } },
    next: ['r6', 's3', 'c2'],
  });

  // ================= One child ({child} = first name) =================
  B('k1', 'child', { child: true,
    q: { en: 'How is {child} doing?', es: '¿Cómo va {child}?' },
    m: { en: ['how + @child + doing|going|getting on|progress*|overall', 'tell me about + @child', '@child + update|overview|summary'], es: ['como + @child + va|esta|progres*|general', 'hablame de|cuentame de|cuentame sobre + @child', '@child + resumen'] },
    th: { en: ['Opening {child}’s Midline results', 'Comparing them with Baseline', 'Checking your notes and attendance'], es: ['Abriendo los resultados de {child} en la fase intermedia', 'Comparándolos con la fase inicial', 'Revisando tus notas y la asistencia'] },
    a: { en: function (h) { var c = h.ci; return '**' + c.n + '** is at **' + c.band + '** overall (' + c.pct + '%), ' + (c.growth > 0 ? 'up ' + c.growth + ' points since Baseline.' : 'about the same as at Baseline.') + '\n• Strongest: ' + c.top + ' (' + c.topBand + ')\n• Still building: ' + c.low + ' (' + c.lowBand + ')\n• Grew most: ' + c.grew + ' (+' + c.g + ')\n• Attendance: ' + c.att.pct + '%' + (c.notes.length ? '\n• Your latest note: "' + c.notes[0].text + '"' : '') + '\n\nThis week, the most useful thing is a little practice in ' + c.focus.toLowerCase() + '.'; },
      es: function (h) { var c = h.ci; return '**' + c.n + '** está en **' + c.band + '** en general (' + c.pct + ' %), ' + (c.growth > 0 ? c.growth + ' puntos más que en la fase inicial.' : 'más o menos igual que en la fase inicial.') + '\n• Lo más fuerte: ' + c.top + ' (' + c.topBand + ')\n• Aún trabajando: ' + c.low + ' (' + c.lowBand + ')\n• Lo que más creció: ' + c.grew + ' (+' + c.g + ')\n• Asistencia: ' + c.att.pct + ' %' + (c.notes.length ? '\n• Tu última nota: "' + c.notes[0].text + '"' : '') + '\n\nEsta semana, lo más útil es practicar un poco ' + c.focus.toLowerCase() + '.'; } },
    next: ['k4', 'k6', 'k9'],
  });
  B('k2', 'child', { child: true,
    q: { en: 'What is {child} strongest at?', es: '¿En qué destaca {child}?' },
    m: { en: ['@child + strong*|strength*|best|good at|great at'], es: ['@child + fuerte|fortaleza*|destaca|mejor|bien'] },
    th: { en: ['Sorting {child}’s 12 skills from highest to lowest'], es: ['Ordenando las 12 habilidades de {child} de mayor a menor'] },
    a: { en: function (h) { var c = h.ci; return c.n + '’s strongest skill is **' + c.top + '** (' + c.topBand + '). In maths, their best topic is ' + c.strong.toLowerCase() + ' (' + c.strongPct + '%).\n\nUse it: give ' + c.n + ' a role that leans on ' + c.top.toLowerCase() + ', like helper or explainer, especially on days that feel hard.'; },
      es: function (h) { var c = h.ci; return 'La habilidad más fuerte de ' + c.n + ' es **' + c.top + '** (' + c.topBand + '). En mates, su mejor tema es ' + c.strong.toLowerCase() + ' (' + c.strongPct + ' %).\n\nAprovéchalo: dale a ' + c.n + ' un papel que tire de esa habilidad, como ayudante o explicador, sobre todo en los días difíciles.'; } },
    next: ['k3', 'k19', 'k1'],
  });
  B('k3', 'child', { child: true,
    q: { en: 'Where does {child} need help?', es: '¿En qué necesita ayuda {child}?' },
    m: { en: ['@child + help|support|struggl*|weak*|lowest|need*|hard|difficult'], es: ['@child + ayuda|apoyo|cuesta|debil*|bajo|baja|necesita|dificil'] },
    th: { en: ['Finding {child}’s lowest skill', 'Linking it to maths marks'], es: ['Buscando la habilidad más baja de {child}', 'Relacionándola con las notas de mates'] },
    a: { en: function (h) { var c = h.ci, t = tip('en', c.focusKey); return c.n + ' needs the most support in **' + c.focus + '** (' + c.focusBand + '). In class that looks like a harder time ' + t.looks + '.\n' + (c.weakPct < 60 ? 'It shows up in maths too: ' + c.weak.toLowerCase() + ' is ' + c.weakPct + '%.\n' : '') + '\nOne thing to try: ' + t.tip; },
      es: function (h) { var c = h.ci, t = tip('es', c.focusKey); return c.n + ' necesita más apoyo en **' + c.focus + '** (' + c.focusBand + '). En clase se nota en ' + t.looks + '.\n' + (c.weakPct < 60 ? 'También se ve en mates: ' + c.weak.toLowerCase() + ' está en ' + c.weakPct + ' %.\n' : '') + '\nAlgo que probar: ' + t.tip; } },
    next: ['k4', 'k18', 'k6'],
  });
  B('k4', 'child', { child: true,
    q: { en: 'What should I try with {child} this week?', es: '¿Qué pruebo con {child} esta semana?' },
    m: { en: ['@child + try|do|activity|idea*|strategy|strategies|plan'], es: ['@child + pruebo|probar|hago|hacer|actividad|idea*|estrategia*'] },
    th: { en: ['Picking {child}’s focus skill', 'Choosing a 10-minute activity that fits it'], es: ['Eligiendo la habilidad prioritaria de {child}', 'Buscando una actividad de 10 minutos que encaje'] },
    a: { en: function (h) { var c = h.ci, t = tip('en', c.focusKey); return 'For **' + c.n + '**, work on ' + c.focus.toLowerCase() + ' this week:\n\n' + t.act + '\n\nDuring the day: ' + t.tip + '\n\nTell me how it goes and I’ll remember it.'; },
      es: function (h) { var c = h.ci, t = tip('es', c.focusKey); return 'Con **' + c.n + '**, trabaja ' + c.focus.toLowerCase() + ' esta semana:\n\n' + t.act + '\n\nDurante el día: ' + t.tip + '\n\nCuéntame cómo va y lo recordaré.'; } },
    next: ['k18', 'k6', 'k17'],
  });
  B('k5', 'child', { child: true,
    q: { en: 'How has {child} grown since Baseline?', es: '¿Cuánto ha crecido {child} desde la fase inicial?' },
    m: { en: ['@child + grow*|grown|improv*|progress*|since'], es: ['@child + crecid*|crecio|mejorad*|progres*|desde'] },
    th: { en: ['Comparing {child}’s Baseline and Midline scores skill by skill'], es: ['Comparando la fase inicial y la intermedia de {child}, habilidad por habilidad'] },
    a: { en: function (h) { var c = h.ci; return c.n + ' has gone from ' + c.s.overallPre + '% to ' + c.pct + '% overall (' + (c.growth >= 0 ? '+' : '') + c.growth + '). The biggest jump is in **' + c.grew + '** (+' + c.g + ').\n\nWorth telling ' + c.n + ' directly: "I’ve noticed you’re getting better at ' + c.grew.toLowerCase() + '."'; },
      es: function (h) { var c = h.ci; return c.n + ' ha pasado del ' + c.s.overallPre + ' % al ' + c.pct + ' % en general (' + (c.growth >= 0 ? '+' : '') + c.growth + '). El mayor salto está en **' + c.grew + '** (+' + c.g + ').\n\nMerece la pena decírselo a ' + c.n + ': "He notado que cada vez se te da mejor ' + c.grew.toLowerCase() + '".'; } },
    next: ['k1', 'k6', 'k11'],
  });
  B('k6', 'child', { child: true,
    q: { en: 'What do I tell {child}’s parents?', es: '¿Qué les digo a las familias de {child}?' },
    m: { en: ['@child + parent*|mum|mom|dad|family|families|home|ptm', 'tell + @child + parents'], es: ['@child + familia*|padre*|madre|casa|tutoria|reunion'] },
    th: { en: ['Starting with a strength', 'Picking one thing to work on together', 'Adding a home activity'], es: ['Empezando por una fortaleza', 'Eligiendo una cosa para trabajar juntos', 'Añadiendo una actividad para casa'] },
    a: { en: function (h) { var c = h.ci, t = tip('en', c.focusKey); return 'A warm way to say it:\n\n"' + c.n + ' is doing really well in **' + c.top.toLowerCase() + '**, and we’ve seen good growth in ' + c.grew.toLowerCase() + '. Something we’re working on together is ' + c.focus.toLowerCase() + '. At home, it helps to ' + t.tip.charAt(0).toLowerCase() + t.tip.slice(1) + '"\n\nYou can also send the parent report from ' + c.n + '’s page (Share report).'; },
      es: function (h) { var c = h.ci, t = tip('es', c.focusKey); return 'Una forma cercana de decirlo:\n\n"A ' + c.n + ' le va muy bien en **' + c.top.toLowerCase() + '**, y ha crecido en ' + c.grew.toLowerCase() + '. Algo que estamos trabajando juntos es ' + c.focus.toLowerCase() + '. En casa ayuda: ' + t.tip.charAt(0).toLowerCase() + t.tip.slice(1) + '"\n\nTambién puedes enviar el informe para la familia desde la página de ' + c.n + ' (Compartir informe).'; } },
    next: ['p2', 'k18', 'k1'],
  });
  B('k7', 'child', { child: true,
    q: { en: 'How is {child}’s attendance?', es: '¿Qué tal la asistencia de {child}?' },
    m: { en: ['@child + attendance|absent|absence*|missed|late|present'], es: ['@child + asistencia|falta*|ausencia*|tarde|retraso*'] },
    th: { en: ['Checking {child}’s register for this term'], es: ['Revisando el registro de {child} de este trimestre'] },
    a: { en: function (h) { var a = h.ci.att; return h.ci.n + '’s attendance this term is **' + a.pct + '%**: ' + a.days + ' day' + (a.days === 1 ? '' : 's') + ' absent' + (a.late ? ', ' + a.late + ' late' : '') + '.' + (a.absent.length ? '\nMissed: ' + a.absent.slice(-3).join(', ') : '') + (a.pct < 90 ? '\n\nThat’s below 90%, worth a friendly check-in with the family.' : '\n\nNothing to worry about.'); },
      es: function (h) { var a = h.ci.att; return 'La asistencia de ' + h.ci.n + ' este trimestre es del **' + a.pct + ' %**: ' + a.days + ' día' + (a.days === 1 ? '' : 's') + ' de falta' + (a.late ? ', ' + a.late + ' con retraso' : '') + '.' + (a.absent.length ? '\nFaltó: ' + a.absent.slice(-3).join(', ') : '') + (a.pct < 90 ? '\n\nEstá por debajo del 90 %: merece una charla amable con la familia.' : '\n\nNada que preocupe.'); } },
    next: ['a8', 'k1', 'a3'],
  });
  B('k8', 'child', { child: true,
    q: { en: 'How is {child} doing in maths?', es: '¿Cómo va {child} en mates?' },
    m: { en: ['@child + math*|maths|marks|grades|scores|test*|quiz* + doing|how|going|in'], es: ['@child + mates|matematicas|notas|examen*|control* + va|como|en|tal', '@child + notas de mates|notas de matematicas'] },
    th: { en: ['Reading {child}’s maths marks by topic', 'Looking for the skill behind the lowest topic'], es: ['Leyendo las notas de mates de {child} por tema', 'Buscando la habilidad detrás del tema más bajo'] },
    a: { en: function (h) { var c = h.ci, m = c.marks; return c.n + '’s maths this term:\n' + Object.keys(h.MATH).map(function (k) { return '• ' + h.MATH[k] + ': ' + m[k] + '%'; }).join('\n') + '\n\nLowest is **' + c.weak.toLowerCase() + '**' + (c.weakKey === 'words' || c.weakKey === 'mult' ? ', often a working-memory load rather than maths itself: reading, holding and calculating at once.' : '.'); },
      es: function (h) { var c = h.ci, m = c.marks; return 'Las mates de ' + c.n + ' este trimestre:\n' + Object.keys(h.MATH).map(function (k) { return '• ' + h.MATH[k] + ': ' + m[k] + ' %'; }).join('\n') + '\n\nLo más bajo es **' + c.weak.toLowerCase() + '**' + (c.weakKey === 'words' || c.weakKey === 'mult' ? ', que suele ser cosa de memoria de trabajo más que de mates: leer, retener y calcular a la vez.' : '.'); } },
    next: ['m5', 'k4', 'm9'],
  });
  B('k9', 'child', { child: true,
    q: { en: 'Do teacher, parent and {child} agree?', es: '¿Coinciden docente, familia y {child}?' },
    w: 100, m: { en: ['@child + agree|disagree|perspective*|viewpoint*|views|see it differently|parent view'], es: ['@child + coincid*|miradas|perspectiva*|opinion*|lo ven distinto'] },
    th: { en: ['Comparing your score, the parent survey and {child}’s own tasks for each skill'], es: ['Comparando tu puntuación, la encuesta de la familia y las tareas de {child} en cada habilidad'] },
    a: { en: function (h) { var c = h.ci, p = c.persp; if (!p || p.gap < 12) return 'Mostly, yes: for ' + c.n + ', your view, the parent’s and ' + c.n + '’s own are within a few points on every skill.'; return 'Mostly, except in **' + p.name + '**: ' + VIEW.en[p.hi].replace('the children', c.n) + ' rate it higher than ' + VIEW.en[p.lo].replace('the children', c.n) + ' (' + p.gap + ' points apart).\n\nThat’s a clue, not a contradiction: ' + p.name.toLowerCase() + ' may show up differently at home and in class. A short chat with the family could tell you where.'; },
      es: function (h) { var c = h.ci, p = c.persp; if (!p || p.gap < 12) return 'En general sí: en ' + c.n + ', tu mirada, la de la familia y la suya están a pocos puntos en todas las habilidades.'; return 'En general sí, salvo en **' + p.name + '**: ' + VIEW.es[p.hi].replace('los alumnos', c.n) + ' la ' + (p.hi === 'teacher' ? 'valoras' : 'valoran') + ' más alto que ' + VIEW.es[p.lo].replace('los alumnos', c.n) + ' (' + p.gap + ' puntos de diferencia).\n\nEs una pista, no una contradicción: ' + p.name.toLowerCase() + ' puede verse distinto en casa y en clase. Una charla breve con la familia te diría dónde.'; } },
    next: ['v5', 'k6', 'k1'],
  });
  B('k10', 'child', { child: true,
    q: { en: 'What do you remember about {child}?', es: '¿Qué recuerdas de {child}?' },
    m: { en: ['remember|memory|notes|noted|wrote + @child', '@child + notes|memory'], es: ['recuerdas|memoria|notas|apuntado + @child', '@child + notas|memoria'] },
    th: { en: ['Opening {child}’s memory layer', 'Reading your private notes, newest first'], es: ['Abriendo la capa de memoria de {child}', 'Leyendo tus notas privadas, de la más reciente a la más antigua'] },
    a: { en: function (h) { var c = h.ci; var ns = c.notes.slice(0, 3); return 'Here’s what I have on **' + c.n + '**:\n' + (ns.length ? ns.map(function (x) { return '• Your note: "' + x.text + '"'; }).join('\n') + '\n' : '') + '• Grade 2 teacher (' + c.prev + '): strongest in ' + c.top.toLowerCase() + '\n• From home: ' + c.home + '\n• Midline: ' + c.band + ', still building ' + c.low.toLowerCase() + (ns.length ? '' : '\n\nNo notes from you yet. Just tell me something, like "' + c.n + ' found it hard to focus after lunch today", and I’ll remember it.'); },
      es: function (h) { var c = h.ci; var ns = c.notes.slice(0, 3); return 'Esto es lo que tengo de **' + c.n + '**:\n' + (ns.length ? ns.map(function (x) { return '• Tu nota: "' + x.text + '"'; }).join('\n') + '\n' : '') + '• Tutor de 2.º (' + c.prev + '): lo más fuerte, ' + c.top.toLowerCase() + '\n• Desde casa: ' + c.home + '\n• Fase intermedia: ' + c.band + ', aún trabajando ' + c.low.toLowerCase() + (ns.length ? '' : '\n\nTodavía no tengo notas tuyas. Cuéntame algo, como "' + c.n + ' se distrajo mucho después del recreo", y lo recordaré.'); } },
    next: ['k1', 'k4', 'k13'],
  });
  B('k11', 'child', { child: true,
    q: { en: 'Write a short report comment for {child}', es: 'Escribe un comentario breve de informe para {child}' },
    m: { en: ['report|comment|remark|write up + @child', 'write + @child'], es: ['informe|comentario|boletin + @child', 'escribe|redacta + @child'] },
    th: { en: ['Starting with a real strength', 'Naming growth since Baseline', 'Ending with one clear next step'], es: ['Empezando por una fortaleza real', 'Nombrando el crecimiento desde la fase inicial', 'Terminando con un siguiente paso claro'] },
    a: { en: function (h) { var c = h.ci; return '"' + c.n + ' has had a good term. ' + c.n + ' shows real strength in ' + c.top.toLowerCase() + ' and has grown noticeably in ' + c.grew.toLowerCase() + ' since the start of the year. Our next step together is ' + c.focus.toLowerCase() + ': with steady practice in class and at home, I’m confident ' + c.n + ' will keep growing."\n\nEdit freely; it’s written to sound like you, not a report generator.'; },
      es: function (h) { var c = h.ci; return '"' + c.n + ' ha tenido un buen trimestre. Muestra una verdadera fortaleza en ' + c.top.toLowerCase() + ' y ha crecido de forma notable en ' + c.grew.toLowerCase() + ' desde el inicio de curso. Nuestro siguiente paso es ' + c.focus.toLowerCase() + ': con práctica constante en clase y en casa, estoy seguro de que ' + c.n + ' seguirá creciendo."\n\nEdítalo a tu gusto: está pensado para sonar a ti, no a un generador de informes.'; } },
    next: ['k6', 'p2', 'k5'],
  });
  B('k12', 'child', { child: true, w: 200,
    q: { en: 'Should I be worried about {child}?', es: '¿Debería preocuparme por {child}?' },
    m: { en: ['worr*|concern*|at risk|red flag* + @child'], es: ['preocup*|riesgo|alarma + @child'] },
    th: { en: ['Looking at {child}’s levels, growth and attendance together', 'Checking your notes for patterns'], es: ['Mirando juntos los niveles, el crecimiento y la asistencia de {child}', 'Buscando patrones en tus notas'] },
    a: { en: function (h) { var c = h.ci, flags = []; if (c.bandKey === 'Beginner') flags.push('overall level is Beginner'); if (c.growth <= 0) flags.push('scores haven’t grown since Baseline'); if (c.att.pct < 90) flags.push('attendance is ' + c.att.pct + '%'); return (flags.length ? 'Worth keeping a closer eye: ' + flags.join('; ') + '.' : 'From the data, no: ' + c.n + ' is ' + c.band + ' overall, growing, and attending well.') + '\n\nTilli shows skills, not diagnoses. If something feels off (a big change in mood or behaviour, or anything about safety) trust your judgement and talk to your school’s counsellor or safeguarding lead.'; },
      es: function (h) { var c = h.ci, flags = []; if (c.bandKey === 'Beginner') flags.push('su nivel global es Principiante'); if (c.growth <= 0) flags.push('no ha crecido desde la fase inicial'); if (c.att.pct < 90) flags.push('su asistencia es del ' + c.att.pct + ' %'); return (flags.length ? 'Merece una mirada más atenta: ' + flags.join('; ') + '.' : 'Según los datos, no: ' + c.n + ' está en ' + c.band + ' en general, creciendo y con buena asistencia.') + '\n\nTilli muestra habilidades, no diagnósticos. Si algo no te cuadra (un cambio grande de ánimo o de conducta, o cualquier tema de seguridad), confía en tu criterio y habla con orientación o con el responsable de protección del colegio.'; } },
    next: ['k10', 'k3', 'x2'],
  });
  B('k13', 'child', { child: true,
    q: { en: 'What did {child}’s last teacher say?', es: '¿Qué dijo el tutor anterior de {child}?' },
    m: { en: ['@child + last teacher|previous teacher|grade 2|last year|handover'], es: ['@child + tutor anterior|profesor anterior|2 o|segundo|el ano pasado|curso pasado'] },
    th: { en: ['Opening last year’s handover note'], es: ['Abriendo la nota de traspaso del curso pasado'] },
    a: { en: function (h) { var c = h.ci; return c.n + '’s Grade 2 teacher, **' + c.prev + '**, noted that ' + c.n + ' was strongest in ' + c.top.toLowerCase() + ' and still building ' + c.low.toLowerCase() + '.\n\nThat matches this year’s Midline, so it’s a steady pattern, which makes ' + c.low.toLowerCase() + ' a good long-term focus.'; },
      es: function (h) { var c = h.ci; return 'El tutor de 2.º de ' + c.n + ', **' + c.prev + '**, anotó que lo más fuerte era ' + c.top.toLowerCase() + ' y que aún trabajaba ' + c.low.toLowerCase() + '.\n\nCoincide con la fase intermedia de este curso: es un patrón estable, así que ' + c.low.toLowerCase() + ' es una buena prioridad a largo plazo.'; } },
    next: ['k10', 'k4', 'k1'],
  });
  var childSkill = function (key, idx) {
    return {
      en: function (h) { var c = h.ci, x = c.sk(key), t = tip('en', key); return c.n + ' is at **' + h.band(x.band) + '** in ' + h.sk(key) + ' (' + x.pct + '%, ' + (x.pct - x.pre >= 0 ? '+' : '') + (x.pct - x.pre) + ' since Baseline).\n\nIn Grade 3 this looks like ' + t.looks + '.\n' + (x.band === 'Advanced' ? 'It’s a strength: let ' + c.n + ' model it for others.' : 'One thing to try: ' + t.tip); },
      es: function (h) { var c = h.ci, x = c.sk(key), t = tip('es', key); return c.n + ' está en **' + h.band(x.band) + '** en ' + h.lsk(key) + ' (' + x.pct + ' %, ' + (x.pct - x.pre >= 0 ? '+' : '') + (x.pct - x.pre) + ' desde la fase inicial).\n\nEn 3.º se ve en ' + t.looks + '.\n' + (x.band === 'Advanced' ? 'Es una fortaleza: deja que ' + c.n + ' sea modelo para los demás.' : 'Algo que probar: ' + t.tip); },
    };
  };
  B('k14', 'child', { child: true,
    q: { en: 'How does {child} handle big feelings?', es: '¿Cómo gestiona {child} las emociones fuertes?' },
    m: { en: ['@child + feelings|emotion*|calm*|angry|anger|upset|tantrum*|regulat*'], es: ['@child + emociones|calma*|enfad*|rabieta*|regula*|frustra*'] },
    th: { en: ['Reading {child}’s Emotion Regulation score'], es: ['Leyendo la puntuación de {child} en regulación emocional'] },
    a: childSkill('emotion_regulation'), next: ['k4', 's6', 'k10'],
  });
  B('k15', 'child', { child: true,
    q: { en: 'How does {child} get on with friends?', es: '¿Cómo se lleva {child} con sus compañeros?' },
    m: { en: ['@child + friend*|get on|get along|social|play*|relationship*'], es: ['@child + amig*|compañeros|companeros|se lleva|juega|relacion*'] },
    th: { en: ['Reading {child}’s Relationship Skills score'], es: ['Leyendo la puntuación de {child} en habilidades de relación'] },
    a: childSkill('relationship_skills'), next: ['k19', 'r6', 'k1'],
  });
  B('k16', 'child', { child: true,
    q: { en: 'Does {child} find it hard to focus?', es: '¿Le cuesta concentrarse a {child}?' },
    m: { en: ['@child + focus*|concentrat*|attention|distract*|listen*'], es: ['@child + concentra*|atencion|distrae*|escuchar'] },
    th: { en: ['Reading {child}’s Attention score'], es: ['Leyendo la puntuación de {child} en atención'] },
    a: childSkill('attention'), next: ['s15', 'k4', 'k1'],
  });
  B('k17', 'child', { child: true,
    q: { en: 'What’s {child}’s 14-day plan?', es: '¿Cuál es el plan de 14 días de {child}?' },
    m: { en: ['@child + plan|14 day|14-day|two week*|fortnight'], es: ['@child + plan|14 dias|dos semanas|quincena'] },
    th: { en: ['Opening {child}’s 14-day plan'], es: ['Abriendo el plan de 14 días de {child}'] },
    a: { en: function (h) { var c = h.ci, t = tip('en', c.focusKey); return c.n + '’s 14-day plan works on **' + c.focus + '**, and today is day ' + c.day + '.\n• In class: ' + t.tip + '\n• Activity: ' + t.act + '\n• At home: a 5-minute version of the same game\n\nYou’ll see the plan on ' + c.n + '’s Overview tab.'; },
      es: function (h) { var c = h.ci, t = tip('es', c.focusKey); return 'El plan de 14 días de ' + c.n + ' trabaja **' + c.focus + '**, y hoy es el día ' + c.day + '.\n• En clase: ' + t.tip + '\n• Actividad: ' + t.act + '\n• En casa: una versión de 5 minutos del mismo juego\n\nVerás el plan en la pestaña Resumen de ' + c.n + '.'; } },
    next: ['k18', 'k4', 'k6'],
  });
  B('k18', 'child', { child: true,
    q: { en: 'Give {child} a home activity', es: 'Dame una actividad para casa para {child}' },
    w: 100, m: { en: ['@child + home|homework|parents can|at home'], es: ['@child + casa|deberes|familia puede|en casa'] },
    th: { en: ['Choosing a 5-minute game for {child}’s focus skill', 'Keeping it free of materials'], es: ['Eligiendo un juego de 5 minutos para la habilidad prioritaria de {child}', 'Sin necesidad de materiales'] },
    a: { en: function (h) { var c = h.ci; var games = { working_memory: '**Shopping list game**: name 3 things to "buy"; ' + c.n + ' repeats them back, then adds one more.', attention: '**Spot five**: at dinner, find five things of one colour, then five sounds.', emotion_regulation: '**Feelings check at bedtime**: one high, one low, and one breath together.', planning: '**Pack your own bag**: ' + c.n + ' makes the checklist, a parent just checks it.' }; return 'A 5-minute game for home (no materials):\n\n' + (games[c.focusKey] || '**Two-question chat**: "What was tricky today? What helped?"') + '\n\nIt practises ' + c.focus.toLowerCase() + '. Families can do it on the way to school.'; },
      es: function (h) { var c = h.ci; var games = { working_memory: '**La lista de la compra**: di 3 cosas que "comprar"; ' + c.n + ' las repite y añade una más.', attention: '**Encuentra cinco**: en la cena, buscad cinco cosas de un color y luego cinco sonidos.', emotion_regulation: '**Cómo me siento antes de dormir**: un momento bueno, uno malo y una respiración juntos.', planning: '**Prepara tu mochila**: ' + c.n + ' hace la lista y la familia solo la revisa.' }; return 'Un juego de 5 minutos para casa (sin materiales):\n\n' + (games[c.focusKey] || '**Charla de dos preguntas**: "¿Qué te ha costado hoy? ¿Qué te ha ayudado?"') + '\n\nPractica ' + c.focus.toLowerCase() + '. Las familias pueden hacerlo de camino al colegio.'; } },
    next: ['k6', 'p3', 'k17'],
  });
  B('k19', 'child', { child: true,
    q: { en: 'Who could be a good buddy for {child}?', es: '¿Quién podría ser un buen compañero para {child}?' },
    m: { en: ['@child + buddy|partner|pair|sit with|work with|mentor'], es: ['@child + compañero|companero|pareja|sentar|trabajar con|padrino|madrina'] },
    th: { en: ['Finding classmates who are strong where {child} is still building'], es: ['Buscando compañeros fuertes en lo que {child} aún trabaja'] },
    a: { en: function (h) { var c = h.ci, cand = h.highest(c.focusKey, 4).filter(function (s) { return s !== c.s; }).slice(0, 2); return 'For ' + c.focus.toLowerCase() + ', good buddies for **' + c.n + '** would be **' + h.list(cand) + '**: both are strong there and steady in relationship skills.\n\nPair them for a short task with clear roles, and swap roles halfway.'; },
      es: function (h) { var c = h.ci, cand = h.highest(c.focusKey, 4).filter(function (s) { return s !== c.s; }).slice(0, 2); return 'Para ' + c.focus.toLowerCase() + ', buenos compañeros para **' + c.n + '** serían **' + h.list(cand) + '**: los dos son fuertes en eso y estables en habilidades de relación.\n\nEmparéjalos en una tarea corta con roles claros y que cambien de rol a mitad.'; } },
    next: ['c15', 'k4', 'r6'],
  });
  B('k20', 'child', { child: true,
    q: { en: 'What has changed for {child} recently?', es: '¿Qué ha cambiado para {child} últimamente?' },
    m: { en: ['@child + changed|recent*|lately|whats new'], es: ['@child + cambiado|ultimamente|reciente*|novedad*'] },
    th: { en: ['Checking new scores, notes and attendance since last week'], es: ['Revisando nuevas puntuaciones, notas y asistencia desde la semana pasada'] },
    a: { en: function (h) { var c = h.ci; return 'Recently for **' + c.n + '**:\n• Midline: ' + c.band + ', biggest jump in ' + c.grew.toLowerCase() + ' (+' + c.g + ')\n• Attendance: ' + c.att.pct + '%' + (c.att.absent.length ? ' (last absence ' + c.att.absent[c.att.absent.length - 1] + ')' : '') + '\n' + (c.notes.length ? '• Your newest note: "' + c.notes[0].text + '"' : '• No new notes from you this week'); },
      es: function (h) { var c = h.ci; return 'Últimamente, en **' + c.n + '**:\n• Fase intermedia: ' + c.band + ', el mayor salto en ' + c.grew.toLowerCase() + ' (+' + c.g + ')\n• Asistencia: ' + c.att.pct + ' %' + (c.att.absent.length ? ' (última falta: ' + c.att.absent[c.att.absent.length - 1] + ')' : '') + '\n' + (c.notes.length ? '• Tu nota más reciente: "' + c.notes[0].text + '"' : '• Sin notas nuevas tuyas esta semana'); } },
    next: ['k10', 'k1', 'k4'],
  });

  // ================= Building a skill ({skill} = named in the question, else the class's biggest gap) =================
  var K = function (h) { return h.skill || h.gap.key; };
  B('s1', 'skill', {
    q: { en: 'How do I build {skill} across the class?', es: '¿Cómo trabajo {skill} con toda la clase?' },
    m: { en: ['build|develop|improve|teach|work on|grow|strengthen|boost + @skill + class|across|everyone|whole'], es: ['trabaj*|desarroll*|mejor*|ensen*|potenci*|reforz* + @skill + clase|toda|todos'] },
    th: { en: ['Checking how the class scores in this skill', 'Picking 2–3 low-prep ways to practise it'], es: ['Viendo cómo puntúa la clase en esta habilidad', 'Eligiendo 2 o 3 formas sin preparación de practicarla'] },
    a: { en: function (h) { var k = K(h), s = h.stat(k), t = tip('en', k); return '**' + h.sk(k) + '** in ' + h.cls + ': ' + s.beg + ' Beginner · ' + s.lea + ' Learner · ' + s.adv + ' Advanced.\n\nThree low-prep ways to build it over the next few weeks:\n1. ' + t.act + '\n2. Every day: ' + t.tip + '\n3. Name it when you see it: "That was great ' + h.sk(k).toLowerCase() + '!"\n\nWhy it matters: ' + t.why; },
      es: function (h) { var k = K(h), s = h.stat(k), t = tip('es', k); return '**' + h.sk(k) + '** en ' + h.cls + ': ' + s.beg + ' Principiante · ' + s.lea + ' Aprendiz · ' + s.adv + ' Avanzado.\n\nTres formas sin preparación de trabajarla en las próximas semanas:\n1. ' + t.act + '\n2. Cada día: ' + t.tip + '\n3. Nómbrala cuando la veas: "¡Eso ha sido ' + h.lsk(k) + '!"\n\nPor qué importa: ' + t.why; } },
    next: ['s2', 's3', 's4'],
  });
  B('s2', 'skill', {
    q: { en: 'Who is at Beginner in {skill}?', es: '¿Quién está en Principiante en {skill}?' },
    m: { en: ['who|which + beginner|struggl*|need* + @skill', '@skill + beginner*'], es: ['quien*|que alumnos + principiante|cuesta|necesit* + @skill', '@skill + principiante*'] },
    th: { en: ['Listing every child’s level in this skill'], es: ['Listando el nivel de cada alumno en esta habilidad'] },
    a: { en: function (h) { var k = K(h), b = h.beg(k); return b.length ? '**' + b.length + '** children are at Beginner in **' + h.sk(k) + '**:\n' + b.slice(0, 8).map(function (s) { return '• ' + h.n(s) + ' (' + s.skills.find(function (x) { return x.key === k; }).pct + '%)'; }).join('\n') + '\n\nA small group of ' + Math.min(4, b.length) + ' for 10 minutes, three times a week, is usually enough to see a change.' : 'Nobody is at Beginner in **' + h.sk(k) + '**. Lowest right now: ' + h.list(h.lowest(k, 3)) + '.'; },
      es: function (h) { var k = K(h), b = h.beg(k); return b.length ? '**' + b.length + '** alumnos están en Principiante en **' + h.lsk(k) + '**:\n' + b.slice(0, 8).map(function (s) { return '• ' + h.n(s) + ' (' + s.skills.find(function (x) { return x.key === k; }).pct + ' %)'; }).join('\n') + '\n\nUn grupo pequeño de ' + Math.min(4, b.length) + ' durante 10 minutos, tres veces por semana, suele bastar para notar el cambio.' : 'Nadie está en Principiante en **' + h.lsk(k) + '**. Ahora mismo los más bajos son ' + h.list(h.lowest(k, 3)) + '.'; } },
    next: ['s3', 'c15', 's1'],
  });
  B('s3', 'skill', {
    q: { en: 'Give me a 10-minute activity for {skill}', es: 'Dame una actividad de 10 minutos para {skill}' },
    m: { en: ['activity|game|exercise|idea* + @skill', '10 minute|ten minute|quick + activity|game|idea* + @skill'], es: ['actividad|juego|ejercicio|idea* + @skill', '10 minutos|diez minutos|rapid* + actividad|juego|idea* + @skill'] },
    th: { en: ['Picking an activity that needs no materials', 'Checking it fits a Grade 3 class'], es: ['Eligiendo una actividad sin materiales', 'Comprobando que encaja en 3.º'] },
    a: { en: function (h) { var k = K(h), t = tip('en', k); return t.act + '\n\nWhat to watch for: children ' + t.looks + '. Write down one name you noticed and tell me, and I’ll keep track.'; },
      es: function (h) { var k = K(h), t = tip('es', k); return t.act + '\n\nEn qué fijarte: en ' + t.looks + '. Apunta un nombre que te haya llamado la atención y cuéntamelo: yo llevo la cuenta.'; } },
    next: ['s2', 'r7', 's4'],
  });
  B('s4', 'skill', {
    q: { en: 'What does {skill} look like in Grade 3?', es: '¿Cómo se ve {skill} en 3.º?' },
    m: { en: ['look like|looks like|mean|means|what is|definition + @skill'], es: ['como se ve|significa|que es|definicion + @skill'] },
    th: { en: ['Describing the skill at a Grade 3 level'], es: ['Describiendo la habilidad en el nivel de 3.º'] },
    a: { en: function (h) { var k = K(h), t = tip('en', k); return 'In Grade 3, **' + h.sk(k) + '** looks like ' + t.looks + '.\n\n• **Beginner**: needs an adult to prompt it most of the time\n• **Learner**: does it with reminders or in familiar situations\n• **Advanced**: does it on their own, and helps others'; },
      es: function (h) { var k = K(h), t = tip('es', k); return 'En 3.º, **' + h.lsk(k) + '** se ve en ' + t.looks + '.\n\n• **Principiante**: necesita que un adulto se lo recuerde casi siempre\n• **Aprendiz**: lo hace con recordatorios o en situaciones conocidas\n• **Avanzado**: lo hace solo y ayuda a otros'; } },
    next: ['s5', 's1', 't3'],
  });
  B('s5', 'skill', {
    q: { en: 'Why does {skill} matter for learning?', es: '¿Por qué importa {skill} para aprender?' },
    m: { en: ['why + matter*|important|bother|learning + @skill', 'why + @skill'], es: ['por que + importa|importante|aprender + @skill', 'por que + @skill'] },
    th: { en: ['Linking the skill to classroom learning'], es: ['Relacionando la habilidad con el aprendizaje en clase'] },
    a: { en: function (h) { var k = K(h); return tip('en', k).why + '\n\nIn ' + h.cls + ', children who are Advanced in ' + h.sk(k).toLowerCase() + ' also tend to have higher maths marks. The skills and the marks move together.'; },
      es: function (h) { var k = K(h); return tip('es', k).why + '\n\nEn ' + h.cls + ', los alumnos en Avanzado en ' + h.lsk(k) + ' suelen tener también mejores notas de mates: habilidades y notas van de la mano.'; } },
    next: ['s1', 'm8', 's3'],
  });
  var fixedSkill = function (k) {
    return {
      en: function (h) { var s = h.stat(k), t = tip('en', k), b = h.beg(k); return t.act + '\n\nThen, every day: ' + t.tip + '\n\nIn ' + h.cls + ', ' + s.beg + ' children are at Beginner in ' + h.sk(k).toLowerCase() + (b.length ? ' (' + h.list(b, 4) + ')' : '') + ', so start with them in a small group.'; },
      es: function (h) { var s = h.stat(k), t = tip('es', k), b = h.beg(k); return t.act + '\n\nDespués, cada día: ' + t.tip + '\n\nEn ' + h.cls + ', ' + s.beg + ' alumnos están en Principiante en ' + h.lsk(k) + (b.length ? ' (' + h.list(b, 4) + ')' : '') + ', así que empieza con ellos en un grupo pequeño.'; },
    };
  };
  var fsk = function (id, k, qen, qes, men, mes, next) { B(id, 'skill', { w: 1100, q: { en: qen, es: qes }, m: { en: men, es: mes }, th: { en: ['Finding a strategy that works for a whole class', 'Checking who needs it most'], es: ['Buscando una estrategia para toda la clase', 'Viendo quién la necesita más'] }, a: fixedSkill(k), next: next }); };
  fsk('s6', 'emotion_regulation', 'Calm-down strategies for my class', 'Estrategias de calma para mi clase', ['calm*|calming|settle|settling + strateg*|ideas|class|down', 'calm down'], ['calma|calmar*|tranquiliz* + estrategia*|ideas|clase'], ['s7', 'r5', 's13']);
  fsk('s7', 'emotion_regulation', 'How do I help a child who gets angry quickly?', '¿Cómo ayudo a un alumno que se enfada enseguida?', ['angry|anger|temper|tantrum*|meltdown*|explod*|lash* out'], ['enfad*|ira|rabieta*|estall*|explota'], ['s6', 'k14', 'x2']);
  fsk('s8', 'empathy', 'How can I build empathy during group work?', '¿Cómo trabajo la empatía en el trabajo en grupo?', ['empathy|empath*|kindness + group work|group*|during'], ['empatia|amabilidad + trabajo en grupo|grupo*|durante'], ['r6', 's1', 'c15']);
  fsk('s9', 'inhibition_response', 'Ideas for children who interrupt a lot', 'Ideas para alumnos que interrumpen mucho', ['interrupt*|blurt*|call* out|shout* out', 'wait* + turn'], ['interrump*|hablan sin permiso|esperar su turno|respetar el turno'], ['s15', 'r2', 's1']);
  fsk('s10', 'working_memory', 'How do I help children who forget instructions?', '¿Cómo ayudo a los alumnos que olvidan las instrucciones?', ['forget*|forgot|remember + instruction*|steps|directions', 'working memory + help|support'], ['olvid* + instruccion*|consignas|pasos', 'memoria de trabajo + ayud*|apoy*'], ['m5', 's3', 'm4']);
  fsk('s11', 'planning', 'How do I teach children to plan their work?', '¿Cómo enseño a los alumnos a planificar su trabajo?', ['plan|planning|organis*|organiz* + their work|tasks|ahead', 'teach + plan*'], ['planific*|organiz* + su trabajo|tareas', 'ensen* + planific*'], ['s14', 'r3', 's1']);
  fsk('s12', 'cognitive_flexibility', 'How do I help children who get stuck when plans change?', '¿Cómo ayudo a quien se bloquea cuando cambia el plan?', ['plans change|change of plan|transition*|rigid|stuck when|switch*'], ['cambia el plan|cambios de plan|transicion*|rigid*|se bloquea'], ['r5', 's1', 's11']);
  fsk('s13', 'emotion_awareness', 'How do I help children notice their own feelings?', '¿Cómo ayudo a los alumnos a reconocer lo que sienten?', ['notice|name|recognis*|recogniz*|talk about + feeling*|emotion*'], ['reconocer|nombrar|hablar de + emociones|sentimientos|lo que sienten'], ['r2', 's6', 's1']);
  fsk('s14', 'metacognition', 'How do I get children to check their own work?', '¿Cómo consigo que revisen su propio trabajo?', ['check* + own work|their work|mistakes', 'self check*|reflect* on'], ['revis* + su trabajo|propio trabajo|errores', 'autoevalua*|autocorrec*'], ['s11', 'm8', 's1']);
  fsk('s15', 'attention', 'How do I help children who are easily distracted?', '¿Cómo ayudo a los alumnos que se distraen con facilidad?', ['distract*|concentrat* + easily|help|keep', 'easily distracted'], ['distra* + facilidad|ayud*', 'se distraen'], ['k16', 'r3', 's9']);

  // ================= Attendance =================
  B('a1', 'att', {
    q: { en: 'Who is absent today?', es: '¿Quién falta hoy?' },
    m: { en: ['who + absent|away|missing|off|not here + today', 'absent today|absences today|attendance today|today s attendance'], es: ['quien + falta|faltan|no ha venido|ausente* + hoy', 'faltas de hoy|asistencia de hoy'] },
    th: { en: ['Opening today’s register'], es: ['Abriendo el registro de hoy'] },
    a: { en: function (h) { var a = h.att; if (!a.taken) return 'You haven’t taken today’s register yet. Open **Take attendance** on My Garden: tap each child, or upload the register as a CSV and I’ll fill it in.'; return a.present + ' of ' + a.n + ' children are in today.' + (a.absent.length ? '\n• Absent: **' + h.list(a.absent) + '**' : '\n• Nobody is absent 🎉') + (a.late.length ? '\n• Late: ' + h.list(a.late) : ''); },
      es: function (h) { var a = h.att; if (!a.taken) return 'Aún no has pasado lista hoy. Abre **Pasar lista** en Mi jardín: toca a cada alumno o sube el registro en CSV y yo lo relleno.'; return 'Hoy han venido ' + a.present + ' de ' + a.n + ' alumnos.' + (a.absent.length ? '\n• Faltan: **' + h.list(a.absent) + '**' : '\n• No falta nadie 🎉') + (a.late.length ? '\n• Con retraso: ' + h.list(a.late) : ''); } },
    next: ['a2', 'a3', 'a6'],
  });
  B('a2', 'att', {
    q: { en: 'How was attendance this term?', es: '¿Cómo ha ido la asistencia este trimestre?' },
    m: { en: ['attendance + term|month|overall|class|average|so far', 'how + attendance'], es: ['asistencia + trimestre|mes|general|clase|media', 'como + asistencia'] },
    th: { en: ['Adding up 50 school days for every child'], es: ['Sumando 50 días lectivos de cada alumno'] },
    a: { en: function (h) { var a = h.att; return 'Term attendance in ' + h.cls + ' averages **' + a.avg + '%**.\nLowest: ' + a.low.map(function (r) { return h.n(r.s) + ' (' + r.a.pct + '%)'; }).join(', ') + '.\n\nAnything under 90% is worth a friendly word with the family; it usually helps more than a letter.'; },
      es: function (h) { var a = h.att; return 'La asistencia media de ' + h.cls + ' este trimestre es del **' + a.avg + ' %**.\nLos más bajos: ' + a.low.map(function (r) { return h.n(r.s) + ' (' + r.a.pct + ' %)'; }).join(', ') + '.\n\nPor debajo del 90 % merece una charla amable con la familia: suele ayudar más que una carta.'; } },
    next: ['a3', 'a5', 'a8'],
  });
  B('a3', 'att', {
    q: { en: 'Which children miss school most often?', es: '¿Qué alumnos faltan más a menudo?' },
    m: { en: ['miss* + school|most|often|lot', 'most absent|most absences|lowest attendance|poor attendance'], es: ['faltan|falta + mas|mucho|a menudo', 'mas faltas|menor asistencia|peor asistencia'] },
    th: { en: ['Ranking children by days absent this term'], es: ['Ordenando a los alumnos por días de falta este trimestre'] },
    a: { en: function (h) { return 'Most days missed this term:\n' + h.att.low.map(function (r) { return '• **' + h.n(r.s) + '**: ' + r.a.days + ' days (' + r.a.pct + '%)'; }).join('\n') + '\n\nBefore assuming anything, check whether the absences cluster (same weekday, after holidays). That often points to the reason.'; },
      es: function (h) { return 'Más días de falta este trimestre:\n' + h.att.low.map(function (r) { return '• **' + h.n(r.s) + '**: ' + r.a.days + ' días (' + r.a.pct + ' %)'; }).join('\n') + '\n\nAntes de suponer nada, mira si las faltas se agrupan (mismo día de la semana, tras vacaciones): suele apuntar al motivo.'; } },
    next: ['a8', 'k7', 'a5'],
  });
  B('a4', 'att', {
    q: { en: 'Who has been late a lot?', es: '¿Quién llega tarde a menudo?' },
    m: { en: ['late|lateness|tardy|arrive* late'], es: ['tarde|retraso*|impuntual*'] },
    th: { en: ['Counting late arrivals this term'], es: ['Contando los retrasos de este trimestre'] },
    a: { en: function (h) { var l = h.att.lates; return l.length ? 'Late most often this term:\n' + l.map(function (r) { return '• **' + h.n(r.s) + '**: late ' + r.a.late + ' times'; }).join('\n') + '\n\nA warm "we missed you at circle time" works better than a reminder about rules.' : 'Nobody has been late more than once this term.'; },
      es: function (h) { var l = h.att.lates; return l.length ? 'Los que más llegan tarde este trimestre:\n' + l.map(function (r) { return '• **' + h.n(r.s) + '**: ' + r.a.late + ' retrasos'; }).join('\n') + '\n\nUn cariñoso "te echamos de menos en la asamblea" funciona mejor que recordar las normas.' : 'Nadie ha llegado tarde más de una vez este trimestre.'; } },
    next: ['a3', 'a8', 'a2'],
  });
  B('a5', 'att', {
    q: { en: 'Does attendance affect skills in my class?', es: '¿Afecta la asistencia a las habilidades de mi clase?' },
    m: { en: ['attendance|absence* + affect*|impact*|link*|connect*|skills|scores'], es: ['asistencia|faltas + afecta*|influye*|relacion*|habilidades|puntuacion*'] },
    th: { en: ['Comparing attendance with skill levels for each child'], es: ['Comparando asistencia y niveles de habilidad de cada alumno'] },
    a: { en: function (h) { var lo = h.att.low[0]; return 'A little. Children with lower attendance tend to sit lower in working memory and attention, the skills that rely most on daily practice.' + (lo ? ' For example, ' + h.n(lo.s) + ' (' + lo.a.pct + '% attendance) is ' + h.band(lo.s.band) + ' overall.' : '') + '\n\nOn their first day back, a 2-minute catch-up of "what we did while you were away" helps a lot.'; },
      es: function (h) { var lo = h.att.low[0]; return 'Un poco. Los alumnos con menos asistencia suelen estar más bajos en memoria de trabajo y atención, las habilidades que más dependen de la práctica diaria.' + (lo ? ' Por ejemplo, ' + h.n(lo.s) + ' (' + lo.a.pct + ' % de asistencia) está en ' + h.band(lo.s.band) + ' en general.' : '') + '\n\nEl día que vuelven, ponerles al día en 2 minutos ("esto hicimos mientras no estabas") ayuda mucho.'; } },
    next: ['a3', 's10', 'a8'],
  });
  B('a6', 'att', { w: 200,
    q: { en: 'How do I take attendance?', es: '¿Cómo paso lista?' },
    m: { en: ['how + take|mark|do|upload|record + attendance|register', 'upload + attendance|register|csv'], es: ['como + paso|pasar|marcar|subir|subo|registr* + lista|asistencia', 'subir|subo + asistencia|lista|csv'] },
    th: { en: ['Explaining the two ways to take the register'], es: ['Explicando las dos formas de pasar lista'] },
    a: { en: function () { return 'Two ways, both on **My Garden → Attendance**:\n1. **Take attendance**: everyone starts present; tap a child to mark Absent or Late.\n2. **Upload CSV or PDF**: drop in your school’s register export, check what I read, and save.\n\nEither way, each child’s attendance card and the term heatmap update at once.'; },
      es: function () { return 'Dos formas, las dos en **Mi jardín → Asistencia**:\n1. **Pasar lista**: todos empiezan presentes; toca a un alumno para marcar falta o retraso.\n2. **Subir CSV o PDF**: sube la exportación del registro del colegio, revisa lo que he leído y guarda.\n\nEn ambos casos, la tarjeta de asistencia de cada alumno y el mapa del trimestre se actualizan al momento.'; } },
    next: ['a1', 'm6', 't8'],
  });
  B('a7', 'att', {
    q: { en: 'Who was absent last week?', es: '¿Quién faltó la semana pasada?' },
    m: { en: ['absent|away|missed|off + last week|yesterday|recently'], es: ['falto|faltaron|ausente* + semana pasada|ayer|ultimamente'] },
    th: { en: ['Checking last week’s registers'], es: ['Revisando los registros de la semana pasada'] },
    a: { en: function (h) { var c = h.cast.home; return c ? '**' + h.n(c) + '** was off on Wednesday and Thursday last week, two days in a row.\n\nWorth a quick "we missed you" and a 2-minute catch-up on what the class did.' : 'Nobody missed more than a day last week.'; },
      es: function (h) { var c = h.cast.home; return c ? '**' + h.n(c) + '** faltó el miércoles y el jueves de la semana pasada, dos días seguidos.\n\nMerece un "te echamos de menos" y ponerle al día en 2 minutos.' : 'Nadie faltó más de un día la semana pasada.'; } },
    next: ['k7', 'a8', 'a3'],
  });
  B('a8', 'att', {
    q: { en: 'How do I talk to a family about absences?', es: '¿Cómo hablo con una familia sobre las faltas?' },
    m: { en: ['talk|speak|message|write|approach + family|families|parent* + absen*|attendance'], es: ['hablo|hablar|escribir|mensaje + familia*|padre* + falta*|asistencia'] },
    th: { en: ['Writing it warm, specific and without blame'], es: ['Redactándolo cercano, concreto y sin culpas'] },
    a: { en: function () { return 'Keep it warm and specific:\n\n"Hi! We’ve really missed [name] on a few days lately; the class isn’t the same without them. Is everything okay at home? If there’s anything that would make mornings easier, I’d love to help."\n\nThen listen. Most attendance problems have a practical cause: transport, a sibling, worries about school.'; },
      es: function () { return 'Que sea cercano y concreto:\n\n"¡Hola! Estos días hemos echado mucho de menos a [nombre]; la clase no es lo mismo sin él/ella. ¿Va todo bien en casa? Si hay algo que facilite las mañanas, me encantaría ayudar."\n\nY escucha. Casi siempre hay un motivo práctico: transporte, un hermano, preocupaciones con el colegio.'; } },
    next: ['p8', 'a3', 'p1'],
  });

  // ================= Academics / marks =================
  B('m1', 'acad', {
    q: { en: 'How did the class do in the latest assessment?', es: '¿Qué tal le fue a la clase en la última evaluación?' },
    m: { en: ['latest|last|recent|newest + assessment|test|quiz|check|marks', 'how + class + test|quiz|assessment'], es: ['ultima|ultimo|reciente + evaluacion|examen|control|prueba|notas', 'como + clase + examen|control|evaluacion'] },
    th: { en: ['Opening the newest assessment', 'Averaging the marked scripts'], es: ['Abriendo la evaluación más reciente', 'Haciendo la media de lo corregido'] },
    a: { en: function (h) { var a = h.acad; if (!a) return 'No assessments yet. Add one in **Assess → Academics**.'; return '**' + a.name + '**: class average **' + a.avg + '%**, ' + a.marked + ' of ' + a.total + ' marked.\n• Highest: ' + h.list(a.high) + '\n• Lowest: ' + h.list(a.low) + (a.missing.length ? '\n• Still to mark: ' + a.missing.length : ''); },
      es: function (h) { var a = h.acad; if (!a) return 'Aún no hay evaluaciones. Añade una en **Evaluar → Académico**.'; return '**' + a.name + '**: media de la clase **' + a.avg + ' %**, ' + a.marked + ' de ' + a.total + ' corregidos.\n• Más altos: ' + h.list(a.high) + '\n• Más bajos: ' + h.list(a.low) + (a.missing.length ? '\n• Por corregir: ' + a.missing.length : ''); } },
    next: ['m2', 'm3', 'm6'],
  });
  B('m2', 'acad', {
    q: { en: 'Who hasn’t been marked yet?', es: '¿A quién me falta corregir?' },
    m: { en: ['marked|mark|marking|graded|scored + yet|not|still|left|missing|needs', 'unmarked|still to mark'], es: ['corregir|corregido*|nota + falta|faltan|pendiente*|todavia', 'sin corregir|por corregir'] },
    th: { en: ['Checking the newest assessment for missing scores'], es: ['Buscando notas que faltan en la última evaluación'] },
    a: { en: function (h) { var a = h.acad; if (!a) return 'No assessments yet.'; return a.missing.length ? '**' + a.missing.length + '** still to mark in ' + a.name + ': ' + h.list(a.missing, 6) + '.\n\nFastest way: open the assessment and use **Upload class PDF**. I’ll split the pages and read each child’s score.' : 'Everyone is marked in ' + a.name + ' ✓'; },
      es: function (h) { var a = h.acad; if (!a) return 'Aún no hay evaluaciones.'; return a.missing.length ? 'Faltan **' + a.missing.length + '** por corregir en ' + a.name + ': ' + h.list(a.missing, 6) + '.\n\nLo más rápido: abre la evaluación y usa **Subir PDF de la clase**. Separo las páginas y leo la nota de cada alumno.' : 'Todo corregido en ' + a.name + ' ✓'; } },
    next: ['m6', 'm1', 'm10'],
  });
  B('m3', 'acad', {
    q: { en: 'Which maths topic is hardest for my class?', es: '¿Qué tema de mates le cuesta más a mi clase?' },
    m: { en: ['math*|maths + topic|hardest|weakest|lowest|struggl*|difficult'], es: ['mates|matematicas + tema|cuesta|mas bajo|dificil|flojo'] },
    th: { en: ['Averaging every child’s marks by maths topic'], es: ['Haciendo la media de las notas por tema de mates'] },
    a: { en: function (h) { var m = h.mathClass, ks = Object.keys(m).sort(function (a, b) { return m[a] - m[b]; }); return 'Class averages by topic:\n' + ks.map(function (k) { return '• ' + h.MATH[k] + ': ' + m[k] + '%'; }).join('\n') + '\n\nHardest is **' + h.MATH[ks[0]].toLowerCase() + '**' + (ks[0] === 'words' ? ', which leans heavily on working memory: reading, holding the numbers, then calculating.' : '.'); },
      es: function (h) { var m = h.mathClass, ks = Object.keys(m).sort(function (a, b) { return m[a] - m[b]; }); return 'Medias de la clase por tema:\n' + ks.map(function (k) { return '• ' + h.MATH[k] + ': ' + m[k] + ' %'; }).join('\n') + '\n\nLo que más cuesta es **' + h.MATH[ks[0]].toLowerCase() + '**' + (ks[0] === 'words' ? ', que depende mucho de la memoria de trabajo: leer, retener los números y calcular.' : '.'); } },
    next: ['m4', 'm5', 'm9'],
  });
  B('m4', 'acad', {
    q: { en: 'Who is struggling with word problems?', es: '¿A quién le cuestan los problemas?' },
    m: { en: ['word problem*|problem solving + who|struggl*|which|children'], es: ['problemas + quien|cuesta|cuestan|alumnos'] },
    th: { en: ['Sorting children by their word-problem marks', 'Checking their working-memory levels'], es: ['Ordenando a los alumnos por su nota en problemas', 'Mirando su nivel de memoria de trabajo'] },
    a: { en: function (h) { var ks = h.kids.slice().sort(function (a, b) { return h.math(a).words - h.math(b).words; }).slice(0, 4); return 'Lowest in word problems:\n' + ks.map(function (s) { return '• **' + h.n(s) + '**: ' + h.math(s).words + '% (working memory: ' + h.band(s.skills.find(function (x) { return x.key === 'working_memory'; }).band) + ')'; }).join('\n') + '\n\nNotice the pattern: most are also lower in working memory. Try reading problems aloud and underlining the numbers first.'; },
      es: function (h) { var ks = h.kids.slice().sort(function (a, b) { return h.math(a).words - h.math(b).words; }).slice(0, 4); return 'Los más bajos en problemas:\n' + ks.map(function (s) { return '• **' + h.n(s) + '**: ' + h.math(s).words + ' % (memoria de trabajo: ' + h.band(s.skills.find(function (x) { return x.key === 'working_memory'; }).band) + ')'; }).join('\n') + '\n\nFíjate en el patrón: casi todos están también más bajos en memoria de trabajo. Prueba a leer los problemas en voz alta y subrayar primero los números.'; } },
    next: ['m5', 's10', 'm9'],
  });
  B('m5', 'acad', {
    q: { en: 'Why are word problems hard for some children?', es: '¿Por qué los problemas les cuestan a algunos alumnos?' },
    w: 100, m: { en: ['why + word problem*|problems|maths|math|low score*|marks'], es: ['por que + problemas|mates|matematicas|nota* baja*'] },
    th: { en: ['Looking at the skills behind word problems', 'Comparing word-problem marks with working memory'], es: ['Mirando las habilidades detrás de los problemas', 'Comparando las notas de problemas con la memoria de trabajo'] },
    a: { en: function (h) { var c = h.cast.math; return 'Word problems ask a child to read, hold the numbers in mind, choose an operation and calculate, all at once. That’s a **working memory** load more than a maths one.' + (c ? '\n\n' + h.n(c) + ' is a good example: strong in number sense, but ' + h.math(c).words + '% in word problems and Beginner in working memory.' : '') + '\n\nThree fixes: read it aloud, underline the numbers, draw it before calculating.'; },
      es: function (h) { var c = h.cast.math; return 'Un problema pide leer, retener los números, elegir la operación y calcular, todo a la vez. Es una carga de **memoria de trabajo** más que de mates.' + (c ? '\n\n' + h.n(c) + ' es un buen ejemplo: fuerte en sentido numérico, pero ' + h.math(c).words + ' % en problemas y Principiante en memoria de trabajo.' : '') + '\n\nTres claves: leerlo en voz alta, subrayar los números y dibujarlo antes de calcular.'; } },
    next: ['s10', 'm4', 'm9'],
  });
  B('m6', 'acad', { w: 200,
    q: { en: 'How do I upload a worksheet?', es: '¿Cómo subo una ficha?' },
    m: { en: ['how + upload|scan|photo*|picture|add + worksheet|test|sheet|paper|assessment', 'upload + worksheet|photo|picture|pdf'], es: ['como + subo|subir|escane*|foto*|anadir + ficha|examen|hoja|evaluacion', 'subir + ficha|foto|pdf'] },
    th: { en: ['Explaining the upload steps'], es: ['Explicando los pasos para subir'] },
    a: { en: function () { return 'Take a photo or scan, then:\n1. **Files & records → Add a file** for one child (pick the child and "Maths"), or\n2. Open an assessment in **Assess → Academics → Upload class PDF** for the whole class.\n\nI read the sheet, mark each answer, and tell you what the child is missing, which skill is behind it, and one next step. It all lands on the child’s page.'; },
      es: function () { return 'Haz una foto o escanéala y luego:\n1. **Archivos y registros → Añadir archivo** para un alumno (elige al alumno y "Mates"), o\n2. Abre una evaluación en **Evaluar → Académico → Subir PDF de la clase** para toda la clase.\n\nLeo la ficha, corrijo cada respuesta y te digo qué le falta al alumno, qué habilidad hay detrás y un siguiente paso. Todo queda en la página del alumno.'; } },
    next: ['m10', 'm2', 'a6'],
  });
  B('m7', 'acad', {
    q: { en: 'Who scored highest in the last assessment?', es: '¿Quién sacó la mejor nota en la última evaluación?' },
    m: { en: ['highest|best|top + score*|mark*|assessment|test|quiz'], es: ['mejor nota|mas alta|mejores notas|nota mas alta', 'mejor nota|mejores notas + evaluacion|examen|control|ultima'] },
    th: { en: ['Sorting the newest assessment by score'], es: ['Ordenando la última evaluación por nota'] },
    a: { en: function (h) { var a = h.acad; if (!a) return 'No assessments yet.'; return 'Top scores in **' + a.name + '**:\n' + a.high.map(function (s) { return '• ' + h.n(s) + ': ' + a.pct(s) + '%'; }).join('\n') + '\n\nConsider giving them a stretch task, or making them helpers for the next one.'; },
      es: function (h) { var a = h.acad; if (!a) return 'Aún no hay evaluaciones.'; return 'Mejores notas en **' + a.name + '**:\n' + a.high.map(function (s) { return '• ' + h.n(s) + ': ' + a.pct(s) + ' %'; }).join('\n') + '\n\nPuedes darles un reto extra o hacerles ayudantes en la próxima.'; } },
    next: ['m1', 'c15', 'm3'],
  });
  B('m8', 'acad', {
    q: { en: 'How do skills connect to marks?', es: '¿Qué relación hay entre habilidades y notas?' },
    m: { en: ['skills + marks|grades|scores|academic*|maths'], es: ['habilidades + notas|academic*|mates'] },
    th: { en: ['Comparing skill levels with maths marks across the class'], es: ['Comparando niveles de habilidad y notas de mates en la clase'] },
    a: { en: function () { return 'Closely. In this class:\n• **Working memory** tracks word problems and multiplication\n• **Attention** tracks addition and subtraction accuracy\n• **Planning** tracks measurement and multi-step tasks\n\nThat’s why a skill routine can lift marks without extra maths practice: you’re fixing what sits underneath.'; },
      es: function () { return 'Mucho. En esta clase:\n• La **memoria de trabajo** va de la mano de los problemas y la multiplicación\n• La **atención**, de la precisión en sumas y restas\n• La **planificación**, de la medida y las tareas de varios pasos\n\nPor eso una rutina de habilidades puede subir las notas sin más práctica de mates: arreglas lo que hay debajo.'; } },
    next: ['m5', 's5', 'm3'],
  });
  B('m9', 'acad', {
    q: { en: 'Give me a maths warm-up', es: 'Dame un calentamiento de mates' },
    m: { en: ['math*|maths|number + warm up|warmup|starter|quick|game|activity'], es: ['mates|matematicas|numeros + calentamiento|inicio|rapido|juego|actividad'] },
    th: { en: ['Picking a 5-minute starter that also trains working memory'], es: ['Eligiendo un inicio de 5 minutos que también entrena la memoria de trabajo'] },
    a: { en: function () { return '**Number story in your head** (5 min): say a 2-step story ("6 birds on a tree, 3 fly away, 2 come back"); children hold it in their heads and show the answer on fingers. Add a step each day.\n\nIt warms up maths and working memory at the same time.'; },
      es: function () { return '**Cuento de números de cabeza** (5 min): cuenta una historia de 2 pasos ("6 pájaros en un árbol, se van 3, vuelven 2"); los alumnos la retienen y enseñan la respuesta con los dedos. Añade un paso cada día.\n\nCalienta las mates y la memoria de trabajo a la vez.'; } },
    next: ['m5', 'r3', 's10'],
  });
  B('m10', 'acad', { w: 200,
    q: { en: 'How do I add a new assessment?', es: '¿Cómo añado una evaluación nueva?' },
    m: { en: ['add|create|new|set up + assessment|test|quiz', 'how + add|create|set up + new + assessment|test|quiz'], es: ['anadir|anado|crear|nueva + evaluacion|examen|control|prueba', 'como + anado|anadir|crear|creo + nueva + evaluacion|examen|control|prueba'] },
    th: { en: ['Explaining where new assessments go'], es: ['Explicando dónde se crean las evaluaciones'] },
    a: { en: function () { return 'Go to **Assess → Academics → + New assessment**, give it a name and the maximum score, and save. Then open it and either type scores, or use **Upload class PDF** and I’ll read them for you.'; },
      es: function () { return 'Ve a **Evaluar → Académico → + Nueva evaluación**, ponle nombre y nota máxima y guarda. Después ábrela y escribe las notas o usa **Subir PDF de la clase** y las leo yo.'; } },
    next: ['m6', 'm2', 'm1'],
  });

  // ================= Parents / PTM =================
  B('p1', 'parents', {
    w: 1100, q: { en: 'Help me prepare for parent-teacher meetings', es: 'Ayúdame a preparar las tutorías con las familias' },
    m: { en: ['ptm|parent teacher|parents evening|parent meeting*|conference*', 'prepare + parent*'], es: ['tutoria*|reunion* con las familias|reunion de padres|entrevista* con familias', 'prepar* + familia*'] },
    th: { en: ['Collecting a strength, a focus and a home tip for each child'], es: ['Reuniendo una fortaleza, una prioridad y un consejo para casa de cada alumno'] },
    a: { en: function (h) { return 'A simple 3-part script for every meeting:\n1. **A real strength**: start there, always\n2. **One thing we’re working on**: just one\n3. **One thing to try at home**: 5 minutes, no materials\n\nEach child’s page has all three ready, and **Share report** gives families a one-page summary. Want me to start with ' + (h.tending[0] ? h.n(h.tending[0]) : 'a child') + ', who you might want more time with?'; },
      es: function (h) { return 'Un guion sencillo en 3 partes para cada tutoría:\n1. **Una fortaleza real**: empieza siempre por ahí\n2. **Una cosa que estamos trabajando**: solo una\n3. **Algo que probar en casa**: 5 minutos, sin materiales\n\nLa página de cada alumno tiene las tres listas, y **Compartir informe** da a las familias un resumen de una página. ¿Empiezo con ' + (h.tending[0] ? h.n(h.tending[0]) : 'un alumno') + ', con quien quizá quieras más tiempo?'; } },
    next: ['k6', 'p2', 'p4'],
  });
  B('p2', 'parents', { w: 200,
    q: { en: 'How do I share a parent report?', es: '¿Cómo comparto un informe con la familia?' },
    m: { en: ['share|send|download|print + report|reports', 'parent report*'], es: ['compartir|comparto|enviar|envio|mando|descargar|imprimir + informe*', 'informe para la familia|informe de familia'] },
    th: { en: ['Explaining where the report lives'], es: ['Explicando dónde está el informe'] },
    a: { en: function () { return 'Open the child’s page → **Share report**. You’ll see a one-page report written for families: strengths, what we’re working on, and a home activity. Download it as a PDF or print it.\n\nEach report only shows that child; families never see other children’s data.'; },
      es: function () { return 'Abre la página del alumno → **Compartir informe**. Verás un informe de una página pensado para familias: fortalezas, qué estamos trabajando y una actividad para casa. Descárgalo en PDF o imprímelo.\n\nCada informe solo muestra a ese alumno; las familias nunca ven datos de otros.'; } },
    next: ['k6', 'p1', 't5'],
  });
  B('p3', 'parents', {
    q: { en: 'What should parents do at home this week?', es: '¿Qué pueden hacer las familias en casa esta semana?' },
    m: { en: ['parent*|famil*|home + do|activit*|help|week|support'], es: ['familia*|padres|casa + hacer|actividad*|ayudar|semana|apoyar'] },
    th: { en: ['Using the class focus skill', 'Keeping it to 5 minutes'], es: ['Partiendo de la habilidad prioritaria de la clase', 'Que no pase de 5 minutos'] },
    a: { en: function (h) { return 'This week, ask families to practise **' + h.gap.name.toLowerCase() + '** for 5 minutes a day:\n\n' + tip('en', h.gap.key).act.replace(/\(10 min\)/, '(5 min at home)') + '\n\nA one-line message works best: "This week we’re practising ' + h.gap.name.toLowerCase() + '. Here’s a 5-minute game you can play on the way to school."'; },
      es: function (h) { return 'Esta semana, pide a las familias que practiquen **' + h.gap.lname + '** 5 minutos al día:\n\n' + tip('es', h.gap.key).act.replace(/\(10 min\)/, '(5 min en casa)') + '\n\nFunciona mejor un mensaje de una línea: "Esta semana practicamos ' + h.gap.lname + '. Aquí tenéis un juego de 5 minutos para el camino al colegio."'; } },
    next: ['p7', 'k18', 'p1'],
  });
  B('p4', 'parents', {
    q: { en: 'How do I explain levels to parents?', es: '¿Cómo explico los niveles a las familias?' },
    m: { en: ['explain + level*|beginner|learner|advanced|scores + parent*|famil*', 'parents + understand + level*'], es: ['explic* + nivel*|principiante|aprendiz|avanzado + familia*|padres'] },
    th: { en: ['Putting the levels in family-friendly words'], es: ['Explicando los niveles con palabras para familias'] },
    a: { en: function () { return 'Try: "Each skill has three stages, like learning to ride a bike.\n• **Beginner**: still needs a hand on the seat\n• **Learner**: riding with a few wobbles\n• **Advanced**: off on their own\nEvery child is at different stages in different skills, and that’s completely normal."'; },
      es: function () { return 'Prueba: "Cada habilidad tiene tres etapas, como aprender a montar en bici.\n• **Principiante**: aún necesita que le sujeten\n• **Aprendiz**: ya va solo, con algún tambaleo\n• **Avanzado**: va solo con soltura\nCada niño está en etapas distintas en habilidades distintas, y es completamente normal."'; } },
    next: ['t3', 'p5', 'p2'],
  });
  B('p5', 'parents', {
    q: { en: 'A parent says their child is fine at home. What do I say?', es: 'Una familia dice que en casa su hijo está bien. ¿Qué le digo?' },
    w: 1200, m: { en: ['fine at home|different at home|doesnt agree with me|not like that at home|defensive'], es: ['bien en casa|distinto en casa|no esta de acuerdo|no coincide|en casa no', 'familia|padres|madre|padre + en casa + bien|normal|tranquil*'] },
    th: { en: ['Framing it as two views of one child', 'Finding common ground'], es: ['Planteándolo como dos miradas del mismo niño', 'Buscando un punto en común'] },
    a: { en: function () { return 'Agree first, because they’re probably right! "That’s really helpful to know. It sounds like [name] can do this at home, which tells me the skill is there."\n\nThen get curious: "What helps at home? Maybe we can bring that into class."\n\nDifferent settings make different demands; a gap between home and school is a clue to work on together, not a disagreement to win.'; },
      es: function () { return 'Primero dale la razón: ¡seguramente la tiene! "Es muy útil saberlo. Si en casa lo hace, significa que la habilidad está ahí."\n\nDespués, curiosidad: "¿Qué le ayuda en casa? Quizá podamos traerlo a clase."\n\nCada entorno pide cosas distintas: la diferencia entre casa y colegio es una pista para trabajar juntos, no una discusión que ganar.'; } },
    next: ['v5', 'v2', 'p8'],
  });
  B('p6', 'parents', {
    q: { en: 'Which parents haven’t finished their survey?', es: '¿Qué familias no han terminado la encuesta?' },
    m: { en: ['parent*|famil* + survey*|questionnaire*|finished|completed|pending|haven t', 'survey + pending|left|missing'], es: ['familia*|padres + encuesta*|cuestionario*|terminado|pendiente*'] },
    th: { en: ['Checking the parent surveys for this window'], es: ['Revisando las encuestas de familias de esta fase'] },
    a: { en: function () { return 'You’ll find it in **Assess → Files & records → Who’s finished**: the Parent column shows who is still to finish, and the **Remind** button sends a gentle nudge.\n\nA personal word at pick-up usually works better than a third reminder.'; },
      es: function () { return 'Lo tienes en **Evaluar → Archivos y registros → Quién ha terminado**: la columna Familia muestra quién falta, y el botón **Recordar** envía un aviso amable.\n\nUna palabra en persona a la salida suele funcionar mejor que un tercer recordatorio.'; } },
    next: ['p7', 'c12', 'p1'],
  });
  B('p7', 'parents', {
    q: { en: 'Write a message to all parents about this term', es: 'Escribe un mensaje a todas las familias sobre este trimestre' },
    m: { en: ['message|letter|newsletter|note|email + parents|families|all', 'write + parents|families'], es: ['mensaje|carta|circular|correo|nota + familias|padres|todas', 'escribe + familias|padres'] },
    th: { en: ['Picking two class highlights', 'Adding one thing families can do'], es: ['Eligiendo dos logros de la clase', 'Añadiendo algo que las familias puedan hacer'] },
    a: { en: function (h) { return '"Dear families,\n\nWhat a term! ' + h.cls + ' has grown in **' + h.grew.name.toLowerCase() + '**, and many children are now confident in **' + h.strong.name.toLowerCase() + '**. Next, we’re focusing on ' + h.gap.name.toLowerCase() + '.\n\nOne thing that helps at home: ' + tip('en', h.gap.key).tip.charAt(0).toLowerCase() + tip('en', h.gap.key).tip.slice(1) + '\n\nThank you for everything you do. Warmly, ' + (h.teacher || 'your class teacher') + '"'; },
      es: function (h) { return '"Queridas familias:\n\n¡Qué trimestre! ' + h.cls + ' ha crecido en **' + h.grew.lname + '** y muchos alumnos ya se sienten seguros en **' + h.strong.lname + '**. Ahora nos centramos en ' + h.gap.lname + '.\n\nAlgo que ayuda en casa: ' + tip('es', h.gap.key).tip.charAt(0).toLowerCase() + tip('es', h.gap.key).tip.slice(1) + '\n\nGracias por todo. Un abrazo, ' + (h.teacher || 'vuestro tutor') + '"'; } },
    next: ['p3', 'c9', 'p2'],
  });
  B('p8', 'parents', {
    q: { en: 'How do I give difficult news kindly?', es: '¿Cómo doy una noticia difícil con tacto?' },
    m: { en: ['difficult|hard|bad|tough + news|conversation*|talk', 'break + news'], es: ['noticia* dificil*|conversacion* dificil*|mala* noticia*|dar una noticia|noticia dificil'] },
    th: { en: ['Structuring a hard conversation so it stays warm'], es: ['Estructurando una conversación difícil para que siga siendo cercana'] },
    a: { en: function () { return 'A shape that keeps it kind:\n1. **Start with the child**, not the problem: something you genuinely like about them\n2. **Describe, don’t label**: "I’ve noticed it’s hard for her to settle after lunch"\n3. **Ask before advising**: "Do you see this at home?"\n4. **One next step, together**, and a date to check in\n\nAnd leave time for them to react; silence is fine.'; },
      es: function () { return 'Una estructura que mantiene el tacto:\n1. **Empieza por el niño**, no por el problema: algo que de verdad te guste de él\n2. **Describe, no etiquetes**: "He notado que le cuesta calmarse después de comer"\n3. **Pregunta antes de aconsejar**: "¿Lo veis también en casa?"\n4. **Un paso juntos** y una fecha para volver a hablar\n\nY deja tiempo para que reaccionen: el silencio está bien.'; } },
    next: ['p5', 'k12', 'p1'],
  });

  // ================= Activities / planning =================
  B('r1', 'plan', {
    q: { en: 'Give me a 10-minute activity for this week', es: 'Dame una actividad de 10 minutos para esta semana' },
    m: { en: ['activity|game|idea|lesson|routine + week|today|class|10 minute|ten minute|quick'], es: ['actividad|juego|idea|rutina + semana|hoy|clase|10 minutos|diez minutos|rapida'] },
    th: { en: ['Using the class focus skill', 'Choosing something with no materials'], es: ['Partiendo de la habilidad prioritaria de la clase', 'Eligiendo algo sin materiales'] },
    a: { en: function (h) { return 'For ' + h.cls + '’s focus skill, **' + h.gap.name.toLowerCase() + '**:\n\n' + tip('en', h.gap.key).act + '\n\nRun it three times this week; by Friday most children will know it well enough to lead it themselves.'; },
      es: function (h) { return 'Para la habilidad prioritaria de ' + h.cls + ', **' + h.gap.lname + '**:\n\n' + tip('es', h.gap.key).act + '\n\nHazla tres veces esta semana: el viernes la mayoría la conocerá tan bien que podrá dirigirla.'; } },
    next: ['r7', 's2', 'r9'],
  });
  B('r2', 'plan', {
    q: { en: 'Plan a morning circle time', es: 'Planifica una asamblea de la mañana' },
    m: { en: ['circle time|morning meeting|morning circle|check in|check-in'], es: ['asamblea|rutina de la manana|buenos dias|ronda de emociones'] },
    th: { en: ['Building a 10-minute morning routine around feelings'], es: ['Creando una rutina de 10 minutos alrededor de las emociones'] },
    a: { en: function () { return '**10-minute morning circle**\n1. Greeting round (2 min): each child greets the next by name\n2. Feelings weather (3 min): sunny, cloudy or stormy, plus one word\n3. Today’s goal (3 min): one skill we’re all practising today\n4. One breath together (1 min)\n5. Pass the "kind word" (1 min)\n\nThe same structure every day; children love the predictability.'; },
      es: function () { return '**Asamblea de 10 minutos**\n1. Ronda de saludos (2 min): cada uno saluda al siguiente por su nombre\n2. El tiempo de mis emociones (3 min): sol, nubes o tormenta, y una palabra\n3. El reto de hoy (3 min): una habilidad que practicamos todos\n4. Una respiración juntos (1 min)\n5. Pasar la "palabra amable" (1 min)\n\nLa misma estructura cada día: a los niños les encanta lo previsible.'; } },
    next: ['s13', 'r7', 'r5'],
  });
  B('r3', 'plan', {
    q: { en: 'What can I do in the last 5 minutes of class?', es: '¿Qué hago en los últimos 5 minutos de clase?' },
    m: { en: ['last|final|end + minute*', 'spare minutes|5 minutes|five minutes'], es: ['ultimos + minutos', 'cinco minutos|5 minutos'] },
    th: { en: ['Choosing a short reflection routine'], es: ['Eligiendo una rutina corta de reflexión'] },
    a: { en: function () { return '**Glow and grow** (5 min): each child shares one "glow" (something that went well) and, if they want, one "grow" (something to try tomorrow). Model it yourself first.\n\nIt builds metacognition, and sends children home on a good note.'; },
      es: function () { return '**Brillo y crezco** (5 min): cada alumno comparte un "brillo" (algo que salió bien) y, si quiere, un "crezco" (algo que probar mañana). Hazlo tú primero.\n\nTrabaja la metacognición y manda a los niños a casa con buen sabor de boca.'; } },
    next: ['s14', 'r2', 'r9'],
  });
  B('r4', 'plan', {
    q: { en: 'Ideas for a rainy-day break indoors', es: 'Ideas para un recreo dentro por la lluvia' },
    m: { en: ['rain*|wet|indoor* + break|play|recess|lunch|day'], es: ['lluvia|llueve|dentro + recreo|patio|jugar'] },
    th: { en: ['Picking calm indoor games that still build skills'], es: ['Eligiendo juegos tranquilos de interior que también trabajan habilidades'] },
    a: { en: function () { return 'Three calm indoor games:\n• **Silent ball**: pass a soft ball without a sound (inhibition, attention)\n• **Story chain**: each child adds one sentence (relationships, flexibility)\n• **Mirror**: partners copy each other’s slow moves (attention, empathy)\n\nKeep a "rainy day box" with the rules on cards so children can run it themselves.'; },
      es: function () { return 'Tres juegos tranquilos de interior:\n• **Pelota en silencio**: pasar una pelota blanda sin hacer ruido (inhibición, atención)\n• **Cadena de cuentos**: cada uno añade una frase (relación, flexibilidad)\n• **El espejo**: por parejas, imitan movimientos lentos (atención, empatía)\n\nTen una "caja de días de lluvia" con las normas en tarjetas para que lo organicen ellos.'; } },
    next: ['r6', 'r5', 'r9'],
  });
  B('r5', 'plan', {
    q: { en: 'A calm transition after lunch', es: 'Una transición tranquila después de comer' },
    w: 200, m: { en: ['after lunch|after break|after recess|settle|settling', 'calm + transition*'], es: ['despues de comer|despues del recreo|volver a clase', 'tranquila|calma + transicion*'] },
    th: { en: ['Choosing a 3-minute reset'], es: ['Eligiendo un reinicio de 3 minutos'] },
    a: { en: function () { return '**3-minute reset** after lunch:\n1. Lights a little lower, soft music\n2. Three balloon breaths together\n3. "Thumbs check": how ready am I? (up, middle, down)\n4. Start with something easy and familiar\n\nIt helps attention and emotion regulation, the two skills that dip most after break.'; },
      es: function () { return '**Reinicio de 3 minutos** después de comer:\n1. Luz algo más baja y música suave\n2. Tres respiraciones de globo juntos\n3. "Pulgares": ¿cómo de listo estoy? (arriba, medio, abajo)\n4. Empezar con algo fácil y conocido\n\nAyuda a la atención y a la regulación emocional, las dos habilidades que más bajan tras el recreo.'; } },
    next: ['s6', 's15', 'r2'],
  });
  B('r6', 'plan', {
    q: { en: 'A game that builds teamwork', es: 'Un juego que trabaje el trabajo en equipo' },
    m: { en: ['teamwork|team work|cooperat*|collaborat*|together + game|activity|idea'], es: ['trabajo en equipo|cooperat*|colabor* + juego|actividad|idea'] },
    th: { en: ['Picking a game where nobody can win alone'], es: ['Eligiendo un juego en el que nadie gana solo'] },
    a: { en: function () { return '**Build the tower** (10 min): groups of 4 build the tallest tower from 10 sheets of paper. Each child has one job (planner, builder, holder, checker), and only the planner can talk for the first 2 minutes.\n\nAfterwards ask: "What helped your team?"'; },
      es: function () { return '**Construye la torre** (10 min): grupos de 4 hacen la torre más alta con 10 folios. Cada uno tiene un rol (planificador, constructor, sujetador, revisor) y solo el planificador habla los 2 primeros minutos.\n\nDespués pregunta: "¿Qué ayudó a vuestro equipo?"'; } },
    next: ['c15', 's8', 'r4'],
  });
  B('r7', 'plan', {
    q: { en: 'Plan a week of social-emotional learning', es: 'Planifica una semana de aprendizaje socioemocional' },
    m: { en: ['week* + plan|sel|social emotional|routine*', 'weekly plan', 'plan + sel|social emotional'], es: ['semana* + plan|socioemocional|rutina*', 'plan semanal', 'planifica + socioemocional'] },
    th: { en: ['Starting from the class focus skill', 'Spreading 10 minutes a day across the week'], es: ['Partiendo de la habilidad prioritaria', 'Repartiendo 10 minutos al día en la semana'] },
    a: { en: function (h) { var g = tip('en', h.gap.key); return '**One week, 10 minutes a day**, focused on ' + h.gap.name.toLowerCase() + ':\n• Mon: introduce it with a story, ask "what does it look like?"\n• Tue: ' + g.act.replace(/\*\*/g, '') + '\n• Wed: the same activity, children lead\n• Thu: notice it, give specific praise all day\n• Fri: glow and grow, then celebrate one class win\n\nAll week: ' + g.tip; },
      es: function (h) { var g = tip('es', h.gap.key); return '**Una semana, 10 minutos al día**, centrada en ' + h.gap.lname + ':\n• Lun: preséntala con un cuento y pregunta "¿cómo se ve?"\n• Mar: ' + g.act.replace(/\*\*/g, '') + '\n• Mié: la misma actividad, la dirigen ellos\n• Jue: fíjate y elogia de forma concreta todo el día\n• Vie: brillo y crezco, y celebrad un logro de clase\n\nToda la semana: ' + g.tip; } },
    next: ['r1', 'r2', 's2'],
  });
  B('r8', 'plan', {
    q: { en: 'How do I fit SEL into maths lessons?', es: '¿Cómo integro lo socioemocional en mates?' },
    m: { en: ['sel|social emotional|skills + math*|maths|lesson*|subject*', 'fit + sel|skills'], es: ['socioemocional|habilidades + mates|matematicas|clases|asignatura*', 'integr* + habilidades|socioemocional'] },
    th: { en: ['Finding natural moments in a maths lesson'], es: ['Buscando momentos naturales en una clase de mates'] },
    a: { en: function () { return 'No extra time needed:\n• **Start**: "How confident do I feel?" (emotion awareness)\n• **Partner work**: talker and listener roles (relationships)\n• **Stuck moments**: "What else could I try?" (flexibility)\n• **End**: check your own answer two ways (metacognition)\n\nSkills practised inside real lessons transfer best.'; },
      es: function () { return 'Sin tiempo extra:\n• **Al empezar**: "¿Cómo de seguro me siento?" (conciencia emocional)\n• **En parejas**: roles de quien habla y quien escucha (relación)\n• **Cuando se atascan**: "¿Qué más podría probar?" (flexibilidad)\n• **Al terminar**: comprobar la respuesta de dos formas (metacognición)\n\nLo que se practica dentro de clases reales es lo que mejor se transfiere.'; } },
    next: ['m8', 'm9', 'r7'],
  });
  B('r9', 'plan', {
    q: { en: 'Low-prep activities with no materials', es: 'Actividades sin preparación ni materiales' },
    m: { en: ['no materials|low prep|no prep|without materials|nothing to prepare'], es: ['sin materiales|sin preparacion|sin preparar|nada que preparar'] },
    th: { en: ['Listing activities that need only voices and bodies'], es: ['Listando actividades que solo necesitan voz y cuerpo'] },
    a: { en: function () { return 'Five that need nothing at all:\n• **Simon says, plus one** (working memory)\n• **Feelings weather** (emotion awareness)\n• **Red light, green light, talk version** (impulse control)\n• **Which one doesn’t belong?**, said aloud (critical thinking)\n• **Glow and grow** (metacognition)\n\nEach takes 5–10 minutes and works with any class size.'; },
      es: function () { return 'Cinco que no necesitan nada:\n• **Simón dice, uno más** (memoria de trabajo)\n• **El tiempo de mis emociones** (conciencia emocional)\n• **Semáforo de la palabra** (control de impulsos)\n• **¿Cuál sobra?**, en voz alta (pensamiento crítico)\n• **Brillo y crezco** (metacognición)\n\nCada una dura 5–10 minutos y sirve para cualquier tamaño de clase.'; } },
    next: ['r1', 'r3', 'r7'],
  });
  B('r10', 'plan', {
    q: { en: 'What should I do before Endline?', es: '¿Qué hago antes de la fase final?' },
    m: { en: ['before + endline|end of year|final assessment', 'prepare + endline'], es: ['antes de + la fase final|final de curso|evaluacion final', 'prepar* + fase final'] },
    th: { en: ['Looking at what would move the most children before Endline'], es: ['Viendo qué movería a más alumnos antes de la fase final'] },
    a: { en: function (h) { return 'Three things, in order:\n1. **A daily routine for ' + h.gap.name.toLowerCase() + '**: ' + h.gap.beg + ' children still at Beginner\n2. **Small groups** for ' + h.list(h.tending, 3) + '\n3. **Keep noting what you see**: notes make the Endline picture sharper\n\nNo test prep needed; Endline measures the same skills you practise every day.'; },
      es: function (h) { return 'Tres cosas, por orden:\n1. **Una rutina diaria de ' + h.gap.lname + '**: ' + h.gap.beg + ' alumnos aún en Principiante\n2. **Grupos pequeños** para ' + h.list(h.tending, 3) + '\n3. **Sigue apuntando lo que ves**: las notas afinan la imagen de la fase final\n\nNo hace falta preparar examen: la fase final mide las mismas habilidades que practicáis cada día.'; } },
    next: ['c11', 'r7', 'c3'],
  });

  // ================= Viewpoint gaps =================
  B('v1', 'persp', {
    q: { en: 'Where do teachers, parents and children disagree?', es: '¿En qué no coinciden docente, familias y alumnos?' },
    m: { en: ['disagree*|agree|differ*|gap* + parent*|teacher*|children|views|perspective*|viewpoint*', 'three views|three viewpoints|perspectives'], es: ['no coincid*|coincid*|difieren|diferencia* + familia*|docente|alumnos|miradas|perspectiva*', 'tres miradas|perspectivas'] },
    th: { en: ['Comparing your scores, parent surveys and children’s own tasks for each skill', 'Looking for a pattern across the gaps'], es: ['Comparando tus puntuaciones, las encuestas de familias y las tareas de los alumnos en cada habilidad', 'Buscando un patrón en las diferencias'] },
    a: { en: function (h) { var p = h.persp, t = p.top; if (!p.gapN) return 'Teacher, parent and children agree on every skill: all within a few points.'; return 'Views differ on **' + p.gapN + ' of 12** skills. The biggest gap is **' + t.name + '**: ' + VIEW.en[t.hi] + ' ' + (t.hi === 'teacher' ? 'rate' : 'rate') + ' it highest, ' + VIEW.en[t.lo] + ' lowest (' + t.gap + ' points).' + (p.leanLow && p.leanN >= 3 ? '\n\nPattern: ' + VIEW.en[p.leanLow] + ' ' + (p.leanLow === 'teacher' ? 'tend' : 'tend') + ' to rate lowest (' + p.leanN + ' skills). That’s one pattern, not many problems.' : ''); },
      es: function (h) { var p = h.persp, t = p.top; if (!p.gapN) return 'Docente, familias y alumnos coinciden en todas las habilidades: a pocos puntos.'; return 'Las miradas difieren en **' + p.gapN + ' de 12** habilidades. La mayor diferencia está en **' + t.name + '**: ' + VIEW.es[t.hi] + ' la ' + (t.hi === 'teacher' ? 'valoras' : 'valoran') + ' más alto y ' + VIEW.es[t.lo] + ', más bajo (' + t.gap + ' puntos).' + (p.leanLow && p.leanN >= 3 ? '\n\nPatrón: ' + VIEW.es[p.leanLow] + ' ' + (p.leanLow === 'teacher' ? 'sueles' : 'suelen') + ' dar la puntuación más baja (' + p.leanN + ' habilidades). Es un patrón, no muchos problemas.' : ''); } },
    next: ['v2', 'v4', 'v5'],
  });
  B('v2', 'persp', {
    q: { en: 'Why would parents rate higher than me?', es: '¿Por qué las familias puntúan más alto que yo?' },
    m: { en: ['why + parent*|famil* + higher|more|better|rate'], es: ['por que + familia*|padres + mas alto|mas|mejor|puntuan|valoran'] },
    th: { en: ['Thinking about how the skill shows up at home vs in class'], es: ['Pensando en cómo se ve la habilidad en casa y en clase'] },
    a: { en: function () { return 'Usually because home and class ask for different things. At home there are fewer children, more one-to-one attention and familiar routines, so skills like regulation and attention show up more easily.\n\nIt’s good news: the skill is there. The question is what helps at home that you could bring into class. Ask the family!'; },
      es: function () { return 'Normalmente porque casa y clase piden cosas distintas. En casa hay menos niños, más atención individual y rutinas conocidas, así que habilidades como la regulación o la atención aparecen con más facilidad.\n\nEs una buena noticia: la habilidad está ahí. La pregunta es qué ayuda en casa que puedas traer a clase. ¡Pregúntaselo a la familia!'; } },
    next: ['v5', 'p5', 'v6'],
  });
  B('v3', 'persp', {
    q: { en: 'Why do children rate themselves higher?', es: '¿Por qué los alumnos se puntúan más alto?' },
    m: { en: ['why + children|kids|students|child + themselves|higher|own|self'], es: ['por que + alumnos|ninos + mas alto|se puntuan|se valoran|a si mismos'] },
    th: { en: ['Thinking about how 8-year-olds judge their own skills'], es: ['Pensando en cómo se valoran a sí mismos los niños de 8 años'] },
    a: { en: function () { return 'Very normal at this age: 8-year-olds are optimistic about themselves, and their tasks capture what they can do at their best, not on an ordinary day.\n\nUse it: "You feel confident at this. Let’s see if we can make it happen every day, not just sometimes." It turns confidence into a goal.'; },
      es: function () { return 'Muy normal a esta edad: con 8 años son optimistas consigo mismos, y sus tareas recogen lo que hacen en su mejor momento, no en un día normal.\n\nAprovéchalo: "Te sientes seguro en esto. Vamos a conseguir que pase todos los días, no solo a veces." Así la confianza se convierte en un objetivo.'; } },
    next: ['v1', 's14', 'v6'],
  });
  B('v4', 'persp', {
    q: { en: 'Which skill has the biggest perspective gap?', es: '¿Qué habilidad tiene más diferencia entre miradas?' },
    w: 100, m: { en: ['biggest|largest|most + perspective*|viewpoint*|disagree*', 'gap + perspective*|viewpoint*|between views'], es: ['mayor|mas + diferencia entre miradas|miradas|perspectiva*'] },
    th: { en: ['Finding the skill where the three views are furthest apart'], es: ['Buscando la habilidad con las miradas más alejadas'] },
    a: { en: function (h) { var t = h.persp.top; return '**' + t.name + '**: ' + VIEW.en[t.hi] + ' ' + t[t.hi.charAt(0)] + '%, ' + VIEW.en[t.lo] + ' ' + t[t.lo.charAt(0)] + '% (' + t.gap + ' points apart).\n\nOpen **Insights → Perspectives** to see every skill side by side.'; },
      es: function (h) { var t = h.persp.top; return '**' + t.name + '**: ' + VIEW.es[t.hi] + ' ' + t[t.hi.charAt(0)] + ' %, ' + VIEW.es[t.lo] + ' ' + t[t.lo.charAt(0)] + ' % (' + t.gap + ' puntos de diferencia).\n\nAbre **Análisis → Perspectivas** para ver todas las habilidades a la vez.'; } },
    next: ['v1', 'v2', 'v5'],
  });
  B('v5', 'persp', {
    q: { en: 'How do I talk to a parent about a different view?', es: '¿Cómo hablo con una familia que lo ve distinto?' },
    m: { en: ['talk|speak|approach + parent*|famil* + different|view*|disagree*|perspective*'], es: ['hablo|hablar + familia* + distinto|diferente|mirada*|no coincide'] },
    th: { en: ['Framing a gap as curiosity, not correction'], es: ['Planteando la diferencia con curiosidad, no como corrección'] },
    a: { en: function () { return 'Lead with curiosity: "Your survey tells me [name] is really calm at home. That’s great to hear. I see it a bit less in class, so I’d love to know what helps at home."\n\nYou both want the same thing; the gap just tells you where the skill shows up most easily.'; },
      es: function () { return 'Empieza con curiosidad: "Por la encuesta veo que [nombre] está muy tranquilo en casa, ¡qué bien! En clase lo veo algo menos, así que me encantaría saber qué le ayuda en casa."\n\nLos dos queréis lo mismo: la diferencia solo indica dónde aparece la habilidad con más facilidad.'; } },
    next: ['p5', 'v2', 'p8'],
  });
  B('v6', 'persp', {
    q: { en: 'Should I change my observation if parents disagree?', es: '¿Debo cambiar mi observación si la familia no coincide?' },
    m: { en: ['change|update|redo + observation*|score*|rating* + parent*|disagree*'], es: ['cambiar|cambio|rehacer + observacion*|puntuacion* + familia*|no coincide'] },
    th: { en: ['Explaining how the three views combine'], es: ['Explicando cómo se combinan las tres miradas'] },
    a: { en: function () { return 'No: record what **you** see in class. The level combines all three views, so each one only needs to be honest, not to match.\n\nIf you notice something new later, you can redo an observation any time during the window.'; },
      es: function () { return 'No: registra lo que **tú** ves en clase. El nivel combina las tres miradas, así que cada una solo tiene que ser sincera, no coincidir.\n\nSi más adelante notas algo nuevo, puedes rehacer la observación durante la fase.'; } },
    next: ['t2', 'v1', 'v5'],
  });

  // ================= How Tilli works / privacy =================
  B('t1', 'product', { w: 100,
    q: { en: 'What is Tilli?', es: '¿Qué es Tilli?' },
    m: { en: ['what + tilli|this app|this platform|this tool', 'about tilli'], es: ['que es + tilli|esta app|esta plataforma|esta herramienta', 'sobre tilli'] },
    th: { en: ['Explaining Tilli in a few lines'], es: ['Explicando Tilli en pocas líneas'] },
    a: { en: function () { return 'Tilli helps you see each child’s **social-emotional and thinking skills**: 12 skills, three times a year, from three viewpoints (you, the family and the child’s own playful tasks).\n\nThen it turns that into something useful: who needs a check-in, what to try this week, and what to tell families. I’m the part you can just ask.'; },
      es: function () { return 'Tilli te ayuda a ver las **habilidades socioemocionales y de pensamiento** de cada alumno: 12 habilidades, tres veces al año, desde tres miradas (tú, la familia y las tareas lúdicas del propio alumno).\n\nY lo convierte en algo útil: con quién hablar, qué probar esta semana y qué contar a las familias. Yo soy la parte a la que puedes preguntar.'; } },
    next: ['t8', 't6', 't2'],
  });
  B('t2', 'product', {
    q: { en: 'How are levels calculated?', es: '¿Cómo se calculan los niveles?' },
    m: { en: ['how + level*|score*|calculat*|work out|measured'], es: ['como + nivel*|puntuacion*|calcul*|mide*'] },
    th: { en: ['Explaining the scoring'], es: ['Explicando la puntuación'] },
    a: { en: function () { return 'Each skill gets a 0–100 score from three sources: **your observation**, the **parent survey** and the **child’s own tasks**. They’re combined into one score:\n• under 33 → Beginner\n• 33–66 → Learner\n• 67+ → Advanced\n\nNo single view decides it; that’s what makes it fair.'; },
      es: function () { return 'Cada habilidad recibe una puntuación de 0 a 100 de tres fuentes: **tu observación**, la **encuesta de la familia** y las **tareas del propio alumno**. Se combinan en una sola:\n• menos de 33 → Principiante\n• 33–66 → Aprendiz\n• 67 o más → Avanzado\n\nNinguna mirada decide sola: eso es lo que lo hace justo.'; } },
    next: ['t3', 'v6', 't6'],
  });
  B('t3', 'product', {
    q: { en: 'What do Beginner, Learner and Advanced mean?', es: '¿Qué significan Principiante, Aprendiz y Avanzado?' },
    m: { en: ['beginner|learner|advanced + mean*|what|levels|difference', 'what + levels + mean'], es: ['principiante|aprendiz|avanzado + significa*|que|niveles|diferencia', 'que significan + niveles'] },
    th: { en: ['Describing the three levels'], es: ['Describiendo los tres niveles'] },
    a: { en: function () { return '• **Beginner**: the skill is just starting; an adult prompts it most of the time\n• **Learner**: it’s there with reminders or in familiar situations, where most Grade 3 children sit\n• **Advanced**: they do it on their own, even when things are hard\n\nIt describes where a skill is today, not what a child is.'; },
      es: function () { return '• **Principiante**: la habilidad empieza; casi siempre necesita que un adulto la recuerde\n• **Aprendiz**: aparece con recordatorios o en situaciones conocidas, donde está la mayoría en 3.º\n• **Avanzado**: lo hace solo, incluso cuando cuesta\n\nDescribe dónde está una habilidad hoy, no cómo es el niño.'; } },
    next: ['t2', 'p4', 'c8'],
  });
  B('t4', 'product', { w: 300,
    q: { en: 'Who can see my notes?', es: '¿Quién puede ver mis notas?' },
    m: { en: ['who + see|read|access + notes|memory|what i write', 'notes + private|privacy'], es: ['quien + ve|ver|leer|acceder + notas|memoria|lo que escribo', 'notas + privad*|privacidad'] },
    th: { en: ['Checking how notes are stored'], es: ['Revisando cómo se guardan las notas'] },
    a: { en: function () { return 'Only you. Notes you tell me are **private to you**: not shown to families, not in reports, not visible to other teachers.\n\nI use them to answer your questions better, like reminding you what you noticed about a child last week.'; },
      es: function () { return 'Solo tú. Las notas que me cuentas son **privadas**: no las ven las familias, no salen en los informes y otros docentes no tienen acceso.\n\nLas uso para responderte mejor, por ejemplo para recordarte lo que viste en un alumno la semana pasada.'; } },
    next: ['t5', 'k10', 't8'],
  });
  B('t5', 'product', { w: 300,
    q: { en: 'Is children’s data safe?', es: '¿Están seguros los datos de los alumnos?' },
    m: { en: ['data|privacy|gdpr|secure|security|safe + children|student*|data|kids', 'is + data + safe'], es: ['datos|privacidad|rgpd|segur* + alumnos|ninos|datos', 'estan seguros|son seguros'] },
    th: { en: ['Summarising how Tilli protects children’s data'], es: ['Resumiendo cómo protege Tilli los datos de los alumnos'] },
    a: { en: function () { return 'Yes:\n• Each teacher only sees their own classes\n• Families only ever see their own child\n• Data is encrypted and never sold or used for advertising\n• Your school owns its data and can ask for it to be deleted\n\nIn this demo nothing leaves your browser at all.'; },
      es: function () { return 'Sí:\n• Cada docente solo ve sus clases\n• Las familias solo ven a su hijo\n• Los datos van cifrados y nunca se venden ni se usan para publicidad\n• El colegio es dueño de sus datos y puede pedir que se borren\n\nEn esta demo, nada sale de tu navegador.'; } },
    next: ['t4', 't1', 'p2'],
  });
  B('t6', 'product', {
    q: { en: 'What are Baseline, Midline and Endline?', es: '¿Qué son las fases inicial, intermedia y final?' },
    m: { en: ['baseline|midline|endline|windows|phases + what are|mean|explain'], es: ['fase inicial|fase intermedia|fase final|fases + que son|significa|explica'] },
    th: { en: ['Explaining the three assessment windows'], es: ['Explicando las tres fases de evaluación'] },
    a: { en: function (h) { return 'Three short assessment windows a year:\n• **Baseline**: the start of the year, your starting point\n• **Midline**: mid-year, to see what’s growing' + (h.midClose ? ' (open now, until ' + h.midClose + ')' : '') + '\n• **Endline**: the end of the year, to see the full journey\n\nEach window: a 3-minute observation per child from you, a parent survey and the child’s playful tasks.'; },
      es: function (h) { return 'Tres fases cortas de evaluación al año:\n• **Inicial**: al empezar el curso, vuestro punto de partida\n• **Intermedia**: a mitad de curso, para ver qué crece' + (h.midClose ? ' (abierta ahora, hasta el ' + h.midClose + ')' : '') + '\n• **Final**: al terminar, para ver todo el camino\n\nEn cada fase: una observación tuya de 3 minutos por alumno, una encuesta a la familia y las tareas lúdicas del alumno.'; } },
    next: ['t7', 'c12', 't2'],
  });
  B('t7', 'product', {
    q: { en: 'How long does an observation take?', es: '¿Cuánto tarda una observación?' },
    m: { en: ['how long + observation*|assessment*|survey*', 'time + observ*'], es: ['cuanto + tarda|dura|tiempo + observacion*|evaluacion*|encuesta*'] },
    th: { en: ['Checking the observation length'], es: ['Revisando la duración de la observación'] },
    a: { en: function () { return 'About **3 minutes per child**: 21 short questions about what you’ve seen in class, in pages of 6. You can stop and pick up where you left off.\n\nMost teachers do 3–4 a day during the window.'; },
      es: function () { return 'Unos **3 minutos por alumno**: 21 preguntas cortas sobre lo que has visto en clase, en páginas de 6. Puedes parar y seguir donde lo dejaste.\n\nLa mayoría hace 3 o 4 al día durante la fase.'; } },
    next: ['c12', 't6', 't8'],
  });
  B('t8', 'product', { w: 150,
    q: { en: 'What can you help me with?', es: '¿En qué me puedes ayudar?' },
    m: { en: ['what + can you|help|do you do', 'help me|how do i use you|what should i ask'], es: ['en que + ayudar|puedes', 'que puedes hacer|ayudame|que te pregunto'] },
    th: { en: ['Listing what I can do in this demo'], es: ['Listando lo que puedo hacer en esta demo'] },
    a: { en: function (h) { return 'Ask me about:\n• **Your class**: how it’s doing, who needs support, what to focus on\n• **A child**: try "How is ' + (h.cast.math ? h.n(h.cast.math) : 'a child') + ' doing?"\n• **Skills**: activities, strategies, what a skill looks like\n• **Attendance and marks**: who’s absent, what’s hard in maths\n• **Families**: what to say, reports, messages\n\nOr just tell me something, like "' + (h.cast.calm ? h.n(h.cast.calm) : 'A child') + ' got really upset at break today", and I’ll sort it and remember it.'; },
      es: function (h) { return 'Pregúntame por:\n• **Tu clase**: cómo va, quién necesita apoyo, en qué centrarte\n• **Un alumno**: prueba "¿Cómo va ' + (h.cast.math ? h.n(h.cast.math) : 'un alumno') + '?"\n• **Habilidades**: actividades, estrategias, cómo se ven\n• **Asistencia y notas**: quién falta, qué cuesta en mates\n• **Familias**: qué decir, informes, mensajes\n\nO simplemente cuéntame algo, como "' + (h.cast.calm ? h.n(h.cast.calm) : 'Un alumno') + ' se ha enfadado mucho en el recreo", y lo ordeno y lo recuerdo.'; } },
    next: ['c1', 'k1', 'c2'],
  });

  // ================= Safety / out of scope =================
  B('x1', 'safety', { w: 3000,
    q: { en: 'Does this child have ADHD?', es: '¿Tiene TDAH este alumno?' },
    m: { en: ['adhd|autis*|autism|dyslexi*|asd|disorder|diagnos*|spectrum|special needs'], es: ['tdah|autis*|dislexi*|tea|trastorno|diagnost*|necesidades especiales'] },
    th: { en: ['Checking what Tilli can and can’t say'], es: ['Revisando lo que Tilli puede y no puede decir'] },
    a: { en: function () { return 'I can’t diagnose, and Tilli’s levels aren’t a diagnosis: they show where a skill is today, compared with what’s typical for the age.\n\nIf you’re worried, note specific examples (when, what happened, how often), share them with your school’s SEN coordinator or counsellor, and talk to the family together. I can help you prepare that conversation.'; },
      es: function () { return 'No puedo diagnosticar, y los niveles de Tilli no son un diagnóstico: muestran dónde está una habilidad hoy, comparada con lo habitual para la edad.\n\nSi te preocupa, apunta ejemplos concretos (cuándo, qué pasó, con qué frecuencia), compártelos con orientación del colegio y hablad juntos con la familia. Puedo ayudarte a preparar esa conversación.'; } },
    next: ['p8', 'k12', 'x2'],
  });
  B('x2', 'safety', { w: 3000,
    q: { en: 'A child told me something worrying about home', es: 'Un alumno me ha contado algo preocupante de casa' },
    m: { en: ['abuse*|hurt at home|hits him|hits her|unsafe|safeguard*|disclos*|worrying about home|scared to go home|neglect*|self harm'], es: ['maltrato|abuso*|le pegan|inseguro|proteccion|me ha contado algo|miedo de ir a casa|negligencia|autoles*'] },
    th: { en: ['This is a safeguarding matter'], es: ['Esto es un tema de protección'] },
    a: { en: function () { return '**Please follow your school’s safeguarding procedure today.**\n• Tell your designated safeguarding lead as soon as possible, before the end of the day\n• Write down what the child said in their own words, with the time and date\n• Don’t promise to keep it secret, and don’t investigate yourself\n\nPlease don’t put details here: this is a teaching assistant, not a safeguarding record.'; },
      es: function () { return '**Sigue hoy el protocolo de protección del colegio.**\n• Avisa cuanto antes al responsable de protección, antes de que acabe el día\n• Apunta lo que dijo el alumno con sus propias palabras, con fecha y hora\n• No prometas guardar el secreto y no investigues por tu cuenta\n\nPor favor, no escribas detalles aquí: soy un asistente docente, no un registro de protección.'; } },
    next: [],
  });
  B('x3', 'safety', { w: 400,
    q: { en: 'Compare my class with other schools', es: 'Compara mi clase con otros colegios' },
    m: { en: ['other schools|other classes|rank*|league|benchmark*|national average|compare + school*'], es: ['otros colegios|otras clases|ranking|clasificacion|media nacional|compara + colegio*'] },
    th: { en: ['Checking what comparisons Tilli makes'], es: ['Revisando qué comparaciones hace Tilli'] },
    a: { en: function () { return 'Tilli doesn’t rank classes or schools. The useful comparison is your class with itself: Baseline → Midline → Endline.\n\nIf you teach more than one section, **Insights → Compare my sections** shows them side by side, to share what works, not to rank.'; },
      es: function () { return 'Tilli no hace rankings de clases ni de colegios. La comparación útil es tu clase consigo misma: fase inicial → intermedia → final.\n\nSi das clase a más de un grupo, **Análisis → Comparar mis grupos** los muestra lado a lado, para compartir lo que funciona, no para clasificar.'; } },
    next: ['c6', 'c1', 't2'],
  });
  B('x4', 'safety', { w: 200,
    q: { en: 'What’s the weather today?', es: '¿Qué tiempo hace hoy?' },
    m: { en: ['weather|football|cricket|news|stock*|recipe|movie|song|capital of'], es: ['tiempo hace|futbol|noticias|bolsa|receta|pelicula|cancion|capital de'] },
    th: { en: [], es: [] },
    a: { en: function () { return 'That’s outside what I know. I only know about your class: skills, attendance, marks and ideas for teaching. Try "What should I focus on this week?"'; },
      es: function () { return 'Eso se sale de lo que sé: solo conozco tu clase (habilidades, asistencia, notas e ideas para enseñar). Prueba "¿En qué me centro esta semana?"'; } },
    next: ['c2', 't8', 'c1'],
  });
  B('x5', 'safety', { w: 200,
    q: { en: 'Tell me a joke', es: 'Cuéntame un chiste' },
    m: { en: ['joke|funny|make me laugh'], es: ['chiste|algo gracioso|hazme reir'] },
    th: { en: [], es: [] },
    a: { en: function () { return 'Why did the pencil go to the counsellor? It felt a little blunt and needed a point 😄\n\nNow, back to your class: want to know who to check in with today?'; },
      es: function () { return '¿Qué le dijo un lápiz a otro? ¡Sácame punta, que hoy estoy espeso! 😄\n\nVolviendo a tu clase: ¿quieres saber con quién hablar hoy?'; } },
    next: ['c3', 'c13', 'c2'],
  });
  B('g1', 'chat', { w: 50,
    q: { en: 'Hi Tilli', es: 'Hola Tilli' },
    m: { en: ['hi|hello|hey|good morning|good afternoon', 'thanks|thank you|cheers'], es: ['hola|buenos dias|buenas tardes', 'gracias|muchas gracias'] },
    not: { en: ['how', 'what', 'who', 'which', 'why'], es: ['como', 'que', 'quien', 'cual', 'por que'] },
    th: { en: [], es: [] },
    a: { en: function (h) { return 'Hi! I’m here whenever you need me. ' + h.cls + ' has ' + h.N + ' children assessed and the Midline window is open. Where would you like to start?'; },
      es: function (h) { return '¡Hola! Aquí estoy para lo que necesites. ' + h.cls + ' tiene ' + h.N + ' alumnos evaluados y la fase intermedia está abierta. ¿Por dónde empezamos?'; } },
    next: ['c1', 'c2', 'c3'],
  });

  // ================= Notes, comparisons, fallbacks =================
  var NOTE_MEAN = {
    en: { up: function (n, sk) { return 'That’s real progress in ' + sk + '. Worth telling ' + n + ' exactly what you saw.'; }, down: function (n, sk) { return 'It points to ' + sk + '. One moment isn’t a pattern, but if it happens again I’ll flag it.'; } },
    es: { up: function (n, sk) { return 'Es un avance real en ' + sk + '. Merece la pena decirle a ' + n + ' exactamente lo que viste.'; }, down: function (n, sk) { return 'Apunta a ' + sk + '. Un momento no es un patrón, pero si se repite te avisaré.'; } },
  };
  var note = {
    en: function (h, x) {
      var c = h.ci, k = x.skills[0] ? x.skills[0].key : null, sk = k ? h.sk(k) : null, lvl = k ? c.sk(k) : null;
      var think = ['This is about **' + c.n + '**', k ? 'Words like "' + x.skills[0].hits.slice(0, 2).join('", "') + '" point to **' + sk + '**' + (x.skills[1] ? ' (and some ' + h.sk(x.skills[1].key) + ')' : '') : 'No clear skill words, so I’ll keep it as a general note', k ? c.n + '’s Midline in ' + sk + ': ' + h.band(lvl.band) : c.n + ' is ' + c.band + ' overall', 'Saving it to ' + c.n + '’s memory layer'];
      var text = '**Saved to ' + c.n + '’s memory 🔒**\n' + (k ? '• Sorted into: **' + sk + '**' + (x.skills[1] ? ' + ' + h.sk(x.skills[1].key) : '') + '\n• Midline: ' + h.band(lvl.band) + ' (' + lvl.pct + '%)\n• What it may mean: ' + NOTE_MEAN.en[x.up ? 'up' : 'down'](c.n, sk.toLowerCase()) + '\n• One thing to try: ' + tip('en', k).tip : '• I couldn’t link it to one skill, so it’s kept as a general note.') + '\n\nI’ll bring this up next time you ask about ' + c.n + '.';
      return { text: text, think: think };
    },
    es: function (h, x) {
      var c = h.ci, k = x.skills[0] ? x.skills[0].key : null, sk = k ? h.sk(k) : null, lvl = k ? c.sk(k) : null;
      var think = ['Habla de **' + c.n + '**', k ? 'Palabras como "' + x.skills[0].hits.slice(0, 2).join('", "') + '" apuntan a **' + sk + '**' + (x.skills[1] ? ' (y algo de ' + h.lsk(x.skills[1].key) + ')' : '') : 'No hay palabras claras de una habilidad: la guardo como nota general', k ? 'Fase intermedia de ' + c.n + ' en ' + h.lsk(k) + ': ' + h.band(lvl.band) : c.n + ' está en ' + c.band + ' en general', 'Guardándola en la capa de memoria de ' + c.n];
      var text = '**Guardado en la memoria de ' + c.n + ' 🔒**\n' + (k ? '• Clasificado en: **' + sk + '**' + (x.skills[1] ? ' + ' + h.lsk(x.skills[1].key) : '') + '\n• Fase intermedia: ' + h.band(lvl.band) + ' (' + lvl.pct + ' %)\n• Qué puede significar: ' + NOTE_MEAN.es[x.up ? 'up' : 'down'](c.n, h.lsk(k)) + '\n• Algo que probar: ' + tip('es', k).tip : '• No lo he podido vincular a una habilidad: queda como nota general.') + '\n\nLo tendré en cuenta la próxima vez que preguntes por ' + c.n + '.';
      return { text: text, think: think };
    },
  };
  var compare = {
    en: function (h, cs) {
      var line = function (c) { return '• **' + c.n + '**: ' + c.band + ' (' + c.pct + '%) · strongest ' + c.top.toLowerCase() + ' · building ' + c.low.toLowerCase(); };
      var share = SKS.filter(function (k) { return cs.every(function (c) { return c.sk(k).band !== 'Beginner'; }); }).length;
      return { think: ['Opening ' + h.list(cs.map(function (c) { return c.n; })) + '’s results', 'Lining up their 12 skills side by side'],
        text: line(cs[0]) + '\n' + cs.slice(1).map(line).join('\n') + '\n\nThey’re at Learner or above together in ' + share + ' of 12 skills. Pairing them works best where one is strong and the other is still building.' };
    },
    es: function (h, cs) {
      var line = function (c) { return '• **' + c.n + '**: ' + c.band + ' (' + c.pct + ' %) · lo más fuerte, ' + c.top.toLowerCase() + ' · trabajando ' + c.low.toLowerCase(); };
      var share = SKS.filter(function (k) { return cs.every(function (c) { return c.sk(k).band !== 'Beginner'; }); }).length;
      return { think: ['Abriendo los resultados de ' + h.list(cs.map(function (c) { return c.n; })), 'Poniendo sus 12 habilidades una al lado de la otra'],
        text: line(cs[0]) + '\n' + cs.slice(1).map(line).join('\n') + '\n\nCoinciden en Aprendiz o más en ' + share + ' de 12 habilidades. Emparejarlos funciona mejor donde uno es fuerte y el otro aún está trabajando.' };
    },
  };
  var fallback = {
    en: function (h) { return 'I don’t have an answer for that one in this demo. I can tell you about ' + h.cls + ', any child (try their name), a skill, attendance, marks or families. Here are a few things teachers often ask:'; },
    es: function (h) { return 'En esta demo no tengo respuesta para eso. Puedo contarte sobre ' + h.cls + ', cualquier alumno (prueba con su nombre), una habilidad, la asistencia, las notas o las familias. Esto es lo que más suelen preguntar los docentes:'; },
  };
  var whichChild = {
    en: function (h) { return 'Which child do you mean? Try their first name, for example "How is ' + h.list(h.kids.slice(0, 2).map(h.n), 2).replace(' and ', ' doing?" or "How is ') + ' doing?"'; },
    es: function (h) { return '¿De qué alumno hablas? Prueba con su nombre, por ejemplo "¿Cómo va ' + h.list(h.kids.slice(0, 2).map(h.n), 2).replace(' y ', '?" o "¿Cómo va ') + '?"'; },
  };

  var byId = {}; E.forEach(function (e) { byId[e.id] = e; });
  window.TilliAskBank = {
    entries: E, byId: byId, starters: ['c1', 'c2', 'k1', 't8'],
    // The 8 tap chips (demo-content.js chipSet) lead on to these.
    chipNext: { qFocus: ['s2', 'r1', 'c15'], qCheck: ['k1', 'c14', 'k10'], qWhy: ['m4', 's10', 'k4'], qAct: ['s2', 'r7', 'm9'],
      sOkay: ['k4', 'k6', 'k9'], sRemember: ['k1', 'k20', 'k13'], sTry: ['k18', 'k17', 'k6'], sParent: ['p2', 'k18', 'k11'] },
    skillWords: skillWords, noteWords: noteWords, upWords: upWords, downWords: downWords, noteCue: noteCue, qStart: qStart, askCue: askCue, pron: pron,
    note: note, compare: compare, fallback: fallback, whichChild: whichChild, tips: TIP,
  };
})();
