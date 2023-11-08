import { useEffect, useState } from "react";
import { CapacityData } from "./capacidade";
import { BacklogData, BacklogMetrics } from "./backlog/backlog";
import { Button, Select, SelectItem, Input, Spinner } from "@nextui-org/react";
import { ReabertosData } from "./reabertos/reabertos";
import { TramitesData } from "./tramites/tramites";
import { SolutionTimeData } from "./tempoSolucao";
import { CustomerSatisfactionData } from "./satisfacao";
import { FirstResponseData } from "./primeiraResposta";
import { Superior24hData } from "./ticketsAbertos";
import React from "react";
import AlertModal from "../../modal";

const Analistas = [
  "Selecionar Todos",
  "Alessandro Munhoz",
  "André Oliveira",
  "Breno Rezende",
  "Bruno Henrique dos Santos",
  "Cristian Camargo de Souza Andrade",
  "Cristian Vitor Dias",
  "Douglas H Muller Cubas",
  "Fellipe Ribeiro Francisco",
  "Gabriel Elias Pereira Batista",
  "Gabriela Carvalho de Souza",
  "Guilherme dos Santos",
  "Helena Garcia Tavares",
  "Jessica Nass",
  "Jussara Wiemes",
  "Kamila Fernandes Garcia",
  "Nadine Volinger Corrêa",
  "Rodrigo Ritzmann",
  "Wellington Felipe Bernardi",
  "Wesley Buzato Quintiliano",
];

interface Indicadores {
  capacidade?: CapacityData;
  backlog?: BacklogData;
  tramites?: TramitesData;
  reabertos?: ReabertosData;
  solutionTime?: SolutionTimeData;
  customerSatisfaction?: CustomerSatisfactionData;
  firstResponse?: FirstResponseData;
  superior24h?: Superior24hData;
}

interface DashboardFiltersProps {
  onOpenModal: () => void;
  onSetIndicadores: (data: Indicadores) => void;
}

interface AnalistaFilterProps {
  selected: Set<string>;
  onChange: (value: Set<string>) => void;
}


interface PeriodoFilterProps {
  startDate: string | null;
  endDate: string | null;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  dateTouched: { start: boolean; end: boolean }; // Adicione esta linha
  setDateTouched: React.Dispatch<
    React.SetStateAction<{ start: boolean; end: boolean }>
  >; // Adicione esta linha
}

function fetchIndicator(
  endpoint: string,
  startDate: string | null,
  endDate: string | null,
  selectedAnalistas: Set<string> // Replace string | null with Set<string>
) {
  const baseURL = "https://indicators-backend.vercel.app/api/indicators/";

  // Construct the ownerBusinessName parameters
  const ownerBusinessNameParams = Array.from(selectedAnalistas)
    .map((analista) => `ownerBusinessName=${encodeURIComponent(analista)}`)
    .join("&");

  // Construct the final URL
  const url = `${baseURL}${endpoint}?startDate=${startDate}&endDate=${endDate}&${ownerBusinessNameParams}`;

  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json().then((data) => {
      if (!response.ok) {
        const error = (data && data.message) || response.statusText;
        return Promise.reject(error);
      }
      return data;
    });
  });
}

function DashboardFilters({
  onOpenModal,
  onSetIndicadores,
}: DashboardFiltersProps) {
  const [selectedAnalistas, setSelectedAnalistas] = useState<Set<string>>(
    new Set()
  );
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const handleCloseModal = () => {
    setAlertMessage(null);
  };
  const [dateTouched, setDateTouched] = useState<{
    start: boolean;
    end: boolean;
  }>({
    start: false,
    end: false,
  });

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      setAlertMessage("Por favor, selecione as datas de início e fim.");
      return;
    }
    if (selectedAnalistas.size === 0) {  // Check if the set is empty
      setAlertMessage("Por favor, selecione ao menos um analista.");
      return;
    }

    setLoading(true);

    try {
      const capacity = await fetchIndicator(
        "capacity",
        startDate,
        endDate,
        selectedAnalistas
      );
      const backlog = await fetchIndicator(
        "backlog",
        startDate,
        endDate,
        selectedAnalistas
      );
      const tramites = await fetchIndicator(
        "tramites",
        startDate,
        endDate,
        selectedAnalistas
      );
      const reabertos = await fetchIndicator(
        "reopen",
        startDate,
        endDate,
        selectedAnalistas
      );
      const solutionTime = await fetchIndicator(
        "solutiontime",
        startDate,
        endDate,
        selectedAnalistas
      );
      const customerSatisfaction = await fetchIndicator(
        "satisfation",
        startDate,
        endDate,
        selectedAnalistas
      );
      const firstResponse = await fetchIndicator(
        "first",
        startDate,
        endDate,
        selectedAnalistas
      );
      const superior24h = await fetchIndicator(
        "open24h",
        startDate,
        endDate,
        selectedAnalistas
      );

      onSetIndicadores({
        capacidade: capacity,
        backlog: backlog,
        tramites: tramites,
        reabertos: reabertos,
        solutionTime: solutionTime,
        customerSatisfaction: customerSatisfaction,
        firstResponse: firstResponse,
        superior24h: superior24h,
      });
    } catch (error) {
      console.error("Erro ao buscar indicadores:", error);
      setAlertMessage("Erro, valide a capacidade definida para o analista e periodo selecionados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full p-4 overflow-x-hidden">
    <div className="flex flex-row gap-4 ">
        <AlertModal
          isOpen={!!alertMessage}
          onClose={handleCloseModal}
          message={alertMessage || ""}
        />
        <MonthYearFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          setDateTouched={setDateTouched} // Adicione esta linha
          dateTouched={{
            start: false,
            end: false,
          }}
        />
        <AnalistaFilter
          selected={selectedAnalistas}
          onChange={setSelectedAnalistas}
        />
      </div>

      <Button
        size="lg"
        variant="shadow"
        disableRipple
        onClick={handleSubmit}
        className="my-2 bg-gradient-to-r from-purple-950 to-purple-800 text-white hover:from-purple-600 hover:to-purple-800 rounded-md transition-shadow shadow-lg hover:shadow-lg overflow-visible hover:-translate-y-1 px-12 bg-background/30 after:content-[''] after:absolute after:rounded-full after:inset-0 after:bg-background/40 after:z-[-1] after:transition after:!duration-500 hover:after:scale-150 hover:after:opacity-0"
      >
       {loading ? (
          <>
            <Spinner color="white" />
            <span className="ml-2">Carregando dados, por favor aguarde...</span>
          </>
        ) : "Aplicar Filtros"}
      </Button>
    </div>
  );
}

