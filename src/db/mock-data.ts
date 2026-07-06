// Mock Data for Personal Asset OS
// 个人资产管理系统模拟数据

export interface Holding {
  id: string
  symbol: string
  name: string
  market: string
  quantity: number
  costPrice: number
  currentPrice: number
  stopLossPrice: number
  buyReason: string
  status: 'holding' | 'watching' | 'sold'
  dataGrade: 'L1' | 'L2' | 'L3' | 'L4' | 'L5'
  createdAt: string
  updatedAt: string
}

export interface Account {
  id: string
  name: string
  platform: string
  type: 'brokerage' | 'bank' | 'wallet' | 'other'
  balance: number
  pnl: number
  pnlPercent: number
  status: 'active' | 'inactive' | 'closed'
}

export interface Transaction {
  id: string
  date: string
  type: 'buy' | 'sell' | 'dividend' | 'transfer'
  symbol: string
  price: number
  quantity: number
  amount: number
  fee: number
  reason: string
  discipline: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface Policy {
  id: string
  name: string
  company: string
  policyNumber: string
  insuredPerson: string
  type: 'health' | 'life' | 'accident' | 'critical' | 'property'
  coverageAmount: number
  premium: number
  premiumFrequency: 'monthly' | 'yearly' | 'one-time'
  nextPaymentDate: string
  startDate: string
  endDate: string
  status: 'active' | 'pending' | 'expired' | 'cancelled'
  beneficiary: string
  documents: string[]
}

export interface IP {
  id: string
  title: string
  type: 'software' | 'patent' | 'trademark'
  number: string
  status: 'applied' | 'reviewing' | 'granted' | 'rejected' | 'expired'
  applyDate: string
  grantDate: string | null
  expiryDate: string | null
  owner: string
  description: string
  progress: number
  progressSteps: { date: string; title: string; completed: boolean }[]
}

export interface Certificate {
  id: string
  title: string
  issuer: string
  type: 'certificate' | 'honor' | 'license'
  issueDate: string
  expiryDate: string | null
  level: 'national' | 'provincial' | 'city' | 'organization'
  fileUrl: string
}

export interface GrowthPath {
  id: string
  title: string
  date: string
  type: 'promotion' | 'job-change' | 'certification' | 'achievement' | 'education'
  description: string
  impact: string
}

export interface LearningPlan {
  id: string
  title: string
  category: string
  platform: string
  progress: number
  estimatedHours: number
  completedHours: number
  status: 'in-progress' | 'planned' | 'completed' | 'dropped'
  dueDate: string
  notes: string
}

export interface FamilyMember {
  id: string
  name: string
  relation: string
  birthDate: string
  gender: 'male' | 'female'
  bloodType: string
  height: number
  weight: number
  allergies: string[]
  chronicConditions: string[]
}

export interface HealthRecord {
  id: string
  familyMemberId: string
  date: string
  type: 'checkup' | 'treatment' | 'medication' | 'vaccination'
  indicator: string
  value: string
  unit: string
  normalRange: string
  status: 'normal' | 'attention' | 'abnormal'
  notes: string
}

export interface DocumentItem {
  id: string
  title: string
  category: string
  type: string
  size: string
  uploadedAt: string
  tags: string[]
  fileUrl: string
}

export interface ProjectItem {
  id: string
  name: string
  type: 'personal' | 'work' | 'study' | 'investment'
  status: 'planning' | 'in-progress' | 'completed' | 'paused' | 'cancelled'
  startDate: string
  endDate: string | null
  description: string
  milestones: { title: string; completed: boolean; date: string }[]
  tags: string[]
}

// ==================== Holdings ====================

export const mockHoldings: Holding[] = [
  {
    id: 'h1',
    symbol: 'TSLA',
    name: '特斯拉',
    market: '美股',
    quantity: 50,
    costPrice: 245.60,
    currentPrice: 268.30,
    stopLossPrice: 220.00,
    buyReason: '看好电动汽车和自动驾驶长期发展，FSD技术领先',
    status: 'holding',
    dataGrade: 'L2',
    createdAt: '2025-03-15',
    updatedAt: '2026-07-05',
  },
  {
    id: 'h2',
    symbol: 'MU',
    name: '美光科技',
    market: '美股',
    quantity: 200,
    costPrice: 95.40,
    currentPrice: 102.80,
    stopLossPrice: 88.00,
    buyReason: '存储芯片周期底部，AI拉动HBM需求',
    status: 'holding',
    dataGrade: 'L2',
    createdAt: '2025-06-20',
    updatedAt: '2026-07-05',
  },
  {
    id: 'h3',
    symbol: 'AVGO',
    name: '博通',
    market: '美股',
    quantity: 30,
    costPrice: 1250.00,
    currentPrice: 1420.50,
    stopLossPrice: 1100.00,
    buyReason: 'AI网络芯片龙头，VMware整合协同效应',
    status: 'holding',
    dataGrade: 'L3',
    createdAt: '2025-09-10',
    updatedAt: '2026-07-05',
  },
  {
    id: 'h4',
    symbol: '600519',
    name: '贵州茅台',
    market: 'A股',
    quantity: 100,
    costPrice: 1680.00,
    currentPrice: 1755.00,
    stopLossPrice: 1550.00,
    buyReason: '消费龙头，品牌护城河深厚，股息稳定',
    status: 'holding',
    dataGrade: 'L3',
    createdAt: '2025-01-08',
    updatedAt: '2026-07-05',
  },
  {
    id: 'h5',
    symbol: '0700',
    name: '腾讯控股',
    market: '港股',
    quantity: 300,
    costPrice: 385.00,
    currentPrice: 410.20,
    stopLossPrice: 350.00,
    buyReason: '社交+游戏+金融科技生态，AI赋能增长',
    status: 'holding',
    dataGrade: 'L3',
    createdAt: '2025-04-22',
    updatedAt: '2026-07-05',
  },
]

// ==================== Accounts ====================

export const mockAccounts: Account[] = [
  {
    id: 'a1',
    name: '盈透证券主账户',
    platform: 'Interactive Brokers',
    type: 'brokerage',
    balance: 625400,
    pnl: 48200,
    pnlPercent: 8.35,
    status: 'active',
  },
  {
    id: 'a2',
    name: '招商证券A股',
    platform: '招商证券',
    type: 'brokerage',
    balance: 189200,
    pnl: 7500,
    pnlPercent: 4.13,
    status: 'active',
  },
  {
    id: 'a3',
    name: '工资储蓄卡',
    platform: '招商银行',
    type: 'bank',
    balance: 85600,
    pnl: 0,
    pnlPercent: 0,
    status: 'active',
  },
  {
    id: 'a4',
    name: '支付宝余额宝',
    platform: '支付宝',
    type: 'wallet',
    balance: 35834,
    pnl: 1200,
    pnlPercent: 3.46,
    status: 'active',
  },
]

// ==================== Transactions ====================

export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    date: '2026-06-28',
    type: 'buy',
    symbol: 'TSLA',
    price: 260.50,
    quantity: 10,
    amount: 2605.00,
    fee: 2.60,
    reason: '回调加仓，看好Q3财报',
    discipline: 'good',
  },
  {
    id: 't2',
    date: '2026-06-20',
    type: 'sell',
    symbol: 'MU',
    price: 105.30,
    quantity: 50,
    amount: 5265.00,
    fee: 5.27,
    reason: '部分止盈，降低仓位集中度',
    discipline: 'excellent',
  },
  {
    id: 't3',
    date: '2026-06-15',
    type: 'dividend',
    symbol: '600519',
    price: 0,
    quantity: 0,
    amount: 2591.10,
    fee: 0,
    reason: '现金分红',
    discipline: 'excellent',
  },
  {
    id: 't4',
    date: '2026-06-10',
    type: 'buy',
    symbol: 'AVGO',
    price: 1380.00,
    quantity: 10,
    amount: 13800.00,
    fee: 13.80,
    reason: '财报超预期后追加入场',
    discipline: 'fair',
  },
  {
    id: 't5',
    date: '2026-06-05',
    type: 'transfer',
    symbol: '',
    price: 0,
    quantity: 0,
    amount: 50000.00,
    fee: 0,
    reason: '银行账户转入券商账户',
    discipline: 'excellent',
  },
  {
    id: 't6',
    date: '2026-05-28',
    type: 'sell',
    symbol: 'TSLA',
    price: 275.00,
    quantity: 5,
    amount: 1375.00,
    fee: 1.38,
    reason: '触及目标价，按计划减仓',
    discipline: 'excellent',
  },
  {
    id: 't7',
    date: '2026-05-20',
    type: 'buy',
    symbol: '0700',
    price: 395.00,
    quantity: 100,
    amount: 39500.00,
    fee: 39.50,
    reason: 'AI应用加速，腾讯云受益',
    discipline: 'good',
  },
  {
    id: 't8',
    date: '2026-05-15',
    type: 'buy',
    symbol: 'MU',
    price: 98.00,
    quantity: 50,
    amount: 4900.00,
    fee: 4.90,
    reason: '存储芯片供需改善信号',
    discipline: 'good',
  },
]

