import React, { useState } from "react";
import DashboardFilters from "./filters";
import { CapacityIndicators } from "./capacidade";
import { BacklogMetrics } from "./backlog/backlog";
import { Spacer, Tabs, Tab, Button, useDisclosure } from "@nextui-org/react";
import { TramitesMetrics } from "./tramites/tramites";
import { ReabertosMetrics } from "./reabertos/reabertos";
import { SolutionTimeMetrics } from "./tempoSolucao";
import { CustomerSatisfactionMetrics } from "./satisfacao";
import { FirstResponseData, FirstResponseMetrics } from "./primeiraResposta";
import { Superior24hData, Superior24hMetrics } from "./ticketsAbertos";
import { HouseIcon } from "../../icons/breadcrumb/house-icon";
import { UsersIcon } from "../../icons/breadcrumb/users-icon";
import Link from "next/link";
import DefaultLayout from "../../../layouts/default";

interface CapacityData {
  novos: number;
  resolvidos: number;
  diferenca: number;
  diferencaCapacidade: number;
  porcentagemCapacidade: number;
  porcentagemSquad: number;
  porcentagemTime: number;
  porcentagemOwnerEmRelacaoEquipe: number;
}

interface BacklogData {
  ongoing: number;
    superior30d: number;
    percentSuperior: string;
    percentSquad: string;
    percentTime: string;
}

interface Indicadores {
  capacidade?: CapacityData;
  backlog?: BacklogData;
  tramites?: TramitesData;
  reabertos?: ReabertosData;
  solutionTime?: SolutionTimeData;
  customerSatisfaction?: CustomerSatisfactionData;
  firstResponse?: FirstResponseData; // Adicionado aqui
  superior24h?: Superior24hData;
}

interface TramitesData {
  [key: string]: {
    "Média real": number;
    "Desvio Padrão": number;
  };
}

interface ReabertosData {
  analystReopenedCount: number;
  teamReopenedCount: number;
}

interface SolutionTimeData {
  averageSolutionTimeInDays: string;
  averageSolutionTimeInWorkingHours: string;
  differenceFromPreviousMonthInDays: string;
}

interface CustomerSatisfactionData {
  nps: { satisfaction: number; responsesCount: number };
  solutionQuality: { satisfaction: number; responsesCount: number };
  solutionTime: { satisfaction: number; responsesCount: number };
}

const initialState: Indicadores = {
  capacidade: {
    novos: 0,
    resolvidos: 0,
    diferenca: 0,
    diferencaCapacidade: 0,
    porcentagemCapacidade: 0,
    porcentagemSquad: 0,
    porcentagemTime: 0,
    porcentagemOwnerEmRelacaoEquipe: 0,
  },
  tramites: {
    Dúvida: {
      "Média real": 0,
      "Desvio Padrão": 0,
    },
    Problema: {
      "Média real": 0,
      "Desvio Padrão": 0,
    },
    Tarefa: {
      "Média real": 0,
      "Desvio Padrão": 0,
    },
  },
  reabertos: {
    analystReopenedCount: 0,
    teamReopenedCount: 0,
  },
  solutionTime: {
    averageSolutionTimeInDays: "0",
    averageSolutionTimeInWorkingHours: "00:00:00",
    differenceFromPreviousMonthInDays: "0",
  },
  customerSatisfaction: {
    // Adicionado aqui
    nps: {
      satisfaction: 0,
      responsesCount: 0,
    },
    solutionQuality: {
      satisfaction: 0,
      responsesCount: 0,
    },
    solutionTime: {
      satisfaction: 0,
      responsesCount: 0,
    },
  },
  firstResponse: {
    averageFirstResponseTimeInSeconds: 0,
    averageFirstResponseTimeFormatted: "00:00:00",
    differenceFromPreviousMonthInSeconds: 0,
    differenceFromPreviousMonthFormatted: "00:00:00",
  },
  superior24h: {
    countTicketsOpenBeyond24WorkingHours: 0,
    ticketIdsOpenBeyond24WorkingHours: [],
  },
};

