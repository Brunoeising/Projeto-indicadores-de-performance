import React, { useState, useEffect, ReactNode } from "react";
import {
  Spacer,
  Accordion,
  AccordionItem,
  Code,
  Progress,
  Tooltip,
  Card,
  CardBody,
  Link,
} from "@nextui-org/react";
import DefaultLayout from "../../../layouts/default";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import { UsersIcon } from "@/components/icons/breadcrumb/users-icon";

const MOVIDESK_API_URL = process.env.NEXT_PUBLIC_MOVIDESK_API_URL;
const MOVIDESK_TOKEN = process.env.NEXT_PUBLIC_MOVIDESK_TOKEN;

export default function MovideskTickets() {
  const [newTickets, setNewTickets] = useState([]);
  const [openTickets, setOpenTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressValue, setProgressValue] = useState(0);
  const [previousNewTicketsCount, setPreviousNewTicketsCount] = useState(0);

  React.useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgressValue((prevValue) => {
          if (prevValue >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prevValue + 5;
        });
      }, 10);

      return () => clearInterval(interval);
    }
  }, [loading]);

  const fetchMovideskTickets = async () => {
    setLoading(false);
    setProgressValue(0);
    try {
      const fields =
        "id,subject,status,slaResponseDate,customFieldValues,owner,urgency";
      const expandFields = "customFieldValues($expand=items),owner";
      const urlNovos = `${MOVIDESK_API_URL}/public/v1/tickets?token=${MOVIDESK_TOKEN}&$select=${fields}&$filter=status eq 'Novo' and ownerTeam eq 'Suporte'&$expand=${expandFields}`;
      const urlAbertos = `${MOVIDESK_API_URL}/public/v1/tickets?token=${MOVIDESK_TOKEN}&$select=${fields}&$filter=status eq 'Aberto' and ownerTeam eq 'Suporte'&$expand=${expandFields}`;

      const responseNovos = await fetch(urlNovos);
      if (responseNovos.ok) {
        const dataNovos = await responseNovos.json();
        setNewTickets(
          dataNovos.sort(
            (
              a: { slaResponseDate: string | number | Date },
              b: { slaResponseDate: string | number | Date }
            ) =>
              new Date(a.slaResponseDate).getTime() -
              new Date(b.slaResponseDate).getTime()
          )
        );

        // Tocar som se houver tickets novos
        const newTicketSound = document.getElementById(
          "newTicketSound"
        ) as HTMLAudioElement;
        if (dataNovos.length > previousNewTicketsCount && newTicketSound) {
          newTicketSound.play();
          setPreviousNewTicketsCount(dataNovos.length);
        }
      } else {
        const errorText = await responseNovos.text();
        console.error("Erro nos tickets Novos:", errorText);
        throw new Error(`HTTP error! Status: ${responseNovos.status}`);
      }

      const responseAbertos = await fetch(urlAbertos);
      if (!responseAbertos.ok) {
        const errorText = await responseAbertos.text();
        console.error("Erro nos tickets Abertos:", errorText);
        throw new Error(`HTTP error! Status: ${responseAbertos.status}`);
      }
      const dataAbertos = await responseAbertos.json();
      setOpenTickets(
        dataAbertos.sort(
          (
            a: { slaResponseDate: string | number | Date },
            b: { slaResponseDate: string | number | Date }
          ) =>
            new Date(a.slaResponseDate).getTime() -
            new Date(b.slaResponseDate).getTime()
        )
      );

    } catch (error) {
      console.error("Erro ao buscar tickets da Movidesk:", error);
    } finally {
      setProgressValue(100);
    }
  };

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
            <UsersIcon /> <span>Monitor</span>
          </li>
        </ul>
        <h3 className="text-justify font-semibold">Monitor de tickets</h3>
        <p className="text-small text-default-400">
          Monitoramento dos tickets novos e abertos da plataforma movidesk.
          Atualização ocorre a cada 2 minutos.
        </p>
      </div>
      <Spacer y={2} />
    </>
  );

  React.useEffect(() => {
    fetchMovideskTickets();
    const intervalId = setInterval(fetchMovideskTickets, 20 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <DefaultLayout>
      <audio id="newTicketSound" preload="auto" src="/minions.mp3"></audio>
      <div className="flex flex-col gap-4 px-4 md:px-8 lg:px-4 max-w-none mx-auto">
        {topContent}
        <Spacer y={4} />
        {loading ? (
          <Progress
            size="md"
            radius="sm"
            color="danger"
            classNames={{
              base: "max-w-screen-lg",
              track: "drop-shadow-md border border-default",
              indicator: "bg-gradient-to-r from-pink-500 to-yellow-500",
              label: "tracking-wider font-medium text-default-600",
              value: "text-foreground/60",
            }}
            label="Buscando informações atualizadas na Movidesk..."
            value={progressValue}
            showValueLabel={true}
          />
        ) : (
          <Accordion>
            <AccordionItem
              key="1"
              subtitle={<div className="text-center">Clique para expandir</div>}
              title={
                <div className="text-center">
                  <Code color="warning" className="text-xl">
                    Tickets novos ({newTickets.length})
                  </Code>
                </div>
              }
            >
              <div className="flex flex-wrap justify-center items-center gap-5 w-full">
                {newTickets.map((ticket, index) => (
                  <TicketsCard key={index} ticket={ticket} color="warning" />
                ))}
              </div>
            </AccordionItem>
            <AccordionItem
              key="2"
              subtitle={<div className="text-center">Clique para expandir</div>}
              title={
                <div className="text-center">
                  <Code color="danger" className="text-xl">
                    Tickets abertos ({openTickets.length})
                  </Code>
                </div>
              }
            >
              <div className="flex flex-wrap justify-center items-center gap-5 w-full">
                {openTickets.map((ticket, index) => (
                  <TicketsCard key={index} ticket={ticket} color="danger" />
                ))}
              </div>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </DefaultLayout>
  );
}

const formatAnalystName = (fullName: string) => {
  const nameParts = fullName.split(" ");
  if (nameParts.length <= 2) {
    return fullName; // Retorna o nome completo se tiver 1 ou 2 partes
  }
  return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
};

const formatDate = (dateString: string | number | Date) => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const getUrgencyColor = (urgency: any) => {
  switch (urgency) {
    case "1. Blocante":
    case "2. Urgente":
      return "text-gray-600";
    case "3. Alta":
      return "text-red-500";
    case "4. Média":
      return "text-yellow-500";
    case "5. Baixa":
      return "text-green-500";
    default:
      return "text-black"; // Você pode definir uma cor padrão aqui
  }
};

const TicketsCard: React.FC<{
  ticket: any;
  color: "warning" | "danger";
}> = ({ ticket, color }) => {
  let squadValue = "Desconhecido";
  const squadField = ticket.customFieldValues?.find(
    (field: any) => field.customFieldId === 67280
  );

  if (squadField) {
    if (
      squadField.items &&
      squadField.items.length > 0 &&
      squadField.items[0].customFieldItem
    ) {
      squadValue = squadField.items[0].customFieldItem;
    } else if (squadField.value) {
      squadValue = squadField.value;
    }
  }

  return (
    <Tooltip
      content={`Mais informações sobre ${ticket.subject}`}
      placement="top"
      color="secondary"
    >
      <Card
        className={`border-none bg-${getUrgencyColor(
          ticket.urgency
        )} shadow-md w-full md:w-auto`}
      >
        <CardBody className="text-center">
          <div className="text-3xl mb-2.5">
            <a
              href={`https://enterprise.movidesk.com/Ticket/Edit/${ticket.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white"
            >
              {ticket.id}
            </a>
          </div>

          <div className="text-lg text-gray-500">
            {formatAnalystName(ticket.owner?.businessName || "")}
          </div>

          <div className="text-sm text-default-400 mt-2">{`Squad: ${squadValue}`}</div>
          <div className={`mt-2 ${getUrgencyColor(ticket.urgency)}`}>
            {ticket.urgency}
          </div>
          <div className={`text-sm text-${color}`}>
            {formatDate(ticket.slaResponseDate)}
          </div>
        </CardBody>
      </Card>
    </Tooltip>
  );
};