// ==================== Policies ====================

export const mockPolicies: Policy[] = [
  {
    id: 'p1',
    name: '平安e生保长期医疗',
    company: '平安健康保险',
    policyNumber: 'PHA-2025-001234',
    insuredPerson: '本人',
    type: 'health',
    coverageAmount: 4000000,
    premium: 538,
    premiumFrequency: 'yearly',
    nextPaymentDate: '2027-03-15',
    startDate: '2025-03-15',
    endDate: '2045-03-14',
    status: 'active',
    beneficiary: '法定',
    documents: ['d1', 'd2'],
  },
  {
    id: 'p2',
    name: '华贵大麦定期寿险',
    company: '华贵人寿',
    policyNumber: 'HGRS-2025-005678',
    insuredPerson: '本人',
    type: 'life',
    coverageAmount: 3000000,
    premium: 2820,
    premiumFrequency: 'yearly',
    nextPaymentDate: '2027-06-01',
    startDate: '2025-06-01',
    endDate: '2055-05-31',
    status: 'active',
    beneficiary: '配偶',
    documents: ['d3'],
  },
  {
    id: 'p3',
    name: '众安尊享e生意外险',
    company: '众安保险',
    policyNumber: 'ZA-2026-000321',
    insuredPerson: '本人',
    type: 'accident',
    coverageAmount: 500000,
    premium: 198,
    premiumFrequency: 'yearly',
    nextPaymentDate: '2027-01-10',
    startDate: '2026-01-10',
    endDate: '2027-01-09',
    status: 'active',
    beneficiary: '法定',
    documents: ['d4'],
  },
  {
    id: 'p4',
    name: '达尔文8号重疾险',
    company: '信泰人寿',
    policyNumber: 'XTRS-2025-009012',
    insuredPerson: '配偶',
    type: 'critical',
    coverageAmount: 500000,
    premium: 6350,
    premiumFrequency: 'yearly',
    nextPaymentDate: '2026-11-20',
    startDate: '2024-11-20',
    endDate: '2054-11-19',
    status: 'active',
    beneficiary: '本人',
    documents: ['d5', 'd6'],
  },
]

