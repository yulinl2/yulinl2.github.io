// ── DATASET REGISTRY ────────────────────────────────────────────
// The single extension point: adding a dataset = add one object here, touch
// nothing else. Each entry: {id, label, count, color, symbol, desc, arxiv, hf,
// ans(), sol(), solLabel?(), context?(), tags(), filters[], filterDescriptions,
// metaPreview[]}.
// metaPreview: explicit per-dataset native fields shown as header meta-hint.
// Explicit list avoids the heuristic blank-rendering bug (B3).

// tag(): registry-local helper used by the tags() closures below.
export function tag(v,cls){return v?[{l:String(v),c:cls}]:[]}

export const DS = [
  { id:'CMT-Benchmark', label:'CMT-Bench', count:50, color:'#7c3aed', symbol:'Ψ',
    desc:'50 condensed matter theory problems (Hartree-Fock, QMC) — tests LLMs on solid-state physics derivations.',
    arxiv:'2503.01870', hf:'AI4StatMath/CMT-Benchmark',
    ans: r => r.native?.solution, sol: r => null,
    tags: r => tag(r.native?.type,''),
    filters: [{key:'type',label:'Type',get:r=>r.native?.type}],
    filterDescriptions: {
      type: {
        'DMRG':'Density Matrix Renormalization Group — iteratively optimizes a tensor-network (MPS) ansatz; the standard method for 1D strongly-correlated quantum systems',
        'ED':'Exact Diagonalization — numerically diagonalizes the full Hamiltonian matrix; gives exact eigenvalues but cost grows exponentially with system size',
        'HF':'Hartree-Fock — each electron moves in the average field of all others (mean-field); the baseline approximation for many-electron systems',
        'QMC':'Quantum Monte Carlo — stochastic sampling of quantum mechanical expectation values (VMC, DQMC, AFQMC); scales polynomially but has sign-problem issues',
        'PEPS':'Projected Entangled Pair States — 2D tensor network that extends DMRG/MPS to two-dimensional lattice systems',
        'SM':'Slave-particle methods (slave-boson, slave-spin) — decompose correlated electrons into auxiliary particles to enable mean-field treatment of Mott physics',
        'VMC':'Variational Monte Carlo — stochastically minimizes the energy of a parameterized trial wave function; flexible and sign-problem-free',
        'Other':'Computational or analytical methods not listed in the main categories above',
      }
    },
    metaPreview:[]
  },
  { id:'HARDMath', label:'HARDMath', count:1466, color:'#3b82f6', symbol:'∫',
    desc:'1,466 hard applied-math problems — ODEs, integrals, nondimensionalization, and polynomial root-finding.',
    arxiv:'2410.03286', hf:'AI4StatMath/HARDMath',
    ans: r => r.native?.answer_val,
    sol: r => r.native?.solution_excerpt,
    tags: r => [...tag(r.native?.question_type?.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),''), ...tag(r.native?.subset!=='main'?r.native?.subset:null,'dm')],
    filters: [{key:'question_type',label:'Type',get:r=>r.native?.question_type},{key:'subset',label:'Subset',get:r=>r.native?.subset}],
    filterDescriptions: {
      question_type: {
        'ODE':'Ordinary differential equation — find exact or approximate closed-form solutions to first- or higher-order ODEs',
        'integral':'Evaluate a definite or indefinite integral, often requiring substitution, integration by parts, or special functions',
        'nondimensionalization_symbolic':'Identify and express dimensionless groups symbolically by rescaling variables with unknown scale factors',
        'nondimensionalization_numeric':'Compute numerical values of dimensionless parameters after rescaling variables in a concrete system',
        'polynomial_roots':'Find the roots of a polynomial equation using analytical formulas or systematic numerical methods',
        'polynomial_roots_corrections':'Correct or refine a polynomial root-finding result, often adding perturbative or numerical corrections',
      },
      subset: {
        'main':'Primary benchmark split used in the original HARDMath paper (1,060 problems)',
        'mini':'Smaller curated split (366 problems) for faster evaluation',
        'word_problems':'Applied word problems drawn from real-world contexts',
      }
    },
    metaPreview:['question_type']
  },
  { id:'MathTrap-public', label:'MathTrap', count:208, color:'#f97316', symbol:'≠',
    desc:'208 math problems designed with subtle logical traps — exposes LLM reasoning failures.',
    arxiv:'2501.04357', hf:'AI4StatMath/MathTrap',
    ans: r => r.native?.original_solution,
    sol: r => r.native?.human_annotation,
    solLabel: r => 'Trap Analysis',
    context: r => {
      const role=r.native?.triplet_role;
      if(role!=='Trap') return null;
      const orig=r.native?.original_problem_text; if(!orig) return null;
      return {src:r.native?.source_dataset||'',text:orig};
    },
    tags: r => { const role=r.native?.triplet_role; const cls=role==='Original'?'ro':role==='Trap'?'rt':'rh'; return [...tag(role,cls),...tag(r.native?.trap_category,'')]; },
    filters: [{key:'triplet_role',label:'Role',get:r=>r.native?.triplet_role},{key:'trap_category',label:'Category',get:r=>r.native?.trap_category}],
    filterDescriptions: {
      triplet_role: {
        'Original':'The unmodified source problem — baseline before any trap is introduced',
        'Trap':'The source problem modified with a subtle logical error or contradictory condition designed to mislead the solver',
      },
      trap_category: {
        'Direct Contradiction':'A new constraint is added that directly conflicts with an existing condition (e.g. two incompatible numerical values)',
        'Indirect Contradiction':'A modified condition creates an implicit contradiction that requires careful multi-step reasoning to detect',
        'Concept Undefined':'A key term or object referenced in the problem is left undefined or ambiguous, making a unique solution impossible',
        'Missing Condition':'A necessary condition for a unique solution is omitted — the problem is under-determined',
        'Violating Common Sense':'A stated condition is physically or practically impossible in any realistic setting',
      }
    },
    metaPreview:['triplet_role']
  },
  { id:'PRBench', label:'PRBench', count:1100, color:'#14b8a6', symbol:'⚖',
    desc:'1,100 expert-level professional-reasoning problems in finance and legal domains.',
    arxiv:'2504.16228', hf:'AI4StatMath/PRBench',
    ans: r => { const rb=r.native?.rubric_buckets; if(!rb) return 'Open-ended — evaluated against expert rubric.'; try{const a=typeof rb==='string'?JSON.parse(rb):rb; return Array.isArray(a)?a.map((x,i)=>`${i+1}. ${x}`).join('\n'):String(rb);}catch{return String(rb);} },
    sol: r => null,
    tags: r => [...tag(r.native?.field,'')],
    filters: [{key:'field',label:'Field',get:r=>r.native?.field}],
    filterDescriptions: {
      field: {
        'Finance':'Problems in financial analysis, valuation, risk assessment, and investment decision-making',
        'Legal':'Legal reasoning, statutory interpretation, case law analysis, and regulatory compliance problems',
      },
    },
    metaPreview:['field']
  },
  { id:'StatEval-public', label:'StatEval', count:600, color:'#6366f1', symbol:'σ',
    desc:'600 statistics & ML problems across foundational (undergrad) and research (grad+) tiers.',
    arxiv:'2505.19131', hf:'AI4StatMath/StatEval',
    ans: r => r.native?.answer_excerpt,
    sol: r => r.native?.solution_excerpt,
    tags: r => [...tag(r.native?.tier,r.native?.tier==='research'?'dx':''),...tag(r.native?.subject,'')],
    filters: [{key:'tier',label:'Tier',get:r=>r.native?.tier},{key:'level',label:'Level',get:r=>r.native?.level},{key:'subject',label:'Subject',get:r=>r.native?.subject}],
    filterDescriptions: {
      tier: {
        'foundational':'Undergraduate-level foundational statistics — probability, inference, regression, and core methods',
        'research':'Graduate-level and research-grade problems requiring advanced statistical theory or methodology',
      },
      level: {
        'undergraduate':'Problems solvable with standard undergraduate statistics coursework',
        'graduate':'Problems that require graduate-level theory or techniques beyond a standard undergraduate curriculum',
      },
      subject: {
        'machine learning':'Statistical methods applied to learning algorithms: model selection, generalization, bias-variance tradeoff',
        'probability':'Probability theory, distributions, combinatorics, conditional probability, and stochastic processes',
        'statistic':'Classical statistical inference: estimation, hypothesis testing, confidence intervals, regression',
      }
    },
    metaPreview:['tier','level']
  },
  { id:'StatQA-mini', label:'StatQA★', count:1158, color:'#ec4899', symbol:'χ',
    desc:'1,158 real-dataset statistical analysis QA pairs (mini split) — tests practical data analysis skills.',
    arxiv:'2409.17517', hf:'AI4StatMath/StatQA',
    ans: r => { const gt=r.native?.ground_truth_raw; if(!gt) return null; try{const p=typeof gt==='string'?JSON.parse(gt):gt; const out=[]; if(p.methods) out.push('Methods: '+(Array.isArray(p.methods)?p.methods.join(', '):p.methods)); if(p.columns) out.push('Columns: '+(Array.isArray(p.columns)?p.columns.join(', '):p.columns)); if(p.result) out.push('Result: '+p.result); return out.join('\n\n')||JSON.stringify(p,null,2);}catch{return String(gt);} },
    sol: r => null,
    tags: r => [...tag(r.native?.difficulty,r.native?.difficulty==='easy'?'de':'dh'),...tag(r.native?.task,'')],
    filters: [{key:'difficulty',label:'Difficulty',get:r=>r.native?.difficulty},{key:'task',label:'Task',get:r=>r.native?.task}],
    filterDescriptions: {
      difficulty: {
        'easy':'Single-step analysis task on a clean dataset with explicit instructions',
        'hard':'Multi-step or open-ended analysis requiring judgment about which statistical method to apply',
      },
      task: {
        'Contingency Table Test':'Test for independence or association between two categorical variables using a chi-square test',
        'Correlation Analysis':'Measure the strength and direction of a linear relationship between two numerical variables (Pearson r, Spearman ρ)',
        'Descriptive Statistics':'Compute summary statistics: mean, median, variance, standard deviation, quartiles, skewness',
        'Distribution Compliance Test':'Test whether a sample follows a specified probability distribution (e.g., Kolmogorov-Smirnov, Shapiro-Wilk normality test)',
        'Variance Test':'Test for equality of variances across groups (e.g., Levene\'s test, Bartlett\'s test, F-test)',
      }
    },
    metaPreview:['task']
  }
];
