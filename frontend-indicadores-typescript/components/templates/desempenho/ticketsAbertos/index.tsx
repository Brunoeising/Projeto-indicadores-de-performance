import React from 'react';
import { Card, CardBody, Tooltip } from "@nextui-org/react";

export interface Superior24hData {
    countTicketsOpenBeyond24WorkingHours: number;
    ticketIdsOpenBeyond24WorkingHours: number[];
}

export function Superior24hMetrics({ data }: { data: Superior24hData | undefined }) {
    if (!data) {
        return <p>Nenhum dado disponível</p>;
    }

    const baseTicketUrl = "https://enterprise.movidesk.com/Ticket/Edit/";
    const ticketLinks = data.ticketIdsOpenBeyond24WorkingHours.map(id => (
        <a href={`${baseTicketUrl}${id}`} target="_blank" rel="noopener noreferrer" key={id}>
            {id}
        </a>
    ));

    const indicators = [
        { 
            title: "TOTAL DE TICKETS SUPERIOR A 24h", 
            value: data.countTicketsOpenBeyond24WorkingHours 
        },
        { 
            title: "TICKETS SUPERIOR A 24h", 
            value: ticketLinks 
        }
    ];

    return (
        <div className="flex flex-wrap justify-center items-center gap-5 w-full">
            {indicators.map((indicator, index) => (
                <Tooltip 
                    key={index}
                    content={`Mais informações sobre ${indicator.title}`} 
                    placement="top" 
                    color="secondary"
                >
                    <Card
                        className="border-none bg-transparent shadow-md w-full md:w-auto"
                    >
                        <CardBody className="text-center">
                            <div className="text-3xl mb-2.5">
                                {typeof indicator.value === "number" ? indicator.value : ""}
                            </div>
                            <div className="text-lg text-gray-500">
                                {indicator.title}
                            </div>
                            {typeof indicator.value !== "number" && (
                                <div>
                                    {ticketLinks.map((link) => (
                                        <span key={link.key}>
                                            {link}
                                            {link !== ticketLinks[ticketLinks.length - 1] && ", "}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </Tooltip>
            ))}
        </div>
    );
    
}
