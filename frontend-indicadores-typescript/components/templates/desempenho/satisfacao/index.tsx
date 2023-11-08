import React from 'react';
import { Card, CardBody, Tooltip } from "@nextui-org/react";

export type CustomerSatisfactionData = {
    nps: {
      satisfaction: number;
      responsesCount: number;
    };
    solutionQuality: {
      satisfaction: number;
      responsesCount: number;
    };
    solutionTime: {
      satisfaction: number;
      responsesCount: number;
    };
};

export function CustomerSatisfactionMetrics({ data }: { data: CustomerSatisfactionData | undefined }) {
    if (!data) {
        return <p>Nenhum dado disponível</p>;
    }

    const indicators = [
        { title: "NPS", value: `${data.nps.satisfaction.toFixed(2)}%`, responses: data.nps.responsesCount },
        { title: "QUALIDADE SOLUÇÃO", value: `${data.solutionQuality.satisfaction.toFixed(2)}%`, responses: data.solutionQuality.responsesCount },
        { title: "TEMPO DE SOLUÇÃO", value: `${data.solutionTime.satisfaction.toFixed(2)}%`, responses: data.solutionTime.responsesCount }
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
                                {indicator.value}
                            </div>
                            <div className="text-lg text-gray-500 mb-2.5">
                                {indicator.title}
                            </div>
                            <div className="text-md text-gray-500">
                                {indicator.responses} Respostas
                            </div>
                        </CardBody>
                    </Card>
                </Tooltip>
            ))}
        </div>
    );
    
}
