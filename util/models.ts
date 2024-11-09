export interface DaemonFeatures {
  features: string[];
}

export interface MessagesFileDesc {
  extension: string;
  isFile: boolean;
  modifyTime: number;
  name: string;
  size: number;
}

export interface ModelsChangeSetting {
  value: object;
}

export interface ModelsChangeUserSetting {
  value: string;
}

export interface ModelsClient {
  client_id: string;
  description: string;
  name: string;
}

export interface ModelsCreateServerResponse {
  id: string;
}

export interface ModelsCreatedClient {
  id: string;
  secret: string;
}

export interface ModelsDeployment {
  clientId: string;
  clientSecret: string;
  publicKey: string;
}

export interface ModelsGetServerResponse {
  permissions: ModelsPermissionView;
  server: ModelsServerView;
}

export interface ModelsNodeView {
  id: number;
  isLocal: boolean;
  name: string;
  privateHost: string;
  privatePort: number;
  publicHost: string;
  publicPort: number;
  sftpPort: number;
}

export interface ModelsPermissionView {
  admin: boolean;
  createServers: boolean;
  deleteServers: boolean;
  deployNodes: boolean;
  editNodes: boolean;
  editServerAdmin: boolean;
  editServerData: boolean;
  editServerUsers: boolean;
  editTemplates: boolean;
  editUsers: boolean;
  email: string;
  installServer: boolean;
  panelSettings: boolean;
  putServerFiles: boolean;
  sendServerConsole: boolean;
  serverIdentifier: string;
  sftpServer: boolean;
  startServer: boolean;
  stopServer: boolean;
  username: string;
  viewNodes: string;
  viewServerConsole: boolean;
  viewServerFiles: boolean;
  viewServerStats: string;
  viewServers: boolean;
  viewTemplates: boolean;
  viewUsers: boolean;
}

export interface ModelsServerCreation {
  data: { [key: string]: PufferpanelVariable };
  display: string;
  environment: object;
  id: string;
  install: object[];
  name: string;
  node: number;
  requirements: PufferpanelRequirements;
  run: PufferpanelExecution;
  supportedEnvironments: object[];
  tasks: PufferpanelTask;
  type: string;
  uninstall: object[];
  users: string[];
}

export interface ModelsServerSearchResponse {
  paging: ResponsePaging;
  servers: ModelsServerView[];
}

export interface ModelsServerUserView {
  scopes: string[];
  username: string;
}

export interface ModelsServerView {
  data: { [key: string]: PufferpanelVariable };
  id: string;
  ip: string;
  name: string;
  node: ModelsNodeView;
  nodeId: number;
  port: number;
  type: string;
  users: ModelsServerUserView[];
  running?: boolean;
  getConsole: () => Promise<string>;
  execute: (command: string) => Promise<boolean>;
  kill: () => Promise<boolean>;
  start: () => Promise<boolean>;
  stop: () => Promise<boolean>;
}

export interface ModelsSettingResponse {
  value: object;
}

export interface ModelsSupportedEnv {
  type: string;
  image?: string;
}

export interface ModelsTemplate {
  data: { [key: string]: PufferpanelVariable };
  display: string;
  environment: ModelsSupportedEnv;
  id: string;
  install: object[];
  name: string;
  readme: string;
  requirements: PufferpanelRequirements;
  run: PufferpanelExecution;
  supportedEnvironments: ModelsSupportedEnv[];
  tasks: PufferpanelTask;
  type: string;
  uninstall: object[];
}

export interface ModelsUser {
  otpActive: boolean;
}

export interface ModelsUserSearch {
  email: string;
  page: number;
  pageLimit: number;
  username: string;
}

export interface ModelsUserSearchResponse {
  paging: ResponsePaging;
  users: ModelsServerUserView[];
}

export interface ModelsUserSettingView {
  key: string;
  value: string;
}

export interface ModelsUserView {
  email?: string;
  id?: number;
  newPassword?: string;
  password?: string;
  username?: string;
}

export interface PufferpanelDaemonRunning {
  message: string;
}

export interface PufferpanelError {
  code: string;
  metadata: object;
  msg: string;
}

export interface PufferpanelExecution {
  arguments: string[];
  autorecover: boolean;
  autorestart: boolean;
  autostart: boolean;
  command: string;
  disabled: boolean;
  environmentVars: { [key: string]: string };
  post: object[];
  pre: object[];
  program: string;
  stop: string;
  stopCode: number;
  workingDirectory: string;
}

export interface PufferpanelRequirements {
  arch: string;
  binaries: string[];
  os: string;
}

export interface PufferpanelServer {
  data: { [key: string]: PufferpanelVariable };
  display: string;
  environment: object;
  id: string;
  install: object[];
  requirements: PufferpanelRequirements;
  run: PufferpanelExecution;
  supportedEnvironments: object[];
  tasks: { [key: string]: PufferpanelTask };
  type: string;
  uninstall: object[];
}

export interface PufferpanelServerData {
  data: { [key: string]: PufferpanelVariable };
}

export interface PufferpanelServerDataAdmin {
  data: { [key: string]: PufferpanelVariable };
  display: string;
  environment: object;
  id: string;
  install: object[];
  requirements: PufferpanelRequirements;
  run: PufferpanelExecution;
  supportedEnvironments: object[];
  tasks: { [key: string]: PufferpanelTask };
  type: string;
  uninstall: object[];
}

export interface PufferpanelServerIdResponse {
  id: string;
}

export interface PufferpanelServerLogs {
  epoch: number;
  logs: string;
}

export interface PufferpanelServerRunning {
  running: boolean;
}

export interface PufferpanelServerStats {
  cpu: number;
  memory: number;
}

export interface PufferpanelTask {
  cronSchedule?: string;
  name: string;
  operations: object[];
}

export interface PufferpanelVariable {
  desc: string;
  display: string;
  internal: boolean;
  options: PufferpanelVariableOption[];
  required: boolean;
  type: string;
  userEdit: boolean;
  value: object;
}

export interface PufferpanelVariableOption {
  display: string;
  value: object;
}

export interface ResponseEmpty {}

export interface ResponseError {
  error: PufferpanelError;
}

export interface ResponsePaging {
  maxSize: number;
  page: number;
  pageSize: number;
  total: number;
}
