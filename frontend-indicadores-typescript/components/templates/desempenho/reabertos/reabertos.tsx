import React from 'react';
import { Card, CardBody, Tooltip } from "@nextui-org/react";

export interface ReabertosData {
  analystReopenedCount: number;
  teamReopenedCount: number;
}

export function ReabertosMetrics({ data }: { data: ReabertosData | undefined }) {
    if (!data) {
        return <p>Nenhum dado disponível</p>;
    }

    const indicators = [
        { title: "REABERTOS DO ANALISTA", value: data.analystReopenedCount },
        { title: "REABERTOS DO TIME", value: data.teamReopenedCount }
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
