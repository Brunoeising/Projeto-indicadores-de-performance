import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";

interface CapacityModalProps {
  isOpen: boolean;
  onClose: () => void;
  analista: string | null;
  startDate: string | null;
  endDate: string | null;
  capacidadeMinima: number | null;
  capacidadeMaxima: number | null;
  setAnalista: React.Dispatch<React.SetStateAction<string | null>>;
  setMes: React.Dispatch<React.SetStateAction<string | null>>;
  setAno: React.Dispatch<React.SetStateAction<string | null>>;
  setCapacidadeMinima: React.Dispatch<React.SetStateAction<number | null>>;
  setCapacidadeMaxima: React.Dispatch<React.SetStateAction<number | null>>;
}

const Analistas = [
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
  "Wesley Buzato Quintiliano"

];

const CapacityModal: React.FC<CapacityModalProps> = ({ isOpen, onClose }) => {
  const [analista, setAnalista] = useState<string>("");
  const [mes, setMes] = useState<string>(""); // Convertido para string
  const [ano, setAno] = useState<string>(""); // Convertido para string
  const [capacidadeMinima, setCapacidadeMinima] = useState<string>("");
  const [capacidadeMaxima, setCapacidadeMaxima] = useState<string>("");
  
  const handleSave = async () => {
    try {
      const response = await fetch(
        "https://indicators-backend.vercel.app/api/create-capacity",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            analista,
            mes: Number(mes),
            ano: Number(ano),
            capacidadeMinima: Number(capacidadeMinima),
            capacidadeMaxima: Number(capacidadeMaxima),
          }),
        }
      );

      const data = await response.json();

      if (data._id) {
        // Handle successful save, e.g., show a success message
        // Fechar o modal
        onClose();

        // Limpar os campos
        setAnalista("");
        setMes("");
        setAno("");
        setCapacidadeMinima("");
        setCapacidadeMaxima("");

      } else {
        const errorMessage = data.message || `Erro desconhecido ao salvar capacidade. Resposta completa: ${JSON.stringify(data)}`;
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error("Erro ao salvar capacidade:", error);
    }
};



  return (
    <Modal isOpen={isOpen} onClose={onClose} backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Definir Capacidade do Analista
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-default-500 text-small">Analista</label>
              <Select
                value={analista || ""}
                onChange={(e) => setAnalista(e.target.value)}
                placeholder="Selecionar Analista"
              >
                {Analistas.map((a) => (
                  <SelectItem value={a} key={a}>
                    {a}
                  </SelectItem>
                ))}
              </Select>
            </div>
            <Input
              placeholder="Mês"
              value={mes || ""}
              onChange={(e) => setMes(e.target.value)}
            />
            <Input
              placeholder="Ano"
              value={ano || ""}
              onChange={(e) => setAno(e.target.value)}
            />
            <Input
              placeholder="Capacidade Mínima"
              value={capacidadeMinima || ""}
              onChange={(e) => setCapacidadeMinima(e.target.value)}

            />
            <Input
              placeholder="Capacidade Máxima"
              value={capacidadeMaxima || ""}
              onChange={(e) => setCapacidadeMaxima(e.target.value)}
              />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onClick={onClose}>
            Fechar
          </Button>
          <Button color="secondary" onClick={handleSave}>
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CapacityModal;