// ==================== IPs ====================

export const mockIPs: IP[] = [
  {
    id: 'ip1',
    title: '个人资产管理系统 V1.0',
    type: 'software',
    number: '2026SR0123456',
    status: 'granted',
    applyDate: '2026-01-15',
    grantDate: '2026-04-20',
    expiryDate: '2076-04-19',
    owner: '本人',
    description: '基于React+Node.js的全栈个人资产管理系统',
    progress: 100,
    progressSteps: [
      { date: '2026-01-15', title: '提交申请', completed: true },
      { date: '2026-02-01', title: '受理通知', completed: true },
      { date: '2026-03-10', title: '实质审查', completed: true },
      { date: '2026-04-20', title: '授权公告', completed: true },
    ],
  },
  {
    id: 'ip2',
    title: '一种基于深度学习的资产配置方法',
    type: 'patent',
    number: '2026100987654.3',
    status: 'reviewing',
    applyDate: '2026-02-20',
    grantDate: null,
    expiryDate: null,
    owner: '本人',
    description: '利用深度强化学习优化个人投资组合配置的方法和系统',
    progress: 45,
    progressSteps: [
      { date: '2026-02-20', title: '提交申请', completed: true },
      { date: '2026-03-05', title: '受理通知', completed: true },
      { date: '2026-05-01', title: '实质审查', completed: false },
      { date: '', title: '授权公告', completed: false },
    ],
  },
  {
    id: 'ip3',
    title: '智能投顾助手',
    type: 'trademark',
    number: 'TM-2026-567890',
    status: 'applied',
    applyDate: '2026-05-10',
    grantDate: null,
    expiryDate: null,
    owner: '本人',
    description: '第9类、第42类商标注册申请',
    progress: 20,
    progressSteps: [
      { date: '2026-05-10', title: '提交申请', completed: true },
      { date: '', title: '形式审查', completed: false },
      { date: '', title: '实质审查', completed: false },
      { date: '', title: '初审公告', completed: false },
      { date: '', title: '注册公告', completed: false },
    ],
  },
  {
    id: 'ip4',
    title: '理财规划数据分析平台',
    type: 'software',
    number: '2025SR0765432',
    status: 'granted',
    applyDate: '2025-08-15',
    grantDate: '2025-11-10',
    expiryDate: '2075-11-09',
    owner: '本人',
    description: '面向个人用户的理财数据分析和可视化平台',
    progress: 100,
    progressSteps: [
      { date: '2025-08-15', title: '提交申请', completed: true },
      { date: '2025-09-01', title: '受理通知', completed: true },
      { date: '2025-10-15', title: '实质审查', completed: true },
      { date: '2025-11-10', title: '授权公告', completed: true },
    ],
  },
  {
    id: 'ip5',
    title: 'FinBrain 金融知识图谱',
    type: 'software',
    number: '2026SR0456789',
    status: 'applied',
    applyDate: '2026-04-05',
    grantDate: null,
    expiryDate: null,
    owner: '本人',
    description: '基于知识图谱的金融信息检索与分析系统',
    progress: 60,
    progressSteps: [
      { date: '2026-04-05', title: '提交申请', completed: true },
      { date: '2026-04-20', title: '受理通知', completed: true },
      { date: '2026-06-01', title: '实质审查', completed: false },
      { date: '', title: '授权公告', completed: false },
    ],
  },
]

