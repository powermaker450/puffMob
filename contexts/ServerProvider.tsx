import { ModelsGetServerResponse } from "@/util/models";
import { ReactNode, createContext, useContext, useState } from "react";

interface ServerContextProps {
  children: ReactNode;
}

interface ServerContextData {
  data?: ModelsGetServerResponse;
  setData: React.Dispatch<
    React.SetStateAction<ModelsGetServerResponse | undefined>
  >;
}

const ServerContext = createContext<ServerContextData | undefined>(undefined);

export const ServerProvider = ({ children }: ServerContextProps) => {
  const [data, setData] = useState<ModelsGetServerResponse>();

  return (
    <ServerContext.Provider value={{ data, setData }}>
      {children}
    </ServerContext.Provider>
  );
};

export const useServer = () => {
  const context = useContext(ServerContext);

  if (context === undefined) {
    throw new Error("useServer must be called within a ServerContext");
  }

  return context;
};
