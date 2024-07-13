"use client"

import {GetFlightsParams} from "@/lib/api";
import React, {Suspense, useState} from "react";
import Header from "@/components/header";
import CardList from "@/components/card_list";
import {Airport, Icon} from "@/lib/types";

export default function Dashboard({airports, icons}: { airports: Airport[], icons: Icon[] }) {
    const [requestData, setRequestData] = useState<GetFlightsParams | undefined>(undefined)

    return (
        <div className="flex flex-col min-h-screen">
            <Header
                airports={airports}
                requestData={requestData}
                setRequestData={setRequestData}
            />

            {requestData ?
                <Suspense fallback={<div>Loading...</div>}>
                    <CardList
                        requestData={requestData}
                        icons={icons}
                    />
                </Suspense> : null}

        </div>
    )
}