// ==================== Certificates ====================

export const mockCertificates: Certificate[] = [
  {
    id: 'c1',
    title: 'CFA Level II',
    issuer: 'CFA Institute',
    type: 'certificate',
    issueDate: '2025-08-20',
    expiryDate: null,
    level: 'national',
    fileUrl: '/certificates/cfa-l2.pdf',
  },
  {
    id: 'c2',
    title: '高级软件工程师',
    issuer: '工信部',
    type: 'certificate',
    issueDate: '2024-12-15',
    expiryDate: null,
    level: 'national',
    fileUrl: '/certificates/senior-se.pdf',
  },
  {
    id: 'c3',
    title: '2025年度优秀开源贡献者',
    issuer: 'GitHub',
    type: 'honor',
    issueDate: '2026-01-10',
    expiryDate: null,
    level: 'organization',
    fileUrl: '/certificates/github-2025.pdf',
  },
  {
    id: 'c4',
    title: 'AWS Solutions Architect',
    issuer: 'Amazon Web Services',
    type: 'certificate',
    issueDate: '2025-06-15',
    expiryDate: '2028-06-14',
    level: 'national',
    fileUrl: '/certificates/aws-sa.pdf',
  },
  {
    id: 'c5',
    title: '市级科技创新先进个人',
    issuer: '上海市科委',
    type: 'honor',
    issueDate: '2025-05-01',
    expiryDate: null,
    level: 'city',
    fileUrl: '/certificates/shanghai-tech.pdf',
  },
]

