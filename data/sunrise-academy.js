/* ═══════════════════════════════════════════════════════════════════════
   SUNRISE ACADEMY — fictional demo dataset (REFERENCE ONLY).
   ------------------------------------------------------------------------
   Nothing loads this file. It's the full source the AskTilli demo answers
   were written from; the live demo shows ask-tilli-questions.json (answer
   bank, tried first) and the summary in js/ask-tilli-demo.js (fallback).
   If you change a number here, update those two as well, or they'll
   disagree.

   Everything here is made up: no real school, no real children. Never put
   real student data in this file. It's publicly downloadable from the site.
   ═══════════════════════════════════════════════════════════════════════ */

export default {
  school: {
    name: 'Sunrise Academy',
    note: 'Fictional demo school created for the Tilli website. All names and numbers are illustrative.',
    academicYear: '2026–27',
    grades: ['Pre-K', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
    classesPerGrade: 1,
    studentsPerClass: 35,
    totalStudents: 210,
    assessments: 'Tilli check-ins in Term 1 and Term 2 (latest). The Term 3 check-in has not happened yet.',
    levelScale: ['Emerging', 'Learner', 'Expert'],
    levelScaleNote: 'Each child is placed at one level per skill. "At or above expected" means Learner or Expert for their age.'
  },

  skills: {
    attention: 'staying focused on a task and tuning out distractions',
    'working memory': 'holding information in mind while using it, e.g. multi-step instructions',
    'cognitive flexibility': 'switching between tasks or ideas and seeing other ways to solve a problem',
    inhibition: 'stopping an automatic response, e.g. not blurting out',
    'self-control': 'managing impulses and behaviour, especially in groups',
    planning: 'working out the steps needed to reach a goal',
    organisation: 'keeping materials, time and work in order',
    empathy: 'understanding and caring about how others feel',
    'emotional regulation': 'calming down and handling big feelings',
    'social awareness': 'reading social situations and getting along with peers',
    perseverance: 'keeping going when a task gets hard',
    'self-awareness': 'knowing their own feelings, strengths and needs'
  },

  howToReadGrades:
    'skills: for each skill, [Term 1 %, Term 2 %] of the class at or above the expected level. ' +
    'focus = the skill the class needs most support with; strong = the class strength. ' +
    'assessed / parentReports = how many of the 35 children have a Term 2 teacher check-in / a parent report.',

  grades: {
    'Pre-K': {
      teacher: 'Ms. Nadia Perera',
      assessed: 35, parentReports: 31,
      focus: 'emotional regulation', strong: 'empathy',
      summary: 'Settling into routines; big feelings peak after lunch.',
      classroomActivity: 'Feelings check-in circle each morning (Week 12 activity)',
      homeActivity: 'Name feelings out loud at bedtime ("you look frustrated")',
      skills: {
        attention: [48, 57], 'working memory': [50, 58], 'cognitive flexibility': [52, 60],
        inhibition: [44, 56], 'self-control': [45, 57], planning: [47, 56], organisation: [49, 58],
        empathy: [66, 74], 'emotional regulation': [41, 55], 'social awareness': [58, 66],
        perseverance: [53, 61], 'self-awareness': [50, 59]
      }
    },
    'Grade 1': {
      teacher: 'Mr. Arjun Mehta',
      assessed: 34, parentReports: 30,
      focus: 'attention', strong: 'empathy',
      summary: 'Attention dips in the last period; mornings are strongest.',
      classroomActivity: 'Two-minute movement break before the last period (Week 9 activity)',
      homeActivity: 'A 10-minute homework block with the TV off, then a short break',
      skills: {
        attention: [36, 49], 'working memory': [52, 60], 'cognitive flexibility': [54, 62],
        inhibition: [47, 57], 'self-control': [48, 58], planning: [50, 58], organisation: [51, 59],
        empathy: [68, 75], 'emotional regulation': [55, 63], 'social awareness': [60, 67],
        perseverance: [49, 58], 'self-awareness': [53, 61]
      }
    },
    'Grade 2': {
      teacher: 'Ms. Leila Haddad',
      assessed: 35, parentReports: 33,
      focus: 'attention', strong: 'working memory',
      summary: 'The class needs the most support with sustained focus, but recall is a real strength.',
      classroomActivity: 'Two-minute attention warm-up before group tasks (Week 14 activity)',
      homeActivity: 'Give one instruction at a time and ask them to repeat it back',
      skills: {
        attention: [38, 54], 'working memory': [67, 75], 'cognitive flexibility': [58, 66],
        inhibition: [50, 60], 'self-control': [51, 61], planning: [53, 62], organisation: [52, 61],
        empathy: [62, 70], 'emotional regulation': [57, 65], 'social awareness': [59, 66],
        perseverance: [48, 57], 'self-awareness': [55, 63]
      }
    },
    'Grade 3': {
      teacher: 'Mr. Rohan Silva',
      assessed: 35, parentReports: 28,
      focus: 'self-control', strong: 'cognitive flexibility',
      summary: 'Quick to switch tasks, but interrupting during group work is the main challenge.',
      classroomActivity: '"Stop, think, do" cards during group work (Week 11 activity)',
      homeActivity: 'A "count to three before you answer" game at dinner',
      skills: {
        attention: [56, 64], 'working memory': [60, 67], 'cognitive flexibility': [70, 77],
        inhibition: [49, 60], 'self-control': [44, 58], planning: [55, 63], organisation: [54, 62],
        empathy: [61, 68], 'emotional regulation': [58, 66], 'social awareness': [57, 64],
        perseverance: [55, 62], 'self-awareness': [56, 63]
      }
    },
    'Grade 4': {
      teacher: 'Ms. Ananya Rao',
      assessed: 33, parentReports: 29,
      focus: 'planning', strong: 'attention',
      summary: 'Strong focus; needs scaffolding to plan multi-step tasks.',
      classroomActivity: '"Plan it first" checklist for multi-step tasks (Week 13 activity)',
      homeActivity: 'Plan the weekend together on a simple checklist',
      skills: {
        attention: [72, 79], 'working memory': [63, 70], 'cognitive flexibility': [62, 69],
        inhibition: [60, 67], 'self-control': [61, 68], planning: [47, 60], organisation: [53, 62],
        empathy: [64, 70], 'emotional regulation': [61, 67], 'social awareness': [63, 69],
        perseverance: [58, 65], 'self-awareness': [59, 66]
      }
    },
    'Grade 5': {
      teacher: 'Mr. Samuel Fernando',
      assessed: 35, parentReports: 32,
      focus: 'working memory', strong: 'planning',
      summary: 'Good planners; holding several steps in mind at once is the stretch for this class.',
      classroomActivity: 'Memory-chain recall game, led by a student (Week 10 activity)',
      homeActivity: 'Ask them to teach you one thing they learned today',
      skills: {
        attention: [60, 66], 'working memory': [52, 63], 'cognitive flexibility': [66, 72],
        inhibition: [64, 70], 'self-control': [65, 71], planning: [74, 80], organisation: [68, 73],
        empathy: [67, 72], 'emotional regulation': [64, 69], 'social awareness': [66, 71],
        perseverance: [62, 68], 'self-awareness': [63, 69]
      }
    }
  },

  howToReadChildren:
    'Five example children per grade (the other 30 in each class are only in the class totals). ' +
    'levels lists the Term 2 level for skills that are NOT Learner — every skill not listed is at Learner. ' +
    'movedUp lists skills that went up one level since Term 1.',

  children: {
    'Pre-K': [
      { name: 'Aanya', levels: { 'emotional regulation': 'Emerging', empathy: 'Expert' }, movedUp: ['social awareness'],
        teacherNote: 'Big feelings after lunch; the calm-down corner helps her reset in a few minutes.' },
      { name: 'Zayd', levels: { attention: 'Emerging', inhibition: 'Emerging', perseverance: 'Expert' }, movedUp: [],
        teacherNote: 'Will rebuild a block tower ten times, but finds circle time hard to sit through.' },
      { name: 'Lucía', levels: { empathy: 'Expert', 'social awareness': 'Expert', planning: 'Emerging' }, movedUp: ['emotional regulation'],
        teacherNote: 'First to comfort a friend; needs help sequencing tidy-up steps.' },
      { name: 'Tharindu', levels: { 'working memory': 'Expert', 'self-awareness': 'Emerging' }, movedUp: ['attention'],
        teacherNote: 'Remembers every song; does not yet say when he is upset.' },
      { name: 'Priya', levels: {}, movedUp: ['emotional regulation', 'inhibition'],
        teacherNote: 'Steady across the board; much calmer at drop-off than in Term 1.' }
    ],
    'Grade 1': [
      { name: 'Kabir', levels: { attention: 'Emerging', empathy: 'Expert' }, movedUp: [],
        teacherNote: 'Focused in the morning; drifts in the last period.' },
      { name: 'Sara', levels: { organisation: 'Expert' }, movedUp: ['attention'],
        teacherNote: 'Keeps the class library in order; attention improved after seating change.' },
      { name: 'Omar', levels: { attention: 'Emerging', perseverance: 'Emerging', 'social awareness': 'Expert' }, movedUp: [],
        teacherNote: 'Popular and kind; gives up quickly on writing tasks.' },
      { name: 'Nethmi', levels: { attention: 'Expert', 'working memory': 'Expert' }, movedUp: ['planning'],
        teacherNote: 'Follows three-step instructions easily; ready for extension work.' },
      { name: 'Vihaan', levels: { inhibition: 'Emerging' }, movedUp: ['attention'],
        teacherNote: 'Calls out answers; attention moved up from Emerging this term.' }
    ],
    'Grade 2': [
      { name: 'Meera', levels: { attention: 'Emerging', 'working memory': 'Expert' }, movedUp: [],
        teacherNote: 'Strong recall but loses focus in long tasks; does better with short chunks.' },
      { name: 'Arjun', levels: { 'cognitive flexibility': 'Expert' }, movedUp: ['attention'],
        teacherNote: 'Finds new ways to solve maths problems.' },
      { name: 'Hana', levels: { attention: 'Emerging', empathy: 'Expert' }, movedUp: ['perseverance'],
        teacherNote: 'Caring with younger children; attention warm-ups are starting to help.' },
      { name: 'Diego', levels: { 'emotional regulation': 'Emerging' }, movedUp: ['attention'],
        teacherNote: 'Gets frustrated when he loses a game; focus much better since Term 1.' },
      { name: 'Kavya', levels: { attention: 'Expert', 'working memory': 'Expert', 'self-awareness': 'Expert' }, movedUp: ['planning'],
        teacherNote: 'Knows when she needs a break and asks for it.' }
    ],
    'Grade 3': [
      { name: 'Rehan', levels: { 'self-control': 'Emerging', inhibition: 'Emerging', 'cognitive flexibility': 'Expert' }, movedUp: [],
        teacherNote: 'Quick to switch tasks, but interrupts during group work.' },
      { name: 'Amaya', levels: { planning: 'Expert' }, movedUp: ['self-control'],
        teacherNote: 'Uses the "stop, think, do" card without reminders now.' },
      { name: 'Yusuf', levels: { 'self-control': 'Emerging', empathy: 'Expert' }, movedUp: ['inhibition'],
        teacherNote: 'Thoughtful one-to-one; gets carried away in big groups.' },
      { name: 'Ishaan', levels: { 'working memory': 'Expert' }, movedUp: ['self-control'],
        teacherNote: 'Remembers long instructions; settling better in group work.' },
      { name: 'Noor', levels: { 'self-control': 'Expert', 'emotional regulation': 'Expert' }, movedUp: ['social awareness'],
        teacherNote: 'A calm presence; often helps classmates take turns.' }
    ],
    'Grade 4': [
      { name: 'Isha', levels: { attention: 'Expert', planning: 'Emerging' }, movedUp: [],
        teacherNote: 'Strong focus; needs scaffolding to plan multi-step tasks.' },
      { name: 'Karan', levels: { organisation: 'Emerging' }, movedUp: ['planning'],
        teacherNote: 'Planning improved with the checklist; still loses worksheets.' },
      { name: 'Mariam', levels: { planning: 'Expert', attention: 'Expert' }, movedUp: ['organisation'],
        teacherNote: 'Leads group projects well.' },
      { name: 'Senuri', levels: { planning: 'Emerging', perseverance: 'Expert' }, movedUp: [],
        teacherNote: 'Never gives up, but starts tasks without a plan.' },
      { name: 'Adrián', levels: { 'social awareness': 'Expert' }, movedUp: ['planning', 'attention'],
        teacherNote: 'Settled in well after joining mid-year.' }
    ],
    'Grade 5': [
      { name: 'Dhruv', levels: { 'working memory': 'Expert' }, movedUp: ['working memory'],
        teacherNote: 'Attention is at Learner, working memory at Expert; his parents report the same pattern at home. Leads the recall step well.' },
      { name: 'Riya', levels: { 'working memory': 'Emerging', planning: 'Expert' }, movedUp: [],
        teacherNote: 'Great planner who loses track midway; writing steps down helps.' },
      { name: 'Tariq', levels: { perseverance: 'Expert' }, movedUp: ['working memory'],
        teacherNote: 'Sticks with hard problems; recall improving.' },
      { name: 'Dinithi', levels: { 'working memory': 'Emerging', empathy: 'Expert' }, movedUp: ['emotional regulation'],
        teacherNote: 'Kind and patient; forgets multi-step homework instructions.' },
      { name: 'Aarav', levels: { attention: 'Expert', 'working memory': 'Expert', planning: 'Expert', 'cognitive flexibility': 'Expert' }, movedUp: [],
        teacherNote: 'Ahead in most skills; self-awareness (Learner) is his next step.' }
    ]
  }
};
