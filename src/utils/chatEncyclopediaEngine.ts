import { CategoryType } from '../types';
import { CATEGORIES_DATA } from '../data/categoriesData';
import { CATEGORY_MASTER_BLUEPRINTS } from '../data/categoryBlueprintsData';

/**
 * Generates a comprehensive, book-length institutional response for any category
 * covering Category Overview, Solution Architecture, Master Strategy, Tactical Playbook,
 * How to Learn It Roadmap, and all 6 Chapters.
 */
export function generateBookGradeCategoryResponse(category: CategoryType, query: string): string {
  const cat = CATEGORIES_DATA[category] || CATEGORIES_DATA.trading;
  const bp = cat.masterBlueprint || CATEGORY_MASTER_BLUEPRINTS[category] || CATEGORY_MASTER_BLUEPRINTS.trading;
  const q = query.toLowerCase();

  if (!bp) {
    return `### 📘 ${cat.title}\n\n${cat.shortDesc || cat.description}`;
  }

  // 1. Check if the user is asking specifically about "How to Learn" / Roadmap / Study Plan
  if (
    q.includes('how to learn') ||
    q.includes('study') ||
    q.includes('roadmap') ||
    q.includes('beginner') ||
    q.includes('start learning') ||
    q.includes('mastery curriculum')
  ) {
    const stagesMd = bp.howToLearn.studyRoadmap
      .map(
        (s) =>
          `#### ${s.stage} (${s.duration})\n- **Core Focus:** ${s.focus}\n- **Daily Practice Routine:** ${s.dailyRoutine}\n- **Graduation Milestone:** ${s.milestoneToPass}`
      )
      .join('\n\n');

    const scheduleMd = bp.howToLearn.dailySchedule
      .map((slot) => `- **${slot.timeBlock} — ${slot.activity}:** ${slot.output}`)
      .join('\n');

    const checkMd = bp.howToLearn.masteryVerificationChecklist.map((c) => `- [x] ${c}`).join('\n');

    return `### 🎓 How to Learn & Master ${cat.title} (Complete Book Roadmap)
**Volume:** ${bp.bookOverview.volumeTitle} (${bp.bookOverview.estimatedTotalHours})

---

#### 1. Cognitive & Practical Learning Philosophy
${bp.howToLearn.learningPhilosophy.join('\n\n')}

---

#### 2. The 4-Stage Mastery Roadmap (30-Day Curriculum)
${stagesMd}

---

#### 3. Daily 80-Minute Deep-Work Schedule
${scheduleMd}

---

#### 4. Complete 6-Chapter Reading Sequence
${cat.chapters.map((ch) => `- **Chapter ${ch.number}: ${ch.title}** (${ch.readTime}) — *${ch.subtitle}*`).join('\n')}

---

#### 5. Mastery Verification Standards
${checkMd}`;
  }

  // 2. Check if the user is asking about "Category Solution" / Problem / Architecture / Stack
  if (q.includes('solution') || q.includes('problem') || q.includes('architecture') || q.includes('system stack')) {
    const stackMd = bp.categorySolution.systemStack
      .map((s) => `- **${s.layer} (${s.component}):** ${s.purpose}`)
      .join('\n');

    const pillarsMd = bp.bookOverview.corePillars
      .map((p) => `- **${p.title}** [${p.metricBenchmark}]: ${p.description}`)
      .join('\n');

    return `### 🏛️ ${cat.title} — Complete Category Solution & System Architecture
**${bp.bookOverview.volumeTitle}**

---

#### 1. Executive Category Thesis
${bp.bookOverview.executiveThesis.join('\n\n')}

---

#### 2. Industry Problem Diagnosis (Why 95% Fail)
${bp.categorySolution.problemDiagnosis.join('\n\n')}

---

#### 3. The LURL End-to-End Solution Architecture
${bp.categorySolution.solutionArchitecture.join('\n\n')}

---

#### 4. The 4-Layer Institutional System Stack
${stackMd}

---

#### 5. Core Performance Pillars & Benchmarks
${pillarsMd}

---

#### 6. Expected Operational Outcomes
${bp.categorySolution.expectedOutcomes.map((o) => `- ✅ ${o}`).join('\n')}`;
  }

  // 3. Check if the user is asking about "Strategy" / Phases / Scaling / Rules
  if (q.includes('strategy') || q.includes('strategic') || q.includes('phase') || q.includes('scaling plan')) {
    const phasesMd = bp.masterStrategy.phases
      .map(
        (p) =>
          `#### ${p.phaseNumber}: ${p.title} (${p.timeframe})\n- **Objective:** ${p.objective}\n- **KPI Target:** \`${p.kpiTarget}\`\n${p.keyActions.map((a) => `  - ${a}`).join('\n')}`
      )
      .join('\n\n');

    const rulesMd = bp.masterStrategy.riskAndCapitalRules.map((r, i) => `${i + 1}. **${r}**`).join('\n');

    return `### ♟️ ${cat.title} — Master Strategy & 4-Phase Scaling Blueprint

#### 1. Overarching Strategic Doctrine
${bp.masterStrategy.strategicDoctrine.join('\n\n')}

---

#### 2. The 4-Phase Strategic Progression
${phasesMd}

---

#### 3. Ironclad Risk, Capital & Strategic Guardrails
${rulesMd}`;
  }

  // 4. Check if the user is asking about "Tactics" / Playbook / SOPs
  if (q.includes('tactic') || q.includes('playbook') || q.includes('sop') || q.includes('execution protocol')) {
    const tacticsMd = bp.tacticalPlaybook.tactics
      .map(
        (t) =>
          `#### ⚡ ${t.name}\n- **Trigger Condition:** ${t.triggerCondition}\n- **Target Benchmark:** \`${t.targetMetric}\`\n- **Exact Step-by-Step Protocol:**\n${t.exactProtocol.map((step, idx) => `  ${idx + 1}. ${step}`).join('\n')}\n- **Defensive Counter-Measure:** *${t.counterMeasure}*`
      )
      .join('\n\n---\n\n');

    return `### ⚡ ${cat.title} — Complete Tactical Playbook & Field SOPs
*${bp.tacticalPlaybook.tacticalSummary}*

---

${tacticsMd}`;
  }

  // 5. Default: Full Book-Grade Master Synthesis (Overview + Solution + Strategy + Tactics + How to Learn)
  const matchedChapter =
    cat.chapters.find(
      (ch) =>
        q.includes(ch.title.toLowerCase().slice(0, 12)) ||
        ch.content.some((c) => c.toLowerCase().includes(q.slice(0, 15)))
    ) || cat.chapters[0];

  const topTactic = bp.tacticalPlaybook.tactics[0];
  const secondTactic = bp.tacticalPlaybook.tactics[1];

  return `### 📚 ${cat.title}: Complete Book-Grade Executive Synthesis
Addressing your inquiry: **"${query}"**
**Source Volume:** *${bp.bookOverview.volumeTitle}* (${bp.bookOverview.estimatedTotalHours})

---

#### 1. Executive Category Thesis & Deep Context
${bp.bookOverview.executiveThesis[0]}

${matchedChapter.content.slice(0, 2).join('\n\n')}

---

#### 2. The Category Solution Architecture
- **Core Problem Solved:** ${bp.categorySolution.problemDiagnosis[0]}
- **LURL Solution Blueprint:** ${bp.categorySolution.solutionArchitecture[0]}
${bp.categorySolution.systemStack.map((s) => `  - **${s.layer}:** ${s.component} — *${s.purpose}*`).join('\n')}

---

#### 3. Master Strategy & Quantitative Formula
- **Strategic Doctrine:** ${bp.masterStrategy.strategicDoctrine[0]}
${
  matchedChapter.keyFormulas && matchedChapter.keyFormulas[0]
    ? `- **Primary Quantitative Formula (${matchedChapter.keyFormulas[0].name}):**\n  \`${matchedChapter.keyFormulas[0].formula}\`${matchedChapter.keyFormulas[0].explanation ? `\n  *${matchedChapter.keyFormulas[0].explanation}*` : ''}`
    : ''
}
- **Key Strategic Guardrail:** ${bp.masterStrategy.riskAndCapitalRules[0]}

---

#### 4. Tactical Execution Playbook (Immediate Field SOPs)
**${topTactic.name}**
- **Trigger:** ${topTactic.triggerCondition}
${topTactic.exactProtocol.map((s, i) => `${i + 1}. ${s}`).join('\n')}
- **Target Metric:** \`${topTactic.targetMetric}\`
- **Counter-Measure:** ${topTactic.counterMeasure}

**${secondTactic.name}**
- **Trigger:** ${secondTactic.triggerCondition}
${secondTactic.exactProtocol.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n')}

---

#### 5. How to Learn & Master It (Step-by-Step Study Protocol)
- **Learning Methodology:** ${bp.howToLearn.learningPhilosophy[0]}
- **Stage 1 (${bp.howToLearn.studyRoadmap[0].duration}):** ${bp.howToLearn.studyRoadmap[0].focus}
- **Stage 2 (${bp.howToLearn.studyRoadmap[1].duration}):** ${bp.howToLearn.studyRoadmap[1].focus}
- **Daily 80-Min Routine:** ${bp.howToLearn.dailySchedule.map((d) => `${d.timeBlock} (${d.activity})`).join(' → ')}`;
}