// ==================== Growth Paths ====================

export const mockGrowthPaths: GrowthPath[] = [
  {
    id: 'g1',
    title: '晋升为高级技术经理',
    date: '2026-03-01',
    type: 'promotion',
    description: '负责带领10人技术团队，统筹3个核心产品线',
    impact: '年收入提升40%，管理范围扩大',
  },
  {
    id: 'g2',
    title: '完成CFA二级考试',
    date: '2025-08-20',
    type: 'certification',
    description: '通过CFA Level II考试，金融专业知识进一步深化',
    impact: '投资分析能力显著提升',
  },
  {
    id: 'g3',
    title: '加入头部科技公司',
    date: '2024-06-15',
    type: 'job-change',
    description: '从传统软件公司加入头部互联网科技公司',
    impact: '技术栈升级，个人品牌建立',
  },
  {
    id: 'g4',
    title: '开源项目Star突破1000',
    date: '2025-11-10',
    type: 'achievement',
    description: '个人开源项目在GitHub上获得超过1000个Star',
    impact: '社区影响力扩大，获得行业认可',
  },
  {
    id: 'g5',
    title: '获得计算机科学硕士学位',
    date: '2023-06-30',
    type: 'education',
    description: '上海交通大学计算机科学与技术硕士学位',
    impact: '理论基础夯实，职业发展加速',
  },
]

// ==================== Learning Plans ====================

export const mockLearningPlans: LearningPlan[] = [
  {
    id: 'l1',
    title: 'CFA Level III 备考',
    category: '金融考证',
    platform: 'Kaplan Schweser',
    progress: 35,
    estimatedHours: 300,
    completedHours: 105,
    status: 'in-progress',
    dueDate: '2027-02-15',
    notes: '每周至少学习15小时，重点攻克Portfolio Management',
  },
  {
    id: 'l2',
    title: 'System Design 系统设计',
    category: '技术能力',
    platform: 'Educative.io',
    progress: 60,
    estimatedHours: 80,
    completedHours: 48,
    status: 'in-progress',
    dueDate: '2026-09-30',
    notes: '完成Grokking the System Design Interview全部课程',
  },
  {
    id: 'l3',
    title: 'AI/ML入门',
    category: '技术能力',
    platform: 'Coursera',
    progress: 25,
    estimatedHours: 120,
    completedHours: 30,
    status: 'in-progress',
    dueDate: '2026-12-31',
    notes: 'Andrew Ng Machine Learning Specialization',
  },
  {
    id: 'l4',
    title: '税务规划与财富传承',
    category: '财务知识',
    platform: '得到APP',
    progress: 80,
    estimatedHours: 40,
    completedHours: 32,
    status: 'in-progress',
    dueDate: '2026-08-15',
    notes: '学习中国税法基础及家族财富管理',
  },
  {
    id: 'l5',
    title: '公共演讲与表达',
    category: '软技能',
    platform: '线下培训',
    progress: 100,
    estimatedHours: 30,
    completedHours: 30,
    status: 'completed',
    dueDate: '2026-05-30',
    notes: '完成Toastmasters 10次演讲',
  },
  {
    id: 'l6',
    title: '日语N3备考',
    category: '语言学习',
    platform: 'Duolingo + 教材',
    progress: 0,
    estimatedHours: 200,
    completedHours: 0,
    status: 'planned',
    dueDate: '2027-06-30',
    notes: '计划明年上半年开始系统学习',
  },
]

// ==================== Family Members ====================