const IndicadoresPage: React.FC = () => {
  const [indicadoresCapacidade, setIndicadoresCapacidade] =
    useState<CapacityData | null>(initialState.capacidade || null);
  const [indicadoresBacklog, setIndicadoresBacklog] =
    useState<BacklogData | null>(initialState.backlog || null);
  const [indicadoresTramites, setIndicadoresTramites] =
    useState<TramitesData | null>(initialState.tramites || null);
  const [indicadoresReabertos, setIndicadoresReabertos] =
    useState<ReabertosData | null>(initialState.reabertos || null);
  const { isOpen, onOpen, onClose: close } = useDisclosure();
  const [indicadoresSolutionTime, setIndicadoresSolutionTime] =
    useState<SolutionTimeData | null>(null);
  const [indicadoresSatisfacao, setIndicadoresSatisfacao] =
    useState<CustomerSatisfactionData | null>(null);
  const [indicadoresFirstResponse, setIndicadoresFirstResponse] = useState<
    FirstResponseData | undefined
  >();
  const [indicadoresSuperior24h, setIndicadoresSuperior24h] = useState<
    Superior24hData | undefined
  >();

  const topContent = (
    <>
      <div className="flex flex-col gap-4 ml-1 mr-1">
        <ul className="flex">
          <li className="flex gap-2">
            <HouseIcon />
            <Link color="foreground" href={"/"}>
              <span>Início</span>
            </Link>
            <span> / </span>
          </li>
          <li className="flex  gap-2">
            <UsersIcon /> <span>Indicadores</span>
          </li>
        </ul>
        <h3 className="text-justify font-semibold">
          Indicadores de performance
        </h3>
        <p className="text-small text-default-400">
          Gestão dos indicadores de performance extraidos da Movidesk
        </p>
      </div>
      <Spacer y={2} />
    </>
  );

  return (
    <DefaultLayout>
    <div className="flex flex-col gap-4 px-4 md:px-8 lg:px-4 max-w-none mx-auto">
      {topContent}

      <DashboardFilters
        onOpenModal={onOpen}
        onSetIndicadores={(data: Indicadores) => {
          if (data.capacidade) {
            setIndicadoresCapacidade(data.capacidade);
          }
          if (data.backlog) {
            setIndicadoresBacklog(data.backlog);
          }
          if (data.tramites) {
            setIndicadoresTramites(data.tramites);
          }
          if (data.reabertos) {
            setIndicadoresReabertos(data.reabertos);
          }
          if (data.solutionTime) {
            setIndicadoresSolutionTime(data.solutionTime);
          }
          if (data.customerSatisfaction) {
            setIndicadoresSatisfacao(data.customerSatisfaction);
          }
          if (data.firstResponse) {
            setIndicadoresFirstResponse(data.firstResponse);
          }
          if (data.superior24h) {
            setIndicadoresSuperior24h(data.superior24h);
          }
        }}
      />

      <Tabs
        color="secondary"
        aria-label="Options"
        variant="underlined"
        size="lg"
        className="flex flex-wrap justify-center items-center flex-grow md:text-lg"
      >
        {" "}
        <Tab
          title={
            <div className="flex items-center space-x-2">
              <span className="md:hidden lg:inline">Capacidade</span>
            </div>
          }
        >
          {indicadoresCapacidade && (
            <CapacityIndicators data={indicadoresCapacidade} />
          )}
        </Tab>
        <Tab
          title={
            <div className="flex items-center space-x-2">
              <span>Backlog</span>
            </div>
          }
        >
{indicadoresBacklog && <BacklogMetrics data={indicadoresBacklog} />}
        </Tab>
        <Tab
          title={
            <div className="flex items-center space-x-2">
              <span>Trâmites</span>
            </div>
          }
        >
          {indicadoresTramites && (
            <TramitesMetrics data={indicadoresTramites} />
          )}
        </Tab>
        <Tab
          title={
            <div className="flex items-center space-x-2">
              <span>Reabertos</span>
            </div>
          }
        >
          {indicadoresReabertos && (
            <ReabertosMetrics data={indicadoresReabertos} />
          )}
        </Tab>
        <Tab
          title={
            <div className="flex items-center space-x-2">
              <span>Solução</span>
            </div>
          }
        >
          {indicadoresSolutionTime && (
            <SolutionTimeMetrics data={indicadoresSolutionTime} />
          )}
        </Tab>
        <Tab
          title={
            <div className="flex items-center space-x-2">
              <span>Respostas</span>
            </div>
          }
        >
          {indicadoresFirstResponse && (
            <FirstResponseMetrics data={indicadoresFirstResponse} />
          )}
        </Tab>
        <Tab
          title={
            <div className="flex items-center space-x-2">
              <span>Satisfação</span>
            </div>
          }
        >
          {indicadoresSatisfacao && (
            <CustomerSatisfactionMetrics data={indicadoresSatisfacao} />
          )}
        </Tab>
        <Tab
          title={
            <div className="flex items-center space-x-2">
              <span>Superior a 24h</span>
            </div>
          }
        >
          {indicadoresSuperior24h && (
            <Superior24hMetrics data={indicadoresSuperior24h} />
          )}
        </Tab>
      </Tabs>
    </div>
    </DefaultLayout>
  );
};

export default IndicadoresPage;
