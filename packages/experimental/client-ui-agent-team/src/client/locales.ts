/** Agent Teams Web dictionaries. */

/** Locale namespace owned by the Agent Teams Web UI. */
export const NS = 'agent-team'

/** Simplified Chinese dictionary and key source. */
export const zh = {
  trigger: '智能体团队',
  loading: '正在加载团队…',
  unavailable: 'Team 暂不可用',
  failure: '团队持久记录无效：{message}',
  empty: '暂无共享任务，可以通过对话创建',
  roster: '成员',
  tasks: '共享任务',
  model: '模型',
  open: '打开成员会话',
  current: '当前会话',
  owner: 'Owner',
  unowned: '未分配',
  blockedBy: '依赖',
  writeScopes: '写入范围',
  ready: '可开始',
  blocked: '被依赖阻塞',
  'task.expand': '展开',
  'task.collapse': '收起',
  'memberStatus.running': '运行中',
  'memberStatus.inactive': '未运行',
  'memberStatus.provisioning': '准备中',
  'memberStatus.failed': '失败',
  'status.pending': '待处理',
  'status.in_progress': '进行中',
  'status.completed': '已完成',
} satisfies Record<string, string>

/** Agent Teams locale key union. */
export type TeamKey = keyof typeof zh

/** English dictionary checked against the Chinese key set. */
export const en = {
  trigger: 'Agent Team',
  loading: 'Loading Team…',
  unavailable: 'Team is unavailable',
  failure: 'Invalid persisted Team record: {message}',
  empty: 'No shared tasks yet. Create them through the conversation.',
  roster: 'Members',
  tasks: 'Shared tasks',
  model: 'Model',
  open: 'Open member conversation',
  current: 'Current chat',
  owner: 'Owner',
  unowned: 'Unowned',
  blockedBy: 'Blocked by',
  writeScopes: 'Write scopes',
  ready: 'Ready',
  blocked: 'Blocked by dependencies',
  'task.expand': 'Show more',
  'task.collapse': 'Show less',
  'memberStatus.running': 'Running',
  'memberStatus.inactive': 'Inactive',
  'memberStatus.provisioning': 'Provisioning',
  'memberStatus.failed': 'Failed',
  'status.pending': 'Pending',
  'status.in_progress': 'In progress',
  'status.completed': 'Completed',
} satisfies Record<TeamKey, string>

/** Traditional Chinese (Taiwan), checked against the existing dictionary keys. */
export const zhTW = {
  'trigger': '代理團隊',
  'loading': '正在載入團隊…',
  'unavailable': 'Team 暫不可用',
  'failure': '團隊持久記錄無效：{message}',
  'empty': '暫無共享任務，可以透過對話建立',
  'roster': '成員',
  'tasks': '共享任務',
  'model': '模型',
  'open': '開啟成員對話',
  'current': '目前對話',
  'owner': 'Owner',
  'unowned': '未分配',
  'blockedBy': '依賴',
  'writeScopes': '寫入范圍',
  'ready': '可開始',
  'blocked': '被依賴阻塞',
  'task.expand': '展開',
  'task.collapse': '收起',
  'memberStatus.running': '執行中',
  'memberStatus.inactive': '未執行',
  'memberStatus.provisioning': '準備中',
  'memberStatus.failed': '失敗',
  'status.pending': '待處理',
  'status.in_progress': '進行中',
  'status.completed': '已完成',
} satisfies Record<keyof typeof zh, string>