export const mockFamilyMembers: FamilyMember[] = [
  {
    id: 'f1',
    name: '张三',
    relation: '本人',
    birthDate: '1990-05-15',
    gender: 'male',
    bloodType: 'A',
    height: 175,
    weight: 72,
    allergies: ['青霉素'],
    chronicConditions: ['轻度脂肪肝'],
  },
  {
    id: 'f2',
    name: '李梅',
    relation: '配偶',
    birthDate: '1992-08-22',
    gender: 'female',
    bloodType: 'B',
    height: 163,
    weight: 55,
    allergies: [],
    chronicConditions: [],
  },
  {
    id: 'f3',
    name: '张小明',
    relation: '子女',
    birthDate: '2020-03-10',
    gender: 'male',
    bloodType: 'AB',
    height: 115,
    weight: 20,
    allergies: ['花粉'],
    chronicConditions: [],
  },
  {
    id: 'f4',
    name: '张建国',
    relation: '父亲',
    birthDate: '1962-11-03',
    gender: 'male',
    bloodType: 'O',
    height: 170,
    weight: 75,
    allergies: [],
    chronicConditions: ['高血压', '2型糖尿病'],
  },
]

// ==================== Health Records ====================

export const mockHealthRecords: HealthRecord[] = [
  {
    id: 'hr1',
    familyMemberId: 'f1',
    date: '2026-06-15',
    type: 'checkup',
    indicator: '甘油三酯',
    value: '1.9',
    unit: 'mmol/L',
    normalRange: '0.45-1.70',
    status: 'attention',
    notes: '略高于正常范围，需控制饮食',
  },
  {
    id: 'hr2',
    familyMemberId: 'f1',
    date: '2026-06-15',
    type: 'checkup',
    indicator: '空腹血糖',
    value: '5.3',
    unit: 'mmol/L',
    normalRange: '3.9-6.1',
    status: 'normal',
    notes: '正常',
  },
  {
    id: 'hr3',
    familyMemberId: 'f2',
    date: '2026-06-10',
    type: 'checkup',
    indicator: '血红蛋白',
    value: '128',
    unit: 'g/L',
    normalRange: '115-150',
    status: 'normal',
    notes: '正常',
  },
  {
    id: 'hr4',
    familyMemberId: 'f3',
    date: '2026-06-20',
    type: 'vaccination',
    indicator: '百白破疫苗',
    value: '第4剂',
    unit: '',
    normalRange: '',
    status: 'normal',
    notes: '按计划接种',
  },
  {
    id: 'hr5',
    familyMemberId: 'f4',
    date: '2026-05-20',
    type: 'checkup',
    indicator: '血压',
    value: '145/92',
    unit: 'mmHg',
    normalRange: '<140/90',
    status: 'abnormal',
    notes: '需加大降压药剂量，复诊调整',
  },
  {
    id: 'hr6',
    familyMemberId: 'f4',
    date: '2026-05-20',
    type: 'checkup',
    indicator: '糖化血红蛋白',
    value: '7.2',
    unit: '%',
    normalRange: '<6.5',
    status: 'abnormal',
    notes: '血糖控制不理想，需调整方案',
  },
]

// ==================== Documents ====================

