import React from 'react';
import { Card, CardBody, Tooltip } from "@nextui-org/react";

export type TramitesData = {
    [key: string]: {
        "Média real": number;
        "Desvio Padrão": number;
    };
}

export function TramitesMetrics({ data }: { data: TramitesData | undefined }) {
    if (!data) {
        return <p>Nenhum dado disponível</p>;
    }

    const indicators = [];

    for (const tipo in data) {
        indicators.push(
            { title: `${tipo.toUpperCase()} - MÉDIA`, value: data[tipo]["Média real"].toFixed(2) },
            { title: `${tipo.toUpperCase()} - DESVIO`, value: data[tipo]["Desvio Padrão"].toFixed(2) }
        );
    }

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
                                {indicator.value}
                            </div>
                            <div className="text-lg text-gray-500">
                                {indicator.title}
                            </div>
                        </CardBody>
                    </Card>
                </Tooltip>
            ))}
        </div>
    );
    
}
