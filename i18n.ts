
export type Language = 'en' | 'zh';

export const translations = {
  en: {
    // Sidebar
    newThread: "New Thread",
    history: "History",
    cognitiveContext: "Cognitive Context",
    ragRetrieval: "RAG Retrieval",
    stanceMemory: "Stance Memory",
    knowledgeBase: "Knowledge Base",
    manageKnowledge: "Manage Knowledge",
    thoughtLibrary: "Thought Library",
    viewStanceArchive: "View Stance Archive",
    adminBackend: "Admin Backend",
    resourceUsage: "Resource Usage",
    signOut: "Sign Out",
    showWorkspace: "Show Workspace",
    minimizeTools: "Minimize Tools",
    expandTools: "Expand Tools",
    collapseTools: "Collapse Tools",
    
    // Auth
    login: "Login",
    register: "Register",
    guest: "Guest",
    username: "Username",
    password: "Password",
    email: "Institutional or Personal Email",
    getCode: "GET CODE",
    verificationCode: "6-Digit Verification Code",
    startInvestigation: "Start Investigation",
    verifyAndJoin: "Verify & Join Research",
    invalidCredentials: "Invalid credentials",
    allFieldsRequired: "All fields required for registration",
    limitReached: "Limit reached for this IP. Please register.",
    
    // Chat
    investigationThread: "Investigation Thread",
    systemStandby: "System Standby",
    agentInProgress: "Agent interaction in progress...",
    inputPlaceholder: "Analyze logical structure or philosophical background...",
    persistenceNode: "Persistence Node",
    chatMode: "Chat",
    paperReviewMode: "Paper Review",
    
    // Sidebar Right
    knowledgeWorkspace: "Knowledge Workspace",
    contextualCards: "Contextual Cards",
    noContextualCards: "No contextual cards generated for this session yet. Start investigating...",
    extractedStance: "Extracted Stance",
    philosophicalRef: "Philosophical Ref",
    
    // File Manager
    manageResearchData: "Manage your indexed documents and research data",
    noFilesIndexed: "No files indexed yet",
    knowledgeEngineStandby: "Knowledge engine standby",
    indexed: "Indexed",
    pending: "Pending",
    added: "Added",
    totalStorage: "Total Storage",
    documents: "Documents",
    vectorStore: "Vector Store",
    chunks: "Chunks",

    // Admin
    adminDashboard: "System Administration",
    manageAccess: "Manage user access and resource quotas",
    totalUsers: "Total Users",
    activeIps: "Active IPs",
    userRegistry: "User Registry",
    id: "ID",
    role: "Role",
    quota: "Quota",
    used: "Used",
    actions: "Actions",

    // Profile
    userProfile: "User Profile",
    accountDetails: "Your account details and security settings",
    personalInfo: "Personal Information",
    accountType: "Account Type",
    registeredOn: "Registered On",
    security: "Security",
    dangerZone: "Danger Zone",
    deleteAccount: "Delete Account",
    deleteWarning: "This action is permanent and cannot be undone."
  },
  zh: {
    // Sidebar
    newThread: "新建线程",
    history: "历史记录",
    cognitiveContext: "认知上下文",
    ragRetrieval: "RAG 检索",
    stanceMemory: "立场记忆",
    knowledgeBase: "知识库",
    manageKnowledge: "管理知识",
    thoughtLibrary: "思想库",
    viewStanceArchive: "查看立场存档",
    adminBackend: "管理后台",
    resourceUsage: "资源使用情况",
    signOut: "退出登录",
    showWorkspace: "显示工作区",
    minimizeTools: "折叠工具栏",
    expandTools: "展开工具栏",
    collapseTools: "收起工具栏",
    
    // Auth
    login: "登录",
    register: "注册",
    guest: "访客",
    username: "用户名",
    password: "密码",
    email: "机构或个人邮箱",
    getCode: "获取验证码",
    verificationCode: "6位验证码",
    startInvestigation: "开始调查",
    verifyAndJoin: "验证并加入研究",
    invalidCredentials: "凭据无效",
    allFieldsRequired: "注册需要填写所有字段",
    limitReached: "此 IP 已达上限，请注册。",
    
    // Chat
    investigationThread: "调查线程",
    systemStandby: "系统待命",
    agentInProgress: "智能体交互中...",
    inputPlaceholder: "分析逻辑结构或哲学背景...",
    persistenceNode: "持久化节点",
    chatMode: "聊天模式",
    paperReviewMode: "论文评审模式",
    
    // Sidebar Right
    knowledgeWorkspace: "知识工作区",
    contextualCards: "上下文卡片",
    noContextualCards: "此会话尚未生成上下文卡片。请开始调查...",
    extractedStance: "提取的立场",
    philosophicalRef: "哲学参考",
    
    // File Manager
    manageResearchData: "管理您的索引文档和研究数据",
    noFilesIndexed: "尚未索引文件",
    knowledgeEngineStandby: "知识引擎待命",
    indexed: "已索引",
    pending: "处理中",
    added: "添加于",
    totalStorage: "总存储",
    documents: "文档",
    vectorStore: "向量库",
    chunks: "分块",

    // Admin
    adminDashboard: "系统管理",
    manageAccess: "管理用户访问和资源配额",
    totalUsers: "总用户数",
    activeIps: "活跃 IP",
    userRegistry: "用户注册表",
    id: "ID",
    role: "角色",
    quota: "配额",
    used: "已用",
    actions: "操作",

    // Profile
    userProfile: "用户概览",
    accountDetails: "您的账户详情和安全设置",
    personalInfo: "个人信息",
    accountType: "账户类型",
    registeredOn: "注册日期",
    security: "安全",
    dangerZone: "危险区域",
    deleteAccount: "注销账户",
    deleteWarning: "此操作是永久性的，无法撤销。"
  }
};