function AnalistaFilter({ selected, onChange }: AnalistaFilterProps) {
  const [touched, setTouched] = React.useState(false);

  const handleSelectionChange = (keys: any) => {
    const selectedSet = new Set(keys as Set<string>);

    // Verificar se "Selecionar Todos" foi selecionado
    if (selectedSet.has("Selecionar Todos")) {
      Analistas.forEach((analista) => selectedSet.add(analista));
      // Remova "Selecionar Todos" do conjunto após adicionar todos os analistas
      selectedSet.delete("Selecionar Todos");
    }

    onChange(selectedSet);  // Notificar o componente pai sobre a alteração
  };

  const isValid = Array.from(selected).some((analista) =>
    Analistas.includes(analista)
  );

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <Select
        label="Selecione um Analista"
        color="secondary"
        selectionMode="multiple"
        placeholder="Selecionar Analista"
        className="max-w-xs"
        size="md"
        variant="bordered"
        errorMessage={
          isValid || !touched ? "" : "Selecione ao menos um analista"
        }
        isInvalid={!isValid && touched}
        onSelectionChange={handleSelectionChange}
        onClose={() => setTouched(true)}
        value={Array.from(selected)}  // Use o valor atual do estado 'selectedAnalistas'
      >
        {Analistas.map((analista) => (
          <SelectItem key={analista} value={analista}>
            {analista}
          </SelectItem>
        ))}
      </Select>
      <p className="text-small text-default-500">
        Analista(s) selecionado(s): {Array.from(selected).join(", ")}
      </p>
    </div>
  );
}



function MonthYearFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  dateTouched,
  setDateTouched,
}: PeriodoFilterProps) {
  const [selectedDates, setSelectedDates] = useState<{
    start: string | null;
    end: string | null;
  }>({
    start: startDate,
    end: endDate,
  });

  const handleStartDateChange = (value: string) => {
    setSelectedDates((prev) => ({ ...prev, start: value }));
    onStartDateChange(value);
  };

  const handleEndDateChange = (value: string) => {
    setSelectedDates((prev) => ({ ...prev, end: value }));
    onEndDateChange(value);
  };

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <div className="flex gap-2">
        <Input
          label="Data inicio"
          color="secondary"
          variant="bordered"
          value={selectedDates.start || ""}
          onChange={(e: { target: { value: string; }; }) => handleStartDateChange(e.target.value)}
          placeholder="Data Inicial"
          type="date"
          size="md"
          onBlur={() => setDateTouched((prev) => ({ ...prev, start: true }))}
          errorMessage={
            dateTouched.start && !selectedDates.start
              ? "Por favor, selecione uma data inicial."
              : selectedDates.start &&
                selectedDates.end &&
                new Date(selectedDates.start) > new Date(selectedDates.end)
              ? "Data inicial não pode ser posterior à data final."
              : ""
          }
        />

        <Input
          label="Data fim"
          color="secondary"
          variant="bordered"
          value={selectedDates.end || ""}
          onChange={(e: { target: { value: string; }; }) => handleEndDateChange(e.target.value)}
          placeholder="Data Final"
          type="date"
          size="md"
          onBlur={() => setDateTouched((prev) => ({ ...prev, end: true }))}
          errorMessage={
            dateTouched.end && !selectedDates.end
              ? "Por favor, selecione uma data final."
              : selectedDates.start &&
                selectedDates.end &&
                new Date(selectedDates.start) > new Date(selectedDates.end)
              ? "Data final não pode ser anterior à data inicial."
              : ""
          }
        />
      </div>
      <p className="text-small text-default-500">
        Período selecionado: {selectedDates.start || "N/D"} até{" "}
        {selectedDates.end || "N/D"}
      </p>
    </div>
  );
}

export default DashboardFilters;