export const mockDocuments: DocumentItem[] = [
  {
    id: 'd1',
    title: '平安e生保保单合同',
    category: '保险文档',
    type: 'PDF',
    size: '2.3 MB',
    uploadedAt: '2025-03-15',
    tags: ['保险', '医疗险', '平安'],
    fileUrl: '/docs/pha-2025.pdf',
  },
  {
    id: 'd2',
    title: '2025年度体检报告',
    category: '健康档案',
    type: 'PDF',
    size: '5.1 MB',
    uploadedAt: '2025-07-10',
    tags: ['体检', '年度', '健康'],
    fileUrl: '/docs/checkup-2025.pdf',
  },
  {
    id: 'd3',
    title: '劳动合同',
    category: '工作文件',
    type: 'PDF',
    size: '1.2 MB',
    uploadedAt: '2024-06-15',
    tags: ['合同', '工作', '法律'],
    fileUrl: '/docs/contract.pdf',
  },
  {
    id: 'd4',
    title: '个人简历_2026',
    category: '工作文件',
    type: 'DOCX',
    size: '0.5 MB',
    uploadedAt: '2026-01-10',
    tags: ['简历', '求职'],
    fileUrl: '/docs/resume-2026.docx',
  },
  {
    id: 'd5',
    title: '2025年度个税申报表',
    category: '税务文档',
    type: 'XLSX',
    size: '0.8 MB',
    uploadedAt: '2026-03-15',
    tags: ['税务', '个税', '年度'],
    fileUrl: '/docs/tax-2025.xlsx',
  },
  {
    id: 'd6',
    title: '房产证',
    category: '资产证明',
    type: 'PDF',
    size: '3.2 MB',
    uploadedAt: '2023-10-20',
    tags: ['房产', '资产', '法律'],
    fileUrl: '/docs/property.pdf',
  },
  {
    id: 'd7',
    title: 'CFA二级证书',
    category: '证书荣誉',
    type: 'PDF',
    size: '0.3 MB',
    uploadedAt: '2025-08-25',
    tags: ['证书', 'CFA', '金融'],
    fileUrl: '/docs/cfa-l2-cert.pdf',
  },
]

// ==================== Projects ====================

export const mockProjects: ProjectItem[] = [
  {
    id: 'pj1',
    name: '个人资产管理系统开发',
    type: 'personal',
    status: 'in-progress',
    startDate: '2026-01-05',
    endDate: null,
    description: '构建全栈个人资产跟踪与管理平台，集成金融、保险、IP等模块',
    milestones: [
      { title: '需求分析与设计', completed: true, date: '2026-01-20' },
      { title: '数据库设计与搭建', completed: true, date: '2026-02-10' },
      { title: '核心模块开发', completed: true, date: '2026-05-15' },
      { title: 'UI/UX优化', completed: false, date: '2026-07-30' },
      { title: '上线部署', completed: false, date: '2026-08-15' },
    ],
    tags: ['全栈', 'React', 'TypeScript'],
  },
  {
    id: 'pj2',
    name: '公司智能运维平台升级',
    type: 'work',
    status: 'in-progress',
    startDate: '2026-03-01',
    endDate: '2026-09-30',
    description: '将现有运维平台升级为AI辅助智能运维系统',
    milestones: [
      { title: '技术选型', completed: true, date: '2026-03-15' },
      { title: '原型开发', completed: true, date: '2026-05-01' },
      { title: '内部测试', completed: false, date: '2026-07-15' },
      { title: '灰度发布', completed: false, date: '2026-08-30' },
      { title: '全量上线', completed: false, date: '2026-09-30' },
    ],
    tags: ['工作', 'AI', '运维'],
  },
  {
    id: 'pj3',
    name: 'CFA三级学习计划',
    type: 'study',
    status: 'in-progress',
    startDate: '2026-05-01',
    endDate: '2027-02-15',
    description: '系统备考CFA Level III，目标一次通过',
    milestones: [
      { title: '报名确认', completed: true, date: '2026-05-01' },
      { title: '第一轮学习', completed: false, date: '2026-09-30' },
      { title: '第二轮复习', completed: false, date: '2026-12-31' },
      { title: '模拟考试', completed: false, date: '2027-01-31' },
      { title: '正式考试', completed: false, date: '2027-02-15' },
    ],
    tags: ['学习', 'CFA', '考试'],
  },
  {
    id: 'pj4',
    name: '量化交易策略研究',
    type: 'investment',
    status: 'planning',
    startDate: '2026-07-15',
    endDate: null,
    description: '研究基于多因子模型的A股量化交易策略',
    milestones: [
      { title: '文献调研', completed: false, date: '2026-07-31' },
      { title: '数据采集', completed: false, date: '2026-08-31' },
      { title: '策略开发', completed: false, date: '2026-10-31' },
      { title: '回测验证', completed: false, date: '2026-11-30' },
    ],
    tags: ['量化', '投资', 'Python'],
  },
]
