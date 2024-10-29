"use client"

import React from "react";

interface CardListProps {
    cards: React.ReactNode[];
}

export default function CardList({cards}: CardListProps) {
    return (
        <main className="flex-1 bg-muted/20 py-8">
            <div className="max-w-full pl-5 pr-5 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {cards}
            </div>
        </main>
    )
}