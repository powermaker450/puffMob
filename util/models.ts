/*
 * puffMob: A mobile client for Pufferpanel
 * Copyright (C) 2024 powermaker450
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import PufferpanelSocket from "./PufferpanelSocket";

export interface DaemonFeatures {
  features: string[];
}

export interface FolderDesc {
  isFile: false;
  name: string;
}

export interface FileDesc {
  isFile: true;
  name: string;
  size: number;
  extension: string;
  modifyTime: number;
}

export type MessagesFileDesc = FolderDesc | FileDesc;

export interface ModelsChangeSetting {
  value: object;
}

export interface PanelSettingResponse {
  value: string | boolean;
}

export interface ModelsChangeUserSetting {
  value: string;
}

export interface ModelsClient {
  client_id: string;
  description: string;
  name: string;
}

export interface NewClient {
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
  permissions: PermissionsUpdate;
  server: ModelsServerView;
}

export interface ModelsCreateNode {
  name: string;
  privateHost: string;
  privatePort: number;
  publicHost: string;
  publicPort: number;
  sftpPort: number;
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
  email: string;
  username: string;
  id: number;
  password?: string;
  admin: boolean;
  createServers: boolean;
  deleteServers: boolean;
  deployNodes: boolean;
  editNodes: boolean;
  editServerAdmin: boolean;
  editTemplates: boolean;
  editUsers: boolean;
  panelSettings: boolean;
  viewNodes: boolean;
  viewServers: boolean;
  viewTemplates: boolean;
  viewUsers: boolean;
}

export interface NewUser {
  email: string;
  username: string;
  password: string;
  admin?: boolean;
  createServers?: boolean;
  deleteServers?: boolean;
  deployNodes?: boolean;
  editNodes?: boolean;
  editServerAdmin?: boolean;
  editTemplates?: boolean;
  editUsers?: boolean;
  panelSettings?: boolean;
  viewNodes?: boolean;
  viewServers?: boolean;
  viewTemplates?: boolean;
  viewUsers?: boolean;
}

export interface NewServerUser {
  email: string;
  new: true;
  serverIdentifier: string;
  editServerData: boolean;
  editServerUsers: boolean;
  installServer: boolean;
  putServerFiles: boolean;
  sendServerConsole: boolean;
  sftpServer: boolean;
  startServer: boolean;
  stopServer: boolean;
  viewServerConsole: boolean;
  viewServerFiles: boolean;
  viewServerStats: boolean;
}

export interface PermissionsUpdate {
  username: string;
  email: string;
  serverIdentifier: string;
  editServerData: boolean;
  editServerUsers: boolean;
  installServer: boolean;
  putServerFiles: boolean;
  sendServerConsole: boolean;
  sftpServer: boolean;
  startServer: boolean;
  stopServer: boolean;
  viewServerConsole: boolean;
  viewServerFiles: boolean;
  viewServerStats: boolean;
}

export interface Install {
  type: string;
}

export interface JavaDLCommandData extends Install {
  type: "javadl";
  version: string;
}

export interface ForgeDLCommandData extends Install {
  type: "forgedl";
  version: string;
  target: string;
}

export interface InstallCommandData extends Install {
  type: "command";
  commands: string[];
}

export interface WriteFileCommandData extends Install {
  type: "writefile";
  target: string;
  text: string;
}

export type InstallCommand =
  | Install
  | JavaDLCommandData
  | ForgeDLCommandData
  | InstallCommandData
  | WriteFileCommandData;

export interface ModelsServerCreation {
  data: { [key: string]: PufferpanelVariable };
  display: string;
  environment: SupportedEnv;
  id: string;
  install: InstallCommand[];
  name: string;
  node: number;
  requirements: PufferpanelRequirements;
  run: PufferpanelExecution;
  supportedEnvironments: SupportedEnv[];
  tasks: PufferpanelTask;
  type: string;
  uninstall?: object[];
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
  get: {
    console: () => Promise<PufferpanelServerLogs>;
    data: () => Promise<ServerDataResponse>;
    file: (filename?: string) => Promise<MessagesFileDesc[]>;
    stats: () => Promise<PufferpanelServerStats>;
    users: () => Promise<PermissionsUpdate[]>;
    oauth2: () => Promise<ModelsClient[]>;
  };
  create: {
    serverUser: (email: string, perms: NewServerUser) => Promise<void>;
    oauth2: (client: NewClient) => Promise<ModelsCreatedClient>;
  };
  actions: {
    kill: () => Promise<void>;
    start: () => Promise<void>;
    stop: () => Promise<void>;
    execute: (command: string) => Promise<void>;
    extract: (filename: string) => Promise<void>;
    install: () => Promise<void>;
  };
  edit: {
    name: (newName: string) => Promise<void>;
    user: (email: string, perms: PermissionsUpdate) => Promise<void>;
    data: (serverData: ServerDataResponse) => Promise<void>;
  };
  delete: {
    oauth2: (clientId: string) => Promise<void>;
    user: (userId: string) => Promise<void>;
    file: (filename: string) => Promise<void>;
    serverUser: (email: string) => Promise<void>;
  };
  socket: PufferpanelSocket;
}

export interface ModelsSettingResponse {
  value: object;
}

export interface ModelsSupportedEnv {
  type: string;
}

export interface StandardSupportedEnv extends ModelsSupportedEnv {
  type: "standard";
}

export interface DockerSupportedEnv extends ModelsSupportedEnv {
  type: "docker";
  image: string;
}

export type SupportedEnv =
  | ModelsSupportedEnv
  | StandardSupportedEnv
  | DockerSupportedEnv;

export interface ModelsTemplate {
  data: { [key: string]: PufferpanelVariable };
  display: string;
  environment: SupportedEnv;
  id: string;
  install: InstallCommand[];
  name: string;
  readme: string;
  requirements: PufferpanelRequirements;
  run: PufferpanelExecution;
  supportedEnvironments: SupportedEnv[];
  tasks: PufferpanelTask;
  type: string;
  uninstall?: object[];
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
  users: ModelsPermissionView[];
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

export interface PufferpanelErrorResponse {
  error: {
    code: string;
    metadata?: object;
    msg: string;
  };
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
  environment: SupportedEnv;
  id: string;
  install: InstallCommand[];
  requirements: PufferpanelRequirements;
  run: PufferpanelExecution;
  supportedEnvironments: SupportedEnv[];
  tasks: { [key: string]: PufferpanelTask };
  type: string;
  uninstall?: object[];
}

export interface PufferpanelServerData {
  data: { [key: string]: PufferpanelVariable };
}

export interface PufferpanelServerDataAdmin {
  data: { [key: string]: PufferpanelVariable };
  display: string;
  environment: SupportedEnv;
  id: string;
  install: InstallCommand[];
  requirements: PufferpanelRequirements;
  run: PufferpanelExecution;
  supportedEnvironments: SupportedEnv[];
  tasks: { [key: string]: PufferpanelTask };
  type: string;
  uninstall?: object[];
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

export interface Variable {
  desc: string;
  type: "string" | "" | "integer" | "boolean" | "option";
  display: string;
  required: boolean;
  internal?: boolean;
  userEdit?: boolean;
}

export interface StringVariable extends Variable {
  type: "string" | "";
  value: string;
}

export interface NumberVariable extends Variable {
  type: "integer";
  value: number;
}

export interface BooleanVariable extends Variable {
  type: "boolean";
  value: boolean;
}

export interface OptionVariable extends Variable {
  type: "option";
  options: PufferpanelVariableOption[];
}

export type PufferpanelVariable =
  | StringVariable
  | NumberVariable
  | BooleanVariable
  | OptionVariable;

export interface PufferpanelVariableOption {
  display: string;
  value: object;
}

export interface ResponseEmpty {}

export interface ResponsePaging {
  maxSize: number;
  page: number;
  pageSize: number;
  total: number;
}

export interface ConfigResponse {
  branding: { name: string };
  registrationEnabled: boolean;
  themes: {
    active: string;
    available: string[];
  };
}

export interface ServerDataResponse {
  data: { [key: string]: PufferpanelVariable };
}
